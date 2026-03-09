import type { Metadata } from "next";
import Link from "next/link";
import { getNewsletterIssues } from "@/lib/newsletter";
import { EmailSignup } from "@/components/email-signup";

export const metadata: Metadata = {
  title: "Newsletter Archive — Weekly Dispatch",
  description:
    "Browse past issues of the Agent Code Academy Weekly Dispatch. Stay up to date with Claude Code updates, curriculum changes, and AI coding tips.",
  openGraph: {
    title: "Newsletter Archive — Agent Code Academy",
    description:
      "Browse past issues of the Weekly Dispatch. Claude Code updates, tips, and curriculum changes delivered every Monday.",
    url: "https://agentcodeacademy.com/newsletter",
    images: [
      {
        url: "/og?title=Weekly%20Dispatch%20Newsletter",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Newsletter Archive — Agent Code Academy",
    images: ["/og?title=Weekly%20Dispatch%20Newsletter"],
  },
  alternates: {
    canonical: "https://agentcodeacademy.com/newsletter",
  },
};

export default function NewsletterArchivePage() {
  const issues = getNewsletterIssues();

  return (
    <div className="py-8 lg:py-12">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link
          href="/"
          className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          Home
        </Link>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-500 dark:text-slate-400">Newsletter</span>
      </div>

      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          Weekly Dispatch
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Claude Code updates, curriculum changes, and AI coding tips — delivered
          every Monday.
        </p>
      </header>

      {/* Subscribe CTA */}
      <div className="mb-12">
        <EmailSignup />
      </div>

      {/* Issue list */}
      {issues.length === 0 ? (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
          <p className="text-lg mb-2">No issues yet!</p>
          <p className="text-sm">
            Subscribe above to get the first issue when it lands.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <Link
              key={issue.number}
              href={`/newsletter/${issue.number}`}
              className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  #{issue.number}
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Weekly Dispatch #{issue.number}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {issue.date}
                  </div>
                </div>
              </div>
              <span className="text-slate-400 dark:text-slate-600 group-hover:text-indigo-500 transition-colors">
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
