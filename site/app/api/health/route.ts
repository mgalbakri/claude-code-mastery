import { NextResponse } from "next/server";

/**
 * Production health check — verifies all external services are configured
 * and reachable. Returns 200 if everything is OK, 503 if any check fails.
 *
 * GET /api/health
 * GET /api/health?verbose=true  (includes timing details)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const verbose = url.searchParams.get("verbose") === "true";

  const checks: Record<string, { ok: boolean; ms?: number; error?: string }> =
    {};

  // 1. Env vars present
  const requiredVars = [
    "RESEND_API_KEY",
    "RESEND_AUDIENCE_ID",
    "LEMON_SQUEEZY_API_KEY",
    "LEMON_SQUEEZY_STORE_ID",
    "LEMON_SQUEEZY_WEBHOOK_SECRET",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];
  const missingVars = requiredVars.filter((v) => !process.env[v]);
  checks.env_vars = {
    ok: missingVars.length === 0,
    ...(missingVars.length > 0 && { error: `Missing: ${missingVars.join(", ")}` }),
  };

  // 2. Resend API reachable (list domains — lightweight, works with any key scope)
  try {
    const start = Date.now();
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    });
    checks.resend = {
      ok: res.ok,
      ms: Date.now() - start,
      ...(!res.ok && { error: `HTTP ${res.status}` }),
    };
  } catch (e) {
    checks.resend = { ok: false, error: String(e) };
  }

  // 3. Lemon Squeezy API reachable (get store)
  try {
    const start = Date.now();
    const res = await fetch(
      `https://api.lemonsqueezy.com/v1/stores/${process.env.LEMON_SQUEEZY_STORE_ID}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
          Accept: "application/vnd.api+json",
        },
        signal: AbortSignal.timeout(5000),
      }
    );
    checks.lemon_squeezy = {
      ok: res.ok,
      ms: Date.now() - start,
      ...(!res.ok && { error: `HTTP ${res.status}` }),
    };
  } catch (e) {
    checks.lemon_squeezy = { ok: false, error: String(e) };
  }

  // 4. Supabase reachable (health endpoint)
  try {
    const start = Date.now();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL not set");
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      },
      signal: AbortSignal.timeout(5000),
    });
    checks.supabase = {
      ok: res.ok,
      ms: Date.now() - start,
      ...(!res.ok && { error: `HTTP ${res.status}` }),
    };
  } catch (e) {
    checks.supabase = { ok: false, error: String(e) };
  }

  const allOk = Object.values(checks).every((c) => c.ok);

  // Strip timing details unless verbose
  const response = verbose
    ? checks
    : Object.fromEntries(
        Object.entries(checks).map(([k, v]) => [
          k,
          { ok: v.ok, ...(v.error && { error: v.error }) },
        ])
      );

  return NextResponse.json(
    { status: allOk ? "healthy" : "degraded", checks: response },
    { status: allOk ? 200 : 503 }
  );
}
