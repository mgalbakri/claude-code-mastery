import { NextResponse } from "next/server";
import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not configured");
    _resend = new Resend(key);
  }
  return _resend;
}

export async function POST(request: Request) {
  try {
    const { email, referrer } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!audienceId) {
      console.error("RESEND_AUDIENCE_ID is not configured");
      return NextResponse.json(
        { error: "Subscription service is not configured" },
        { status: 500 }
      );
    }

    const resend = getResend();
    const normalizedEmail = email.trim().toLowerCase();

    // Build contact data — attach referrer code if present
    const contactData: {
      email: string;
      audienceId: string;
      unsubscribed: boolean;
      firstName?: string;
    } = {
      email: normalizedEmail,
      audienceId,
      unsubscribed: false,
    };

    // Store referrer in firstName field as metadata (Resend doesn't have custom fields)
    if (referrer && typeof referrer === "string" && referrer.length >= 4) {
      contactData.firstName = `ref:${referrer}`;
    }

    await resend.contacts.create(contactData);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Subscribe failed:", error);
    return NextResponse.json(
      { error: "Subscription failed. Please try again." },
      { status: 500 }
    );
  }
}
