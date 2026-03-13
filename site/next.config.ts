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
  async headers() {
    return [
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
        ],
      },
    ];
  },
};

export default nextConfig;
