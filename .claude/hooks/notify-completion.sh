#!/usr/bin/env bash
# Hook: Notification
# Purpose: Send macOS native notification when Claude needs attention

set -euo pipefail

INPUT=$(cat)
MESSAGE=$(echo "$INPUT" | jq -r '.message // "Claude Code needs your attention"')

# macOS notification
# Escape backslashes and double quotes to prevent shell injection via $MESSAGE
if command -v osascript &>/dev/null; then
  SAFE_MESSAGE=$(echo "$MESSAGE" | sed 's/\\/\\\\/g; s/"/\\"/g')
  osascript -e "display notification \"$SAFE_MESSAGE\" with title \"Agent Code Academy\" sound name \"Ping\"" 2>/dev/null || true
fi

exit 0
