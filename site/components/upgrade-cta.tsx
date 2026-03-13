"use client";

import Link from "next/link";
import { usePremiumStatus } from "@/lib/hooks/use-premium-status";
import { COURSE_IS_FREE, PRICE_DISPLAY } from "@/lib/constants";

export function UpgradeCta() {
  const { isPremium, isLoading } = usePremiumStatus();

  // Hide entirely while the course is free
  if (COURSE_IS_FREE) return null;

  if (isLoading || isPremium) return null;

  return (
    <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50">
      <Link
        href="/pricing"
        className="block text-center group"
      >
        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          Upgrade to Pro — {PRICE_DISPLAY}
        </p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
          Unlock all 12 weeks + certificate
        </p>
      </Link>
    </div>
  );
}
