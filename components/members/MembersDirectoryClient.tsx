'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useMemo, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import type { Member } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const MembersMap = dynamic(
  () => import('./MembersMap').then((mod) => ({ default: mod.MembersMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] items-center justify-center rounded-lg border border-border bg-muted md:h-[420px]">
        <p className="text-sm text-muted-foreground">Loading map…</p>
      </div>
    ),
  },
);

function haversineM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

type SortMode = 'name-asc' | 'name-desc' | 'distance';

export function MembersDirectoryClient({ members }: { members: Member[] }) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortMode>('name-asc');
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<{ lat: number; lng: number } | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => {
      const blob = `${m.name} ${m.category} ${m.address} ${m.description ?? ''}`.toLowerCase();
      return blob.includes(q);
    });
  }, [members, query]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortBy === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'name-desc') list.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortBy === 'distance' && userLoc) {
      list.sort(
        (a, b) =>
          haversineM(userLoc, { lat: a.lat, lng: a.lng }) -
          haversineM(userLoc, { lat: b.lat, lng: b.lng }),
      );
    }
    return list;
  }, [filtered, sortBy, userLoc]);

  const highlightId =
    selectedId && sorted.some((m) => m.id === selectedId) ? selectedId : null;

  const requestLocation = useCallback(() => {
    setGeoError(null);
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoError('Geolocation is not supported in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortBy('distance');
      },
      () => setGeoError('Location permission denied or unavailable.'),
      { enableHighAccuracy: true, timeout: 12_000 },
    );
  }, []);

  const onMarkerClick = useCallback(
    (id: string) => {
      setSelectedId(id);
      const m = sorted.find((x) => x.id === id);
      if (m) setFocusTarget({ lat: m.lat, lng: m.lng });
      const el = cardRefs.current[id];
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },
    [sorted],
  );

  const onCardActivate = useCallback(
    (id: string) => {
      setSelectedId(id);
      const m = sorted.find((x) => x.id === id);
      if (m) setFocusTarget({ lat: m.lat, lng: m.lng });
    },
    [sorted],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1 space-y-2">
          <label htmlFor="member-search" className="text-sm font-medium text-foreground">
            Search directory
          </label>
          <Input
            id="member-search"
            placeholder="Name, category, or address"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setFocusTarget(null);
              setSelectedId(null);
            }}
            aria-label="Search members"
          />
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center md:w-auto">
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortMode)}
          >
            <SelectTrigger className="w-full min-w-[200px] sm:w-[220px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A–Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z–A)</SelectItem>
              <SelectItem value="distance" disabled={!userLoc}>
                Distance (nearest first)
              </SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={requestLocation}>
            <Navigation className="mr-2 h-4 w-4" />
            Use my location
          </Button>
        </div>
      </div>
      {geoError && <p className="text-sm text-destructive">{geoError}</p>}
      <p className="text-sm text-muted-foreground">
        Showing {sorted.length} of {members.length} listings. Map markers match the filtered list.
      </p>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="order-1 lg:order-none lg:sticky lg:top-24">
          <MembersMap members={sorted} focusTarget={focusTarget} onMarkerClick={onMarkerClick} />
        </div>
        <div className="order-2 flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1 lg:max-h-[calc(100vh-8rem)]">
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members match your search.</p>
          ) : (
            sorted.map((m) => (
              <div
                key={m.id}
                ref={(el) => {
                  cardRefs.current[m.id] = el;
                }}
              >
                <Card
                  className={cn(
                    'cursor-pointer transition-shadow',
                    highlightId === m.id && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                  )}
                  onClick={() => onCardActivate(m.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onCardActivate(m.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="font-serif text-lg">{m.name}</CardTitle>
                    <p className="text-sm font-medium text-primary">{m.category}</p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{m.address}</span>
                    </div>
                    {m.description && <p>{m.description}</p>}
                    <div className="flex flex-wrap gap-3 pt-1">
                      {m.phone && (
                        <a href={`tel:${m.phone.replace(/\s/g, '')}`} className="text-primary underline-offset-4 hover:underline">
                          {m.phone}
                        </a>
                      )}
                      {m.website && (
                        <Link
                          href={m.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline-offset-4 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Website
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
