"use client";

import Link from "next/link";
import { usePremiumStatus } from "@/lib/hooks/use-premium-status";
import { COURSE_IS_FREE, PRICE_DISPLAY } from "@/lib/constants";

export function ProPromoBanner() {
  const { isPremium, isLoading } = usePremiumStatus();

  // Hide entirely while the course is free
  if (COURSE_IS_FREE) return null;

  // Don't show to premium users or while loading
  if (isLoading || isPremium) return null;

  return (
    <section className="my-12">
      <div className="relative z-10 p-6 sm:p-8 rounded-lg bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Unlock the Full Course
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg">
              Get access to all 12 weeks of content including advanced workflows,
              multi-agent systems, production deployment, and a certificate of
              completion. One-time payment, lifetime access.
            </p>
          </div>
          <div className="flex-shrink-0 text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {PRICE_DISPLAY}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              one-time payment
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Get Pro Access &rarr;
            </Link>
            <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-2">
              30-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
