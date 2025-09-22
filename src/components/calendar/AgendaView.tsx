import { CalendarEvent } from '@/types/calendar';
import { EventCard } from './EventCard';
import { format, isToday, addDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AgendaViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function AgendaView({
  currentDate,
  events,
  onEventClick,
}: AgendaViewProps) {
  // Group events by date for the next 30 days
  const daysToShow = 30;
  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = format(event.startDate, 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  // Generate next 30 days with events
  const daysWithEvents = [];
  for (let i = 0; i < daysToShow; i++) {
    const date = addDays(currentDate, i);
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayEvents = eventsByDate[dateKey] || [];
    
    if (dayEvents.length > 0) {
      daysWithEvents.push({
        date,
        events: dayEvents.sort((a, b) => {
          // All-day events first, then by time
          if (a.allDay && !b.allDay) return -1;
          if (!a.allDay && b.allDay) return 1;
          return a.startDate.getTime() - b.startDate.getTime();
        }),
      });
    }
  }

  if (daysWithEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <span className="text-2xl">📅</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Nenhum evento nos próximos {daysToShow} dias
        </h3>
        <p className="text-muted-foreground max-w-md">
          Parece que você tem um período tranquilo pela frente. Que tal criar um novo evento?
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {daysWithEvents.map(({ date, events: dayEvents }) => (
          <div key={date.toISOString()} className="space-y-3">
            {/* Date header */}
            <div className={cn(
              'sticky top-0 bg-background/95 backdrop-blur-sm p-3 rounded-lg border',
              isToday(date) && 'border-primary/30 bg-primary/5'
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={cn(
                    'font-semibold',
                    isToday(date) && 'text-primary'
                  )}>
                    {isToday(date) ? 'Hoje' : format(date, 'EEEE', { locale: ptBR })}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {format(date, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Events for this date */}
            <div className="space-y-2 pl-4">
              {dayEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => onEventClick(event)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}