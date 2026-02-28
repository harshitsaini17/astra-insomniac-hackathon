// ─────────────────────────────────────────────────────────────────────────────
// Habit Module — Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type HabitCategory =
    | 'health'
    | 'productivity'
    | 'mindfulness'
    | 'fitness'
    | 'learning'
    | 'social'
    | 'custom';

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type PreferredTime = 'morning' | 'afternoon' | 'evening' | 'anytime';

export type NudgeUrgency = 'gentle' | 'moderate' | 'critical';

export type NudgeTone = 'supportive' | 'sharp' | 'humorous' | 'challenge';

export interface Habit {
    id: string;
    userId: string;
    name: string;
    displayName: string;
    category: HabitCategory;
    targetCount: number;
    targetUnit: string;
    preferredTime: PreferredTime;
    daysOfWeek: DayOfWeek[];
    createdAt: number;
    isActive: boolean;
}

export interface HabitLog {
    id: string;
    habitId: string;
    date: string; // YYYY-MM-DD
    count: number;
    completedAt: number;
    nudgeId?: string;
    notes?: string;
}

export interface NudgeHistoryEntry {
    id: string;
    userId: string;
    habitId: string;
    templateUsed: string;
    sentAt: number;
    wasActedUpon: boolean;
}

export interface HabitWithProgress extends Habit {
    todayCount: number;
    todayProgress: number; // 0–1
    currentStreak: number;
    longestStreak: number;
    completedToday: boolean;
}

export interface NudgeTemplate {
    id: string;
    urgency: NudgeUrgency;
    tone: NudgeTone;
    template: string;
}

export interface NudgeDecision {
    shouldNudge: boolean;
    habitId: string;
    habitName: string;
    urgency: NudgeUrgency;
    template: string;
    message: string;
    scheduledFor?: number;
}

export interface HabitStoreState {
    habits: Habit[];
    logs: HabitLog[];
    nudgeHistory: NudgeHistoryEntry[];

    // ── Actions ──────────────────────────────────────────────────────────
    addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => string;
    updateHabit: (habit: Partial<Habit> & { id: string }) => void;
    deleteHabit: (id: string) => void;
    logHabit: (habitId: string, notes?: string, count?: number) => void;
    recordNudge: (entry: Omit<NudgeHistoryEntry, 'id'>) => void;
    markNudgeActedUpon: (nudgeId: string) => void;

    // ── Selectors ────────────────────────────────────────────────────────
    fetchTodayHabits: () => HabitWithProgress[];
    getStreak: (habitId: string) => { current: number; longest: number };
    getHabitProgress: (habitId: string, date?: string) => number;
    getActiveHabits: () => Habit[];
    getHabitById: (id: string) => Habit | undefined;
    getTodayLogs: (habitId: string) => HabitLog[];
    getRecentNudges: (habitId: string, windowMs?: number) => NudgeHistoryEntry[];
    getNudgeCountToday: () => number;

    // ── Computed ─────────────────────────────────────────────────────────
    getWeeklyCompletionRate: (habitId: string) => number;
    getHabitSummary: () => {
        totalActive: number;
        completedToday: number;
        averageStreak: number;
        overallCompletionRate: number;
    };
}
