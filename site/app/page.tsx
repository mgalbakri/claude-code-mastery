import Link from "next/link";
import { parseCurriculum } from "@/lib/parse-curriculum";
import { WeekCard } from "@/components/week-card";
import { EmailSignup } from "@/components/email-signup";
import { InlineEmailCta } from "@/components/inline-email-cta";
import { ProPromoBanner } from "@/components/pro-promo-banner";
import { affiliateTools } from "@/lib/affiliate-tools";

const phaseColors: Record<
  number,
  { badge: string; accent: string }
> = {
  1: {
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    accent: "text-emerald-600 dark:text-emerald-400",
  },
  2: {
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    accent: "text-blue-600 dark:text-blue-400",
  },
  3: {
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
    accent: "text-purple-600 dark:text-purple-400",
  },
};

const faqData = [
  {
    q: "Do I need coding experience to start?",
    a: "No. Agent Code Academy is designed for complete beginners. Week 1 starts with opening a terminal for the first time. Claude Code acts as your AI pair programmer throughout.",
  },
  {
    q: "What will I be able to build after the course?",
    a: "By Week 12, you'll build and deploy a full-stack web application with a database, API, authentication, and tests. You'll also know how to create MCP servers and AI agents.",
  },
  {
    q: "Is the course really free?",
    a: "Weeks 1 through 4 (Phase 1: Foundation) are completely free. The full 12-week course including Phase 2 (Building) and Phase 3 (Mastery) is available for a one-time $49 Pro upgrade.",
  },
  {
    q: "How is the curriculum kept up to date?",
    a: "An MCP server monitors Claude Code releases, documentation changes, and community sources. The curriculum is automatically updated weekly so lessons always reflect the latest features.",
  },
  {
    q: "What tools do I need?",
    a: "A computer with internet access, a Claude Pro or Max subscription for Claude Code access, and a free GitHub account. All other tools are introduced during the course.",
  },
];

// Safe: FAQ schema generated from static data array above, no user input involved
const faqSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqData.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: {
      "@type": "Answer",
      text: a,
    },
  })),
});

