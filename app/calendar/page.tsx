import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import {
  adjacentYm,
  buildCalendarGrid,
  ymFromSearchParam,
} from "@/lib/calendar-grid";
import { getEventsForMonth, getRecentUpcoming } from "@/lib/events";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Calendar",
  description: "RHBA meetings and events — browse by month.",
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ ym?: string }>;
}) {
  const sp = await searchParams;
  const today = new Date();
  const { year, monthIndex, ymParam } = ymFromSearchParam(sp.ym, today);
  const instances = getEventsForMonth(year, monthIndex);
  const cells = buildCalendarGrid(year, monthIndex, instances);

  const monthLabel = format(new Date(year, monthIndex, 1), "MMMM yyyy");
  const prevYm = adjacentYm(year, monthIndex, -1);
  const nextYm = adjacentYm(year, monthIndex, 1);
  const todayYm = format(today, "yyyy-MM");
  const basePath = "/calendar";

  const upcoming = getRecentUpcoming(5);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        <section className="bg-primary py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-4xl font-bold text-primary-foreground md:text-5xl">
              Calendar
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/85">
              Browse RHBA meetings and events by month. Dates come from curated entries and extracted
              listings in{" "}
              <code className="rounded bg-primary-foreground/15 px-1.5 py-0.5 text-sm">
                data/events.json
              </code>
              .
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1">
                <div className="overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                  <MonthCalendar
                    key={ymParam}
                    monthLabel={monthLabel}
                    prevHref={`${basePath}?ym=${prevYm}`}
                    nextHref={`${basePath}?ym=${nextYm}`}
                    todayHref={`${basePath}?ym=${todayYm}`}
                    cells={cells}
                  />
                </div>

                <div className="mt-10">
                  <h2 className="font-serif text-xl font-semibold text-foreground">
                    Upcoming highlights
                  </h2>
                  <ul className="mt-4 flex flex-col gap-4">
                    {upcoming.map((e) => (
                      <li
                        key={e.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-foreground">{e.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(e.start), "EEEE, MMM d · h:mm a")}
                          </p>
                        </div>
                        {e.slug ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/events/${encodeURIComponent(e.slug)}`}>Details</Link>
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/events">All events</Link>
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <aside className="w-full shrink-0 space-y-6 lg:w-72 lg:sticky lg:top-24">
                <div className="rounded-xl border border-border bg-muted/40 p-6">
                  <h3 className="font-serif text-lg font-semibold">Subscribe</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add individual events from their detail pages (download{" "}
                    <span className="font-medium">.ics</span>). Month view:{" "}
                    <span className="font-mono text-xs">{ymParam}</span>
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                      <Link href="/events">Browse all events</Link>
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Each event detail page includes &quot;Download .ics&quot; and Google Calendar actions.
                    </p>
                  </div>
                </div>
              </aside>
            </div>

            <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground">
              Prefer cards and search?{" "}
              <Link href="/events" className="text-primary underline-offset-4 hover:underline">
                Events overview
              </Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
