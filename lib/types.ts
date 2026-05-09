// Site content types based on JSON structure

export interface InlineLink {
  text: string;
  href: string;
}

export interface ContentBlock {
  type: 'paragraph' | 'heading' | 'list' | 'image' | 'hr';
  text?: string;
  level?: number;
  ordered?: boolean;
  items?: string[];
  src?: string;
  alt?: string;
  inlineLinks?: InlineLink[];
}

export interface Page {
  id: string;
  path: string[];
  sourceUrl: string;
  title: string;
  description: string;
  textPlain: string;
  blocks: ContentBlock[];
}

export interface SiteBundle {
  generatedAt: string;
  pages: Page[];
}

/** Optional nested shapes for Meetup-style event detail pages (see `data/events.json`). */
export type EventSocialPlatform = 'facebook' | 'instagram' | 'linkedin' | 'x' | 'youtube' | 'zoom';

export interface EventLocation {
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
  mapUrl?: string;
  online?: boolean;
  joinUrl?: string;
}

export interface EventHost {
  name: string;
  role?: string;
  organization?: string;
  /** Cross-link to `/members` when present */
  memberId?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface EventLinks {
  primaryCta?: { label: string; href: string };
  website?: string;
  register?: string;
  tickets?: string;
  /** Override default `.ics` URL if needed */
  ics?: string;
  social?: Partial<Record<EventSocialPlatform, string | null>>;
  attachments?: { label: string; href: string }[];
}

export interface EventContact {
  name: string;
  role?: string;
  email?: string;
  phone?: string;
}

export type EventStatus = 'scheduled' | 'cancelled' | 'rescheduled' | 'sold_out';
export type EventVisibility = 'public' | 'members';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  description?: string;
  sourcePageUrl?: string;
  confidence?: 'high' | 'medium' | 'low';
  recurringRule?: string;
  /** URL segment for `/events/[slug]`; recurring instances use `${slug}-${yyyy-MM-dd}` */
  slug?: string;
  summary?: string;
  timezone?: string;
  allDay?: boolean;
  category?: string;
  tags?: string[];
  coverImage?: string;
  location?: EventLocation;
  host?: EventHost;
  links?: EventLinks;
  contacts?: EventContact[];
  status?: EventStatus;
  visibility?: EventVisibility;
}

export interface EventsData {
  manual?: CalendarEvent[];
  generatedAt?: string;
  events?: CalendarEvent[];
}

export interface NavLink {
  href: string;
  label: string;
}

export interface NavData {
  links: NavLink[];
}

// Navigation structure for the site
export interface NavItem {
  label: string;
  href?: string;
  children?: NavItem[];
}

export interface NavConfig {
  main: NavItem[];
  footer: {
    columns: {
      title: string;
      links: { label: string; href: string }[];
    }[];
  };
}

/** Member directory entry — see `data/members.json`. */
export interface Member {
  id: string;
  name: string;
  category: string;
  description?: string;
  address: string;
  lat: number;
  lng: number;
  website?: string;
  phone?: string;
  logoUrl?: string;
  /** Set when coordinates were placed manually (e.g. Nominatim ambiguity). */
  geocodeNote?: string;
}

export interface MembersData {
  generatedAt?: string;
  source?: string;
  geocoded?: boolean;
  geocodedAt?: string;
  geocodeValidatedAt?: string;
  members: Member[];
}

export interface HomeFeedItem {
  title: string;
  summary: string;
  href?: string;
  date?: string;
}

export interface HomeFeedData {
  items: HomeFeedItem[];
}

/** Organization photos manifest — see `data/photos.json` and `scripts/build-photos-manifest.mjs`. */
export type PhotoCategory = 'hero' | 'event' | 'themed' | 'decor';

export interface PhotoEntry {
  src: string;
  category: PhotoCategory;
  alt: string;
  width: number;
  height: number;
  tags?: string[];
  caption?: string;
  /** For `category: "themed"` — key passed to `<ThemedBanner themedKey="…" />`. */
  themedKey?: string;
  /** First hero slide uses `priority` when true. */
  priority?: boolean;
}

export interface PhotosData {
  generatedAt?: string;
  photos: PhotoEntry[];
}
