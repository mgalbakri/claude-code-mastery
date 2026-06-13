import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function getTokenSecret(): string {
  const secret =
    process.env.PREMIUM_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("No token signing secret configured");
  }
  return secret;
}

/**
 * Create an HMAC-signed premium token.
 * Format: base64(payload).hmac_hex
 */
function signPremiumToken(payload: object): string {
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
  const hmac = crypto
    .createHmac("sha256", getTokenSecret())
    .update(base64Payload)
    .digest("hex");
  return `${base64Payload}.${hmac}`;
}

/**
 * Verify an HMAC-signed premium token.
 * Returns the decoded payload if valid, null otherwise.
 */
export function verifyPremiumToken(
  token: string
): { email: string; orderId: string; ts: string } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [base64Payload, providedHmac] = parts;

  const expectedHmac = crypto
    .createHmac("sha256", getTokenSecret())
    .update(base64Payload)
    .digest("hex");

  // Constant-time comparison
  const expectedBuf = Buffer.from(expectedHmac);
  const providedBuf = Buffer.from(providedHmac);
  if (expectedBuf.length !== providedBuf.length) return null;
  if (!crypto.timingSafeEqual(expectedBuf, providedBuf)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(base64Payload, "base64").toString("utf-8")
    );
    return payload;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.json(
      { error: "Missing order_id" },
      { status: 400 }
    );
  }

  // Validate orderId is numeric only to prevent injection
  if (!/^\d+$/.test(orderId)) {
    return NextResponse.json(
      { error: "Invalid order_id format" },
      { status: 400 }
    );
  }

  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Payment verification not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://api.lemonsqueezy.com/v1/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/vnd.api+json",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const order = await res.json();
    const attrs = order.data?.attributes;

    if (attrs?.status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 402 }
      );
    }

    const email = attrs.user_email || "";

    // Generate an HMAC-signed token for localStorage
    const tokenData = {
      email,
      orderId: order.data.id,
      ts: new Date().toISOString(),
    };
    const token = signPremiumToken(tokenData);

    return NextResponse.json({ token, email });
  } catch (error) {
    console.error("Order verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify order" },
      { status: 500 }
    );
  }
}
