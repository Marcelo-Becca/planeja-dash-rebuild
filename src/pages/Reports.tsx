import { useState, useEffect } from "react";
import { Calendar, Download, FileText, Filter, Maximize2, Minimize2, RotateCcw, BarChart3, List } from "lucide-react";
import Layout from "@/components/Layout";
import ReportCard from "@/components/ReportCard";
import ProjectPerformanceChart from "@/components/ProjectPerformanceChart";
import TaskDistributionChart from "@/components/TaskDistributionChart";
import TeamProductivityChart from "@/components/TeamProductivityChart";
import ActivityTimelineChart from "@/components/ActivityTimelineChart";
import TaskDetailPanel from "@/components/TaskDetailPanel";
import ProjectDetailPanel from "@/components/ProjectDetailPanel";
import TeamMemberPanel from "@/components/TeamMemberPanel";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

// Mock detailed data for interactions
const mockDetailedTasks = {
  completed: [
    { id: "1", title: "Implementar autenticação", project: "Sistema de Gestão", assignee: "Carlos Silva", completedAt: "2024-01-15" },
    { id: "2", title: "Design da homepage", project: "Website", assignee: "Ana Costa", completedAt: "2024-01-14" },
  ],
  overdue: [
    { id: "3", title: "Testes unitários", project: "App Mobile", assignee: "Pedro Lima", dueDate: "2024-01-10" },
    { id: "4", title: "Documentação API", project: "Sistema de Gestão", assignee: "Marina Santos", dueDate: "2024-01-12" },
  ],
  inProgress: [
    { id: "5", title: "Interface responsiva", project: "Website", assignee: "Ana Costa", startedAt: "2024-01-13" },
  ],
  pending: [
    { id: "6", title: "Deploy produção", project: "Sistema de Gestão", assignee: "Carlos Silva", createdAt: "2024-01-15" },
  ]
};

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
  const [granularity, setGranularity] = useState<"day" | "week" | "month">("day");
  const [viewMode, setViewMode] = useState<"chart" | "list">("chart");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedTaskCategory, setSelectedTaskCategory] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string | null>(null);
  const [fullscreenChart, setFullscreenChart] = useState<string | null>(null);
  const { toast } = useToast();

  // Simulate data update when filters change
  useEffect(() => {
    // Here you would normally fetch new data based on filters
    toast({
      title: "Dados atualizados",
      description: `Relatórios atualizados para ${period === "week" ? "última semana" : period === "month" ? "mês atual" : period === "quarter" ? "último trimestre" : "período personalizado"}`,
    });
  }, [period, scope, toast]);

  const handleCardClick = (cardType: string) => {
    setExpandedCard(expandedCard === cardType ? null : cardType);
  };

  const handleTaskCategoryClick = (category: string) => {
    setSelectedTaskCategory(category);
  };

  const handleProjectClick = (projectName: string) => {
    setSelectedProject(projectName);
  };

  const handleTeamMemberClick = (memberName: string) => {
    setSelectedTeamMember(memberName);
  };

  const handleExport = (format: string, section?: string) => {
    const exportDescription = section 
      ? `Seção "${section}" será exportada em formato ${format.toUpperCase()}`
      : `Relatório completo será exportado em formato ${format.toUpperCase()}`;
    
    toast({
      title: "Exportação iniciada",
      description: exportDescription,
    });
  };

  const resetFilters = () => {
    setPeriod("month");
    setScope("all");
    setGranularity("day");
    toast({
      title: "Filtros redefinidos",
      description: "Todos os filtros foram restaurados para os valores padrão",
    });
  };

  const ChartHeader = ({ title, onFullscreen, onExport }: { 
    title: string; 
    onFullscreen: () => void; 
    onExport: () => void; 
  }) => (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-card-foreground">{title}</h2>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onFullscreen}>
          <Maximize2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onExport}>
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

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
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border border-border animate-fade-in">
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

          <Button variant="outline" size="sm" onClick={resetFilters} className="ml-auto">
            <RotateCcw className="w-4 h-4 mr-2" />
            Redefinir
          </Button>
        </div>

        {/* Productivity Summary */}
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-xl font-semibold text-card-foreground">Resumo de Produtividade</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ReportCard
              title="Tarefas Concluídas"
              value={mockReportData.productivity.completedTasks}
              variant="success"
              icon="check"
              isExpanded={expandedCard === "completed"}
              onClick={() => handleCardClick("completed")}
            />
            <ReportCard
              title="Metas Alcançadas"
              value={`${mockReportData.productivity.achievedGoals}%`}
              variant="success"
              icon="target"
              isExpanded={expandedCard === "goals"}
              onClick={() => handleCardClick("goals")}
            />
            <ReportCard
              title="Projetos Ativos"
              value={mockReportData.productivity.activeProjects}
              variant="info"
              icon="folder"
              isExpanded={expandedCard === "projects"}
              onClick={() => handleCardClick("projects")}
            />
            <ReportCard
              title="Tarefas Atrasadas"
              value={mockReportData.productivity.overdueTasks}
              variant="warning"
              icon="alert"
              isExpanded={expandedCard === "overdue"}
              onClick={() => handleCardClick("overdue")}
            />
          </div>

          {/* Expanded details */}
          {expandedCard && (
            <div className="mt-4 p-4 bg-card/50 rounded-lg border border-border animate-scale-in">
              <h3 className="font-medium text-card-foreground mb-2">
                Detalhes - {expandedCard === "completed" ? "Tarefas Concluídas" : 
                         expandedCard === "goals" ? "Metas Alcançadas" :
                         expandedCard === "projects" ? "Projetos Ativos" : "Tarefas Atrasadas"}
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                {expandedCard === "completed" && mockDetailedTasks.completed.map(task => (
                  <div key={task.id} className="flex justify-between">
                    <span>{task.title}</span>
                    <span>{task.completedAt}</span>
                  </div>
                ))}
                {expandedCard === "overdue" && mockDetailedTasks.overdue.map(task => (
                  <div key={task.id} className="flex justify-between">
                    <span>{task.title}</span>
                    <span className="text-chart-4">Venceu em {task.dueDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Performance */}
          <div className="space-y-4 animate-fade-in">
            <ChartHeader 
              title="Desempenho por Projetos"
              onFullscreen={() => setFullscreenChart("projects")}
              onExport={() => handleExport("pdf", "Desempenho por Projetos")}
            />
            <ProjectPerformanceChart 
              data={mockReportData.projectPerformance} 
              onProjectClick={handleProjectClick}
            />
          </div>

          {/* Task Distribution */}
          <div className="space-y-4 animate-fade-in">
            <ChartHeader 
              title="Distribuição de Tarefas"
              onFullscreen={() => setFullscreenChart("distribution")}
              onExport={() => handleExport("pdf", "Distribuição de Tarefas")}
            />
            <TaskDistributionChart 
              data={mockReportData.taskDistribution} 
              onSegmentClick={handleTaskCategoryClick}
            />
          </div>

          {/* Team Productivity */}
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <ChartHeader 
                title="Produtividade da Equipe"
                onFullscreen={() => setFullscreenChart("team")}
                onExport={() => handleExport("pdf", "Produtividade da Equipe")}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "chart" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("chart")}
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <TeamProductivityChart 
              data={mockReportData.teamProductivity} 
              viewMode={viewMode}
              onMemberClick={handleTeamMemberClick}
            />
          </div>

          {/* Activity Timeline */}
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <ChartHeader 
                title="Linha do Tempo de Atividades"
                onFullscreen={() => setFullscreenChart("timeline")}
                onExport={() => handleExport("pdf", "Linha do Tempo")}
              />
              <Select value={granularity} onValueChange={(value: "day" | "week" | "month") => setGranularity(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Por dia</SelectItem>
                  <SelectItem value="week">Por semana</SelectItem>
                  <SelectItem value="month">Por mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ActivityTimelineChart 
              data={mockReportData.activityTimeline} 
              granularity={granularity}
            />
          </div>
        </div>

        {/* Export Section */}
        <div className="p-4 bg-card rounded-lg border border-border animate-fade-in">
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

        {/* Side Panels and Modals */}
        <Sheet open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <SheetContent className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Detalhes do Projeto</SheetTitle>
            </SheetHeader>
            {selectedProject && (
              <ProjectDetailPanel 
                projectName={selectedProject}
                onClose={() => setSelectedProject(null)}
              />
            )}
          </SheetContent>
        </Sheet>

        <Sheet open={!!selectedTeamMember} onOpenChange={() => setSelectedTeamMember(null)}>
          <SheetContent className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Desempenho Individual</SheetTitle>
            </SheetHeader>
            {selectedTeamMember && (
              <TeamMemberPanel 
                memberName={selectedTeamMember}
                onClose={() => setSelectedTeamMember(null)}
              />
            )}
          </SheetContent>
        </Sheet>

        <TaskDetailPanel 
          isOpen={!!selectedTaskCategory}
          category={selectedTaskCategory}
          tasks={selectedTaskCategory ? mockDetailedTasks[selectedTaskCategory as keyof typeof mockDetailedTasks] || [] : []}
          onClose={() => setSelectedTaskCategory(null)}
        />

        {/* Fullscreen Chart Modal */}
        <Dialog open={!!fullscreenChart} onOpenChange={() => setFullscreenChart(null)}>
          <DialogContent className="max-w-6xl h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                {fullscreenChart === "projects" ? "Desempenho por Projetos" :
                 fullscreenChart === "distribution" ? "Distribuição de Tarefas" :
                 fullscreenChart === "team" ? "Produtividade da Equipe" : "Linha do Tempo"}
                <Button variant="ghost" size="sm" onClick={() => setFullscreenChart(null)}>
                  <Minimize2 className="w-4 h-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 mt-4">
              {fullscreenChart === "projects" && (
                <ProjectPerformanceChart 
                  data={mockReportData.projectPerformance}
                  onProjectClick={handleProjectClick}
                />
              )}
              {fullscreenChart === "distribution" && (
                <TaskDistributionChart 
                  data={mockReportData.taskDistribution}
                  onSegmentClick={handleTaskCategoryClick}
                />
              )}
              {fullscreenChart === "team" && (
                <TeamProductivityChart 
                  data={mockReportData.teamProductivity}
                  viewMode={viewMode}
                  onMemberClick={handleTeamMemberClick}
                />
              )}
              {fullscreenChart === "timeline" && (
                <ActivityTimelineChart 
                  data={mockReportData.activityTimeline}
                  granularity={granularity}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}