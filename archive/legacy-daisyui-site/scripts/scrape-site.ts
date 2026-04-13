/**
 * Sitemap-driven polite crawler for raleighhillsbusinessassn.org.
 * Writes HTML under cache/site/pages/ and cache/site/manifest.json
 */
import { createWriteStream, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { XMLParser } from "fast-xml-parser";
import { pipeline } from "node:stream/promises";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CACHE_ROOT = join(ROOT, "cache", "site");
const PAGES_DIR = join(CACHE_ROOT, "pages");

const BASE = "https://raleighhillsbusinessassn.org";
const SITEMAP_URL = `${BASE}/sitemap.xml`;
const USER_AGENT =
  "RHBA-MirrorBot/1.0 (local migration; contact site owner; +https://github.com/)";

const DELAY_MS = 600;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) => name === "url" || name === "sitemap",
});

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function urlToPagePath(url: string): string {
  const u = new URL(url);
  if (u.origin !== new URL(BASE).origin) return "";
  const path = u.pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return "index.html";
  const safe = path
    .slice(1)
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("__");
  return `${safe}.html`;
}

function isAllowedByRobotsPath(pathname: string): boolean {
  if (pathname.startsWith("/wp-admin") && !pathname.includes("admin-ajax.php"))
    return false;
  return true;
}

async function fetchWithRetry(
  url: string,
  opts: RequestInit = {},
  retries = 4
): Promise<Response> {
  let last: Response | undefined;
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, {
      ...opts,
      headers: {
        "User-Agent": USER_AGENT,
        ...((opts.headers as Record<string, string>) || {}),
      },
    });
    last = res;
    if (res.status === 429 || res.status >= 500) {
      await delay(1500 * (i + 1));
      continue;
    }
    return res;
  }
  return last!;
}

async function collectSitemapUrls(sitemapUrl: string, seen: Set<string>): Promise<string[]> {
  const res = await fetchWithRetry(sitemapUrl);
  if (!res.ok) throw new Error(`Sitemap ${sitemapUrl}: ${res.status}`);
  const xml = await res.text();
  const doc = parser.parse(xml);

  const out: string[] = [];

  const normLoc = (v: unknown): string | null => {
    if (typeof v === "string") return v.trim();
    if (v && typeof v === "object" && "#text" in (v as object))
      return String((v as { "#text": string })["#text"]).trim();
    return null;
  };

  if (doc.sitemapindex?.sitemap) {
    const sm = doc.sitemapindex.sitemap;
    const list = Array.isArray(sm) ? sm : [sm];
    for (const item of list) {
      const loc = normLoc(item.loc);
      if (loc && !seen.has(loc)) {
        seen.add(loc);
        const nested = await collectSitemapUrls(loc, seen);
        out.push(...nested);
      }
    }
    return out;
  }

  if (doc.urlset?.url) {
    const urls = doc.urlset.url;
    const list = Array.isArray(urls) ? urls : [urls];
    for (const item of list) {
      const loc = normLoc(item.loc);
      if (loc) out.push(loc);
    }
    return out;
  }

  return out;
}

type ManifestEntry = {
  sourceUrl: string;
  pagePath: string;
  diskPath: string;
  status: number;
  contentType: string | null;
  fetchedAt: string;
  etag: string | null;
  lastModified: string | null;
};

function loadPriorManifest(): Map<string, ManifestEntry> {
  const p = join(CACHE_ROOT, "manifest.json");
  if (!existsSync(p)) return new Map();
  try {
    const j = JSON.parse(readFileSync(p, "utf8")) as { entries?: ManifestEntry[] };
    const m = new Map<string, ManifestEntry>();
    for (const e of j.entries || []) m.set(e.sourceUrl, e);
    return m;
  } catch {
    return new Map();
  }
}

async function run() {
  mkdirSync(PAGES_DIR, { recursive: true });

  const seenSitemaps = new Set<string>();
  let urls = await collectSitemapUrls(SITEMAP_URL, seenSitemaps);
  urls = [...new Set(urls)].filter((u) => {
    try {
      const p = new URL(u).pathname;
      return isAllowedByRobotsPath(p);
    } catch {
      return false;
    }
  });

  console.log(`Discovered ${urls.length} URLs from sitemap(s).`);

  const prior = loadPriorManifest();
  const entries: ManifestEntry[] = [];

  for (const url of urls) {
    const pagePath = urlToPagePath(url);
    if (!pagePath) continue;

    const diskPath = join(PAGES_DIR, pagePath);
    const prev = prior.get(url);

    const res = await fetchWithRetry(url);
    const etag = res.headers.get("etag");
    const lastModified = res.headers.get("last-modified");
    const contentType = res.headers.get("content-type");

    if (
      prev &&
      existsSync(diskPath) &&
      ((etag && prev.etag === etag) ||
        (lastModified && prev.lastModified === lastModified))
    ) {
      entries.push({
        ...prev,
        fetchedAt: new Date().toISOString(),
      });
      await delay(DELAY_MS);
      continue;
    }

    mkdirSync(dirname(diskPath), { recursive: true });
    if (!res.ok || !res.body) {
      writeFileSync(diskPath, `<!-- fetch failed: ${res.status} -->\n`, "utf8");
      entries.push({
        sourceUrl: url,
        pagePath,
        diskPath: join("cache", "site", "pages", pagePath),
        status: res.status,
        contentType,
        fetchedAt: new Date().toISOString(),
        etag,
        lastModified,
      });
      await delay(DELAY_MS);
      continue;
    }

    const dest = createWriteStream(diskPath);
    await pipeline(
      // @ts-expect-error Body is a web ReadableStream in Node 18+
      res.body,
      dest
    );
    entries.push({
      sourceUrl: url,
      pagePath,
      diskPath: join("cache", "site", "pages", pagePath),
      status: res.status,
      contentType,
      fetchedAt: new Date().toISOString(),
      etag,
      lastModified,
    });
    await delay(DELAY_MS);
  }

  entries.sort((a, b) => a.sourceUrl.localeCompare(b.sourceUrl));

  const manifest = {
    baseUrl: BASE,
    sitemapUrl: SITEMAP_URL,
    generatedAt: new Date().toISOString(),
    entries,
    urlCount: entries.length,
    contentHash: createHash("sha256")
      .update(entries.map((e) => e.sourceUrl + e.status).join("|"))
      .digest("hex")
      .slice(0, 16),
  };

  writeFileSync(join(CACHE_ROOT, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Wrote ${entries.length} pages under ${PAGES_DIR}`);
  console.log(`Manifest: ${join(CACHE_ROOT, "manifest.json")}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
