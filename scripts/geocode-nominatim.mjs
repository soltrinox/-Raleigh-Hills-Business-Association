/**
 * Shared Nominatim forward geocode (OSM usage policy: max 1 req/sec).
 * @see https://operations.osmfoundation.org/policies/nominatim/
 */

export const NOMINATIM_UA =
  'RHBA-microsite-import/1.0 (https://raleighhillsbusiness.com; members geocode validate)';

const MIN_INTERVAL_MS = 1100;
let lastRequestAt = 0;

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function throttledFetch(url, init) {
  const now = Date.now();
  const wait = Math.max(0, MIN_INTERVAL_MS - (now - lastRequestAt));
  if (wait) await sleep(wait);
  lastRequestAt = Date.now();
  const res = await fetch(url, init);
  return res;
}

/** Remove suite / unit / # fragments that often break geocoding. */
export function stripSuiteLine(address) {
  return address
    .replace(/\s*,\s*(suite|ste\.?|unit|apt\.?|#)\s*[^,]+/gi, '')
    .replace(/\s+(suite|ste\.?|unit|apt\.?|#)\s*[^,]+/gi, '')
    .replace(/,\s*,/g, ',')
    .replace(/^\s*,|,\s*$/g, '')
    .trim();
}

/**
 * Expand quadrant abbreviations so Nominatim does not confuse SE vs SW, etc.
 */
export function expandStreetQuadrants(address) {
  return address
    .replace(/\bNW\b/g, 'Northwest')
    .replace(/\bNE\b/g, 'Northeast')
    .replace(/\bSW\b/g, 'Southwest')
    .replace(/\bSE\b/g, 'Southeast');
}

/** Normalize scraped quirks before sending to Nominatim. */
export function normalizeForGeocode(address) {
  let s = expandStreetQuadrants(address.trim());
  s = s.replace(/\s*,\s*C\s*,/gi, ','); // e.g. "Shaw Street, C, Beaverton"
  s = s.replace(/\s*#\s*[A-Za-z0-9-]+/g, ''); // unit numbers often break search
  s = s.replace(/\s+,/g, ',').replace(/,\s*,/g, ',').trim();
  return s;
}

/** min lon, max lat, max lon, min lat — Portland metro + nearby (Nominatim viewbox). */
const PORTLAND_METRO_VIEWBOX = '-123.45,45.75,-122.25,45.28';

/**
 * @param {string} q
 * @param {{ countrycodes?: string | null; viewbox?: string | null; bounded?: boolean }} opts
 */
async function geocodeOnce(q, opts = {}) {
  const { countrycodes = null, viewbox = null, bounded = false } = opts;
  const params = new URLSearchParams({
    format: 'json',
    limit: '1',
    q,
    addressdetails: '0',
  });
  if (countrycodes) params.set('countrycodes', countrycodes);
  if (viewbox) {
    params.set('viewbox', viewbox);
    if (bounded) params.set('bounded', '1');
  }
  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  const res = await throttledFetch(url, {
    headers: { 'User-Agent': NOMINATIM_UA, Accept: 'application/json' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.length) return null;
  const lat = parseFloat(data[0].lat);
  const lng = parseFloat(data[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, displayName: data[0].display_name };
}

/**
 * Try US-biased search, then global, then suite-stripped variants (each Nominatim call is throttled).
 * @param {string} address
 */
export async function geocodeAddress(address) {
  const trimmed = (address || '').trim();
  if (!trimmed) return null;
  if (/see website|metro\s*\(/i.test(trimmed) && trimmed.length < 48) return null;
  if (/^\s*PO\s+Box\b/i.test(trimmed)) return null;

  const normalized = normalizeForGeocode(trimmed);
  const q = `${normalized}, USA`;

  const inOregon = /\bOregon\b|\bOR\b/i.test(trimmed);

  let r = null;
  if (inOregon) {
    r = await geocodeOnce(q, {
      countrycodes: 'us',
      viewbox: PORTLAND_METRO_VIEWBOX,
      bounded: true,
    });
    if (r) return r;
  }
  r = await geocodeOnce(q, { countrycodes: 'us' });
  if (r) return r;
  r = await geocodeOnce(q, {});
  if (r) return r;

  const stripped = stripSuiteLine(normalized);
  if (stripped === normalized) return null;

  const q2 = `${stripped}, USA`;
  if (inOregon) {
    r = await geocodeOnce(q2, {
      countrycodes: 'us',
      viewbox: PORTLAND_METRO_VIEWBOX,
      bounded: true,
    });
    if (r) return r;
  }
  r = await geocodeOnce(q2, { countrycodes: 'us' });
  if (r) return r;
  return geocodeOnce(q2, {});
}

/** Meters between two WGS84 points. */
export function haversineMeters(a, b) {
  const R = 6371000;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}
