'use client';

import { useMemo, useState } from 'react';
import type { EventCardDTO } from '@/lib/events';
import { EventCard } from '@/components/events/EventCard';
import { Input } from '@/components/ui/input';

export function EventsListClient({ events }: { events: EventCardDTO[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => {
      const blob = `${e.title} ${e.recurringRule ?? ''} ${e.sourcePageUrl ?? ''} ${e.summary ?? ''} ${e.hostName ?? ''}`.toLowerCase();
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
          filtered.map((e) => <EventCard key={e.id} event={e} />)
        )}
      </div>
    </div>
  );
}
