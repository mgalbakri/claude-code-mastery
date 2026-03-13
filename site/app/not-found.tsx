import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 lg:py-24 text-center">
      <p className="text-6xl font-bold text-slate-300 dark:text-slate-700 mb-4">
        404
      </p>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Page Not Found
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
        The page you&apos;re looking for doesn&apos;t exist. It may have been
        moved or the URL might be incorrect.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
        <Link
          href="/week/1"
          className="inline-flex items-center px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
        >
          Start Week 1
        </Link>
      </div>
    </div>
  );
}
