// ─────────────────────────────────────────────────────────────────────────────
// Habit Module — Date Helpers
// ─────────────────────────────────────────────────────────────────────────────

import type { DayOfWeek } from '../store/habitStore.types';

const DAY_MAP: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/**
 * Get today's date as YYYY-MM-DD string.
 */
export function getToday(): string {
    return formatDate(new Date());
}

/**
 * Format a Date to YYYY-MM-DD.
 */
export function formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string to a Date (midnight local).
 */
export function parseDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

/**
 * Check if a JS dayOfWeek index (0=Sun) matches the habit's active days.
 */
export function isDayActive(daysOfWeek: DayOfWeek[], jsDayIdx: number): boolean {
    const dayName = DAY_MAP[jsDayIdx];
    return daysOfWeek.includes(dayName);
}

/**
 * Get the DayOfWeek name for a JS day index.
 */
export function getDayName(jsDayIdx: number): DayOfWeek {
    return DAY_MAP[jsDayIdx];
}

/**
 * Calculate difference in calendar days between two dates.
 */
export function daysBetween(a: Date, b: Date): number {
    const msPerDay = 86400000;
    const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.abs(Math.floor((utcB - utcA) / msPerDay));
}

/**
 * Get start of today in ms (midnight local).
 */
export function getTodayStartMs(): number {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

/**
 * Get the current hour (0–23).
 */
export function getCurrentHour(): number {
    return new Date().getHours();
}

/**
 * Check if current time is within quiet hours.
 * Quiet hours default: 22:00 – 07:00.
 */
export function isQuietHours(start = 22, end = 7): boolean {
    const h = getCurrentHour();
    if (start > end) {
        // Wraps midnight: e.g. 22:00 – 07:00
        return h >= start || h < end;
    }
    return h >= start && h < end;
}
