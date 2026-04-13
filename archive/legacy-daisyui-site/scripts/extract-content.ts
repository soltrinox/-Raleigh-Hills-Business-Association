/**
 * Reads cache/site (manifest + HTML) and writes structured JSON under content/
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import {
  type CacheManifest,
  pathSegmentsFromUrl,
  pageIdFromSegments,
  stripUnsafe,
  cleanupHtml,
  extractMainHtml,
} from "./lib/site-cache-main.js";
import {
  type NavJson,
  type EventJson,
  extractEventsFromText,
  deriveNavFromSamples,
} from "./lib/site-cache-events-nav.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CACHE_ROOT = join(ROOT, "cache", "site");
const PAGES_DIR = join(CACHE_ROOT, "pages");
const CONTENT_DIR = join(ROOT, "content");
const CONTENT_PAGES = join(CONTENT_DIR, "pages");

export type PageJson = {
  id: string;
  path: string[];
  sourceUrl: string;
  title: string;
  description: string;
  htmlMain: string;
};

export type { NavJson, EventJson };

/** Written by extract; curated labels live in `content/nav.primary.json` (never overwritten). */
export type NavAllJson = NavJson;

async function run() {
  const manifestPath = join(CACHE_ROOT, "manifest.json");
  if (!existsSync(manifestPath)) {
    console.error("Missing cache manifest. Run: npm run scrape");
    process.exit(1);
  }
  if (!existsSync(PAGES_DIR)) {
    console.error("Missing cache pages dir. Run: npm run scrape");
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as CacheManifest;
  mkdirSync(CONTENT_PAGES, { recursive: true });

  const pages: PageJson[] = [];
  const allEvents: EventJson[] = [];

  for (const entry of manifest.entries) {
    if (entry.status >= 400) continue;
    const disk = join(PAGES_DIR, entry.pagePath);
    if (!existsSync(disk)) continue;
    const raw = readFileSync(disk, "utf8");
    const $ = cheerio.load(raw);
    const title = $("title").first().text().trim() || "Untitled";
    const description =
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() ||
      "";

    let mainHtml = extractMainHtml($);
    if (!mainHtml) {
      mainHtml = $("body").html() ?? "";
    }
    mainHtml = cleanupHtml(stripUnsafe(mainHtml));

    const path = pathSegmentsFromUrl(entry.sourceUrl);
    const id = pageIdFromSegments(path);
    const record: PageJson = {
      id,
      path,
      sourceUrl: entry.sourceUrl,
      title,
      description,
      htmlMain: mainHtml,
    };
    pages.push(record);
    writeFileSync(join(CONTENT_PAGES, `${id}.json`), JSON.stringify(record, null, 2), "utf8");

    const plain = $.text();
    allEvents.push(...extractEventsFromText(plain, entry.sourceUrl, title));
  }

  pages.sort((a, b) => a.sourceUrl.localeCompare(b.sourceUrl));

  const navAll: NavAllJson = deriveNavFromSamples(pages);
  writeFileSync(join(CONTENT_DIR, "nav.all.json"), JSON.stringify(navAll, null, 2), "utf8");

  const eventsPath = join(CONTENT_DIR, "events.json");
  let manualPreserved: EventJson[] = [];
  if (existsSync(eventsPath)) {
    try {
      const prev = JSON.parse(readFileSync(eventsPath, "utf8")) as { manual?: EventJson[] };
      manualPreserved = Array.isArray(prev.manual) ? prev.manual : [];
    } catch {
      manualPreserved = [];
    }
  }
  writeFileSync(
    join(CONTENT_DIR, "events.json"),
    JSON.stringify(
      {
        manual: manualPreserved,
        generatedAt: new Date().toISOString(),
        events: allEvents,
      },
      null,
      2
    ),
    "utf8"
  );

  const index = {
    generatedAt: new Date().toISOString(),
    pages: pages.map((p) => ({
      id: p.id,
      path: p.path,
      title: p.title,
      sourceUrl: p.sourceUrl,
    })),
  };
  writeFileSync(join(CONTENT_DIR, "manifest.json"), JSON.stringify(index, null, 2), "utf8");

  console.log(`Extracted ${pages.length} pages → ${CONTENT_PAGES}`);
  console.log(
    `nav.all.json, events.json (${manualPreserved.length} manual + ${allEvents.length} extracted), manifest.json`
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
