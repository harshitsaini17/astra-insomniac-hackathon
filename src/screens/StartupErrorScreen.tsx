import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AstraCard, AstraColors, AstraRadius, AstraShadow } from '../constants/astraTheme';

interface StartupErrorScreenProps {
    stage: string;
    message: string;
    details?: string;
    onRetry: () => void;
}

const STAGE_LABELS: Record<string, string> = {
    database: 'database initialization',
};

export default function StartupErrorScreen({
    stage,
    message,
    details,
    onRetry,
}: StartupErrorScreenProps) {
    const stageLabel = STAGE_LABELS[stage] ?? stage;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.caption}>STARTUP ERROR</Text>
                <Text style={styles.title}>ASTRA could not finish opening.</Text>
                <View style={styles.card}>
                    <Text style={styles.message}>
                        The app hit a problem during {stageLabel}. You can retry now.
                    </Text>
                    <Text style={styles.errorText}>{message}</Text>
                    {__DEV__ && details ? (
                        <Text style={styles.details}>{details}</Text>
                    ) : null}
                </View>
                <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AstraColors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        width: '100%',
        maxWidth: 420,
    },
    caption: {
        fontSize: 11,
        fontWeight: '600',
        color: AstraColors.mutedForeground,
        letterSpacing: 1.2,
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: AstraColors.foreground,
        marginBottom: 16,
    },
    card: {
        ...AstraCard,
        padding: 20,
        marginBottom: 16,
    },
    message: {
        fontSize: 15,
        lineHeight: 22,
        color: AstraColors.foreground,
        marginBottom: 12,
    },
    errorText: {
        fontSize: 14,
        lineHeight: 20,
        color: AstraColors.destructive,
    },
    details: {
        marginTop: 12,
        fontSize: 12,
        lineHeight: 18,
        color: AstraColors.mutedForeground,
    },
    retryButton: {
        backgroundColor: AstraColors.primary,
        borderRadius: AstraRadius.md,
        paddingVertical: 14,
        alignItems: 'center',
        ...AstraShadow.button,
    },
    retryText: {
        fontSize: 15,
        fontWeight: '700',
        color: AstraColors.primaryForeground,
    },
});
