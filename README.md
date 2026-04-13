# Raleigh Hills Business Association — Next.js site

Production **Next.js 16** (App Router) site with **Tailwind CSS v4**, **shadcn/ui**, and static content from **`data/`** (`site.bundle.json`, `events.json`, `nav.json`).

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
| `app/` | Routes: `/`, `/about`, `/calendar`, `[...slug]`, … |
| `components/` | UI + `page-template`, navigation, shadcn primitives |
| `data/` | `site.bundle.json`, `events.json`, `nav.json`, … |
| `lib/` | Data helpers, types, calendar utilities |
| `archive/legacy-daisyui-site/` | Archived DaisyUI mirror + scrape/extract tooling (not deployed) |

## Legacy content pipeline

The old **scrape → extract → `content/pages/`** workflow lives under **`archive/legacy-daisyui-site/`**. See `archive/legacy-daisyui-site/README.md`. The live app reads bundled JSON under **`data/`** at this root.

## Compliance

Use any crawler or archival tooling only when authorized. Respect `robots.txt` and site terms.
