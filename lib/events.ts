import {
  addMonths,
  endOfMonth,
  parseISO,
  startOfMonth,
  format,
  getDay,
  isSameMonth,
  startOfDay,
} from "date-fns";
import type { CalendarEvent } from "@/lib/types";
import { ORG_SOCIAL } from "@/lib/data";
import eventsJson from "@/data/events.json";

/** Fallback social URLs merged into events when per-event links omit IG/FB. */
export const SOCIAL_FALLBACK = ORG_SOCIAL;

export type StoredEvent = CalendarEvent;

export type EventsFile = {
  manual?: StoredEvent[];
  events?: StoredEvent[];
  generatedAt?: string;
};

export type CalendarResource = {
  sourcePageUrl?: string;
  recurringRule?: string;
  slug?: string;
  storedEventId?: string;
};

export type CalendarInstance = {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  resource?: CalendarResource;
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

/** Stable slug from title + start (fallback when `slug` omitted). */
export function slugify(title: string, startIso?: string): string {
  const base = title
    .replace(/\|.*$/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const suffix = startIso
    ? format(parseISO(startIso), "yyyy-MM-dd")
    : "";
  const combined = suffix ? `${base}-${suffix}` : base;
  return combined || "event";
}

export function baseSlugForStored(ev: StoredEvent): string {
  if (ev.slug?.trim()) return ev.slug.trim();
  return slugify(ev.title, ev.start);
}

/** Public URL segment for a calendar instance (recurring → baseSlug-yyyy-MM-dd). */
export function instanceSlug(ev: StoredEvent, occurrenceStart: Date): string {
  const base = baseSlugForStored(ev);
  if (ev.recurringRule) {
    return `${base}-${format(occurrenceStart, "yyyy-MM-dd")}`;
  }
  return base;
}

export function eventHref(slug: string): string {
  return `/events/${encodeURIComponent(slug)}`;
}

function nthWeekdayOfMonth(
  year: number,
  monthIndex: number,
  weekday: number,
  n: number
): Date | null {
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
    const baseSlug = ev.slug?.trim() || undefined;

    if (!ev.recurringRule) {
      out.push({
        id: ev.id,
        title: ev.title,
        start: parseISO(ev.start),
        end: ev.end ? parseISO(ev.end) : undefined,
        allDay: ev.allDay,
        resource: {
          sourcePageUrl: ev.sourcePageUrl,
          recurringRule: ev.recurringRule,
          slug: baseSlug,
          storedEventId: ev.id,
        },
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
        allDay: ev.allDay,
        resource: {
          sourcePageUrl: ev.sourcePageUrl,
          recurringRule: ev.recurringRule,
          slug: baseSlug,
          storedEventId: ev.id,
        },
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
        resource: {
          sourcePageUrl: ev.sourcePageUrl,
          recurringRule: ev.recurringRule,
          slug: baseSlug,
          storedEventId: ev.id,
        },
      });
      continue;
    }

    let cursor = startOfMonth(from);
    while (cursor < until) {
      const occ = nthWeekdayOfMonth(cursor.getFullYear(), cursor.getMonth(), wd, n);
      if (occ && occ >= startOfDay(from) && occ < until) {
        const atHour = parseISO(ev.start);
        occ.setHours(atHour.getHours(), atHour.getMinutes(), 0, 0);
        out.push({
          id: `${ev.id}-${format(occ, "yyyy-MM-dd")}`,
          title: ev.title,
          start: occ,
          end: ev.end ? parseISO(ev.end) : undefined,
          allDay: ev.allDay,
          resource: {
            sourcePageUrl: ev.sourcePageUrl,
            recurringRule: ev.recurringRule,
            slug: baseSlug,
            storedEventId: ev.id,
          },
        });
      }
      cursor = addMonths(cursor, 1);
    }
  }

  return out;
}

/** Expand occurrences overlapping [rangeStart, rangeEnd). */
export function expandRecurringEventsInRange(
  events: StoredEvent[],
  rangeStart: Date,
  rangeEnd: Date
): CalendarInstance[] {
  const from = startOfMonth(addMonths(rangeStart, -1));
  const months =
    (rangeEnd.getFullYear() - from.getFullYear()) * 12 +
    (rangeEnd.getMonth() - from.getMonth()) +
    3;
  const horizon = Math.max(6, months);
  const expanded = expandRecurringEvents(events, from, horizon);
  return expanded.filter((e) => e.start >= rangeStart && e.start < rangeEnd);
}

export function calendarInstanceToPublicSlug(inst: CalendarInstance): string | null {
  const slug = inst.resource?.slug;
  if (!slug) return null;
  if (inst.resource?.recurringRule) {
    return `${slug}-${format(inst.start, "yyyy-MM-dd")}`;
  }
  return slug;
}

export function getEventsForMonth(year: number, monthIndex: number): CalendarInstance[] {
  const rangeStart = startOfMonth(new Date(year, monthIndex, 1));
  const rangeEnd = addMonths(rangeStart, 1);
  const raw = loadRawEvents();
  return expandRecurringEventsInRange(raw, rangeStart, rangeEnd).sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );
}

