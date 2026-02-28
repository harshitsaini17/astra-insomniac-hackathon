// ─────────────────────────────────────────────────────────────────────────────
// Habit Module — HabitForm Component
// Create / edit form for habits.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {
    AstraColors,
    AstraCard,
    AstraRadius,
    AstraSpacing,
    AstraTypography,
    AstraChip,
    AstraChipActive,
} from '../../../constants/astraTheme';
import type { Habit, HabitCategory, PreferredTime, DayOfWeek } from '../store/habitStore.types';

interface Props {
    /** Pass existing habit for edit mode. */
    initialHabit?: Habit;
    onSubmit: (data: Omit<Habit, 'id' | 'createdAt'>) => void;
    onCancel: () => void;
}

const CATEGORIES: { value: HabitCategory; label: string; icon: string }[] = [
    { value: 'health', label: 'Health', icon: '♥' },
    { value: 'productivity', label: 'Productivity', icon: '◎' },
    { value: 'mindfulness', label: 'Mindfulness', icon: '❋' },
    { value: 'fitness', label: 'Fitness', icon: '⚡' },
    { value: 'learning', label: 'Learning', icon: '📖' },
    { value: 'social', label: 'Social', icon: '👥' },
    { value: 'custom', label: 'Custom', icon: '★' },
];

const TIMES: { value: PreferredTime; label: string }[] = [
    { value: 'morning', label: '🌅 Morning' },
    { value: 'afternoon', label: '☀️ Afternoon' },
    { value: 'evening', label: '🌙 Evening' },
    { value: 'anytime', label: '🕐 Anytime' },
];

const DAYS: { value: DayOfWeek; label: string }[] = [
    { value: 'mon', label: 'M' },
    { value: 'tue', label: 'T' },
    { value: 'wed', label: 'W' },
    { value: 'thu', label: 'T' },
    { value: 'fri', label: 'F' },
    { value: 'sat', label: 'S' },
    { value: 'sun', label: 'S' },
];

