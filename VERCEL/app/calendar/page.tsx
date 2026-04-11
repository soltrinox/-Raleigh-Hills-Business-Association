import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { expandRecurringEvents, loadRawEvents } from "@/lib/events";
import { CalendarClient } from "./CalendarClient";

export const metadata: Metadata = {
  title: "Calendar",
  description: "RHBA meetings and events from mirrored content and manual entries.",
};

export default function CalendarPage() {
  const raw = loadRawEvents();
  const expanded = expandRecurringEvents(raw, new Date(), 8);
  const serializable = expanded.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start.toISOString(),
    end: e.end?.toISOString(),
    resource: e.resource,
  }));

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
              Events come from automated extraction of cached pages and from the{" "}
              <code className="rounded bg-primary-foreground/15 px-1.5 py-0.5 text-sm">
                manual
              </code>{" "}
              array in{" "}
              <code className="rounded bg-primary-foreground/15 px-1.5 py-0.5 text-sm">
                data/events.json
              </code>
              . Edit that file to add or fix dates.
            </p>
          </div>
        </section>
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
              <CalendarClient events={serializable} />
            </div>
            <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">
              Prefer the public site calendar?{" "}
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
