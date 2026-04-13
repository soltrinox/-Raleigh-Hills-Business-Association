# Legacy DaisyUI site (archived)

This tree is the **previous** Raleigh Hills Business Association mirror: Next.js App Router with **Tailwind**, **DaisyUI**, and **@tailwindcss/typography**, plus the **scrape / extract** content pipeline.

The **production** site now lives at the **repository root** (former `VERCEL/` app). This folder is kept for reference and optional local runs of the old tooling.

## What is here

| Path | Role |
|------|------|
| `app/` | Old routes (`[...slug]`, calendar, sitemap, etc.) |
| `components/` | `AppShell`, `ProseMain`, etc. |
| `lib/` | `content.ts`, `events.ts` loaders for `content/pages/*.json` |
| `scripts/` | `scrape-site.ts`, `extract-content.ts`, `extract-content-bundle.ts` |
| `content/` | Per-page JSON, manifest, nav, events (input to old app) |
| `public/` | Legacy static assets |

## Run the old pipeline (optional)

From **this directory**, install with npm using the archived `package.json` and `package-lock.json`:

```bash
cd archive/legacy-daisyui-site
npm install
npm run content:update   # scrape + extract + bundle (needs cache/ at repo root; gitignored)
npm run dev
```

Do not expect this app to stay in sync with the root deployment; update **`data/site.bundle.json`** at repo root if you only need content for the live site.
