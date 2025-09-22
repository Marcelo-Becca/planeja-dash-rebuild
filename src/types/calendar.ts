export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  type: 'meeting' | 'deadline' | 'reminder' | 'block';
  location?: string;
  participants: string[]; // User IDs
  projectId?: string;
  teamId?: string;
  taskId?: string;
  priority: 'low' | 'medium' | 'high';
  reminders: EventReminder[];
  recurrence?: EventRecurrence;
  color?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventReminder {
  id: string;
  minutes: number; // minutes before event
  triggered?: boolean;
}

export interface EventRecurrence {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // every X days/weeks/months/years
  endDate?: Date;
  occurrences?: number; // max occurrences
  exceptions: Date[]; // specific dates to skip
}

export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export interface CalendarFilters {
  projects: string[];
  teams: string[];
  participants: string[];
  types: CalendarEvent['type'][];
  priorities: CalendarEvent['priority'][];
  showMyEventsOnly: boolean;
}

export interface CalendarState {
  currentDate: Date;
  view: CalendarView;
  selectedEvent: CalendarEvent | null;
  isCreating: boolean;
  isEditing: boolean;
  filters: CalendarFilters;
  searchQuery: string;
}