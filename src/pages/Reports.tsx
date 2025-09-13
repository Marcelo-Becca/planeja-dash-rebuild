import { useState } from "react";
import { Calendar, Download, FileText, Filter } from "lucide-react";
import Layout from "@/components/Layout";
import ReportCard from "@/components/ReportCard";
import ProjectPerformanceChart from "@/components/ProjectPerformanceChart";
import TaskDistributionChart from "@/components/TaskDistributionChart";
import TeamProductivityChart from "@/components/TeamProductivityChart";
import ActivityTimelineChart from "@/components/ActivityTimelineChart";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Mock report data
const mockReportData = {
  productivity: {
    completedTasks: 87,
    achievedGoals: 92,
    activeProjects: 12,
    overdueTasks: 5,
  },
  projectPerformance: [
    { name: "Sistema de Gestão", progress: 65, completedTasks: 8, pendingTasks: 4 },
    { name: "App Mobile", progress: 40, completedTasks: 3, pendingTasks: 5 },
    { name: "Website Institucional", progress: 100, completedTasks: 6, pendingTasks: 0 },
    { name: "API Backend", progress: 75, completedTasks: 9, pendingTasks: 3 },
  ],
  taskDistribution: [
    { name: "Concluídas", value: 87, color: "hsl(var(--chart-1))" },
    { name: "Em andamento", value: 23, color: "hsl(var(--chart-2))" },
    { name: "Pendentes", value: 15, color: "hsl(var(--chart-3))" },
    { name: "Atrasadas", value: 5, color: "hsl(var(--chart-4))" },
  ],
  teamProductivity: [
    { name: "Marina Santos", completed: 28, inProgress: 4, overdue: 1 },
    { name: "Carlos Silva", completed: 25, inProgress: 6, overdue: 2 },
    { name: "Ana Costa", completed: 22, inProgress: 3, overdue: 1 },
    { name: "Pedro Lima", completed: 12, inProgress: 10, overdue: 1 },
  ],
  activityTimeline: [
    { date: "2024-01-01", tasks: 5 },
    { date: "2024-01-02", tasks: 8 },
    { date: "2024-01-03", tasks: 12 },
    { date: "2024-01-04", tasks: 7 },
    { date: "2024-01-05", tasks: 15 },
    { date: "2024-01-06", tasks: 10 },
    { date: "2024-01-07", tasks: 18 },
  ],
};

export default function Reports() {
  const [period, setPeriod] = useState("month");
  const [scope, setScope] = useState("all");
  const { toast } = useToast();

  const handleExport = (format: string) => {
    toast({
      title: "Exportação iniciada",
      description: `Relatório será exportado em formato ${format.toUpperCase()}`,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            Acompanhe desempenho, produtividade e progresso geral
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-card-foreground">Período:</span>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Mês atual</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-card-foreground">Escopo:</span>
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os projetos</SelectItem>
                <SelectItem value="active">Projetos ativos</SelectItem>
                <SelectItem value="team">Minha equipe</SelectItem>
                <SelectItem value="personal">Apenas eu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Productivity Summary */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-card-foreground">Resumo de Produtividade</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ReportCard
              title="Tarefas Concluídas"
              value={mockReportData.productivity.completedTasks}
              variant="success"
              icon="check"
            />
            <ReportCard
              title="Metas Alcançadas"
              value={`${mockReportData.productivity.achievedGoals}%`}
              variant="success"
              icon="target"
            />
            <ReportCard
              title="Projetos Ativos"
              value={mockReportData.productivity.activeProjects}
              variant="info"
              icon="folder"
            />
            <ReportCard
              title="Tarefas Atrasadas"
              value={mockReportData.productivity.overdueTasks}
              variant="warning"
              icon="alert"
            />
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Performance */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-card-foreground">Desempenho por Projetos</h2>
            <ProjectPerformanceChart data={mockReportData.projectPerformance} />
          </div>

          {/* Task Distribution */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-card-foreground">Distribuição de Tarefas</h2>
            <TaskDistributionChart data={mockReportData.taskDistribution} />
          </div>

          {/* Team Productivity */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-card-foreground">Produtividade da Equipe</h2>
            <TeamProductivityChart data={mockReportData.teamProductivity} />
          </div>

          {/* Activity Timeline */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-card-foreground">Linha do Tempo de Atividades</h2>
            <ActivityTimelineChart data={mockReportData.activityTimeline} />
          </div>
        </div>

        {/* Export Section */}
        <div className="p-4 bg-card rounded-lg border border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">Exportar Relatório</h3>
              <p className="text-sm text-muted-foreground">
                Baixe o relatório com os filtros aplicados
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleExport("pdf")}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Exportar PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExport("excel")}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar Excel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}