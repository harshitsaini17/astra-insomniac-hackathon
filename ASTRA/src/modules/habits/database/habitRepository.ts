// ─────────────────────────────────────────────────────────────────────────────
// Habit Module — SQLite Repository
// CRUD operations for habits, logs, and nudge history
// ─────────────────────────────────────────────────────────────────────────────

import * as SQLite from 'expo-sqlite';
import { HABIT_TABLES, HABIT_INDICES } from './habitSchema';
import type { Habit, HabitLog, NudgeHistoryEntry } from '../store/habitStore.types';
import { DB_NAME } from '../../../database/schema';

let db: SQLite.SQLiteDatabase | null = null;

// ── Initialization ───────────────────────────────────────────────────────────

export async function initializeHabitDB(): Promise<void> {
    try {
        db = await SQLite.openDatabaseAsync(DB_NAME);
        for (const sql of HABIT_TABLES) {
            await db.execAsync(sql);
        }
        for (const sql of HABIT_INDICES) {
            await db.execAsync(sql);
        }
        console.log('[HabitDB] Tables initialized');
    } catch (e) {
        console.error('[HabitDB] Init failed', e);
        throw e;
    }
}

function getDB(): SQLite.SQLiteDatabase {
    if (!db) throw new Error('HabitDB not initialized. Call initializeHabitDB first.');
    return db;
}

// ── Habits CRUD ──────────────────────────────────────────────────────────────

export async function insertHabit(habit: Habit): Promise<void> {
    await getDB().runAsync(
        `INSERT INTO habits (id, user_id, name, display_name, category, target_count, target_unit, preferred_time, days_of_week, created_at, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            habit.id,
            habit.userId,
            habit.name,
            habit.displayName,
            habit.category,
            habit.targetCount,
            habit.targetUnit,
            habit.preferredTime,
            habit.daysOfWeek.join(','),
            habit.createdAt,
            habit.isActive ? 1 : 0,
        ],
    );
}

export async function updateHabitRow(
    id: string,
    updates: Partial<Omit<Habit, 'id'>>,
): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.displayName !== undefined) { fields.push('display_name = ?'); values.push(updates.displayName); }
    if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
    if (updates.targetCount !== undefined) { fields.push('target_count = ?'); values.push(updates.targetCount); }
    if (updates.targetUnit !== undefined) { fields.push('target_unit = ?'); values.push(updates.targetUnit); }
    if (updates.preferredTime !== undefined) { fields.push('preferred_time = ?'); values.push(updates.preferredTime); }
    if (updates.daysOfWeek !== undefined) { fields.push('days_of_week = ?'); values.push(updates.daysOfWeek.join(',')); }
    if (updates.isActive !== undefined) { fields.push('is_active = ?'); values.push(updates.isActive ? 1 : 0); }

    if (fields.length === 0) return;

    values.push(id);
    await getDB().runAsync(
        `UPDATE habits SET ${fields.join(', ')} WHERE id = ?`,
        values,
    );
}

export async function deleteHabitRow(id: string): Promise<void> {
    await getDB().runAsync(`DELETE FROM habits WHERE id = ?`, [id]);
    await getDB().runAsync(`DELETE FROM habit_logs WHERE habit_id = ?`, [id]);
    await getDB().runAsync(`DELETE FROM nudge_history WHERE habit_id = ?`, [id]);
}

export async function getAllHabits(): Promise<Habit[]> {
    const rows = await getDB().getAllAsync<any>(
        `SELECT * FROM habits WHERE is_active = 1 ORDER BY created_at DESC`,
    );
    return rows.map(rowToHabit);
}

export async function getHabitsByDate(date: string): Promise<Habit[]> {
    const habits = await getAllHabits();
    const dayOfWeek = new Date(date).getDay();
    const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayStr = dayMap[dayOfWeek];
    return habits.filter((h) => h.daysOfWeek.includes(dayStr as any));
}

// ── Habit Logs CRUD ──────────────────────────────────────────────────────────

export async function insertHabitLog(log: HabitLog): Promise<void> {
    await getDB().runAsync(
        `INSERT INTO habit_logs (id, habit_id, date, count, completed_at, nudge_id, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [log.id, log.habitId, log.date, log.count, log.completedAt, log.nudgeId ?? null, log.notes ?? null],
    );
}

export async function getLogsByHabitAndDate(habitId: string, date: string): Promise<HabitLog[]> {
    const rows = await getDB().getAllAsync<any>(
        `SELECT * FROM habit_logs WHERE habit_id = ? AND date = ? ORDER BY completed_at DESC`,
        [habitId, date],
    );
    return rows.map(rowToLog);
}

export async function getLogsByHabitRange(
    habitId: string,
    startDate: string,
    endDate: string,
): Promise<HabitLog[]> {
    const rows = await getDB().getAllAsync<any>(
        `SELECT * FROM habit_logs WHERE habit_id = ? AND date >= ? AND date <= ? ORDER BY date ASC`,
        [habitId, startDate, endDate],
    );
    return rows.map(rowToLog);
}

// ── Nudge History ────────────────────────────────────────────────────────────

export async function insertNudgeHistory(entry: NudgeHistoryEntry): Promise<void> {
    await getDB().runAsync(
        `INSERT INTO nudge_history (id, user_id, habit_id, template_used, sent_at, was_acted_upon)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [entry.id, entry.userId, entry.habitId, entry.templateUsed, entry.sentAt, entry.wasActedUpon ? 1 : 0],
    );
}

export async function markNudgeActed(nudgeId: string): Promise<void> {
    await getDB().runAsync(
        `UPDATE nudge_history SET was_acted_upon = 1 WHERE id = ?`,
        [nudgeId],
    );
}

export async function getNudgesForHabitSince(habitId: string, sinceMs: number): Promise<NudgeHistoryEntry[]> {
    const rows = await getDB().getAllAsync<any>(
        `SELECT * FROM nudge_history WHERE habit_id = ? AND sent_at >= ? ORDER BY sent_at DESC`,
        [habitId, sinceMs],
    );
    return rows.map(rowToNudge);
}

export async function getNudgeCountToday(userId: string): Promise<number> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const result = await getDB().getFirstAsync<{ cnt: number }>(
        `SELECT COUNT(*) as cnt FROM nudge_history WHERE user_id = ? AND sent_at >= ?`,
        [userId, todayStart.getTime()],
    );
    return result?.cnt ?? 0;
}

// ── Row Mappers ──────────────────────────────────────────────────────────────

function rowToHabit(row: any): Habit {
    return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        displayName: row.display_name,
        category: row.category,
        targetCount: row.target_count,
        targetUnit: row.target_unit,
        preferredTime: row.preferred_time,
        daysOfWeek: row.days_of_week ? row.days_of_week.split(',') : [],
        createdAt: row.created_at,
        isActive: !!row.is_active,
    };
}

function rowToLog(row: any): HabitLog {
    return {
        id: row.id,
        habitId: row.habit_id,
        date: row.date,
        count: row.count,
        completedAt: row.completed_at,
        nudgeId: row.nudge_id ?? undefined,
        notes: row.notes ?? undefined,
    };
}

function rowToNudge(row: any): NudgeHistoryEntry {
    return {
        id: row.id,
        userId: row.user_id,
        habitId: row.habit_id,
        templateUsed: row.template_used,
        sentAt: row.sent_at,
        wasActedUpon: !!row.was_acted_upon,
    };
}
