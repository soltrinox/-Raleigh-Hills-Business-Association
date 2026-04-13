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

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  description?: string;
  sourcePageUrl?: string;
  confidence?: 'high' | 'medium' | 'low';
  recurringRule?: string;
}

export interface EventsData {
  manual: CalendarEvent[];
  generatedAt: string;
  events: CalendarEvent[];
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