function storedById(): Map<string, StoredEvent> {
  const m = new Map<string, StoredEvent>();
  for (const ev of loadRawEvents()) {
    m.set(ev.id, ev);
  }
  return m;
}

/**
 * Resolve slug to a display-ready event + occurrence date.
 * Supports recurring suffix: `${baseSlug}-${yyyy-MM-dd}`.
 */
export function getEventBySlug(slug: string): {
  event: StoredEvent;
  occurrenceStart: Date;
  occurrenceEnd?: Date;
  publicSlug: string;
} | null {
  const decoded = decodeURIComponent(slug);
  const recurMatch = decoded.match(/^(.+)-(\d{4}-\d{2}-\d{2})$/);
  const raw = loadRawEvents();
  const byId = storedById();

  if (recurMatch) {
    const [, baseSlug, datePart] = recurMatch;
    const parts = datePart.split("-").map(Number);
    const y = parts[0]!;
    const mo = parts[1]!;
    const d = parts[2]!;
    const base = raw.find(
      (e) => e.slug?.trim() === baseSlug.trim() && Boolean(e.recurringRule)
    );
    if (!base) return null;
    const atHour = parseISO(base.start);
    const start = new Date(y, mo - 1, d);
    start.setHours(atHour.getHours(), atHour.getMinutes(), 0, 0);
    let end: Date | undefined;
    if (base.end) {
      const e = parseISO(base.end);
      const dur = e.getTime() - atHour.getTime();
      end = new Date(start.getTime() + dur);
    }
    return {
      event: base,
      occurrenceStart: start,
      occurrenceEnd: end,
      publicSlug: decoded,
    };
  }

  const direct = raw.find((e) => e.slug?.trim() === decoded.trim() && !e.recurringRule);
  if (direct) {
    return {
      event: direct,
      occurrenceStart: parseISO(direct.start),
      occurrenceEnd: direct.end ? parseISO(direct.end) : undefined,
      publicSlug: decoded,
    };
  }

  // Recurring: bare slug (same as stored `slug`, no yyyy-MM-dd suffix) → next occurrence from today
  const baseRecurring = raw.find(
    (e) => e.slug?.trim() === decoded.trim() && Boolean(e.recurringRule)
  );
  if (baseRecurring) {
    const from = startOfDay(new Date());
    const horizonMonths = 24;
    const expanded = expandRecurringEvents([baseRecurring], from, horizonMonths);
    const candidates = expanded
      .filter((i) => i.start >= from)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    const pick = candidates[0];
    const occStart = pick?.start ?? parseISO(baseRecurring.start);
    let occEnd: Date | undefined;
    if (baseRecurring.end) {
      const atHour = parseISO(baseRecurring.start);
      const templateEnd = parseISO(baseRecurring.end);
      occEnd = new Date(occStart.getTime() + (templateEnd.getTime() - atHour.getTime()));
    }
    return {
      event: baseRecurring,
      occurrenceStart: occStart,
      occurrenceEnd: occEnd,
      publicSlug: decoded,
    };
  }

  // Non-recurring: match derived slug from title+start
  for (const e of raw) {
    if (e.recurringRule) continue;
    if (baseSlugForStored(e) === decoded.trim()) {
      return {
        event: e,
        occurrenceStart: parseISO(e.start),
        occurrenceEnd: e.end ? parseISO(e.end) : undefined,
        publicSlug: decoded,
      };
    }
  }

  // Instance id lookup: expanded id might be stored in calendar as `${id}-${date}`
  for (const inst of expandRecurringEvents(raw, new Date(2000, 0, 1), 240)) {
    const pub = calendarInstanceToPublicSlug(inst);
    if (pub === decoded && inst.resource?.storedEventId) {
      const base = byId.get(inst.resource.storedEventId);
      if (base) {
        return {
          event: base,
          occurrenceStart: inst.start,
          occurrenceEnd: inst.end,
          publicSlug: decoded,
        };
      }
    }
  }

  return null;
}

