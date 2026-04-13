'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Building2, Globe, MapPin, Navigation, Phone, Search } from 'lucide-react';
import type { Member } from '@/lib/types';
import {
  extractZipFromAddress,
  haversineMiles,
  memberMatchesNameQuery,
  memberMatchesZipInAddress,
  memberWithinRadiusMiles,
  nameSuggestions,
} from '@/lib/member-utils';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';

const MembersMap = dynamic(
  () => import('./MembersMap').then((mod) => ({ default: mod.MembersMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center rounded-xl border border-border bg-muted/40 md:h-[460px]">
        <p className="text-sm text-muted-foreground">Loading map…</p>
      </div>
    ),
  },
);

type SortMode = 'name-asc' | 'name-desc' | 'distance';

/** Radix SelectItem cannot use empty string as value. */
type RadiusValue = 'none' | '5' | '10' | '25';

export function MembersDirectoryClient({ members }: { members: Member[] }) {
  const [nameQuery, setNameQuery] = useState('');
  const [zipInput, setZipInput] = useState('');
  const [zipGeo, setZipGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [zipGeoStatus, setZipGeoStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [radiusMiles, setRadiusMiles] = useState<RadiusValue>('none');
  const [sortBy, setSortBy] = useState<SortMode>('name-asc');
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const nameWrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const z = zipInput.trim();
    if (!/^\d{5}$/.test(z)) {
      setZipGeo(null);
      setZipGeoStatus('idle');
      return;
    }

    setZipGeoStatus('loading');
    const t = setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch(`/api/geocode-zip?zip=${encodeURIComponent(z)}`);
          const data = (await res.json()) as { lat?: number | null; lng?: number | null };
          if (data.lat != null && data.lng != null && Number.isFinite(data.lat)) {
            setZipGeo({ lat: data.lat, lng: data.lng });
            setZipGeoStatus('ok');
          } else {
            setZipGeo(null);
            setZipGeoStatus('error');
          }
        } catch {
          setZipGeo(null);
          setZipGeoStatus('error');
        }
      })();
    }, 450);
    return () => clearTimeout(t);
  }, [zipInput]);

  useEffect(() => {
    setSelectedId(null);
    setFocusTarget(null);
  }, [nameQuery, zipInput, radiusMiles]);

  const filtered = useMemo(() => {
    let list = members.filter((m) => memberMatchesNameQuery(m, nameQuery));

    const z = zipInput.trim();
    const r = radiusMiles === 'none' ? null : Number(radiusMiles);

    if (/^\d{5}$/.test(z)) {
      if (r == null) {
        list = list.filter((m) => memberMatchesZipInAddress(m, z));
      } else {
        const center = userLoc ?? zipGeo;
        if (center) {
          list = list.filter((m) => memberWithinRadiusMiles(m, center, r));
        } else {
          list = list.filter((m) => memberMatchesZipInAddress(m, z));
        }
      }
    } else if (r != null && userLoc) {
      list = list.filter((m) => memberWithinRadiusMiles(m, userLoc, r));
    }

    return list;
  }, [members, nameQuery, zipInput, radiusMiles, zipGeo, userLoc]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortBy === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'name-desc') list.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortBy === 'distance') {
      const center = userLoc ?? zipGeo;
      if (center) {
        list.sort(
          (a, b) =>
            haversineMiles(center, { lat: a.lat, lng: a.lng }) -
            haversineMiles(center, { lat: b.lat, lng: b.lng }),
        );
      }
    }
    return list;
  }, [filtered, sortBy, userLoc, zipGeo]);

  const suggestions = useMemo(
    () => nameSuggestions(members, nameQuery, 12),
    [members, nameQuery],
  );

  const highlightId =
    selectedId && sorted.some((m) => m.id === selectedId) ? selectedId : null;

  const areaCenter = userLoc ?? zipGeo;
  const radiusActive = radiusMiles !== 'none';

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

  const pickSuggestion = useCallback((m: Member) => {
    setNameQuery(m.name);
    setSuggestOpen(false);
    setSelectedId(m.id);
    setFocusTarget({ lat: m.lat, lng: m.lng });
    requestAnimationFrame(() => {
      cardRefs.current[m.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (nameWrapRef.current && !nameWrapRef.current.contains(e.target as Node)) {
        setSuggestOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-12 lg:items-end">
          <div className="relative lg:col-span-5" ref={nameWrapRef}>
            <Label htmlFor="member-name-search" className="text-foreground">
              Business name
            </Label>
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="member-name-search"
                className="pl-9"
                placeholder="Type to search or pick from suggestions"
                value={nameQuery}
                onChange={(e) => {
                  setNameQuery(e.target.value);
                  setSuggestOpen(true);
                }}
                onFocus={() => setSuggestOpen(true)}
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={suggestOpen && suggestions.length > 0}
                aria-controls="member-name-suggestions"
              />
              {suggestOpen && nameQuery.trim().length > 0 && suggestions.length > 0 ? (
                <ul
                  id="member-name-suggestions"
                  role="listbox"
                  className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-popover py-1 text-popover-foreground shadow-md"
                >
                  {suggestions.map((m) => (
                    <li key={m.id} role="option">
                      <button
                        type="button"
                        className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-accent"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickSuggestion(m)}
                      >
                        {m.logoUrl ? (
                          <img
                            src={m.logoUrl}
                            alt=""
                            className="mt-0.5 size-8 shrink-0 rounded border border-border bg-background object-contain p-0.5"
                          />
                        ) : (
                          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded border border-dashed border-border bg-muted">
                            <Building2 className="size-4 text-muted-foreground" />
                          </span>
                        )}
                        <span>
                          <span className="font-medium text-foreground">{m.name}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {extractZipFromAddress(m.address) ?? m.address.slice(0, 42)}
                            {m.address.length > 42 ? '…' : ''}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Matches name, category, and address text.
            </p>
          </div>

          <div className="lg:col-span-3">
            <Label htmlFor="member-zip">ZIP code</Label>
            <Input
              id="member-zip"
              className="mt-1.5"
              placeholder="e.g. 97225"
              inputMode="numeric"
              maxLength={5}
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
            />
            {zipGeoStatus === 'loading' && /^\d{5}$/.test(zipInput.trim()) ? (
              <p className="mt-1 text-xs text-muted-foreground">Locating ZIP…</p>
            ) : null}
            {zipGeoStatus === 'error' && /^\d{5}$/.test(zipInput.trim()) ? (
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-500">
                Could not geocode ZIP; filtering by address text only.
              </p>
            ) : null}
          </div>

          <div className="lg:col-span-2">
            <Label>Surrounding area</Label>
            <Select
              value={radiusMiles}
              onValueChange={(v) => setRadiusMiles(v as RadiusValue)}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Surrounding area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ZIP in address only (no radius)</SelectItem>
                <SelectItem value="5" disabled={!areaCenter}>
                  Within 5 mi of ZIP / location
                </SelectItem>
                <SelectItem value="10" disabled={!areaCenter}>
                  Within 10 mi of ZIP / location
                </SelectItem>
                <SelectItem value="25" disabled={!areaCenter}>
                  Within 25 mi of ZIP / location
                </SelectItem>
              </SelectContent>
            </Select>
            {radiusActive && !areaCenter ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Enter a valid ZIP or use your location.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:col-span-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortMode)}>
              <SelectTrigger className="w-full">
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
            <Button type="button" variant="outline" className="w-full shrink-0" onClick={requestLocation}>
              <Navigation className="mr-2 size-4" />
              My location
            </Button>
          </div>
        </div>
        {geoError && <p className="mt-3 text-sm text-destructive">{geoError}</p>}
      </div>

      <p className="text-sm text-muted-foreground">
        Showing <strong className="text-foreground">{sorted.length}</strong> of {members.length}{' '}
        members. Map pins update with filters; green = members, red = selected.
      </p>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="order-1 lg:sticky lg:top-24 lg:order-none">
          <MembersMap
            members={sorted}
            selectedId={highlightId}
            focusTarget={focusTarget}
            onMarkerClick={onMarkerClick}
          />
        </div>
        <div className="order-2 flex max-h-[min(78vh,900px)] flex-col gap-4 overflow-y-auto pr-1">
          {sorted.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <p className="font-medium text-foreground">No members match</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Try another name, ZIP, or widen the surrounding area.
                </p>
              </CardContent>
            </Card>
          ) : (
            sorted.map((m) => (
              <article
                key={m.id}
                ref={(el) => {
                  cardRefs.current[m.id] = el;
                }}
              >
                <Card
                  className={cn(
                    'overflow-hidden border-border shadow-sm transition-all duration-200 hover:shadow-md',
                    highlightId === m.id &&
                      'ring-2 ring-red-600/90 ring-offset-2 ring-offset-background',
                  )}
                >
                  <button
                    type="button"
                    className="flex w-full text-left"
                    onClick={() => onCardActivate(m.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onCardActivate(m.id);
                      }
                    }}
                  >
                    <div className="flex w-full gap-0 sm:gap-0">
                      <div className="relative flex w-[100px] shrink-0 flex-col items-center justify-center border-b border-border bg-muted/40 p-3 sm:w-[120px] sm:border-b-0 sm:border-r">
                        {m.logoUrl ? (
                          <img
                            src={m.logoUrl}
                            alt={`${m.name} logo`}
                            className="max-h-20 w-full max-w-[88px] object-contain"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex h-20 w-full max-w-[88px] items-center justify-center rounded-lg border border-dashed border-border bg-background">
                            <Building2 className="size-10 text-muted-foreground/60" />
                          </div>
                        )}
                      </div>
                      <CardContent className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h3 className="font-serif text-lg font-semibold leading-tight tracking-tight text-foreground sm:text-xl">
                              {m.name}
                            </h3>
                            {highlightId === m.id ? (
                              <Badge variant="destructive" className="shrink-0 text-[10px] uppercase">
                                Selected
                              </Badge>
                            ) : null}
                          </div>
                          <Badge variant="secondary" className="max-w-full whitespace-normal text-left font-normal">
                            {m.category}
                          </Badge>
                        </div>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <MapPin className="mt-0.5 size-4 shrink-0 text-primary/80" aria-hidden />
                          <span className="leading-snug">{m.address}</span>
                        </div>
                        {m.description ? (
                          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                            {m.description}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3">
                          {m.phone ? (
                            <a
                              href={`tel:${m.phone.replace(/\s/g, '')}`}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone className="size-4 shrink-0" aria-hidden />
                              {m.phone}
                            </a>
                          ) : null}
                          {m.website ? (
                            <Link
                              href={m.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Globe className="size-4 shrink-0" aria-hidden />
                              Website
                            </Link>
                          ) : null}
                        </div>
                      </CardContent>
                    </div>
                  </button>
                </Card>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
