"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress-context";
import { useAuth } from "@/lib/auth-context";
import { TOTAL_WEEKS } from "@/lib/constants";
import { Award } from "lucide-react";

export function CertificateUnlock() {
  const { user } = useAuth();
  const { completedWeeks } = useProgress();

  // Only show when logged in and all weeks complete
  if (!user || completedWeeks.length < TOTAL_WEEKS) return null;

  return (
    <Link
      href="/certificate"
      className="block mb-8 p-6 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 hover:shadow-md transition-shadow group"
    >
      <div className="flex items-center gap-4">
        <Award className="w-10 h-10 text-amber-500 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Certificate Earned!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            You&apos;ve completed all 12 weeks. View and download your certificate of completion.
          </p>
        </div>
        <span className="text-blue-600 dark:text-blue-400 text-xl group-hover:translate-x-1 transition-transform">
          &rarr;
        </span>
      </div>
    </Link>
  );
}
