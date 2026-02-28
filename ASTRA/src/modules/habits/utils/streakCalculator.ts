// ─────────────────────────────────────────────────────────────────────────────
// Habit Module — Streak Calculator
// Determines current streak and longest streak for a habit.
// ─────────────────────────────────────────────────────────────────────────────

import type { HabitLog, DayOfWeek } from '../store/habitStore.types';
import { formatDate, isDayActive } from './dateHelpers';

interface StreakResult {
    current: number;
    longest: number;
}

/**
 * Calculate current and longest streaks for a given habit.
 *
 * A "streak" day counts only if:
 *   1. The day is one of the habit's active days (daysOfWeek).
 *   2. The user has logged at least one completion for that day.
 *
 * Walking backward from today:
 *   - Skip non-active days (they don't break the streak).
 *   - A missing active day breaks the current streak.
 */
export function calculateStreak(
    habitId: string,
    daysOfWeek: DayOfWeek[],
    logs: HabitLog[],
): StreakResult {
    // Build a Set of all dates where this habit was logged
    const completedDates = new Set<string>();
    for (const log of logs) {
        if (log.habitId === habitId) {
            completedDates.add(log.date);
        }
    }

    if (completedDates.size === 0) return { current: 0, longest: 0 };

    let current = 0;
    let longest = 0;
    let streakActive = true;
    let tempStreak = 0;

    // Walk back up to 365 days
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayIdx = d.getDay();
        const dateStr = formatDate(d);

        // Skip non-active days (don't break streak)
        if (!isDayActive(daysOfWeek, dayIdx)) continue;

        const completed = completedDates.has(dateStr);

        if (completed) {
            tempStreak++;
            if (streakActive) current = tempStreak;
            longest = Math.max(longest, tempStreak);
        } else {
            if (streakActive) {
                // Today itself might not be logged yet — allow grace for today
                if (i === 0 && isDayActive(daysOfWeek, today.getDay())) {
                    // Don't break streak on today if it's still in progress
                    continue;
                }
                streakActive = false;
            }
            // Reset temp streak, continue for longest calculation
            tempStreak = 0;
        }
    }

    return { current, longest };
}
