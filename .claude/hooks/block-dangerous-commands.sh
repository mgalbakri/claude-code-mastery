#!/usr/bin/env bash
# Hook: PreToolUse (Bash)
# Purpose: Block destructive shell commands that could damage the project

set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

# Dangerous patterns to block
# NOTE: These are best-effort heuristics, not a security boundary.
# They catch common destructive commands but cannot prevent all evasions.
DANGEROUS_PATTERNS=(
  "rm\s+.*-[rR].*-[fF].*/"
  "rm\s+.*-[rR].*-[fF].*\."
  "rm\s+.*-[rR].*-[fF].*\*"
  "rm\s+--recursive"
  "rm\s+-rf\s"
  "git push.*(-f|--force).*main"
  "git push.*(-f|--force).*master"
  "git push.*main.*(-f|--force)"
  "git push.*master.*(-f|--force)"
  "git reset --hard"
  "git clean\s+.*(-f|--force)"
  "git clean\s+.*-[a-eghijklmnopqrstuvwxyz]*f"
  "drop database"
  "DROP TABLE"
  "truncate table"
  "vercel env rm"
  "npx vercel remove"
  "> /dev/sd"
  "mkfs\."
  ":(){ :|:& };:"
  "chmod -R 777"
  "curl.*\|\s*(ba)?sh"
  "wget.*\|\s*(ba)?sh"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$pattern"; then
    echo "BLOCKED: Dangerous command detected matching pattern '$pattern'" >&2
    echo "Command was: $COMMAND" >&2
    exit 2
  fi
done

exit 0
