import { TrendingUp, TrendingDown, CheckCircle2, Clock, Target, AlertTriangle, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { KPIMetrics } from "@/types/reports";

interface KPIDashboardProps {
  metrics: KPIMetrics;
  loading?: boolean;
  onCardClick?: (category: string) => void;
}

export default function KPIDashboard({ metrics, loading = false, onCardClick }: KPIDashboardProps) {
  const kpiCards = [
    {
      id: "completedTasks",
      title: "Tarefas Concluídas",
      value: metrics.completedTasks,
      icon: CheckCircle2,
      variant: "success" as const,
      trend: metrics.completedTasksTrend,
      clickable: true
    },
    {
      id: "pendingTasks", 
      title: "Tarefas Pendentes",
      value: metrics.pendingTasks,
      icon: Clock,
      variant: metrics.pendingTasks > 10 ? "warning" : "info" as const,
      trend: metrics.pendingTasksTrend,
      clickable: true
    },
    {
      id: "goalsAchieved",
      title: "Metas Batidas",
      value: metrics.goalsAchieved === "not-defined" ? "Não definido" : `${metrics.goalsAchieved}%`,
      icon: Target,
      variant: metrics.goalsAchieved === "not-defined" ? "muted" : "success" as const,
      trend: 0,
      clickable: metrics.goalsAchieved !== "not-defined",
      description: metrics.goalsAchieved === "not-defined" ? "Configure metas para seus projetos" : undefined
    },
    {
      id: "avgResolutionTime",
      title: "Tempo Médio de Resolução",
      value: `${metrics.averageResolutionTime} dias`,
      icon: Calendar,
      variant: metrics.averageResolutionTime > 7 ? "warning" : "success" as const,
      trend: metrics.resolutionTimeTrend,
      clickable: false
    },
    {
      id: "weeklyBurndown",
      title: "Burndown Semanal",
      value: `${metrics.weeklyBurndown}%`,
      icon: TrendingUp,
      variant: metrics.weeklyBurndown >= 70 ? "success" : metrics.weeklyBurndown >= 40 ? "info" : "warning" as const,
      trend: 0,
      clickable: false
    },
    {
      id: "avgLoadPerMember",
      title: "Carga Média por Membro",
      value: `${metrics.avgLoadPerMember} tarefas`,
      icon: Users,
      variant: metrics.avgLoadPerMember > 10 ? "warning" : "info" as const,
      trend: 0,
      clickable: false
    }
  ];

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case "success":
        return "border-chart-1/20 bg-chart-1/5 hover:bg-chart-1/10";
      case "warning":
        return "border-chart-4/20 bg-chart-4/5 hover:bg-chart-4/10";
      case "info":
        return "border-chart-2/20 bg-chart-2/5 hover:bg-chart-2/10";
      case "muted":
        return "border-muted/20 bg-muted/5 hover:bg-muted/10";
      default:
        return "border-border bg-card hover:bg-muted/5";
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

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-3 h-3 text-chart-1" />;
    if (trend < 0) return <TrendingDown className="w-3 h-3 text-chart-4" />;
    return null;
  };

  const getTrendText = (trend: number) => {
    if (trend === 0) return null;
    const direction = trend > 0 ? "+" : "";
    return `${direction}${trend}% vs período anterior`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-24" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-card-foreground">KPIs e Métricas</h2>
        <Badge variant="outline" className="text-xs">
          Atualizado: agora
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          const isClickable = card.clickable && onCardClick;
          
          return (
            <Card 
              key={card.id}
              className={`${getVariantStyles(card.variant)} transition-all duration-300 ${
                isClickable 
                  ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]' 
                  : ''
              }`}
              onClick={isClickable ? () => onCardClick(card.id) : undefined}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-card-foreground">
                      {card.value}
                    </div>
                    {card.trend !== 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {getTrendIcon(card.trend)}
                        {getTrendText(card.trend)}
                      </div>
                    )}
                    {card.description && (
                      <div className="text-xs text-muted-foreground">
                        {card.description}
                      </div>
                    )}
                  </div>
                  <div className={`p-2 rounded-lg bg-background/50`}>
                    <Icon className={`w-6 h-6 ${getIconColor(card.variant)}`} />
                  </div>
                </div>
                
                {isClickable && (
                  <div className="mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Ver detalhes
                    </div>
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