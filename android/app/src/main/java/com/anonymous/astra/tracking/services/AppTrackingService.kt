package com.anonymous.astra.tracking.services

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import android.os.IBinder
import android.util.Log
import androidx.core.content.ContextCompat
import com.anonymous.astra.MainActivity
import com.anonymous.astra.R
import com.anonymous.astra.tracking.FocusStateEngine
import com.anonymous.astra.tracking.FocusStateSnapshot
import com.anonymous.astra.tracking.TrackingPreferences
import com.anonymous.astra.tracking.database.TrackingDatabase
import com.anonymous.astra.tracking.intervention.InterventionManager
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.json.JSONObject
import kotlin.math.abs
import kotlin.math.sqrt

class AppTrackingService : Service(), SensorEventListener {

    companion object {
        const val TAG = "AstraTracking"
        const val CHANNEL_ID = "astra_tracking_channel"
        const val NOTIFICATION_ID = 1001
        const val POLL_INTERVAL_MS = 15_000L
        const val BINGE_THRESHOLD_MS = 20L * 60L * 1000L
        private const val FRAGMENTATION_SWITCH_THRESHOLD = 12.0
        private const val RAPID_SWITCH_WINDOW_MS = 10L * 60L * 1000L

        fun start(context: Context) {
            val intent = Intent(context, AppTrackingService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                ContextCompat.startForegroundService(context, intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context) {
            context.stopService(Intent(context, AppTrackingService::class.java))
        }
    }

    private lateinit var db: TrackingDatabase
    private lateinit var interventionManager: InterventionManager
    private lateinit var focusStateEngine: FocusStateEngine
    private lateinit var usageStatsManager: UsageStatsManager
    private lateinit var workerThread: HandlerThread
    private lateinit var workerHandler: Handler

    private var sensorManager: SensorManager? = null
    private var accelerometer: Sensor? = null

    private var isTracking = false
    private var lastUsageQueryTime = System.currentTimeMillis() - POLL_INTERVAL_MS
    private var lastProcessedNotificationCount = 0
    private var lastMotionMagnitude = 0.0
    private var lastMotionSampleAt = 0L

    private var currentApp: String? = null
    private var currentAppLabel: String? = null
    private var sessionStartTime = 0L
    private var currentSessionSwitchCount = 0
    private var currentSessionUnlockCount = 0
    private var currentSessionInterruptionCount = 0
    private var currentMotionContext = "unknown"

    private val switchTimestamps = mutableListOf<Long>()
    private val recentApps = mutableListOf<String>()

    private var totalScreenTimeMs = 0L
    private var totalDistractiveTimeMs = 0L
    private var switchCountTotal = 0
    private var unlockCountTotal = 0
    private var longestFocusSessionMs = 0L
    private var focusSessionTotal = 0
    private var bingeCount = 0

    private var distractiveApps = setOf(
        "com.instagram.android",
        "com.twitter.android",
        "com.zhiliaoapp.musically",
        "com.snapchat.android",
        "com.reddit.frontpage",
        "com.google.android.youtube",
        "com.whatsapp",
        "com.facebook.katana",
        "com.discord",
        "com.pinterest",
    )

    private val pollRunnable = object : Runnable {
        override fun run() {
            if (!isTracking) {
                return
            }

            try {
                processTrackingTick()
            } catch (error: Exception) {
                Log.e(TAG, "Tracking tick failed", error)
            }

            workerHandler.postDelayed(this, POLL_INTERVAL_MS)
        }
    }

    private val screenStateReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val now = System.currentTimeMillis()
            when (intent.action) {
                Intent.ACTION_USER_PRESENT -> {
                    unlockCountTotal += 1
                    currentSessionUnlockCount += 1
                    val idleStartedAt = TrackingPreferences.getLastIdleTimestamp(context)
                    if (idleStartedAt > 0L && now - idleStartedAt >= 2 * 60 * 1000L) {
                        db.insertBehaviorFlag("IDLE", 1.0, currentApp, "idle_ms=${now - idleStartedAt}")
                    }
                    workerHandler.post { processTrackingTick() }
                }

                Intent.ACTION_SCREEN_OFF -> {
                    TrackingPreferences.setLastIdleTimestamp(context, now)
                }
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        db = TrackingDatabase(this)
        interventionManager = InterventionManager(this)
        focusStateEngine = FocusStateEngine(this, db)
        usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        createNotificationChannel()
        hydrateDailyAccumulators()
        loadDistractiveApps()

        workerThread = HandlerThread("AstraTrackingWorker").apply { start() }
        workerHandler = Handler(workerThread.looper)

        registerScreenStateReceiver()
        setupMotionSampler()

        lastProcessedNotificationCount = TrackingPreferences.getNotificationInterruptions(this)
        currentMotionContext = TrackingPreferences.getMotionContext(this)
        Log.d(TAG, "AppTrackingService created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(NOTIFICATION_ID, buildNotification())

        if (!isTracking) {
            isTracking = true
            workerHandler.post(pollRunnable)
            Log.d(TAG, "Background focus tracking started")
        }

        return START_STICKY
    }

    override fun onDestroy() {
        isTracking = false
        workerHandler.removeCallbacksAndMessages(null)
        runCatching { unregisterReceiver(screenStateReceiver) }
        if (sensorManager != null) {
            sensorManager?.unregisterListener(this)
        }
        endCurrentSession()
        workerThread.quitSafely()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun processTrackingTick() {
        val now = System.currentTimeMillis()
        syncNotificationInterruptions()
        checkForegroundApp(now)
        maybeDetectRapidSwitching(now)
        maybeDetectBinge(now)
    }

    private fun checkForegroundApp(now: Long) {
        val events = usageStatsManager.queryEvents(lastUsageQueryTime, now)
        val event = UsageEvents.Event()

        var latestApp: String? = null
        var latestTimestamp = 0L

        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND && event.timeStamp >= latestTimestamp) {
                latestApp = event.packageName
                latestTimestamp = event.timeStamp
            }
        }

        if (TrackingPreferences.isSignalEnabled(this, TrackingPreferences.SIGNAL_ACCESSIBILITY)) {
            val (hintPackage, hintTimestamp) = TrackingPreferences.getAccessibilityHint(this)
            if (!hintPackage.isNullOrBlank() && hintTimestamp > latestTimestamp) {
                latestApp = hintPackage
                latestTimestamp = hintTimestamp
            }
        }

        lastUsageQueryTime = now

        if (!latestApp.isNullOrBlank() && latestApp != currentApp) {
            onAppChanged(latestApp, latestTimestamp.takeIf { it > 0L } ?: now)
        }
    }

    private fun onAppChanged(newApp: String, timestamp: Long) {
        val previousApp = currentApp

        if (!previousApp.isNullOrBlank() && sessionStartTime > 0L) {
            val duration = (timestamp - sessionStartTime).coerceAtLeast(0L)
            recordSession(previousApp, sessionStartTime, timestamp, duration)
        }

        if (!previousApp.isNullOrBlank()) {
            switchCountTotal += 1
            switchTimestamps += timestamp
            recentApps += newApp
            if (recentApps.size > 24) {
                recentApps.removeAt(0)
            }
        }

        currentApp = newApp
        currentAppLabel = getAppLabel(newApp)
        sessionStartTime = timestamp
        currentSessionSwitchCount = if (previousApp == null) 0 else 1
        currentSessionUnlockCount = 0
        currentSessionInterruptionCount = 0
        currentMotionContext = TrackingPreferences.getMotionContext(this)
        TrackingPreferences.setLiveApp(this, newApp, timestamp)

        Log.d(TAG, "Foreground app changed from $previousApp to $newApp")
    }

    private fun endCurrentSession() {
        val packageName = currentApp ?: return
        if (sessionStartTime <= 0L) {
            return
        }

        val now = System.currentTimeMillis()
        recordSession(packageName, sessionStartTime, now, (now - sessionStartTime).coerceAtLeast(0L))
        currentApp = null
        currentAppLabel = null
        sessionStartTime = 0L
        TrackingPreferences.setLiveApp(this, null, now)
    }

    private fun recordSession(packageName: String, start: Long, end: Long, duration: Long) {
        if (duration < 3_000L) {
            return
        }

        val distractive = isDistractive(packageName)
        val focusSession =
            !distractive &&
                duration >= 10 * 60 * 1000L &&
                currentSessionSwitchCount <= 1 &&
                currentSessionInterruptionCount <= 2

        db.insertSession(
            packageName = packageName,
            appName = currentAppLabel ?: getAppLabel(packageName),
            startTime = start,
            endTime = end,
            duration = duration,
            switchCount = currentSessionSwitchCount,
            unlockCount = currentSessionUnlockCount,
            timeOfDay = getTimeOfDay(start),
            dayOfWeek = getDayOfWeek(start),
            motionContext = currentMotionContext,
            interruptionCount = currentSessionInterruptionCount,
            isFocusSession = focusSession,
            isDistractive = distractive,
        )

        totalScreenTimeMs += duration
        if (distractive) {
            totalDistractiveTimeMs += duration
        }
        if (focusSession) {
            focusSessionTotal += 1
            longestFocusSessionMs = maxOf(longestFocusSessionMs, duration)
        }
        if (distractive && duration >= BINGE_THRESHOLD_MS) {
            bingeCount += 1
        }

        val focusState = focusStateEngine.computeLatestFocusState(end)
        TrackingPreferences.setLatestFocusState(this, focusState)
        db.insertFocusState(focusState)
        db.updateDailyMetrics(
            totalScreenTime = totalScreenTimeMs,
            totalDistractiveTime = totalDistractiveTimeMs,
            switchCount = switchCountTotal,
            unlockCount = unlockCountTotal,
            longestFocusSession = longestFocusSessionMs,
            afiScore = focusState.AFI,
            entropyScore = focusState.metadata.optDouble("entropy", 0.0),
            focusSessionTotal = focusSessionTotal,
            bingeCount = bingeCount,
        )

        emitEvent(
            "appSessionEnded",
            Arguments.createMap().apply {
                putString("packageName", packageName)
                putString("appName", currentAppLabel ?: getAppLabel(packageName))
                putDouble("duration", duration.toDouble())
                putDouble("afiScore", focusState.AFI)
                putBoolean("isDistractive", distractive)
                putBoolean("isFocusSession", focusSession)
            },
        )
        emitEvent("focusStateUpdated", focusStateToMap(focusState))

        maybeDetectDopamineLoop(end, packageName)
    }

    private fun maybeDetectRapidSwitching(now: Long) {
        val cutoff = now - RAPID_SWITCH_WINDOW_MS
        switchTimestamps.removeAll { it < cutoff }
        val switchesPerHour = switchTimestamps.size / (RAPID_SWITCH_WINDOW_MS / (60.0 * 60.0 * 1000.0))

        if (switchesPerHour >= FRAGMENTATION_SWITCH_THRESHOLD) {
            db.insertBehaviorFlag("FRAGMENTATION", switchesPerHour, currentApp, null)
            emitEvent(
                "fragmentedAttention",
                Arguments.createMap().apply {
                    putDouble("switchRate", switchesPerHour)
                    putString("currentApp", currentApp)
                },
            )
        }

        val recentDistractiveApps = recentApps.takeLast(8).count { isDistractive(it) }
        if (switchTimestamps.size >= 6 && recentDistractiveApps >= 4) {
            if (db.getRecentBehaviorFlagCount("SPIRAL", now - 15 * 60 * 1000L) == 0) {
                val intervention = interventionManager.generateIntervention("SPIRAL", currentApp)
                intervention?.let {
                    emitEvent("spiralDetected", interventionToMap(it))
                }
            }
        }
    }

    private fun maybeDetectBinge(now: Long) {
        val packageName = currentApp ?: return
        if (!isDistractive(packageName) || sessionStartTime <= 0L) {
            return
        }

        val duration = now - sessionStartTime
        if (duration < BINGE_THRESHOLD_MS) {
            return
        }

        if (db.getRecentBehaviorFlagCount("BINGE", now - 30 * 60 * 1000L) > 0) {
            return
        }

        val intervention = interventionManager.generateIntervention("BINGE", packageName)
        intervention?.let {
            emitEvent("bingeDetected", interventionToMap(it).apply {
                putDouble("durationMinutes", duration / 60_000.0)
            })
        }
    }

    private fun maybeDetectDopamineLoop(now: Long, packageName: String) {
        val shortDistractiveBursts = db.getSessionsSince(now - 30 * 60 * 1000L, now).count {
            it.isDistractive && it.duration in 15_000L..120_000L
        }

        if (shortDistractiveBursts < 6) {
            return
        }

        if (db.getRecentBehaviorFlagCount("DOPAMINE_LOOP", now - 30 * 60 * 1000L) > 0) {
            return
        }

        db.insertBehaviorFlag("DOPAMINE_LOOP", shortDistractiveBursts.toDouble(), packageName, "rapid_short_bursts")
        val intervention = interventionManager.generateIntervention("DOPAMINE_LOOP", packageName)
        intervention?.let {
            emitEvent("dopamineLoopDetected", interventionToMap(it).apply {
                putInt("burstCount", shortDistractiveBursts)
            })
        }
    }

    private fun syncNotificationInterruptions() {
        if (!TrackingPreferences.isSignalEnabled(this, TrackingPreferences.SIGNAL_NOTIFICATION_LISTENER)) {
            return
        }

        val totalInterruptions = TrackingPreferences.getNotificationInterruptions(this)
        val delta = totalInterruptions - lastProcessedNotificationCount
        if (delta > 0) {
            currentSessionInterruptionCount += delta
            lastProcessedNotificationCount = totalInterruptions
        }
    }

    private fun hydrateDailyAccumulators() {
        val metrics = db.getDailyMetrics()
        if (metrics != null) {
            totalScreenTimeMs = metrics.optLong("totalScreenTime", 0L)
            totalDistractiveTimeMs = metrics.optLong("totalDistractiveTime", 0L)
            switchCountTotal = metrics.optInt("switchCount", 0)
            unlockCountTotal = metrics.optInt("unlockCount", 0)
            longestFocusSessionMs = metrics.optLong("longestFocusSession", 0L)
            focusSessionTotal = metrics.optInt("focusSessionTotal", 0)
            bingeCount = metrics.optInt("bingeCount", 0)
        }
    }

    private fun registerScreenStateReceiver() {
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_USER_PRESENT)
            addAction(Intent.ACTION_SCREEN_OFF)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(screenStateReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            @Suppress("DEPRECATION")
            registerReceiver(screenStateReceiver, filter)
        }
    }

    private fun setupMotionSampler() {
        if (!TrackingPreferences.isSignalEnabled(this, TrackingPreferences.SIGNAL_ACTIVITY_RECOGNITION)) {
            return
        }

        sensorManager = getSystemService(Context.SENSOR_SERVICE) as? SensorManager
        accelerometer = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        if (accelerometer != null) {
            sensorManager?.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_NORMAL)
        }
    }

