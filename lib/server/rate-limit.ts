/** Simple in-memory sliding window per key (sufficient for a low-traffic site). */

const store = new Map<string, { count: number; windowStart: number }>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;

export function checkRateLimit(key: string): { ok: boolean } {
  const now = Date.now();
  const cur = store.get(key);
  if (!cur || now - cur.windowStart > WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now });
    return { ok: true };
  }
  if (cur.count >= MAX_REQUESTS) {
    return { ok: false };
  }
  cur.count += 1;
  return { ok: true };
}

export function clientKeyFromHeaders(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return (
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown'
  );
}
