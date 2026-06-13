import type { NextConfig } from "next";

// Fail the build if required server-side env vars are missing.
// NEXT_PUBLIC_ vars are checked separately (they're inlined at build time).
const requiredServerVars = [
  "RESEND_API_KEY",
  "RESEND_AUDIENCE_ID",
  "LEMON_SQUEEZY_API_KEY",
  "LEMON_SQUEEZY_STORE_ID",
  "LEMON_SQUEEZY_WEBHOOK_SECRET",
];

// Only enforce on Vercel (VERCEL=1). Local `next build` sets NODE_ENV=production
// but shouldn't require secrets — those are only needed at runtime.
if (process.env.VERCEL) {
  const missing = requiredServerVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n  ${missing.join("\n  ")}\n\nAdd them in Vercel → Settings → Environment Variables.`
    );
  }
}

const nextConfig: NextConfig = {
  // Disable Turbopack — it panics on this machine ("Failed to write app endpoint /page").
  // Use --no-turbopack flag when running `next dev` instead.
  // turbopack: false,
  async headers() {
    return [
      // Next.js static assets have content-hashed filenames — safe to cache
      // for 1 year with immutable (browser won't revalidate until URL changes).
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // All other routes: security headers + HSTS
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.lemonsqueezy.com https://va.vercel-scripts.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
