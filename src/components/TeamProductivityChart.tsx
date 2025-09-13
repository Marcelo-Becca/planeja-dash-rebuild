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
  viewMode?: "chart" | "list";
  onMemberClick?: (memberName: string) => void;
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

export default function TeamProductivityChart({ data, viewMode = "chart", onMemberClick }: TeamProductivityChartProps) {
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
          {onMemberClick && (
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
    if (onMemberClick) {
      onMemberClick(data.name);
    }
  };

  if (viewMode === "list") {
    return (
      <div className="p-6 bg-card border border-border rounded-lg">
        <div className="space-y-3">
          {data.map((member, index) => (
            <div 
              key={index}
              className={cn(
                "p-4 bg-muted/30 rounded-lg transition-all duration-200",
                onMemberClick && "cursor-pointer hover:bg-muted/50 hover:shadow-sm"
              )}
              onClick={() => onMemberClick && onMemberClick(member.name)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="font-medium text-card-foreground">{member.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {member.completed + member.inProgress + member.overdue} tarefas
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="text-chart-1">
                  <p className="text-lg font-bold">{member.completed}</p>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                </div>
                <div className="text-chart-2">
                  <p className="text-lg font-bold">{member.inProgress}</p>
                  <p className="text-xs text-muted-foreground">Em andamento</p>
                </div>
                <div className="text-chart-4">
                  <p className="text-lg font-bold">{member.overdue}</p>
                  <p className="text-xs text-muted-foreground">Atrasadas</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
              className={onMemberClick ? "cursor-pointer" : ""}
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
              className={onMemberClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
              onClick={handleBarClick}
            />
            <Bar 
              dataKey="inProgress" 
              fill="var(--color-inProgress)" 
              radius={[2, 2, 0, 0]}
              name="Em andamento"
              className={onMemberClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
              onClick={handleBarClick}
            />
            <Bar 
              dataKey="overdue" 
              fill="var(--color-overdue)" 
              radius={[2, 2, 0, 0]}
              name="Atrasadas"
              className={onMemberClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
              onClick={handleBarClick}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}