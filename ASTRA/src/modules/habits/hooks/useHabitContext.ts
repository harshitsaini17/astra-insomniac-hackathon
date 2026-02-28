// ─────────────────────────────────────────────────────────────────────────────
// Habit Module — useHabitContext Hook
// Exposes habit state for the Behavioral Orchestrator integration.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import { useHabitStore } from '../store/habitStore';

export interface HabitContextSnapshot {
    totalActive: number;
    completedToday: number;
    pendingToday: number;
    averageStreak: number;
    overallCompletionRate: number;
    /** Most urgent incomplete habit name (or null). */
    mostUrgentHabit: string | null;
    /** Whether any habit has a streak at risk. */
    streakAtRisk: boolean;
}

/**
 * Provides a snapshot of habit state suitable for the orchestrator's context
 * inference pipeline. This data is consumed by the Behavioral Gap Analysis
 * and Strategy Selector stages.
 */
export function useHabitContext(): HabitContextSnapshot {
    const summary = useHabitStore((s) => s.getHabitSummary());
    const todayHabits = useHabitStore((s) => s.fetchTodayHabits());

    return useMemo(() => {
        const pending = todayHabits.filter((h) => !h.completedToday);
        const atRisk = todayHabits.some(
            (h) => !h.completedToday && h.currentStreak > 3,
        );

        // Most urgent = highest streak that's incomplete
        const sorted = [...pending].sort(
            (a, b) => b.currentStreak - a.currentStreak,
        );

        return {
            totalActive: summary.totalActive,
            completedToday: summary.completedToday,
            pendingToday: pending.length,
            averageStreak: summary.averageStreak,
            overallCompletionRate: summary.overallCompletionRate,
            mostUrgentHabit: sorted[0]?.displayName ?? null,
            streakAtRisk: atRisk,
        };
    }, [summary, todayHabits]);
}
