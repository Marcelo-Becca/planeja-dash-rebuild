import { CalendarEvent } from '@/types/calendar';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, MapPin, Users, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: CalendarEvent;
  isCompact?: boolean;
  onClick?: () => void;
  className?: string;
}

export function EventCard({ event, isCompact = false, onClick, className }: EventCardProps) {
  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
      case 'deadline':
        return 'bg-red-500/20 border-red-500/30 text-red-300';
      case 'reminder':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      case 'block':
        return 'bg-purple-500/20 border-purple-500/30 text-purple-300';
      default:
        return 'bg-primary/20 border-primary/30 text-primary';
    }
  };

  const getPriorityIndicator = (priority: CalendarEvent['priority']) => {
    if (priority === 'high') return 'border-l-red-500';
    if (priority === 'medium') return 'border-l-yellow-500';
    return 'border-l-green-500';
  };

  const getTypeLabel = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting': return 'Reunião';
      case 'deadline': return 'Entrega';
      case 'reminder': return 'Lembrete';
      case 'block': return 'Bloqueio';
    }
  };

  if (isCompact) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'p-2 rounded-md border-l-2 cursor-pointer hover:bg-accent/50 transition-colors',
          getPriorityIndicator(event.priority),
          getEventTypeColor(event.type),
          className
        )}
      >
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-medium truncate">{event.title}</h4>
          {event.priority === 'high' && (
            <AlertCircle className="h-3 w-3 text-red-400 flex-shrink-0 ml-1" />
          )}
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground space-x-2">
          {!event.allDay && (
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {format(event.startDate, 'HH:mm', { locale: ptBR })}
            </span>
          )}
          
          {event.participants.length > 0 && (
            <span className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {event.participants.length}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg border border-border bg-card hover:bg-accent/50 cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-accent',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold truncate">{event.title}</h3>
            {event.priority === 'high' && (
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            )}
          </div>
          
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {event.description}
            </p>
          )}
        </div>
        
        <Badge variant="secondary" className={cn('ml-2', getEventTypeColor(event.type))}>
          {getTypeLabel(event.type)}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4 text-muted-foreground">
          {!event.allDay ? (
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {format(event.startDate, 'HH:mm', { locale: ptBR })} - {format(event.endDate, 'HH:mm', { locale: ptBR })}
            </span>
          ) : (
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Dia todo
            </span>
          )}
          
          {event.location && (
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {event.location}
            </span>
          )}
        </div>

        {event.participants.length > 0 && (
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex -space-x-1">
              {event.participants.slice(0, 3).map((participantId, index) => (
                <Avatar key={participantId} className="w-6 h-6 border-2 border-background">
                  <AvatarFallback className="text-xs">
                    {participantId.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {event.participants.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    +{event.participants.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}