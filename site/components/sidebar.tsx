"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Phase, Appendix } from "@/lib/types";
import { useProgress } from "@/lib/progress-context";
import { useAuth } from "@/lib/auth-context";
import { ProgressIndicator } from "@/components/progress-indicator";
import { PremiumBadge } from "@/components/premium-badge";
import { UpgradeCta } from "@/components/upgrade-cta";
import { ToolRecommendationWidget } from "@/components/tool-recommendation-widget";
import { TOTAL_WEEKS } from "@/lib/constants";

interface SidebarProps {
  phases: Phase[];
  appendices: Appendix[];
}

const phaseColors: Record<number, string> = {
  1: "text-emerald-600 dark:text-emerald-400",
  2: "text-blue-600 dark:text-blue-400",
  3: "text-purple-600 dark:text-purple-400",
};

const phaseBgColors: Record<number, string> = {
  1: "bg-emerald-50 dark:bg-emerald-500/10",
  2: "bg-blue-50 dark:bg-blue-500/10",
  3: "bg-purple-50 dark:bg-purple-500/10",
};

export function Sidebar({ phases, appendices }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { completedWeeks, completionPercentage } = useProgress();

  return (
    <nav className="w-72 h-screen sticky top-0 overflow-y-auto border-r border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-950 p-4 hidden lg:block">
      <Link href="/" className="block mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Agent Code Academy
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          12-Week AI Coding Course
        </p>
      </Link>

      {/* Progress bar (logged-in users only) */}
      {user && (
        <div className="mb-5 px-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Progress</span>
            <span>{completedWeeks.length}/{TOTAL_WEEKS} weeks</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {phases.map((phase) => (
        <div key={phase.number} className="mb-5">
          <div
            className={`text-xs font-semibold uppercase tracking-wider mb-2 px-2 py-1 rounded ${phaseColors[phase.number]} ${phaseBgColors[phase.number]}`}
          >
            Phase {phase.number}: {phase.name}
          </div>
          <ul className="space-y-0.5">
            {phase.weeks.map((week) => {
              const href = `/week/${week.number}`;
              const isActive = pathname === href;
              const isComplete = completedWeeks.includes(week.number);
              return (
                <li key={week.number}>
                  <Link
                    href={href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium border-l-2 border-indigo-500"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <ProgressIndicator completed={isComplete} />
                    <span className="text-slate-400 dark:text-slate-600 mr-0.5 text-xs">
                      {week.number}.
                    </span>
                    <span className="flex-1 truncate">{week.title}</span>
                    <PremiumBadge weekNumber={week.number} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {appendices.length > 0 && (
        <div className="mb-5">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-2 py-1 rounded text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50">
            Appendices
          </div>
          <ul className="space-y-0.5">
            {appendices.map((appendix) => {
              const href = `/appendix/${appendix.letter.toLowerCase()}`;
              const isActive = pathname === href;
              return (
                <li key={appendix.letter}>
                  <Link
                    href={href}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium border-l-2 border-indigo-500"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <span className="text-slate-400 dark:text-slate-600 mr-1.5 text-xs">
                      {appendix.letter}.
                    </span>
                    {appendix.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Newsletter */}
      <div className="mb-5">
        <Link
          href="/newsletter"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === "/newsletter" || pathname.startsWith("/newsletter/")
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium border-l-2 border-indigo-500"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="flex-shrink-0"
          >
            <rect x="1" y="3" width="14" height="10" rx="1.5" />
            <path d="M1 5l7 4 7-4" />
          </svg>
          Newsletter
        </Link>
      </div>

      {/* Certificate link (when all complete) */}
      {completedWeeks.length === TOTAL_WEEKS && (
        <div className="mb-5">
          <Link
            href="/certificate"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800 text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
          >
            <span>&#127942;</span>
            View Certificate
          </Link>
        </div>
      )}

      {/* Upgrade CTA */}
      <UpgradeCta />

      {/* Tool Recommendations */}
      <ToolRecommendationWidget />
    </nav>
  );
}
