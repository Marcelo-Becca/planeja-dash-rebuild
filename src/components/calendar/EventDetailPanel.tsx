import { CalendarEvent } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Clock, MapPin, Users, Edit, Trash2, Copy, Calendar as CalendarIcon, Bell, Repeat, CheckCircle, X as XIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useLocalData } from '@/hooks/useLocalData';
import { useState } from 'react';

interface EventDetailPanelProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (eventId: string) => void;
  onDuplicate: (event: CalendarEvent) => void;
  onUpdateStatus: (eventId: string, status: CalendarEvent['status']) => void;
}

export function EventDetailPanel({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onUpdateStatus,
}: EventDetailPanelProps) {
  const { projects, teams, users } = useLocalData();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!event) return null;

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

  const getTypeLabel = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting': return 'Reunião';
      case 'deadline': return 'Entrega';
      case 'reminder': return 'Lembrete';
      case 'block': return 'Bloqueio';
    }
  };

  const getPriorityLabel = (priority: CalendarEvent['priority']) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
    }
  };

  const getStatusLabel = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
    }
  };

  const project = event.projectId ? projects.find(p => p.id === event.projectId) : null;
  const team = event.teamId ? teams.find(t => t.id === event.teamId) : null;
  const participants = (event.participants || []).map(id => users.find(u => u.id === id)).filter(Boolean);

  const formatReminderTime = (minutes: number) => {
    if (minutes === 0) return 'No horário';
    if (minutes < 60) return `${minutes} minutos antes`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} horas antes`;
    return `${Math.floor(minutes / 1440)} dias antes`;
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(event.id);
      onClose();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl mb-2 line-clamp-2">
                {event.title}
              </SheetTitle>
              <div className="flex items-center space-x-2">
                <Badge className={getEventTypeColor(event.type)}>
                  {getTypeLabel(event.type)}
                </Badge>
                <Badge variant={event.priority === 'high' ? 'destructive' : event.priority === 'medium' ? 'secondary' : 'outline'}>
                  {getPriorityLabel(event.priority)}
                </Badge>
                <Badge variant={event.status === 'completed' ? 'default' : event.status === 'cancelled' ? 'destructive' : 'secondary'}>
                  {getStatusLabel(event.status)}
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Description */}
          {event.description && (
            <div>
              <h4 className="text-sm font-medium mb-2">Descrição</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Date and Time */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Data e Horário
            </h4>
            <div className="space-y-2 text-sm">
              {event.allDay ? (
                <div>
                  <span className="text-muted-foreground">Dia todo • </span>
                  {format(event.startDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
                </div>
              ) : (
                <div className="space-y-1">
                  <div>
                    <span className="text-muted-foreground">Início: </span>
                    {format(event.startDate, 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Término: </span>
                    {format(event.endDate, 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Local
              </h4>
              <p className="text-sm text-muted-foreground">
                {event.location}
              </p>
            </div>
          )}

          {/* Participants */}
          {participants.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Participantes ({participants.length})
              </h4>
              <div className="space-y-2">
                {participants.map((user) => (
                  <div key={user?.id} className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project/Team */}
          {(project || team) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Vinculações</h4>
                <div className="space-y-2">
                  {project && (
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Projeto: <span className="font-medium">{project.name}</span></span>
                    </div>
                  )}
                  {team && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Equipe: <span className="font-medium">{team.name}</span></span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Reminders */}
          {(event.reminders || []).length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center">
                  <Bell className="w-4 h-4 mr-2" />
                  Lembretes
                </h4>
                <div className="space-y-1">
                  {(event.reminders || []).map((reminder) => (
                    <div key={reminder.id} className="text-sm text-muted-foreground flex items-center space-x-2">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        reminder.triggered ? 'bg-green-500' : 'bg-muted-foreground'
                      )} />
                      <span>{formatReminderTime(reminder.minutes)}</span>
                      {reminder.triggered && <CheckCircle className="w-3 h-3 text-green-500" />}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Recurrence */}
          {event.recurrence && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center">
                  <Repeat className="w-4 h-4 mr-2" />
                  Recorrência
                </h4>
                <p className="text-sm text-muted-foreground">
                  A cada {event.recurrence.interval} {event.recurrence.type === 'daily' ? 'dia(s)' : 
                    event.recurrence.type === 'weekly' ? 'semana(s)' :
                    event.recurrence.type === 'monthly' ? 'mês(es)' : 'ano(s)'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2 pt-6 border-t">
          {event.status === 'scheduled' && (
            <Button
              onClick={() => onUpdateStatus(event.id, 'completed')}
              className="w-full"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Marcar como Concluído
            </Button>
          )}
          
          {event.status === 'completed' && (
            <Button
              variant="outline"
              onClick={() => onUpdateStatus(event.id, 'scheduled')}
              className="w-full"
            >
              <XIcon className="w-4 h-4 mr-2" />
              Remarcar como Agendado
            </Button>
          )}

          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={onEdit} className="flex-1">
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
            
            <Button
              variant="outline"
              onClick={() => onDuplicate(event)}
              className="flex-1"
            >
              <Copy className="w-4 h-4 mr-1" />
              Duplicar
            </Button>
            
            <Button
              variant={showDeleteConfirm ? "destructive" : "outline"}
              onClick={handleDelete}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {showDeleteConfirm ? 'Confirmar' : 'Excluir'}
            </Button>
          </div>
          
          {showDeleteConfirm && (
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
              className="w-full text-xs"
            >
              Cancelar exclusão
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}