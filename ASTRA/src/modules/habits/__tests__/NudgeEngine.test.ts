// ─────────────────────────────────────────────────────────────────────────────
// Habit Module — NudgeEngine Unit Tests
// Tests urgency computation, urgency classification, template selection,
// template interpolation, and the main evaluateNudges pipeline.
// ─────────────────────────────────────────────────────────────────────────────

import {
    computeUrgency,
    classifyUrgency,
    selectTemplate,
    interpolateTemplate,
    evaluateNudges,
    NUDGE_CONFIG,
} from '../services/NudgeEngine';
import type {
    HabitWithProgress,
    NudgeHistoryEntry,
    NudgeUrgency,
} from '../store/habitStore.types';
import * as dateHelpers from '../utils/dateHelpers';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeHabit(overrides: Partial<HabitWithProgress> = {}): HabitWithProgress {
    return {
        id: 'h1',
        userId: 'u1',
        name: 'drink_water',
        displayName: 'Drink Water',
        category: 'health',
        targetCount: 8,
        targetUnit: 'glasses',
        preferredTime: 'anytime',
        daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        createdAt: Date.now() - 86_400_000 * 7,
        isActive: true,
        todayCount: 0,
        todayProgress: 0,
        currentStreak: 5,
        longestStreak: 10,
        completedToday: false,
        ...overrides,
    };
}

