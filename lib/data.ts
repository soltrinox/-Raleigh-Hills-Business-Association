import type {
  SiteBundle,
  EventsData,
  NavData,
  NavConfig,
  Page,
  CalendarEvent,
  HomeFeedData,
  HomeFeedItem,
} from './types';
import siteBundleData from '@/data/site.bundle.json';
import eventsData from '@/data/events.json';
import navData from '@/data/nav.json';
import homeFeedData from '@/data/home-feed.json';

// Type assertions for imported JSON
const siteBundle = siteBundleData as SiteBundle;
const events = eventsData as EventsData;
const nav = navData as NavData;

// Navigation configuration - organized hierarchy
export const navConfig: NavConfig = {
  main: [
    { label: 'Home', href: '/' },
    {
      label: 'About',
      children: [
        { label: 'About RHBA', href: '/about' },
        { label: 'Area History', href: '/area-history' },
        { label: 'Leadership', href: '/leadership' },
        { label: 'Mission & Vision', href: '/about#mission' },
      ],
    },
    {
      label: 'Events',
      children: [
        { label: 'All Events', href: '/events' },
        { label: 'Calendar', href: '/calendar' },
        { label: 'Recycle/Shred Event', href: '/events/shred-event' },
        { label: 'School Supply Drive', href: '/events/school-supplies' },
        { label: 'Shop With A Cop', href: '/events/shop-with-a-cop' },
        { label: 'Coffee Meetup', href: '/events/coffee-meetup' },
        { label: 'No-Host Lunch', href: '/events/lunch-meetup' },
      ],
    },
    {
      label: 'Members',
      children: [
        { label: 'Member Directory', href: '/members' },
        { label: 'Member Benefits', href: '/member-benefits' },
        { label: 'Member Spotlight', href: '/member-spotlight' },
        { label: 'Member Bulletin Board', href: '/bulletin-board' },
      ],
    },
    {
      label: 'Community',
      children: [
        { label: 'Community Support', href: '/community-support' },
        { label: 'Non-Profit Spotlights', href: '/non-profit-spotlights' },
        { label: 'RH PARR', href: '/rh-parr' },
        { label: 'Mural', href: '/mural' },
      ],
    },
    { label: 'Join', href: '/join' },
    { label: 'Contact', href: '/contact' },
  ],
  footer: {
    columns: [
      {
        title: 'About',
        links: [
          { label: 'About RHBA', href: '/about' },
          { label: 'Area History', href: '/area-history' },
          { label: 'Leadership', href: '/leadership' },
          { label: 'Contact Us', href: '/contact' },
        ],
      },
      {
        title: 'Events',
        links: [
          { label: 'All Events', href: '/events' },
          { label: 'Calendar', href: '/calendar' },
          { label: 'Recycle/Shred Event', href: '/events/shred-event' },
          { label: 'School Supply Drive', href: '/events/school-supplies' },
        ],
      },
      {
        title: 'Members',
        links: [
          { label: 'Member Directory', href: '/members' },
          { label: 'Member Benefits', href: '/member-benefits' },
          { label: 'Join RHBA', href: '/join' },
          { label: 'Member Login', href: '/login' },
        ],
      },
      {
        title: 'Community',
        links: [
          { label: 'Community Support', href: '/community-support' },
          { label: 'Non-Profit Spotlights', href: '/non-profit-spotlights' },
          { label: 'Bulletin Board', href: '/bulletin-board' },
        ],
      },
    ],
  },
};

// Get all pages from site bundle
export function getAllPages(): Page[] {
  return siteBundle.pages;
}

// Get a specific page by ID or path
export function getPageById(id: string): Page | undefined {
  return siteBundle.pages.find(page => page.id === id);
}

export function getPageByPath(path: string[]): Page | undefined {
  return siteBundle.pages.find(page => 
    page.path.length === path.length && 
    page.path.every((segment, i) => segment === path[i])
  );
}

// Get page by slug (single segment path)
export function getPageBySlug(slug: string): Page | undefined {
  return siteBundle.pages.find(page => 
    page.path.length === 1 && page.path[0] === slug
  );
}

/**
 * Clean URLs in nav/footer → WordPress slug segments stored in the bundle.
 * Keys are slug paths joined with "/" (e.g. events/shred-event).
 */
export const ROUTE_TO_BUNDLE_SEGMENTS: Record<string, string[]> = {
  contact: ['contact-us'],
  join: ['rhba-application'],
  'events/shred-event': ['recycle-and-shred-event-happening-april-18-2026'],
  'events/school-supplies': ['back-pack-program-2021'],
  'events/shop-with-a-cop': ['shop-with-a-cop'],
  'events/coffee-meetup': ['coffee-meetup'],
  'events/lunch-meetup': ['no-host-lunch-meetup'],
  'member-spotlight': ['member-spotlights-via-zoom'],
  'bulletin-board': ['member-bulletin-board'],
  'non-profit-spotlights': ['rhba-non-profit-member-spotlight-stories'],
};

