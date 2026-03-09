"use client";

import { useState } from "react";
import { getReferralUrl } from "@/lib/referral";

interface ReferralPromptProps {
  email: string;
  /** Visual size — compact for banners/inline, full for modals/gates */
  variant?: "compact" | "full";
}

export function ReferralPrompt({ email, variant = "full" }: ReferralPromptProps) {
  const [copied, setCopied] = useState(false);
  const referralUrl = getReferralUrl(email);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = referralUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (variant === "compact") {
    return (
      <div className="mt-3 flex flex-col items-center gap-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Share with a friend &amp; help them level up:
        </p>
        <div className="flex items-center gap-2">
          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
            {referralUrl}
          </code>
          <button
            onClick={copyLink}
            className="text-xs px-2.5 py-1 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
      <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
        Know someone who&apos;d love this?
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
        Share your unique link — they&apos;ll get access to the same free course and cheat sheet.
      </p>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={referralUrl}
          className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm truncate"
          onFocus={(e) => e.target.select()}
        />
        <button
          onClick={copyLink}
          className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors flex-shrink-0"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
      <div className="flex items-center justify-center gap-3 mt-3">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("I'm learning AI coding at Agent Code Academy — free 12-week course 🚀")}&url=${encodeURIComponent(referralUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          Share on X
        </a>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          Share on LinkedIn
        </a>
      </div>
    </div>
  );
}
