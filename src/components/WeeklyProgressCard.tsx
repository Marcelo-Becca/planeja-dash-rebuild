import { Lightbulb } from "lucide-react";
import DashboardCard from "./DashboardCard";
import ProgressBar from "./ProgressBar";

const progressData = [
  {
    label: "Tarefas concluídas",
    current: 12,
    total: 18,
    variant: "primary" as const
  },
  {
    label: "Metas batidas",
    current: 3,
    total: 5,
    variant: "secondary" as const
  },
  {
    label: "Projetos finalizados",
    current: 2,
    total: 3,
    variant: "primary" as const
  },
  {
    label: "Reuniões realizadas",
    current: 8,
    total: 10,
    variant: "secondary" as const
  }
];

const tips = [
  "Organize suas tarefas por prioridade para ser mais produtivo",
  "Use blocos de tempo para focar em atividades importantes",
  "Faça pausas regulares para manter a concentração",
  "Revise suas metas semanalmente para ajustar o planejamento",
  "Comemore pequenas vitórias para manter a motivação"
];

// Select a random tip
const todaysTip = tips[Math.floor(Math.random() * tips.length)];

export default function WeeklyProgressCard() {
  return (
    <DashboardCard title="Progresso semanal">
      <div className="space-y-6">
        {/* Progress bars */}
        <div className="space-y-5">
          {progressData.map((item, index) => (
            <div 
              key={item.label}
              className="animate-slide-in-left"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <ProgressBar
                label={item.label}
                current={item.current}
                total={item.total}
                variant={item.variant}
              />
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Daily tip */}
        <div className="bg-muted/30 rounded-lg p-4 animate-fade-in">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-card-foreground mb-1">
                Dica de hoje:
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {todaysTip}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}