export function formatPageTitle(rawTitle: string): string {
  const t = rawTitle.split('|')[0]?.trim() ?? rawTitle;
  return t || 'RHBA';
}

/** Resolve App Router slug segments to a bundle page (after alias mapping). */
export function getPageForSlug(slug: string[]): Page | undefined {
  if (!slug.length) return undefined;
  const decoded = slug.map((s) => decodeURIComponent(s));
  const key = decoded.join('/');
  const mapped = ROUTE_TO_BUNDLE_SEGMENTS[key];
  const path = mapped ?? decoded;
  return getPageByPath(path);
}

/** Single-segment paths handled by `app/<segment>/page.tsx` (not the catch-all). */
const RESERVED_FIRST_CLASS_SLUGS = new Set(['members', 'events']);

function isReservedSlugPath(slug: string[]): boolean {
  return slug.length === 1 && RESERVED_FIRST_CLASS_SLUGS.has(slug[0]);
}

/** Params for `app/[...slug]` static generation: every bundle path + every alias. */
export function getAllStaticSlugParams(): { slug: string[] }[] {
  const seen = new Set<string>();
  const out: { slug: string[] }[] = [];

  const add = (slug: string[]) => {
    if (isReservedSlugPath(slug)) return;
    const k = JSON.stringify(slug);
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ slug });
  };

  for (const page of siteBundle.pages) {
    if (page.path.length > 0) add(page.path);
  }
  for (const key of Object.keys(ROUTE_TO_BUNDLE_SEGMENTS)) {
    add(key.split('/').filter(Boolean));
  }
  return out;
}

// Get all events
export function getAllEvents(): CalendarEvent[] {
  // Combine manual and auto-generated events
  const allEvents = [...events.manual, ...events.events];
  
  // Filter and clean up events
  return allEvents
    .filter(event => {
      // Filter out very old events and invalid dates
      const startDate = new Date(event.start);
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      return startDate > oneYearAgo;
    })
    .map(event => ({
      ...event,
      // Clean up titles that are just the site name
      title: event.title.includes('Raleigh Hills Business Association') && event.description
        ? extractTitleFromDescription(event.description)
        : event.title,
    }))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

// Get upcoming events
export function getUpcomingEvents(limit?: number): CalendarEvent[] {
  const now = new Date();
  const upcoming = getAllEvents().filter(event => new Date(event.start) >= now);
  return limit ? upcoming.slice(0, limit) : upcoming;
}

// Get recurring events
export function getRecurringEvents(): CalendarEvent[] {
  return getAllEvents().filter(event => event.recurringRule);
}

// Helper to extract a better title from description
function extractTitleFromDescription(description: string): string {
  // Try to get first meaningful line
  const lines = description.split('\n').filter(line => line.trim().length > 0);
  const firstLine = lines[0] || '';
  
  // Clean up and truncate if needed
  const cleaned = firstLine.replace(/^[^a-zA-Z]*/, '').trim();
  return cleaned.length > 60 ? cleaned.substring(0, 57) + '...' : cleaned || 'RHBA Event';
}

// Get featured content
export function getFeaturedEvent(): CalendarEvent | undefined {
  // Look for the shred event or next major event
  const upcoming = getUpcomingEvents();
  const shredEvent = upcoming.find(e => 
    e.description?.toLowerCase().includes('shred') || 
    e.title.toLowerCase().includes('shred')
  );
  return shredEvent || upcoming[0];
}

// Get all navigation links from raw nav data
export function getAllNavLinks() {
  return nav.links;
}

export function getHomeFeed(): HomeFeedItem[] {
  try {
    const data = homeFeedData as HomeFeedData;
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [];
  }
}

// Site metadata
export function getSiteMetadata() {
  return {
    name: 'Raleigh Hills Business Association',
    shortName: 'RHBA',
    description: 'Supporting local businesses and strengthening our community in Raleigh Hills, Oregon',
    email: 'info@RaleighHillsBusinessAssn.org',
    address: '10445 SW Canyon Rd, Suite 116, Beaverton OR 97005',
    phone: '503-452-0071',
    zoomLink: 'https://us02web.zoom.us/j/87045373262?pwd=Y0w3VkpqTEpBeXkxd0x1STBDMnJZdz09',
    membershipFee: {
      new: 100,
      renewal: 75,
    },
  };
}
