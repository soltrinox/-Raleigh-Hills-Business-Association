# Raleigh Hills Business Association — Next.js site

Production **Next.js 16** (App Router) site with **Tailwind CSS v4**, **shadcn/ui**, and static content from **`data/`** (`site.bundle.json`, `events.json`, `nav.json`, `members.json`, `home-feed.json`).

## Prerequisites

- Node 20+
- [pnpm](https://pnpm.io/) 10+ (see `packageManager` in `package.json`)

## Local development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
pnpm build
pnpm start
```

## Deploy on Vercel

1. Import this repository; **Root Directory** must be **`.`** (repository root), or empty. If you previously set it to **`VERCEL`**, clear that so Vercel builds from the repo root.
2. Framework: **Next.js**. Install/build use **`pnpm`** per `vercel.json`.
3. Set **`NEXT_PUBLIC_SITE_URL`** for production URLs where needed (see `env.example`).

CLI from repo root:

```bash
pnpm deploy        # preview
pnpm deploy:prod   # production
```

## Layout

| Path | Role |
|------|------|
| `app/` | Routes: `/`, `/about`, `/calendar`, `/events`, `/events/[slug]`, `/members`, `[...slug]`, … |
| `components/` | UI + `page-template`, navigation, shadcn primitives |
| `data/` | `site.bundle.json`, `events.json`, `nav.json`, `members.json`, `home-feed.json`, … |
| `lib/` | Data helpers, types, calendar utilities |
| `archive/legacy-daisyui-site/` | Archived DaisyUI mirror + scrape/extract tooling (not deployed) |

## Updating content without code changes

Commit updated JSON under `data/` and redeploy (or run `pnpm build` locally).

| File | Used by |
|------|---------|
| `data/members.json` | **`/members`** — member directory and Leaflet map (`members[]` with `id`, `name`, `category`, `address`, `lat`, `lng`, optional `phone`, `website`, `description`, `logoUrl`, optional `geocodeNote`). **Refresh:** `pnpm members:extract` (scrapes [directory-2](https://raleighhillsbusinessassn.org/directory-2/) + Nominatim, slow) or `pnpm members:extract:fast` then `pnpm members:geocode` to geocode the default bundle. **`pnpm members:geocode:all`** geocodes both **`members.json`** and **`members2.json`** (or pass `--file=data/….json` to `scripts/geocode-members.mjs`). **Validate pins vs addresses:** `pnpm members:validate-geocode` (dry run, exits non-zero only if bad pins > 0 unless you pass **`--strict`**, which also fails when any row gets no geocode); add `--apply --min-m=0` to rewrite coordinates from Nominatim (throttled ~1 req/s). Geocoding uses a Portland-metro viewbox for Oregon addresses, quadrant expansion (SW→Southwest), and skips PO Boxes / “see website” placeholders (those rows get fallback pins). If a listing’s **address is outside Oregon** (e.g. a California HQ), the pin correctly follows that address. |
| `data/members2.json` | Optional RHBA workbook export: regenerate from **`data/RHBA membership listing April 2026.xlsx`** with **`pnpm data:rhba`** (fields missing in the spreadsheet are omitted, not placeholders). Swap your data loader if you want `/members` to use this instead of `members.json`. |
| `data/events.json` | Home mini-calendar & upcoming list, **`/events`** cards, **`/calendar`** month grid, **`/events/[slug]`** detail pages — `manual` (curated Meetup-style entries with `slug`, host, links, etc.) and `events` (scraped fallback). ISO `start`/`end`, optional `recurringRule`. Run **`pnpm events:validate`** after edits. |
| `data/home-feed.json` | Home page **News & announcements** — `items[]` with `title`, `summary`, optional `href`, `date` (ISO) |
| `data/site.bundle.json` | CMS-style pages under **`/[...slug]`** |
| `data/nav.json` | Raw nav links where referenced |

Dedicated routes **`/members`**, **`/events`**, and **`/events/[slug]`** override bundle pages where paths overlap so the interactive UI is used instead of scraped HTML.

## Legacy content pipeline

The old **scrape → extract → `content/pages/`** workflow lives under **`archive/legacy-daisyui-site/`**. See `archive/legacy-daisyui-site/README.md`. The live app reads bundled JSON under **`data/`** at this root.

## Compliance

Use any crawler or archival tooling only when authorized. Respect `robots.txt` and site terms.
