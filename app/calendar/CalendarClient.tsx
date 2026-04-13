"use client";

import { useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse: (value: string, formatString: string) => parse(value, formatString, new Date()),
  startOfWeek: (date: Date) => startOfWeek(date, { locale: enUS }),
  getDay,
  locales,
});

export type SerializableEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  resource?: { sourcePageUrl?: string; recurringRule?: string };
};

export function CalendarClient({ events }: { events: SerializableEvent[] }) {
  const parsed = useMemo(
    () =>
      events.map((e) => ({
        id: e.id,
        title: e.title,
        start: new Date(e.start),
        end: e.end ? new Date(e.end) : undefined,
        resource: e.resource,
      })),
    [events]
  );

  return (
    <div
      className="min-h-[560px] text-foreground [&_.rbc-toolbar]:mb-3 [&_.rbc-toolbar]:flex-wrap [&_.rbc-toolbar]:gap-2 [&_.rbc-toolbar_button]:rounded-md [&_.rbc-toolbar_button]:border [&_.rbc-toolbar_button]:border-border [&_.rbc-toolbar_button]:bg-background [&_.rbc-toolbar_button]:px-3 [&_.rbc-toolbar_button]:py-1.5 [&_.rbc-toolbar_button]:text-sm [&_.rbc-header]:border-border [&_.rbc-day-bg]:border-border [&_.rbc-time-content]:border-border [&_.rbc-time-slot]:border-border [&_.rbc-today]:bg-primary/10 [&_.rbc-off-range-bg]:bg-muted/50 [&_.rbc-event]:bg-primary [&_.rbc-event]:text-primary-foreground"
    >
      <Calendar
        localizer={localizer}
        events={parsed}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 560 }}
        views={["month", "week", "agenda"]}
        defaultView="month"
      />
    </div>
  );
}
