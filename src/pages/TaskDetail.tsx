import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, AlertTriangle, CheckCircle2, Clock, Edit3, MessageSquare } from "lucide-react";
import { mockTasks, mockProjects } from "@/data/mockData";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: {
    label: "Pendente",
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/20",
    icon: Clock
  },
  "in-progress": {
    label: "Em Andamento",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10", 
    borderColor: "border-blue-500/20",
    icon: Clock
  },
  completed: {
    label: "Concluída",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    icon: CheckCircle2
  },
  overdue: {
    label: "Atrasada",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    icon: AlertTriangle
  }
};

const priorityConfig = {
  low: {
    label: "Baixa",
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    dotColor: "bg-green-500"
  },
  medium: {
    label: "Média", 
    color: "text-yellow-600",
    bgColor: "bg-yellow-500/10",
    dotColor: "bg-yellow-500"
  },
  high: {
    label: "Alta",
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    dotColor: "bg-red-500"
  }
};

export default function TaskDetail() {
  const { id } = useParams();
  const task = mockTasks.find(t => t.id === id);
  const project = task ? mockProjects.find(p => p.id === task.projectId) : null;

  if (!task) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Tarefa não encontrada
            </h2>
            <p className="text-muted-foreground mb-4">
              A tarefa que você está procurando não existe.
            </p>
            <Link to="/tasks">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar às Tarefas
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const StatusIcon = status.icon;
  const isOverdue = task.deadline < new Date() && task.status !== 'completed';

  return (
    <Layout>
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 sticky top-0 z-10">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/tasks">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Tarefas
                </Button>
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-foreground">
                  {task.title}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Criada por {task.createdBy.name} em {task.createdAt.toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            <Button className="gap-2">
              <Edit3 className="w-4 h-4" />
              Editar Tarefa
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Task Overview */}
          <div className="bg-card border border-border rounded-lg shadow-card p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Main Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className={cn(
                    "flex items-center px-3 py-2 rounded-full text-sm font-medium border",
                    status.color,
                    status.bgColor,
                    status.borderColor
                  )}>
                    <StatusIcon className="w-4 h-4 mr-2" />
                    {status.label}
                  </div>
                  
                  <div className={cn(
                    "flex items-center px-3 py-2 rounded-full text-sm font-medium",
                    priority.color,
                    priority.bgColor
                  )}>
                    <div className={cn("w-2 h-2 rounded-full mr-2", priority.dotColor)} />
                    Prioridade {priority.label}
                  </div>

                  {project && (
                    <Link 
                      to={`/projects/${project.id}`}
                      className="text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline"
                    >
                      {project.name}
                    </Link>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Descrição</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-2">Prazo:</span>
                      <span className={cn(
                        "font-medium",
                        isOverdue ? "text-red-400" : "text-foreground"
                      )}>
                        {task.deadline.toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-2">Criada em:</span>
                      <span className="text-foreground font-medium">
                        {task.createdAt.toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="lg:w-80 space-y-6">
                {/* Assigned Users */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Responsáveis
                  </h3>
                  <div className="space-y-3">
                    {task.assignedTo.map((user) => (
                      <div key={user.id} className="flex items-center p-3 bg-muted/30 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-brand rounded-full flex items-center justify-center mr-3">
                          <span className="text-sidebar-primary-foreground font-semibold text-sm">
                            {user.avatar}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Creator Info */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">Criador</h3>
                  <div className="flex items-center p-3 bg-muted/30 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-brand rounded-full flex items-center justify-center mr-3">
                      <span className="text-sidebar-primary-foreground font-semibold text-sm">
                        {task.createdBy.avatar}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {task.createdBy.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {task.createdBy.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-card border border-border rounded-lg shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Comentários e Observações
              </h3>
              <Button size="sm" variant="outline">
                Adicionar Comentário
              </Button>
            </div>

            <div className="space-y-4">
              {task.comments.length > 0 ? (
                task.comments.map((comment, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-gradient-brand rounded-full flex items-center justify-center mr-2">
                        <span className="text-sidebar-primary-foreground font-semibold text-xs">
                          {task.createdBy.avatar}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {task.createdBy.name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        há 2 dias
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-8">
                      {comment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">
                    Nenhum comentário ainda
                  </p>
                  <Button size="sm">
                    Adicionar Primeiro Comentário
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}