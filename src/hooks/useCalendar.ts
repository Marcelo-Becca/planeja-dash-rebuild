import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent, CalendarView, CalendarFilters, CalendarState } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const CALENDAR_STORAGE_KEY = 'planeja_calendar_events';

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

  // Load events from localStorage
  useEffect(() => {
    if (!user) return;
    
    const stored = localStorage.getItem(`${CALENDAR_STORAGE_KEY}_${user.id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const eventsWithDates = parsed.map((event: any) => ({
          ...event,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
        }));
        setEvents(eventsWithDates);
      } catch (error) {
        console.error('Error loading calendar events:', error);
      }
    }
  }, [user]);

  // Save events to localStorage
  const saveEvents = useCallback((eventList: CalendarEvent[]) => {
    if (!user) return;
    
    try {
      localStorage.setItem(`${CALENDAR_STORAGE_KEY}_${user.id}`, JSON.stringify(eventList));
    } catch (error) {
      console.error('Error saving calendar events:', error);
    }
  }, [user]);

  // Event CRUD operations
  const createEvent = useCallback((eventData: Omit<CalendarEvent, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return null;

    const newEvent: CalendarEvent = {
      ...eventData,
      id: crypto.randomUUID(),
      createdBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    saveEvents(updatedEvents);

    toast({
      title: 'Evento criado',
      description: `"${newEvent.title}" foi adicionado ao calendário`,
    });

    return newEvent;
  }, [events, saveEvents, user]);

  const updateEvent = useCallback((eventId: string, updates: Partial<CalendarEvent>) => {
    const updatedEvents = events.map(event =>
      event.id === eventId
        ? { ...event, ...updates, updatedAt: new Date() }
        : event
    );
    
    setEvents(updatedEvents);
    saveEvents(updatedEvents);

    const updatedEvent = updatedEvents.find(e => e.id === eventId);
    if (updatedEvent) {
      toast({
        title: 'Evento atualizado',
        description: `"${updatedEvent.title}" foi modificado`,
      });
    }
  }, [events, saveEvents]);

  const deleteEvent = useCallback((eventId: string) => {
    const eventToDelete = events.find(e => e.id === eventId);
    const updatedEvents = events.filter(event => event.id !== eventId);
    
    setEvents(updatedEvents);
    saveEvents(updatedEvents);

    if (eventToDelete) {
      toast({
        title: 'Evento excluído',
        description: `"${eventToDelete.title}" foi removido do calendário`,
      });
    }
  }, [events, saveEvents]);

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
    
    // Event operations
    createEvent,
    updateEvent,
    deleteEvent,
    
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