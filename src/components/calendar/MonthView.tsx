import { CalendarEvent } from '@/types/calendar';
import { EventCard } from './EventCard';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
  onCreateEvent: (date?: Date) => void;
}

export function MonthView({
  currentDate,
  events,
  onEventClick,
  onDateClick,
  onCreateEvent,
}: MonthViewProps) {
  // Calculate calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Start on Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = format(event.startDate, 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const getDayEvents = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return eventsByDate[dateKey] || [];
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-muted-foreground bg-muted/30"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {days.map((day) => {
          const dayEvents = getDayEvents(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          const hasEvents = dayEvents.length > 0;

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[120px] border-r border-b border-border p-1 relative group hover:bg-accent/30 transition-colors',
                !isCurrentMonth && 'bg-muted/10 text-muted-foreground',
                isCurrentDay && 'bg-primary/5'
              )}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={() => onDateClick(day)}
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    'hover:bg-primary/20',
                    isCurrentDay && 'bg-primary text-primary-foreground hover:bg-primary/90',
                    !isCurrentMonth && 'text-muted-foreground'
                  )}
                >
                  {format(day, 'd')}
                </button>

                {/* Quick add button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCreateEvent(day)}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isCompact={true}
                    onClick={() => onEventClick(event)}
                    className="text-xs"
                  />
                ))}
                
                {dayEvents.length > 3 && (
                  <button
                    onClick={() => onDateClick(day)}
                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-muted/50 hover:bg-muted w-full text-left"
                  >
                    +{dayEvents.length - 3} mais
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}