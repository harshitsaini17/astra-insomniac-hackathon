// ─────────────────────────────────────────────────────────────────────────────
// Habit Module — Nudge Scheduler
// Handles local notification scheduling via expo-notifications.
// ─────────────────────────────────────────────────────────────────────────────

import type { NudgeDecision } from '../store/habitStore.types';

// ── Types ────────────────────────────────────────────────────────────────────

interface ScheduledNudge {
    notificationId: string;
    habitId: string;
    scheduledFor: number;
    message: string;
}

// ── In-memory registry of scheduled nudges ───────────────────────────────────
const scheduledNudges: Map<string, ScheduledNudge> = new Map();

/**
 * Schedule a local notification for a nudge decision.
 *
 * Uses expo-notifications when available; falls back to a no-op log
 * when running in environments without notification support (e.g., tests).
 */
export async function scheduleNudgeNotification(
    decision: NudgeDecision,
    delayMs: number = 0,
): Promise<string | null> {
    try {
        // Dynamic import — expo-notifications may not be installed in all envs
        const Notifications = await import('expo-notifications').catch(() => null);

        if (!Notifications) {
            console.log('[NudgeScheduler] expo-notifications not available, skipping');
            return null;
        }

        // Request permissions
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
            const { status: newStatus } = await Notifications.requestPermissionsAsync();
            if (newStatus !== 'granted') {
                console.log('[NudgeScheduler] Notification permission denied');
                return null;
            }
        }

        const trigger = delayMs > 0
            ? { seconds: Math.ceil(delayMs / 1000), repeats: false } as any
            : null;

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: `ASTRA — ${decision.habitName}`,
                body: decision.message,
                data: {
                    habitId: decision.habitId,
                    nudgeTemplate: decision.template,
                    urgency: decision.urgency,
                },
                sound: decision.urgency === 'critical' ? 'default' : undefined,
            },
            trigger,
        });

        // Track
        scheduledNudges.set(decision.habitId, {
            notificationId,
            habitId: decision.habitId,
            scheduledFor: Date.now() + delayMs,
            message: decision.message,
        });

        console.log(`[NudgeScheduler] Scheduled: ${decision.habitName} (${decision.urgency})`);
        return notificationId;
    } catch (e) {
        console.error('[NudgeScheduler] Failed to schedule notification', e);
        return null;
    }
}

/**
 * Cancel a previously scheduled nudge for a habit.
 */
export async function cancelHabitNudge(habitId: string): Promise<void> {
    const entry = scheduledNudges.get(habitId);
    if (!entry) return;

    try {
        const Notifications = await import('expo-notifications').catch(() => null);
        if (Notifications) {
            await Notifications.cancelScheduledNotificationAsync(entry.notificationId);
        }
        scheduledNudges.delete(habitId);
        console.log(`[NudgeScheduler] Cancelled nudge for habit ${habitId}`);
    } catch (e) {
        console.error('[NudgeScheduler] Failed to cancel notification', e);
    }
}

/**
 * Cancel all scheduled habit nudges.
 */
export async function cancelAllHabitNudges(): Promise<void> {
    try {
        const Notifications = await import('expo-notifications').catch(() => null);
        if (Notifications) {
            // Cancel only our tracked habit nudges
            for (const [, entry] of scheduledNudges) {
                await Notifications.cancelScheduledNotificationAsync(entry.notificationId);
            }
        }
        scheduledNudges.clear();
        console.log('[NudgeScheduler] All habit nudges cancelled');
    } catch (e) {
        console.error('[NudgeScheduler] Failed to cancel all notifications', e);
    }
}

/**
 * Get the next scheduled nudge preview (for UI display).
 */
export function getNextScheduledNudge(): ScheduledNudge | null {
    let next: ScheduledNudge | null = null;
    const now = Date.now();

    for (const [, entry] of scheduledNudges) {
        if (entry.scheduledFor > now) {
            if (!next || entry.scheduledFor < next.scheduledFor) {
                next = entry;
            }
        }
    }

    return next;
}

/**
 * Get count of currently scheduled nudges.
 */
export function getScheduledCount(): number {
    return scheduledNudges.size;
}
