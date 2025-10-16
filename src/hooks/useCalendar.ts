import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent, CalendarView, CalendarFilters, CalendarState } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const defaultFilters: CalendarFilters = {
  projects: [],
  teams: [],
  participants: [],
  types: [],
  priorities: [],
  showMyEventsOnly: false,
};

export function useCalendar() {
  const { user } = useAuth();
  
  const [state, setState] = useState<CalendarState>({
    currentDate: new Date(),
    view: 'month' as CalendarView,
    selectedEvent: null,
    isCreating: false,
    isEditing: false,
    filters: defaultFilters,
    searchQuery: '',
  });

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load events from Supabase
  const fetchEvents = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_date', { ascending: true });

      if (eventsError) throw eventsError;

      // Fetch participants for all events
      const eventIds = eventsData?.map(e => e.id) || [];
      const { data: participantsData, error: participantsError } = await supabase
        .from('calendar_participants')
        .select('event_id, user_id')
        .in('event_id', eventIds);

      if (participantsError) throw participantsError;

      // Fetch reminders for all events
      const { data: remindersData, error: remindersError } = await supabase
        .from('calendar_reminders')
        .select('*')
        .in('event_id', eventIds);

      if (remindersError) throw remindersError;

      // Combine data
      const formattedEvents: CalendarEvent[] = (eventsData || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || undefined,
        startDate: new Date(event.start_date),
        endDate: new Date(event.end_date),
        allDay: event.all_day,
        type: event.type as CalendarEvent['type'],
        location: event.location || undefined,
        participants: participantsData?.filter(p => p.event_id === event.id).map(p => p.user_id) || [],
        projectId: event.project_id || undefined,
        teamId: event.team_id || undefined,
        taskId: event.task_id || undefined,
        priority: event.priority as CalendarEvent['priority'],
        reminders: remindersData?.filter(r => r.event_id === event.id).map(r => ({
          id: r.id,
          minutes: r.minutes,
          triggered: r.triggered
        })) || [],
        color: event.color || undefined,
        status: event.status as CalendarEvent['status'],
        createdBy: event.created_by,
        createdAt: new Date(event.created_at),
        updatedAt: new Date(event.updated_at),
      }));

      setEvents(formattedEvents);
    } catch (error: any) {
      console.error('Error fetching calendar events:', error);
      toast({
        title: 'Erro ao carregar eventos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load events on mount and subscribe to changes
  useEffect(() => {
    fetchEvents();

    // Subscribe to real-time changes
    const eventsChannel = supabase
      .channel('calendar-events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events'
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    const participantsChannel = supabase
      .channel('calendar-participants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_participants'
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    const remindersChannel = supabase
      .channel('calendar-reminders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_reminders'
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(remindersChannel);
    };
  }, [fetchEvents]);

  // Event CRUD operations
  const createEvent = useCallback(async (eventData: Omit<CalendarEvent, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Garante que o usuário está autenticado antes de criar (evita RLS por auth.uid() nulo)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Você precisa estar logado',
          description: 'Faça login para criar eventos.',
          variant: 'destructive',
        });
        return null;
      }

      // Insert event (created_by é definido via DEFAULT auth.uid() no banco)
      const { data: event, error: eventError } = await supabase
        .from('calendar_events')
        .insert({
          title: eventData.title,
          description: eventData.description || null,
          start_date: eventData.startDate.toISOString(),
          end_date: eventData.endDate.toISOString(),
          all_day: eventData.allDay,
          type: eventData.type,
          location: eventData.location || null,
          project_id: eventData.projectId || null,
          team_id: eventData.teamId || null,
          task_id: eventData.taskId || null,
          priority: eventData.priority,
          color: eventData.color || null,
          status: eventData.status,
        })
        .select('id, title')
        .single();

      if (eventError) throw eventError;

      // Insert participants
      if (eventData.participants.length > 0) {
        const participantsToInsert = eventData.participants.map(userId => ({
          event_id: event.id,
          user_id: userId,
        }));

        const { error: participantsError } = await supabase
          .from('calendar_participants')
          .insert(participantsToInsert);

        if (participantsError) throw participantsError;
      }

      // Insert reminders
      if (eventData.reminders.length > 0) {
        const remindersToInsert = eventData.reminders.map(reminder => ({
          event_id: event.id,
          minutes: reminder.minutes,
          triggered: false,
        }));

        const { error: remindersError } = await supabase
          .from('calendar_reminders')
          .insert(remindersToInsert);

        if (remindersError) throw remindersError;
      }

      toast({
        title: 'Evento criado',
        description: `"${event.title}" foi adicionado ao calendário`,
      });

      await fetchEvents();
      return event;
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: 'Erro ao criar evento',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  }, [fetchEvents]);

  const updateEvent = useCallback(async (eventId: string, updates: Partial<CalendarEvent>) => {
    try {
      // Update event
      const eventUpdates: any = {};
      if (updates.title !== undefined) eventUpdates.title = updates.title;
      if (updates.description !== undefined) eventUpdates.description = updates.description || null;
      if (updates.startDate !== undefined) eventUpdates.start_date = updates.startDate.toISOString();
      if (updates.endDate !== undefined) eventUpdates.end_date = updates.endDate.toISOString();
      if (updates.allDay !== undefined) eventUpdates.all_day = updates.allDay;
      if (updates.type !== undefined) eventUpdates.type = updates.type;
      if (updates.location !== undefined) eventUpdates.location = updates.location || null;
      if (updates.projectId !== undefined) eventUpdates.project_id = updates.projectId || null;
      if (updates.teamId !== undefined) eventUpdates.team_id = updates.teamId || null;
      if (updates.taskId !== undefined) eventUpdates.task_id = updates.taskId || null;
      if (updates.priority !== undefined) eventUpdates.priority = updates.priority;
      if (updates.color !== undefined) eventUpdates.color = updates.color || null;
      if (updates.status !== undefined) eventUpdates.status = updates.status;

      const { error: eventError } = await supabase
        .from('calendar_events')
        .update(eventUpdates)
        .eq('id', eventId);

      if (eventError) throw eventError;

      // Update participants if provided
      if (updates.participants !== undefined) {
        // Delete existing participants
        const { error: deleteError } = await supabase
          .from('calendar_participants')
          .delete()
          .eq('event_id', eventId);

        if (deleteError) throw deleteError;

        // Insert new participants
        if (updates.participants.length > 0) {
          const participantsToInsert = updates.participants.map(userId => ({
            event_id: eventId,
            user_id: userId,
          }));

          const { error: insertError } = await supabase
            .from('calendar_participants')
            .insert(participantsToInsert);

          if (insertError) throw insertError;
        }
      }

      // Update reminders if provided
      if (updates.reminders !== undefined) {
        // Delete existing reminders
        const { error: deleteError } = await supabase
          .from('calendar_reminders')
          .delete()
          .eq('event_id', eventId);

        if (deleteError) throw deleteError;

        // Insert new reminders
        if (updates.reminders.length > 0) {
          const remindersToInsert = updates.reminders.map(reminder => ({
            event_id: eventId,
            minutes: reminder.minutes,
            triggered: reminder.triggered || false,
          }));

          const { error: insertError } = await supabase
            .from('calendar_reminders')
            .insert(remindersToInsert);

          if (insertError) throw insertError;
        }
      }

      toast({
        title: 'Evento atualizado',
        description: 'As alterações foram salvas com sucesso',
      });

      await fetchEvents();
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast({
        title: 'Erro ao atualizar evento',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [fetchEvents]);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: 'Evento excluído',
        description: 'O evento foi removido do calendário',
      });

      await fetchEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Erro ao excluir evento',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [fetchEvents]);

  // Navigation
  const navigateDate = useCallback((direction: 'prev' | 'next' | 'today') => {
    setState(prev => {
      const current = new Date(prev.currentDate);
      
      switch (direction) {
        case 'today':
          return { ...prev, currentDate: new Date() };
        case 'prev':
          switch (prev.view) {
            case 'month':
              current.setMonth(current.getMonth() - 1);
              break;
            case 'week':
              current.setDate(current.getDate() - 7);
              break;
            case 'day':
              current.setDate(current.getDate() - 1);
              break;
          }
          break;
        case 'next':
          switch (prev.view) {
            case 'month':
              current.setMonth(current.getMonth() + 1);
              break;
            case 'week':
              current.setDate(current.getDate() + 7);
              break;
            case 'day':
              current.setDate(current.getDate() + 1);
              break;
          }
          break;
      }
      
      return { ...prev, currentDate: current };
    });
  }, []);

  const setView = useCallback((view: CalendarView) => {
    setState(prev => ({ ...prev, view }));
  }, []);

  const setCurrentDate = useCallback((date: Date) => {
    setState(prev => ({ ...prev, currentDate: date }));
  }, []);

  // Event selection and editing
  const selectEvent = useCallback((event: CalendarEvent | null) => {
    setState(prev => ({ ...prev, selectedEvent: event }));
  }, []);

  const startCreating = useCallback((initialData?: Partial<CalendarEvent>) => {
    setState(prev => ({ 
      ...prev, 
      isCreating: true, 
      selectedEvent: initialData ? { ...initialData } as CalendarEvent : null 
    }));
  }, []);

  const startEditing = useCallback(() => {
    setState(prev => ({ ...prev, isEditing: true }));
  }, []);

  const stopEditing = useCallback(() => {
    setState(prev => ({ ...prev, isCreating: false, isEditing: false, selectedEvent: null }));
  }, []);

  // Filtering
  const setFilters = useCallback((filters: Partial<CalendarFilters>) => {
    setState(prev => ({ ...prev, filters: { ...prev.filters, ...filters } }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  // Filter events based on current filters and search
  const filteredEvents = useCallback(() => {
    return events.filter(event => {
      // Search query filter
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        if (!event.title.toLowerCase().includes(query) && 
            !event.description?.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Project filter
      if (state.filters.projects.length > 0 && event.projectId) {
        if (!state.filters.projects.includes(event.projectId)) return false;
      }

      // Team filter
      if (state.filters.teams.length > 0 && event.teamId) {
        if (!state.filters.teams.includes(event.teamId)) return false;
      }

      // Participant filter
      if (state.filters.participants.length > 0) {
        const hasParticipant = state.filters.participants.some(p => 
          event.participants.includes(p)
        );
        if (!hasParticipant) return false;
      }

      // Type filter
      if (state.filters.types.length > 0) {
        if (!state.filters.types.includes(event.type)) return false;
      }

      // Priority filter
      if (state.filters.priorities.length > 0) {
        if (!state.filters.priorities.includes(event.priority)) return false;
      }

      // My events only filter
      if (state.filters.showMyEventsOnly && user) {
        if (!event.participants.includes(user.id) && event.createdBy !== user.id) {
          return false;
        }
      }

      return true;
    });
  }, [events, state.filters, state.searchQuery, user]);

  // Reminders system
  useEffect(() => {
    if (!remindersEnabled) return;

    const checkReminders = () => {
      const now = new Date();
      
      events.forEach(event => {
        event.reminders.forEach(reminder => {
          if (reminder.triggered) return;
          
          const reminderTime = new Date(event.startDate.getTime() - (reminder.minutes * 60 * 1000));
          
          if (now >= reminderTime && now < event.startDate) {
            reminder.triggered = true;
            
            toast({
              title: `Lembrete: ${event.title}`,
              description: `Evento em ${reminder.minutes} minutos`,
              duration: 10000,
            });
          }
        });
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [events, remindersEnabled]);

  return {
    // State
    ...state,
    events: filteredEvents(),
    allEvents: events,
    remindersEnabled,
    loading,
    
    // Event operations
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents: fetchEvents,
    
    // Navigation
    navigateDate,
    setView,
    setCurrentDate,
    
    // Selection and editing
    selectEvent,
    startCreating,
    startEditing,
    stopEditing,
    
    // Filtering
    setFilters,
    setSearchQuery,
    
    // Settings
    setRemindersEnabled,
  };
}