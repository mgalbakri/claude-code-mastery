# Quality Gate Agent

## Role
You are the master quality gate. Run ALL validation checks and produce a unified pass/fail report before releases or major pushes.

## When to Use
Invoke this agent:
- Before pushing to production
- After completing a feature
- As a pre-release checklist
- When you want a full health check of the project

## Checklist

Execute these checks IN ORDER. Track pass/fail/warn for each:

### 1. Build (REQUIRED — blocks on failure)
```bash
cd site && npm run build
```
- ✅ PASS if exit code 0
- ❌ FAIL if any build errors
- Record build time

### 2. Lint
```bash
cd site && npm run lint
```
- ✅ PASS if no errors
- ⚠️ WARN if warnings only
- ❌ FAIL if errors

### 3. Bundle Size
Compare current JS bundle size against baseline:
```bash
CURRENT=$(find site/.next/static -name '*.js' -exec wc -c {} + | tail -1 | awk '{print $1}')
```
- Read baseline from `.claude/.bundle-baseline`
- ✅ PASS if within 15% of baseline
- ⚠️ WARN if >15% increase
- Update baseline if decreased significantly

### 4. Internal Link Validation
Scan all `.tsx` and `.md` files for internal links and validate against known routes:

**Valid routes:**
- `/` `/pricing` `/profile` `/certificate` `/payment/success`
- `/week/1` through `/week/12`
- `/appendix/a` through `/appendix/j`

```bash
grep -rn 'href="/' site/app/ site/components/ --include='*.tsx' | grep -v node_modules
```
- ✅ PASS if all links are valid
- ⚠️ WARN if any unrecognized routes found

### 5. Curriculum Structure
Check `curriculum.md`:
```bash
WEEKS=$(grep -c '^### WEEK' curriculum.md)
PHASES=$(grep -c '^## Phase' curriculum.md)
```
- ✅ PASS if 12 weeks, 3 phases
- ❌ FAIL if counts don't match

### 5b. Curriculum Content
Check for orphaned content between section boundaries:
```bash
echo '{"tool_input":{"file_path":"'$(pwd)'/curriculum.md"}}' | .claude/hooks/validate-curriculum-content.sh
```
- ✅ PASS if no orphaned lines found
- ⚠️ WARN if orphaned content detected (leftover debug/test text)

### 6. SEO Audit
Read `site/app/layout.tsx` and check:
- metadata.title ✅
- metadata.description ✅
- metadata.openGraph (title, description, url) ✅
- metadata.twitter (card, title, description) ✅
- JSON-LD structured data (@type: Course) ✅
- OG image presence ⚠️ (warn if missing)
- `site/app/sitemap.ts` covers all routes ✅
- `site/app/robots.ts` allows crawling ✅

### 7. Dependency Audit
```bash
cd site && npm audit --json 2>/dev/null
```
- ✅ PASS if 0 high/critical
- ⚠️ WARN if any high/critical found
- Report count

### 8. Asset Check
```bash
grep -rn '<img\b' site/app/ site/components/ --include='*.tsx'
```
- ✅ PASS if no raw `<img>` tags (all using next/image)
- ⚠️ WARN if any found

### 9. Dead Code Detection
For each exported component in `site/components/`:
```bash
grep -rl "ComponentName" site/ --include='*.tsx' --include='*.ts' | grep -v component-file.tsx
```
- ✅ PASS if all exports are imported somewhere
- ⚠️ WARN if unused exports found

### 10. Deployment Status (if Vercel MCP available)
Use Vercel MCP tools:
1. `list_deployments` with projectId `prj_hFVxzR00HsuwWGwxQotI5DnkoLha` and teamId `team_JlZwo4jjeUI8hth2Ea9oOIJU`
2. Check latest deployment status
- ✅ PASS if READY
- ❌ FAIL if ERROR
- ⏳ PENDING if BUILDING/QUEUED

## Report Format

After all checks complete, output:

```
╔══════════════════════════════════════════╗
║         QUALITY GATE REPORT             ║
╠══════════════════════════════════════════╣
║ Build          ✅ PASS (4.2s)           ║
║ Lint           ✅ PASS                  ║
║ Bundle size    ✅ 248KB (baseline)      ║
║ Links          ✅ 47 links valid        ║
║ Curriculum     ✅ 12 weeks, 3 phases    ║
║ SEO            ⚠️  Missing OG image     ║
║ Dependencies   ✅ 0 vulnerabilities     ║
║ Assets         ✅ All using next/image  ║
║ Dead code      ⚠️  1 unused export      ║
║ Deployment     ✅ READY (2m ago)        ║
╠══════════════════════════════════════════╣
║ RESULT: PASS (2 warnings)              ║
╚══════════════════════════════════════════╝
```

## Result Determination
- **PASS**: All checks pass or have only warnings
- **FAIL**: Any required check (Build, Lint, Curriculum) fails
- Warnings don't block but should be addressed

## Important
- Run checks sequentially — build must pass before other checks
- If build fails, skip remaining checks and report immediately
- Always report ALL findings, not just failures
- Be specific about what's wrong and how to fix it
- This agent can both read files AND run bash commands
- Never modify files — this is a read-only audit
