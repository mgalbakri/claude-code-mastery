#!/usr/bin/env bash
# Hook: PostToolUse (Edit|Write) — Advisory
# Purpose: Detect orphaned content in curriculum.md between section boundaries.
#          Catches leftover debug text, test entries from MCP tools, or pastes.
#
# Strategy: Find --- divider lines that have a structural heading within the
#           next 20 lines. Any non-blank content between that --- and the
#           heading is orphaned and should not exist.

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')

# Only trigger on curriculum.md
case "$FILE_PATH" in
  */curriculum.md) ;;
  *) exit 0 ;;
esac

if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# Use awk — output to temp file to avoid subshell capture issues
TMPOUT="/tmp/curriculum-orphan-check-$$"
awk '
{
  lines[NR] = $0
  total = NR
}
END {
  heading_re = "^## Phase |^### WEEK |^### Appendix |^#### Appendix |^## Appendices"
  orphan_count = 0

  for (i = 1; i <= total; i++) {
    if (lines[i] != "---") continue

    heading_line = 0
    for (j = i + 1; j <= total && j <= i + 20; j++) {
      line = lines[j]
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", line)
      if (line == "") continue
      if (line ~ heading_re) { heading_line = j; break }
      if (lines[j] == "---") break
    }

    if (heading_line == 0) continue

    for (k = i + 1; k < heading_line; k++) {
      line = lines[k]
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", line)
      if (line != "") {
        orphan_count++
        if (orphan_count <= 5) {
          printf "  - Line %d: %s\n", k, substr(lines[k], 1, 80)
        }
      }
    }
  }

  if (orphan_count > 0) {
    printf "WARNING: Found %d orphaned line(s) in curriculum.md:\n", orphan_count
    if (orphan_count > 5) printf "  ... and %d more\n", orphan_count - 5
    print "These lines appear between section dividers (---) and the next heading."
    print "They may be leftover debug/test content -- remove them."
  }
}
' "$FILE_PATH" > "$TMPOUT" 2>&1

if [[ -s "$TMPOUT" ]]; then
  cat "$TMPOUT" >&2
fi

rm -f "$TMPOUT"
exit 0
