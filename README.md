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
| `app/` | Routes: `/`, `/about`, `/calendar`, `/events`, `/members`, `[...slug]`, … |
| `components/` | UI + `page-template`, navigation, shadcn primitives |
| `data/` | `site.bundle.json`, `events.json`, `nav.json`, `members.json`, `home-feed.json`, … |
| `lib/` | Data helpers, types, calendar utilities |
| `archive/legacy-daisyui-site/` | Archived DaisyUI mirror + scrape/extract tooling (not deployed) |

## Updating content without code changes

Commit updated JSON under `data/` and redeploy (or run `pnpm build` locally).

| File | Used by |
|------|---------|
| `data/members.json` | **`/members`** — member directory and Leaflet map (`members[]` with `id`, `name`, `category`, `address`, `lat`, `lng`, optional `phone`, `website`, `description`, `logoUrl`). **Refresh:** `pnpm members:extract` (scrapes [directory-2](https://raleighhillsbusinessassn.org/directory-2/) + Nominatim, slow) or `pnpm members:extract:fast` then `pnpm members:geocode` to geocode existing JSON only. |
| `data/events.json` | Home upcoming events, **`/events`** cards, **`/calendar`** — `manual` and `events` arrays (ISO `start`/`end`, optional `recurringRule`) |
| `data/home-feed.json` | Home page **News & announcements** — `items[]` with `title`, `summary`, optional `href`, `date` (ISO) |
| `data/site.bundle.json` | CMS-style pages under **`/[...slug]`** |
| `data/nav.json` | Raw nav links where referenced |

Dedicated routes **`/members`** and **`/events`** override bundle pages with the same single-segment path so the interactive UI is used instead of scraped HTML.

## Legacy content pipeline

The old **scrape → extract → `content/pages/`** workflow lives under **`archive/legacy-daisyui-site/`**. See `archive/legacy-daisyui-site/README.md`. The live app reads bundled JSON under **`data/`** at this root.

## Compliance

Use any crawler or archival tooling only when authorized. Respect `robots.txt` and site terms.