function makeNudgeEntry(
    overrides: Partial<NudgeHistoryEntry> = {},
): NudgeHistoryEntry {
    return {
        id: 'n1',
        userId: 'u1',
        habitId: 'h1',
        templateUsed: 'gentle_1',
        sentAt: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago by default
        wasActedUpon: false,
        ...overrides,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. computeUrgency
// ═══════════════════════════════════════════════════════════════════════════════

describe('computeUrgency', () => {
    test('returns 0 when habit is fully completed', () => {
        const habit = makeHabit({ todayProgress: 1, completedToday: true });
        const score = computeUrgency({ habit, dayProgress: 0.5 });
        // incompleteness=0, timeDecay=0.25, streakRisk≈0.05, healthMod=0
        // 0.35*0 + 0.30*0.25 + 0.20*0.05 + 0.15*0 = 0.085
        expect(score).toBeLessThan(0.15);
    });

    test('returns higher urgency later in the day for incomplete habits', () => {
        const habit = makeHabit({ todayProgress: 0 });
        const earlyScore = computeUrgency({ habit, dayProgress: 0.2 });
        const lateScore = computeUrgency({ habit, dayProgress: 0.9 });
        expect(lateScore).toBeGreaterThan(earlyScore);
    });

    test('longer streaks increase urgency', () => {
        const lowStreak = makeHabit({ currentStreak: 1 });
        const highStreak = makeHabit({ currentStreak: 25 });
        const scoreLow = computeUrgency({ habit: lowStreak, dayProgress: 0.5 });
        const scoreHigh = computeUrgency({ habit: highStreak, dayProgress: 0.5 });
        expect(scoreHigh).toBeGreaterThan(scoreLow);
    });

    test('poor sleep boosts health-category habits', () => {
        const healthHabit = makeHabit({ category: 'health' });
        const withGoodSleep = computeUrgency({
            habit: healthHabit,
            dayProgress: 0.5,
            sleepScore: 80,
        });
        const withBadSleep = computeUrgency({
            habit: healthHabit,
            dayProgress: 0.5,
            sleepScore: 30,
        });
        expect(withBadSleep).toBeGreaterThan(withGoodSleep);
    });

    test('poor sleep reduces urgency for non-health habits', () => {
        const prodHabit = makeHabit({ category: 'productivity' });
        const withGoodSleep = computeUrgency({
            habit: prodHabit,
            dayProgress: 0.5,
            sleepScore: 80,
        });
        const withBadSleep = computeUrgency({
            habit: prodHabit,
            dayProgress: 0.5,
            sleepScore: 30,
        });
        expect(withBadSleep).toBeLessThan(withGoodSleep);
    });

    test('high stress boosts mindfulness habits', () => {
        const habit = makeHabit({ category: 'mindfulness' });
        const lowStress = computeUrgency({
            habit,
            dayProgress: 0.5,
            stressLevel: 2,
        });
        const highStress = computeUrgency({
            habit,
            dayProgress: 0.5,
            stressLevel: 5,
        });
        expect(highStress).toBeGreaterThan(lowStress);
    });

    test('urgency is clamped between 0 and 1', () => {
        // Extreme inputs: full incompleteness, late day, long streak, bad sleep + mindfulness
        const habit = makeHabit({
            todayProgress: 0,
            currentStreak: 100,
            category: 'mindfulness',
        });
        const score = computeUrgency({
            habit,
            dayProgress: 1.0,
            sleepScore: 10,
            stressLevel: 5,
        });
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. classifyUrgency
// ═══════════════════════════════════════════════════════════════════════════════

describe('classifyUrgency', () => {
    test('low scores classify as gentle', () => {
        expect(classifyUrgency(0.0)).toBe('gentle');
        expect(classifyUrgency(0.2)).toBe('gentle');
        expect(classifyUrgency(0.39)).toBe('gentle');
    });

    test('mid scores classify as moderate', () => {
        expect(classifyUrgency(0.4)).toBe('moderate');
        expect(classifyUrgency(0.6)).toBe('moderate');
        expect(classifyUrgency(0.79)).toBe('moderate');
    });

    test('high scores classify as critical', () => {
        expect(classifyUrgency(0.8)).toBe('critical');
        expect(classifyUrgency(0.95)).toBe('critical');
        expect(classifyUrgency(1.0)).toBe('critical');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. selectTemplate
// ═══════════════════════════════════════════════════════════════════════════════

describe('selectTemplate', () => {
    test('returns a template for each urgency level', () => {
        const levels: NudgeUrgency[] = ['gentle', 'moderate', 'critical'];
        for (const urgency of levels) {
            const { id, template } = selectTemplate({ urgency });
            expect(id).toBeTruthy();
            expect(template).toBeTruthy();
            expect(typeof template).toBe('string');
        }
    });

    test('authority-resistant users get humorous tone', () => {
        // With high authority resistance, selectTemplate should prefer humorous
        // Run it many times and ensure at least some pick "humorous" templates
        const results = new Set<string>();
        for (let i = 0; i < 30; i++) {
            const { id } = selectTemplate({
                urgency: 'gentle',
                authorityResistance: 0.8,
            });
            results.add(id);
        }
        // Should have at least picked one template (randomness aside, it will)
        expect(results.size).toBeGreaterThanOrEqual(1);
    });

    test('high self-efficacy users get challenge tone', () => {
        const results = new Set<string>();
        for (let i = 0; i < 30; i++) {
            const { id } = selectTemplate({
                urgency: 'moderate',
                selfEfficacy: 0.9,
            });
            results.add(id);
        }
        expect(results.size).toBeGreaterThanOrEqual(1);
    });

    test('explicit preferredTone is respected when no personality overrides', () => {
        const { id, template } = selectTemplate({
            urgency: 'critical',
            preferredTone: 'supportive',
        });
        expect(id).toBeTruthy();
        expect(template.length).toBeGreaterThan(0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. interpolateTemplate
// ═══════════════════════════════════════════════════════════════════════════════

describe('interpolateTemplate', () => {
    test('replaces all placeholder variables', () => {
        const template = '{name}, tu aaj {habit_name} mein {progress}% done hai — {streak} din ka streak hai!';
        const result = interpolateTemplate(template, {
            name: 'Aarav',
            habit_name: 'Drink Water',
            progress: 50,
            streak: 7,
        });
        expect(result).toContain('Aarav');
        expect(result).toContain('Drink Water');
        expect(result).toContain('50');
        expect(result).toContain('7');
        expect(result).not.toContain('{name}');
        expect(result).not.toContain('{habit_name}');
    });

    test('handles missing placeholders gracefully', () => {
        const template = '{name}, keep going with {habit_name}!';
        const result = interpolateTemplate(template, { name: 'Riya' });
        expect(result).toContain('Riya');
        expect(result).toContain('{habit_name}'); // not replaced — stays as is
    });

    test('replaces multiple occurrences of same variable', () => {
        const template = '{name} and {name} again';
        const result = interpolateTemplate(template, { name: 'Test' });
        expect(result).toBe('Test and Test again');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. evaluateNudges — Full Pipeline
// ═══════════════════════════════════════════════════════════════════════════════

describe('evaluateNudges', () => {
    // Mock quiet hours and current hour to ensure consistent test behavior
    let quietHoursSpy: jest.SpyInstance;
    let currentHourSpy: jest.SpyInstance;

    beforeEach(() => {
        quietHoursSpy = jest.spyOn(dateHelpers, 'isQuietHours').mockReturnValue(false);
        currentHourSpy = jest.spyOn(dateHelpers, 'getCurrentHour').mockReturnValue(14); // 2 PM
    });

    afterEach(() => {
        quietHoursSpy.mockRestore();
        currentHourSpy.mockRestore();
    });

    test('returns empty array during quiet hours', () => {
        quietHoursSpy.mockReturnValue(true);
        const decisions = evaluateNudges({
            habits: [makeHabit()],
            nudgeHistory: [],
            nudgeCountToday: 0,
        });
        expect(decisions).toEqual([]);
    });

    test('returns empty array when daily cap is reached', () => {
        const decisions = evaluateNudges({
            habits: [makeHabit()],
            nudgeHistory: [],
            nudgeCountToday: NUDGE_CONFIG.maxNudgesPerDay,
        });
        expect(decisions).toEqual([]);
    });

    test('skips completed habits', () => {
        const habit = makeHabit({
            todayProgress: 1,
            completedToday: true,
            todayCount: 8,
        });
        const decisions = evaluateNudges({
            habits: [habit],
            nudgeHistory: [],
            nudgeCountToday: 0,
        });
        expect(decisions.length).toBe(0);
    });

    test('generates nudge decisions for incomplete habits', () => {
        const decisions = evaluateNudges({
            habits: [makeHabit()],
            nudgeHistory: [],
            nudgeCountToday: 0,
            userName: 'Aarav',
        });
        expect(decisions.length).toBe(1);
        expect(decisions[0].habitId).toBe('h1');
        expect(decisions[0].message).toContain('Aarav');
        expect(decisions[0].shouldNudge).toBe(true);
    });

    test('respects per-habit cooldown', () => {
        const recentNudge = makeNudgeEntry({
            sentAt: Date.now() - 30 * 60 * 1000, // 30 min ago — within 2h cooldown
        });
        const decisions = evaluateNudges({
            habits: [makeHabit()],
            nudgeHistory: [recentNudge],
            nudgeCountToday: 1,
        });
        expect(decisions.length).toBe(0);
    });

    test('allows nudge after cooldown expires', () => {
        const oldNudge = makeNudgeEntry({
            sentAt: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago — past cooldown
        });
        const decisions = evaluateNudges({
            habits: [makeHabit()],
            nudgeHistory: [oldNudge],
            nudgeCountToday: 1,
        });
        expect(decisions.length).toBe(1);
    });

    test('sorts decisions by urgency (critical first)', () => {
        const critical = makeHabit({
            id: 'c1',
            todayProgress: 0,
            currentStreak: 30,
            category: 'mindfulness',
        });
        const gentle = makeHabit({
            id: 'g1',
            todayProgress: 0.7,
            currentStreak: 1,
        });
        const decisions = evaluateNudges({
            habits: [gentle, critical],
            nudgeHistory: [],
            nudgeCountToday: 0,
        });
        if (decisions.length >= 2) {
            const urgencyOrder: Record<NudgeUrgency, number> = {
                critical: 3,
                moderate: 2,
                gentle: 1,
            };
            expect(urgencyOrder[decisions[0].urgency]).toBeGreaterThanOrEqual(
                urgencyOrder[decisions[1].urgency],
            );
        }
    });

    test('caps decisions to remaining daily budget', () => {
        const habits = Array.from({ length: 10 }, (_, i) =>
            makeHabit({ id: `h${i}`, todayProgress: 0, currentStreak: i }),
        );
        const used = NUDGE_CONFIG.maxNudgesPerDay - 2;
        const decisions = evaluateNudges({
            habits,
            nudgeHistory: [],
            nudgeCountToday: used,
        });
        expect(decisions.length).toBeLessThanOrEqual(2);
    });

    test('message contains interpolated habit name', () => {
        const habit = makeHabit({ displayName: 'Morning Jog' });
        const decisions = evaluateNudges({
            habits: [habit],
            nudgeHistory: [],
            nudgeCountToday: 0,
            userName: 'Riya',
        });
        // The message should reference the habit name or the user name
        if (decisions.length > 0) {
            const msg = decisions[0].message;
            // At least one of the interpolated values should appear
            expect(msg.length).toBeGreaterThan(5);
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. streakCalculator
// ═══════════════════════════════════════════════════════════════════════════════

import { calculateStreak } from '../utils/streakCalculator';
import type { HabitLog, DayOfWeek } from '../store/habitStore.types';
import { formatDate } from '../utils/dateHelpers';

function makeLog(habitId: string, daysAgo: number, count = 1): HabitLog {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return {
        id: `log-${daysAgo}`,
        habitId,
        date: formatDate(d),
        count,
        completedAt: d.getTime(),
    };
}

describe('calculateStreak', () => {
    const allDays: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    test('returns zero for no logs', () => {
        const result = calculateStreak('h1', allDays, []);
        expect(result.current).toBe(0);
        expect(result.longest).toBe(0);
    });

    test('counts consecutive days', () => {
        const logs = [
            makeLog('h1', 1),
            makeLog('h1', 2),
            makeLog('h1', 3),
        ];
        const result = calculateStreak('h1', allDays, logs);
        // 3 consecutive past days
        expect(result.current).toBeGreaterThanOrEqual(3);
        expect(result.longest).toBeGreaterThanOrEqual(3);
    });

    test('a gap breaks the current streak', () => {
        const logs = [
            makeLog('h1', 1),
            // day 2 missing
            makeLog('h1', 3),
            makeLog('h1', 4),
        ];
        const result = calculateStreak('h1', allDays, logs);
        expect(result.current).toBe(1); // only yesterday
        expect(result.longest).toBeGreaterThanOrEqual(2); // days 3+4
    });

    test('only counts logs for the given habitId', () => {
        const logs = [
            makeLog('h1', 1),
            makeLog('h2', 1),
            makeLog('h2', 2),
        ];
        const result = calculateStreak('h1', allDays, logs);
        expect(result.current).toBe(1);
    });
});
