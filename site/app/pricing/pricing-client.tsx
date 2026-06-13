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
  "Weeks 1-4 only",
  "Terminal & Git basics",
  "Build your first app",
  "Community access",
];

const proFeatures = [
  "All 12 weeks",
  "Databases, auth, testing, APIs",
  "MCP servers & AI agents",
  "Advanced project templates",
  "Certificate of completion",
  "Email support",
  "Lifetime access + updates",
];

const teamFeatures = [
  "Everything in Pro",
  "Up to 5 team seats",
  "Team progress dashboard",
  "Priority email support",
  "Private onboarding call",
  "Invoice billing available",
  "Lifetime access + updates",
];

const vipFeatures = [
  "Everything in Team",
  "Unlimited seats",
  "1-on-1 async code review (30 days)",
  "Custom CLAUDE.md setup for your stack",
  "Direct Slack/email access to instructor",
  "Resume/portfolio review",
  "Lifetime access + updates",
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

function BuyButton({
  variant,
  label,
  tier,
}: {
  variant?: "large";
  label?: string;
  tier?: string;
}) {
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
          tier: tier || "pro",
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
      {loading ? "Opening checkout..." : label || `Get Pro Access — ${PRICE_DISPLAY}`}
    </button>
  );
}

function ContactButton({ label }: { label: string }) {
  return (
    <a
      href="mailto:hello@agentcodeacademy.com?subject=Team%20%2F%20VIP%20Access"
      className="block w-full text-center px-4 py-3 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
    >
      {label}
    </a>
  );
}

function TierCard({
  name,
  subtitle,
  price,
  originalPrice,
  priceSuffix,
  badge,
  features,
  cta,
  highlighted,
  footnote,
}: {
  name: string;
  subtitle: string;
  price: string;
  originalPrice?: string;
  priceSuffix: string;
  badge?: string;
  features: string[];
  cta: React.ReactNode;
  highlighted?: boolean;
  footnote?: string;
}) {
  const card = (
    <div
      className={`p-6 sm:p-8 rounded-2xl flex flex-col h-full ${
        highlighted
          ? "bg-white dark:bg-slate-900"
          : "border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/50"
      }`}
    >
      <div className="flex items-center gap-2 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {name}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
        {badge && (
          <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
            {badge}
          </span>
        )}
      </div>

      <div className="mb-6">
        {originalPrice && (
          <span className="text-lg text-slate-400 dark:text-slate-500 line-through mr-2">
            {originalPrice}
          </span>
        )}
        <span className="text-4xl font-bold text-slate-900 dark:text-white">
          {price}
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">
          {priceSuffix}
        </span>
      </div>

      {cta}

      <ul className="space-y-3 flex-1 mt-6">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
          >
            <CheckIcon />
            {f}
          </li>
        ))}
      </ul>

      {footnote && (
        <p className="mt-6 text-xs text-slate-500 dark:text-slate-500">
          {footnote}
        </p>
      )}
    </div>
  );

  if (highlighted) {
    return (
      <div className="relative">
        <div className="gradient-border-animated">
          <div className="relative z-10">{card}</div>
        </div>
      </div>
    );
  }

  return card;
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
    <div className="py-8 lg:py-16 max-w-6xl mx-auto">
      {/* Launch pricing banner */}
      {LAUNCH_PRICING && (
        <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-center">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Launch Pricing — Save 50% on all plans. Prices increase once we
            reach 200 students.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          Choose Your Plan
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Start free, go Pro when you&apos;re ready. Teams and VIP options for
          serious learners.
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
          30-day money-back guarantee
        </span>
      </div>

      {/* 4-tier pricing grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
        <TierCard
          name="Free"
          subtitle="Start building with AI"
          price="$0"
          priceSuffix="forever"
          features={freeFeatures}
          cta={
            <Link
              href="/week/1"
              className="block w-full text-center px-4 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Start Free
            </Link>
          }
          footnote={`Includes weeks ${FREE_WEEKS.join(", ")} of ${FREE_WEEKS.length + PREMIUM_WEEKS.length}`}
        />

        <TierCard
          name="Pro"
          subtitle="The complete course"
          price={PRICE_DISPLAY}
          originalPrice={LAUNCH_PRICING ? ORIGINAL_PRICE_DISPLAY : undefined}
          priceSuffix="one-time"
          badge={LAUNCH_PRICING ? "Most Popular" : undefined}
          features={proFeatures}
          cta={<BuyButton label={`Get Pro — ${PRICE_DISPLAY}`} tier="pro" />}
          highlighted
          footnote="30-day money-back guarantee"
        />

        <TierCard
          name="Team"
          subtitle="For teams up to 5"
          price="$149"
          originalPrice={LAUNCH_PRICING ? "$299" : undefined}
          priceSuffix="one-time"
          badge={LAUNCH_PRICING ? "50% off" : undefined}
          features={teamFeatures}
          cta={<ContactButton label="Get Team Access" />}
          footnote="Includes 5 seats. Need more? Ask about Enterprise."
        />

        <TierCard
          name="VIP"
          subtitle="Personal mentorship"
          price="$299"
          originalPrice={LAUNCH_PRICING ? "$599" : undefined}
          priceSuffix="one-time"
          badge="Limited spots"
          features={vipFeatures}
          cta={<ContactButton label="Apply for VIP" />}
          footnote="Only 10 VIP spots per month"
        />
      </div>

      {/* What you'll build */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">
          What You&apos;ll Build in Weeks 5-12
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8 max-w-lg mx-auto">
          Every week includes hands-on projects you can add to your portfolio
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          Why This Is a No-Brainer
        </h2>
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              $5,000+
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Average bootcamp cost for similar content
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              $150/hr
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Freelance rate AI coding skills command
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              From {PRICE_DISPLAY}
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
              q: "What's the difference between Pro, Team, and VIP?",
              a: "Pro is for individuals — all 12 weeks, lifetime access. Team adds 5 seats and an onboarding call for your group. VIP adds personal mentorship: 1-on-1 code review, custom CLAUDE.md setup, and direct access to the instructor.",
            },
            {
              q: "Is it a one-time payment?",
              a: "Yes. All plans are one-time. No subscriptions, no recurring charges. Includes all future content updates — the curriculum is automatically updated weekly.",
            },
            {
              q: "What if I'm not satisfied?",
              a: "Full 30-day money-back guarantee on all plans. If the course isn't for you, email us for a refund. No questions asked.",
            },
            {
              q: "Do I need coding experience?",
              a: "No! The course starts from absolute zero. By Week 4 (free), you'll have built and deployed your first app. Pro takes you to production-grade projects.",
            },
            {
              q: "Will the price stay this low?",
              a: "This is launch pricing. All prices will double once we reach 200 students. Lock in the current price now and keep lifetime access.",
            },
            {
              q: "Can I upgrade from Pro to Team or VIP later?",
              a: "Yes — just pay the difference. Email us and we'll send you an upgrade link.",
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
          <svg
            className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white mb-2">
          30-Day Money-Back Guarantee
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-4">
          Try any plan risk-free. If it&apos;s not for you, get a complete
          refund within 30 days. No questions asked.
        </p>
        <BuyButton
          variant="large"
          label={`Get Started — ${PRICE_DISPLAY}`}
          tier="pro"
        />
      </div>
    </div>
  );
}
