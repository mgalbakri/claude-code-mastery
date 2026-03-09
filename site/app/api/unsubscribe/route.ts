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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return new NextResponse(unsubscribePage("Missing email parameter."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
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
