import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Users, CheckCircle2, Clock, Plus, Edit3 } from "lucide-react";
import { mockProjects, mockTasks } from "@/data/mockData";
import { cn } from "@/lib/utils";

const statusConfig = {
  active: {
    label: "Ativo",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  completed: {
    label: "Concluído", 
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20"
  },
  "on-hold": {
    label: "Pausado",
    color: "text-yellow-400", 
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20"
  }
};

export default function ProjectDetail() {
  const { id } = useParams();
  const project = mockProjects.find(p => p.id === id);
  const projectTasks = mockTasks.filter(task => task.projectId === id);

  if (!project) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Projeto não encontrado
            </h2>
            <p className="text-muted-foreground mb-4">
              O projeto que você está procurando não existe.
            </p>
            <Link to="/projects">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar aos Projetos
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const status = statusConfig[project.status];
  const isOverdue = project.deadline < new Date() && project.status !== 'completed';

  return (
    <Layout>
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 sticky top-0 z-10">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/projects">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Projetos
                </Button>
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-foreground">
                  {project.name}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Criado por {project.createdBy.name}
                </p>
              </div>
            </div>
            
            <Button className="gap-2">
              <Edit3 className="w-4 h-4" />
              Editar Projeto
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Project Overview */}
          <div className="bg-card border border-border rounded-lg shadow-card p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "flex items-center px-3 py-1 rounded-full text-sm font-medium border",
                    status.color,
                    status.bgColor,
                    status.borderColor
                  )}>
                    {project.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                    ) : (
                      <Clock className="w-4 h-4 mr-1" />
                    )}
                    {status.label}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className={cn(
                      "font-medium",
                      isOverdue && "text-red-400"
                    )}>
                      Prazo: {project.deadline.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                
                <p className="text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-foreground">Progresso do Projeto</h3>
                <span className="text-sm font-medium text-foreground">
                  {project.completedTasks}/{project.tasksCount} tarefas ({project.progress}%)
                </span>
              </div>
              <div className="w-full bg-secondary/50 rounded-full h-3">
                <div 
                  className="bg-gradient-brand h-3 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Team */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Equipe</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-1" />
                  {project.team.length} membros
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.team.map((member, index) => (
                  <div key={member.id} className="flex items-center p-3 bg-muted/30 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-brand rounded-full flex items-center justify-center mr-3">
                      <span className="text-sidebar-primary-foreground font-semibold text-sm">
                        {member.avatar}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {member.name}
                        {index === 0 && (
                          <span className="text-xs text-primary ml-2">(Líder)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Tasks */}
          <div className="bg-card border border-border rounded-lg shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Tarefas do Projeto</h3>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Tarefa
              </Button>
            </div>
            
            <div className="space-y-3">
              {projectTasks.map((task) => {
                const taskStatus = {
                  pending: { color: "text-gray-400", bg: "bg-gray-500/10" },
                  "in-progress": { color: "text-blue-400", bg: "bg-blue-500/10" },
                  completed: { color: "text-green-400", bg: "bg-green-500/10" },
                  overdue: { color: "text-red-400", bg: "bg-red-500/10" }
                }[task.status];

                return (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}
                    className="block p-4 border border-border rounded-lg hover:border-primary/20 hover:bg-muted/30 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {task.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          taskStatus.color,
                          taskStatus.bg
                        )}>
                          {task.status === 'pending' && 'Pendente'}
                          {task.status === 'in-progress' && 'Em Andamento'}
                          {task.status === 'completed' && 'Concluída'}
                          {task.status === 'overdue' && 'Atrasada'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {task.deadline.toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {projectTasks.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Nenhuma tarefa criada ainda
                </p>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Tarefa
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}