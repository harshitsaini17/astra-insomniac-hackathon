// ─────────────────────────────────────────────────────────────────────────────
// Habit Module — Store Unit Tests
// Tests Zustand store actions, selectors, and computed properties.
// ─────────────────────────────────────────────────────────────────────────────

// Mock zustand persistence storage so tests run without AsyncStorage
jest.mock('../../shared/store/storage', () => ({
    zustandStorage: {
        getItem: jest.fn().mockResolvedValue(null),
        setItem: jest.fn().mockResolvedValue(undefined),
        removeItem: jest.fn().mockResolvedValue(undefined),
    },
    generateId: jest.fn(() => `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
}));

import { useHabitStore } from '../store/habitStore';
import type { Habit, DayOfWeek } from '../store/habitStore.types';

// ── Helpers ──────────────────────────────────────────────────────────────────

const ALL_DAYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function resetStore() {
    useHabitStore.setState({ habits: [], logs: [], nudgeHistory: [] });
}

function addTestHabit(overrides: Partial<Omit<Habit, 'id' | 'createdAt'>> = {}) {
    return useHabitStore.getState().addHabit({
        userId: 'u1',
        name: 'test_habit',
        displayName: 'Test Habit',
        category: 'health',
        targetCount: 5,
        targetUnit: 'glasses',
        preferredTime: 'morning',
        daysOfWeek: ALL_DAYS,
        isActive: true,
        ...overrides,
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. addHabit
// ═══════════════════════════════════════════════════════════════════════════════

describe('addHabit', () => {
    beforeEach(resetStore);

    test('adds a habit to the store and returns an id', () => {
        const id = addTestHabit();
        expect(id).toBeTruthy();
        expect(typeof id).toBe('string');
        expect(useHabitStore.getState().habits.length).toBe(1);
    });

    test('generated habit has correct fields', () => {
        const id = addTestHabit({ name: 'drink_water', displayName: 'Drink Water' });
        const habit = useHabitStore.getState().habits.find((h) => h.id === id);
        expect(habit).toBeDefined();
        expect(habit!.name).toBe('drink_water');
        expect(habit!.displayName).toBe('Drink Water');
        expect(habit!.createdAt).toBeLessThanOrEqual(Date.now());
    });

    test('can add multiple habits', () => {
        addTestHabit({ name: 'h1' });
        addTestHabit({ name: 'h2' });
        addTestHabit({ name: 'h3' });
        expect(useHabitStore.getState().habits.length).toBe(3);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. updateHabit
// ═══════════════════════════════════════════════════════════════════════════════

describe('updateHabit', () => {
    beforeEach(resetStore);

    test('updates a habit field', () => {
        const id = addTestHabit({ name: 'original' });
        useHabitStore.getState().updateHabit({ id, displayName: 'Updated Name' });
        const habit = useHabitStore.getState().habits.find((h) => h.id === id);
        expect(habit!.displayName).toBe('Updated Name');
    });

    test('does not modify other habits', () => {
        const id1 = addTestHabit({ name: 'h1', displayName: 'Habit 1' });
        const id2 = addTestHabit({ name: 'h2', displayName: 'Habit 2' });
        useHabitStore.getState().updateHabit({ id: id1, displayName: 'Changed' });
        const h2 = useHabitStore.getState().habits.find((h) => h.id === id2);
        expect(h2!.displayName).toBe('Habit 2');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. deleteHabit
// ═══════════════════════════════════════════════════════════════════════════════

describe('deleteHabit', () => {
    beforeEach(resetStore);

    test('removes the habit from store', () => {
        const id = addTestHabit();
        expect(useHabitStore.getState().habits.length).toBe(1);
        useHabitStore.getState().deleteHabit(id);
        expect(useHabitStore.getState().habits.length).toBe(0);
    });

    test('also removes associated logs', () => {
        const id = addTestHabit();
        useHabitStore.getState().logHabit(id, undefined, 1);
        useHabitStore.getState().logHabit(id, undefined, 2);
        expect(useHabitStore.getState().logs.length).toBe(2);
        useHabitStore.getState().deleteHabit(id);
        expect(useHabitStore.getState().logs.length).toBe(0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. logHabit
// ═══════════════════════════════════════════════════════════════════════════════

describe('logHabit', () => {
    beforeEach(resetStore);

    test('adds a log entry', () => {
        const id = addTestHabit();
        useHabitStore.getState().logHabit(id, 'Felt good', 2);
        const logs = useHabitStore.getState().logs;
        expect(logs.length).toBe(1);
        expect(logs[0].habitId).toBe(id);
        expect(logs[0].count).toBe(2);
        expect(logs[0].notes).toBe('Felt good');
    });

    test('defaults count to 1', () => {
        const id = addTestHabit();
        useHabitStore.getState().logHabit(id);
        expect(useHabitStore.getState().logs[0].count).toBe(1);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. recordNudge & markNudgeActedUpon
// ═══════════════════════════════════════════════════════════════════════════════

describe('nudge actions', () => {
    beforeEach(resetStore);

    test('records a nudge entry', () => {
        useHabitStore.getState().recordNudge({
            userId: 'u1',
            habitId: 'h1',
            templateUsed: 'gentle_1',
            sentAt: Date.now(),
            wasActedUpon: false,
        });
        expect(useHabitStore.getState().nudgeHistory.length).toBe(1);
    });

    test('marks nudge as acted upon', () => {
        useHabitStore.getState().recordNudge({
            userId: 'u1',
            habitId: 'h1',
            templateUsed: 'gentle_1',
            sentAt: Date.now(),
            wasActedUpon: false,
        });
        const nudgeId = useHabitStore.getState().nudgeHistory[0].id;
        useHabitStore.getState().markNudgeActedUpon(nudgeId);
        expect(useHabitStore.getState().nudgeHistory[0].wasActedUpon).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Selectors
// ═══════════════════════════════════════════════════════════════════════════════

describe('getActiveHabits', () => {
    beforeEach(resetStore);

    test('returns only active habits', () => {
        addTestHabit({ name: 'active', isActive: true });
        addTestHabit({ name: 'inactive', isActive: false });
        const active = useHabitStore.getState().getActiveHabits();
        expect(active.length).toBe(1);
        expect(active[0].name).toBe('active');
    });
});

describe('getHabitById', () => {
    beforeEach(resetStore);

    test('returns the correct habit', () => {
        const id = addTestHabit({ name: 'find_me' });
        const habit = useHabitStore.getState().getHabitById(id);
        expect(habit).toBeDefined();
        expect(habit!.name).toBe('find_me');
    });

    test('returns undefined for non-existent id', () => {
        const habit = useHabitStore.getState().getHabitById('nonexistent');
        expect(habit).toBeUndefined();
    });
});

describe('getHabitProgress', () => {
    beforeEach(resetStore);

    test('returns 0 when no logs exist', () => {
        const id = addTestHabit({ targetCount: 5 });
        const progress = useHabitStore.getState().getHabitProgress(id);
        expect(progress).toBe(0);
    });

    test('returns correct progress ratio', () => {
        const id = addTestHabit({ targetCount: 4 });
        useHabitStore.getState().logHabit(id, undefined, 2);
        const progress = useHabitStore.getState().getHabitProgress(id);
        expect(progress).toBe(0.5);
    });

    test('caps progress at 1', () => {
        const id = addTestHabit({ targetCount: 2 });
        useHabitStore.getState().logHabit(id, undefined, 5);
        const progress = useHabitStore.getState().getHabitProgress(id);
        expect(progress).toBe(1);
    });
});

describe('getNudgeCountToday', () => {
    beforeEach(resetStore);

    test('counts only today nudges', () => {
        const now = Date.now();
        useHabitStore.getState().recordNudge({
            userId: 'u1',
            habitId: 'h1',
            templateUsed: 't1',
            sentAt: now,
            wasActedUpon: false,
        });
        useHabitStore.getState().recordNudge({
            userId: 'u1',
            habitId: 'h2',
            templateUsed: 't2',
            sentAt: now - 86_400_000 * 2, // 2 days ago
            wasActedUpon: false,
        });
        expect(useHabitStore.getState().getNudgeCountToday()).toBe(1);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. getHabitSummary
// ═══════════════════════════════════════════════════════════════════════════════

describe('getHabitSummary', () => {
    beforeEach(resetStore);

    test('returns zero values for empty store', () => {
        const summary = useHabitStore.getState().getHabitSummary();
        expect(summary.totalActive).toBe(0);
        expect(summary.completedToday).toBe(0);
        expect(summary.averageStreak).toBe(0);
        expect(summary.overallCompletionRate).toBe(0);
    });

    test('totalActive counts active habits', () => {
        addTestHabit({ isActive: true });
        addTestHabit({ isActive: true });
        addTestHabit({ isActive: false });
        expect(useHabitStore.getState().getHabitSummary().totalActive).toBe(2);
    });
});
