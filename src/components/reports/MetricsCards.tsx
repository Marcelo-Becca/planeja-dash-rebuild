import { CheckCircle, Target, Folder, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricsData } from "@/hooks/useReportsData";

interface MetricsCardsProps {
  data: MetricsData;
  loading: boolean;
  onCardClick: (category: string) => void;
  filterSummary: string;
}

export default function MetricsCards({ data, loading, onCardClick, filterSummary }: MetricsCardsProps) {
  const cards = [
    {
      id: "completed",
      title: "Tarefas Concluídas",
      value: data.completedTasks,
      icon: CheckCircle,
      variant: "success" as const,
      clickable: true
    },
    {
      id: "goals",
      title: "Metas Alcançadas",
      value: data.achievedGoals === "not-defined" ? "Meta não definida" : `${data.achievedGoals}%`,
      icon: Target,
      variant: data.achievedGoals === "not-defined" ? "muted" : "success" as const,
      clickable: data.achievedGoals !== "not-defined",
      action: data.achievedGoals === "not-defined" ? "Definir metas" : undefined
    },
    {
      id: "projects",
      title: "Projetos Ativos",
      value: data.activeProjects,
      icon: Folder,
      variant: "info" as const,
      clickable: true
    },
    {
      id: "overdue",
      title: "Tarefas Atrasadas",
      value: data.overdueTasks,
      icon: AlertTriangle,
      variant: data.overdueTasks > 0 ? "warning" : "success" as const,
      clickable: true
    }
  ];

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case "success":
        return "border-chart-1/20 bg-chart-1/5";
      case "warning":
        return "border-chart-4/20 bg-chart-4/5";
      case "info":
        return "border-chart-2/20 bg-chart-2/5";
      case "muted":
        return "border-muted/20 bg-muted/5";
      default:
        return "border-border bg-card";
    }
  };

  const getIconColor = (variant: string) => {
    switch (variant) {
      case "success":
        return "text-chart-1";
      case "warning":
        return "text-chart-4";
      case "info":
        return "text-chart-2";
      case "muted":
        return "text-muted-foreground";
      default:
        return "text-foreground";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-card-foreground">Métricas-Chave</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-semibold text-card-foreground">Métricas-Chave</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const isClickable = card.clickable && typeof card.value === 'number';
          
          return (
            <Card 
              key={card.id}
              className={`${getVariantStyles(card.variant)} transition-all duration-200 ${
                isClickable 
                  ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]' 
                  : ''
              }`}
              onClick={isClickable ? () => onCardClick(card.id) : undefined}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {card.value}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg bg-background/50`}>
                    <Icon className={`w-6 h-6 ${getIconColor(card.variant)}`} />
                  </div>
                </div>
                
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {filterSummary}
                  </p>
                  {card.action && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-xs h-auto p-1 hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Navigate to goals setup
                      }}
                    >
                      {card.action}
                    </Button>
                  )}
                </div>
                
                {isClickable && (
                  <div className="mt-1 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Ver detalhes
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}