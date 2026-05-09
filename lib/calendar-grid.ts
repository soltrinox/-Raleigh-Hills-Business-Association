import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday as dfIsToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { CalendarInstance } from "@/lib/events";
import { calendarInstanceToPublicSlug, eventHref } from "@/lib/events";

export type CalendarGridCell = {
  dateKey: string;
  dayOfMonth: number;
  inMonth: boolean;
  isToday: boolean;
  events: {
    id: string;
    title: string;
    slug: string | null;
    href: string;
  }[];
};

function cleanTitle(title: string): string {
  const t = title.replace(/^\|\s*/, "").trim();
  if (
    !t ||
    t.includes("| Raleigh Hills Business Association")
  ) {
    return "RHBA event";
  }
  return t.length > 42 ? `${t.slice(0, 39)}…` : t;
}

export function buildCalendarGrid(
  year: number,
  monthIndex: number,
  instancesInMonth: CalendarInstance[]
): CalendarGridCell[] {
  const monthDate = new Date(year, monthIndex, 1);
  const gridStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const byKey = new Map<string, CalendarInstance[]>();
  for (const inst of instancesInMonth) {
    const key = format(inst.start, "yyyy-MM-dd");
    const arr = byKey.get(key) ?? [];
    arr.push(inst);
    byKey.set(key, arr);
  }

  return days.map((d) => {
    const dateKey = format(d, "yyyy-MM-dd");
    const rawList = byKey.get(dateKey) ?? [];
    const sorted = [...rawList].sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    );
    const events = sorted.map((inst) => {
      const slug = calendarInstanceToPublicSlug(inst);
      const title = cleanTitle(inst.title);
      const href =
        slug != null ? eventHref(slug) : inst.resource?.sourcePageUrl ?? "#";
      return {
        id: inst.id,
        title,
        slug,
        href,
      };
    });
    return {
      dateKey,
      dayOfMonth: d.getDate(),
      inMonth: isSameMonth(d, monthDate),
      isToday: dfIsToday(d),
      events,
    };
  });
}

export function ymFromSearchParam(
  ym: string | undefined,
  fallback: Date = new Date()
): { year: number; monthIndex: number; ymParam: string } {
  if (ym && /^\d{4}-\d{2}$/.test(ym)) {
    const [ys, ms] = ym.split("-");
    const year = Number(ys);
    const monthIndex = Number(ms) - 1;
    if (
      Number.isFinite(year) &&
      Number.isFinite(monthIndex) &&
      monthIndex >= 0 &&
      monthIndex <= 11
    ) {
      return { year, monthIndex, ymParam: ym };
    }
  }
  return {
    year: fallback.getFullYear(),
    monthIndex: fallback.getMonth(),
    ymParam: format(fallback, "yyyy-MM"),
  };
}

export function adjacentYm(year: number, monthIndex: number, delta: number): string {
  const d = new Date(year, monthIndex + delta, 1);
  return format(d, "yyyy-MM");
}