    override fun onSensorChanged(event: SensorEvent?) {
        val sensorEvent = event ?: return
        if (sensorEvent.sensor.type != Sensor.TYPE_ACCELEROMETER) {
            return
        }

        val now = System.currentTimeMillis()
        if (now - lastMotionSampleAt < 15_000L) {
            return
        }

        val magnitude = sqrt(
            (sensorEvent.values[0] * sensorEvent.values[0] +
                sensorEvent.values[1] * sensorEvent.values[1] +
                sensorEvent.values[2] * sensorEvent.values[2]).toDouble(),
        )
        val delta = abs(magnitude - lastMotionMagnitude)
        lastMotionMagnitude = magnitude
        lastMotionSampleAt = now

        currentMotionContext = if (delta > 1.5) "active" else "stationary"
        TrackingPreferences.setMotionContext(this, currentMotionContext)
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "ASTRA Focus Tracking",
                NotificationManager.IMPORTANCE_LOW,
            ).apply {
                description = "Passive metadata-only focus tracking"
                setShowBadge(false)
            }
            getSystemService(NotificationManager::class.java)?.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        val contentText = "Observing usage patterns to improve focus"

        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
                .setContentTitle("ASTRA Focus Tracking")
                .setContentText(contentText)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build()
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
                .setContentTitle("ASTRA Focus Tracking")
                .setContentText(contentText)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build()
        }
    }

    private fun emitEvent(eventName: String, params: WritableMap) {
        try {
            val reactApp = application as? ReactApplication ?: return
            val reactContext = reactApp.reactNativeHost.reactInstanceManager.currentReactContext ?: return
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        } catch (error: Exception) {
            Log.e(TAG, "Failed to emit event $eventName", error)
        }
    }

    private fun interventionToMap(intervention: JSONObject): WritableMap =
        Arguments.createMap().apply {
            putString("type", intervention.optString("type"))
            putString("message", intervention.optString("message"))
            putString("tone", intervention.optString("tone"))
            putString("triggerApp", intervention.optString("triggerApp"))
            putInt("remainingToday", intervention.optInt("remainingToday"))
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

    private fun isDistractive(packageName: String): Boolean =
        distractiveApps.contains(packageName)

    private fun getAppLabel(packageName: String): String =
        try {
            val appInfo = packageManager.getApplicationInfo(packageName, 0)
            packageManager.getApplicationLabel(appInfo).toString()
        } catch (_: Exception) {
            packageName.substringAfterLast(".")
        }

    private fun loadDistractiveApps() {
        val configuredApps = TrackingPreferences.getDistractiveApps(this)
        if (configuredApps.isNotEmpty()) {
            distractiveApps = configuredApps
        }
    }

    private fun getTimeOfDay(timestamp: Long): String {
        val hour = ((timestamp / (60L * 60L * 1000L)) % 24).toInt()
        return when (hour) {
            in 5..11 -> "morning"
            in 12..16 -> "afternoon"
            in 17..21 -> "evening"
            else -> "night"
        }
    }

    private fun getDayOfWeek(timestamp: Long): Int {
        val calendar = java.util.Calendar.getInstance().apply {
            timeInMillis = timestamp
        }
        return calendar.get(java.util.Calendar.DAY_OF_WEEK) - 1
    }
}
