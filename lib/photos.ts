import type { PhotoCategory, PhotoEntry } from '@/lib/types';
import photosData from '@/data/photos.json';

const data = photosData as { generatedAt?: string; photos: PhotoEntry[] };

const photos: PhotoEntry[] = data.photos ?? [];

/** Simple hash for deterministic picks (FNV-1a-ish). */
function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function getPhotos(category?: PhotoCategory): PhotoEntry[] {
  if (!category) return [...photos];
  return photos.filter((p) => p.category === category);
}

export function getHeroPhotos(): PhotoEntry[] {
  return photos.filter((p) => p.category === 'hero');
}

export function getEventPhotos(): PhotoEntry[] {
  return photos.filter((p) => p.category === 'event');
}

export function getThemedPhoto(key: string): PhotoEntry | null {
  return (
    photos.find((p) => p.category === 'themed' && p.themedKey === key) ?? null
  );
}

/** Photos shown on /gallery (everything except themed section banners). */
export function getGalleryPhotos(): PhotoEntry[] {
  return photos.filter((p) => p.category !== 'themed');
}

/**
 * Stable decorative images per page. Uses `decor` entries when present; otherwise `event` pool.
 */
export function pickDecorPhotos(seed: string, count: number): PhotoEntry[] {
  const decor = photos.filter((p) => p.category === 'decor');
  const pool =
    decor.length > 0 ? decor : photos.filter((p) => p.category === 'event');
  if (pool.length === 0 || count <= 0) return [];
  const out: PhotoEntry[] = [];
  const used = new Set<string>();
  let h = hashSeed(seed);
  for (let i = 0; i < count; i++) {
    h = Math.imul(h ^ i, 16777619);
    let idx = h % pool.length;
    let guard = 0;
    while (used.has(pool[idx]!.src) && guard < pool.length) {
      idx = (idx + 1) % pool.length;
      guard++;
    }
    const picked = pool[idx]!;
    used.add(picked.src);
    out.push(picked);
  }
  return out;
}
