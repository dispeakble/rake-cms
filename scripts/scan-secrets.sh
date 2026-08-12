#!/usr/bin/env bash
# scan-secrets.sh — fail if secret patterns appear in tracked/generated output.
# Usage: ./scripts/scan-secrets.sh [dir...]
# Defaults: generated-sites/ wp-theme/ src/ public/
set -uo pipefail

TARGETS=("$@")
if [ ${#TARGETS[@]} -eq 0 ]; then
  TARGETS=(generated-sites/ wp-theme/ src/ public/ scripts/)
fi

# Patterns: high-signal only, to avoid false positives on comments/docs.
PATTERNS=(
  'AIza[0-9A-Za-z_-]{20,}'          # Google API keys
  'sk-[0-9A-Za-z]{20,}'             # OpenAI-style keys
  'ghp_[0-9A-Za-z]{20,}'            # GitHub PATs
  'gho_[0-9A-Za-z]{20,}'            # GitHub OAuth tokens
  'xox[baprs]-[0-9A-Za-z-]{10,}'    # Slack tokens
  'AKIA[0-9A-Z]{16}'                # AWS access keys
  '-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----'
  '(api[_-]?key|apikey|secret|password|passwd|token)\s*[=:]\s*["'"'"'][A-Za-z0-9+/=_!@#$%^&*.-]{16,}["'"'"']'
)

FOUND=0
for dir in "${TARGETS[@]}"; do
  [ -d "$dir" ] || continue
  for pat in "${PATTERNS[@]}"; do
    # Skip .env.example, docs, lockfiles, binary/asset dirs
    while IFS= read -r line; do
      # Allow placeholder/example values
      case "$line" in
        *your_key*|*your-secret*|*changeme*|*change-me*|*example*|*placeholder*|*TODO*|*xxx*|*\.env\.example*) continue ;;
      esac
      echo "⚠️  SECRET PATTERN in $dir: $line"
      FOUND=1
    done < <(grep -rInE "$pat" "$dir" 2>/dev/null \
      | grep -viE '\.map:|node_modules|\.next/|/assets/|\.woff2|\.woff|\.png|\.jpg|\.jpeg|\.gif|\.svg' \
      | head -5)
  done
done

if [ "$FOUND" -eq 0 ]; then
  echo "✅ No secret patterns found in ${TARGETS[*]}"
else
  echo ""
  echo "❌ Secret patterns detected — fix or regenerate before committing."
  exit 1
fi
