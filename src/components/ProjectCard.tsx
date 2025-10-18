import { Link } from "react-router-dom";
import { Calendar, Users, CheckCircle2, Clock } from "lucide-react";
import { Project } from "@/hooks/useProjects";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
}

const statusConfig = {
  planning: {
    label: "Planejamento",
    color: "text-chart-default",
    bgColor: "bg-chart-default/10",
    borderColor: "border-chart-default/20"
  },
  active: {
    label: "Ativo",
    color: "text-chart-progress",
    bgColor: "bg-chart-progress/10",
    borderColor: "border-chart-progress/20"
  },
  completed: {
    label: "Concluído", 
    color: "text-chart-completed",
    bgColor: "bg-chart-completed/10",
    borderColor: "border-chart-completed/20"
  },
  "on-hold": {
    label: "Pausado",
    color: "text-chart-pending", 
    bgColor: "bg-chart-pending/10",
    borderColor: "border-chart-pending/20"
  }
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const status = statusConfig[project.status] || statusConfig.active;
  const deadline = new Date(project.end_date);
  const isOverdue = deadline < new Date() && project.status !== 'completed';
  
  // Calculate progress from tasks data
  const tasksCount = project.tasksCount || 0;
  const completedTasks = project.completedTasksCount || 0;
  const progress = tasksCount > 0 ? Math.round((completedTasks / tasksCount) * 100) : 0;
  
  // Get team members count
  const teamMembersCount = project.teams?.length || 0;

  return (
    <Link 
      to={`/projects/${project.id}`}
      className="group block"
    >
      <article className={cn(
        "bg-card border border-border rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in p-6",
        "group-hover:scale-[1.02] group-hover:border-primary/20"
      )}>
        {/* Header */}
        <header className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {project.description || 'Sem descrição'}
            </p>
          </div>
          
          <div className={cn(
            "flex items-center px-3 py-1 rounded-full text-xs font-medium border",
            status.color,
            status.bgColor,
            status.borderColor
          )}>
            {project.status === 'completed' ? (
              <CheckCircle2 className="w-3 h-3 mr-1" />
            ) : (
              <Clock className="w-3 h-3 mr-1" />
            )}
            {status.label}
          </div>
        </header>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progresso</span>
            <span className="text-sm font-medium text-card-foreground">
              {completedTasks}/{tasksCount} tarefas
            </span>
          </div>
          <div className="w-full bg-secondary/50 rounded-full h-2">
            <div 
              className="bg-gradient-brand h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span className={cn(
                isOverdue && "text-chart-overdue font-medium"
              )}>
                {deadline.toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{teamMembersCount} {teamMembersCount === 1 ? 'equipe' : 'equipes'}</span>
            </div>
          </div>
          
          {/* Team Avatars */}
          {project.leader && (
            <div className="flex -space-x-2">
              <div
                className="w-6 h-6 bg-gradient-brand rounded-full flex items-center justify-center text-xs font-medium text-sidebar-primary-foreground border-2 border-card"
                title={project.leader.name}
              >
                {project.leader.name.charAt(0).toUpperCase()}
              </div>
              {teamMembersCount > 0 && (
                <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground border-2 border-card">
                  +{teamMembersCount}
                </div>
              )}
            </div>
          )}
        </footer>
      </article>
    </Link>
  );
}