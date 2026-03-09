import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getNewsletterIssues,
  getNewsletterIssue,
  getNewsletterHtml,
} from "@/lib/newsletter";
import { EmailSignup } from "@/components/email-signup";

interface IssuePageProps {
  params: Promise<{ issue: string }>;
}

export function generateStaticParams() {
  const issues = getNewsletterIssues();
  return issues.map((i) => ({ issue: String(i.number) }));
}

export async function generateMetadata({
  params,
}: IssuePageProps): Promise<Metadata> {
  const { issue: issueStr } = await params;
  const issueNum = parseInt(issueStr, 10);
  const issue = getNewsletterIssue(issueNum);
  if (!issue) return { title: "Issue Not Found" };

  const title = `Weekly Dispatch #${issue.number}`;
  const description = `${issue.date} — Agent Code Academy newsletter issue #${issue.number}. Claude Code updates and AI coding tips.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} — Agent Code Academy`,
      description,
      url: `https://agentcodeacademy.com/newsletter/${issue.number}`,
      images: [
        {
          url: `/og?title=${encodeURIComponent(`Weekly Dispatch #${issue.number}`)}&type=default`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Agent Code Academy`,
      images: [
        `/og?title=${encodeURIComponent(`Weekly Dispatch #${issue.number}`)}&type=default`,
      ],
    },
    alternates: {
      canonical: `https://agentcodeacademy.com/newsletter/${issue.number}`,
    },
  };
}

export default async function NewsletterIssuePage({
  params,
}: IssuePageProps) {
  const { issue: issueStr } = await params;
  const issueNum = parseInt(issueStr, 10);
  const issue = getNewsletterIssue(issueNum);
  const html = getNewsletterHtml(issueNum);

  if (!issue || !html) notFound();

  return (
    <div className="py-8 lg:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link
          href="/"
          className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          Home
        </Link>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <Link
          href="/newsletter"
          className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          Newsletter
        </Link>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-500 dark:text-slate-400">
          #{issue.number}
        </span>
      </div>

      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Weekly Dispatch #{issue.number}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {issue.date}
        </p>
      </header>

      {/* Newsletter content */}
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 mb-8">
        <iframe
          srcDoc={html}
          title={`Weekly Dispatch #${issue.number}`}
          className="w-full border-0"
          style={{ height: "900px" }}
          sandbox="allow-same-origin"
        />
      </div>

      {/* Subscribe CTA */}
      <div className="mb-8">
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-4">
          Get the next issue delivered to your inbox every Monday.
        </p>
        <EmailSignup />
      </div>

      {/* Back link */}
      <div className="text-center">
        <Link
          href="/newsletter"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          ← All issues
        </Link>
      </div>
    </div>
  );
}
