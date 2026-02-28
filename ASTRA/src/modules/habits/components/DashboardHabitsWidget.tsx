// ─────────────────────────────────────────────────────────────────────────────
// Habit Module — DashboardHabitsWidget
// Compact widget for the Dashboard: top 3 habits + next nudge preview.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
    AstraColors,
    AstraCard,
    AstraRadius,
    AstraSpacing,
    AstraTypography,
} from '../../../constants/astraTheme';
import { useHabitStore } from '../store/habitStore';
import { HabitProgressRing } from './HabitProgressRing';
import { getNextScheduledNudge } from '../services/NudgeScheduler';

interface Props {
    onViewAll?: () => void;
}

export function DashboardHabitsWidget({ onViewAll }: Props) {
    const todayHabits = useHabitStore((s) => s.fetchTodayHabits());
    const summary = useHabitStore((s) => s.getHabitSummary());

    // Top 3 most urgent (incomplete first, highest streak first)
    const topHabits = useMemo(
        () =>
            [...todayHabits]
                .sort((a, b) => {
                    if (a.completedToday !== b.completedToday) return a.completedToday ? 1 : -1;
                    return b.currentStreak - a.currentStreak;
                })
                .slice(0, 3),
        [todayHabits],
    );

    const nextNudge = getNextScheduledNudge();

    if (todayHabits.length === 0) return null;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Habits</Text>
                <TouchableOpacity onPress={onViewAll}>
                    <Text style={styles.viewAll}>View All →</Text>
                </TouchableOpacity>
            </View>

            {/* Overall progress bar */}
            <View style={styles.overallRow}>
                <Text style={styles.overallLabel}>
                    {summary.completedToday}/{todayHabits.length} done today
                </Text>
                <View style={styles.progressBarBg}>
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                width: todayHabits.length > 0
                                    ? `${(summary.completedToday / todayHabits.length) * 100}%`
                                    : '0%',
                            },
                        ]}
                    />
                </View>
            </View>

            {/* Top 3 habit rings */}
            <View style={styles.ringsRow}>
                {topHabits.map((h) => (
                    <View key={h.id} style={styles.ringItem}>
                        <HabitProgressRing
                            progress={h.todayProgress}
                            size={48}
                            strokeWidth={4}
                            label={h.completedToday ? '✓' : `${Math.round(h.todayProgress * 100)}%`}
                        />
                        <Text style={styles.ringLabel} numberOfLines={1}>
                            {h.displayName}
                        </Text>
                        <Text style={styles.ringStreak}>🔥 {h.currentStreak}d</Text>
                    </View>
                ))}
            </View>

            {/* Next nudge preview */}
            {nextNudge && (
                <View style={styles.nudgePreview}>
                    <Text style={styles.nudgeLabel}>NEXT NUDGE</Text>
                    <Text style={styles.nudgeText} numberOfLines={2}>
                        {nextNudge.message}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...AstraCard,
        padding: AstraSpacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: AstraSpacing.md,
    },
    headerTitle: {
        ...AstraTypography.headline,
    },
    viewAll: {
        ...AstraTypography.caption,
        color: AstraColors.primary,
        fontWeight: '600',
    },
    overallRow: {
        marginBottom: AstraSpacing.lg,
    },
    overallLabel: {
        ...AstraTypography.caption,
        marginBottom: AstraSpacing.xs,
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        backgroundColor: AstraColors.muted,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: 6,
        borderRadius: 3,
        backgroundColor: AstraColors.primary,
    },
    ringsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    ringItem: {
        alignItems: 'center',
        width: 80,
    },
    ringLabel: {
        ...AstraTypography.caption,
        marginTop: AstraSpacing.xs,
        textAlign: 'center',
    },
    ringStreak: {
        fontSize: 10,
        color: AstraColors.mutedForeground,
        marginTop: 1,
    },
    nudgePreview: {
        marginTop: AstraSpacing.lg,
        paddingTop: AstraSpacing.md,
        borderTopWidth: 1,
        borderTopColor: AstraColors.border,
    },
    nudgeLabel: {
        ...AstraTypography.label,
        marginBottom: AstraSpacing.xs,
    },
    nudgeText: {
        ...AstraTypography.body,
        color: AstraColors.warmGray,
        fontStyle: 'italic',
    },
});
