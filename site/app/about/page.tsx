import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = "https://agentcodeacademy.com";

export const metadata: Metadata = {
  title: "About",
  description:
    "Agent Code Academy is a free 12-week course teaching AI-assisted coding with Claude Code. Learn about our mission, approach, and how the curriculum stays up to date.",
  openGraph: {
    title: "About — Agent Code Academy",
    description:
      "Learn about Agent Code Academy's mission to make AI-assisted coding accessible to everyone.",
    url: `${BASE_URL}/about`,
    type: "website",
    images: [
      {
        url: "/og?title=About%20Agent%20Code%20Academy",
        width: 1200,
        height: 630,
        alt: "About Agent Code Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About — Agent Code Academy",
    description:
      "Learn about Agent Code Academy's mission to make AI-assisted coding accessible to everyone.",
    images: ["/og?title=About%20Agent%20Code%20Academy"],
  },
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
};

// Organization schema — safe: entirely static string constants, no user input
const orgSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Agent Code Academy",
  url: BASE_URL,
  description:
    "A free 12-week course teaching AI-assisted coding with Claude Code. From zero coding knowledge to building real applications.",
  foundingDate: "2026",
  knowsAbout: [
    "AI-assisted coding",
    "Claude Code",
    "Prompt engineering",
    "MCP servers",
    "Web development",
  ],
});

export default function AboutPage() {
  return (
    <article className="py-8 lg:py-12 max-w-3xl">
      {/* Safe: orgSchema is built from static string constants at module level, no user input */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: orgSchema }}
      />

      <header className="mb-10">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link
            href="/"
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            Home
          </Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-500 dark:text-slate-400">About</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          About Agent Code Academy
        </h1>
      </header>

      <div className="space-y-6">
        <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
          Agent Code Academy is a free, self-paced course that teaches complete
          beginners how to build real applications using AI-assisted coding with
          Claude Code. We believe that the ability to build software should be
          accessible to everyone — and AI makes that possible for the first time.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">
          Our Approach
        </h2>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          Instead of teaching traditional programming from scratch, we teach you
          how to collaborate with an AI coding assistant. You learn the essential
          concepts — terminal, Git, web development, databases — while Claude
          Code handles the syntax and boilerplate. This lets you build real,
          deployable applications from Week 1.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">
          Always Up to Date
        </h2>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          The curriculum is automatically updated via a custom MCP server that
          monitors Claude Code releases, documentation changes, GitHub releases,
          and community discussions across 7+ sources. When Claude Code ships a
          new feature, the relevant lessons are updated within days — not months.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">
          The Course Structure
        </h2>
        <ul className="text-slate-700 dark:text-slate-300 space-y-2 list-disc list-inside">
          <li>
            <strong>Phase 1: Foundation (Weeks 1-4)</strong> — Terminal, Claude
            Code basics, Git, your first web app. Completely free.
          </li>
          <li>
            <strong>Phase 2: Building (Weeks 5-8)</strong> — React, Next.js,
            databases, testing and CI/CD.
          </li>
          <li>
            <strong>Phase 3: Mastery (Weeks 9-12)</strong> — Advanced Claude
            Code, MCP servers, AI agents, capstone project.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">
          Built With Claude Code
        </h2>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          This entire site — the curriculum, the auto-updater, the deployment
          pipeline, the E2E test suite — was built using Claude Code. It&apos;s
          living proof that AI-assisted development works.
        </p>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
        <Link
          href="/week/1"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-semibold text-base hover:opacity-90 transition-opacity"
        >
          Start Learning →
        </Link>
      </div>
    </article>
  );
}
