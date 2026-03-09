"use client";

import { useState, useRef, type FormEvent } from "react";
import { useEmailStatus } from "@/lib/hooks/use-email-status";
import {
  SUBSCRIBE_API,
  FREE_WEEKS,
  CHEAT_SHEET_PATH,
} from "@/lib/constants";
import { getStoredReferrer } from "@/lib/referral";
import { ReferralPrompt } from "@/components/referral-prompt";

interface EmailGateProps {
  weekNumber: number;
}

export function EmailGate({ weekNumber }: EmailGateProps) {
  const { isSubscribed, isGateSkipped, isLoading, markSubscribed, markGateSkipped } =
    useEmailStatus();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef("");

  // Don't show on free weeks, if already subscribed, or if skipped
  if (
    isLoading ||
    (FREE_WEEKS as readonly number[]).includes(weekNumber) ||
    isSubscribed ||
    isGateSkipped
  ) {
    return null;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const email = new FormData(e.currentTarget).get("email") as string;
    emailRef.current = email;
    const referrer = getStoredReferrer();

    try {
      const res = await fetch(SUBSCRIBE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, referrer }),
      });
      if (res.ok) {
        setSubmitted(true);
        markSubscribed();
      }
    } catch {
      // Falls back gracefully
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="my-8 p-8 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 text-center">
        <div className="text-3xl mb-3">&#10003;</div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          You&apos;re in! Full access unlocked.
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          As a bonus, grab your free AI Coding Cheat Sheet:
        </p>
        <a
          href={CHEAT_SHEET_PATH}
          download
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          &#8595; Download Cheat Sheet (PDF)
        </a>
        <ReferralPrompt email={emailRef.current} />
      </div>
    );
  }

  return (
    <div className="my-8 relative">
      {/* Overlay */}
      <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-800 shadow-xl text-center">
        <div className="text-3xl mb-3">&#128274;</div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Continue to Week {weekNumber}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 max-w-md mx-auto">
          Enter your email to continue — plus get a free <strong>AI Coding Cheat Sheet</strong> PDF.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
          No spam, ever. Unsubscribe anytime.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-4"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="w-full sm:flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Subscribing..." : "Continue & Get Cheat Sheet"}
          </button>
        </form>

        <button
          onClick={markGateSkipped}
          className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors underline underline-offset-2"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