export default function HomePage() {
  const curriculum = parseCurriculum();

  return (
    <div className="py-8 lg:py-16">
      {/* Safe: FAQ schema from static data defined at module level */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqSchema }}
      />
      {/* Hero Section */}
      <section className="mb-20 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
            Free 12-week course
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            Learn to code<br />
            with <span className="gradient-text">AI</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 max-w-lg">
            {curriculum.goal}
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link
              href="/week/1"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-semibold text-base hover:opacity-90 transition-opacity"
            >
              Start Learning →
            </Link>
            <Link
              href="#curriculum"
              className="inline-flex items-center px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-base hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              View Curriculum
            </Link>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <span><strong className="text-slate-900 dark:text-white">{curriculum.phases.reduce((sum, p) => sum + p.weeks.length, 0)}</strong> weeks</span>
            <span className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
            <span><strong className="text-slate-900 dark:text-white">{curriculum.phases.reduce((sum, p) => sum + p.weeks.reduce((ws, w) => ws + w.topics.length, 0), 0)}</strong> topics</span>
            <span className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
            <span><strong className="text-slate-900 dark:text-white">{curriculum.appendices.length}</strong> appendices</span>
          </div>
        </div>

        {/* Terminal mockup */}
        <div className="hidden lg:block">
          <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className="ml-3 text-xs text-slate-500 dark:text-slate-400 font-mono">terminal</span>
            </div>
            <div className="p-4 bg-slate-950 text-sm font-mono leading-relaxed">
              <p className="text-slate-500">$ claude</p>
              <p className="text-emerald-400 mt-1">Welcome to Claude Code</p>
              <p className="text-slate-400 mt-2">╭────────────────────────────────╮</p>
              <p className="text-slate-400">│ Week 1: Your First AI Project  │</p>
              <p className="text-slate-400">╰────────────────────────────────╯</p>
              <p className="text-blue-400 mt-2">&gt; Build a personal website with</p>
              <p className="text-blue-400">  zero coding experience.</p>
              <p className="text-slate-500 mt-2">$ <span className="text-white animate-pulse">_</span></p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            {curriculum.edition} · {curriculum.duration}
          </p>
        </div>
      </section>

      {/* Phases & Weeks */}
      <section id="curriculum" className="scroll-mt-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
          Course Curriculum
        </h2>

        {curriculum.phases.map((phase) => {
          const colors = phaseColors[phase.number] || phaseColors[1];
          return (
            <div key={phase.number}>
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg ${colors.badge}`}
                  >
                    Phase {phase.number}
                  </span>
                  <div>
                    <h3 className={`text-lg font-semibold ${colors.accent}`}>
                      {phase.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {phase.weekRange}
                    </p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {phase.weeks.map((week) => (
                    <WeekCard key={week.number} week={week} />
                  ))}
                </div>
              </div>
              {phase.number === 1 && (
                <InlineEmailCta message="Enjoying the foundations? Get notified when new lessons drop." />
              )}
              {phase.number === 2 && (
                <InlineEmailCta message="Ready for advanced topics? Subscribe for lesson updates." />
              )}
            </div>
          );
        })}
      </section>

      {/* Pro Promo Banner */}
      <ProPromoBanner />

      {/* Appendices */}
      {curriculum.appendices.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Reference Appendices
          </h2>
          <div className="divide-y divide-slate-200 dark:divide-slate-800/50 border-t border-b border-slate-200 dark:border-slate-800/50">
            {curriculum.appendices.map((appendix) => (
              <Link
                key={appendix.letter}
                href={`/appendix/${appendix.letter.toLowerCase()}`}
                className="flex items-center gap-3 py-3 px-2 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
              >
                <span className="text-xs text-slate-500 dark:text-slate-500 font-mono w-8 flex-shrink-0">
                  {appendix.letter}
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {appendix.title}
                </span>
                <span className="ml-auto text-slate-300 dark:text-slate-700 group-hover:text-blue-400 dark:group-hover:text-blue-500 transition-colors text-sm">
                  &rarr;
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* About */}
      <section className="mt-20 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          About Agent Code Academy
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
          Agent Code Academy is a free, self-paced course that teaches complete
          beginners how to build real applications using AI-assisted coding with
          Claude Code. Over 12 weeks and 3 phases, students progress from their
          first terminal command to deploying full-stack apps, building MCP
          servers, and developing AI agents. The curriculum is auto-updated
          weekly to reflect the latest Claude Code features and best practices.
        </p>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Frequently Asked Questions
        </h2>
        <dl className="space-y-6">
          {faqData.map(({ q, a }) => (
            <div key={q}>
              <dt className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                {q}
              </dt>
              <dd className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Email Signup */}
      <EmailSignup />

      {/* Recommended Tools */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Recommended Tools
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Essential tools for getting the most out of your Claude Code journey.
        </p>
        <div className="divide-y divide-slate-200 dark:divide-slate-800/50 border-t border-b border-slate-200 dark:border-slate-800/50">
          {affiliateTools.map((tool) => (
            <a
              key={tool.name}
              href={tool.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center gap-4 py-3 px-2 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
            >
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-500 w-16 flex-shrink-0">
                {tool.category}
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-100 flex-shrink-0">
                {tool.name}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                {tool.description}
              </span>
              <span className="ml-auto text-slate-300 dark:text-slate-700 group-hover:text-blue-400 dark:group-hover:text-blue-500 transition-colors text-sm flex-shrink-0">
                &rarr;
              </span>
            </a>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-600 mt-3">
          Some links may be affiliate links. We only recommend tools we genuinely use.
        </p>
      </section>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800/50 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>
          Built with Claude Code · Content auto-updated via MCP
        </p>
        <p className="mt-1">
          {curriculum.edition}
        </p>
      </footer>
    </div>
  );
}
