"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  COURSE_IS_FREE,
  FREE_WEEKS,
  PREMIUM_WEEKS,
  PRICE_DISPLAY,
  ORIGINAL_PRICE_DISPLAY,
  LAUNCH_PRICING,
} from "@/lib/constants";
import { useState } from "react";

const freeFeatures = [
  "Weeks 1-4: foundations to first project",
  "Terminal, Git, and Claude Code basics",
  "Build & deploy your first app",
  "Community access",
];

const proFeatures = [
  "Everything in Free, plus:",
  "Weeks 5-12: intermediate to advanced",
  "Databases, auth, testing, and APIs",
  "MCP servers & AI agent development",
  "Advanced project templates",
  "Certificate of completion",
  "Priority email support",
  "Lifetime access + all future updates",
];

const projectOutcomes = [
  {
    week: "Week 5-6",
    title: "Full-Stack App with Auth",
    desc: "Database, user login, and API routes",
  },
  {
    week: "Week 7-8",
    title: "Production Testing & CI/CD",
    desc: "Automated tests, deployment pipelines",
  },
  {
    week: "Week 9-10",
    title: "MCP Servers & Integrations",
    desc: "Build tools that extend Claude Code",
  },
  {
    week: "Week 11-12",
    title: "AI Agent Teams",
    desc: "Multi-agent systems, sub-agent nesting",
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={
        className ||
        "w-4 h-4 mt-0.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0"
      }
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

function BuyButton({ variant }: { variant?: "large" }) {
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
      // Fallback
    } finally {
      setLoading(false);
    }
  }

  const large = variant === "large";

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`block w-full text-center rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${large ? "px-6 py-4 text-base" : "px-4 py-3 text-sm"}`}
    >
      {loading
        ? "Opening checkout..."
        : `Get Pro Access — ${PRICE_DISPLAY}`}
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
      {/* Launch pricing banner */}
      {LAUNCH_PRICING && (
        <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-center">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Launch Pricing — Save 50%. Price increases to {ORIGINAL_PRICE_DISPLAY}{" "}
            once we reach 200 students.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          Go From Zero to AI Coding Expert
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {PRICE_DISPLAY} is less than one hour of developer time.
          This course saves you hundreds of hours learning AI-assisted coding.
        </p>
      </div>

      {/* Social proof bar */}
      <div className="flex items-center justify-center gap-6 mb-12 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
          </svg>
          Students enrolled
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          12 weeks, project-based
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Auto-updated curriculum
        </span>
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
              Start building with AI — no credit card needed
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
            Includes weeks {FREE_WEEKS.join(", ")} of{" "}
            {FREE_WEEKS.length + PREMIUM_WEEKS.length}
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
                    The complete 12-week course
                  </p>
                </div>
                {LAUNCH_PRICING && (
                  <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                    Launch Price
                  </span>
                )}
              </div>

              <div className="mb-6">
                {LAUNCH_PRICING && (
                  <span className="text-lg text-slate-400 dark:text-slate-500 line-through mr-2">
                    {ORIGINAL_PRICE_DISPLAY}
                  </span>
                )}
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

      {/* What you'll build */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">
          What You&apos;ll Build in Weeks 5-12
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8 max-w-lg mx-auto">
          Every week includes hands-on projects you can add to your portfolio
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {projectOutcomes.map((p) => (
            <div
              key={p.week}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/50"
            >
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {p.week}
              </span>
              <h3 className="font-semibold text-slate-900 dark:text-white mt-1 text-sm">
                {p.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ROI comparison */}
      <section className="mb-16 p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">
          Why {PRICE_DISPLAY} Is a No-Brainer
        </h2>
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">$5,000+</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Average bootcamp cost for similar content
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">$150/hr</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Freelance rate AI coding skills command
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {PRICE_DISPLAY}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Lifetime access, all updates included
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto mb-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "What do I get with the free tier?",
              a: "Full access to Weeks 1-4 covering terminal basics, Git, Claude Code fundamentals, and building your first project. No credit card required.",
            },
            {
              q: "Is it a one-time payment?",
              a: "Yes. Pay once, own it forever. No subscriptions, no recurring charges. Includes all future content updates — the curriculum is automatically updated weekly.",
            },
            {
              q: "What if I'm not satisfied?",
              a: "Full 30-day money-back guarantee. If the course isn't for you, email us for a refund. No questions asked.",
            },
            {
              q: "Do I need coding experience?",
              a: "No! The course starts from absolute zero. By Week 4 (free), you'll have built and deployed your first app. Pro takes you to production-grade projects.",
            },
            {
              q: "Will the price stay at $49?",
              a: "This is launch pricing. The price will increase to $99 once we reach 200 students. Lock in the current price now and keep lifetime access.",
            },
            {
              q: "What makes this different from YouTube tutorials?",
              a: "Structure + depth + freshness. This is a complete curriculum updated weekly with the latest Claude Code features, not scattered videos that go stale. Plus hands-on projects, not just theory.",
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

      {/* Guarantee */}
      <div className="text-center p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mb-3">
          <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white mb-2">
          30-Day Money-Back Guarantee
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-4">
          Try the full Pro course risk-free. If it&apos;s not for you, get a
          complete refund within 30 days. No questions asked, no hoops to jump
          through.
        </p>
        <BuyButton variant="large" />
      </div>
    </div>
  );
}
