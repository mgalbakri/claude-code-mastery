"use client";

import { useState, useEffect, type FormEvent } from "react";
import { SUBSCRIBE_API, LS_EMAIL_SUBSCRIBED as SUBSCRIBED_KEY } from "@/lib/constants";

export function InlineEmailCta({ message }: { message: string }) {
  const [subscribed, setSubscribed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(SUBSCRIBED_KEY)) {
      setSubscribed(true);
    }
  }, []);

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
        setSubscribed(true);
        localStorage.setItem(SUBSCRIBED_KEY, "1");
      }
    } catch {
      // Falls back gracefully
    } finally {
      setSubmitting(false);
    }
  }

  if (subscribed && !submitted) return null;

  if (submitted) {
    return (
      <div className="my-6 py-3 text-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
        Subscribed! We&apos;ll keep you posted.
      </div>
    );
  }

  return (
    <div className="my-6 flex flex-col sm:flex-row items-center justify-center gap-3 py-4 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {message}
      </p>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-shrink-0">
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="w-44 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "..." : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
