import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface TeamProductivityData {
  name: string;
  completed: number;
  inProgress: number;
  overdue: number;
}

interface TeamProductivityChartProps {
  data: TeamProductivityData[];
}

const chartConfig = {
  completed: {
    label: "Concluídas",
    color: "hsl(var(--chart-1))",
  },
  inProgress: {
    label: "Em andamento",
    color: "hsl(var(--chart-2))",
  },
  overdue: {
    label: "Atrasadas",
    color: "hsl(var(--chart-4))",
  },
};

export default function TeamProductivityChart({ data }: TeamProductivityChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }}>
                {entry.name}: {entry.value} tarefas
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-card border border-border rounded-lg">
      <ChartContainer config={chartConfig} className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '12px',
                color: 'hsl(var(--muted-foreground))'
              }}
            />
            <Bar 
              dataKey="completed" 
              fill="var(--color-completed)" 
              radius={[2, 2, 0, 0]}
              name="Concluídas"
            />
            <Bar 
              dataKey="inProgress" 
              fill="var(--color-inProgress)" 
              radius={[2, 2, 0, 0]}
              name="Em andamento"
            />
            <Bar 
              dataKey="overdue" 
              fill="var(--color-overdue)" 
              radius={[2, 2, 0, 0]}
              name="Atrasadas"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}