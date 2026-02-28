import { PersonalityProfile } from '../modules/focusTrainer/models/types';
import { NudgeState } from '../modules/focusTrainer/engine/NudgeManager';
import { UserProfile } from '../modules/onboarding/models/onboardingTypes';
import { PersonalizationState } from '../modules/personalization/models/personalizationTypes';
import {
    FocusState,
    TrackingPermissionStatus,
    TrackingSignalConfig,
} from '../modules/backgroundTracking/types';

type StorageDriver = {
    getString: (key: string) => string | undefined;
    set: (key: string, value: string | number | boolean) => void;
    delete: (key: string) => void;
};

const fallbackStore = new Map<string, string>();

let storageDriver: StorageDriver = {
    getString(key) {
        return fallbackStore.get(key);
    },
    set(key, value) {
        fallbackStore.set(key, String(value));
    },
    delete(key) {
        fallbackStore.delete(key);
    },
};

try {
    const mmkvModule = require('react-native-mmkv') as {
        MMKV?: new () => {
            getString: (key: string) => string | undefined;
            set: (key: string, value: string | number | boolean) => void;
            delete: (key: string) => void;
        };
    };

    if (mmkvModule.MMKV) {
        const nativeStorage = new mmkvModule.MMKV();
        storageDriver = {
            getString: (key) => nativeStorage.getString(key),
            set: (key, value) => nativeStorage.set(key, value),
            delete: (key) => nativeStorage.delete(key),
        };
    }
} catch {
    // Non-native environments fall back to the in-memory store.
}

function getString(key: string): string | undefined {
    return storageDriver.getString(key);
}

function setString(key: string, value: string): void {
    storageDriver.set(key, value);
}

function getNumber(key: string): number | undefined {
    const value = getString(key);
    return value !== undefined ? Number(value) : undefined;
}

function setNumber(key: string, value: number): void {
    storageDriver.set(key, value);
}

function getBoolean(key: string): boolean | undefined {
    const value = getString(key);
    return value !== undefined ? value === 'true' : undefined;
}

function setBoolean(key: string, value: boolean): void {
    storageDriver.set(key, value);
}

function deleteKey(key: string): void {
    storageDriver.delete(key);
}

const KEYS = {
    CURRENT_AFI: 'focus.currentAFI',
    CURRENT_AFI_LEVEL: 'focus.currentAFILevel',
    CURRENT_CRS: 'focus.currentCRS',
    ACTIVE_SESSION: 'focus.activeSession',
    NUDGE_STATE: 'focus.nudgeState',
    PERSONALITY: 'focus.personality',
    MODULE_ENABLED: 'focus.moduleEnabled',
    LAST_HEALTH_SYNC: 'focus.lastHealthSync',
    POMODORO_COUNT_TODAY: 'focus.pomodoroCountToday',
    COMPLIANCE_SUCCESSES: 'focus.complianceSuccesses',
    COMPLIANCE_ATTEMPTS: 'focus.complianceAttempts',
    BLOCKING_OVERRIDE: 'focus.blockingOverride',
    ONBOARDING_PROFILE: 'onboarding.userProfile',
    ONBOARDING_COMPLETE: 'onboarding.complete',
    PERSONALIZATION_STATE: 'personalization.state',
    PERSONALIZATION_LAST_DAILY: 'personalization.lastDailyUpdate',
    TRACKING_FOCUS_STATE: 'tracking.focusState',
    TRACKING_PERMISSIONS: 'tracking.permissionStatus',
    TRACKING_SIGNAL_CONFIG: 'tracking.signalConfig',
} as const;

export function getCachedAFI(): number {
    return getNumber(KEYS.CURRENT_AFI) ?? 0.5;
}

export function setCachedAFI(score: number, level: string): void {
    setNumber(KEYS.CURRENT_AFI, score);
    setString(KEYS.CURRENT_AFI_LEVEL, level);
}

export function getCachedAFILevel(): string {
    return getString(KEYS.CURRENT_AFI_LEVEL) ?? 'moderate';
}

export function getCachedCRS(): number {
    return getNumber(KEYS.CURRENT_CRS) ?? 0.5;
}

export function setCachedCRS(score: number): void {
    setNumber(KEYS.CURRENT_CRS, score);
}

export function getPersonalityProfile(): PersonalityProfile {
    const raw = getString(KEYS.PERSONALITY);
    if (raw) {
        try {
            return JSON.parse(raw) as PersonalityProfile;
        } catch {
            return { conscientiousness: 4, neuroticism: 4 };
        }
    }
    return { conscientiousness: 4, neuroticism: 4 };
}

