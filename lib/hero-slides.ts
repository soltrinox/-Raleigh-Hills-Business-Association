import type { Member, PhotoEntry } from '@/lib/types';

export type HeroFaderSlide =
  | { kind: 'org'; photo: PhotoEntry }
  | { kind: 'member'; src: string; alt: string };

/**
 * Mixes manifest `hero` photos with member `logoUrl` images when available.
 */
export function buildHeroSlides(
  heroPhotos: PhotoEntry[],
  members: Member[],
): HeroFaderSlide[] {
  const withLogo = members
    .filter((m) => typeof m.logoUrl === 'string' && m.logoUrl.trim().length > 0)
    .map((m) => ({
      kind: 'member' as const,
      src: m.logoUrl!.trim(),
      alt: `${m.name} — RHBA member`,
    }));

  const org: HeroFaderSlide[] = heroPhotos.map((photo) => ({
    kind: 'org',
    photo,
  }));

  if (withLogo.length === 0) return org;

  const out: HeroFaderSlide[] = [];
  const max = Math.max(org.length, withLogo.length);
  for (let i = 0; i < max; i++) {
    if (i < org.length) out.push(org[i]!);
    if (i < withLogo.length) out.push(withLogo[i]!);
  }
  return out;
}
