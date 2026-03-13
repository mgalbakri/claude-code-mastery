import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  const variantId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID;
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID;

  if (!apiKey || !variantId || !storeId) {
    return NextResponse.json(
      { error: "Payment not configured" },
      { status: 500 }
    );
  }

  let email: string | undefined;
  let userId: string | undefined;
  try {
    const body = await request.json();
    email = body.email;
    userId = body.userId;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_options: {
              embed: true,
            },
            checkout_data: {
              email: email || undefined,
              ...(userId
                ? { custom: { user_id: userId } }
                : {}),
            },
            product_options: {
              redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://agentcodeacademy.com"}/payment/success`,
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: storeId,
              },
            },
            variant: {
              data: {
                type: "variants",
                id: variantId,
              },
            },
          },
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Lemon Squeezy checkout error:", res.status, err);
      return NextResponse.json(
        { error: "Failed to create checkout", detail: err },
        { status: 500 }
      );
    }

    const data = await res.json();
    const checkoutUrl = data.data?.attributes?.url;

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout", detail: String(error) },
      { status: 500 }
    );
  }
}
