# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack (http://localhost:3000)
npm start                # Start the production server (after build)

# Build
npm run build            # next build (prebuild + postbuild run automatically)
npm run quickbuild       # next build with --ignore-scripts (skips prebuild data fetch)

# Linting and formatting
npm run lint             # ESLint (next lint)
npm run format           # Prettier (write)
npm run format:check     # Prettier (check only)

# Data generation (invoked by prebuild, can be run manually)
npm run generate-data    # Fetch content from Notion → src/data/*.json
npm run find-subdomains  # Query Cloudflare → src/data/subdomains.json
```

`prebuild` runs `find-subdomains` then `generate-data`. `postbuild` runs `next-sitemap` (config in `next-sitemap.config.js`). Use `quickbuild` when iterating on the site without re-fetching from Notion/Cloudflare.

There is no test suite.

## Architecture

This is a Next.js 15 (App Router, React 19, Turbopack) personal website. Content is sourced from Notion at build time and served as static JSON.

### Content Pipeline

1. **Notion databases** store blog posts, design projects, and travel itineraries (with waypoints).
2. **`scripts/generate-data.ts`** fetches via `@notionhq/client`, converts blocks to Markdown with `notion-to-md`, downloads any `prod-files-secure.s3` assets, and re-encodes images to WebP via `sharp` (max 1920×1080, quality 80). Output: `src/data/{blog,design,travel}.json`; assets land in `public/{blog,design,travel}-files/<itemId>/`.
3. **`scripts/find-subdomains.ts`** queries the Cloudflare DNS API and writes `src/data/subdomains.json`.
4. **Pages** import these JSON files directly — no runtime Notion calls.

The image-processing step is idempotent: existing files in `public/*-files/` are reused, so re-running `generate-data` is cheap after the first run.

### Key Directories

- `src/app/` — Next.js App Router pages (blog, design, travel, resume, bio, about, subdomains, feed.xml, sitemap)
- `src/lib/notion/` — Notion integration
  - `index.ts` — client init, env validation, shared image/content processing
  - `blog.ts`, `design.ts`, `travel.ts` — per-database fetchers
  - `cover.ts`, `fetch.ts` — cover-image and HTTP helpers
  - `types.ts` — `BlogPost`, `DesignProject`, `TravelItinerary`, `Waypoint` + type guards
- `src/lib/feed.ts` — RSS/Atom feed generation
- `src/components/ui/` — shadcn/ui components (config in `components.json`)
- `src/components/mdx/` — MDX rendering components used by `next-mdx-remote`
- `src/data/` — generated JSON (gitignored except `.gitkeep`)
- `public/*-files/` — processed images, committed
- `scripts/` — prebuild scripts (run via `tsx`)

### Environment Variables

For `generate-data` (validated at import time in `src/lib/notion/index.ts`):
- `NOTION_TOKEN`
- `NOTION_BLOG_DATABASE_ID`
- `NOTION_DESIGN_DATABASE_ID`
- `NOTION_TRAVEL_DATABASE_ID`
- `NOTION_WAYPOINTS_DATABASE_ID` (used by `travel.ts` to join waypoints onto itineraries)

For `find-subdomains`:
- `CF_ZONE_ID`
- `CF_API_TOKEN`

### Conventions

- Path alias: `@/*` → `./src/*` (tsconfig.json)
- Permanent redirects to `notions.michaeldemar.co` for `/notions`, `/bookmarks`, `/wikipedia`, `/uses`, `/quotes`, `/inspirations`, `/til` (see `next.config.ts`)
- Styling: Tailwind CSS + `prettier-plugin-tailwindcss` (class ordering is enforced by formatter)
