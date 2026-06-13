import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { sendPurchaseConfirmation } from "@/lib/email";

function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for webhook processing"
    );
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey);
}

function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const hmac = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const hmacBuf = Buffer.from(hmac);
  const sigBuf = Buffer.from(signature);
  if (hmacBuf.length !== sigBuf.length) return false;
  return crypto.timingSafeEqual(hmacBuf, sigBuf);
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const eventName: string = payload.meta?.event_name;

  if (eventName === "order_created") {
    const attrs = payload.data?.attributes;
    const orderId: string = payload.data?.id;
    const email: string = attrs?.user_email;
    const status: string = attrs?.status;
    let userId: string | undefined = attrs?.custom_data?.user_id;
    const totalFormatted: string = attrs?.total_formatted || "$49.00";

    console.log(
      `Payment received: ${email} (user: ${userId || "anonymous"}, order: ${orderId}, status: ${status})`
    );

    if (status === "paid") {
      const supabase = getSupabaseAdmin();

      // If no userId from custom_data, try to find user by email (guest purchaser)
      if (!userId && email) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single();

        if (profile) {
          userId = profile.id;
          console.log(`Guest purchaser matched to profile by email: ${userId}`);
        }
      }

      if (userId) {
        // Idempotency: check if this order was already processed
        const { data: existing } = await supabase
          .from("profiles")
          .select("order_id")
          .eq("id", userId)
          .single();

        if (existing?.order_id === orderId) {
          console.log(
            `Order ${orderId} already processed for user ${userId}, skipping`
          );
          return NextResponse.json({ received: true });
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            is_premium: true,
            order_id: orderId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) {
          console.error("Failed to update profile:", error);
        }
      }

      // Send purchase confirmation email (skip if idempotency check passed above)
      if (email) {
        try {
          await sendPurchaseConfirmation({
            to: email,
            orderId,
            amount: totalFormatted,
          });
        } catch (emailError) {
          // Log but don't fail the webhook — payment is already processed
          console.error("Email send failed (non-fatal):", emailError);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
