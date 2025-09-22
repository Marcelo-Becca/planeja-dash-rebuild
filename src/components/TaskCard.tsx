import { Link } from "react-router-dom";
import { Calendar, AlertTriangle, CheckCircle2, Clock, User } from "lucide-react";
import { Task } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
}

const statusConfig = {
  pending: {
    label: "Pendente",
    color: "text-chart-pending",
    bgColor: "bg-chart-pending/10",
    borderColor: "border-chart-pending/20",
    icon: Clock
  },
  "in-progress": {
    label: "Em Andamento",
    color: "text-chart-progress",
    bgColor: "bg-chart-progress/10", 
    borderColor: "border-chart-progress/20",
    icon: Clock
  },
  "under-review": {
    label: "Em Revisão",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    icon: AlertTriangle
  },
  completed: {
    label: "Concluída",
    color: "text-chart-completed",
    bgColor: "bg-chart-completed/10",
    borderColor: "border-chart-completed/20",
    icon: CheckCircle2
  },
  overdue: {
    label: "Atrasada",
    color: "text-chart-overdue",
    bgColor: "bg-chart-overdue/10",
    borderColor: "border-chart-overdue/20",
    icon: AlertTriangle
  }
};

const priorityConfig = {
  low: {
    label: "Baixa",
    color: "text-chart-completed"
  },
  medium: {
    label: "Média", 
    color: "text-chart-pending"
  },
  high: {
    label: "Alta",
    color: "text-chart-overdue"
  }
};

export default function TaskCard({ task }: TaskCardProps) {
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const StatusIcon = status.icon;
  const isOverdue = task.deadline < new Date() && task.status !== 'completed';

  return (
    <Link 
      to={`/tasks/${task.id}`}
      className="group block"
    >
      <article className={cn(
        "bg-card border border-border rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in p-5",
        "group-hover:scale-[1.01] group-hover:border-primary/20"
      )}>
        {/* Header */}
        <header className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
              {task.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          </div>
          
          <div className={cn(
            "flex items-center px-2 py-1 rounded-full text-xs font-medium border ml-3",
            status.color,
            status.bgColor,  
            status.borderColor
          )}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </div>
        </header>

        {/* Priority & Deadline */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <div className={cn("w-2 h-2 rounded-full mr-2", {
                "bg-chart-completed": task.priority === 'low',
                "bg-chart-pending": task.priority === 'medium', 
                "bg-chart-overdue": task.priority === 'high'
              })} />
              <span className="text-xs text-muted-foreground">
                Prioridade {priority.label}
              </span>
            </div>
          </div>

          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 mr-1" />
            <span className={cn(
              isOverdue && "text-chart-overdue font-medium"
            )}>
              {task.deadline.toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between">
          <div className="flex items-center text-xs text-muted-foreground">
            <User className="w-3 h-3 mr-1" />
            <span>
              {task.assignedTo.length === 1 
                ? task.assignedTo[0].name
                : `${task.assignedTo.length} responsáveis`
              }
            </span>
          </div>

          {/* Assigned Users Avatars */}
          <div className="flex -space-x-1">
            {task.assignedTo.slice(0, 3).map((user) => (
              <div
                key={user.id}
                className="w-5 h-5 bg-gradient-brand rounded-full flex items-center justify-center text-xs font-medium text-sidebar-primary-foreground border border-card"
                title={user.name}
              >
                {user.avatar}
              </div>
            ))}
            {task.assignedTo.length > 3 && (
              <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground border border-card">
                +{task.assignedTo.length - 3}
              </div>
            )}
          </div>
        </footer>
      </article>
    </Link>
  );
}