export function setPersonalityProfile(profile: PersonalityProfile): void {
    setString(KEYS.PERSONALITY, JSON.stringify(profile));
}

export function getNudgeState(): NudgeState {
    const raw = getString(KEYS.NUDGE_STATE);
    if (raw) {
        try {
            return JSON.parse(raw) as NudgeState;
        } catch {
            return {
                todayCount: 0,
                lastNudgeTime: 0,
                lastDismissTime: 0,
                dailyResetDate: new Date().toISOString().split('T')[0],
            };
        }
    }

    return {
        todayCount: 0,
        lastNudgeTime: 0,
        lastDismissTime: 0,
        dailyResetDate: new Date().toISOString().split('T')[0],
    };
}

export function setNudgeState(state: NudgeState): void {
    setString(KEYS.NUDGE_STATE, JSON.stringify(state));
}

export function getComplianceStats(): { successes: number; attempts: number } {
    return {
        successes: getNumber(KEYS.COMPLIANCE_SUCCESSES) ?? 0,
        attempts: getNumber(KEYS.COMPLIANCE_ATTEMPTS) ?? 0,
    };
}

export function setComplianceStats(successes: number, attempts: number): void {
    setNumber(KEYS.COMPLIANCE_SUCCESSES, successes);
    setNumber(KEYS.COMPLIANCE_ATTEMPTS, attempts);
}

export function isModuleEnabled(): boolean {
    return getBoolean(KEYS.MODULE_ENABLED) ?? true;
}

export function setModuleEnabled(enabled: boolean): void {
    setBoolean(KEYS.MODULE_ENABLED, enabled);
}

export function getBlockingOverride(): number | null {
    const value = getNumber(KEYS.BLOCKING_OVERRIDE);
    return value !== undefined ? value : null;
}

export function setBlockingOverride(level: number | null): void {
    if (level === null) {
        deleteKey(KEYS.BLOCKING_OVERRIDE);
        return;
    }
    setNumber(KEYS.BLOCKING_OVERRIDE, level);
}

export function getUserProfile(): UserProfile | null {
    const raw = getString(KEYS.ONBOARDING_PROFILE);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as UserProfile;
    } catch {
        return null;
    }
}

export function setUserProfile(profile: UserProfile): void {
    setString(KEYS.ONBOARDING_PROFILE, JSON.stringify(profile));
}

export function isOnboardingComplete(): boolean {
    return getBoolean(KEYS.ONBOARDING_COMPLETE) ?? false;
}

export function setOnboardingComplete(complete: boolean): void {
    setBoolean(KEYS.ONBOARDING_COMPLETE, complete);
}

export function getPersonalizationState(): PersonalizationState | null {
    const raw = getString(KEYS.PERSONALIZATION_STATE);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as PersonalizationState;
    } catch {
        return null;
    }
}

export function setPersonalizationState(state: PersonalizationState): void {
    setString(KEYS.PERSONALIZATION_STATE, JSON.stringify(state));
}

export function clearPersonalizationState(): void {
    deleteKey(KEYS.PERSONALIZATION_STATE);
    deleteKey(KEYS.PERSONALIZATION_LAST_DAILY);
}

export function getLastDailyUpdate(): number {
    return getNumber(KEYS.PERSONALIZATION_LAST_DAILY) ?? 0;
}

export function setLastDailyUpdate(timestamp: number): void {
    setNumber(KEYS.PERSONALIZATION_LAST_DAILY, timestamp);
}

export function getCachedFocusState(): FocusState | null {
    const raw = getString(KEYS.TRACKING_FOCUS_STATE);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as FocusState;
    } catch {
        return null;
    }
}

export function setCachedFocusState(state: FocusState): void {
    setString(KEYS.TRACKING_FOCUS_STATE, JSON.stringify(state));
}

export function getCachedTrackingPermissions(): TrackingPermissionStatus | null {
    const raw = getString(KEYS.TRACKING_PERMISSIONS);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as TrackingPermissionStatus;
    } catch {
        return null;
    }
}

export function setCachedTrackingPermissions(status: TrackingPermissionStatus): void {
    setString(KEYS.TRACKING_PERMISSIONS, JSON.stringify(status));
}

export function getCachedTrackingConfig(): TrackingSignalConfig | null {
    const raw = getString(KEYS.TRACKING_SIGNAL_CONFIG);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as TrackingSignalConfig;
    } catch {
        return null;
    }
}

export function setCachedTrackingConfig(config: TrackingSignalConfig): void {
    setString(KEYS.TRACKING_SIGNAL_CONFIG, JSON.stringify(config));
}
