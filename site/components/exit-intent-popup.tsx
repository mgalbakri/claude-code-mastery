"use client";

import { useState, useEffect, useCallback, useRef, type FormEvent } from "react";
import { SUBSCRIBE_API, LS_EXIT_INTENT_SHOWN, LS_EMAIL_SUBSCRIBED, CHEAT_SHEET_PATH } from "@/lib/constants";
import { getStoredReferrer } from "@/lib/referral";
import { ReferralPrompt } from "@/components/referral-prompt";

export function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef("");

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger when cursor leaves the top of the viewport
    if (e.clientY > 0) return;

    // Only on desktop
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    // Only once per session
    if (sessionStorage.getItem(LS_EXIT_INTENT_SHOWN)) return;

    // Not if already subscribed
    if (localStorage.getItem(LS_EMAIL_SUBSCRIBED)) return;

    sessionStorage.setItem(LS_EXIT_INTENT_SHOWN, "1");
    setVisible(true);
  }, []);

  useEffect(() => {
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseLeave]);

  function dismiss() {
    setVisible(false);
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
        localStorage.setItem(LS_EMAIL_SUBSCRIBED, "1");
      }
    } catch {
      // Falls back gracefully
    } finally {
      setSubmitting(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800/50 p-8 text-center">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 5l10 10M15 5l-10 10" />
          </svg>
        </button>

        {submitted ? (
          <>
            <div className="text-3xl mb-3">&#10003;</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              You&apos;re subscribed!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Grab your free AI Coding Cheat Sheet:
            </p>
            <a
              href={CHEAT_SHEET_PATH}
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              &#8595; Download Cheat Sheet (PDF)
            </a>
            <ReferralPrompt email={emailRef.current} variant="compact" />
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Free AI Coding Cheat Sheet
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
              Get the free <strong>AI Coding Cheat Sheet</strong> — a quick-reference guide for working with AI coding agents. Plus curriculum updates and tips.
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3"
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
                {submitting ? "..." : "Get the Cheat Sheet"}
              </button>
            </form>

            <p className="text-xs text-slate-400 dark:text-slate-500">
              No spam. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
