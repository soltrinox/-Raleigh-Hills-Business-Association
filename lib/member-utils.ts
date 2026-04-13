import type { Member } from '@/lib/types';

/** First US ZIP (5 digits) found in a string. */
export function extractZipFromAddress(address: string): string | null {
  const m = address.match(/\b(\d{5})(?:-\d{4})?\b/);
  return m ? m[1] : null;
}

/** Great-circle distance in miles. */
export function haversineMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 3958.8; // Earth radius in miles
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function memberMatchesNameQuery(m: Member, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const blob = `${m.name} ${m.category} ${m.address} ${m.description ?? ''}`.toLowerCase();
  return blob.includes(s);
}

export function memberMatchesZipInAddress(m: Member, zip: string): boolean {
  const z = zip.trim();
  if (!/^\d{5}$/.test(z)) return true;
  return m.address.includes(z);
}

export function memberWithinRadiusMiles(
  m: Member,
  center: { lat: number; lng: number },
  miles: number,
): boolean {
  return haversineMiles(center, { lat: m.lat, lng: m.lng }) <= miles;
}

/** Name suggestions for autocomplete (prefix match preferred, then includes). */
export function nameSuggestions(members: Member[], q: string, limit = 10): Member[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  const lower = (n: string) => n.toLowerCase();
  const starts = members.filter((m) => lower(m.name).startsWith(s));
  const includes = members.filter(
    (m) => !lower(m.name).startsWith(s) && lower(m.name).includes(s),
  );
  return [...starts, ...includes].slice(0, limit);
}
