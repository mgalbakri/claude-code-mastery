#!/usr/bin/env bash
# Hook: PreToolUse (Bash) — BLOCKING
# Purpose: Block git push if build is stale or missing.
# Replaces: test-reminder.sh (which only warned)

set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

# Only check git push commands
if ! echo "$COMMAND" | grep -qE 'git push'; then
  exit 0
fi

SITE_DIR="$CLAUDE_PROJECT_DIR/site"
BUILD_ID="$SITE_DIR/.next/BUILD_ID"

# Check build exists
if [[ ! -f "$BUILD_ID" ]]; then
  echo "BLOCKED: No build output found. Run 'cd site && npm run build' before pushing." >&2
  exit 2
fi

# Check build freshness (< 10 minutes old)
FRESH=$(find "$SITE_DIR/.next" -maxdepth 1 -name "BUILD_ID" -mmin -10 2>/dev/null | head -1)

if [[ -z "$FRESH" ]]; then
  echo "BLOCKED: Build is stale (>10 min old). Run 'cd site && npm run build' before pushing." >&2
  exit 2
fi

# Also check for large staged images on git push
STAGED_IMAGES=$(cd "$CLAUDE_PROJECT_DIR" && git diff --cached --name-only 2>/dev/null | grep -iE '\.(png|jpg|jpeg|gif|webp|svg|bmp|ico)$' || true)
if [[ -n "$STAGED_IMAGES" ]]; then
  while IFS= read -r img; do
    if [[ -f "$CLAUDE_PROJECT_DIR/$img" ]]; then
      SIZE=$(wc -c < "$CLAUDE_PROJECT_DIR/$img" 2>/dev/null || echo "0")
      if [[ "$SIZE" -gt 512000 ]]; then
        SIZE_KB=$((SIZE / 1024))
        echo "WARNING: Staged image '$img' is ${SIZE_KB}KB (>500KB). Consider optimizing before pushing." >&2
      fi
    fi
  done <<< "$STAGED_IMAGES"
fi

exit 0
