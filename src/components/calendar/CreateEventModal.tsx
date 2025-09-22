import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarEvent } from '@/types/calendar';
import { CalendarIcon, Clock, MapPin, Users, Bell, Repeat, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useLocalData } from '@/hooks/useLocalData';
import MultiUserSelector from '@/components/MultiUserSelector';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Partial<CalendarEvent>;
  isEditing?: boolean;
}

export function CreateEventModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: CreateEventModalProps) {
  const { projects, teams } = useLocalData();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    allDay: false,
    type: 'meeting' as CalendarEvent['type'],
    location: '',
    participants: [] as string[],
    projectId: '',
    teamId: '',
    taskId: '',
    priority: 'medium' as CalendarEvent['priority'],
    status: 'scheduled' as CalendarEvent['status'],
    reminders: [{ id: crypto.randomUUID(), minutes: 15 }],
    recurrence: undefined,
    color: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with provided data
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        startDate: initialData.startDate || new Date(),
        endDate: initialData.endDate || new Date(Date.now() + 60 * 60 * 1000),
        allDay: initialData.allDay || false,
        type: initialData.type || 'meeting',
        location: initialData.location || '',
        participants: initialData.participants || [],
        projectId: initialData.projectId || 'none',
        teamId: initialData.teamId || 'none',
        taskId: initialData.taskId || '',
        priority: initialData.priority || 'medium',
        status: initialData.status || 'scheduled',
        reminders: initialData.reminders?.map(r => ({ id: crypto.randomUUID(), minutes: r.minutes })) || [{ id: crypto.randomUUID(), minutes: 15 }],
        recurrence: initialData.recurrence,
        color: initialData.color || '',
      });
    } else {
      // Reset form for new event
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      setFormData({
        title: '',
        description: '',
        startDate: now,
        endDate: oneHourLater,
        allDay: false,
        type: 'meeting',
        location: '',
        participants: [],
        projectId: 'none',
        teamId: 'none',
        taskId: '',
        priority: 'medium',
        status: 'scheduled',
        reminders: [{ id: crypto.randomUUID(), minutes: 15 }],
        recurrence: undefined,
        color: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (formData.endDate <= formData.startDate) {
      newErrors.endDate = 'Data/hora de término deve ser posterior ao início';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    onSave({
      ...formData,
      projectId: formData.projectId === 'none' ? '' : formData.projectId,
      teamId: formData.teamId === 'none' ? '' : formData.teamId,
      reminders: formData.reminders.map(r => ({ ...r, triggered: false })),
    });

    onClose();
  };

  const addReminder = () => {
    setFormData(prev => ({
      ...prev,
      reminders: [
        ...prev.reminders,
        { id: crypto.randomUUID(), minutes: 15 }
      ]
    }));
  };

  const removeReminder = (id: string) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r.id !== id)
    }));
  };

  const updateReminder = (id: string, minutes: number) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.map(r => 
        r.id === id ? { ...r, minutes } : r
      )
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Evento' : 'Criar Novo Evento'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nome do evento..."
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detalhes do evento..."
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data/Hora de Início</Label>
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.startDate, 'dd/MM/yyyy', { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => {
                        if (date) {
                          const newStart = new Date(date);
                          newStart.setHours(formData.startDate.getHours());
                          newStart.setMinutes(formData.startDate.getMinutes());
                          
                          setFormData(prev => ({
                            ...prev,
                            startDate: newStart,
                            endDate: new Date(newStart.getTime() + (prev.endDate.getTime() - prev.startDate.getTime()))
                          }));
                        }
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                {!formData.allDay && (
                  <Input
                    type="time"
                    value={format(formData.startDate, 'HH:mm')}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newStart = new Date(formData.startDate);
                      newStart.setHours(parseInt(hours), parseInt(minutes));
                      
                      setFormData(prev => ({
                        ...prev,
                        startDate: newStart,
                        endDate: new Date(newStart.getTime() + (prev.endDate.getTime() - prev.startDate.getTime()))
                      }));
                    }}
                    className="w-24"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data/Hora de Término</Label>
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.endDate, 'dd/MM/yyyy', { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => {
                        if (date) {
                          const newEnd = new Date(date);
                          newEnd.setHours(formData.endDate.getHours());
                          newEnd.setMinutes(formData.endDate.getMinutes());
                          setFormData(prev => ({ ...prev, endDate: newEnd }));
                        }
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                {!formData.allDay && (
                  <Input
                    type="time"
                    value={format(formData.endDate, 'HH:mm')}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newEnd = new Date(formData.endDate);
                      newEnd.setHours(parseInt(hours), parseInt(minutes));
                      setFormData(prev => ({ ...prev, endDate: newEnd }));
                    }}
                    className="w-24"
                  />
                )}
              </div>
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.allDay}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allDay: checked }))}
            />
            <Label>Evento de dia inteiro</Label>
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formData.type} onValueChange={(value: CalendarEvent['type']) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Reunião</SelectItem>
                  <SelectItem value="deadline">Entrega</SelectItem>
                  <SelectItem value="reminder">Lembrete</SelectItem>
                  <SelectItem value="block">Bloqueio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value: CalendarEvent['priority']) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Local</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Sala, link da reunião, endereço..."
            />
          </div>

          {/* Project and Team */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Projeto</Label>
              <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum projeto</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Equipe</Label>
              <Select value={formData.teamId} onValueChange={(value) => setFormData(prev => ({ ...prev, teamId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma equipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma equipe</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <Label>Participantes</Label>
            <MultiUserSelector
              selectedUsers={formData.participants}
              onSelectionChange={(users) => setFormData(prev => ({ ...prev, participants: users }))}
              placeholder="Adicionar participantes..."
            />
          </div>

          {/* Reminders */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Lembretes</Label>
              <Button type="button" variant="outline" size="sm" onClick={addReminder}>
                <Bell className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {formData.reminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center space-x-2">
                  <Select
                    value={reminder.minutes.toString()}
                    onValueChange={(value) => updateReminder(reminder.id, parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No horário</SelectItem>
                      <SelectItem value="5">5 minutos antes</SelectItem>
                      <SelectItem value="15">15 minutos antes</SelectItem>
                      <SelectItem value="30">30 minutos antes</SelectItem>
                      <SelectItem value="60">1 hora antes</SelectItem>
                      <SelectItem value="1440">1 dia antes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeReminder(reminder.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? 'Salvar Alterações' : 'Criar Evento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}