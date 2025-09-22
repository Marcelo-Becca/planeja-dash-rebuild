import { CalendarEvent } from '@/types/calendar';
import { EventCard } from './EventCard';
import { format, addHours, startOfDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
}

export function DayView({
  currentDate,
  events,
  onEventClick,
  onTimeSlotClick,
}: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Filter events for the current day
  const dayEvents = events.filter(event => 
    format(event.startDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
  );

  const getEventsForHour = (hour: number) => {
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
      <div className={cn(
        'p-4 border-b border-border',
        isToday(currentDate) && 'bg-primary/5'
      )}>
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            {format(currentDate, 'EEEE', { locale: ptBR })}
          </div>
          <div className={cn(
            'text-2xl font-medium',
            isToday(currentDate) && 'text-primary'
          )}>
            {format(currentDate, 'dd \'de\' MMMM', { locale: ptBR })}
          </div>
        </div>
      </div>

      {/* All-day events */}
      {dayEvents.some(event => event.allDay) && (
        <div className="border-b border-border p-3">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Eventos do dia todo
          </h3>
          <div className="space-y-1">
            {dayEvents
              .filter(event => event.allDay)
              .map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isCompact={true}
                  onClick={() => onEventClick(event)}
                />
              ))
            }
          </div>
        </div>
      )}

      {/* Time Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          {hours.map((hour) => {
            const hourEvents = getEventsForHour(hour);
            
            return (
              <div key={hour} className="flex min-h-[80px] border-b border-border">
                {/* Time label */}
                <div className="w-20 p-3 text-sm text-muted-foreground text-right border-r border-border">
                  {format(addHours(startOfDay(new Date()), hour), 'HH:mm')}
                </div>
                
                {/* Events column */}
                <div
                  className="flex-1 p-2 relative hover:bg-accent/30 cursor-pointer transition-colors"
                  onClick={() => onTimeSlotClick(currentDate, hour)}
                >
                  <div className="space-y-2">
                    {hourEvents
                      .filter(event => !event.allDay)
                      .map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onClick={() => onEventClick(event)}
                        />
                      ))
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}