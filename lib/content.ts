import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export type PageRecord = {
  id: string;
  path: string[];
  title: string;
  sourceUrl: string;
};

export type PageDetail = PageRecord & {
  description: string;
  htmlMain: string;
};

export type ContentManifest = {
  generatedAt: string;
  pages: PageRecord[];
};

export type NavLink = { href: string; label: string };

export type NavData = {
  /** Header + top of drawer — curated short list */
  primary: NavLink[];
  /** Full mirrored IA — drawer “More pages” only */
  all: NavLink[];
};

const contentRoot = join(process.cwd(), "content");

export function getContentManifest(): ContentManifest {
  const p = join(contentRoot, "manifest.json");
  if (!existsSync(p)) {
    return { generatedAt: "", pages: [] };
  }
  return JSON.parse(readFileSync(p, "utf8")) as ContentManifest;
}

const DEFAULT_PRIMARY: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/calendar", label: "Calendar" },
];

export function getNav(): NavData {
  const primaryPath = join(contentRoot, "nav.primary.json");
  const allPath = join(contentRoot, "nav.all.json");
  const legacyPath = join(contentRoot, "nav.json");

  let primary = DEFAULT_PRIMARY;
  if (existsSync(primaryPath)) {
    try {
      const data = JSON.parse(readFileSync(primaryPath, "utf8")) as { links?: NavLink[] };
      if (Array.isArray(data.links) && data.links.length > 0) primary = data.links;
    } catch {
      /* keep default */
    }
  }

  let all: NavLink[] = [];
  if (existsSync(allPath)) {
    try {
      const data = JSON.parse(readFileSync(allPath, "utf8")) as { links?: NavLink[] };
      if (Array.isArray(data.links)) all = data.links;
    } catch {
      all = [];
    }
  } else if (existsSync(legacyPath)) {
    try {
      const data = JSON.parse(readFileSync(legacyPath, "utf8")) as { links?: NavLink[] };
      if (Array.isArray(data.links)) all = data.links;
    } catch {
      all = [];
    }
  }

  return { primary, all };
}

export function getPageBySlug(slug: string[]): PageDetail | null {
  const manifest = getContentManifest();
  const key = slug.join("/");
  const rec = manifest.pages.find((p) => p.path.join("/") === key);
  if (!rec) return null;
  const fp = join(contentRoot, "pages", `${rec.id}.json`);
  if (!existsSync(fp)) return null;
  return JSON.parse(readFileSync(fp, "utf8")) as PageDetail;
}

export function getHomePage(): PageDetail | null {
  return getPageBySlug([]);
}
