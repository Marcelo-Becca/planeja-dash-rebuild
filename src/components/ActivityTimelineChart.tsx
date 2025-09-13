import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface ActivityTimelineData {
  date: string;
  tasks: number;
}

interface ActivityTimelineChartProps {
  data: ActivityTimelineData[];
  granularity?: "day" | "week" | "month";
}

const chartConfig = {
  tasks: {
    label: "Tarefas",
    color: "hsl(var(--chart-1))",
  },
};

export default function ActivityTimelineChart({ data, granularity = "day" }: ActivityTimelineChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground mb-1">{formattedDate}</p>
          <p className="text-sm text-chart-1">
            {payload[0].value} tarefas concluídas
          </p>
          <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
            Granularidade: {granularity === "day" ? "Diária" : granularity === "week" ? "Semanal" : "Mensal"}
          </div>
        </div>
      );
    }
    return null;
  };

  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem);
    switch (granularity) {
      case "week":
        return `Sem ${Math.ceil(date.getDate() / 7)}`;
      case "month":
        return date.toLocaleDateString('pt-BR', { month: 'short' });
      default:
        return date.toLocaleDateString('pt-BR', { 
          day: '2-digit',
          month: '2-digit'
        });
    }
  };

  return (
    <div className="p-6 bg-card border border-border rounded-lg">
      <ChartContainer config={chartConfig} className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={formatXAxisLabel}
            />
            <YAxis 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="tasks" 
              stroke="var(--color-tasks)"
              strokeWidth={3}
              dot={{ 
                fill: "var(--color-tasks)", 
                strokeWidth: 2, 
                r: 5 
              }}
              activeDot={{ 
                r: 7, 
                stroke: "var(--color-tasks)",
                strokeWidth: 2,
                fill: "hsl(var(--background))"
              }}
              className="animate-pulse-slow"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}