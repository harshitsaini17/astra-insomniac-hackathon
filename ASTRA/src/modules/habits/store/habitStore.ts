// ─────────────────────────────────────────────────────────────────────────────
// Habit Module — Zustand Store with Persistence
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage, generateId } from '../../shared/store/storage';
import type {
    Habit,
    HabitLog,
    NudgeHistoryEntry,
    HabitWithProgress,
    HabitStoreState,
} from './habitStore.types';
import { calculateStreak } from '../utils/streakCalculator';
import { getToday, isDayActive, formatDate } from '../utils/dateHelpers';

export const useHabitStore = create<HabitStoreState>()(
    persist(
        (set, get) => ({
            habits: [],
            logs: [],
            nudgeHistory: [],

            // ── Mutations ────────────────────────────────────────────────

            addHabit: (input) => {
                const id = generateId();
                const habit: Habit = {
                    ...input,
                    id,
                    createdAt: Date.now(),
                };
                set((s) => ({ habits: [...s.habits, habit] }));
                return id;
            },

            updateHabit: (update) => {
                set((s) => ({
                    habits: s.habits.map((h) =>
                        h.id === update.id ? { ...h, ...update } : h,
                    ),
                }));
            },

            deleteHabit: (id) => {
                set((s) => ({
                    habits: s.habits.filter((h) => h.id !== id),
                    logs: s.logs.filter((l) => l.habitId !== id),
                }));
            },

            logHabit: (habitId, notes, count = 1) => {
                const log: HabitLog = {
                    id: generateId(),
                    habitId,
                    date: getToday(),
                    count,
                    completedAt: Date.now(),
                    notes,
                };
                set((s) => ({ logs: [...s.logs, log] }));
            },

            recordNudge: (entry) => {
                const record: NudgeHistoryEntry = { ...entry, id: generateId() };
                set((s) => ({ nudgeHistory: [...s.nudgeHistory, record] }));
            },

            markNudgeActedUpon: (nudgeId) => {
                set((s) => ({
                    nudgeHistory: s.nudgeHistory.map((n) =>
                        n.id === nudgeId ? { ...n, wasActedUpon: true } : n,
                    ),
                }));
            },

            // ── Selectors ────────────────────────────────────────────────

            fetchTodayHabits: () => {
                const { habits, logs } = get();
                const today = getToday();
                const now = new Date();
                const dayIdx = now.getDay(); // 0=Sun, 1=Mon...

                return habits
                    .filter((h) => h.isActive && isDayActive(h.daysOfWeek, dayIdx))
                    .map((h): HabitWithProgress => {
                        const todayLogs = logs.filter(
                            (l) => l.habitId === h.id && l.date === today,
                        );
                        const todayCount = todayLogs.reduce((a, l) => a + l.count, 0);
                        const progress = Math.min(todayCount / h.targetCount, 1);
                        const streakData = calculateStreak(h.id, h.daysOfWeek, logs);

                        return {
                            ...h,
                            todayCount,
                            todayProgress: progress,
                            currentStreak: streakData.current,
                            longestStreak: streakData.longest,
                            completedToday: todayCount >= h.targetCount,
                        };
                    });
            },

            getStreak: (habitId) => {
                const { habits, logs } = get();
                const habit = habits.find((h) => h.id === habitId);
                if (!habit) return { current: 0, longest: 0 };
                return calculateStreak(habitId, habit.daysOfWeek, logs);
            },

            getHabitProgress: (habitId, date) => {
                const { habits, logs } = get();
                const habit = habits.find((h) => h.id === habitId);
                if (!habit) return 0;
                const d = date ?? getToday();
                const dayLogs = logs.filter(
                    (l) => l.habitId === habitId && l.date === d,
                );
                const count = dayLogs.reduce((a, l) => a + l.count, 0);
                return Math.min(count / habit.targetCount, 1);
            },

            getActiveHabits: () => get().habits.filter((h) => h.isActive),

            getHabitById: (id) => get().habits.find((h) => h.id === id),

            getTodayLogs: (habitId) => {
                const today = getToday();
                return get().logs.filter(
                    (l) => l.habitId === habitId && l.date === today,
                );
            },

            getRecentNudges: (habitId, windowMs = 2 * 60 * 60 * 1000) => {
                const cutoff = Date.now() - windowMs;
                return get().nudgeHistory.filter(
                    (n) => n.habitId === habitId && n.sentAt >= cutoff,
                );
            },

            getNudgeCountToday: () => {
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                return get().nudgeHistory.filter(
                    (n) => n.sentAt >= todayStart.getTime(),
                ).length;
            },

            // ── Computed ─────────────────────────────────────────────────

            getWeeklyCompletionRate: (habitId) => {
                const { habits, logs } = get();
                const habit = habits.find((h) => h.id === habitId);
                if (!habit) return 0;

                const now = new Date();
                let completed = 0;
                let applicable = 0;

                for (let i = 0; i < 7; i++) {
                    const d = new Date(now);
                    d.setDate(d.getDate() - i);
                    const dayIdx = d.getDay();
                    if (!isDayActive(habit.daysOfWeek, dayIdx)) continue;

                    applicable++;
                    const dateStr = formatDate(d);
                    const dayLogs = logs.filter(
                        (l) => l.habitId === habitId && l.date === dateStr,
                    );
                    const count = dayLogs.reduce((a, l) => a + l.count, 0);
                    if (count >= habit.targetCount) completed++;
                }

                return applicable > 0 ? completed / applicable : 0;
            },

            getHabitSummary: () => {
                const state = get();
                const active = state.habits.filter((h) => h.isActive);
                const todayHabits = state.fetchTodayHabits();
                const completedToday = todayHabits.filter((h) => h.completedToday).length;

                const streaks = active.map((h) => {
                    const s = calculateStreak(h.id, h.daysOfWeek, state.logs);
                    return s.current;
                });
                const averageStreak =
                    streaks.length > 0
                        ? streaks.reduce((a, b) => a + b, 0) / streaks.length
                        : 0;

                const rates = active.map((h) => state.getWeeklyCompletionRate(h.id));
                const overallCompletionRate =
                    rates.length > 0
                        ? rates.reduce((a, b) => a + b, 0) / rates.length
                        : 0;

                return {
                    totalActive: active.length,
                    completedToday,
                    averageStreak: Math.round(averageStreak * 10) / 10,
                    overallCompletionRate: Math.round(overallCompletionRate * 100) / 100,
                };
            },
        }),
        {
            name: 'astra-habits-v1',
            storage: createJSONStorage(() => zustandStorage),
        },
    ),
);
