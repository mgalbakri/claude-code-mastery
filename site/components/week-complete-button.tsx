"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useProgress } from "@/lib/progress-context";

interface WeekCompleteButtonProps {
  weekNumber: number;
}

export function WeekCompleteButton({ weekNumber }: WeekCompleteButtonProps) {
  const { user } = useAuth();
  const { isWeekComplete, toggleWeekComplete } = useProgress();
  const [isToggling, setIsToggling] = useState(false);

  // Don't show for anonymous users
  if (!user) return null;

  const completed = isWeekComplete(weekNumber);

  async function handleToggle() {
    setIsToggling(true);
    await toggleWeekComplete(weekNumber);
    setIsToggling(false);
  }

  return (
    <div className="my-8 flex justify-center">
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          completed
            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            : "bg-blue-600 dark:bg-blue-500 text-white hover:opacity-90"
        }`}
      >
        {completed ? (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Week {weekNumber} Complete!
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
            Mark Week {weekNumber} as Complete
          </>
        )}
      </button>
    </div>
  );
}
