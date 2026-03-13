"use client";

import Link from "next/link";
import { usePremiumStatus } from "@/lib/hooks/use-premium-status";
import { FREE_WEEKS, PRICE_DISPLAY } from "@/lib/constants";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";

interface PremiumGateProps {
  weekNumber: number;
  children: ReactNode;
}

export function PremiumGate({ weekNumber, children }: PremiumGateProps) {
  const { isPremium, isLoading } = usePremiumStatus();

  // Free weeks — always show
  if ((FREE_WEEKS as readonly number[]).includes(weekNumber)) {
    return <>{children}</>;
  }

  // Loading — show children to prevent layout shift (will gate on next render)
  if (isLoading) {
    return <>{children}</>;
  }

  // Premium user — show everything
  if (isPremium) {
    return <>{children}</>;
  }

  // Non-premium — show preview with blur overlay
  return (
    <div className="relative">
      {/* Content preview (first bit visible, rest blurred) */}
      <div className="relative max-h-[400px] overflow-hidden">
        {children}
        {/* Gradient fade overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent pointer-events-none" />
      </div>

      {/* Paywall CTA */}
      <div className="relative -mt-8 z-10">
        <div className="gradient-border-animated">
          <div className="relative z-10 p-8 rounded-2xl bg-white dark:bg-slate-900 shadow-xl text-center">
            <Lock className="w-8 h-8 mx-auto mb-3 text-slate-400 dark:text-slate-500" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Premium Content
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 max-w-md mx-auto">
              Week {weekNumber} is part of the Pro course. Unlock all remaining
              weeks with a single payment.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-6">
              Lifetime access &middot; All future updates included &middot;
              30-day money-back guarantee
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
    </div>
  );
}
