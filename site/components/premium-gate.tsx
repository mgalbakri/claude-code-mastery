"use client";

import Link from "next/link";
import { PRICE_DISPLAY, ORIGINAL_PRICE_DISPLAY, LAUNCH_PRICING } from "@/lib/constants";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";

interface PremiumGateProps {
  weekNumber: number;
  children: ReactNode;
  /**
   * Server-confirmed premium status passed from the Server Component.
   * When true, children (the full lesson) were included in the server render.
   * When false, children is null — nothing to hide, paywall is shown instead.
   */
  serverPremium: boolean;
}

export function PremiumGate({
  weekNumber,
  children,
  serverPremium,
}: PremiumGateProps) {
  // Server confirmed this user is premium — render content directly.
  if (serverPremium) {
    return <>{children}</>;
  }

  // Not premium — show paywall only. children is null (passed as null from
  // page.tsx) so no premium content is in the DOM at all.
  return (
    <div className="relative mt-2">
      <div className="gradient-border-animated">
        <div className="relative z-10 p-8 rounded-2xl bg-white dark:bg-slate-900 shadow-xl text-center">
          <Lock className="w-8 h-8 mx-auto mb-3 text-slate-400 dark:text-slate-500" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Unlock Week {weekNumber} + All Pro Content
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 max-w-md mx-auto">
            Get lifetime access to Weeks 5-12: databases, auth, MCP servers, AI
            agents, and more. One payment, no subscription.
          </p>
          {LAUNCH_PRICING && (
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
              Launch price: {PRICE_DISPLAY} (increases to {ORIGINAL_PRICE_DISPLAY} soon)
            </p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-500 mb-6">
            30-day money-back guarantee &middot; All future updates included
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex px-6 py-3 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Get Pro Access — {PRICE_DISPLAY}
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline underline-offset-2"
            >
              See what&apos;s included
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
