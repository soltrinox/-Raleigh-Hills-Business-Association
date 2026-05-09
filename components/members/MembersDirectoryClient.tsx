'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Map, Navigation, Search, X } from 'lucide-react';
import type { Member } from '@/lib/types';
import { MemberCard } from './MemberCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const MembersMap = dynamic(
  () => import('./MembersMap').then((mod) => ({ default: mod.MembersMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border border-border bg-muted/40">
        <p className="text-sm text-muted-foreground">Loading map…</p>
      </div>
    ),
  },
);

type SortMode = 'name-asc' | 'name-desc' | 'distance';
type RadiusValue = 'none' | '5' | '10' | '25';

export function MembersDirectoryClient({ members }: { members: Member[] }) {
  const [nameQuery, setNameQuery] = useState('');
  const [zipInput, setZipInput] = useState('');
  const [radiusMiles, setRadiusMiles] = useState<RadiusValue>('none');
  const [sortBy, setSortBy] = useState<SortMode>('name-asc');
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [results, setResults] = useState<Member[]>(members);
  const [totalCount, setTotalCount] = useState(members.length);
  const [searching, setSearching] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isLg, setIsLg] = useState(false);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsLg(e.matches);
      if (e.matches) {
        setMapOpen(true);
        setSheetOpen(false);
      } else {
        setMapOpen(false);
      }
    };
    handler(mql);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const submitSearch = useCallback(
    async (overrideSort?: SortMode) => {
      setSearching(true);
      setSelectedId(null);
      setFocusTarget(null);

      const sort = overrideSort ?? sortBy;
      const params = new URLSearchParams();
      if (nameQuery.trim()) params.set('q', nameQuery.trim());
      if (/^\d{5}$/.test(zipInput.trim())) params.set('zip', zipInput.trim());

      const r = radiusMiles === 'none' ? null : Number(radiusMiles);
      const center = userLoc;

      if (r != null && center) {
        params.set('radius', String(r));
        params.set('lat', String(center.lat));
        params.set('lng', String(center.lng));
      } else if (r != null && /^\d{5}$/.test(zipInput.trim())) {
        try {
          const geoRes = await fetch(
            `/api/geocode-zip?zip=${encodeURIComponent(zipInput.trim())}`,
          );
          const geoData = (await geoRes.json()) as { lat?: number | null; lng?: number | null };
          if (geoData.lat != null && geoData.lng != null && Number.isFinite(geoData.lat)) {
            params.set('radius', String(r));
            params.set('lat', String(geoData.lat));
            params.set('lng', String(geoData.lng));
          }
        } catch {
          // fall through — search without radius
        }
      }

      params.set('sort', sort);

      try {
        const res = await fetch(`/api/members/search?${params.toString()}`);
        const data = (await res.json()) as { results: Member[]; total: number; count: number };
        setResults(data.results);
        setTotalCount(data.total);
      } catch {
        // on error keep current results
      } finally {
        setSearching(false);
      }
    },
    [nameQuery, zipInput, radiusMiles, sortBy, userLoc],
  );

  const clearSearch = useCallback(() => {
    setNameQuery('');
    setZipInput('');
    setRadiusMiles('none');
    setSortBy('name-asc');
    setSelectedId(null);
    setFocusTarget(null);
    setResults(members);
    setTotalCount(members.length);
  }, [members]);

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

  const highlightId =
    selectedId && results.some((m) => m.id === selectedId) ? selectedId : null;

  const areaCenter = userLoc;

  const onMarkerClick = useCallback(
    (id: string) => {
      setSelectedId(id);
      const m = results.find((x) => x.id === id);
      if (m) setFocusTarget({ lat: m.lat, lng: m.lng });
      const el = cardRefs.current[id];
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },
    [results],
  );

  const onCardActivate = useCallback(
    (id: string) => {
      setSelectedId(id);
      const m = results.find((x) => x.id === id);
      if (m) setFocusTarget({ lat: m.lat, lng: m.lng });
    },
    [results],
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitSearch();
  };

  const mapComponent = (
    <MembersMap
      members={results}
      selectedId={highlightId}
      focusTarget={focusTarget}
      onMarkerClick={onMarkerClick}
    />
  );

  return (
    <div className="space-y-6">
      {/* Search form */}
      <form
        onSubmit={handleFormSubmit}
        className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-12 lg:items-end lg:gap-x-4 lg:gap-y-5">
          <div className="sm:col-span-2 lg:col-span-4">
            <Label htmlFor="member-name-search" className="text-foreground">
              Business name
            </Label>
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="member-name-search"
                className="pl-9"
                placeholder="Search by name, category, or address"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <Label htmlFor="member-zip">ZIP code</Label>
            <Input
              id="member-zip"
              className="mt-1.5"
              placeholder="e.g. 97225"
              inputMode="numeric"
              maxLength={5}
              value={zipInput}
              onChange={(e) => {
                setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5));
              }}
            />
          </div>

          <div className="sm:col-span-1 lg:col-span-2">
            <Label>Radius</Label>
            <Select
              value={radiusMiles}
              onValueChange={(v) => setRadiusMiles(v as RadiusValue)}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Radius" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No radius</SelectItem>
                <SelectItem value="5">Within 5 mi</SelectItem>
                <SelectItem value="10">Within 10 mi</SelectItem>
                <SelectItem value="25">Within 25 mi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-2">
            <Label>Sort</Label>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortMode)}>
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A–Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z–A)</SelectItem>
                <SelectItem value="distance" disabled={!areaCenter}>
                  Nearest first
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row lg:col-span-2">
            <Button type="submit" className="w-full" disabled={searching}>
              <Search className="mr-2 size-4" />
              {searching ? 'Searching…' : 'Search'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={clearSearch}
            >
              <X className="mr-2 size-4" />
              Clear
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={requestLocation}
          >
            <Navigation className="mr-2 size-4 shrink-0" />
            My location
          </Button>
          {!isLg && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSheetOpen(true)}
            >
              <Map className="mr-2 size-4" />
              Show map
            </Button>
          )}
          {isLg && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMapOpen((v) => !v)}
            >
              <Map className="mr-2 size-4" />
              {mapOpen ? 'Hide map' : 'Show map'}
            </Button>
          )}
        </div>

        {geoError && <p className="mt-3 text-sm text-destructive">{geoError}</p>}
      </form>

      {/* 2-column layout: cards left, map right */}
      <div
        className={
          mapOpen && isLg
            ? 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]'
            : ''
        }
      >
        {/* Left: cards */}
        <div>
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-serif text-xl font-semibold text-foreground sm:text-2xl">
              Members
            </h2>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{results.length}</strong> of{' '}
              {totalCount} shown
            </p>
          </div>

          {results.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <p className="font-medium text-foreground">No members match</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Try another name, ZIP, or widen the radius.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {results.map((m) => (
                <li key={m.id} className="min-w-0">
                  <MemberCard
                    ref={(el) => {
                      cardRefs.current[m.id] = el;
                    }}
                    member={m}
                    selected={highlightId === m.id}
                    onActivate={onCardActivate}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right: sticky map panel (desktop) */}
        {mapOpen && isLg && (
          <div className="sticky top-20 h-[calc(100vh-6rem)] overflow-hidden rounded-xl">
            {mapComponent}
          </div>
        )}
      </div>

      {/* Mobile map sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Member Map</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">{mapComponent}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
