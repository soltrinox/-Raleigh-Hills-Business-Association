/**
 * Canonical site URL for metadata, sitemap, and share links.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "http://localhost:3000";
}
