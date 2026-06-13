import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Verify the Supabase JWT from the Authorization header and return the
 * authenticated user.  Returns null if the token is missing or invalid.
 */
async function getAuthUser(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

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

  // If a userId is provided, verify it matches the authenticated user
  if (userId) {
    const user = await getAuthUser(request);
    if (!user || user.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
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
        { error: "Failed to create checkout" },
        { status: 500 }
      );
    }

    const data = await res.json();
    const checkoutUrl = data.data?.attributes?.url;

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
