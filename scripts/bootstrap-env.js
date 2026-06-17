#!/usr/bin/env node
/**
 * Bootstrap script — generates .env on demand so we never commit secrets.
 */
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

// Only overwrite if .env doesn't exist or is a template
if (fs.existsSync(envPath) && !fs.readFileSync(envPath, 'utf-8').includes('__GENERATED__')) {
  console.log('.env already configured');
  process.exit(0);
}

const secret = crypto.randomBytes(32).toString('base64');

const env = `# Rake CMS — Auto-generated (do not commit)
# Database - PostgreSQL (trust auth for local connections)
DATABASE_URL=postgresql://hermes@127.0.0.1:5432/rake_cms
DATABASE_DIALECT=postgresql

# Auth (Auth.js v5)
AUTH_SECRET=${secret}
AUTH_TRUST_HOST=true

# Media
MEDIA_STORAGE=local
MEDIA_LOCAL_PATH=public/media

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3100
NEXT_PUBLIC_SITE_NAME="Rake CMS"
PORT=3100

# __GENERATED__
`;

fs.writeFileSync(envPath, env);
console.log(`.env generated with AUTH_SECRET=${secret.substring(0, 8)}...`);
