/**
 * Reads cache/site like extract-content, writes one aggregate JSON with plain text + structured blocks.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import type { Element, Text, AnyNode } from "domhandler";
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
const BUNDLE_PATH = join(CONTENT_DIR, "site.bundle.json");

export type BundleBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string; inlineLinks?: Array<{ text: string; href: string }> }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "blockquote"; text: string }
  | { type: "code"; text: string }
  | { type: "image"; src: string; alt?: string }
  | { type: "hr" };

export type PageBundleRecord = {
  id: string;
  path: string[];
  sourceUrl: string;
  title: string;
  description: string;
  textPlain: string;
  blocks: BundleBlock[];
  htmlMain?: string;
};

export type SiteBundleJson = {
  generatedAt: string;
  pages: PageBundleRecord[];
  nav: NavJson;
  events: {
    manual: EventJson[];
    events: EventJson[];
    generatedAt: string;
  };
};

function normalizeWhitespace(s: string): string {
  return s.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function isTag(n: AnyNode): n is Element {
  return n.type === "tag";
}

function isText(n: AnyNode): n is Text {
  return n.type === "text";
}

function paragraphFromElement(
  $: cheerio.CheerioAPI,
  el: Element
): { text: string; inlineLinks?: Array<{ text: string; href: string }> } {
  const links: Array<{ text: string; href: string }> = [];
  $(el)
    .find("a[href]")
    .each((_, a) => {
      const $a = $(a);
      const href = $a.attr("href") || "";
      const text = $a.text().trim();
      if (href && text) links.push({ text, href });
    });
  const text = normalizeWhitespace($(el).text());
  return links.length ? { text, inlineLinks: links } : { text };
}

function imgBlock($: cheerio.CheerioAPI, el: Element): BundleBlock | null {
  const src = $(el).attr("src") || $(el).attr("data-src") || "";
  if (!src) return null;
  return {
    type: "image",
    src,
    alt: $(el).attr("alt") || undefined,
  };
}

/** Walk block-level nodes in document order inside cleaned main HTML. */
function extractBlocksFromMainHtml(html: string): BundleBlock[] {
  if (!html.trim()) return [];
  const $ = cheerio.load(`<div data-bundle-root="1">${html}</div>`, { xml: false }, false);
  const root = $(`[data-bundle-root="1"]`).get(0);
  if (!root || !isTag(root)) return [];

  const blocks: BundleBlock[] = [];

  function walkChildren(nodes: AnyNode[]): void {
    let paraBuf: AnyNode[] = [];

    const flushPara = () => {
      if (paraBuf.length === 0) return;
      const tmp = cheerio.load("<div></div>", { xml: false }, false);
      const holder = tmp("div");
      for (const n of paraBuf) {
        holder.append($(n).clone());
      }
      const h = holder.get(0);
      if (h && isTag(h)) {
        const p = paragraphFromElement($, h);
        if (p.text) {
          blocks.push(
            p.inlineLinks?.length
              ? { type: "paragraph", text: p.text, inlineLinks: p.inlineLinks }
              : { type: "paragraph", text: p.text }
          );
        }
      }
      paraBuf = [];
    };

    for (const node of nodes) {
      if (isText(node)) {
        const t = normalizeWhitespace(node.data || "");
        if (t) paraBuf.push(node);
        continue;
      }
      if (!isTag(node)) continue;

      const tag = node.tagName.toLowerCase();
      const $node = $(node);

      if (/^h[1-6]$/.test(tag)) {
        flushPara();
        blocks.push({
          type: "heading",
          level: parseInt(tag.slice(1), 10),
          text: normalizeWhitespace($node.text()),
        });
        continue;
      }

      if (tag === "p") {
        flushPara();
        const innerBuf: AnyNode[] = [];
        const flushInner = () => {
          if (innerBuf.length === 0) return;
          const holder = cheerio.load("<div></div>", { xml: false }, false)("div");
          for (const n of innerBuf) {
            holder.append($(n).clone());
          }
          const h = holder.get(0);
          if (h && isTag(h)) {
            const pr = paragraphFromElement($, h);
            if (pr.text) {
              blocks.push(
                pr.inlineLinks?.length
                  ? { type: "paragraph", text: pr.text, inlineLinks: pr.inlineLinks }
                  : { type: "paragraph", text: pr.text }
              );
            }
          }
          innerBuf.length = 0;
        };
        $node.contents().each((_, child) => {
          if (isText(child)) {
            const t = normalizeWhitespace(child.data || "");
            if (t) innerBuf.push(child);
            return;
          }
          if (!isTag(child)) return;
          const ct = child.tagName.toLowerCase();
          if (ct === "img") {
            flushInner();
            const b = imgBlock($, child);
            if (b) blocks.push(b);
            return;
          }
          if (ct === "br") return;
          innerBuf.push(child);
        });
        flushInner();
        continue;
      }

      if (tag === "ul" || tag === "ol") {
        flushPara();
        const items: string[] = [];
        $node.find("> li").each((__, li) => {
          items.push(normalizeWhitespace($(li).text()));
        });
        blocks.push({ type: "list", ordered: tag === "ol", items });
        continue;
      }

      if (tag === "blockquote") {
        flushPara();
        blocks.push({ type: "blockquote", text: normalizeWhitespace($node.text()) });
        continue;
      }

      if (tag === "pre") {
        flushPara();
        blocks.push({ type: "code", text: $node.text() });
        continue;
      }

      if (tag === "hr") {
        flushPara();
        blocks.push({ type: "hr" });
        continue;
      }

      if (tag === "figure" || (tag === "div" && $node.is(".wp-block-image"))) {
        flushPara();
        const $img = $node.find("img").first();
        if ($img.length) {
          const elImg = $img.get(0);
          if (elImg && isTag(elImg)) {
            const b = imgBlock($, elImg);
            if (b) blocks.push(b);
          }
        }
        continue;
      }

      if (tag === "img") {
        flushPara();
        const b = imgBlock($, node);
        if (b) blocks.push(b);
        continue;
      }

      if (
        tag === "div" ||
        tag === "section" ||
        tag === "article" ||
        tag === "aside" ||
        tag === "header" ||
        tag === "footer" ||
        tag === "span"
      ) {
        walkChildren([...node.childNodes]);
        continue;
      }

      flushPara();
      walkChildren([...node.childNodes]);
    }

    flushPara();
  }

  walkChildren([...root.childNodes]);
  return blocks;
}

