import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { EventsListClient } from '@/components/events/EventsListClient';
import { Button } from '@/components/ui/button';
import { getExpandedUpcomingEventCards } from '@/lib/events';

export const metadata: Metadata = {
  title: 'Events',
  description:
    'Upcoming RHBA events from data/events.json (including expanded recurring meetings).',
};

export default function EventsPage() {
  const events = getExpandedUpcomingEventCards(8);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        <section className="bg-primary py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-4xl font-bold text-primary-foreground md:text-5xl">
              Events
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/85">
              Upcoming dates combine manual entries and extracted listings from{' '}
              <code className="rounded bg-primary-foreground/15 px-1.5 py-0.5 text-sm">
                data/events.json
              </code>
              , with simple recurring rules expanded the same way as the calendar.
            </p>
            <Button variant="secondary" className="mt-6" asChild>
              <Link href="/calendar">Open full calendar</Link>
            </Button>
          </div>
        </section>
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4">
            <EventsListClient events={events} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
