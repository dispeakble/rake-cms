# Rake CMS

**A self-hostable, WordPress-style CMS built on Next.js — with a real WordPress importer.**

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-149eca)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

Rake CMS gives you the parts of a publishing platform that small sites actually use — posts, pages, categories, custom post types, nav menus, media, users, search, feeds, i18n — on a modern TypeScript stack you can deploy with Docker. It also ships a **scraper → theme generator → deploy** pipeline, so you can point it at an existing site, pull the content and structure across, and stand up a rebuilt version fast.

Built and maintained by **[Alexa Web Servers](https://alexawebservers.com)** — a hosting company in Tenerife that uses it for client sites.

---

## Why

WordPress is great until you have to maintain a dozen client installs, each with its own plugin drift, its own PHP upgrade story, and its own way of breaking. Rake CMS is an attempt at the same workflow — content, themes, migration — on a stack that a modern web team can reason about: Next.js App Router, Drizzle ORM, Auth.js, and a database you already know (PostgreSQL **or** MariaDB/MySQL).

It is early software (v0.1.0). It is not trying to be a feature-complete WordPress replacement yet — see [Status](#status).

## Features

- **Content**: posts, pages, categories, search, RSS/Atom feeds (`src/app/feed.xml`)
- **Custom post types & nav menus** — first-class, not an afterthought (`src/lib/cpt`, `src/lib/nav-menus`)
- **Block editor** — BlockNote-based editor (`src/lib/editor`)
- **Auth & users** — Auth.js v5, with registration, login, profile, password reset (`src/lib/auth`)
- **Media library** — local filesystem in dev, S3 in production (`src/lib/media`)
- **i18n** — bilingual-ready routing and content (`src/lib/i18n`)
- **Themes** — Tailwind-based theme generation and activation (`src/lib/theme-generator`)
- **Scraper** — pull content/structure from an existing site with Cheerio (`src/lib/scraper`)
- **WordPress migration** — import a WordPress database, files, and theme (`src/lib/migration`, CLI `import:wp`)
- **Deployer** — build + deploy pipeline, Docker-ready (`src/lib/deployer`, `Dockerfile`, `scripts/deploy-wp.sh`)
- **Security & reliability** — hardened auth paths and reliability helpers (`src/lib/security`, `src/lib/reliability`)

## Quickstart

```bash
git clone https://github.com/dispeakble/rake-cms.git
cd rake-cms
npm install
cp .env.example .env      # set DATABASE_URL, DATABASE_DIALECT, AUTH_SECRET
npm run dev               # http://localhost:3000
```

`Dockerfile`, `docker-compose`-style setup, and an example Apache vhost (`cli/apache-vhost.conf`) are included for deployment.

## WordPress migration

The main reason this project exists. The CLI can read a WordPress install and bring it across:

```bash
npx tsx scripts/wp-clone.ts import:db      # import the WordPress database
npx tsx scripts/wp-clone.ts import:files   # import uploads / media
npx tsx scripts/wp-clone.ts import:theme   # import the WordPress theme
npx tsx scripts/wp-clone.ts import:wp      # full migration
```

## CLI

```bash
npx tsx scripts/wp-clone.ts create:site                       # scaffold a site
npx tsx scripts/wp-clone.ts create:post --title "Hello" --status publish
npx tsx scripts/wp-clone.ts theme:activate my-theme
npx tsx scripts/wp-clone.ts rapid:deploy
```

Helpers live in `scripts/` (`batch-generate.sh`, `deploy-wp.sh`, `verify-deploy.ts`, `scan-secrets.sh`) and `scripts/commands/`.

## Database

Drizzle ORM supports both PostgreSQL and MariaDB/MySQL — set `DATABASE_DIALECT` and `DATABASE_URL` in `.env`.

```bash
npm run db:generate   # generate migrations from schema
npm run db:migrate    # apply migrations
npm run db:studio     # browse data
```

## Testing

End-to-end tests live in `tests/e2e` (Playwright) and are run against a running instance. There is no `npm test` script yet — that is on the roadmap.

## Status

v0.1.0, actively developed. Expect rough edges, and expect the schema to move. If you try it and something breaks, an issue with the exact command and error is genuinely useful.

## Contributing

Contributions welcome:

- Fork, branch with a `feat/` / `fix/` / `docs/` prefix, open a PR
- Use conventional commits (`feat:`, `fix:`, `docs:`)
- Describe what changed, how to test it locally, and any migration/deploy notes

## License

MIT — see [LICENSE](LICENSE).

## Links

- Website & hosting: **[alexawebservers.com](https://alexawebservers.com)**
- Companion project (private for now): `hermes-swarm` — multi-bot Telegram gateway
