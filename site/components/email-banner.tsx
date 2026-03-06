"use client";

import { useState, useEffect, type FormEvent } from "react";
import {
  SUBSCRIBE_API,
  LS_EMAIL_DISMISSED as DISMISSED_KEY,
  LS_EMAIL_SUBSCRIBED as SUBSCRIBED_KEY,
  CHEAT_SHEET_PATH,
} from "@/lib/constants";

export function EmailBanner() {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    const subscribed = localStorage.getItem(SUBSCRIBED_KEY);
    if (!dismissed && !subscribed) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const email = new FormData(e.currentTarget).get("email");

    try {
      const res = await fetch(SUBSCRIBE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
        localStorage.setItem(SUBSCRIBED_KEY, "1");
        localStorage.setItem(DISMISSED_KEY, "1");
        setTimeout(() => setVisible(false), 3000);
      }
    } catch {
      // Falls back gracefully
    } finally {
      setSubmitting(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="mb-8 p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 relative">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        aria-label="Dismiss"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>

      {submitted ? (
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            You&apos;re subscribed! We&apos;ll keep you updated.
          </p>
          <a
            href={CHEAT_SHEET_PATH}
            download
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:underline"
          >
            &#8595; Download AI Coding Cheat Sheet (PDF)
          </a>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0 pr-6 sm:pr-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Free AI Coding Cheat Sheet + lesson updates
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Subscribe for the cheat sheet PDF, curriculum updates, and tips. No spam.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="w-full sm:w-52 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {submitting ? "..." : "Subscribe"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
