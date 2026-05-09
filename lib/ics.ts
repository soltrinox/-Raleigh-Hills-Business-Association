import type { StoredEvent } from "@/lib/events";

export type IcsResolvedEvent = {
  event: StoredEvent;
  occurrenceStart: Date;
  occurrenceEnd?: Date;
  publicSlug: string;
};

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Format as UTC `YYYYMMDDTHHmmssZ` for iCalendar. */
function toIcsUtc(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

export function buildIcs(resolved: IcsResolvedEvent): string {
  const { event, occurrenceStart, occurrenceEnd, publicSlug } = resolved;
  const uid = `${encodeURIComponent(publicSlug)}@events.rhba`;
  const dtStamp = toIcsUtc(new Date());
  const dtStart = toIcsUtc(occurrenceStart);
  const dtEnd = occurrenceEnd ? toIcsUtc(occurrenceEnd) : undefined;
  const summary = escapeText(event.title.replace(/\|.*$/, "").trim());
  const description = escapeText(
    (event.summary ?? event.description ?? "").slice(0, 6000)
  );
  const location = escapeText(
    event.location?.online
      ? "Online"
      : [event.location?.name, event.location?.address].filter(Boolean).join(", ")
  );

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RHBA//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    ...(dtEnd ? [`DTEND:${dtEnd}`] : []),
    `SUMMARY:${summary}`,
    ...(description ? [`DESCRIPTION:${description}`] : []),
    ...(location ? [`LOCATION:${location}`] : []),
    ...(event.links?.website ? [`URL:${event.links.website}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n") + "\r\n";
}
