#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════
# deploy-wp.sh — Deploy a WordPress site from a generated theme
#
# Usage:
#   ./scripts/deploy-wp.sh <slug>
#
# Prerequisites: docker, docker compose, wp-cli
# ═══════════════════════════════════════════════════════════

SLUG="${1:-}"
if [ -z "$SLUG" ]; then
  echo "Usage: $0 <slug>"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SITE_DIR="$PROJECT_DIR/generated-sites/$SLUG"
WP_THEME_DIR="$SITE_DIR/wp-theme"
DOCKER_DIR="$SITE_DIR/wp-docker"

if [ ! -d "$SITE_DIR" ]; then
  echo "❌ Site not found: $SITE_DIR"
  echo "   Generate first: GENERATOR_OUTPUT=wordpress npx tsx -r dotenv/config scripts/commands/generate-wp-theme.ts $SLUG"
  exit 1
fi

THEME_NAME=$(head -30 "$WP_THEME_DIR/style.css" | grep "^Theme Name:" | sed 's/^Theme Name: //' | head -1)
THEME_URI=$(head -30 "$WP_THEME_DIR/style.css" | grep "^Theme URI:" | sed 's/^Theme URI: //' | head -1)
echo "📦 Deploying: $THEME_NAME"
echo "   URI: $THEME_URI"
echo "   Theme: $WP_THEME_DIR"

SUDO="sudo"

# Determine compose command
COMPOSE_CMD=""
if command -v docker-compose &>/dev/null; then
  COMPOSE_CMD="docker-compose"
elif $SUDO docker compose version &>/dev/null; then
  COMPOSE_CMD="docker compose"
else
  echo "❌ docker compose not available"
  exit 1
fi

# Start Docker
echo ""
echo "🚀 Starting WordPress Docker stack..."
cd "$DOCKER_DIR"
$SUDO $COMPOSE_CMD up -d 2>&1

# Wait for WordPress to be ready
echo ""
echo "⏳ Waiting for WordPress..."
for i in $(seq 1 30); do
  WP_PORT=$(grep -oP '127\.0\.0\.1:\K\d+' docker-compose.yml | head -1)
  if wget -q --spider --timeout=2 "http://127.0.0.1:$WP_PORT" 2>/dev/null; then
    echo "   ✅ Ready after ${i}s (port $WP_PORT)"
    break
  fi
  sleep 2
done

sleep 5

# Find WP container
WP_CONTAINER=$($SUDO docker ps --filter "name=wordpress" --format "{{.Names}}" | head -1)
if [ -z "$WP_CONTAINER" ]; then
  echo "❌ No WordPress container found"
  $SUDO docker ps
  exit 1
fi
echo "   Container: $WP_CONTAINER"

# Install WP-CLI inside the container
echo ""
echo "📥 Installing WP-CLI in container..."
$SUDO docker exec "$WP_CONTAINER" bash -c "curl -sO https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar && chmod +x wp-cli.phar && mv wp-cli.phar /usr/local/bin/wp" 2>&1 | tail -3

# Install WP
echo ""
echo "📝 Installing WordPress..."
ADMIN_PASS=$(openssl rand -base64 12)
$SUDO docker exec -i "$WP_CONTAINER" wp --allow-root core install \
  --url="http://127.0.0.1:$WP_PORT" \
  --title="$THEME_NAME" \
  --admin_user="admin" \
  --admin_password="$ADMIN_PASS" \
  --admin_email="admin@${SLUG}.alexawebservers.com" \
  --skip-email \
  2>&1 || echo "   ⚠️ WP already installed or install failed"

echo "   Admin: http://127.0.0.1:$WP_PORT/wp-admin"
echo "   User:  admin"
echo "   Pass:  $ADMIN_PASS"

# Activate theme
echo ""
echo "🔄 Activating theme: $SLUG..."
$SUDO docker exec "$WP_CONTAINER" wp --allow-root theme activate "$SLUG" 2>&1 || {
  echo "   ⚠️ Theme slug '$SLUG' not found, listing available themes..."
  $SUDO docker exec "$WP_CONTAINER" wp --allow-root theme list 2>&1 | head -10
}

# Create pages
echo ""
echo "📄 Creating pages..."
for page in about services contact; do
  PAGE_EXISTS=$($SUDO docker exec "$WP_CONTAINER" wp --allow-root post list --post_type=page --name="$page" --format=ids 2>/dev/null || echo "")
  if [ -z "$PAGE_EXISTS" ]; then
    $SUDO docker exec "$WP_CONTAINER" wp --allow-root post create \
      --post_type=page --post_status=publish --post_name="$page" --post_title="$page" --post_content="" \
      2>&1 || echo "   ⚠️ Failed to create page: $page"
    echo "   ✓ Created: $page"
  else
    echo "   ✓ Exists: $page"
  fi
done

# Set front page
echo ""
echo "🔧 Setting front page..."
$SUDO docker exec "$WP_CONTAINER" wp --allow-root option update show_on_front 'page' 2>/dev/null || true
$SUDO docker exec "$WP_CONTAINER" wp --allow-root option update page_on_front 0 2>/dev/null || true
$SUDO docker exec "$WP_CONTAINER" wp --allow-root option update blogname "$THEME_NAME" 2>/dev/null || true

# Create menu
echo ""
echo "📋 Setting up nav menu..."
$SUDO docker exec "$WP_CONTAINER" wp --allow-root menu create "Primary Menu" 2>/dev/null || true
$SUDO docker exec "$WP_CONTAINER" wp --allow-root menu location assign primary-menu primary 2>/dev/null || true

echo ""
echo "✅ WordPress deployment complete!"
echo "   Site:  http://127.0.0.1:$WP_PORT"
echo "   Admin: http://127.0.0.1:$WP_PORT/wp-admin"
echo "   User:  admin / $ADMIN_PASS"
echo ""
echo "   To stop: cd $DOCKER_DIR && $SUDO $COMPOSE_CMD down"
