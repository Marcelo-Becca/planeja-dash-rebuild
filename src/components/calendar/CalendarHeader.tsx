import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CalendarDays, Clock, List, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { CalendarView } from '@/types/calendar';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onDateSelect: (date: Date) => void;
  onCreateEvent: () => void;
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onNavigate,
  onCreateEvent,
}: CalendarHeaderProps) {
  const formatCurrentPeriod = () => {
    switch (view) {
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: ptBR });
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, 'dd MMM', { locale: ptBR })} - ${format(weekEnd, 'dd MMM yyyy', { locale: ptBR })}`;
      case 'day':
        return format(currentDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR });
      case 'agenda':
        return 'Próximos eventos';
    }
  };

  const viewIcons = {
    month: Calendar,
    week: CalendarDays,
    day: Clock,
    agenda: List,
  };

  return (
    <header className="flex items-center justify-between p-6 border-b border-border">
      <div className="flex items-center space-x-4">
        {/* Navigation */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate('prev')}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            onClick={() => onNavigate('today')}
            className="h-8 px-3 text-sm"
          >
            Hoje
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate('next')}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Current period */}
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold capitalize">
            {formatCurrentPeriod()}
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* View selector */}
        <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
          {(['month', 'week', 'day', 'agenda'] as CalendarView[]).map((viewType) => {
            const Icon = viewIcons[viewType];
            const isActive = view === viewType;
            
            return (
              <Button
                key={viewType}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange(viewType)}
                className="h-8 px-3 text-xs"
              >
                <Icon className="h-3 w-3 mr-1" />
                {viewType === 'month' && 'Mês'}
                {viewType === 'week' && 'Semana'}
                {viewType === 'day' && 'Dia'}
                {viewType === 'agenda' && 'Agenda'}
              </Button>
            );
          })}
        </div>

        {/* Create event button */}
        <Button onClick={onCreateEvent} className="h-9 px-4">
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>
    </header>
  );
}