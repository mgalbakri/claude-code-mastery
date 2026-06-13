import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Claude Code Tutorial: Complete Beginner's Guide (2026)",
  description:
    "Learn Claude Code step by step. Install it, write your first prompt, and build a real project — all in under 2 hours. Free tutorial with hands-on exercises.",
  openGraph: {
    title: "Claude Code Tutorial — Step-by-Step Beginner's Guide",
    description:
      "Install Claude Code, master effective prompting, and build your first app. Free hands-on tutorial.",
    url: "https://agentcodeacademy.com/learn/claude-code-tutorial",
    images: [
      {
        url: "/og?title=Claude%20Code%20Tutorial&type=week",
        width: 1200,
        height: 630,
      },
    ],
  },
  alternates: {
    canonical: "https://agentcodeacademy.com/learn/claude-code-tutorial",
  },
};

function Section({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-bold flex-shrink-0">
          {step}
        </span>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
      </div>
      <div className="ml-11 text-sm text-slate-700 dark:text-slate-300 space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function ClaudeCodeTutorial() {
  return (
    <article className="py-8 lg:py-16 max-w-3xl mx-auto">
      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
          Free Tutorial
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          Claude Code Tutorial: Complete Beginner&apos;s Guide
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Go from zero to building real projects with Claude Code in under 2
          hours. No coding experience required.
        </p>
      </header>

      <Section step={1} title="What Is Claude Code?">
        <p>
          Claude Code is Anthropic&apos;s AI coding assistant that runs in your
          terminal, IDE, desktop app, or browser. Unlike chatbots that just
          answer questions, Claude Code reads your files, writes code, runs
          commands, and builds entire projects alongside you.
        </p>
        <p>
          Think of it as a senior developer pair-programming with you 24/7 —
          one that knows every framework, every language, and never gets tired.
        </p>
      </Section>

      <Section step={2} title="Install Claude Code">
        <p>Installation takes about 60 seconds:</p>
        <div className="bg-slate-900 rounded-lg p-4 text-slate-100 font-mono text-sm overflow-x-auto">
          <p className="text-slate-500"># Mac / Linux / WSL</p>
          <p>curl -fsSL https://claude.ai/install.sh | bash</p>
          <br />
          <p className="text-slate-500"># Windows PowerShell</p>
          <p>irm https://claude.ai/install.ps1 | iex</p>
        </div>
        <p>
          After installation, run <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-sm">claude</code>{" "}
          in your terminal to start an interactive session.
        </p>
      </Section>

      <Section step={3} title="Your First Prompt">
        <p>
          The key to effective Claude Code usage is giving it context. Instead
          of vague prompts, be specific about what you want and why:
        </p>
        <div className="bg-slate-900 rounded-lg p-4 text-slate-100 font-mono text-sm overflow-x-auto">
          <p className="text-emerald-400"># Bad: vague prompt</p>
          <p>make a website</p>
          <br />
          <p className="text-emerald-400"># Good: specific prompt with context</p>
          <p>
            Create a Next.js landing page for a dog walking service. Include a
            hero section with a headline, a pricing grid with 3 tiers, and a
            contact form that validates email addresses.
          </p>
        </div>
      </Section>

      <Section step={4} title="Build a Real Project">
        <p>
          Let&apos;s build something real. Open your terminal in a new directory
          and start Claude Code:
        </p>
        <div className="bg-slate-900 rounded-lg p-4 text-slate-100 font-mono text-sm overflow-x-auto">
          <p>mkdir my-first-app && cd my-first-app</p>
          <p>claude</p>
          <br />
          <p className="text-slate-500"># Then tell Claude what to build:</p>
          <p>
            Build a personal portfolio site with Next.js. Include an about
            section, a projects grid that reads from a JSON file, and dark mode
            support. Deploy it to Vercel.
          </p>
        </div>
        <p>
          Claude Code will create the project structure, write all the code,
          install dependencies, and even deploy it — all from that single prompt.
        </p>
      </Section>

      <Section step={5} title="Essential Commands">
        <div className="grid gap-2">
          {[
            ["/model", "Switch between Claude models (Fable 5, Opus 4.8, Sonnet 4.6)"],
            ["/compact", "Summarize the conversation to free up context"],
            ["/fast", "Toggle fast mode for faster Opus output"],
            ["CLAUDE.md", "Project config file — tells Claude about your codebase"],
            ["/cd", "Change working directory without breaking the session"],
          ].map(([cmd, desc]) => (
            <div
              key={cmd}
              className="flex items-start gap-3 p-2 rounded bg-slate-50 dark:bg-slate-800/50"
            >
              <code className="text-xs font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap mt-0.5">
                {cmd}
              </code>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {desc}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section step={6} title="Keep Learning">
        <p>
          This tutorial covers the basics. The full 12-week course at Agent Code
          Academy goes much deeper — databases, authentication, testing, MCP
          servers, and building AI agent teams.
        </p>
        <p>Weeks 1-4 are completely free:</p>
      </Section>

      <div className="flex flex-col sm:flex-row gap-3 ml-11">
        <Link
          href="/week/1"
          className="inline-flex justify-center px-6 py-3 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Start the Free Course &rarr;
        </Link>
        <Link
          href="/pricing"
          className="inline-flex justify-center px-6 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          See Pro Course Details
        </Link>
      </div>
    </article>
  );
}
