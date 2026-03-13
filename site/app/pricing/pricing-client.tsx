"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  COURSE_IS_FREE,
  FREE_WEEKS,
  PREMIUM_WEEKS,
  PRICE_DISPLAY,
} from "@/lib/constants";
import { useState } from "react";

const freeFeatures = [
  "Weeks 1–4: foundations to first project",
  "Terminal, Git, and Claude Code basics",
  "Build & deploy your first app",
  "Community access",
];

const proFeatures = [
  "Everything in Free, plus:",
  "Weeks 5–12: intermediate to advanced",
  "Databases, auth, testing, and APIs",
  "MCP servers & AI agent development",
  "Advanced project templates",
  "Certificate of completion",
  "Priority email support",
  "Lifetime access — all future updates",
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "w-4 h-4 mt-0.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0"}
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
  );
}

function BuyButton() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email || undefined,
          userId: user?.id || undefined,
        }),
      });

      const data = await res.json();

      if (data.url && window.LemonSqueezy) {
        window.LemonSqueezy.Url.Open(data.url);
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Fallback — direct to pricing contact
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="block w-full text-center px-4 py-3 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Opening checkout..." : `Get Pro Access — ${PRICE_DISPLAY}`}
    </button>
  );
}

export function PricingClient() {
  if (COURSE_IS_FREE) {
    return (
      <div className="py-8 lg:py-16 max-w-2xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          100% Free — All 12 Weeks
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          The entire course is currently free during early access.
        </p>
        <Link
          href="/week/1"
          className="inline-flex px-6 py-3 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Start Learning &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 lg:py-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          Start Free, Go Pro When You&apos;re Ready
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Learn the fundamentals for free. Unlock the full 12-week course with
          a single payment — lifetime access, no subscription.
        </p>
      </div>

      {/* Two-column pricing cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {/* Free tier */}
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Free
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Get started with the basics
            </p>
          </div>

          <div className="mb-6">
            <span className="text-4xl font-bold text-slate-900 dark:text-white">
              $0
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">
              forever
            </span>
          </div>

          <Link
            href="/week/1"
            className="block w-full text-center px-4 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mb-6"
          >
            Start Free
          </Link>

          <ul className="space-y-3 flex-1">
            {freeFeatures.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
              >
                <CheckIcon />
                {f}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs text-slate-500 dark:text-slate-500">
            Includes weeks {FREE_WEEKS.join(", ")} of {FREE_WEEKS.length + PREMIUM_WEEKS.length}
          </p>
        </div>

        {/* Pro tier */}
        <div className="relative">
          <div className="gradient-border-animated">
            <div className="relative z-10 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    Pro
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    The complete course
                  </p>
                </div>
                <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                  Most Popular
                </span>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  {PRICE_DISPLAY}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">
                  one-time
                </span>
              </div>

              <BuyButton />

              <ul className="space-y-3 flex-1 mt-6">
                {proFeatures.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                  >
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-xs text-slate-500 dark:text-slate-500">
                30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto mb-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "What do I get with the free tier?",
              a: "Full access to Weeks 1–4 covering terminal basics, Git, Claude Code fundamentals, and building your first project. No credit card required.",
            },
            {
              q: "Is it a one-time payment?",
              a: "Yes. Pay once, own it forever. No subscriptions, no recurring charges. Includes all future content updates.",
            },
            {
              q: "What if I'm not satisfied?",
              a: "You're covered by a 30-day money-back guarantee. If the course isn't for you, just reach out for a full refund.",
            },
            {
              q: "Do I need to sign up to start?",
              a: "No! You can start the free weeks immediately. Create an account when you want to track progress across devices or purchase Pro.",
            },
            {
              q: "Will new content be added?",
              a: "Yes. The curriculum is automatically updated with the latest Claude Code features. All updates are included with your purchase.",
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              className="p-4 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                {q}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust signals */}
      <div className="text-center p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
        <h3 className="font-bold text-slate-900 dark:text-white mb-2">
          Try before you buy
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Start with the free weeks and see the quality for yourself. When
          you&apos;re ready to go deeper, upgrade to Pro — backed by a 30-day
          money-back guarantee.
        </p>
      </div>
    </div>
  );
}
