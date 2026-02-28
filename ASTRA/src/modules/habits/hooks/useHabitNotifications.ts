// ─────────────────────────────────────────────────────────────────────────────
// Habit Module — useHabitNotifications Hook
// Subscribes to habit context and triggers the nudge engine + scheduler.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useCallback } from 'react';
import { useHabitStore } from '../store/habitStore';
import { evaluateNudges } from '../services/NudgeEngine';
import { scheduleNudgeNotification, cancelHabitNudge } from '../services/NudgeScheduler';
import type { NudgeTone } from '../store/habitStore.types';

interface NotificationConfig {
    userName?: string;
    preferredTone?: NudgeTone;
    authorityResistance?: number;
    selfEfficacy?: number;
    cognitiveReadiness?: number;
    sleepScore?: number;
    stressLevel?: number;
    /** Evaluation interval in ms (default 60s). */
    intervalMs?: number;
}

/**
 * Hook that periodically evaluates nudge conditions and schedules
 * local notifications for pending habits.
 *
 * Should be mounted at the app root or Dashboard level.
 */
export function useHabitNotifications(config: NotificationConfig = {}) {
    const { intervalMs = 60_000, ...engineConfig } = config;
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const evaluate = useCallback(async () => {
        const state = useHabitStore.getState();

        const todayHabits = state.fetchTodayHabits();
        if (todayHabits.length === 0) return;

        const decisions = evaluateNudges({
            habits: todayHabits,
            nudgeHistory: state.nudgeHistory,
            nudgeCountToday: state.getNudgeCountToday(),
            ...engineConfig,
        });

        for (const decision of decisions) {
            if (decision.shouldNudge) {
                // Cancel any existing nudge for this habit
                await cancelHabitNudge(decision.habitId);

                // Schedule the new nudge
                const notifId = await scheduleNudgeNotification(decision);

                // Record in store
                if (notifId) {
                    state.recordNudge({
                        userId: engineConfig.userName ?? 'user',
                        habitId: decision.habitId,
                        templateUsed: decision.template,
                        sentAt: Date.now(),
                        wasActedUpon: false,
                    });
                }
            }
        }
    }, [engineConfig]);

    useEffect(() => {
        // Run immediately on mount
        evaluate();

        // Set up periodic evaluation
        intervalRef.current = setInterval(evaluate, intervalMs);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [evaluate, intervalMs]);

    return { evaluateNow: evaluate };
}
