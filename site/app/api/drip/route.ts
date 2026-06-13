import { NextResponse } from "next/server";
import { Resend } from "resend";
import { DRIP_SEQUENCE } from "@/lib/email-templates";

/**
 * POST /api/drip — Process drip emails for subscribers.
 *
 * Called by a daily GitHub Action with a cron secret.
 * Queries the Resend audience for contacts, checks their creation date,
 * and sends the appropriate drip email based on how many days since signup.
 *
 * Requires: RESEND_API_KEY, RESEND_AUDIENCE_ID, DRIP_SECRET
 */
export async function POST(request: Request) {
  const secret = process.env.DRIP_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Drip not configured" }, { status: 500 });
  }

  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const emailFrom =
    process.env.EMAIL_FROM ||
    "Agent Code Academy <hello@agentcodeacademy.com>";

  if (!apiKey || !audienceId) {
    return NextResponse.json(
      { error: "Missing RESEND_API_KEY or RESEND_AUDIENCE_ID" },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);

  try {
    const { data: audienceData, error: listError } =
      await resend.contacts.list({ audienceId });

    if (listError || !audienceData) {
      console.error("Failed to list contacts:", listError);
      return NextResponse.json(
        { error: "Failed to list contacts" },
        { status: 500 },
      );
    }

    const contacts = audienceData.data;
    const now = Date.now();
    let sent = 0;
    let skipped = 0;

    for (const contact of contacts) {
      if (contact.unsubscribed) {
        skipped++;
        continue;
      }

      const createdAt = new Date(contact.created_at).getTime();
      const daysSinceSignup = Math.floor(
        (now - createdAt) / (1000 * 60 * 60 * 24),
      );

      // Find the drip email that matches today (skip welcome, it's sent on subscribe)
      const dripEmail = DRIP_SEQUENCE.find(
        (d) => d.dayOffset === daysSinceSignup && d.id !== "welcome",
      );

      if (!dripEmail) {
        skipped++;
        continue;
      }

      try {
        await resend.emails.send({
          from: emailFrom,
          to: contact.email,
          subject: dripEmail.subject,
          html: dripEmail.html,
          headers: {
            "X-Entity-Ref-ID": `drip-${dripEmail.id}-${contact.email}`,
          },
        });
        sent++;
      } catch (err) {
        console.error(`Failed to send ${dripEmail.id} to ${contact.email}:`, err);
      }
    }

    return NextResponse.json({ sent, skipped, total: contacts.length });
  } catch (err) {
    console.error("Drip processing error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 },
    );
  }
}
