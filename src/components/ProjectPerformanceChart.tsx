import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface ProjectPerformanceData {
  name: string;
  progress: number;
  completedTasks: number;
  pendingTasks: number;
}

interface ProjectPerformanceChartProps {
  data: ProjectPerformanceData[];
  onProjectClick?: (projectName: string) => void;
}

const chartConfig = {
  progress: {
    label: "Progresso",
    color: "hsl(var(--chart-1))",
  },
};

export default function ProjectPerformanceChart({ data, onProjectClick }: ProjectPerformanceChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-chart-1">
              Progresso: {data.progress}%
            </p>
            <p className="text-chart-2">
              Concluídas: {data.completedTasks} tarefas
            </p>
            <p className="text-chart-3">
              Pendentes: {data.pendingTasks} tarefas
            </p>
          </div>
          {onProjectClick && (
            <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
              Clique para ver detalhes
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: any) => {
    if (onProjectClick) {
      onProjectClick(data.name);
    }
  };

  return (
    <div className="p-6 bg-card border border-border rounded-lg">
      <ChartContainer config={chartConfig} className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="horizontal"
            margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              type="number" 
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis 
              type="category" 
              dataKey="name"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="progress" 
              fill="var(--color-progress)"
              radius={[0, 4, 4, 0]}
              className={onProjectClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
              onClick={handleBarClick}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}