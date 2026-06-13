"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white mb-2">
        Something went wrong
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
        Something went wrong. Please try refreshing the page.
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
