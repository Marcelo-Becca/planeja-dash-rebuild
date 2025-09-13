import { CheckCircle, Target, Folder, AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportCardProps {
  title: string;
  value: string | number;
  variant: "success" | "warning" | "info" | "error";
  icon: "check" | "target" | "folder" | "alert" | "trend";
  className?: string;
}

const iconMap = {
  check: CheckCircle,
  target: Target,
  folder: Folder,
  alert: AlertTriangle,
  trend: TrendingUp,
};

const variantStyles = {
  success: "border-l-chart-1 bg-chart-1/10",
  warning: "border-l-chart-4 bg-chart-4/10",
  info: "border-l-chart-2 bg-chart-2/10",
  error: "border-l-chart-5 bg-chart-5/10",
};

const iconStyles = {
  success: "text-chart-1",
  warning: "text-chart-4",
  info: "text-chart-2",
  error: "text-chart-5",
};

export default function ReportCard({ 
  title, 
  value, 
  variant, 
  icon, 
  className 
}: ReportCardProps) {
  const Icon = iconMap[icon];

  return (
    <div className={cn(
      "p-6 bg-card border border-border rounded-lg border-l-4 transition-shadow hover:shadow-card-hover",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-card-foreground">{value}</p>
        </div>
        <div className={cn(
          "p-2 rounded-lg bg-background/50",
          iconStyles[variant]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}