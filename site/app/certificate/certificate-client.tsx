"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useProgress } from "@/lib/progress-context";
import { Certificate } from "@/components/certificate";
import { TOTAL_WEEKS } from "@/lib/constants";

function generateCertificateId(userId: string): string {
  // Simple hash for certificate ID
  let hash = 0;
  const str = userId + "aca-cert-2026";
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `ACA-${Math.abs(hash).toString(36).toUpperCase().padStart(8, "0")}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function CertificateClient() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { completedWeeks, isLoading: progressLoading } = useProgress();

  if (authLoading || progressLoading) {
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
        <div className="text-4xl mb-4">&#128274;</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Certificate of Completion
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Sign in and complete all 12 weeks to earn your certificate.
        </p>
        <Link
          href="/profile"
          className="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Not all weeks complete
  if (completedWeeks.length < TOTAL_WEEKS) {
    const remaining = TOTAL_WEEKS - completedWeeks.length;
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="text-4xl mb-4">&#128221;</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Almost There!
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          Complete {remaining} more week{remaining !== 1 ? "s" : ""} to earn your certificate.
        </p>
        <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden my-6 max-w-xs mx-auto">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(completedWeeks.length / TOTAL_WEEKS) * 100}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
          {completedWeeks.length}/{TOTAL_WEEKS} weeks completed
        </p>
        <Link
          href="/"
          className="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Continue Learning
        </Link>
      </div>
    );
  }

  // All complete — show certificate
  const displayName =
    profile?.display_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Learner";
  const certificateId = generateCertificateId(user.id);
  const completionDate = formatDate(new Date());

  function handlePrint() {
    window.print();
  }

  return (
    <div className="py-8 lg:py-12">
      {/* Actions */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/profile"
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          &larr; Back to Profile
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity print:hidden"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print / Download PDF
        </button>
      </div>

      {/* Certificate */}
      <div className="print:fixed print:inset-0 print:flex print:items-center print:justify-center print:bg-white">
        <Certificate
          name={displayName}
          date={completionDate}
          certificateId={certificateId}
        />
      </div>

      {/* Instructions */}
      <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6 print:hidden">
        Tip: Use your browser&apos;s Print function (Ctrl/Cmd + P) and select &quot;Save as PDF&quot; to download.
      </p>
    </div>
  );
}
