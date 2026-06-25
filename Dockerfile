# ============================================================
#  Rake CMS — Dockerfile (multi-stage production build)
#  Usage:
#    docker build -t rake-cms:latest .
#    docker run -d -p 3101:3000 \
#      -v /home/hermes/rake-cms-2/.env:/app/.env:ro \
#      -v /home/hermes/rake-cms-2/public/media:/app/public/media \
#      --name rake-cms-3101 \
#      rake-cms:latest
# ============================================================

# ─── Stage 1: Build ────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# First copy only dependency files for layer caching
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

# Then copy the rest of the source
COPY . .

# Build the Next.js app
RUN npm run build

# ─── Stage 2: Production runner ────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built artifacts from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json

# DB schema files needed at runtime for Drizzle ORM
COPY --from=builder --chown=nextjs:nodejs /app/src/db ./src/db
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

# Runtime config files (not baked into image — mounted from host)
# .env → mounted as volume at /app/.env
# public/media/ → mounted as volume (scraped images, uploads)

USER nextjs

EXPOSE 3000

CMD ["npx", "next", "start", "-p", "3000"]
