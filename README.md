# Raleigh Hills Business Association — Next.js mirror

Static Next.js (App Router) site with **Tailwind CSS**, **DaisyUI**, and **@tailwindcss/typography**. HTML is mirrored from [raleighhillsbusinessassn.org](https://raleighhillsbusinessassn.org/) via sitemap, cached under `cache/` (gitignored), and converted to JSON under `content/` for rendering and SEO.

## Prerequisites

- Node 20+
- npm (or swap commands for pnpm/yarn)

## Content pipeline

1. **`npm run scrape`** — Fetches `sitemap.xml` (including nested sitemaps), downloads each allowed page with a polite delay, stores HTML in `cache/site/pages/`, and writes `cache/site/manifest.json`. Skips `/wp-admin/` (except patterns allowed by the plan). Uses `ETag` / `Last-Modified` to skip unchanged files when headers repeat.
2. **`npm run extract`** — Reads the cache, extracts main column HTML with Cheerio (strips `script` / `iframe` / forms), runs a small cleanup pass (decorative lines, empty blocks, lazy `img`), writes `content/pages/*.json`, `content/manifest.json`, **`content/nav.all.json`** (every mirrored path), and merges extracted date hints into `content/events.json` while preserving the `manual` array. **`content/nav.primary.json`** is hand-curated for the header; extract does not overwrite it. If `nav.all.json` is missing, the app falls back to legacy `content/nav.json` for the drawer “More pages” list.
3. **`npm run extract:bundle`** *(optional but included in `content:update`)* — Writes **`content/site.bundle.json`**: one file with `generatedAt`, `pages[]` (each page has `id`, `path`, `sourceUrl`, `title`, `description`, **`textPlain`** collapsed whitespace, and **`blocks`** — ordered `heading` / `paragraph` / `list` / `blockquote` / `code` / `image` / `hr` with minimal fields), plus embedded **`nav`** (same shape as `nav.all.json`) and **`events`** (`manual` preserved from `events.json`, `events` auto-extracted, `generatedAt`). The Next app still loads per-page JSON from `content/pages/`; the bundle is for external publishers or tooling. Flags: `--include-html` adds `htmlMain` per page for debugging; `--minify` emits one-line JSON.

One shot:

```bash
npm run content:update
```

After updating content, rebuild or refresh dev:

```bash
npm run build
```

### Manual events

Edit **`content/events.json`**: keep recurring or curated rows under **`manual`**. Re-running **`npm run extract`** preserves `manual` and refreshes the `events` array (auto-extracted only). The app merges `manual` + `events` at runtime (`lib/events.ts`).

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push the repo and import the project in [Vercel](https://vercel.com/).
2. Framework preset: **Next.js** (default).
3. No secrets are required for the static content build. Set **`NEXT_PUBLIC_SITE_URL`** to your production URL so `app/sitemap.ts` emits correct absolute URLs (see `env.example`).
4. **CI option:** Add a build step `npm run content:update && npm run build` if you want every deploy to re-fetch the live site (slower, depends on the origin being up). Otherwise commit `content/` after running the pipeline locally.

## Layout of the repo

| Path | Role |
|------|------|
| `scripts/scrape-site.ts` | Sitemap crawler |
| `scripts/extract-content.ts` | HTML → per-page JSON |
| `scripts/extract-content-bundle.ts` | Cache → single `site.bundle.json` |
| `cache/` | Raw mirror (ignored by git) |
| `content/` | Data for Next (pages, nav, events, manifest) |
| `app/` | Routes: `/`, `/calendar`, `[...slug]`, `sitemap.xml` |
| `lib/content.ts`, `lib/events.ts` | Loaders + recurring expansion |

## Compliance

Use the crawler only for migration or archival you are authorized to perform. Respect `robots.txt` and site terms.
