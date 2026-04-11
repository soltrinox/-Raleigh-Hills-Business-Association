/**
 * Event extraction + nav derivation shared by extract-content and extract-content-bundle.
 */

export type NavJson = {
  links: Array<{ href: string; label: string }>;
};

export type EventJson = {
  id: string;
  title: string;
  start: string;
  end?: string;
  description?: string;
  sourcePageUrl?: string;
  confidence: "high" | "medium" | "low";
  recurringRule?: string;
};

export type NavSamplePage = {
  title: string;
  path: string[];
};

const MONTH_DATE_RE =
  /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})\b/gi;

const RECURRING_HINTS =
  /\b((every|each)\s+)?(\d{1,2})(st|nd|rd|th)\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/gi;

export function extractEventsFromText(
  text: string,
  sourcePageUrl: string,
  pageTitle: string
): EventJson[] {
  const events: EventJson[] = [];
  const monthMap: Record<string, string> = {
    january: "01",
    february: "02",
    march: "03",
    april: "04",
    may: "05",
    june: "06",
    july: "07",
    august: "08",
    september: "09",
    october: "10",
    november: "11",
    december: "12",
  };

  let m: RegExpExecArray | null;
  const re = new RegExp(MONTH_DATE_RE.source, MONTH_DATE_RE.flags);
  while ((m = re.exec(text)) !== null) {
    const mon = monthMap[m[1].toLowerCase()];
    if (!mon) continue;
    const day = m[2].padStart(2, "0");
    const year = m[3];
    const start = `${year}-${mon}-${day}T18:00:00.000Z`;
    events.push({
      id: `auto-${sourcePageUrl}-${year}${mon}${day}-${events.length}`,
      title: pageTitle || "Event",
      start,
      description: text.slice(Math.max(0, m.index - 80), m.index + 120).trim(),
      sourcePageUrl,
      confidence: "low",
    });
  }

  let r: RegExpExecArray | null;
  const rre = new RegExp(RECURRING_HINTS.source, RECURRING_HINTS.flags);
  while ((r = rre.exec(text)) !== null) {
    events.push({
      id: `recur-${sourcePageUrl}-${r.index}`,
      title: pageTitle || "Recurring meeting",
      start: new Date().toISOString(),
      sourcePageUrl,
      confidence: "low",
      recurringRule: r[0],
      description: text.slice(Math.max(0, r.index - 60), r.index + 80).trim(),
    });
  }

  return events;
}

export function deriveNavFromSamples(pages: NavSamplePage[]): NavJson {
  const labels = new Map<string, string>();
  for (const p of pages) {
    const label = p.title?.split("|")[0]?.trim() || p.path.join(" / ") || "Home";
    if (p.path.length === 0) labels.set("/", "Home");
    else labels.set("/" + p.path.join("/"), label);
  }
  const links = [...labels.entries()]
    .map(([href, label]) => ({ href, label }))
    .sort((a, b) => a.href.localeCompare(b.href));
  const defaults = [
    { href: "/", label: "Home" },
    { href: "/calendar", label: "Calendar" },
  ];
  const seen = new Set(links.map((l) => l.href));
  const head = defaults.filter((d) => !seen.has(d.href));
  return { links: [...head, ...links] };
}
