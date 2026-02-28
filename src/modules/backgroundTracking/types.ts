export type TrackingSignal =
    | 'usageAccess'
    | 'accessibility'
    | 'activityRecognition'
    | 'notificationListener'
    | 'batteryOptimization';

export interface FocusState {
    AFI: number;
    focus_stability: number;
    distraction_risk: number;
    binge_probability: number;
    peak_focus_window: string | null;
    drift_window: string | null;
    updated_at: number;
    planner_load: number;
    health_readiness: number;
}

export type TrackingPermissionStatus = Record<TrackingSignal, boolean>;
export type TrackingSignalConfig = Record<TrackingSignal, boolean>;

export interface FocusContextSnapshot {
    plannerLoad: number;
    healthReadiness: number;
    goalLabel?: string | null;
}
