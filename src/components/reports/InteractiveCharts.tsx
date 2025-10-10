import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Eye, BarChart3, PieChart, LineChart, TrendingUp } from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';
import { ChartDataPoint, ProjectPerformanceData, TaskDistributionData, TeamProductivityData } from "@/types/reports";
interface InteractiveChartsProps {
  timelineData: ChartDataPoint[];
  projectPerformanceData: ProjectPerformanceData[];
  taskDistributionData: TaskDistributionData[];
  teamProductivityData: TeamProductivityData[];
  loading?: boolean;
  onChartClick?: (type: string, data: any) => void;
  onDrillDown?: (type: string, category: string) => void;
}
export default function InteractiveCharts({
  timelineData,
  projectPerformanceData,
  taskDistributionData,
  teamProductivityData,
  loading = false,
  onChartClick,
  onDrillDown
}: InteractiveChartsProps) {
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const CustomTooltip = ({
    active,
    payload,
    label
  }: any) => {
    if (active && payload && payload.length) {
      return <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-popover-foreground">{`Data: ${label}`}</p>
          <p className="text-chart-1">
            {`Tarefas concluídas: ${payload[0].value}`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Clique para ver detalhes
          </p>
        </div>;
    }
    return null;
  };
  const PieTooltip = ({
    active,
    payload
  }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-popover-foreground">{data.status}</p>
          <p className="text-primary">
            {`${data.count} tarefas (${data.percentage}%)`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Clique para ver lista
          </p>
        </div>;
    }
    return null;
  };
  const BarTooltip = ({
    active,
    payload,
    label
  }: any) => {
    if (active && payload && payload.length) {
      return <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-popover-foreground">{label}</p>
          {payload.map((entry: any, index: number) => <p key={index} style={{
          color: entry.color
        }}>
              {`${entry.dataKey === 'completionRate' ? 'Taxa de conclusão' : entry.dataKey === 'totalTasks' ? 'Total de tarefas' : entry.dataKey === 'completedTasks' ? 'Concluídas' : entry.dataKey === 'inProgressTasks' ? 'Em andamento' : entry.dataKey === 'overdueTasks' ? 'Atrasadas' : entry.dataKey}: ${entry.value}${entry.dataKey === 'completionRate' ? '%' : ''}`}
            </p>)}
          <p className="text-xs text-muted-foreground mt-1">
            Clique para mais detalhes
          </p>
        </div>;
    }
    return null;
  };
  const handleTimelineClick = (data: any) => {
    if (onDrillDown) {
      onDrillDown('timeline', data.activeLabel);
    }
  };
  const handlePieClick = (data: any) => {
    if (onDrillDown) {
      onDrillDown('distribution', data.status);
    }
  };
  const handleProjectBarClick = (data: any) => {
    if (onChartClick) {
      onChartClick('project', data.name);
    }
  };
  const handleTeamBarClick = (data: any) => {
    if (onChartClick) {
      onChartClick('team', data.name);
    }
  };
  if (loading) {
    return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({
        length: 4
      }).map((_, i) => <Card key={i} className="animate-pulse">
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-5 w-48" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>)}
      </div>;
  }
  return <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-card-foreground px-[11px]">Gráficos Interativos</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Clique nos gráficos para detalhar
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-chart-1" />
                Tarefas Concluídas por Dia
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Últimos 30 dias • Clique em pontos para detalhar
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={timelineData} onClick={handleTimelineClick}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={3} dot={{
                fill: "hsl(var(--chart-1))",
                strokeWidth: 2,
                r: 4
              }} activeDot={{
                r: 6,
                fill: "hsl(var(--chart-1))"
              }} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Distribution Chart */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-chart-2" />
                Distribuição de Status
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Por status • Clique em segmentos para listar
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie data={taskDistributionData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="count" onClick={handlePieClick} label={({
                status,
                percentage
              }) => `${percentage}%`}>
                  {taskDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} className="cursor-pointer hover:opacity-80" />)}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend wrapperStyle={{
                fontSize: '12px'
              }} formatter={value => {
                const statusMap: Record<string, string> = {
                  'pending': 'Pendentes',
                  'in-progress': 'Em andamento',
                  'completed': 'Concluídas',
                  'overdue': 'Atrasadas'
                };
                return statusMap[value] || value;
              }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Performance Chart */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-chart-3" />
                Progresso por Projeto
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Taxa de conclusão • Clique em barras para abrir projeto
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={projectPerformanceData} onClick={handleProjectBarClick}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="completionRate" fill="hsl(var(--chart-3))" className="cursor-pointer hover:opacity-80" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Productivity Chart */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-chart-4" />
                Produtividade por Equipe
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Tarefas por equipe • Clique para filtrar por equipe
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={teamProductivityData} onClick={handleTeamBarClick}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="completedTasks" stackId="tasks" fill="hsl(var(--chart-1))" name="Concluídas" className="cursor-pointer hover:opacity-80" />
                <Bar dataKey="inProgressTasks" stackId="tasks" fill="hsl(var(--chart-2))" name="Em andamento" className="cursor-pointer hover:opacity-80" />
                <Bar dataKey="overdueTasks" stackId="tasks" fill="hsl(var(--chart-4))" name="Atrasadas" className="cursor-pointer hover:opacity-80" />
                <Legend wrapperStyle={{
                fontSize: '12px'
              }} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>;
}