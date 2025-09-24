import { useState } from "react";
import { FileDown, Calendar, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";
import ComprehensiveReportsFilters from "@/components/reports/ComprehensiveReportsFilters";
import KPIDashboard from "@/components/reports/KPIDashboard";
import InteractiveCharts from "@/components/reports/InteractiveCharts";
import DetailedTables from "@/components/reports/DetailedTables";
import DetailsPanel from "@/components/reports/DetailsPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReportsAnalytics } from "@/hooks/useReportsAnalytics";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const [detailsPanel, setDetailsPanel] = useState<{ type: string; data: any } | null>(null);
  const {
    filters,
    loading,
    hasRealData,
    filteredTasks,
    kpiMetrics,
    timelineData,
    projectPerformanceData,
    taskDistributionData,
    teamProductivityData,
    filterOptions,
    updateFilters,
    resetFilters,
    getTasksByCategory
  } = useReportsAnalytics();
  const { toast } = useToast();

  const handleKPIClick = (category: string) => {
    const tasks = getTasksByCategory(category);
    if (tasks.length > 0) {
      setDetailsPanel({
        type: category,
        data: tasks
      });
    }
  };

  const handleChartClick = (type: string, data: any) => {
    toast({
      title: "Filtro interativo",
      description: `Filtrar por ${type}: ${data}`,
    });
  };

  const handleDrillDown = (type: string, category: string) => {
    const tasks = getTasksByCategory(category);
    if (tasks.length > 0) {
      setDetailsPanel({
        type: category,
        data: tasks
      });
    }
  };

  const handleTaskClick = (taskId: string) => {
    toast({
      title: "Navegação para tarefa",
      description: `Abrindo tarefa ${taskId}`,
    });
  };

  const handleExportTasks = () => {
    const csvContent = [
      ['Título', 'Projeto', 'Responsável', 'Status', 'Prioridade', 'Criada em', 'Prazo'],
      ...filteredTasks.map(task => [
        task.title,
        task.project,
        task.assignee,
        task.status,
        task.priority,
        task.createdAt,
        task.deadline
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio-tarefas.csv';
    a.click();
    
    toast({
      title: "Relatório exportado",
      description: "Download do arquivo CSV iniciado",
    });
  };

  const getPeriodLabel = () => {
    const labels = {
      day: "Último dia",
      week: "Últimos 7 dias", 
      month: "Mês atual",
      quarter: "Trimestre atual",
      year: "Ano atual",
      custom: "Período personalizado"
    };
    return labels[filters.period] || "Período selecionado";
  };

  const getDetailsPanelTitle = () => {
    const titles: Record<string, string> = {
      completed: "Tarefas Concluídas",
      "in-progress": "Tarefas Em Andamento", 
      pending: "Tarefas Pendentes",
      overdue: "Tarefas Atrasadas"
    };
    return titles[detailsPanel?.type] || "Detalhes";
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground">
              Visões e métricas sobre projetos, tarefas e equipes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportTasks} className="gap-2" disabled={!hasRealData || filteredTasks.length === 0}>
              <FileDown className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <ComprehensiveReportsFilters 
          filters={filters}
          onFiltersChange={updateFilters}
          onReset={resetFilters}
          loading={loading}
          filterOptions={filterOptions}
        />

        {/* No Data State */}
        {!loading && !hasRealData && (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  Sem dados disponíveis
                </h3>
                <p className="text-muted-foreground mt-1">
                  Crie projetos, equipes e tarefas para visualizar métricas e relatórios
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Data for Period */}
        {!loading && hasRealData && filteredTasks.length === 0 && (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  Sem dados para este período
                </h3>
                <p className="text-muted-foreground mt-1">
                  Tente expandir o período selecionado ou ajustar os filtros
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {hasRealData && (filteredTasks.length > 0 || loading) && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Charts */}
            <div className="lg:col-span-3 space-y-6">
              <InteractiveCharts
                timelineData={timelineData}
                projectPerformanceData={projectPerformanceData}
                taskDistributionData={taskDistributionData}
                teamProductivityData={teamProductivityData}
                loading={loading}
                onChartClick={handleChartClick}
                onDrillDown={handleDrillDown}
              />
            </div>

            {/* Right Column - KPIs */}
            <div className="lg:col-span-1">
              <KPIDashboard
                metrics={kpiMetrics}
                loading={loading}
                onCardClick={handleKPIClick}
              />
            </div>
          </div>
        )}

        {/* Detailed Tables */}
        {hasRealData && (filteredTasks.length > 0 || loading) && (
          <DetailedTables
            tasks={filteredTasks}
            teamProductivityData={teamProductivityData}
            loading={loading}
            onTaskClick={handleTaskClick}
            onExportTasks={handleExportTasks}
          />
        )}

        {/* Details Panel */}
        <DetailsPanel 
          isOpen={!!detailsPanel}
          title={detailsPanel?.type ? `Tarefas - ${detailsPanel.type}` : "Detalhes"}
          tasks={detailsPanel?.data || []}
          onClose={() => setDetailsPanel(null)}
          onTaskClick={handleTaskClick}
        />
      </div>
    </Layout>
  );
}