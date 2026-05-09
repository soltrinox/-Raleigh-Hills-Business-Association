"use client";

import Link from "next/link";
import { format } from "date-fns";
import type { CalendarGridCell } from "@/lib/calendar-grid";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export type CalendarMiniProps = {
  monthLabel: string;
  prevHref: string;
  nextHref: string;
  todayHref: string;
  cells: CalendarGridCell[];
};

export function CalendarMini({
  monthLabel,
  prevHref,
  nextHref,
  todayHref,
  cells,
}: CalendarMiniProps) {
  const scrollToDay = (cell: CalendarGridCell) => {
    const first = cell.events.find((e) => e.slug);
    if (!first?.slug) return;
    const el = document.getElementById(`evt-${first.slug}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="w-full max-w-[280px] rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Link
          href={prevHref}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Previous month"
        >
          ‹
        </Link>
        <div className="text-center">
          <p className="font-serif text-sm font-semibold">{monthLabel}</p>
          <Link href={todayHref} className="text-[10px] text-primary underline-offset-4 hover:underline">
            Today
          </Link>
        </div>
        <Link
          href={nextHref}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Next month"
        >
          ›
        </Link>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] font-medium uppercase text-muted-foreground">
        {WEEKDAYS.map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-y-1">
        {cells.map((cell) => (
          <button
            key={cell.dateKey}
            type="button"
            onClick={() => scrollToDay(cell)}
            disabled={cell.events.length === 0 || !cell.events.some((e) => e.slug)}
            className={cn(
              "relative mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-full text-xs font-medium transition-colors",
              !cell.inMonth && "text-muted-foreground/50",
              cell.isToday && "bg-primary text-primary-foreground",
              cell.events.length > 0 && cell.inMonth && !cell.isToday && "hover:bg-muted",
              (!cell.events.length || !cell.events.some((e) => e.slug)) &&
                "cursor-default opacity-60 hover:bg-transparent"
            )}
            aria-label={`${format(new Date(cell.dateKey + "T12:00:00"), "MMMM d, yyyy")}`}
          >
            {cell.dayOfMonth}
            {cell.events.length > 0 && (
              <span className="absolute bottom-0.5 flex gap-0.5" aria-hidden>
                {cell.events.slice(0, 3).map((e) => (
                  <span
                    key={e.id}
                    className={cn(
                      "h-1 w-1 rounded-full",
                      cell.isToday ? "bg-primary-foreground/80" : "bg-primary"
                    )}
                  />
                ))}
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-snug text-muted-foreground">
        Tap a dot day to scroll to that event in the list beside this calendar.
      </p>
    </div>
  );
}
