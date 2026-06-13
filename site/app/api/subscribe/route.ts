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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 254;
const REFERRER_MAX_LENGTH = 64;

export async function POST(request: Request) {
  try {
    const { email, referrer } = await request.json();

    if (
      !email ||
      typeof email !== "string" ||
      email.length > EMAIL_MAX_LENGTH ||
      !EMAIL_REGEX.test(email)
    ) {
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
    if (
      referrer &&
      typeof referrer === "string" &&
      referrer.length >= 4 &&
      referrer.length <= REFERRER_MAX_LENGTH
    ) {
      contactData.firstName = `ref:${referrer}`;
    }

    const { error: resendError } = await resend.contacts.create(contactData);

    if (resendError) {
      console.error("Resend contact creation failed:", JSON.stringify(resendError));
      return NextResponse.json(
        { error: "Subscription failed. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Subscribe failed:", error);
    return NextResponse.json(
      { error: "Subscription failed. Please try again." },
      { status: 500 }
    );
  }
}
