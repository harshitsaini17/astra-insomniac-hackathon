// ─────────────────────────────────────────────────────────────────────────────
// Habit Module — HabitList Component
// Displays today's habits with progress rings, streaks, and quick-log.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { AstraColors, AstraSpacing, AstraTypography } from '../../../constants/astraTheme';
import { useHabitStore } from '../store/habitStore';
import { HabitCard } from './HabitCard';
import type { HabitWithProgress } from '../store/habitStore.types';

interface Props {
    onHabitPress?: (habit: HabitWithProgress) => void;
}

export function HabitList({ onHabitPress }: Props) {
    const todayHabits = useHabitStore((s) => s.fetchTodayHabits());
    const summary = useHabitStore((s) => s.getHabitSummary());

    // Sort: incomplete first, then by streak (highest first)
    const sorted = useMemo(
        () =>
            [...todayHabits].sort((a, b) => {
                if (a.completedToday !== b.completedToday) {
                    return a.completedToday ? 1 : -1;
                }
                return b.currentStreak - a.currentStreak;
            }),
        [todayHabits],
    );

    const renderItem = ({ item }: { item: HabitWithProgress }) => (
        <HabitCard habit={item} onPress={onHabitPress} />
    );

    return (
        <View style={styles.container}>
            {/* Summary bar */}
            <View style={styles.summaryBar}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{summary.completedToday}/{todayHabits.length}</Text>
                    <Text style={styles.summaryLabel}>Done Today</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>🔥 {summary.averageStreak}</Text>
                    <Text style={styles.summaryLabel}>Avg Streak</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{Math.round(summary.overallCompletionRate * 100)}%</Text>
                    <Text style={styles.summaryLabel}>Weekly Rate</Text>
                </View>
            </View>

            {/* Habit list */}
            {sorted.length > 0 ? (
                <FlatList
                    data={sorted}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📋</Text>
                    <Text style={styles.emptyTitle}>No Habits Yet</Text>
                    <Text style={styles.emptyText}>
                        Tap the + button below to create your first habit.
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    summaryBar: {
        flexDirection: 'row',
        backgroundColor: AstraColors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: AstraColors.border,
        paddingVertical: AstraSpacing.lg,
        paddingHorizontal: AstraSpacing.md,
        marginBottom: AstraSpacing.lg,
        alignItems: 'center',
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        ...AstraTypography.headline,
        fontSize: 17,
    },
    summaryLabel: {
        ...AstraTypography.caption,
        marginTop: 2,
        fontSize: 11,
    },
    divider: {
        width: 1,
        height: 28,
        backgroundColor: AstraColors.border,
    },
    listContent: {
        paddingBottom: 100,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: AstraSpacing.lg,
    },
    emptyTitle: {
        ...AstraTypography.title,
        marginBottom: AstraSpacing.sm,
    },
    emptyText: {
        ...AstraTypography.body,
        color: AstraColors.mutedForeground,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
