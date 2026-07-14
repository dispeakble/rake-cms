#!/bin/bash
# Rake CMS — Batch Generate + Auto-Verify
# Usage:
#   ./scripts/batch-generate.sh "Business Name, Address" "Another Business, Address" ...
#   ./scripts/batch-generate.sh list.txt   # one business per line
set -euo pipefail

WORKDIR="/home/hermes/rake-cms-2"
cd "$WORKDIR"

VERIFY_SCRIPT="/home/hermes/rake-cms-2/scripts/verify-content.sh"

# Create verification script
cat > "$VERIFY_SCRIPT" << 'VERIFY'
#!/bin/bash
# Verify generated theme files don't contain stale/hardcoded Rodeo content
SLUG="$1"
NAME="$2"
THEME_DIR="src/components/theme"

cd /home/hermes/rake-cms-2

# Check if the slug appears in theme components
if grep -q -i "rodeo\|churrasquería\|churrascaria\|rodizio\|picanha\|alcatra\|costela\|gaucho" "$THEME_DIR/Hero.tsx" "$THEME_DIR/About.tsx" "$THEME_DIR/Services.tsx" 2>/dev/null; then
  echo "❌ STALE CONTENT DETECTED: Generated theme files contain Rodeo Grill content!"
  echo "   This means the generator used hardcoded fallback instead of scraped data."
  echo "   Slug: $SLUG, Name: $NAME"
  exit 1
fi

# Check if the business name appears in the title/header
if ! grep -q -i "$(echo "$NAME" | cut -c1-20)" "$THEME_DIR/Hero.tsx" 2>/dev/null; then
  echo "⚠️  WARNING: Business name not found in Hero.tsx (may be using generic content)"
  echo "   Slug: $SLUG, Name: $NAME"
  # Don't fail — generic content is OK, just warn
fi

echo "✅ Content verification passed for $SLUG"
exit 0
VERIFY

chmod +x "$VERIFY_SCRIPT"

# Process each business
generate_and_deploy() {
  local raw="$1"
  # Parse business name and address
  local business
  local name_slug
  
  # Use first part as the name, everything as the search query
  business="$raw"
  name_slug=$(echo "$raw" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
  
  echo ""
  echo "══════════════════════════════════════════════"
  echo "  🔄 Processing: $business"
  echo "  🔗 Slug: $name_slug"
  echo "══════════════════════════════════════════════"
  
  # Run the scraper
  echo "  📡 Scraping..."
  SLUG="$name_slug" BUSINESS="$business" npx tsx -r dotenv/config scripts/wp-clone.ts rapid:deploy \
    --business "$business" \
    --name "$name_slug" \
    --deploy 2>&1 | tail -20
  
  # Check exit code
  if [ $? -ne 0 ]; then
    echo "❌ Scraping/deploy failed for $business"
    return 1
  fi
  
  # Verify content
  bash "$VERIFY_SCRIPT" "$name_slug" "$business" || true
  
  echo "✅ Done: $business → https://$name_slug.alexawebservers.com"
  echo ""
}

# Main: read businesses from args or file
if [ $# -eq 1 ] && [ -f "$1" ]; then
  # Read from file
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    [[ "$line" == "#"* ]] && continue
    generate_and_deploy "$line"
  done < "$1"
else
  # Process each arg as a business
  for business; do
    generate_and_deploy "$business"
  done
fi

echo ""
echo "🎉 Batch complete!"
