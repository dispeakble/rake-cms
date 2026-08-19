# Rake CMS

Rake CMS is a modern, Next.js-based content management system designed for rapid site creation and deployment. It scrapes source content, generates a Tailwind-based theme, and provides an automated pipeline to build and deploy static or server-rendered sites quickly.

Key points
- Built with Next.js and Tailwind CSS
- Rapid deployment pipeline (Docker-ready)
- Pluggable content sources and scraping tools
- CLI helpers for common tasks under `./cli`

Quickstart (development)

1. Clone the repo

   git clone https://github.com/dispeakble/rake-cms.git
   cd rake-cms

2. Install dependencies

   npm install

3. Copy environment example and set secrets

   cp .env.example .env
   # Edit .env to configure database, credentials, and API keys

4. Run the dev server

   npm run dev

5. Open http://localhost:3000

Build & Docker

- Build static export

   npm run build
   npm run export

- Docker (build + run)

   docker build -t rake-cms .
   docker run -p 3000:3000 --env-file .env rake-cms

Configuration

- See `drizzle.config.ts` for database schema and migrations.
- Edit `.env` (from `.env.example`) to set credentials, API keys, and runtime options.

CLI

- The `./cli` folder contains convenience scripts for scraping, content import, and bulk operations. See `./cli/README.md` for specifics.

Testing

- Run the test suite:

   npm test

Contributing

Contributions welcome. Please follow these guidelines:
- Fork the repo and create a feature branch (`feat/`, `fix/`, `docs/`)
- Run tests locally before opening a PR
- Use conventional commits (`feat:`, `fix:`, `docs:`)

Suggested PR body template

- What did you change and why?
- How to test locally
- Any migration or deploy notes

License

This project inherits the repository license. See the `LICENSE` file for details.

Contact

For questions or support, open an issue or contact the maintainers through GitHub.
