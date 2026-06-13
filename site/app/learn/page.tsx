import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Learn Claude Code — Free Tutorials & Course",
  description:
    "Learn Claude Code with free tutorials, a structured 12-week course, and hands-on projects. From beginner to AI coding expert.",
  openGraph: {
    title: "Learn Claude Code — Agent Code Academy",
    description:
      "Free tutorials and a 12-week structured course to master AI-assisted coding with Claude Code.",
    url: "https://agentcodeacademy.com/learn",
  },
  alternates: { canonical: "https://agentcodeacademy.com/learn" },
};

const tutorials = [
  {
    href: "/learn/claude-code-tutorial",
    title: "Claude Code Tutorial: Complete Beginner's Guide",
    desc: "Install Claude Code, write your first prompt, and build a real project in under 2 hours.",
    tag: "Beginner",
  },
  {
    href: "/learn/ai-coding-course",
    title: "Best AI Coding Course in 2026",
    desc: "Compare the top AI coding courses and find the right one for your goals and budget.",
    tag: "Guide",
  },
  {
    href: "/learn/claude-code-vs-cursor",
    title: "Claude Code vs Cursor: Honest Comparison",
    desc: "Feature-by-feature breakdown of the two most popular AI coding tools.",
    tag: "Comparison",
  },
];

export default function LearnIndex() {
  return (
    <div className="py-8 lg:py-16 max-w-3xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
        Learn AI-Assisted Coding
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-10">
        Free tutorials, guides, and a structured 12-week course to master
        Claude Code and AI-assisted development.
      </p>

      <div className="space-y-4 mb-12">
        {tutorials.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="block p-6 rounded-xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {t.tag}
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {t.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {t.desc}
            </p>
          </Link>
        ))}
      </div>

      <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 text-center">
        <h2 className="font-bold text-slate-900 dark:text-white mb-2">
          Want the full structured course?
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          12 weeks from zero to AI coding expert. Weeks 1-4 are completely free.
        </p>
        <Link
          href="/week/1"
          className="inline-flex px-6 py-3 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Start Week 1 Free &rarr;
        </Link>
      </div>
    </div>
  );
}
