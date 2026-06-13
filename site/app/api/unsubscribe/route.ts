import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not configured");
    _resend = new Resend(key);
  }
  return _resend;
}

function getUnsubscribeSecret(): string {
  const secret =
    process.env.UNSUBSCRIBE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("No unsubscribe signing secret configured");
  }
  return secret;
}

/**
 * Generate an HMAC-SHA256 token for unsubscribe links.
 * Algorithm: HMAC-SHA256(email_lowercase, secret) → hex
 *
 * Usage in newsletter email links:
 *   /api/unsubscribe?email=user@example.com&token=<hex>
 *
 * To generate from Python (newsletter.py):
 *   import hmac, hashlib
 *   token = hmac.new(secret.encode(), email.lower().encode(), hashlib.sha256).hexdigest()
 */
export function generateUnsubscribeToken(email: string): string {
  return crypto
    .createHmac("sha256", getUnsubscribeSecret())
    .update(email.toLowerCase())
    .digest("hex");
}

function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = generateUnsubscribeToken(email);
  const expectedBuf = Buffer.from(expected);
  const tokenBuf = Buffer.from(token);
  if (expectedBuf.length !== tokenBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, tokenBuf);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  if (!email) {
    return new NextResponse(unsubscribePage("Missing email parameter."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Require a valid HMAC token to prevent unauthorized unsubscribes
  if (!token || !verifyUnsubscribeToken(email, token)) {
    return new NextResponse(
      unsubscribePage("Invalid or missing unsubscribe token."),
      {
        status: 403,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  try {
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!audienceId) throw new Error("RESEND_AUDIENCE_ID not configured");

    const resend = getResend();

    // List contacts to find the matching one
    const { data } = await resend.contacts.list({ audienceId });
    const contact = data?.data?.find(
      (c: { email: string }) => c.email.toLowerCase() === email.toLowerCase()
    );

    if (contact) {
      await resend.contacts.update({
        id: contact.id,
        audienceId,
        unsubscribed: true,
      });
    }

    return new NextResponse(
      unsubscribePage("You have been unsubscribed from the Agent Code Academy newsletter."),
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    console.error("Unsubscribe failed:", error);
    return new NextResponse(
      unsubscribePage("Something went wrong. Please try again or contact us."),
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function unsubscribePage(message: string): string {
  const safeMessage = escapeHtml(message);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unsubscribe — Agent Code Academy</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0a; color: #e5e5e5;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; margin: 0;
    }
    .card {
      background: #111827; border: 1px solid #1e293b; border-radius: 12px;
      padding: 40px; max-width: 420px; text-align: center;
    }
    h1 { font-size: 20px; margin: 0 0 12px; color: #f1f5f9; }
    p { font-size: 14px; color: #94a3b8; line-height: 1.6; margin: 0 0 20px; }
    a { color: #818cf8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Agent Code Academy</h1>
    <p>${safeMessage}</p>
    <a href="https://agentcodeacademy.com">Back to course</a>
  </div>
</body>
</html>`;
}