/** Merge org IG/FB into `links.social` when missing. */
export function getEnrichedEvent(slug: string): StoredEvent | null {
  const resolved = getEventBySlug(slug);
  if (!resolved) return null;
  const { event, occurrenceStart, occurrenceEnd } = resolved;
  const social = { ...event.links?.social };
  if (social.instagram == null) social.instagram = SOCIAL_FALLBACK.instagram;
  if (social.facebook == null) social.facebook = SOCIAL_FALLBACK.facebook;
  return {
    ...event,
    start: occurrenceStart.toISOString(),
    end: occurrenceEnd?.toISOString() ?? event.end,
    links: event.links
      ? { ...event.links, social }
      : { social },
  };
}

export type EventCardDTO = {
  id: string;
  title: string;
  start: string;
  end?: string;
  sourcePageUrl?: string;
  recurringRule?: string;
  slug?: string | null;
  summary?: string;
  hostName?: string;
  tags?: string[];
  category?: string;
};

function cleanListingTitle(title: string): string {
  const t = title.replace(/^\|\s*/, "").trim();
  if (
    !t ||
    t === "Raleigh Hills Business Association" ||
    t.includes("| Raleigh Hills Business Association")
  ) {
    return "RHBA event";
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
    const key = `${startIso}|${title.toLowerCase().replace(/\s+/g, " ").trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const storedId = e.resource?.storedEventId;
    const stored = storedId ? raw.find((x) => x.id === storedId) : undefined;
    const slug =
      stored != null ? instanceSlug(stored, e.start) : calendarInstanceToPublicSlug(e);

    out.push({
      id: e.id,
      title,
      start: startIso,
      end: e.end?.toISOString(),
      sourcePageUrl: e.resource?.sourcePageUrl,
      recurringRule: e.resource?.recurringRule,
      slug: slug ?? null,
      summary: stored?.summary,
      hostName: stored?.host?.name,
      tags: stored?.tags,
      category: stored?.category,
    });
  }

  out.sort((a, b) => a.start.localeCompare(b.start));
  return out;
}

export function getRecentUpcoming(n: number): EventCardDTO[] {
  return getExpandedUpcomingEventCards(8).slice(0, n);
}

/**
 * Strict next upcoming event for the homepage accent banner: first chronological
 * future instance from expanded events.json, or the next Wednesday recurring meeting.
 */
export function getNextUpcomingBannerEvent(): EventCardDTO | null {
  const upcoming = getExpandedUpcomingEventCards(8);
  if (upcoming.length > 0) return upcoming[0];

  const now = new Date();
  const raw = loadRawEvents().filter((e) =>
    e.recurringRule?.toLowerCase().includes("wednesday")
  );
  const expanded = expandRecurringEvents(raw, now, 6)
    .filter((i) => i.start >= now)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  const pick = expanded[0];
  if (!pick) return null;

  const stored = raw.find((e) => e.id === pick.resource?.storedEventId);
  const slug =
    stored != null ? instanceSlug(stored, pick.start) : calendarInstanceToPublicSlug(pick);

  return {
    id: pick.id,
    title: cleanListingTitle(pick.title),
    start: pick.start.toISOString(),
    slug: slug ?? null,
  };
}

/** Slugs for `generateStaticParams` — curated manual entries with `slug`. */
export function getAllDetailSlugs(horizonMonths = 14): string[] {
  const raw = loadRawEvents();
  const slugs = new Set<string>();
  const from = startOfMonth(new Date());
  const until = addMonths(from, horizonMonths);

  for (const ev of raw) {
    if (!ev.slug?.trim()) continue;
    const base = ev.slug.trim();
    if (!ev.recurringRule) {
      slugs.add(base);
      continue;
    }
    const expanded = expandRecurringEvents([ev], from, horizonMonths + 2);
    for (const inst of expanded) {
      if (inst.start >= from && inst.start < until) {
        slugs.add(`${base}-${format(inst.start, "yyyy-MM-dd")}`);
      }
    }
  }

  return [...slugs];
}

export function groupInstancesByDayKey(
  instances: CalendarInstance[],
  year: number,
  monthIndex: number
): Map<string, CalendarInstance[]> {
  const map = new Map<string, CalendarInstance[]>();
  for (const inst of instances) {
    if (!isSameMonth(inst.start, new Date(year, monthIndex, 1))) continue;
    const key = format(inst.start, "yyyy-MM-dd");
    const arr = map.get(key) ?? [];
    arr.push(inst);
    map.set(key, arr);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => a.start.getTime() - b.start.getTime());
  }
  return map;
}
