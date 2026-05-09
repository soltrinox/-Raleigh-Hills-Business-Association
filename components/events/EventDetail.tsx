import Link from "next/link";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import type { CalendarEvent } from "@/lib/types";
import type { EventCardDTO } from "@/lib/events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SocialLinks } from "@/components/events/SocialLinks";
import { EventCard } from "@/components/events/EventCard";
import { CopyShareUrlButton } from "@/components/events/CopyShareUrlButton";
import {
  Calendar as CalendarIcon,
  Clock,
  Mail,
  MapPin,
  Phone,
  ExternalLink,
  Video,
} from "lucide-react";

export type EventDetailProps = {
  event: CalendarEvent;
  publicSlug: string;
  siteUrl: string;
  absoluteShareUrl: string;
  related: EventCardDTO[];
};

function statusBadge(status: CalendarEvent["status"]) {
  if (!status || status === "scheduled") return null;
  const label =
    status === "cancelled"
      ? "Cancelled"
      : status === "rescheduled"
        ? "Rescheduled"
        : "Sold out";
  return (
    <Badge variant={status === "cancelled" ? "destructive" : "secondary"}>{label}</Badge>
  );
}

function padUtc(n: number): string {
  return n.toString().padStart(2, "0");
}

function googleCalendarUtcRange(start: Date, end?: Date): string {
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${padUtc(d.getUTCMonth() + 1)}${padUtc(d.getUTCDate())}T${padUtc(d.getUTCHours())}${padUtc(d.getUTCMinutes())}${padUtc(d.getUTCSeconds())}Z`;
  const s = fmt(start);
  const e = fmt(end ?? new Date(start.getTime() + 60 * 60 * 1000));
  return `${s}/${e}`;
}

export function EventDetail({
  event,
  publicSlug,
  siteUrl,
  absoluteShareUrl,
  related,
}: EventDetailProps) {
  const start = parseISO(event.start);
  const end = event.end ? parseISO(event.end) : undefined;
  const tzLabel = event.timezone ?? "America/Los_Angeles";
  const dateStr = event.allDay
    ? format(start, "EEEE, MMMM d, yyyy")
    : `${format(start, "EEEE, MMMM d, yyyy · h:mm a")}${end ? ` – ${format(end, "h:mm a")}` : ""}`;

  const social = event.links?.social;
  const membersOnlyOnline =
    event.visibility === "members" && Boolean(event.location?.online);

  const icsHref =
    event.links?.ics ??
    `${siteUrl}/api/events/${encodeURIComponent(publicSlug)}?format=ics`;

  const googleCalHref = (() => {
    const dates = encodeURIComponent(googleCalendarUtcRange(start, end));
    const text = encodeURIComponent(event.title.replace(/\|.*$/, "").trim());
    const details = encodeURIComponent(event.summary ?? event.description ?? "");
    const loc = encodeURIComponent(event.location?.address ?? event.location?.name ?? "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${loc}`;
  })();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:flex lg:gap-10 lg:py-14">
      <article className="min-w-0 flex-1">
        <div className="relative mb-8 overflow-hidden rounded-xl border border-border bg-muted">
          {event.coverImage ? (
            <Image
              src={event.coverImage}
              alt=""
              width={1200}
              height={480}
              className="h-56 w-full object-cover md:h-72"
              priority
            />
          ) : (
            <div className="flex h-56 items-center justify-center bg-primary/10 md:h-72">
              <CalendarIcon className="h-20 w-20 text-primary/60" aria-hidden />
            </div>
          )}
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {statusBadge(event.status)}
            {event.category && (
              <Badge variant="outline" className="border-background/50 bg-background/90">
                {event.category}
              </Badge>
            )}
          </div>
        </div>

        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {event.title.replace(/\|.*$/, "").trim()}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
          <span className="inline-flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 shrink-0" aria-hidden />
            {dateStr}
          </span>
          {!event.allDay && (
            <span className="inline-flex items-center gap-2 text-xs md:text-sm">
              <Clock className="h-4 w-4 shrink-0" aria-hidden />
              {tzLabel}
            </span>
          )}
        </div>

        {event.summary && (
          <p className="mt-6 text-lg text-muted-foreground">{event.summary}</p>
        )}

        <Separator className="my-10" />

        <section className="space-y-4">
          <h2 className="font-serif text-xl font-semibold">About</h2>
          {event.description ? (
            <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground">
              {event.description}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No description yet.</p>
          )}
        </section>

        <Separator className="my-10" />

        <section className="space-y-4">
          <h2 className="font-serif text-xl font-semibold">Location</h2>
          {event.location?.online ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Online event
                </CardTitle>
              </CardHeader>
              <CardContent>
                {membersOnlyOnline ? (
                  <p className="text-sm text-muted-foreground">
                    Join link is shared with RHBA members. Contact RHBA for Zoom details.
                  </p>
                ) : event.location.joinUrl ? (
                  <Button asChild>
                    <a href={event.location.joinUrl} target="_blank" rel="noopener noreferrer">
                      Join online <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">See primary links below.</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {event.location?.name ?? "Venue"}
                    {event.location?.address ? (
                      <span className="mt-1 block font-normal text-sm font-sans text-muted-foreground">
                        {event.location.address}
                      </span>
                    ) : null}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {event.location?.mapUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={event.location.mapUrl} target="_blank" rel="noopener noreferrer">
                      Open map <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </section>

        {event.host && (
          <>
            <Separator className="my-10" />
            <section className="space-y-4">
              <h2 className="font-serif text-xl font-semibold">Host</h2>
              <Card>
                <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start">
                  {event.host.avatarUrl ? (
                    <Image
                      src={event.host.avatarUrl}
                      alt=""
                      width={72}
                      height={72}
                      className="rounded-full border border-border"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-semibold text-foreground">{event.host.name}</p>
                    {event.host.role && (
                      <p className="text-sm text-muted-foreground">{event.host.role}</p>
                    )}
                    {event.host.organization && (
                      <p className="text-sm text-muted-foreground">{event.host.organization}</p>
                    )}
                    {event.host.memberId && (
                      <Link
                        href={`/members#${encodeURIComponent(event.host.memberId)}`}
                        className="text-sm text-primary underline-offset-4 hover:underline"
                      >
                        View in directory
                      </Link>
                    )}
                    <div className="flex flex-col gap-2 pt-2 text-sm">
                      {event.host.email && (
                        <a href={`mailto:${event.host.email}`} className="inline-flex items-center gap-2 text-primary">
                          <Mail className="h-4 w-4" /> {event.host.email}
                        </a>
                      )}
                      {event.host.phone && (
                        <a href={`tel:${event.host.phone}`} className="inline-flex items-center gap-2 text-primary">
                          <Phone className="h-4 w-4" /> {event.host.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        )}

        {(event.links?.website ||
          event.links?.register ||
          event.links?.tickets ||
          (event.links?.attachments?.length ?? 0) > 0) && (
          <>
            <Separator className="my-10" />
            <section className="space-y-4">
              <h2 className="font-serif text-xl font-semibold">Links & resources</h2>
              <ul className="flex flex-col gap-2 text-sm">
                {event.links?.website && (
                  <li>
                    <a
                      href={event.links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Website <ExternalLink className="inline h-3 w-3" />
                    </a>
                  </li>
                )}
                {event.links?.register && (
                  <li>
                    <a
                      href={event.links.register}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Register <ExternalLink className="inline h-3 w-3" />
                    </a>
                  </li>
                )}
                {event.links?.tickets && (
                  <li>
                    <a
                      href={event.links.tickets}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Tickets <ExternalLink className="inline h-3 w-3" />
                    </a>
                  </li>
                )}
                {event.links?.attachments?.map((a) => (
                  <li key={a.href}>
                    <a
                      href={a.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {a.label} <ExternalLink className="inline h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        <Separator className="my-10" />

        <SocialLinks social={social} />

        {event.contacts && event.contacts.length > 0 && (
          <>
            <Separator className="my-10" />
            <section className="space-y-4">
              <h2 className="font-serif text-xl font-semibold">Contacts</h2>
              <ul className="space-y-4">
                {event.contacts.map((c) => (
                  <li key={`${c.name}-${c.email ?? ""}`} className="text-sm">
                    <p className="font-medium">{c.name}</p>
                    {c.role && <p className="text-muted-foreground">{c.role}</p>}
                    <div className="mt-1 flex flex-col gap-1">
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="text-primary underline-offset-4 hover:underline">
                          {c.email}
                        </a>
                      )}
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="text-muted-foreground hover:text-foreground">
                          {c.phone}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {related.length > 0 && (
          <>
            <Separator className="my-12" />
            <section>
              <h2 className="font-serif text-xl font-semibold">More upcoming</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <EventCard key={r.id} event={r} variant="compact" />
                ))}
              </div>
            </section>
          </>
        )}
      </article>

      <aside className="mt-12 w-full shrink-0 lg:mt-0 lg:w-72 lg:sticky lg:top-24 lg:self-start">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Attending</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {event.links?.primaryCta && (
              <Button asChild size="lg" className="w-full">
                <a href={event.links.primaryCta.href} target="_blank" rel="noopener noreferrer">
                  {event.links.primaryCta.label}
                </a>
              </Button>
            )}
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href={icsHref}>Download .ics</a>
            </Button>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href={googleCalHref} target="_blank" rel="noopener noreferrer">
                Add to Google Calendar
              </a>
            </Button>
            <CopyShareUrlButton url={absoluteShareUrl} />
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
