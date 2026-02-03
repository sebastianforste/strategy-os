
"use client";

import React, { useState } from "react";
import { Calendar, momentLocalizer, Views, View } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { motion, AnimatePresence } from "framer-motion";

// Setup the localizer
const localizer = momentLocalizer(moment);
// Use any here to bypass strict generic checks from the library for wrapper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DragAndDropCalendar = withDragAndDrop(Calendar as any) as any;

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventResize?: (event: any) => void;
  onEventDrop?: (event: any) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: any) => void;
}

export default function CalendarView({ events, onSelectEvent, onSelectSlot, onEventDrop }: CalendarViewProps) {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  // Custom styling for events
  const eventPropGetter = (event: CalendarEvent) => {
    const isPast = event.end < new Date();
    return {
      style: {
        backgroundColor: isPast ? "rgba(255, 255, 255, 0.1)" : "rgba(139, 92, 246, 0.2)",
        border: "1px solid",
        borderColor: isPast ? "rgba(255, 255, 255, 0.2)" : "rgba(139, 92, 246, 0.5)",
        color: isPast ? "#a3a3a3" : "#e9d5ff",
        borderRadius: "8px",
        fontSize: "12px",
        padding: "2px 5px",
      },
    };
  };

  return (
    <div className="h-[600px] bg-black/40 border border-white/10 rounded-xl p-4 calendar-dark-theme">
        <style jsx global>{`
            .calendar-dark-theme .rbc-calendar { color: #d4d4d4; font-family: 'Inter', sans-serif; }
            .calendar-dark-theme .rbc-off-range-bg { background: transparent; }
            .calendar-dark-theme .rbc-off-range { color: #525252; }
            .calendar-dark-theme .rbc-header { border-bottom: 1px solid rgba(255,255,255,0.1); padding: 10px; text-transform: uppercase; font-size: 10px; letter-spacing: 2px; color: #737373; }
            .calendar-dark-theme .rbc-month-view { border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; }
            .calendar-dark-theme .rbc-day-bg { border-left: 1px solid rgba(255,255,255,0.1); }
            .calendar-dark-theme .rbc-month-row { border-top: 1px solid rgba(255,255,255,0.1); }
            .calendar-dark-theme .rbc-date-cell { padding: 8px; font-size: 12px; color: #a3a3a3; }
            .calendar-dark-theme .rbc-today { background-color: rgba(139, 92, 246, 0.05); }
            .calendar-dark-theme .rbc-toolbar button { color: #d4d4d4; border: 1px solid rgba(255,255,255,0.1); }
            .calendar-dark-theme .rbc-toolbar button:hover { background-color: rgba(255,255,255,0.1); }
            .calendar-dark-theme .rbc-toolbar button.rbc-active { background-color: rgba(139, 92, 246, 0.2); color: #d8b4fe; border-color: rgba(139, 92, 246, 0.5); }
            .calendar-dark-theme .rbc-show-more { background-color: transparent; color: #a3a3a3; font-size: 10px; }
        `}</style>
      <DragAndDropCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        eventPropGetter={eventPropGetter}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        onEventDrop={onEventDrop}
        resizable={false} // Simplify for now
        selectable
      />
    </div>
  );
}
