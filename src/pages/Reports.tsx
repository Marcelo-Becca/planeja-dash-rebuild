import { useState } from "react";
import { Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import ReportsFilters from "@/components/reports/ReportsFilters";
import MetricsCards from "@/components/reports/MetricsCards";
import ReportsCharts from "@/components/reports/ReportsCharts";
import DetailsPanel from "@/components/reports/DetailsPanel";
import { useReportsData } from "@/hooks/useReportsData";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const [detailsPanel, setDetailsPanel] = useState<{ type: string; data: any } | null>(null);
  const { 
    filters, 
    loading, 
    metricsData, 
    chartData, 
    updateFilters, 
    resetFilters, 
    getDetailedTasks,
    hasData
  } = useReportsData();
  const { toast } = useToast();

  const handleMetricClick = (category: string) => {
    const tasks = getDetailedTasks(category);
    if (tasks.length > 0) {
      setDetailsPanel({
        type: category,
        data: tasks
      });
    }
  };

  const handleChartClick = (type: string, data: any) => {
    // Apply filter based on click
    if (type === 'project') {
      // Filter by project
      toast({
        title: "Filtro aplicado",
        description: `Mostrando dados apenas do projeto: ${data}`,
      });
    } else if (type === 'member') {
      // Filter by team member
      toast({
        title: "Filtro aplicado", 
        description: `Mostrando dados apenas de: ${data}`,
      });
    }
  };

  const handleDetailsClick = (type: string, category: string) => {
    let categoryKey = category;
    
    // Map display names to internal keys
    const categoryMap: Record<string, string> = {
      'concluídas': 'completed',
      'em-andamento': 'in-progress', 
      'pendentes': 'pending',
      'atrasadas': 'overdue'
    };
    
    if (categoryMap[category]) {
      categoryKey = categoryMap[category];
    }
    
    const tasks = getDetailedTasks(categoryKey);
    if (tasks.length > 0) {
      setDetailsPanel({
        type: categoryKey,
        data: tasks
      });
    }
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
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            Análise dinâmica de desempenho, produtividade e progresso
          </p>
        </div>

        {/* Filters */}
        <ReportsFilters 
          filters={filters}
          onFiltersChange={updateFilters}
          onReset={resetFilters}
          loading={loading}
        />

        {/* No Data State */}
        {!loading && !hasData && (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  Sem dados no período selecionado
                </h3>
                <p className="text-muted-foreground mt-1">
                  Tente expandir o período ou verificar se há tarefas no sistema
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {(hasData || loading) && (
          <>
            {/* Metrics Cards */}
            <MetricsCards 
              data={metricsData}
              loading={loading}
              onCardClick={handleMetricClick}
              filterSummary={`${getPeriodLabel()} • ${filters.projects.length > 0 ? `${filters.projects.length} projeto(s)` : 'Todos os projetos'}`}
            />

            {/* Charts */}
            <ReportsCharts 
              data={chartData}
              loading={loading}
              onChartClick={handleChartClick}
              onDetailsClick={handleDetailsClick}
            />
          </>
        )}

        {/* Details Panel */}
        <DetailsPanel 
          isOpen={!!detailsPanel}
          title={getDetailsPanelTitle()}
          tasks={detailsPanel?.data || []}
          onClose={() => setDetailsPanel(null)}
          onTaskClick={(taskId) => {
            toast({
              title: "Navegação para tarefa",
              description: `Abrindo tarefa ${taskId}`,
            });
            // TODO: Navigate to task detail
          }}
        />
      </div>
    </Layout>
  );
}