export function HabitForm({ initialHabit, onSubmit, onCancel }: Props) {
    const [name, setName] = useState(initialHabit?.name ?? '');
    const [displayName, setDisplayName] = useState(initialHabit?.displayName ?? '');
    const [category, setCategory] = useState<HabitCategory>(initialHabit?.category ?? 'custom');
    const [targetCount, setTargetCount] = useState(String(initialHabit?.targetCount ?? 1));
    const [targetUnit, setTargetUnit] = useState(initialHabit?.targetUnit ?? 'times');
    const [preferredTime, setPreferredTime] = useState<PreferredTime>(initialHabit?.preferredTime ?? 'anytime');
    const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeek[]>(
        initialHabit?.daysOfWeek ?? ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    );

    const toggleDay = useCallback((day: DayOfWeek) => {
        setDaysOfWeek((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
        );
    }, []);

    const handleSubmit = useCallback(() => {
        if (!name.trim()) return;

        onSubmit({
            userId: 'user',
            name: name.trim(),
            displayName: displayName.trim() || name.trim(),
            category,
            targetCount: Math.max(1, parseFloat(targetCount) || 1),
            targetUnit: targetUnit.trim() || 'times',
            preferredTime,
            daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
            isActive: true,
        });
    }, [name, displayName, category, targetCount, targetUnit, preferredTime, daysOfWeek, onSubmit]);

    return (
        <KeyboardAvoidingView
            style={styles.wrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>
                    {initialHabit ? 'Edit Habit' : 'New Habit'}
                </Text>

                {/* Name */}
                <Text style={styles.label}>HABIT NAME</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g., Morning Meditation"
                    placeholderTextColor={AstraColors.mutedForeground}
                />

                {/* Display Name */}
                <Text style={styles.label}>DISPLAY NAME (optional)</Text>
                <TextInput
                    style={styles.input}
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Short label for cards"
                    placeholderTextColor={AstraColors.mutedForeground}
                />

                {/* Category */}
                <Text style={styles.label}>CATEGORY</Text>
                <View style={styles.chipRow}>
                    {CATEGORIES.map((c) => (
                        <TouchableOpacity
                            key={c.value}
                            style={[
                                styles.chip,
                                category === c.value && styles.chipActive,
                            ]}
                            onPress={() => setCategory(c.value)}
                        >
                            <Text style={[
                                styles.chipText,
                                category === c.value && styles.chipTextActive,
                            ]}>
                                {c.icon} {c.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Target */}
                <Text style={styles.label}>DAILY TARGET</Text>
                <View style={styles.targetRow}>
                    <TextInput
                        style={[styles.input, styles.targetInput]}
                        value={targetCount}
                        onChangeText={setTargetCount}
                        keyboardType="numeric"
                        placeholder="1"
                        placeholderTextColor={AstraColors.mutedForeground}
                    />
                    <TextInput
                        style={[styles.input, styles.unitInput]}
                        value={targetUnit}
                        onChangeText={setTargetUnit}
                        placeholder="times"
                        placeholderTextColor={AstraColors.mutedForeground}
                    />
                </View>

                {/* Preferred Time */}
                <Text style={styles.label}>PREFERRED TIME</Text>
                <View style={styles.chipRow}>
                    {TIMES.map((t) => (
                        <TouchableOpacity
                            key={t.value}
                            style={[
                                styles.chip,
                                preferredTime === t.value && styles.chipActive,
                            ]}
                            onPress={() => setPreferredTime(t.value)}
                        >
                            <Text style={[
                                styles.chipText,
                                preferredTime === t.value && styles.chipTextActive,
                            ]}>
                                {t.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Days */}
                <Text style={styles.label}>ACTIVE DAYS</Text>
                <View style={styles.dayRow}>
                    {DAYS.map((d) => (
                        <TouchableOpacity
                            key={d.value}
                            style={[
                                styles.dayChip,
                                daysOfWeek.includes(d.value) && styles.dayChipActive,
                            ]}
                            onPress={() => toggleDay(d.value)}
                        >
                            <Text style={[
                                styles.dayText,
                                daysOfWeek.includes(d.value) && styles.dayTextActive,
                            ]}>
                                {d.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.submitBtn, !name.trim() && styles.submitDisabled]}
                        onPress={handleSubmit}
                        disabled={!name.trim()}
                    >
                        <Text style={styles.submitText}>
                            {initialHabit ? 'Save Changes' : 'Create Habit'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: AstraColors.background,
    },
    scroll: {
        flex: 1,
        paddingHorizontal: AstraSpacing.xl,
        paddingTop: AstraSpacing.xl,
    },
    title: {
        ...AstraTypography.title,
        marginBottom: AstraSpacing.xl,
    },
    label: {
        ...AstraTypography.label,
        marginBottom: AstraSpacing.sm,
        marginTop: AstraSpacing.lg,
    },
    input: {
        backgroundColor: AstraColors.card,
        borderRadius: AstraRadius.md,
        borderWidth: 1,
        borderColor: AstraColors.inputBorder,
        paddingHorizontal: AstraSpacing.lg,
        paddingVertical: AstraSpacing.md,
        fontSize: 15,
        color: AstraColors.foreground,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: AstraSpacing.sm,
    },
    chip: {
        ...AstraChip,
    },
    chipActive: {
        ...AstraChipActive,
    },
    chipText: {
        fontSize: 13,
        color: AstraColors.mutedForeground,
        fontWeight: '500',
    },
    chipTextActive: {
        color: AstraColors.primary,
        fontWeight: '600',
    },
    targetRow: {
        flexDirection: 'row',
        gap: AstraSpacing.md,
    },
    targetInput: {
        flex: 1,
    },
    unitInput: {
        flex: 2,
    },
    dayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayChip: {
        width: 40,
        height: 40,
        borderRadius: AstraRadius.full,
        backgroundColor: AstraColors.muted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayChipActive: {
        backgroundColor: AstraColors.primaryLight,
        borderWidth: 1,
        borderColor: 'rgba(92,138,108,0.3)',
    },
    dayText: {
        fontSize: 13,
        fontWeight: '600',
        color: AstraColors.mutedForeground,
    },
    dayTextActive: {
        color: AstraColors.primary,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: AstraSpacing.md,
        marginTop: AstraSpacing.xxl,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: AstraSpacing.lg,
        borderRadius: AstraRadius.md,
        backgroundColor: AstraColors.muted,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: AstraColors.mutedForeground,
    },
    submitBtn: {
        flex: 2,
        paddingVertical: AstraSpacing.lg,
        borderRadius: AstraRadius.md,
        backgroundColor: AstraColors.primary,
        alignItems: 'center',
    },
    submitDisabled: {
        opacity: 0.4,
    },
    submitText: {
        fontSize: 15,
        fontWeight: '600',
        color: AstraColors.primaryForeground,
    },
});
