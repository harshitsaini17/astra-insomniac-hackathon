// ASTRA app entry point with fail-soft startup handling.

import React, { useCallback, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Navigation from './Navigation';
import { initializeDatabase } from '../database/repository';
import { scheduleAllTasks } from '../modules/focusTrainer/services/BackgroundTaskService';
import { useFocusStore } from '../modules/focusTrainer/store/focusStore';
import {
    getPersonalityProfile,
    getUserProfile,
    isOnboardingComplete,
} from '../storage/mmkvStore';
import { AstraColors } from '../constants/astraTheme';
import OnboardingScreen from '../screens/OnboardingScreen';
import SplashScreen from '../screens/SplashScreen';
import StartupErrorScreen from '../screens/StartupErrorScreen';

type StartupStage = 'database';

interface StartupErrorState {
    stage: StartupStage;
    message: string;
    details?: string;
}

const DEFAULT_PERSONALITY = {
    conscientiousness: 4,
    neuroticism: 4,
};

function formatStartupError(error: unknown): { message: string; details?: string } {
    if (error instanceof Error) {
        return {
            message: error.message,
            details: error.stack,
        };
    }

    return {
        message: 'Unknown startup error',
        details: String(error),
    };
}

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [startupError, setStartupError] = useState<StartupErrorState | null>(null);
    const [splashAttempt, setSplashAttempt] = useState(0);

    const setInitialized = useFocusStore((state) => state.setInitialized);
    const setPersonality = useFocusStore((state) => state.setPersonality);

    const scheduleBackgroundTasks = useCallback(async () => {
        try {
            await scheduleAllTasks();
        } catch (error) {
            console.warn('[App] Background task scheduling failed:', error);
        }
    }, []);

    const initializeApp = useCallback(async () => {
        console.log('[App] Starting initialization...');

        try {
            await initializeDatabase();
        } catch (error) {
            const formattedError = formatStartupError(error);
            setStartupError({
                stage: 'database',
                message: formattedError.message,
                details: formattedError.details,
            });
            setInitialized(false);
            setShowOnboarding(false);
            return;
        }

        let onboarded = false;

        try {
            onboarded = isOnboardingComplete();
        } catch (error) {
            console.warn('[App] Failed to read onboarding state, defaulting to onboarding:', error);
            onboarded = false;
        }

        try {
            const userProfile = onboarded ? getUserProfile() : null;
            if (userProfile) {
                setPersonality({
                    conscientiousness: userProfile.bigFive.conscientiousness,
                    neuroticism: userProfile.bigFive.neuroticism,
                });
            } else {
                setPersonality(getPersonalityProfile());
            }
        } catch (error) {
            console.warn('[App] Failed to hydrate cached profile state:', error);
            setPersonality(DEFAULT_PERSONALITY);
            onboarded = false;
        }

        if (!onboarded) {
            setInitialized(false);
            setShowOnboarding(true);
            return;
        }

        await scheduleBackgroundTasks();
        setInitialized(true);
        setShowOnboarding(false);
    }, [scheduleBackgroundTasks, setInitialized, setPersonality]);

    const handleSplashComplete = useCallback(async () => {
        await initializeApp();
        setIsLoading(false);
    }, [initializeApp]);

    const handleOnboardingComplete = useCallback(async () => {
        try {
            const userProfile = getUserProfile();
            if (userProfile) {
                setPersonality({
                    conscientiousness: userProfile.bigFive.conscientiousness,
                    neuroticism: userProfile.bigFive.neuroticism,
                });
            } else {
                setPersonality(getPersonalityProfile());
            }
        } catch (error) {
            console.warn('[App] Failed to restore onboarding profile after completion:', error);
            setPersonality(DEFAULT_PERSONALITY);
        }

        await scheduleBackgroundTasks();
        setInitialized(true);
        setShowOnboarding(false);
    }, [scheduleBackgroundTasks, setInitialized, setPersonality]);

    const handleRetryStartup = useCallback(() => {
        setStartupError(null);
        setShowOnboarding(false);
        setInitialized(false);
        setIsLoading(true);
        setSplashAttempt((current) => current + 1);
    }, [setInitialized]);

    if (startupError) {
        return (
            <>
                <StatusBar barStyle="dark-content" backgroundColor={AstraColors.background} />
                <StartupErrorScreen
                    stage={startupError.stage}
                    message={startupError.message}
                    details={startupError.details}
                    onRetry={handleRetryStartup}
                />
            </>
        );
    }

    if (isLoading) {
        return (
            <>
                <StatusBar barStyle="dark-content" backgroundColor={AstraColors.background} />
                <SplashScreen
                    key={splashAttempt}
                    onInitializationComplete={handleSplashComplete}
                />
            </>
        );
    }

    if (showOnboarding) {
        return (
            <>
                <StatusBar barStyle="dark-content" backgroundColor={AstraColors.background} />
                <OnboardingScreen onComplete={handleOnboardingComplete} />
            </>
        );
    }

    return (
        <NavigationContainer>
            <StatusBar barStyle="dark-content" backgroundColor={AstraColors.background} />
            <Navigation />
        </NavigationContainer>
    );
}
