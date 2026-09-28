# AGENTS.md

Guidance for coding agents working in this repository.

## 1) Mission and Scope

Rake CMS is a multi-tenant website generation and CMS platform with WordPress-style parity.

Core pipeline:

1. Collect business data (URL, maps query, optional enrichment).
2. Create/update tenant site in DB.
3. Generate themed UI components.
4. Seed CMS content.
5. Optionally build, validate, and deploy.

Primary command path is implemented in [scripts/commands/rapid-deploy.ts](scripts/commands/rapid-deploy.ts).

## 2) Key Paths

- App and routes: [src/app](src/app)
- Theme components: [src/components/theme](src/components/theme)
- DB schema and connection: [src/db](src/db)
- Shared logic: [src/lib](src/lib)
- CLI entrypoint: [scripts/wp-clone.ts](scripts/wp-clone.ts)
- Deployment verification: [scripts/verify-deploy.ts](scripts/verify-deploy.ts)
- Local vhost template: [cli/apache-vhost.conf](cli/apache-vhost.conf)

## 3) Standard Dev Commands

- Install deps: `npm install`
- Generate local env: `node scripts/bootstrap-env.js`
- Push DB schema: `npm run db:push`
- Dev server: `npm run dev`
- Build: `npm run build`
- Crawl test: `npm run test:e2e:crawl`
- CLI root: `npm run cli`

## 4) Rapid Deploy Usage

Examples:

- `npm run cli rapid:deploy -- --business "Business Name, Full Address"`
- `npm run cli rapid:deploy -- --url https://example.com --business "Business Name"`

Useful switches:

- `--deploy` enables Virtualmin/Apache deploy path.
- `--no-build` skips Next build and Docker image build.
- `--no-seed` skips CMS seeding.
- `--no-crawl-test` skips Playwright crawl validation.
- `--dry-run` prints planned operations.

## 5) Environment and DB Gotchas

1. Shell-level environment variables can override values from `.env`.
2. In this repo, `DATABASE_URL` mismatches are a common failure cause for CLI and DB scripts.
3. When running commands, prefer explicit per-command DB env if needed:
   - PowerShell example: `$env:DATABASE_URL='postgresql://postgres@127.0.0.1:5432/rake_cms'; npm run build`
4. If `db:push` appears to hang or fail, run with explicit flags for diagnostics:
   - `npx drizzle-kit push --dialect postgresql --schema "./src/db/schema/*.ts" --url "postgresql://postgres@127.0.0.1:5432/rake_cms" --verbose --force`

## 6) Platform-Specific Deployment Caveats

The full `rapid:deploy` flow includes host-specific Linux operations in deploy/build phases (for example `sudo`, Virtualmin, Apache, certbot, Docker service assumptions).

If running on Windows or non-target hosts:

1. Prefer generation/seeding flows.
2. Skip deploy-specific phases when needed (`--no-build`, answer "No" to deploy prompt, or avoid `--deploy`).
3. Treat production deployment scripts as environment-dependent, not universally portable.

## 7) Editing Guidelines for Agents

1. Make minimal, focused changes.
2. Do not reformat unrelated code.
3. Preserve public APIs and CLI flags unless task explicitly requires change.
4. Validate with the smallest relevant command (`npm run build`, targeted script, or test).
5. If touching pipeline behavior, confirm impact on both local and production-host workflows.

## 8) Validation Checklist Before Finishing

1. Changed files compile or lint cleanly when applicable.
2. DB-dependent commands have a valid `DATABASE_URL` target.
3. README and agent docs stay consistent when behavior changes.
4. Report any steps that were intentionally skipped due to host constraints.
