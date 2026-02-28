// ─────────────────────────────────────────────────────────────────────────────
// Habit Module — HabitProgressRing Component
// Circular progress ring using react-native-svg.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AstraColors, AstraTypography } from '../../../constants/astraTheme';

interface Props {
    progress: number; // 0–1
    size?: number;
    strokeWidth?: number;
    color?: string;
    bgColor?: string;
    /** Text shown inside the ring (e.g., "75%"). */
    label?: string;
    /** Small text below the label. */
    sublabel?: string;
}

export function HabitProgressRing({
    progress,
    size = 64,
    strokeWidth = 5,
    color = AstraColors.primary,
    bgColor = AstraColors.border,
    label,
    sublabel,
}: Props) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - Math.min(progress, 1));

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                {/* Background ring */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={bgColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress ring */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={progress >= 1 ? AstraColors.success : color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation={-90}
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
            <View style={styles.labelContainer}>
                {label !== undefined && (
                    <Text style={[styles.label, { fontSize: size * 0.22 }]}>{label}</Text>
                )}
                {sublabel !== undefined && (
                    <Text style={[styles.sublabel, { fontSize: size * 0.14 }]}>{sublabel}</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    labelContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontWeight: '700',
        color: AstraColors.foreground,
    },
    sublabel: {
        ...AstraTypography.caption,
        marginTop: -1,
    },
});
