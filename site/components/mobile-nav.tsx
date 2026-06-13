"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Phase, Appendix } from "@/lib/types";
import { useProgress } from "@/lib/progress-context";
import { ProgressIndicator } from "@/components/progress-indicator";
import { PremiumBadge } from "@/components/premium-badge";
import { UpgradeCta } from "@/components/upgrade-cta";

interface MobileNavProps {
  phases: Phase[];
  appendices: Appendix[];
}

export function MobileNav({ phases, appendices }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { completedWeeks } = useProgress();
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Focus trap: focus first link on open, wrap Tab on last item
  useEffect(() => {
    if (!open || !navContainerRef.current) return;
    const container = navContainerRef.current;
    const focusableLinks = container.querySelectorAll<HTMLElement>("a, button");
    if (focusableLinks.length > 0) {
      focusableLinks[0].focus();
    }

    function handleTabTrap(e: KeyboardEvent) {
      if (e.key !== "Tab" || !container) return;
      const items = container.querySelectorAll<HTMLElement>("a, button");
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleTabTrap);
    return () => document.removeEventListener("keydown", handleTabTrap);
  }, [open]);

  return (
    <nav className="lg:hidden" aria-label="Mobile navigation">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Toggle navigation"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div
          ref={navContainerRef}
          role="dialog"
          aria-modal="true"
          className="absolute top-full left-0 right-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-lg z-50 max-h-[70vh] overflow-y-auto p-4"
        >
          {phases.map((phase) => (
            <div key={phase.number} className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-wider mb-1 text-slate-500">
                Phase {phase.number}: {phase.name}
              </div>
              {phase.weeks.map((week) => {
                const href = `/week/${week.number}`;
                const isActive = pathname === href;
                const isComplete = completedWeeks.includes(week.number);
                return (
                  <Link
                    key={week.number}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded text-sm ${
                      isActive
                        ? "bg-slate-100 dark:bg-slate-800 font-medium"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <ProgressIndicator completed={isComplete} />
                    <span className="flex-1">
                      {week.number}. {week.title}
                    </span>
                    <PremiumBadge weekNumber={week.number} />
                  </Link>
                );
              })}
            </div>
          ))}
          {appendices.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-wider mb-1 text-slate-500">
                Appendices
              </div>
              {appendices.map((a) => (
                <Link
                  key={a.letter}
                  href={`/appendix/${a.letter.toLowerCase()}`}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded text-sm text-slate-600 dark:text-slate-400"
                >
                  {a.letter}. {a.title}
                </Link>
              ))}
            </div>
          )}

          {/* Upgrade CTA */}
          <UpgradeCta />
        </div>
      )}
    </nav>
  );
}
