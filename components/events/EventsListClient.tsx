'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';
import type { EventCardDTO } from '@/lib/events';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function EventsListClient({ events }: { events: EventCardDTO[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => {
      const blob = `${e.title} ${e.recurringRule ?? ''} ${e.sourcePageUrl ?? ''}`.toLowerCase();
      return blob.includes(q);
    });
  }, [events, query]);

  return (
    <div className="space-y-6">
      <div className="max-w-md space-y-2">
        <label htmlFor="events-search" className="text-sm font-medium text-foreground">
          Search events
        </label>
        <Input
          id="events-search"
          placeholder="Filter by title or keyword"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search events"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {filtered.length} upcoming {filtered.length === 1 ? 'event' : 'events'}
        {query.trim() ? ` (of ${events.length})` : ''}
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="col-span-full text-sm text-muted-foreground">No events match your search.</p>
        ) : (
          filtered.map((e) => {
            const start = parseISO(e.start);
            const dateLine = format(start, 'EEEE, MMMM d, yyyy');
            const timeLine = format(start, 'h:mm a');
            return (
              <Card key={e.id} className="flex flex-col border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-2 text-primary">
                    <Calendar className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {dateLine}
                      </p>
                      <p className="text-xs text-muted-foreground">{timeLine}</p>
                    </div>
                  </div>
                  <CardTitle className="font-serif text-lg leading-snug">{e.title}</CardTitle>
                  {e.recurringRule && (
                    <p className="text-xs font-medium text-primary">Recurring: {e.recurringRule}</p>
                  )}
                </CardHeader>
                <CardContent className="mt-auto flex flex-1 flex-col justify-end pt-0">
                  {e.sourcePageUrl && (
                    <Link
                      href={e.sourcePageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary underline-offset-4 hover:underline"
                    >
                      Source page
                    </Link>
                  )}
                  <Link href="/calendar" className="mt-3 text-sm text-muted-foreground underline-offset-4 hover:underline">
                    View on calendar
                  </Link>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
