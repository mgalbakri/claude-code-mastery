"use client";

import { getToolsForWeek } from "@/lib/affiliate-tools";

interface ContextualToolCtaProps {
  weekNumber: number;
}

export function ContextualToolCta({ weekNumber }: ContextualToolCtaProps) {
  const tools = getToolsForWeek(weekNumber, 2);

  if (tools.length === 0) return null;

  return (
    <aside className="my-8 p-5 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 overflow-hidden">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
        Recommended for this week
      </h4>
      <div className="flex flex-col sm:flex-row gap-3">
        {tools.map((tool) => (
          <a
            key={tool.name}
            href={tool.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex-1 min-w-0 flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-md transition-all group"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold ring-1 ring-blue-200 dark:ring-blue-500/30">
              {tool.category.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tool.name}
                <span className="inline-block ml-1 text-slate-500 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {tool.description}
              </div>
            </div>
          </a>
        ))}
      </div>
      <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-3">
        Some links may be affiliate links. We only recommend tools we genuinely use.
      </p>
    </aside>
  );
}
