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

After updating content, rebuild the **Vercel webapp** (under `VERCEL/`) or refresh the repo-root dev server:

```bash
npm run web:build
# or local preview of the deploy target:
npm run web:dev
```

### Manual events

Edit **`content/events.json`**: keep recurring or curated rows under **`manual`**. Re-running **`npm run extract`** preserves `manual` and refreshes the `events` array (auto-extracted only). The app merges `manual` + `events` at runtime (`lib/events.ts`).

## Local development

**Deploy target (Vercel webapp)** — Next.js + shadcn under `VERCEL/`; this is the only app wired for production deploy:

```bash
npm run web:install   # pnpm install in VERCEL/ (uses VERCEL/pnpm-lock.yaml)
npm run web:dev
```

Open [http://localhost:3000](http://localhost:3000).

**Repo-root app** — DaisyUI mirror used with the scrape/extract pipeline (same port if you only run one at a time):

```bash
npm install
npm run dev
```

### npm scripts: `VERCEL/` as project root

| Script | Runs in `VERCEL/` |
|--------|-------------------|
| `npm run web:install` | `pnpm install --frozen-lockfile` |
| `npm run web:dev` | `next dev` |
| `npm run web:build` | `next build` |
| `npm run web:start` | `next start` |
| `npm run web:lint` | `eslint .` |
| `npm run vercel:link` | `vercel link` (cwd `VERCEL/`) |
| `npm run vercel:pull` | `vercel pull` (path `VERCEL/`) |
| `npm run vercel:deploy` | `vercel deploy VERCEL` |
| `npm run vercel:deploy:prod` | `vercel deploy VERCEL --prod` |

From inside `VERCEL/`, you can also use `pnpm deploy` / `pnpm deploy:prod`.

## Deploy on Vercel

1. Connect the GitHub repo and create a project in [Vercel](https://vercel.com/).
2. **Settings → General → Root Directory:** set to **`VERCEL`** (required so the service only builds the shadcn app and uses `VERCEL/vercel.json`).
3. Framework preset: **Next.js**. Install/build on Vercel use **`pnpm`** per `VERCEL/vercel.json`.
4. Set **`NEXT_PUBLIC_SITE_URL`** to the production URL where applicable (see `env.example`).

The repo-root Next app (`app/` at repository root) is for local/tooling workflows and is **not** the connected Vercel deployment root when Root Directory is `VERCEL`.

## Layout of the repo

| Path | Role |
|------|------|
| `scripts/scrape-site.ts` | Sitemap crawler |
| `scripts/extract-content.ts` | HTML → per-page JSON |
| `scripts/extract-content-bundle.ts` | Cache → single `site.bundle.json` |
| `cache/` | Raw mirror (ignored by git) |
| `content/` | Data for Next (pages, nav, events, manifest) |
| `app/` | Routes: `/`, `/calendar`, `[...slug]`, `sitemap.xml` |
| `VERCEL/` | **Production webapp** — deploy with Vercel Root Directory = `VERCEL`; use `npm run web:*` / `vercel:*` from repo root |
| `lib/content.ts`, `lib/events.ts` | Loaders + recurring expansion |

## Compliance

Use the crawler only for migration or archival you are authorized to perform. Respect `robots.txt` and site terms.
