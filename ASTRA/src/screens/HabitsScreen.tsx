// ─────────────────────────────────────────────────────────────────────────────
// Habits Screen — Full tab screen with list, form, and detail views.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Alert,
    SafeAreaView,
} from 'react-native';
import {
    AstraColors,
    AstraRadius,
    AstraSpacing,
    AstraTypography,
    AstraShadow,
} from '../constants/astraTheme';
import { useHabitStore } from '../modules/habits/store/habitStore';
import { HabitList } from '../modules/habits/components/HabitList';
import { HabitForm } from '../modules/habits/components/HabitForm';
import type { Habit, HabitWithProgress } from '../modules/habits/store/habitStore.types';

type ScreenMode = 'list' | 'create' | 'edit';

export default function HabitsScreen() {
    const [mode, setMode] = useState<ScreenMode>('list');
    const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);

    const addHabit = useHabitStore((s) => s.addHabit);
    const updateHabit = useHabitStore((s) => s.updateHabit);
    const deleteHabit = useHabitStore((s) => s.deleteHabit);

    const handleHabitPress = useCallback((habit: HabitWithProgress) => {
        setEditingHabit(habit);
        setMode('edit');
    }, []);

    const handleCreate = useCallback(
        (data: Omit<Habit, 'id' | 'createdAt'>) => {
            addHabit(data);
            setMode('list');
        },
        [addHabit],
    );

    const handleUpdate = useCallback(
        (data: Omit<Habit, 'id' | 'createdAt'>) => {
            if (editingHabit) {
                updateHabit({ ...data, id: editingHabit.id });
            }
            setEditingHabit(undefined);
            setMode('list');
        },
        [editingHabit, updateHabit],
    );

    const handleDelete = useCallback(() => {
        if (!editingHabit) return;
        Alert.alert(
            'Delete Habit',
            `Are you sure you want to delete "${editingHabit.displayName}"? This will also delete all logs.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteHabit(editingHabit.id);
                        setEditingHabit(undefined);
                        setMode('list');
                    },
                },
            ],
        );
    }, [editingHabit, deleteHabit]);

    const handleCancel = useCallback(() => {
        setEditingHabit(undefined);
        setMode('list');
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Habits</Text>
                    {mode === 'list' && (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setMode('create')}
                        >
                            <Text style={styles.addButtonText}>+ New</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Content */}
                {mode === 'list' && (
                    <HabitList onHabitPress={handleHabitPress} />
                )}

                {/* Create / Edit Modal */}
                <Modal
                    visible={mode === 'create' || mode === 'edit'}
                    animationType="slide"
                    presentationStyle="pageSheet"
                >
                    <SafeAreaView style={styles.modalContainer}>
                        <HabitForm
                            initialHabit={editingHabit}
                            onSubmit={mode === 'edit' ? handleUpdate : handleCreate}
                            onCancel={handleCancel}
                        />

                        {/* Delete button in edit mode */}
                        {mode === 'edit' && editingHabit && (
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={handleDelete}
                            >
                                <Text style={styles.deleteText}>Delete Habit</Text>
                            </TouchableOpacity>
                        )}
                    </SafeAreaView>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: AstraColors.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: AstraSpacing.xl,
        paddingTop: AstraSpacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: AstraSpacing.xl,
        paddingTop: AstraSpacing.md,
    },
    title: {
        ...AstraTypography.display,
    },
    addButton: {
        paddingVertical: AstraSpacing.sm,
        paddingHorizontal: AstraSpacing.lg,
        borderRadius: AstraRadius.full,
        backgroundColor: AstraColors.primary,
        ...AstraShadow.button,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: AstraColors.primaryForeground,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: AstraColors.background,
    },
    deleteButton: {
        alignSelf: 'center',
        paddingVertical: AstraSpacing.md,
        paddingHorizontal: AstraSpacing.xxl,
        marginBottom: AstraSpacing.xxl,
    },
    deleteText: {
        fontSize: 15,
        fontWeight: '600',
        color: AstraColors.destructive,
    },
});
