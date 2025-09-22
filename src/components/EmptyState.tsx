import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ""
}: EmptyStateProps) {
  return (
    <Card className={`p-12 text-center border-dashed border-2 bg-muted/20 ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {description}
          </p>
        </div>
        
        {actionLabel && onAction && (
          <Button 
            onClick={onAction} 
            className="mt-4"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}