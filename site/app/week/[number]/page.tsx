import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllWeeks, getWeek } from "@/lib/parse-curriculum";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { EmailBanner } from "@/components/email-banner";
import { EmailGate } from "@/components/email-gate";
import { WeekCompleteButton } from "@/components/week-complete-button";
import { PremiumGate } from "@/components/premium-gate";
import { ContextualToolCta } from "@/components/contextual-tool-cta";
import { ShareButtons } from "@/components/share-buttons";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

interface WeekPageProps {
  params: Promise<{ number: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  const weeks = getAllWeeks();
  return weeks.map((w) => ({ number: String(w.number) }));
}

export async function generateMetadata({ params }: WeekPageProps) {
  const { number } = await params;
  const week = getWeek(parseInt(number, 10));
  if (!week) return { title: "Week Not Found" };

  const title = `Week ${week.number}: ${week.title}`;
  const description =
    week.objective || week.subtitle || `Week ${week.number} of the 12-week AI coding course at Agent Code Academy.`;

  const ogImage = `/og?title=${encodeURIComponent(week.title)}&week=${week.number}&phase=${week.phase}&type=week`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} — Agent Code Academy`,
      description,
      url: `https://agentcodeacademy.com/week/${week.number}`,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Agent Code Academy`,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://agentcodeacademy.com/week/${week.number}`,
    },
  };
}

const phaseBadge: Record<number, string> = {
  1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  2: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  3: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
};

export default async function WeekPage({ params }: WeekPageProps) {
  const { number } = await params;
  const weekNum = parseInt(number, 10);
  const week = getWeek(weekNum);

  if (!week) notFound();

  const allWeeks = getAllWeeks();
  const prevWeek = allWeeks.find((w) => w.number === weekNum - 1);
  const nextWeek = allWeeks.find((w) => w.number === weekNum + 1);

  // LearningResource schema — safe: all data is from server-side static curriculum parsing, not user input
  const learningResourceSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: `Week ${week.number}: ${week.title}`,
    description: week.objective || week.subtitle || `Week ${week.number} of the 12-week AI coding course.`,
    url: `https://agentcodeacademy.com/week/${week.number}`,
    isPartOf: {
      "@type": "Course",
      name: "Agent Code Academy — AI Coding Course",
      url: "https://agentcodeacademy.com",
    },
    educationalLevel: "Beginner",
    learningResourceType: "lesson",
    inLanguage: "en",
    position: week.number,
    datePublished: "2026-02-01",
    dateModified: "2026-03-13",
    author: {
      "@type": "Organization",
      name: "Agent Code Academy",
      url: "https://agentcodeacademy.com",
    },
    ...(week.topics.length > 0 && {
      teaches: week.topics.slice(0, 8),
    }),
  });

  return (
    <article className="py-8 lg:py-12">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: `Phase ${week.phase}: ${week.phaseName}` },
          { name: `Week ${week.number}: ${week.title}`, href: `/week/${week.number}` },
        ]}
      />
      {/* Safe: JSON generated from static server-side curriculum data, not user input */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: learningResourceSchema }}
      />
      <EmailBanner />
      <EmailGate weekNumber={weekNum} />

      {/* Breadcrumb & Phase badge */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link
          href="/"
          className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          Home
        </Link>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span
          className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${phaseBadge[week.phase] || phaseBadge[1]}`}
        >
          Phase {week.phase}: {week.phaseName}
        </span>
      </div>

      {/* Header */}
      <header className="mb-10">
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
          Week {week.number} of 12
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          {week.title}
        </h1>
        {week.subtitle && (
          <p className="text-lg text-slate-600 dark:text-slate-400 italic">
            {week.subtitle}
          </p>
        )}
      </header>

      {/* Meta cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {/* Objective */}
        {week.objective && (
          <div className="p-4 rounded-lg border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
              Objective
            </h3>
            <p className="text-sm text-blue-900 dark:text-blue-200">
              {week.objective}
            </p>
          </div>
        )}

        {/* Deliverable */}
        {week.deliverable && (
          <div className="p-4 rounded-lg border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/20">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5">
              Deliverable
            </h3>
            <p className="text-sm text-amber-900 dark:text-amber-200">
              {week.deliverable}
            </p>
          </div>
        )}
      </div>

      {/* Topics */}
      {week.topics.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Topics
          </h2>
          <ul className="space-y-1.5">
            {week.topics.map((topic, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
              >
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 flex-shrink-0" />
                {topic}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Premium-gated content (activities, skills, lessons) */}
      <PremiumGate weekNumber={weekNum}>
        {/* Activities */}
        {week.activities.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Activities
            </h2>
            <ul className="space-y-1.5">
              {week.activities.map((activity, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                >
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-600 flex-shrink-0" />
                  {activity}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Skills */}
        {week.skills && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Skills You&apos;ll Gain
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {week.skills}
            </p>
          </section>
        )}

        {/* Full Content (markdown) */}
        {week.content && (
          <section className="mb-12">
            <hr className="border-slate-200 dark:border-slate-800 mb-8" />
            <MarkdownRenderer content={week.content} />
          </section>
        )}

        {/* Mark Complete */}
        <WeekCompleteButton weekNumber={weekNum} />
      </PremiumGate>

      {/* Tool Recommendations */}
      <ContextualToolCta weekNumber={weekNum} />

      {/* Share */}
      <ShareButtons
        url={`/week/${weekNum}`}
        title={`Week ${weekNum}: ${week.title}`}
        text={`I'm learning AI coding with Claude Code — Week ${weekNum} covers ${week.title}. Free course:`}
      />

      {/* Navigation */}
      <nav className="flex items-center justify-between pt-8 border-t border-slate-200 dark:border-slate-800/50">
        {prevWeek ? (
          <Link
            href={`/week/${prevWeek.number}`}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span>←</span>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-500">
                Previous
              </div>
              <div className="font-medium">
                Week {prevWeek.number}: {prevWeek.title}
              </div>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextWeek ? (
          <Link
            href={`/week/${nextWeek.number}`}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-right"
          >
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-500">
                Next
              </div>
              <div className="font-medium">
                Week {nextWeek.number}: {nextWeek.title}
              </div>
            </div>
            <span>→</span>
          </Link>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-right"
          >
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-500">
                Finished!
              </div>
              <div className="font-medium">Back to Overview</div>
            </div>
            <span>→</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
