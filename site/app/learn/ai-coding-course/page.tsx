import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best AI Coding Course 2026 — Learn to Code with AI",
  description:
    "The best AI coding courses in 2026 compared. Agent Code Academy offers a free 12-week structured course covering Claude Code, MCP servers, and AI agent development.",
  openGraph: {
    title: "Best AI Coding Course 2026",
    description:
      "Compare the top AI coding courses. Start learning for free with Agent Code Academy.",
    url: "https://agentcodeacademy.com/learn/ai-coding-course",
  },
  alternates: {
    canonical: "https://agentcodeacademy.com/learn/ai-coding-course",
  },
};

const courses = [
  {
    name: "Agent Code Academy",
    price: "$49 (lifetime)",
    free: "Weeks 1-4 free",
    format: "Self-paced, text-based + exercises",
    focus: "Claude Code, MCP, AI agents",
    updated: "Weekly (auto-updated)",
    highlight: true,
  },
  {
    name: "Traditional Bootcamps",
    price: "$5,000-15,000",
    free: "Usually none",
    format: "Live cohort, 8-12 weeks",
    focus: "General web development",
    updated: "Per cohort",
    highlight: false,
  },
  {
    name: "YouTube / Free Content",
    price: "Free",
    free: "Everything",
    format: "Unstructured videos",
    focus: "Varies widely",
    updated: "Sporadic",
    highlight: false,
  },
  {
    name: "Udemy / Coursera",
    price: "$15-200",
    free: "Sometimes previews",
    format: "Video lectures + quizzes",
    focus: "General programming",
    updated: "Rarely after launch",
    highlight: false,
  },
];

export default function AiCodingCourse() {
  return (
    <article className="py-8 lg:py-16 max-w-4xl mx-auto">
      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
          Guide
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          Best AI Coding Course in 2026
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          AI-assisted coding is the most valuable skill you can learn right now.
          Here&apos;s how to choose the right course for your goals and budget.
        </p>
      </header>

      {/* Why AI coding */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Why Learn AI-Assisted Coding in 2026?
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              stat: "10x",
              label: "Faster development",
              desc: "AI handles boilerplate so you focus on logic",
            },
            {
              stat: "$150+/hr",
              label: "Freelance rates",
              desc: "AI coding skills command premium rates",
            },
            {
              stat: "83%",
              label: "Of developers use AI",
              desc: "It's no longer optional — it's expected",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 text-center"
            >
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {s.stat}
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                {s.label}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          How Courses Compare
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-left p-3 font-semibold text-slate-900 dark:text-white">
                  Course
                </th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3">Free Tier</th>
                <th className="text-left p-3">Format</th>
                <th className="text-left p-3">Updates</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr
                  key={c.name}
                  className={`border-b border-slate-100 dark:border-slate-800/50 ${
                    c.highlight
                      ? "bg-blue-50/50 dark:bg-blue-950/10"
                      : ""
                  }`}
                >
                  <td className="p-3 font-medium text-slate-900 dark:text-white">
                    {c.name}
                    {c.highlight && (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Recommended
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    {c.price}
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    {c.free}
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    {c.format}
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    {c.updated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* What makes ACA different */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          What Makes Agent Code Academy Different
        </h2>
        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
          {[
            {
              title: "Auto-updated curriculum",
              desc: "The course updates automatically every week with the latest Claude Code features. You're never learning outdated techniques.",
            },
            {
              title: "Project-based from day one",
              desc: "Every week includes hands-on projects. By Week 4 (free), you'll have built and deployed a real application.",
            },
            {
              title: "Covers the full stack",
              desc: "From terminal basics to MCP servers to multi-agent AI systems. This isn't a surface-level overview — it's a complete engineering curriculum.",
            },
            {
              title: "Try before you buy",
              desc: "Weeks 1-4 are completely free. See the quality, do the exercises, build a project. Upgrade to Pro only if you want to go deeper.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                {item.title}
              </h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 text-center">
        <h2 className="font-bold text-slate-900 dark:text-white mb-2">
          Start Learning for Free
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
          Weeks 1-4 are free. Build your first AI-coded project today — no
          credit card, no signup required.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/week/1"
            className="inline-flex justify-center px-6 py-3 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Start Week 1 Free &rarr;
          </Link>
          <Link
            href="/pricing"
            className="inline-flex justify-center px-6 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            See Pro Pricing
          </Link>
        </div>
      </div>
    </article>
  );
}
