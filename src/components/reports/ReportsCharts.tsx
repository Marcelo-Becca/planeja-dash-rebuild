import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2, Eye, EyeOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartData } from "@/hooks/useReportsData";

interface ReportsChartsProps {
  data: ChartData;
  loading: boolean;
  onChartClick: (type: string, data: any) => void;
  onDetailsClick: (type: string, data: any) => void;
}

export default function ReportsCharts({ data, loading, onChartClick, onDetailsClick }: ReportsChartsProps) {
  const [visibleSeries, setVisibleSeries] = useState({
    completed: true,
    inProgress: true,
    overdue: true
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = data.total || 100;
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} tarefas ({percentage}%)
          </p>
          <p className="text-xs text-primary mt-1">Clique para ver detalhes</p>
        </div>
      );
    }
    return null;
  };

  const toggleSeries = (series: keyof typeof visibleSeries) => {
    setVisibleSeries(prev => ({
      ...prev,
      [series]: !prev[series]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Project Performance & Task Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Performance Chart */}
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Desempenho por Projetos</CardTitle>
            <Button variant="ghost" size="sm">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {data.projectPerformance.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground text-center">
                  Sem projetos no período selecionado<br />
                  <span className="text-xs">Tente expandir o período ou selecionar outros projetos</span>
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.projectPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="progress" 
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                    onClick={(data) => onChartClick('project', data.name)}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Task Distribution Chart */}
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Distribuição de Tarefas</CardTitle>
            <Button variant="ghost" size="sm">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {data.taskDistribution.every(item => item.value === 0) ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground text-center">
                  Sem tarefas no período selecionado<br />
                  <span className="text-xs">Tente expandir o período ou criar novas tarefas</span>
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.taskDistribution.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    cursor="pointer"
                    onClick={(data) => onDetailsClick('tasks', data.name.toLowerCase().replace(' ', '-'))}
                  >
                    {data.taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Productivity */}
      <Card className="animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Produtividade da Equipe</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Object.entries(visibleSeries).map(([key, visible]) => (
                <Button
                  key={key}
                  variant={visible ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSeries(key as keyof typeof visibleSeries)}
                  className="text-xs"
                >
                  {visible ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                  {key === 'completed' ? 'Concluídas' : key === 'inProgress' ? 'Em andamento' : 'Atrasadas'}
                </Button>
              ))}
            </div>
            <Button variant="ghost" size="sm">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data.teamProductivity.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground text-center">
                Sem dados de produtividade no período<br />
                <span className="text-xs">Verifique se há tarefas atribuídas aos membros</span>
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.teamProductivity} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {visibleSeries.completed && (
                  <Bar 
                    dataKey="completed" 
                    stackId="a" 
                    fill="hsl(var(--chart-1))"
                    name="Concluídas"
                    cursor="pointer"
                    onClick={(data) => onChartClick('member', data.name)}
                  />
                )}
                {visibleSeries.inProgress && (
                  <Bar 
                    dataKey="inProgress" 
                    stackId="a" 
                    fill="hsl(var(--chart-2))"
                    name="Em andamento"
                    cursor="pointer"
                    onClick={(data) => onChartClick('member', data.name)}
                  />
                )}
                {visibleSeries.overdue && (
                  <Bar 
                    dataKey="overdue" 
                    stackId="a" 
                    fill="hsl(var(--chart-4))"
                    name="Atrasadas"
                    cursor="pointer"
                    onClick={(data) => onChartClick('member', data.name)}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card className="animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Linha do Tempo de Atividades</CardTitle>
          <Button variant="ghost" size="sm">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {data.activityTimeline.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground text-center">
                Sem atividades registradas no período<br />
                <span className="text-xs">Atividades aparecerão conforme tarefas forem criadas</span>
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.activityTimeline} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="tasks" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "hsl(var(--chart-1))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}