function textPlainFromBlocks(html: string, blocks: BundleBlock[]): string {
  if (blocks.length > 0) {
    const parts = blocks.map((b) => {
      switch (b.type) {
        case "heading":
        case "paragraph":
        case "blockquote":
          return b.text;
        case "list":
          return b.items.join(" ");
        case "code":
          return b.text;
        case "image":
          return b.alt || "";
        case "hr":
          return "";
        default:
          return "";
      }
    });
    return normalizeWhitespace(parts.filter(Boolean).join("\n"));
  }
  const $ = cheerio.load(html, { xml: false }, false);
  return normalizeWhitespace($.root().text());
}

function parseArgs(argv: string[]) {
  return {
    includeHtml: argv.includes("--include-html"),
    minify: argv.includes("--minify"),
  };
}

async function run() {
  const { includeHtml, minify } = parseArgs(process.argv.slice(2));

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
  const pages: PageBundleRecord[] = [];
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
    const blocks = extractBlocksFromMainHtml(mainHtml);
    const textPlain = textPlainFromBlocks(mainHtml, blocks);

    const record: PageBundleRecord = {
      id,
      path,
      sourceUrl: entry.sourceUrl,
      title,
      description,
      textPlain,
      blocks,
    };
    if (includeHtml) {
      record.htmlMain = mainHtml;
    }
    pages.push(record);

    const plain = $.text();
    allEvents.push(...extractEventsFromText(plain, entry.sourceUrl, title));
  }

  pages.sort((a, b) => a.sourceUrl.localeCompare(b.sourceUrl));

  const nav = deriveNavFromSamples(pages);

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

  const bundle: SiteBundleJson = {
    generatedAt: new Date().toISOString(),
    pages,
    nav,
    events: {
      manual: manualPreserved,
      events: allEvents,
      generatedAt: new Date().toISOString(),
    },
  };

  const json = minify ? JSON.stringify(bundle) : JSON.stringify(bundle, null, 2);
  writeFileSync(BUNDLE_PATH, json, "utf8");

  console.log(`Wrote ${pages.length} pages → ${BUNDLE_PATH}`);
  console.log(
    `nav (${nav.links.length} links), events (${manualPreserved.length} manual + ${allEvents.length} extracted)`
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
