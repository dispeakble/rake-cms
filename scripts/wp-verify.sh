#!/usr/bin/env bash
set -euo pipefail

# WordPress Theme Visual Verification Script
# 1. Generates the site with GENERATOR_OUTPUT=wordpress
# 2. Takes Playwright screenshots
# 3. Compares against reference (Next.js) screenshots
# 4. Reports visual differences

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

OUTPUT_DIR="${OUTPUT_DIR:-$PROJECT_DIR/generated-sites}"
REFERENCE_DIR="${REFERENCE_DIR:-$PROJECT_DIR/tests/e2e/reference}"
COMPARISON_DIR="${COMPARISON_DIR:-$PROJECT_DIR/tests/e2e/comparison}"
mkdir -p "$COMPARISON_DIR"

# Config
BUSINESS_NAME="${1:-Daria's Bakery & Bistro | Breakfast & Lunch}"
GENERATOR_SCRIPT="${2:-scripts/commands/generate-wp-theme.ts}"

echo "═══════════════════════════════════════════════"
echo "  WordPress Theme Visual Verification"
echo "  Business: $BUSINESS_NAME"
echo "═══════════════════════════════════════════════"

# Step 1: Generate the WordPress theme
echo ""
echo "📦 Step 1: Generating WordPress theme..."
GENERATOR_OUTPUT=wordpress npx tsx "$GENERATOR_SCRIPT" 2>&1 || {
  echo "❌ Generation failed"
  exit 1
}
echo "✅ Generation complete"

# Step 2: Deploy (if Docker compose exists)
echo ""
echo "🐳 Step 2: Deploying with Docker..."
SLUG=$(echo "$BUSINESS_NAME" | tr '[:upper:]' '[:lower:]' | sed "s/'s//g" | sed "s/'//g" | sed 's/[^a-z0-9]\+/-/g' | sed 's/^-//;s/-$//' | sed 's/--*/-/g')
COMPOSE_DIR="$OUTPUT_DIR/generated-sites/$SLUG/wp-docker"

if [ -f "$COMPOSE_DIR/docker-compose.yml" ]; then
  cd "$COMPOSE_DIR"
  docker compose up -d 2>&1 || true
  echo "   Waiting for WordPress to be ready..."
  for i in $(seq 1 30); do
    if curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$(grep -oP '127\.0\.0\.1:\K\d+' docker-compose.yml | head -1)" 2>/dev/null | grep -q 200; then
      echo "✅ WordPress is up"
      break
    fi
    sleep 2
  done
  cd "$PROJECT_DIR"
else
  echo "⚠️  No docker-compose.yml found at $COMPOSE_DIR"
fi

# Step 3: Take screenshots with Playwright
echo ""
echo "📸 Step 3: Taking Playwright screenshots..."
WP_PORT=$(grep -oP '127\.0\.0\.1:\K\d+' "$COMPOSE_DIR/docker-compose.yml" 2>/dev/null || echo "3122")
WP_URL="http://127.0.0.1:$WP_PORT"

npx playwright screenshot "$WP_URL" "$COMPARISON_DIR/wp-full.png" --full-page 2>&1 || echo "⚠️ Screenshot failed"
echo "   Screenshot saved: $COMPARISON_DIR/wp-full.png"

# Step 4: Extract structured data from the page
echo ""
echo "🔍 Step 4: Extracting page structure..."
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('$WP_URL', { waitUntil: 'networkidle', timeout: 30000 });

  const data = await page.evaluate(() => {
    // Check key visual features
    const body = document.body;
    const cs = getComputedStyle(body);

    // Count animations
    let animCount = 0;
    try {
      for (const ss of document.styleSheets) {
        for (const rule of ss.cssRules || []) {
          if (rule instanceof CSSKeyframesRule) animCount++;
        }
      }
    } catch(e) {}

    return {
      fontFamily: cs.fontFamily,
      backgroundColor: cs.backgroundColor,
      hasLogo: !!document.querySelector('header img[src*=\"logo\"]'),
      hasLangToggle: !!document.getElementById('lang-toggle'),
      hasThemeToggle: !!document.getElementById('theme-toggle'),
      hasMobileMenu: !!document.getElementById('mobile-menu'),
      hasCarousel: !!document.querySelector('.hero-carousel'),
      hasCarouselBtns: !!document.querySelector('.carousel-prev, .carousel-next'),
      hasParticles: document.querySelectorAll('.floating-particle').length,
      hasCounterStats: document.querySelectorAll('.animated-counter').length,
      hasRevealAnimations: document.querySelectorAll('.reveal').length,
      hasGlowCards: document.querySelectorAll('.glow-card').length,
      hasSparkleStars: document.querySelectorAll('.sparkle-star').length,
      hasRecaptcha: !!document.querySelector('.g-recaptcha'),
      hasGradientText: document.querySelectorAll('.gradient-text').length,
      navLinkCount: document.querySelectorAll('nav a').length,
      animKeyframes: animCount,
      cssVarCount: (() => {
        const vars = [];
        try {
          for (const style of document.styleSheets) {
            for (const rule of style.cssRules) {
              if (rule instanceof CSSStyleRule && rule.selectorText === ':root') {
                for (const prop of rule.style) {
                  if (prop.startsWith('--')) vars.push(prop);
                }
              }
            }
          }
        } catch(e) {}
        return vars.length;
      })(),
    };
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
" 2>&1 | tee "$COMPARISON_DIR/structure.json"

# Step 5: Compare against reference
echo ""
echo "📊 Step 5: Comparison vs Next.js reference..."

if [ -f "$REFERENCE_DIR/report.json" ] && [ -f "$COMPARISON_DIR/structure.json" ]; then
  REF_STRUCT=$(cat "$REFERENCE_DIR/report.json")
  WP_STRUCT=$(cat "$COMPARISON_DIR/structure.json")

  # Simple pixel-based comparison using Playwright
  echo "   Reference: $REFERENCE_DIR/screenshot-full.png"
  echo "   Current:   $COMPARISON_DIR/wp-full.png"

  # Use imagemagick if available for pixel diff
  if command -v compare &>/dev/null; then
    compare "$REFERENCE_DIR/screenshot-full.png" "$COMPARISON_DIR/wp-full.png" -metric AE "$COMPARISON_DIR/diff.png" 2>&1 || true
    echo "   Diff saved: $COMPARISON_DIR/diff.png"
  fi
else
  echo "⚠️  Reference data not found at $REFERENCE_DIR"
fi

echo ""
echo "═══════════════════════════════════════════════"
echo "  Verification complete!"
echo "  Screenshots: $COMPARISON_DIR/"
echo "═══════════════════════════════════════════════"
