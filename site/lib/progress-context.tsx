"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { TOTAL_WEEKS } from "@/lib/constants";

interface ProgressContextValue {
  completedWeeks: number[];
  isLoading: boolean;
  isWeekComplete: (weekNumber: number) => boolean;
  toggleWeekComplete: (weekNumber: number) => Promise<void>;
  completionPercentage: number;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(
  undefined
);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setCompletedWeeks([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("progress")
        .select("week_number")
        .eq("user_id", user.id)
        .order("week_number");

      if (error) {
        console.error("Error fetching progress:", error);
        setIsLoading(false);
        return;
      }

      setCompletedWeeks(data.map((row) => row.week_number));
    } catch {
      // Supabase not configured — fail silently
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    requestAnimationFrame(() => {
      fetchProgress();
    });
  }, [fetchProgress]);

  function isWeekComplete(weekNumber: number): boolean {
    return completedWeeks.includes(weekNumber);
  }

  async function toggleWeekComplete(weekNumber: number) {
    if (!user) return;

    const alreadyComplete = completedWeeks.includes(weekNumber);
    const previousWeeks = [...completedWeeks];

    // Optimistic update
    if (alreadyComplete) {
      setCompletedWeeks((prev) => prev.filter((w) => w !== weekNumber));
    } else {
      setCompletedWeeks((prev) => [...prev, weekNumber].sort((a, b) => a - b));
    }

    try {
      if (alreadyComplete) {
        const { error } = await supabase
          .from("progress")
          .delete()
          .eq("user_id", user.id)
          .eq("week_number", weekNumber);

        if (error) {
          console.error("Failed to update progress:", error);
          setCompletedWeeks(previousWeeks);
        }
      } else {
        const { error } = await supabase.from("progress").insert({
          user_id: user.id,
          week_number: weekNumber,
        });

        if (error) {
          console.error("Failed to update progress:", error);
          setCompletedWeeks(previousWeeks);
        }
      }
    } catch {
      console.error("Failed to update progress");
      setCompletedWeeks(previousWeeks);
    }
  }

  const completionPercentage = Math.round(
    (completedWeeks.length / TOTAL_WEEKS) * 100
  );

  return (
    <ProgressContext.Provider
      value={{
        completedWeeks,
        isLoading,
        isWeekComplete,
        toggleWeekComplete,
        completionPercentage,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}
