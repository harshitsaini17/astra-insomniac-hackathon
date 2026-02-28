// ─────────────────────────────────────────────────────────────────────────────
// Habit Module — Nudge Engine
// Computes urgency, selects templates, and generates nudge decisions.
//
// Research Basis
// ─────────────────────────────────────────────────────────────────────────────
// Urgency scoring follows the Persuasive Technology model (Fogg 2003):
//   Nudge at the moment of maximum receptivity with appropriate intensity.
//
// Template personalisation uses Big Five personality calibration:
//   Authority-resistant → supportive/humorous tone.
//   High self-efficacy → challenge/sharp tone.
//
// Refs:
//   - Fogg, B. J. (2003). Persuasive Technology. Morgan Kaufmann.
//   - Noar, S. M. et al. (2007). Tailored health behavior interventions. Psych. Bulletin.
// ─────────────────────────────────────────────────────────────────────────────

import hinglishTemplates from './HinglishTemplates.json';
import type {
    NudgeDecision,
    NudgeUrgency,
    NudgeTone,
    HabitWithProgress,
    NudgeHistoryEntry,
} from '../store/habitStore.types';
import { isQuietHours, getCurrentHour } from '../utils/dateHelpers';

// ── Configuration ────────────────────────────────────────────────────────────

export const NUDGE_CONFIG = {
    /** Max nudges per day across all habits. */
    maxNudgesPerDay: 8,
    /** Minimum cooldown between nudges for the same habit (ms). */
    defaultCooldownMs: 2 * 60 * 60 * 1000, // 2 hours
    /** If user dismissed last nudge, increase cooldown. */
    dismissedCooldownMultiplier: 1.5,
    /** Urgency thresholds. */
    urgencyThresholds: {
        gentle: 0.4,
        moderate: 0.8,
        // > 0.8 = critical
    },
    /** Quiet hours (no nudges). */
    quietHoursStart: 22,
    quietHoursEnd: 7,
};

// ── Urgency Computation ──────────────────────────────────────────────────────

interface UrgencyContext {
    habit: HabitWithProgress;
    /** 0–1 how far through the day we are. */
    dayProgress: number;
    /** Health module CRS if available. */
    cognitiveReadiness?: number;
    /** Sleep score from health module (0–100). */
    sleepScore?: number;
    /** Stress level (1–5). */
    stressLevel?: number;
}

/**
 * Compute urgency score (0–1) for a habit nudge.
 *
 * Formula:
 *   urgency = w₁·incompleteness + w₂·timeDecay + w₃·streakRisk + w₄·healthMod
 *
 * Where:
 *   incompleteness = 1 − todayProgress
 *   timeDecay      = dayProgress² (quadratic — urgency rises faster later)
 *   streakRisk     = streak > 0 ? min(streak / 30, 1) × 0.3 : 0
 *   healthMod      = adjustment based on sleep/stress (recovery habits get boosted)
 *
 * Weights: w₁=0.35, w₂=0.30, w₃=0.20, w₄=0.15
 */
export function computeUrgency(ctx: UrgencyContext): number {
    const { habit, dayProgress, cognitiveReadiness, sleepScore, stressLevel } = ctx;

    // Component 1: How incomplete is the habit today
    const incompleteness = 1 - habit.todayProgress;

    // Component 2: Time pressure (quadratic late-day ramp)
    const timeDecay = dayProgress * dayProgress;

    // Component 3: Streak protection (longer streaks = more to lose)
    const streakRisk = habit.currentStreak > 0
        ? Math.min(habit.currentStreak / 30, 1) * 0.3
        : 0;

    // Component 4: Health-informed modifier
    let healthMod = 0;
    if (sleepScore !== undefined && sleepScore < 50) {
        // Poor sleep → boost urgency for recovery/health habits, reduce for others
        if (habit.category === 'health' || habit.category === 'mindfulness') {
            healthMod = 0.2;
        } else {
            healthMod = -0.1;
        }
    }
    if (stressLevel !== undefined && stressLevel >= 4) {
        if (habit.category === 'mindfulness') healthMod += 0.15;
    }

    const raw = 0.35 * incompleteness + 0.30 * timeDecay + 0.20 * streakRisk + 0.15 * healthMod;
    return Math.max(0, Math.min(1, raw));
}

/**
 * Classify urgency score into a level.
 */
export function classifyUrgency(score: number): NudgeUrgency {
    if (score < NUDGE_CONFIG.urgencyThresholds.gentle) return 'gentle';
    if (score < NUDGE_CONFIG.urgencyThresholds.moderate) return 'moderate';
    return 'critical';
}

// ── Template Selection ───────────────────────────────────────────────────────

interface TemplateContext {
    urgency: NudgeUrgency;
    preferredTone?: NudgeTone;
    /** Authority resistance from personality profile (0–1). */
    authorityResistance?: number;
    /** Self-efficacy from personality profile (0–1). */
    selfEfficacy?: number;
}

