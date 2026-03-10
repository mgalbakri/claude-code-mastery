"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useProgress } from "@/lib/progress-context";
import { TOTAL_WEEKS } from "@/lib/constants";

const phaseColors: Record<number, string> = {
  1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  2: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  3: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
};

function getPhase(week: number): { number: number; name: string } {
  if (week <= 3) return { number: 1, name: "Foundation" };
  if (week <= 8) return { number: 2, name: "Building" };
  return { number: 3, name: "Mastery" };
}

export function ProfileClient() {
  const { user, profile, isLoading: authLoading, signInWithGithub, signInWithGoogle } = useAuth();
  const { completedWeeks, completionPercentage, isLoading: progressLoading } = useProgress();

  if (authLoading) {
    return (
      <div className="py-16 text-center">
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse mx-auto" />
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="text-4xl mb-4">&#128100;</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Your Profile
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Sign in to track your progress across all 12 weeks and earn your
          certificate of completion.
        </p>
        <div className="space-y-3">
          <button
            onClick={signInWithGithub}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Continue with GitHub
          </button>
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  // Signed in
  const displayName =
    profile?.display_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Learner";
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  const allComplete = completedWeeks.length === TOTAL_WEEKS;

  return (
    <div className="py-8 lg:py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-16 h-16 rounded-full border-2 border-slate-200 dark:border-slate-700"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {displayName}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {user.email}
          </p>
        </div>
      </div>

      {/* Certificate Banner */}
      {allComplete && (
        <Link
          href="/certificate"
          className="block mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-amber-50 dark:from-indigo-950/20 dark:to-amber-950/20 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">&#127942;</span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Certificate Earned!
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                You&apos;ve completed all 12 weeks. Click to view and download your certificate.
              </p>
            </div>
            <span className="ml-auto text-indigo-600 dark:text-indigo-400 text-xl">
              &rarr;
            </span>
          </div>
        </Link>
      )}

      {/* Progress Bar */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Course Progress
          </h2>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {completedWeeks.length}/{TOTAL_WEEKS} weeks
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progressLoading ? 0 : completionPercentage}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {completionPercentage}% complete
        </p>
      </section>

      {/* Week Grid */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Weeks
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((week) => {
            const phase = getPhase(week);
            const completed = completedWeeks.includes(week);
            return (
              <Link
                key={week}
                href={`/week/${week}`}
                className={`relative p-4 rounded-xl border text-center transition-all hover:shadow-md ${
                  completed
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                    : "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-500/40"
                }`}
              >
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${phaseColors[phase.number]}`}
                >
                  P{phase.number}
                </span>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {week}
                </div>
                {completed && (
                  <div className="absolute top-2 right-2">
                    <svg
                      className="w-4 h-4 text-emerald-500"
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
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
