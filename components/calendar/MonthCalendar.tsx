"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import type { CalendarGridCell } from "@/lib/calendar-grid";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type MonthCalendarProps = {
  monthLabel: string;
  prevHref: string;
  nextHref: string;
  todayHref: string;
  cells: CalendarGridCell[];
};

export function MonthCalendar({
  monthLabel,
  prevHref,
  nextHref,
  todayHref,
  cells,
}: MonthCalendarProps) {
  const interactiveRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const headingId = useMemo(
    () => `cal-heading-${monthLabel.replace(/\s+/g, "-").toLowerCase()}`,
    [monthLabel]
  );
  const [focused, setFocused] = useState<number>(() =>
    Math.max(
      0,
      cells.findIndex((c) => c.isToday)
    )
  );

  const cols = 7;

  const focusCell = useCallback((idx: number) => {
    const len = cells.length;
    if (len === 0) return;
    const next = ((idx % len) + len) % len;
    setFocused(next);
    interactiveRefs.current[next]?.focus();
  }, [cells.length]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent, idx: number) => {
      let target = idx;
      switch (e.key) {
        case "ArrowRight":
          target = idx + 1;
          e.preventDefault();
          break;
        case "ArrowLeft":
          target = idx - 1;
          e.preventDefault();
          break;
        case "ArrowDown":
          target = idx + cols;
          e.preventDefault();
          break;
        case "ArrowUp":
          target = idx - cols;
          e.preventDefault();
          break;
        case "Home":
          target = Math.floor(idx / cols) * cols;
          e.preventDefault();
          break;
        case "End":
          target = Math.floor(idx / cols) * cols + (cols - 1);
          e.preventDefault();
          break;
        default:
          return;
      }
      focusCell(target);
    },
    [cols, focusCell]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href={prevHref}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Previous month"
          >
            ‹
          </Link>
          <Link
            href={nextHref}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Next month"
          >
            ›
          </Link>
        </div>
        <h2
          id={headingId}
          className="font-serif text-xl font-semibold text-foreground md:text-2xl"
        >
          {monthLabel}
        </h2>
        <Link
          href={todayHref}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Today
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <div
          role="grid"
          aria-labelledby={headingId}
          className="grid min-w-[520px] grid-cols-7 gap-px bg-border md:min-w-0"
        >
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              role="columnheader"
              className="bg-muted/80 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {d}
            </div>
          ))}
          {cells.map((cell, idx) => {
            const showFocus = focused === idx;
            const tabIndex = showFocus ? 0 : -1;
            return (
              <div
                key={cell.dateKey}
                role="gridcell"
                className={cn(
                  "min-h-[104px] bg-background p-2 text-left align-top md:min-h-[120px]",
                  !cell.inMonth && "bg-muted/40 text-muted-foreground",
                  cell.isToday && "ring-2 ring-inset ring-primary"
                )}
                aria-current={cell.isToday ? "date" : undefined}
              >
                <button
                  type="button"
                  ref={(el) => {
                    interactiveRefs.current[idx] = el;
                  }}
                  tabIndex={tabIndex}
                  aria-label={`${cell.dateKey}${cell.isToday ? ", today" : ""}`}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    cell.isToday && "bg-primary text-primary-foreground",
                    showFocus && !cell.isToday && "ring-2 ring-ring ring-offset-2 ring-offset-background"
                  )}
                  onFocus={() => setFocused(idx)}
                  onKeyDown={(e) => onKeyDown(e, idx)}
                >
                  {cell.dayOfMonth}
                </button>
                <div className="mt-2 flex flex-col gap-1">
                  {cell.events.slice(0, 2).map((ev) => (
                    <Link
                      key={ev.id}
                      href={ev.href}
                      className="truncate rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/20 md:text-xs"
                      title={ev.title}
                    >
                      {ev.title}
                    </Link>
                  ))}
                  {cell.events.length > 2 && (
                    <span className="text-[10px] text-muted-foreground md:text-xs">
                      +{cell.events.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Use arrow keys to move between days when a day number is focused.
      </p>
    </div>
  );
}
