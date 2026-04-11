/**
 * Shared cache → main-column HTML helpers (used by extract-content + extract-content-bundle).
 */
import * as cheerio from "cheerio";

export type CacheManifest = {
  entries: Array<{
    sourceUrl: string;
    pagePath: string;
    status: number;
  }>;
};

export function pathSegmentsFromUrl(sourceUrl: string): string[] {
  const u = new URL(sourceUrl);
  const raw = u.pathname.replace(/\/+$/, "") || "/";
  if (raw === "/") return [];
  return raw
    .slice(1)
    .split("/")
    .filter(Boolean)
    .map((s) => decodeURIComponent(s));
}

export function pageIdFromSegments(segments: string[]): string {
  if (segments.length === 0) return "index";
  return segments.join("__");
}

export function stripUnsafe(html: string): string {
  const $ = cheerio.load(html, { xml: false });
  $("script, iframe, object, embed, form").remove();
  $("[onclick],[onerror]").removeAttr("onclick").removeAttr("onerror");
  return $.root().html() ?? "";
}

const DECORATIVE_LINE_RE = /^[\s~.\-_=•·]+$/u;

/** Post-process mirrored main HTML: separators, empty nodes, WP cruft, lazy images. */
export function cleanupHtml(html: string): string {
  if (!html.trim()) return html;
  const $ = cheerio.load(html, { xml: false }, false);

  $("p").each((_, el) => {
    const $el = $(el);
    if ($el.find("img").length) return;
    const text = $el.text().replace(/\u00a0/g, " ").trim();
    if (!text) return;
    if (DECORATIVE_LINE_RE.test(text)) $el.remove();
  });

  for (let pass = 0; pass < 8; pass++) {
    let removed = 0;
    $("p,div,span").each((_, el) => {
      const $el = $(el);
      const text = $el.text().replace(/\u00a0/g, " ").trim();
      const hasMedia = $el.find("img,video,svg,iframe").length > 0;
      if (!text && !hasMedia && $el.children().length === 0) {
        $el.remove();
        removed++;
      }
    });
    if (removed === 0) break;
  }

  $("div.wp-block-image").each((_, el) => {
    const $el = $(el);
    if ($el.find("img").length === 0 && !$el.text().trim()) {
      $el.remove();
    }
  });

  $("img").each((_, el) => {
    const $img = $(el);
    $img.removeAttr("width").removeAttr("height");
    if (!$img.attr("loading")) {
      $img.attr("loading", "lazy");
    }
  });

  let out = $.html();
  out = out.replace(/(?:<br\s*\/?>\s*){3,}/gi, "<br><br>");
  return out;
}

export function extractMainHtml($: cheerio.CheerioAPI): string | null {
  const selectors = [
    "article .entry-content",
    ".entry-content",
    "article",
    "main",
    "#content",
    ".site-content",
    "#primary",
  ];
  for (const sel of selectors) {
    const el = $(sel).first();
    if (el.length) return el.html() ?? "";
  }
  return null;
}
