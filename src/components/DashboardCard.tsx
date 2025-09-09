import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function DashboardCard({ title, children, className }: DashboardCardProps) {
  return (
    <article className={cn(
      "bg-card border border-border rounded-lg shadow-card hover:shadow-card-hover transition-shadow duration-300 animate-fade-in",
      className
    )}>
      {/* Card Header */}
      <header className="p-4 md:p-6 border-b border-border">
        <h2 className="text-lg md:text-xl font-semibold text-card-foreground">{title}</h2>
      </header>

      {/* Card Content */}
      <div className="p-4 md:p-6">
        {children}
      </div>
    </article>
  );
}