import { CalendarEvent } from '@/types/calendar';
import { EventCard } from './EventCard';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addHours, startOfDay, isToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
}

export function WeekView({
  currentDate,
  events,
  onEventClick,
  onTimeSlotClick,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Group events by day
  const eventsByDay = events.reduce((acc, event) => {
    const dayKey = format(event.startDate, 'yyyy-MM-dd');
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const getDayEvents = (date: Date) => {
    const dayKey = format(date, 'yyyy-MM-dd');
    return eventsByDay[dayKey] || [];
  };

  const getEventsForHour = (date: Date, hour: number) => {
    const dayEvents = getDayEvents(date);
    return dayEvents.filter(event => {
      if (event.allDay) return hour === 0; // Show all-day events at the top
      
      const eventHour = event.startDate.getHours();
      const eventEndHour = event.endDate.getHours();
      
      return eventHour <= hour && hour < (eventEndHour || eventHour + 1);
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex border-b border-border">
        <div className="w-16 p-2 border-r border-border"></div>
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              'flex-1 p-3 text-center border-r border-border',
              isToday(day) && 'bg-primary/5'
            )}
          >
            <div className="text-sm text-muted-foreground">
              {format(day, 'EEE', { locale: ptBR })}
            </div>
            <div className={cn(
              'text-lg font-medium',
              isToday(day) && 'text-primary'
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          {hours.map((hour) => (
            <div key={hour} className="flex min-h-[60px] border-b border-border">
              {/* Time label */}
              <div className="w-16 p-2 text-xs text-muted-foreground text-right border-r border-border">
                {format(addHours(startOfDay(new Date()), hour), 'HH:mm')}
              </div>
              
              {/* Day columns */}
              {weekDays.map((day) => {
                const hourEvents = getEventsForHour(day, hour);
                
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className={cn(
                      'flex-1 border-r border-border p-1 relative hover:bg-accent/30 cursor-pointer transition-colors',
                      isToday(day) && 'bg-primary/5'
                    )}
                    onClick={() => onTimeSlotClick(day, hour)}
                  >
                    <div className="space-y-1">
                      {hourEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          isCompact={true}
                          onClick={() => onEventClick(event)}
                          className="text-xs"
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}