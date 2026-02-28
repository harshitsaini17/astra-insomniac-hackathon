package com.anonymous.astra.tracking

import android.Manifest
import android.app.AppOpsManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.os.Process
import android.provider.Settings
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.anonymous.astra.tracking.database.TrackingDatabase
import com.anonymous.astra.tracking.services.AppTrackingService
import com.anonymous.astra.tracking.services.AstraAccessibilityService
import com.anonymous.astra.tracking.services.AstraNotificationListenerService
import com.anonymous.astra.tracking.services.FocusStateWorker
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap

class AstraTrackingModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "AstraTrackingModule"
        private const val NAME = "AstraTrackingModule"
        private const val ACTIVITY_PERMISSION_REQUEST_CODE = 7021
    }

    private val db: TrackingDatabase by lazy { TrackingDatabase(reactApplicationContext) }
    private val focusStateEngine: FocusStateEngine by lazy {
        FocusStateEngine(reactApplicationContext, db)
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun startTracking(promise: Promise) {
        try {
            TrackingPreferences.setTrackingEnabled(reactApplicationContext, true)
            FocusStateWorker.schedule(reactApplicationContext)
            AppTrackingService.start(reactApplicationContext)
            promise.resolve(true)
        } catch (error: Exception) {
            Log.e(TAG, "Failed to start tracking", error)
            promise.reject("START_ERROR", error.message, error)
        }
    }

    @ReactMethod
    fun stopTracking(promise: Promise) {
        try {
            TrackingPreferences.setTrackingEnabled(reactApplicationContext, false)
            FocusStateWorker.cancel(reactApplicationContext)
            AppTrackingService.stop(reactApplicationContext)
            promise.resolve(true)
        } catch (error: Exception) {
            Log.e(TAG, "Failed to stop tracking", error)
            promise.reject("STOP_ERROR", error.message, error)
        }
    }

    @ReactMethod
    fun isTrackingEnabled(promise: Promise) {
        promise.resolve(TrackingPreferences.isTrackingEnabled(reactApplicationContext))
    }

    @ReactMethod
    fun getTodaySessions(promise: Promise) {
        try {
            promise.resolve(db.getTodaySessions().toString())
        } catch (error: Exception) {
            promise.reject("QUERY_ERROR", error.message, error)
        }
    }

    @ReactMethod
    fun getLiveApp(promise: Promise) {
        promise.resolve(TrackingPreferences.getLiveApp(reactApplicationContext) ?: "unknown")
    }

    @ReactMethod
    fun getFragmentationScore(promise: Promise) {
        try {
            val focusState = getOrComputeFocusState()
            promise.resolve(focusState.AFI)
        } catch (error: Exception) {
            promise.reject("QUERY_ERROR", error.message, error)
        }
    }

    @ReactMethod
    fun getDistractionState(promise: Promise) {
        try {
            val focusState = getOrComputeFocusState()
            val state = when {
                focusState.bingeProbability >= 0.7 -> "BINGE"
                focusState.distractionRisk >= 0.65 -> "ELEVATED"
                db.getTodayInterventionCount() > 0 -> "ELEVATED"
                else -> "NORMAL"
            }
            promise.resolve(state)
        } catch (error: Exception) {
            promise.reject("QUERY_ERROR", error.message, error)
        }
    }

    @ReactMethod
    fun getDailyMetrics(promise: Promise) {
        try {
            promise.resolve(db.getDailyMetrics()?.toString() ?: "{}")
        } catch (error: Exception) {
            promise.reject("QUERY_ERROR", error.message, error)
        }
    }

    @ReactMethod
    fun getLatestFocusState(promise: Promise) {
        try {
            promise.resolve(focusStateToMap(getOrComputeFocusState()))
        } catch (error: Exception) {
            promise.reject("FOCUS_STATE_ERROR", error.message, error)
        }
    }

    @ReactMethod
    fun getPermissionStatus(promise: Promise) {
        try {
            promise.resolve(
                Arguments.createMap().apply {
                    putBoolean(TrackingPreferences.SIGNAL_USAGE_ACCESS, checkUsageStatsPermission())
                    putBoolean(TrackingPreferences.SIGNAL_ACCESSIBILITY, isAccessibilityEnabled())
                    putBoolean(
                        TrackingPreferences.SIGNAL_ACTIVITY_RECOGNITION,
                        hasActivityRecognitionPermission(),
                    )
                    putBoolean(
                        TrackingPreferences.SIGNAL_NOTIFICATION_LISTENER,
                        isNotificationListenerEnabled(),
                    )
                    putBoolean(
                        TrackingPreferences.SIGNAL_BATTERY_OPTIMIZATION,
                        isIgnoringBatteryOptimizations(),
                    )
                },
            )
        } catch (error: Exception) {
            promise.reject("PERMISSION_ERROR", error.message, error)
        }
    }

    @ReactMethod
    fun getSignalConfig(promise: Promise) {
        try {
            promise.resolve(jsonToMap(TrackingPreferences.getSignalConfigJson(reactApplicationContext)))
        } catch (error: Exception) {
            promise.reject("CONFIG_ERROR", error.message, error)
        }
    }

    @ReactMethod
    fun setSignalEnabled(signal: String, enabled: Boolean, promise: Promise) {
        try {
            TrackingPreferences.setSignalEnabled(reactApplicationContext, signal, enabled)
            promise.resolve(true)
        } catch (error: Exception) {
            promise.reject("CONFIG_ERROR", error.message, error)
        }
    }

    @ReactMethod
    fun requestTrackingPermission(signal: String, promise: Promise) {
        try {
            when (signal) {
                TrackingPreferences.SIGNAL_USAGE_ACCESS -> openSettings(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
                TrackingPreferences.SIGNAL_ACCESSIBILITY -> openSettings(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
                TrackingPreferences.SIGNAL_NOTIFICATION_LISTENER -> {
                    openSettings(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
                }

                TrackingPreferences.SIGNAL_BATTERY_OPTIMIZATION -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        openSettings(
                            Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                                data = Uri.parse("package:${reactApplicationContext.packageName}")
                            },
                        )
                    }
                }

                TrackingPreferences.SIGNAL_ACTIVITY_RECOGNITION -> requestActivityRecognitionPermission()
                else -> {
                    promise.reject("PERMISSION_ERROR", "Unsupported signal: $signal")
                    return
                }
            }
            promise.resolve(true)
        } catch (error: Exception) {
            promise.reject("PERMISSION_ERROR", error.message, error)
        }
    }

    @ReactMethod
    fun hasUsagePermission(promise: Promise) {
        promise.resolve(checkUsageStatsPermission())
    }

    @ReactMethod
    fun requestUsagePermission(promise: Promise) {
        requestTrackingPermission(TrackingPreferences.SIGNAL_USAGE_ACCESS, promise)
    }

    @ReactMethod
    fun setDistractiveApps(apps: ReadableArray, promise: Promise) {
        try {
            val appSet = mutableSetOf<String>()
            for (index in 0 until apps.size()) {
                apps.getString(index)?.let { appSet += it }
            }
            TrackingPreferences.setDistractiveApps(reactApplicationContext, appSet)
            promise.resolve(true)
        } catch (error: Exception) {
            promise.reject("CONFIG_ERROR", error.message, error)
        }
    }

    @ReactMethod
    fun setFocusContextSnapshot(
        plannerLoad: Double,
        healthReadiness: Double,
        goalLabel: String?,
        promise: Promise,
    ) {
        try {
            TrackingPreferences.setFocusContextSnapshot(
                reactApplicationContext,
                plannerLoad.coerceIn(0.0, 1.0),
                healthReadiness.coerceIn(0.0, 1.0),
                goalLabel,
            )
            val focusState = focusStateEngine.computeLatestFocusState()
            TrackingPreferences.setLatestFocusState(reactApplicationContext, focusState)
            db.insertFocusState(focusState)
            promise.resolve(true)
        } catch (error: Exception) {
            promise.reject("CONTEXT_ERROR", error.message, error)
        }
    }

    private fun getOrComputeFocusState(): FocusStateSnapshot {
        val cached = TrackingPreferences.getLatestFocusState(reactApplicationContext)
        if (cached != null && System.currentTimeMillis() - cached.updatedAt < 4 * 60 * 60 * 1000L) {
            return cached
        }

        val computed = focusStateEngine.computeLatestFocusState()
        TrackingPreferences.setLatestFocusState(reactApplicationContext, computed)
        db.insertFocusState(computed)
        return computed
    }

    private fun openSettings(intent: Intent) {
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
    }

    private fun requestActivityRecognitionPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q || hasActivityRecognitionPermission()) {
            return
        }

        currentActivity?.let { activity ->
            ActivityCompat.requestPermissions(
                activity,
                arrayOf(Manifest.permission.ACTIVITY_RECOGNITION),
                ACTIVITY_PERMISSION_REQUEST_CODE,
            )
        } ?: run {
            openSettings(
                Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = Uri.parse("package:${reactApplicationContext.packageName}")
                },
            )
        }
    }

    private fun hasActivityRecognitionPermission(): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            return true
        }
        return ContextCompat.checkSelfPermission(
            reactApplicationContext,
            Manifest.permission.ACTIVITY_RECOGNITION,
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED
    }

    private fun isIgnoringBatteryOptimizations(): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            return true
        }

        val powerManager = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as? PowerManager
        return powerManager?.isIgnoringBatteryOptimizations(reactApplicationContext.packageName) == true
    }

    private fun isAccessibilityEnabled(): Boolean {
        val flattenedName = ComponentName(
            reactApplicationContext,
            AstraAccessibilityService::class.java,
        ).flattenToString()
        val enabledServices = Settings.Secure.getString(
            reactApplicationContext.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES,
        ) ?: return false
        return enabledServices.split(':').any { it.equals(flattenedName, ignoreCase = true) }
    }

    private fun isNotificationListenerEnabled(): Boolean {
        val flattenedName = ComponentName(
            reactApplicationContext,
            AstraNotificationListenerService::class.java,
        ).flattenToString()
        val enabledListeners = Settings.Secure.getString(
            reactApplicationContext.contentResolver,
            "enabled_notification_listeners",
        ) ?: return false
        return enabledListeners.split(':').any { it.equals(flattenedName, ignoreCase = true) }
    }

    private fun checkUsageStatsPermission(): Boolean {
        val appOps = reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                reactApplicationContext.packageName,
            )
        } else {
            @Suppress("DEPRECATION")
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                reactApplicationContext.packageName,
            )
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }

    private fun focusStateToMap(snapshot: FocusStateSnapshot): WritableMap =
        Arguments.createMap().apply {
            putDouble("AFI", snapshot.AFI)
            putDouble("focus_stability", snapshot.focusStability)
            putDouble("distraction_risk", snapshot.distractionRisk)
            putDouble("binge_probability", snapshot.bingeProbability)
            if (snapshot.peakFocusWindow.isNullOrBlank()) {
                putNull("peak_focus_window")
            } else {
                putString("peak_focus_window", snapshot.peakFocusWindow)
            }
            if (snapshot.driftWindow.isNullOrBlank()) {
                putNull("drift_window")
            } else {
                putString("drift_window", snapshot.driftWindow)
            }
            putDouble("updated_at", snapshot.updatedAt.toDouble())
            putDouble("planner_load", snapshot.plannerLoad)
            putDouble("health_readiness", snapshot.healthReadiness)
        }

    private fun jsonToMap(json: org.json.JSONObject): WritableMap =
        Arguments.createMap().apply {
            json.keys().forEach { key ->
                when (val value = json.opt(key)) {
                    is Boolean -> putBoolean(key, value)
                    is Double -> putDouble(key, value)
                    is Float -> putDouble(key, value.toDouble())
                    is Int -> putInt(key, value)
                    is Long -> putDouble(key, value.toDouble())
                    is String -> putString(key, value)
                    else -> putNull(key)
                }
            }
        }
}
