---
name: test
description: Run the full quality pipeline — Python tests, TypeScript check, site build, and Playwright E2E tests
user-invocable: true
disable-model-invocation: true
---

# /test — Full Pipeline Runner

Run all quality gates in sequence. Stop on first failure.

## Pipeline Steps

Execute these steps **in order**, stopping if any step fails:

### 1. Python Unit Tests
```bash
cd "$CLAUDE_PROJECT_DIR" && python -m pytest tests/ -v --tb=short 2>&1
```
**Pass criteria:** Exit code 0, all tests pass.

### 2. TypeScript Type Check
```bash
cd "$CLAUDE_PROJECT_DIR/site" && npx tsc --noEmit 2>&1
```
**Pass criteria:** Exit code 0, zero errors.

### 3. Next.js Production Build
```bash
cd "$CLAUDE_PROJECT_DIR/site" && npm run build 2>&1
```
**Pass criteria:** Exit code 0, all pages generated.

### 4. Playwright E2E Tests
```bash
cd "$CLAUDE_PROJECT_DIR/site" && npx playwright test 2>&1
```
**Pass criteria:** Exit code 0, all specs pass.

## Output Format

After running all steps, produce a summary table:

```
┌─────────────────────┬────────┬─────────┐
│ Gate                 │ Status │ Details │
├─────────────────────┼────────┼─────────┤
│ Python tests         │ PASS   │ 147/147 │
│ TypeScript           │ PASS   │ 0 errors│
│ Next.js build        │ PASS   │ 40 pages│
│ Playwright E2E       │ PASS   │ 78/78   │
└─────────────────────┴────────┴─────────┘
```

If a step fails, show the error output and mark all subsequent steps as SKIPPED.