/**
 * Select the best Hinglish template for the given context.
 * Applies personality-based tone filtering.
 */
export function selectTemplate(ctx: TemplateContext): { id: string; template: string } {
    const pool = hinglishTemplates[ctx.urgency] as Array<{ id: string; tone: string; template: string }>;

    // Determine preferred tone from personality
    let targetTone: NudgeTone = ctx.preferredTone ?? 'supportive';
    if (ctx.authorityResistance !== undefined && ctx.authorityResistance > 0.6) {
        targetTone = 'humorous'; // Soften for authority-resistant
    }
    if (ctx.selfEfficacy !== undefined && ctx.selfEfficacy > 0.7) {
        targetTone = 'challenge'; // Push high-efficacy users
    }

    // Try to match tone, fall back to any in the urgency pool
    const toneMatched = pool.filter((t) => t.tone === targetTone);
    const selected = toneMatched.length > 0
        ? toneMatched[Math.floor(Math.random() * toneMatched.length)]
        : pool[Math.floor(Math.random() * pool.length)];

    return { id: selected.id, template: selected.template };
}

/**
 * Interpolate variables into a template string.
 */
export function interpolateTemplate(
    template: string,
    vars: Record<string, string | number>,
): string {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }
    return result;
}

// ── Core Decision Function ───────────────────────────────────────────────────

interface NudgeEngineInput {
    habits: HabitWithProgress[];
    nudgeHistory: NudgeHistoryEntry[];
    nudgeCountToday: number;
    /** User's display name. */
    userName?: string;
    /** Personality-derived preferred nudge tone. */
    preferredTone?: NudgeTone;
    authorityResistance?: number;
    selfEfficacy?: number;
    /** Health context (optional). */
    cognitiveReadiness?: number;
    sleepScore?: number;
    stressLevel?: number;
}

/**
 * Evaluate all habits and produce nudge decisions.
 * Respects quiet hours, daily cap, and per-habit cooldowns.
 */
export function evaluateNudges(input: NudgeEngineInput): NudgeDecision[] {
    const {
        habits,
        nudgeHistory,
        nudgeCountToday,
        userName = 'Friend',
        preferredTone,
        authorityResistance,
        selfEfficacy,
        cognitiveReadiness,
        sleepScore,
        stressLevel,
    } = input;

    // Guard: quiet hours
    if (isQuietHours(NUDGE_CONFIG.quietHoursStart, NUDGE_CONFIG.quietHoursEnd)) {
        return [];
    }

    // Guard: daily cap
    if (nudgeCountToday >= NUDGE_CONFIG.maxNudgesPerDay) {
        return [];
    }

    const now = Date.now();
    const currentHour = getCurrentHour();
    const dayProgress = Math.min(currentHour / 23, 1);

    const decisions: NudgeDecision[] = [];

    for (const habit of habits) {
        // Skip already completed habits
        if (habit.completedToday) continue;

        // Check cooldown
        const recentNudges = nudgeHistory.filter(
            (n) => n.habitId === habit.id && n.sentAt >= now - NUDGE_CONFIG.defaultCooldownMs,
        );
        if (recentNudges.length > 0) {
            const lastNudge = recentNudges[0];
            const cooldown = lastNudge.wasActedUpon
                ? NUDGE_CONFIG.defaultCooldownMs
                : NUDGE_CONFIG.defaultCooldownMs * NUDGE_CONFIG.dismissedCooldownMultiplier;
            if (now - lastNudge.sentAt < cooldown) continue;
        }

        // Compute urgency
        const urgency = computeUrgency({
            habit,
            dayProgress,
            cognitiveReadiness,
            sleepScore,
            stressLevel,
        });

        const urgencyLevel = classifyUrgency(urgency);

        // Select template
        const { id: templateId, template } = selectTemplate({
            urgency: urgencyLevel,
            preferredTone,
            authorityResistance,
            selfEfficacy,
        });

        // Interpolate
        const message = interpolateTemplate(template, {
            name: userName,
            habit_name: habit.displayName,
            streak: habit.currentStreak,
            progress: Math.round(habit.todayProgress * 100),
            target: habit.targetCount,
            target_unit: habit.targetUnit,
        });

        decisions.push({
            shouldNudge: urgency > 0.15, // Minimum threshold
            habitId: habit.id,
            habitName: habit.displayName,
            urgency: urgencyLevel,
            template: templateId,
            message,
        });
    }

    // Sort by urgency (critical first), cap remaining budget
    const actionable = decisions
        .filter((d) => d.shouldNudge)
        .sort((a, b) => {
            const order: Record<NudgeUrgency, number> = { critical: 3, moderate: 2, gentle: 1 };
            return order[b.urgency] - order[a.urgency];
        });

    const remaining = NUDGE_CONFIG.maxNudgesPerDay - nudgeCountToday;
    return actionable.slice(0, remaining);
}
