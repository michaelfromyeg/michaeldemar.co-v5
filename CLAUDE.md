# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack (http://localhost:3000)

# Build
npm run build            # Full build (runs prebuild scripts + next build + sitemap)
npm run quickbuild       # Build without prebuild scripts

# Linting and formatting
npm run lint             # ESLint
npm run format           # Prettier (write)
npm run format:check     # Prettier (check only)

# Data generation (run before build or manually)
npm run generate-data    # Fetch content from Notion and generate JSON data files
npm run find-subdomains  # Scan for subdomains
```

## Architecture

This is a Next.js 15 personal website with content sourced from Notion databases.

### Content Pipeline

Content flows from Notion to the site through a build-time data generation step:

1. **Notion databases** store blog posts, design projects, and travel itineraries
2. **`npm run generate-data`** (runs as prebuild) fetches from Notion API, converts to Markdown, processes images to WebP, and writes JSON to `src/data/`
3. **Pages** read from the generated JSON files at build time

### Key Directories

- `src/app/` - Next.js App Router pages
- `src/lib/notion/` - Notion API integration and content processing
  - `blog.ts`, `design.ts`, `travel.ts` - Database-specific fetchers
  - `types.ts` - Shared TypeScript interfaces (`BlogPost`, `DesignProject`, `TravelItinerary`)
- `src/components/` - React components
  - `ui/` - shadcn/ui components
  - `mdx/` - MDX rendering components
- `src/data/` - Generated JSON data (gitignored except `.gitkeep`)
- `public/*-files/` - Downloaded and processed images from Notion

### Environment Variables

Required for data generation:
- `NOTION_TOKEN`
- `NOTION_BLOG_DATABASE_ID`
- `NOTION_DESIGN_DATABASE_ID`
- `NOTION_TRAVEL_DATABASE_ID`
- `NOTION_WAYPOINTS_DATABASE_ID`

### Path Aliases

`@/*` maps to `./src/*` (configured in tsconfig.json)
