import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProgressSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  showQuickActions?: boolean;
  className?: string;
}

export function ProgressSlider({
  value,
  onChange,
  disabled = false,
  showQuickActions = true,
  className
}: ProgressSliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const quickValues = [0, 25, 50, 75, 100];

  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'text-muted-foreground';
    if (progress < 50) return 'text-orange-500';
    if (progress < 100) return 'text-blue-500';
    return 'text-green-500';
  };

  const getProgressBg = (progress: number) => {
    if (progress === 0) return 'bg-muted-foreground/10';
    if (progress < 50) return 'bg-orange-500/10';
    if (progress < 100) return 'bg-blue-500/10';
    return 'bg-green-500/10';
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Progresso
        </label>
        <Badge 
          variant="secondary" 
          className={cn(
            "transition-colors",
            getProgressColor(value),
            getProgressBg(value)
          )}
        >
          {value}%
        </Badge>
      </div>

      <div className="space-y-3">
        <Slider
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          onValueCommit={() => setIsDragging(false)}
          max={100}
          min={0}
          step={5}
          disabled={disabled}
          className="w-full"
        />

        {showQuickActions && (
          <div className="flex gap-2 justify-center">
            {quickValues.map((quickValue) => (
              <Button
                key={quickValue}
                size="sm"
                variant={value === quickValue ? "default" : "outline"}
                onClick={() => onChange(quickValue)}
                disabled={disabled}
                className="h-8 text-xs"
              >
                {quickValue}%
              </Button>
            ))}
          </div>
        )}
      </div>

      {value === 100 && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm text-green-600 font-medium">
            Tarefa concluída!
          </span>
        </div>
      )}
    </div>
  );
}