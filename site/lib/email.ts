import { Resend } from "resend";

// Lazy initialization — avoids crashing at build time when env var isn't set
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not configured");
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM_EMAIL =
  process.env.EMAIL_FROM || "Agent Code Academy <onboarding@resend.dev>";

interface PurchaseEmailParams {
  to: string;
  orderId: string;
  amount: string;
}

export async function sendPurchaseConfirmation({
  to,
  orderId,
  amount,
}: PurchaseEmailParams) {
  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Welcome to Agent Code Academy Pro!",
    html: buildPurchaseEmailHtml({ orderId, amount }),
  });

  if (error) {
    console.error("Failed to send purchase confirmation email:", error);
    throw error;
  }

  console.log(`Purchase confirmation email sent to ${to} (id: ${data?.id})`);
  return data;
}

function buildPurchaseEmailHtml({
  orderId,
  amount,
}: {
  orderId: string;
  amount: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Agent Code Academy Pro</title>
</head>
<body style="margin:0; padding:0; background:#f8fafc; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background:#2563eb; padding:32px 40px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700;">
                Agent Code Academy
              </h1>
              <p style="margin:8px 0 0; color:rgba(255,255,255,0.9); font-size:14px;">
                Pro Access Confirmed
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px; color:#1e293b; font-size:20px; font-weight:600;">
                Welcome aboard! 🎉
              </h2>
              <p style="margin:0 0 24px; color:#475569; font-size:15px; line-height:1.6;">
                Thank you for purchasing Agent Code Academy Pro. All 12 weeks of the course are now unlocked and ready for you.
              </p>

              <!-- What you get -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9; border-radius:8px; margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 12px; color:#1e293b; font-size:14px; font-weight:600;">
                      Your Pro access includes:
                    </p>
                    <table cellpadding="0" cellspacing="0">
                      <tr><td style="padding:4px 0; color:#475569; font-size:14px;">✅ All 12 weeks of curriculum (Weeks 1–12)</td></tr>
                      <tr><td style="padding:4px 0; color:#475569; font-size:14px;">✅ Hands-on projects &amp; exercises</td></tr>
                      <tr><td style="padding:4px 0; color:#475569; font-size:14px;">✅ Lifetime access with all future updates</td></tr>
                      <tr><td style="padding:4px 0; color:#475569; font-size:14px;">✅ Certificate of completion</td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="https://agentcodeacademy.com/week/5" style="display:inline-block; padding:14px 32px; background:#2563eb; color:#ffffff; text-decoration:none; border-radius:8px; font-size:15px; font-weight:600;">
                      Start Week 5 →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px; color:#475569; font-size:14px; line-height:1.6;">
                If you were already on the free tier, you can pick up right where you left off — Week 5 is where the Pro content begins.
              </p>

              <!-- Order Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0; margin-top:24px; padding-top:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 8px; color:#94a3b8; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; font-weight:600;">
                      Order details
                    </p>
                    <table cellpadding="0" cellspacing="0" style="font-size:14px; color:#475569;">
                      <tr>
                        <td style="padding:4px 16px 4px 0; color:#94a3b8;">Order ID</td>
                        <td style="padding:4px 0;">#${orderId}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 16px 4px 0; color:#94a3b8;">Amount</td>
                        <td style="padding:4px 0;">${amount}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 16px 4px 0; color:#94a3b8;">Product</td>
                        <td style="padding:4px 0;">Agent Code Academy Pro</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 16px 4px 0; color:#94a3b8;">Access</td>
                        <td style="padding:4px 0;">Lifetime</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px; background:#f8fafc; border-top:1px solid #e2e8f0; text-align:center;">
              <p style="margin:0 0 8px; color:#94a3b8; font-size:13px;">
                Need help? Reply to this email and we'll get back to you.
              </p>
              <p style="margin:0; color:#cbd5e1; font-size:12px;">
                Agent Code Academy · <a href="https://agentcodeacademy.com" style="color:#6366f1; text-decoration:none;">agentcodeacademy.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
