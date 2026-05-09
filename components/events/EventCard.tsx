import Link from "next/link";
import { format, parseISO } from "date-fns";
import type { EventCardDTO } from "@/lib/events";
import { eventHref } from "@/lib/events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export type EventCardProps = {
  event: EventCardDTO;
  /** Anchor id for calendar-mini scroll targets */
  id?: string;
  variant?: "default" | "compact";
};

export function EventCard({ event, id, variant = "default" }: EventCardProps) {
  const start = parseISO(event.start);
  const dateLine = format(start, "EEEE, MMMM d, yyyy");
  const timeLine = format(start, "h:mm a");
  const detailSlug = event.slug?.trim();
  const innerHref = detailSlug ? eventHref(detailSlug) : event.sourcePageUrl;

  return (
    <Card
      id={id}
      className={`flex scroll-mt-24 flex-col border-border ${variant === "compact" ? "shadow-sm" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2 text-primary">
          <Calendar className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {dateLine}
            </p>
            <p className="text-xs text-muted-foreground">{timeLine}</p>
          </div>
        </div>
        <CardTitle className="font-serif text-lg leading-snug">{event.title}</CardTitle>
        {event.recurringRule && (
          <p className="text-xs font-medium text-primary">
            Recurring: {event.recurringRule}
          </p>
        )}
        {event.summary && variant !== "compact" && (
          <p className="line-clamp-3 text-sm text-muted-foreground">{event.summary}</p>
        )}
        {event.hostName && (
          <p className="text-sm text-muted-foreground">
            Host: <span className="font-medium text-foreground">{event.hostName}</span>
          </p>
        )}
      </CardHeader>
      <CardContent className="mt-auto flex flex-1 flex-col justify-end gap-2 pt-0">
        {detailSlug && innerHref?.startsWith("/") ? (
          <Link
            href={innerHref}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View details
          </Link>
        ) : event.sourcePageUrl ? (
          <a
            href={event.sourcePageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Source page
          </a>
        ) : null}
        {!detailSlug && (
          <Link
            href="/calendar"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            View on calendar
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
