import { test, expect } from "@playwright/test";

/**
 * API Health Tests — verify real backend services are working.
 *
 * These tests hit actual endpoints (no mocking) to catch:
 * - Missing or misconfigured env vars
 * - Restricted API key permissions
 * - Unreachable external services (Resend, Lemon Squeezy, Supabase)
 *
 * Skipped when running locally (no DEPLOYMENT_URL). Run against production:
 *   DEPLOYMENT_URL=https://agentcodeacademy.com npx playwright test e2e/api-health.spec.ts
 */

// These tests require real backend services — skip on local dev server
test.skip(!process.env.DEPLOYMENT_URL, "Requires DEPLOYMENT_URL (production/preview)");

const isProduction = process.env.DEPLOYMENT_URL?.includes("agentcodeacademy.com");

test.describe("API Health: /api/health", () => {
  test("health endpoint returns valid response", async ({ request }) => {
    const res = await request.get("/api/health");
    const body = await res.json();
    expect(body.status).toMatch(/^(healthy|degraded)$/);
    expect(body.checks).toBeTruthy();
  });

  test("all service checks pass on production", async ({ request }) => {
    test.skip(!isProduction, "Full health check only runs against production");
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("healthy");

    for (const [name, check] of Object.entries(
      body.checks as Record<string, { ok: boolean; error?: string }>
    )) {
      expect(check.ok, `${name} check failed: ${check.error || "unknown"}`).toBe(true);
    }
  });
});

test.describe("API Health: /api/subscribe", () => {
  test("subscribe endpoint accepts a valid email", async ({ request }) => {
    // Use a unique throwaway email to avoid polluting the audience
    const testEmail = `playwright-test-${Date.now()}@example.com`;
    const res = await request.post("/api/subscribe", {
      data: { email: testEmail },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test("subscribe endpoint rejects invalid email", async ({ request }) => {
    const res = await request.post("/api/subscribe", {
      data: { email: "not-an-email" },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("API Health: /api/create-checkout", () => {
  test("checkout endpoint returns a valid Lemon Squeezy URL", async ({
    request,
  }) => {
    const res = await request.post("/api/create-checkout", {
      data: { email: "playwright-test@example.com" },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.url).toBeTruthy();
    expect(body.url).toContain("lemonsqueezy.com");
  });
});
