import { addMonths, endOfMonth, parseISO, startOfMonth, format, getDay } from "date-fns";
import eventsJson from "@/data/events.json";

export type StoredEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  description?: string;
  sourcePageUrl?: string;
  confidence?: string;
  recurringRule?: string;
};

export type EventsFile = {
  manual?: StoredEvent[];
  events?: StoredEvent[];
  generatedAt?: string;
};

export type CalendarInstance = {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  resource?: { sourcePageUrl?: string; recurringRule?: string };
};

export function loadRawEvents(): StoredEvent[] {
  try {
    const data = eventsJson as EventsFile;
    const manual = Array.isArray(data.manual) ? data.manual : [];
    const auto = Array.isArray(data.events) ? data.events : [];
    return [...manual, ...auto];
  } catch {
    return [];
  }
}

function nthWeekdayOfMonth(year: number, monthIndex: number, weekday: number, n: number): Date | null {
  const start = startOfMonth(new Date(year, monthIndex, 1));
  let count = 0;
  for (let d = 1; d <= endOfMonth(start).getDate(); d++) {
    const dt = new Date(year, monthIndex, d);
    if (getDay(dt) === weekday) {
      count++;
      if (count === n) return dt;
    }
  }
  return null;
}

const WEEKDAYS: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export function expandRecurringEvents(
  events: StoredEvent[],
  from: Date = new Date(),
  horizonMonths = 6
): CalendarInstance[] {
  const out: CalendarInstance[] = [];
  const until = addMonths(from, horizonMonths);

  for (const ev of events) {
    if (!ev.recurringRule) {
      out.push({
        id: ev.id,
        title: ev.title,
        start: parseISO(ev.start),
        end: ev.end ? parseISO(ev.end) : undefined,
        resource: { sourcePageUrl: ev.sourcePageUrl, recurringRule: ev.recurringRule },
      });
      continue;
    }

    const rule = ev.recurringRule.toLowerCase();
    const m = rule.match(/(\d{1,2})(st|nd|rd|th)\s+(\w+)/);
    if (!m) {
      out.push({
        id: ev.id,
        title: ev.title,
        start: parseISO(ev.start),
        resource: { sourcePageUrl: ev.sourcePageUrl, recurringRule: ev.recurringRule },
      });
      continue;
    }

    const n = parseInt(m[1], 10);
    const wd = WEEKDAYS[m[3]];
    if (wd === undefined || n < 1 || n > 5) {
      out.push({
        id: ev.id,
        title: ev.title,
        start: parseISO(ev.start),
        resource: { sourcePageUrl: ev.sourcePageUrl, recurringRule: ev.recurringRule },
      });
      continue;
    }

    let cursor = startOfMonth(from);
    while (cursor < until) {
      const occ = nthWeekdayOfMonth(cursor.getFullYear(), cursor.getMonth(), wd, n);
      if (occ && occ >= from && occ < until) {
        const atHour = parseISO(ev.start);
        occ.setHours(atHour.getHours(), atHour.getMinutes(), 0, 0);
        out.push({
          id: `${ev.id}-${format(occ, "yyyy-MM-dd")}`,
          title: ev.title,
          start: occ,
          resource: { sourcePageUrl: ev.sourcePageUrl, recurringRule: ev.recurringRule },
        });
      }
      cursor = addMonths(cursor, 1);
    }
  }

  return out;
}

export type EventCardDTO = {
  id: string;
  title: string;
  start: string;
  end?: string;
  sourcePageUrl?: string;
  recurringRule?: string;
};

function cleanListingTitle(title: string): string {
  const t = title.replace(/^\|\s*/, '').trim();
  if (!t || t === 'Raleigh Hills Business Association' || t.includes('| Raleigh Hills Business Association')) {
    return 'RHBA event';
  }
  return t;
}

/**
 * Expanded recurring instances, upcoming-only, deduped by start + title, sorted by start.
 */
export function getExpandedUpcomingEventCards(horizonMonths = 8): EventCardDTO[] {
  const raw = loadRawEvents();
  const expanded = expandRecurringEvents(raw, new Date(), horizonMonths);
  const now = new Date();
  const seen = new Set<string>();
  const out: EventCardDTO[] = [];

  for (const e of expanded) {
    if (e.start < now) continue;
    const title = cleanListingTitle(e.title);
    const startIso = e.start.toISOString();
    const key = `${startIso}|${title.toLowerCase().replace(/\s+/g, ' ').trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: e.id,
      title,
      start: startIso,
      end: e.end?.toISOString(),
      sourcePageUrl: e.resource?.sourcePageUrl,
      recurringRule: e.resource?.recurringRule,
    });
  }

  out.sort((a, b) => a.start.localeCompare(b.start));
  return out;
}
