import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Claude Code vs Cursor: Honest Comparison (2026)",
  description:
    "Claude Code vs Cursor — detailed comparison of features, pricing, and real-world performance. Which AI coding tool is right for you?",
  openGraph: {
    title: "Claude Code vs Cursor — Which AI Coding Tool Wins?",
    description:
      "Feature-by-feature comparison of Claude Code and Cursor for developers.",
    url: "https://agentcodeacademy.com/learn/claude-code-vs-cursor",
  },
  alternates: {
    canonical: "https://agentcodeacademy.com/learn/claude-code-vs-cursor",
  },
};

const comparison = [
  {
    category: "Interface",
    claude: "Terminal CLI, Desktop app, Web app, VS Code, JetBrains, Chrome",
    cursor: "Custom VS Code fork (IDE only)",
    verdict: "Claude Code",
    note: "Claude Code works everywhere; Cursor locks you into one editor",
  },
  {
    category: "AI Models",
    claude: "Fable 5, Opus 4.8, Opus 4.7, Opus 4.6, Sonnet 4.6, Haiku 4.5",
    cursor: "GPT-4o, Claude Sonnet, custom models",
    verdict: "Claude Code",
    note: "Access to Anthropic's best models directly, including Fable 5",
  },
  {
    category: "Agentic Coding",
    claude:
      "Full agent: reads files, runs commands, creates commits, deploys, sub-agent nesting (5 levels)",
    cursor: "Tab completion, chat, limited command execution",
    verdict: "Claude Code",
    note: "Claude Code autonomously handles entire workflows end-to-end",
  },
  {
    category: "Multi-file Edits",
    claude: "Reads and edits across entire codebase, plans before executing",
    cursor: "Multi-file editing with Composer mode",
    verdict: "Tie",
    note: "Both handle multi-file changes well, different approaches",
  },
  {
    category: "Extensibility",
    claude: "MCP servers, hooks, CLAUDE.md, custom tools",
    cursor: "Rules files, limited extension support",
    verdict: "Claude Code",
    note: "MCP protocol lets you connect any data source or tool",
  },
  {
    category: "Pricing",
    claude: "Usage-based (API) or included with Max plan ($100/mo)",
    cursor: "Pro $20/mo, Business $40/mo (limited fast requests)",
    verdict: "Depends",
    note: "Cursor is cheaper for light use; Claude Code is better value for heavy use",
  },
  {
    category: "Remote Work",
    claude: "Remote Control, Teleport, Routines (cloud-scheduled tasks)",
    cursor: "No remote capabilities",
    verdict: "Claude Code",
    note: "Continue sessions from any device, schedule tasks in the cloud",
  },
  {
    category: "Learning Curve",
    claude: "Steeper: terminal-first, need to learn prompting patterns",
    cursor: "Gentler: familiar IDE with AI overlay",
    verdict: "Cursor",
    note: "Cursor is easier to start; Claude Code rewards deeper investment",
  },
];

export default function ClaudeVsCursor() {
  return (
    <article className="py-8 lg:py-16 max-w-4xl mx-auto">
      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
          Comparison
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          Claude Code vs Cursor: Honest Comparison
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Both are excellent AI coding tools. Here&apos;s how they actually
          compare in 2026, based on features, pricing, and real-world use.
        </p>
      </header>

      {/* Quick verdict */}
      <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 mb-10">
        <h2 className="font-bold text-slate-900 dark:text-white mb-2">
          Quick Verdict
        </h2>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <strong>Choose Claude Code</strong> if you want maximum power, work
          in the terminal, need agentic workflows (autonomous coding, deploys,
          multi-agent teams), or want to work across devices.{" "}
          <strong>Choose Cursor</strong> if you prefer a familiar IDE experience
          and want the gentlest possible on-ramp to AI coding.
        </p>
      </div>

      {/* Comparison table */}
      <div className="mb-12 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="text-left p-3 font-semibold text-slate-900 dark:text-white">
                Feature
              </th>
              <th className="text-left p-3 font-semibold text-blue-600 dark:text-blue-400">
                Claude Code
              </th>
              <th className="text-left p-3 font-semibold text-slate-600 dark:text-slate-400">
                Cursor
              </th>
              <th className="text-left p-3 font-semibold text-slate-900 dark:text-white">
                Edge
              </th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row) => (
              <tr
                key={row.category}
                className="border-b border-slate-100 dark:border-slate-800/50"
              >
                <td className="p-3 font-medium text-slate-900 dark:text-white">
                  {row.category}
                </td>
                <td className="p-3 text-slate-700 dark:text-slate-300">
                  {row.claude}
                </td>
                <td className="p-3 text-slate-700 dark:text-slate-300">
                  {row.cursor}
                </td>
                <td className="p-3">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      row.verdict === "Claude Code"
                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                        : row.verdict === "Cursor"
                          ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {row.verdict}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key takeaways */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Key Takeaways
        </h2>
        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800/50">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
              Claude Code is the power tool
            </h3>
            <p>
              If you&apos;re serious about AI-assisted development, Claude Code
              is unmatched. It handles entire workflows autonomously — from
              reading your codebase to writing tests to deploying. The sub-agent
              nesting, MCP servers, and cross-device features put it in a
              different category.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800/50">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
              They&apos;re not mutually exclusive
            </h3>
            <p>
              Many developers use both. Cursor for quick in-editor completions,
              Claude Code for complex multi-file tasks, debugging, and deployment.
              The VS Code extension for Claude Code means they coexist well.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 text-center">
        <h2 className="font-bold text-slate-900 dark:text-white mb-2">
          Ready to Master Claude Code?
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
          Our 12-week course takes you from beginner to expert. Weeks 1-4 are
          completely free — no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/week/1"
            className="inline-flex justify-center px-6 py-3 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Start Free Course &rarr;
          </Link>
          <Link
            href="/learn/claude-code-tutorial"
            className="inline-flex justify-center px-6 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Read the Tutorial First
          </Link>
        </div>
      </div>
    </article>
  );
}
