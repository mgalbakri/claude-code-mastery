import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client that reads the session from cookies.
 * Requires @supabase/ssr and the browser client to use createBrowserClient
 * (which mirrors sessions to cookies so the server can read them).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component — cookies can only be set from middleware or route handlers.
            // Silently ignore; the middleware handles session refresh.
          }
        },
      },
    }
  );
}

/**
 * Check if the current request is from a premium user.
 * Reads the Supabase session from cookies (set by createBrowserClient),
 * verifies it server-side, and checks is_premium in the profiles table.
 *
 * Returns false for any auth/config error — safe default (no free access).
 */
export async function getServerPremiumStatus(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return false;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    // Use service role to bypass RLS for the premium check
    const admin = createClient(url, serviceKey);
    const { data: profile } = await admin
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .single();

    return profile?.is_premium === true;
  } catch {
    return false;
  }
}
