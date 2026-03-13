"use client";

import { affiliateTools } from "@/lib/affiliate-tools";

export function ToolRecommendationWidget() {
  // Show top 2 tools in sidebar
  const tools = affiliateTools.slice(0, 2);

  return (
    <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-2">
        Recommended Tools
      </h4>
      <div className="space-y-2">
        {tools.map((tool) => (
          <a
            key={tool.name}
            href={tool.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span className="font-medium">{tool.name}</span>
            <span className="text-slate-500 dark:text-slate-600 ml-1">
              &rarr;
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
