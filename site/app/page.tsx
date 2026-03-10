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

export default function HomePage() {
  const curriculum = parseCurriculum();

  return (
    <div className="py-8 lg:py-16">
      {/* Hero Section */}
      <section className="text-center mb-20">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
          Agent <span className="gradient-text">Code</span> Academy
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-2">
          {curriculum.goal}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mb-8">
          {curriculum.edition} · {curriculum.duration}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/week/1"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-orange-500 text-white font-semibold text-base hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20"
          >
            Start Learning →
          </Link>
          <Link
            href="#curriculum"
            className="inline-flex items-center px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-base hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            View Curriculum
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-20">
        {[
          { value: curriculum.phases.reduce((sum, p) => sum + p.weeks.length, 0), label: "Weeks" },
          { value: curriculum.phases.length, label: "Phases" },
          { value: curriculum.phases.reduce((sum, p) => sum + p.weeks.reduce((ws, w) => ws + w.topics.length, 0), 0), label: "Topics" },
          { value: curriculum.appendices.length, label: "Appendices" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="text-center p-4 rounded-xl border border-slate-200 dark:border-slate-800/50"
          >
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {stat.label}
            </p>
          </div>
        ))}
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
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono w-8 flex-shrink-0">
                  {appendix.letter}
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {appendix.title}
                </span>
                <span className="ml-auto text-slate-300 dark:text-slate-700 group-hover:text-indigo-400 dark:group-hover:text-indigo-500 transition-colors text-sm">
                  &rarr;
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

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
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 w-16 flex-shrink-0">
                {tool.category}
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-100 flex-shrink-0">
                {tool.name}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                {tool.description}
              </span>
              <span className="ml-auto text-slate-300 dark:text-slate-700 group-hover:text-indigo-400 dark:group-hover:text-indigo-500 transition-colors text-sm flex-shrink-0">
                &rarr;
              </span>
            </a>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-3">
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
