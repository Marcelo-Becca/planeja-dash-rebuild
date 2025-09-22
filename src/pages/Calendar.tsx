import { useState } from 'react';
import Layout from '@/components/Layout';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import { MonthView } from '@/components/calendar/MonthView';
import { WeekView } from '@/components/calendar/WeekView';
import { DayView } from '@/components/calendar/DayView';
import { AgendaView } from '@/components/calendar/AgendaView';
import { CreateEventModal } from '@/components/calendar/CreateEventModal';
import { EventDetailPanel } from '@/components/calendar/EventDetailPanel';
import { useCalendar } from '@/hooks/useCalendar';
import { CalendarEvent } from '@/types/calendar';
import { addHours, startOfDay } from 'date-fns';

export default function Calendar() {
  const {
    // State
    currentDate,
    view,
    events,
    selectedEvent,
    isCreating,
    isEditing,
    filters,
    searchQuery,
    
    // Actions
    createEvent,
    updateEvent,
    deleteEvent,
    navigateDate,
    setView,
    setCurrentDate,
    selectEvent,
    startCreating,
    startEditing,
    stopEditing,
    setFilters,
    setSearchQuery,
  } = useCalendar();

  const [showEventDetail, setShowEventDetail] = useState(false);

  // Event handlers
  const handleEventClick = (event: CalendarEvent) => {
    selectEvent(event);
    setShowEventDetail(true);
  };

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    if (view !== 'day') {
      setView('day');
    }
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    const startDate = new Date(date);
    startDate.setHours(hour, 0, 0, 0);
    const endDate = addHours(startDate, 1);
    
    startCreating({
      startDate,
      endDate,
      allDay: false,
    });
  };

  const handleCreateEvent = (initialDate?: Date) => {
    if (initialDate) {
      const startDate = startOfDay(initialDate);
      startDate.setHours(9, 0, 0, 0); // Default to 9 AM
      const endDate = addHours(startDate, 1);
      
      startCreating({
        startDate,
        endDate,
        allDay: false,
      });
    } else {
      startCreating();
    }
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => {
    if (isEditing && selectedEvent) {
      updateEvent(selectedEvent.id, eventData);
    } else {
      createEvent(eventData);
    }
    stopEditing();
  };

  const handleEditEvent = () => {
    setShowEventDetail(false);
    startEditing();
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
    setShowEventDetail(false);
    selectEvent(null);
  };

  const handleDuplicateEvent = (event: CalendarEvent) => {
    const duplicateData = {
      ...event,
      title: `${event.title} (Cópia)`,
      startDate: addHours(event.startDate, 24), // Next day
      endDate: addHours(event.endDate, 24),
      reminders: event.reminders.map(r => ({ ...r, id: crypto.randomUUID(), triggered: false })),
    };
    delete (duplicateData as any).id;
    delete (duplicateData as any).createdBy;
    delete (duplicateData as any).createdAt;
    delete (duplicateData as any).updatedAt;
    
    createEvent(duplicateData);
    setShowEventDetail(false);
  };

  const handleUpdateEventStatus = (eventId: string, status: CalendarEvent['status']) => {
    updateEvent(eventId, { status });
  };

  const renderCalendarView = () => {
    const commonProps = {
      currentDate,
      events,
      onEventClick: handleEventClick,
    };

    switch (view) {
      case 'month':
        return (
          <MonthView
            {...commonProps}
            onDateClick={handleDateClick}
            onCreateEvent={handleCreateEvent}
          />
        );
      case 'week':
        return (
          <WeekView
            {...commonProps}
            onTimeSlotClick={handleTimeSlotClick}
          />
        );
      case 'day':
        return (
          <DayView
            {...commonProps}
            onTimeSlotClick={handleTimeSlotClick}
          />
        );
      case 'agenda':
        return <AgendaView {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          onViewChange={setView}
          onNavigate={navigateDate}
          onDateSelect={setCurrentDate}
          onCreateEvent={() => handleCreateEvent()}
        />

        {/* Filters */}
        <div className="border-b border-border p-4">
          <CalendarFilters
            filters={filters}
            onFiltersChange={setFilters}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Calendar Content */}
        <div className="flex-1 overflow-hidden">
          {renderCalendarView()}
        </div>

        {/* Create/Edit Event Modal */}
        <CreateEventModal
          isOpen={isCreating || isEditing}
          onClose={stopEditing}
          onSave={handleSaveEvent}
          initialData={selectedEvent || undefined}
          isEditing={isEditing}
        />

        {/* Event Detail Panel */}
        <EventDetailPanel
          event={selectedEvent}
          isOpen={showEventDetail}
          onClose={() => {
            setShowEventDetail(false);
            selectEvent(null);
          }}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onDuplicate={handleDuplicateEvent}
          onUpdateStatus={handleUpdateEventStatus}
        />
      </div>
    </Layout>
  );
}