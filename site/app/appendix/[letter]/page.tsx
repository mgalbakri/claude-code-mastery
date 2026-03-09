import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllAppendices, getAppendix } from "@/lib/parse-curriculum";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { EmailBanner } from "@/components/email-banner";
import { ShareButtons } from "@/components/share-buttons";

interface AppendixPageProps {
  params: Promise<{ letter: string }>;
}

export function generateStaticParams() {
  const appendices = getAllAppendices();
  return appendices.map((a) => ({ letter: a.letter.toLowerCase() }));
}

export async function generateMetadata({ params }: AppendixPageProps) {
  const { letter } = await params;
  const appendix = getAppendix(letter);
  if (!appendix) return { title: "Appendix Not Found" };

  const title = `Appendix ${appendix.letter}: ${appendix.title}`;
  const description = `${appendix.title} — Reference material from the 12-week AI coding course at Agent Code Academy.`;

  const ogImage = `/og?title=${encodeURIComponent(appendix.title)}&week=${appendix.letter}&phase=3&type=appendix`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} — Agent Code Academy`,
      description,
      url: `https://agentcodeacademy.com/appendix/${appendix.letter.toLowerCase()}`,
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
      canonical: `https://agentcodeacademy.com/appendix/${appendix.letter.toLowerCase()}`,
    },
  };
}

export default async function AppendixPage({ params }: AppendixPageProps) {
  const { letter } = await params;
  const appendix = getAppendix(letter);

  if (!appendix) notFound();

  const allAppendices = getAllAppendices();
  const currentIndex = allAppendices.findIndex(
    (a) => a.letter.toLowerCase() === letter.toLowerCase()
  );
  const prevAppendix = currentIndex > 0 ? allAppendices[currentIndex - 1] : null;
  const nextAppendix =
    currentIndex < allAppendices.length - 1
      ? allAppendices[currentIndex + 1]
      : null;

  return (
    <article className="py-8 lg:py-12">
      <EmailBanner />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link
          href="/"
          className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          Home
        </Link>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-500 dark:text-slate-400">Appendices</span>
      </div>

      {/* Header */}
      <header className="mb-10">
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-mono">
          Appendix {appendix.letter}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          {appendix.title}
        </h1>
      </header>

      {/* Content */}
      <section className="mb-12">
        <MarkdownRenderer content={appendix.content} />
      </section>

      {/* Share */}
      <ShareButtons
        url={`/appendix/${letter.toLowerCase()}`}
        title={`Appendix ${appendix.letter}: ${appendix.title}`}
      />

      {/* Navigation */}
      <nav className="flex items-center justify-between pt-8 border-t border-slate-200 dark:border-slate-800">
        {prevAppendix ? (
          <Link
            href={`/appendix/${prevAppendix.letter.toLowerCase()}`}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span>←</span>
            <div>
              <div className="text-xs text-slate-400 dark:text-slate-500">
                Previous
              </div>
              <div className="font-medium">
                Appendix {prevAppendix.letter}: {prevAppendix.title}
              </div>
            </div>
          </Link>
        ) : (
          <Link
            href="/week/12"
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span>←</span>
            <div>
              <div className="text-xs text-slate-400 dark:text-slate-500">
                Back to Course
              </div>
              <div className="font-medium">Week 12</div>
            </div>
          </Link>
        )}

        {nextAppendix ? (
          <Link
            href={`/appendix/${nextAppendix.letter.toLowerCase()}`}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-right"
          >
            <div>
              <div className="text-xs text-slate-400 dark:text-slate-500">
                Next
              </div>
              <div className="font-medium">
                Appendix {nextAppendix.letter}: {nextAppendix.title}
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
              <div className="text-xs text-slate-400 dark:text-slate-500">
                Done
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
