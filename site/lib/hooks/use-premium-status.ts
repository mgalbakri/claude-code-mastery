"use client";

import { useAuth } from "@/lib/auth-context";

/**
 * Returns the premium status of the current user from Supabase auth context.
 *
 * NOTE: This hook is used for client-side UI decisions only (e.g. showing/hiding
 * "upgrade" buttons). The actual content gate is enforced server-side in
 * app/week/[number]/page.tsx via getServerPremiumStatus() — this hook cannot
 * be used to bypass the paywall.
 *
 * The previous localStorage token fallback was removed because it could be
 * trivially faked: btoa(JSON.stringify({orderId:'anything'})) granted full access.
 * Anonymous purchasers should sign in to access their purchase.
 */
export function usePremiumStatus() {
  const { isPremium, isLoading } = useAuth();
  return { isPremium, isLoading };
}
