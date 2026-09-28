# Rake CMS

Rake CMS is a multi-tenant website generation and content management platform focused on WordPress-style parity and fast business-site production.

Its core purpose is to take business inputs (URL, business name/address, and optional enrichment), generate a themed site experience, seed CMS content, and support deployment workflows for customer subdomains.

## Project Scope

- Multi-tenant CMS model with per-site slug/domain records.
- WordPress-like data model (posts, terms, comments, options, users, revisions, and related metadata).
- Theme generation pipeline that writes business-specific UI components.
- Content seeding pipeline for initial pages and site metadata.
- Scraping/enrichment flow from website, maps data, and optional Brave search context.
- Operational scripts for rapid generation, validation, and deployment support.

## Primary Use Case

Generate and launch a business website quickly by running a single command pipeline:

1. Collect source data (website and/or business query).
2. Create or update tenant site record.
3. Generate themed frontend components.
4. Seed CMS content.
5. Optionally build, validate, and deploy.

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Drizzle ORM + PostgreSQL (with MySQL/MariaDB compatibility paths in config)
- Tailwind CSS 4 + Framer Motion
- NextAuth/Auth.js integration
- Playwright for crawl validation
- Commander-based CLI tooling

## Repository Highlights

- App routes and API: src/app
- Theme components: src/components/theme
- Database schema and access: src/db
- Business logic libraries: src/lib
- CLI entrypoint: scripts/wp-clone.ts
- Rapid pipeline command: scripts/commands/rapid-deploy.ts
- Deployment helpers: scripts/redeploy.sh, scripts/verify-deploy.ts

## Quick Start (Local)

Prerequisites:

- Node.js 20+
- npm
- PostgreSQL (or Docker to run PostgreSQL)

Install dependencies:

```bash
npm install
```

Generate local environment file (if missing):

```bash
node scripts/bootstrap-env.js
```

Apply schema:

```bash
npm run db:push
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## CLI Workflows

CLI entrypoint:

```bash
npm run cli
```

Common commands:

```bash
npm run cli rapid:deploy -- --business "Business Name, Full Address"
npm run cli rapid:deploy -- --url https://example.com --business "Business Name"
npm run cli create:site
npm run cli create:post -- --title "Hello" --status publish
npm run cli import:wp
npm run cli theme:activate -- my-theme
```

Notes:

- rapid:deploy supports optional deploy/build/crawl switches.
- Some deployment steps are host-specific (Virtualmin/Apache/Linux sudo paths).

## Testing and Validation

Install browser for Playwright:

```bash
npm run playwright:install
```

Run crawl validation:

```bash
npm run test:e2e:crawl
```

## Deployment Context

This repository includes both local/dev and production-oriented deployment logic.

- Local development focuses on Next.js + DB workflows.
- Production-style automation in the rapid deploy path expects Linux-host services in certain phases (for example Apache/Virtualmin/sudo operations).

If you are running on Windows, use local generation/build flows and adapt deployment phases to your target infrastructure.

## Purpose Summary

Rake CMS exists to reduce the time from business data to a branded, editable website by combining scraping, content generation, CMS seeding, and deploy-ready automation in one codebase.
