import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';
import { getAllDetailSlugs } from '@/lib/events';
import { getAllStaticSlugParams } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  const staticPaths = [
    '',
    '/about',
    '/calendar',
    '/events',
    '/gallery',
    '/members',
    '/join',
    '/contact',
    '/member-benefits',
    '/community-support',
    '/events/shred-event',
    '/events/school-supplies',
    '/events/shop-with-a-cop',
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path || '/'}`,
    lastModified,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));

  for (const slug of getAllDetailSlugs(18)) {
    entries.push({
      url: `${base}/events/${encodeURIComponent(slug)}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.65,
    });
  }

  for (const { slug } of getAllStaticSlugParams()) {
    const path = slug.join('/');
    entries.push({
      url: `${base}/${path}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  }

  return entries;
}
