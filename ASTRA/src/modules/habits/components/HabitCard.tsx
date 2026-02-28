// ─────────────────────────────────────────────────────────────────────────────
// Habit Module — HabitCard Component
// Compact card with progress ring, streak, and one-tap logging.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
    AstraColors,
    AstraCard,
    AstraRadius,
    AstraSpacing,
    AstraTypography,
} from '../../../constants/astraTheme';
import { HabitProgressRing } from './HabitProgressRing';
import type { HabitWithProgress } from '../store/habitStore.types';
import { useHabitStore } from '../store/habitStore';

interface Props {
    habit: HabitWithProgress;
    onPress?: (habit: HabitWithProgress) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
    health: '♥',
    productivity: '◎',
    mindfulness: '❋',
    fitness: '⚡',
    learning: '📖',
    social: '👥',
    custom: '★',
};

export function HabitCard({ habit, onPress }: Props) {
    const logHabit = useHabitStore((s) => s.logHabit);

    const handleQuickLog = useCallback(() => {
        logHabit(habit.id);
    }, [habit.id, logHabit]);

    const handlePress = useCallback(() => {
        onPress?.(habit);
    }, [habit, onPress]);

    const progressPct = Math.round(habit.todayProgress * 100);
    const icon = CATEGORY_ICONS[habit.category] ?? '★';

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={styles.row}>
                {/* Progress Ring */}
                <HabitProgressRing
                    progress={habit.todayProgress}
                    size={52}
                    strokeWidth={4}
                    label={`${progressPct}%`}
                />

                {/* Info */}
                <View style={styles.info}>
                    <View style={styles.nameRow}>
                        <Text style={styles.icon}>{icon}</Text>
                        <Text style={styles.name} numberOfLines={1}>
                            {habit.displayName}
                        </Text>
                    </View>
                    <Text style={styles.meta}>
                        {habit.todayCount}/{habit.targetCount} {habit.targetUnit}
                        {'  ·  '}
                        🔥 {habit.currentStreak}d streak
                    </Text>
                </View>

                {/* Quick Log Button */}
                {!habit.completedToday ? (
                    <TouchableOpacity
                        style={styles.logButton}
                        onPress={handleQuickLog}
                        activeOpacity={0.6}
                    >
                        <Text style={styles.logButtonText}>+1</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.checkBadge}>
                        <Text style={styles.checkText}>✓</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        ...AstraCard,
        padding: AstraSpacing.lg,
        marginBottom: AstraSpacing.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        marginLeft: AstraSpacing.md,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    icon: {
        fontSize: 14,
        marginRight: 6,
    },
    name: {
        ...AstraTypography.headline,
        flex: 1,
    },
    meta: {
        ...AstraTypography.caption,
        marginTop: 2,
    },
    logButton: {
        width: 44,
        height: 44,
        borderRadius: AstraRadius.full,
        backgroundColor: AstraColors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(92,138,108,0.2)',
    },
    logButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AstraColors.primary,
    },
    checkBadge: {
        width: 44,
        height: 44,
        borderRadius: AstraRadius.full,
        backgroundColor: AstraColors.success,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
