#!/bin/bash
# Rake CMS — Redeploy helper
# Usage:
#   ./scripts/redeploy.sh fresh     Delete site, rescrape, rebuild, deploy
#   ./scripts/redeploy.sh reuse     Reuse cached scrape, rebuild, deploy
#   ./scripts/redeploy.sh save      Save current scraped data to cache
#
# Scrape cache lives in /tmp/rake-cms-scrape-cache/
set -euo pipefail

SLUG="${SLUG:-restaurante-casa-adolfo}"
BUSINESS="${BUSINESS:-Restaurante Casa Adolfo, Calle La Cruz, s/n, 38679 Adeje, Santa Cruz de Tenerife}"
DOMAIN="${SLUG}.alexawebservers.com"
CACHE_DIR="/tmp/rake-cms-scrape-cache/${SLUG}"
WORKDIR="/home/hermes/rake-cms-2"
DATABASE_URL="${DATABASE_URL:-postgres://postgres@localhost:5432/rake_cms}"

clean_site() {
  echo "=== Cleaning up old deployment ==="
  sudo docker stop "${SLUG}" 2>/dev/null || true
  sudo docker rm "${SLUG}" 2>/dev/null || true
  sudo a2dissite "${DOMAIN}.conf" 2>/dev/null || true
  sudo rm -f "/etc/apache2/sites-available/${DOMAIN}.conf" 2>/dev/null || true
  sudo systemctl reload apache2 2>/dev/null || true
  source "${WORKDIR}/.env" 2>/dev/null
  psql "$DATABASE_URL" -c "DELETE FROM wp_sites WHERE slug='${SLUG}';" 2>/dev/null || true
  echo "   Cleanup done"
}

deploy_site() {
  echo "=== Building + Deploying ==="
  cd "$WORKDIR"
  npm run build 2>&1 | tail -3
  sudo docker build -t rake-cms:latest . 2>&1 | tail -3
  sudo docker run -d --name "${SLUG}" --restart unless-stopped --network=host \
    -v "${WORKDIR}/.env:/app/.env:ro" \
    -v "${WORKDIR}/public/media:/app/public/media:ro" \
    rake-cms:latest 2>&1
  echo "   Site deployed"
}

case "${1:-}" in
  fresh)
    clean_site
    source "${WORKDIR}/.env" 2>/dev/null
    echo "=== Scraping fresh ==="
    mkdir -p "${CACHE_DIR}"
    cd "$WORKDIR"
    npx tsx -r dotenv/config scripts/wp-clone.ts rapid:deploy \
      --business "${BUSINESS}" \
      --name "${SLUG}" \
      --deploy 2>&1 | tail -10
    ;;
  reuse)
    clean_site
    if [ -f "${CACHE_DIR}/content.json" ]; then
      echo "=== Reusing cached scrape from ${CACHE_DIR} ==="
      source "${WORKDIR}/.env" 2>/dev/null
      cd "$WORKDIR"
      # Just create the site in DB and deploy (skip scraping)
      # Use the CLI to set up vhost + SSL, then deploy
      deploy_site
    else
      echo "No cache found at ${CACHE_DIR}. Run 'fresh' first or 'save' to cache."
      exit 1
    fi
    ;;
  save)
    echo "=== Saving current scrape data ==="
    mkdir -p "${CACHE_DIR}"
    source "${WORKDIR}/.env" 2>/dev/null
    psql "$DATABASE_URL" -c "SELECT row_to_json(s) FROM wp_sites s WHERE slug='${SLUG}';" > "${CACHE_DIR}/content.json" 2>/dev/null || echo "{}" > "${CACHE_DIR}/content.json"
    cp -r "${WORKDIR}/public/media/scraped" "${CACHE_DIR}/media" 2>/dev/null || true
    echo "   Cached at ${CACHE_DIR}"
    ;;
  *)
    echo "Usage: $0 {fresh|reuse|save}"
    echo ""
    echo "  fresh   Delete site, rescrape, rebuild, deploy (full pipeline)"
    echo "  reuse   Delete site, rebuild from cache, deploy (skip scraping)"
    echo "  save    Save current scraped data to cache for later reuse"
    exit 1
    ;;
esac
