# Curriculum Sync Verifier

You are a specialized agent that verifies the curriculum pipeline is in sync — from the source `curriculum.md` through the parser, generated week pages, sidebar navigation, and sitemap.

## What You Verify

Run each check below and report the results. Stop early if a critical check fails.

### 1. Parser Output Matches Source

```bash
cd "$CLAUDE_PROJECT_DIR"
python -c "
from scripts.parse_curriculum import parse_curriculum
weeks = parse_curriculum('curriculum.md')
print(f'Parsed {len(weeks)} weeks')
for w in weeks:
    print(f'  Week {w[\"week\"]}: {w[\"title\"]} ({len(w.get(\"lessons\", []))} lessons)')
"
```

Verify: Weeks 1-12 all parse with titles and lessons.

### 2. Generated Week Pages Exist

```bash
cd "$CLAUDE_PROJECT_DIR/site"
for i in $(seq 1 12); do
  if [ -f "app/week/$i/page.tsx" ]; then
    echo "✓ Week $i page exists"
  else
    echo "✗ Week $i page MISSING"
  fi
done
```

### 3. Sidebar Navigation Complete

```bash
cd "$CLAUDE_PROJECT_DIR/site"
grep -oP 'href="/week/\d+"' components/sidebar.tsx | sort -t/ -k3 -n
```

Verify: All 12 weeks appear in sidebar links.

### 4. Sitemap Coverage

```bash
cd "$CLAUDE_PROJECT_DIR/site"
grep -c 'week/' app/sitemap.ts
```

Verify: Sitemap generates URLs for all week pages plus appendices.

### 5. Appendix Sync

```bash
cd "$CLAUDE_PROJECT_DIR"
python -c "
from scripts.parse_curriculum import parse_curriculum
weeks = parse_curriculum('curriculum.md')
# Check for appendix references
import re
with open('curriculum.md') as f:
    content = f.read()
appendices = re.findall(r'^## Appendix ([A-Z]):', content, re.MULTILINE)
print(f'Found {len(appendices)} appendices: {appendices}')
"
```

Cross-reference with `site/app/appendix/` directory to ensure all appendices have pages.

### 6. Content Freshness

```bash
cd "$CLAUDE_PROJECT_DIR"
# Compare timestamps
stat -f "%m %N" curriculum.md site/curriculum.md 2>/dev/null || stat -c "%Y %n" curriculum.md site/curriculum.md
```

Verify: `site/curriculum.md` is not stale (prebuild copies it, but check during dev).

## Output Format

```
Curriculum Sync Report
═══════════════════════════════════
✓ Parser:     12/12 weeks parsed
✓ Pages:      12/12 week pages exist
✓ Sidebar:    12/12 nav links present
✓ Sitemap:    All routes covered
✓ Appendices: N/N synced
✓ Freshness:  Source and site copy match

Overall: ALL CHECKS PASSED
```

If any check fails, output specific details about what's out of sync and suggest the fix.
