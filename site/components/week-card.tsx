"use client";

import Link from "next/link";
import type { Week } from "@/lib/types";
import { PremiumBadge } from "@/components/premium-badge";
import { useProgress } from "@/lib/progress-context";
import { ProgressIndicator } from "@/components/progress-indicator";

interface WeekCardProps {
  week: Week;
}

export function WeekCard({ week }: WeekCardProps) {
  const { completedWeeks } = useProgress();
  const isComplete = completedWeeks.includes(week.number);

  return (
    <Link
      href={`/week/${week.number}`}
      className="block p-5 rounded-lg border-l-4 border-l-slate-200 dark:border-l-slate-700 border border-slate-100 dark:border-slate-800/50 hover:border-l-blue-500 dark:hover:border-l-blue-400 hover:shadow-sm transition-all bg-white dark:bg-slate-900/50"
    >
      <div className="flex items-start gap-3">
        <span className="relative flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-400">
          {week.number}
          {isComplete && (
            <span className="absolute -top-1 -right-1">
              <ProgressIndicator completed />
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {week.title}
            </h3>
            <PremiumBadge weekNumber={week.number} />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
            {week.subtitle || week.objective}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {week.topics.length} topics
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {week.activities.length} activities
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
