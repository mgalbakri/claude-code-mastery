#!/usr/bin/env bash
# Hook: PreToolUse (Edit|Write)
# Purpose: Block edits to protected files (.env, secrets, lock files, git internals)

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.command // ""')

# Protected patterns (anchored to avoid false positives like vendor-envelopes/)
PROTECTED_PATTERNS=(
  "(^|/)\.env($|\.|/)"
  "(^|/)\.env\.local$"
  "(^|/)\.env\.production$"
  "(^|/)credentials($|/)"
  "(^|/)secrets($|/)"
  "(^|/)\.git/"
  "(^|/)node_modules/"
  "(^|/)package-lock\.json$"
  "\.vercel/project\.json$"
  "(^|/)\.claude/settings(\.|$)"
)

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if echo "$FILE_PATH" | grep -qE "$pattern"; then
    echo "Blocked: cannot modify protected file matching pattern '$pattern'" >&2
    exit 2
  fi
done

exit 0
