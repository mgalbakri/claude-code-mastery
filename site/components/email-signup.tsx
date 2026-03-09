"use client";

import { useState, useRef, type FormEvent } from "react";
import { SUBSCRIBE_API, CHEAT_SHEET_PATH } from "@/lib/constants";
import { getStoredReferrer } from "@/lib/referral";
import { ReferralPrompt } from "@/components/referral-prompt";

export function EmailSignup() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef("");

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
      }
    } catch {
      // Falls back gracefully
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="my-16 text-center p-8 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50">
        <div className="text-2xl mb-2">&#10003;</div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          You&apos;re on the list!
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          We&apos;ll send you updates on new lessons, tips, and Claude Code news.
        </p>
        <a
          href={CHEAT_SHEET_PATH}
          download
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          &#8595; Download AI Coding Cheat Sheet (PDF)
        </a>
        <ReferralPrompt email={emailRef.current} />
      </section>
    );
  }

  return (
    <section className="my-16 p-8 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 text-center">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        Stay Updated + Free Cheat Sheet
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
        Subscribe and get the free <strong>AI Coding Cheat Sheet</strong> PDF — plus
        curriculum updates and Claude Code tips. No spam, ever.
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="w-full sm:flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      <p className="text-xs text-slate-400 dark:text-slate-600 mt-3">
        Free forever. Unsubscribe anytime.
      </p>
    </section>
  );
}
