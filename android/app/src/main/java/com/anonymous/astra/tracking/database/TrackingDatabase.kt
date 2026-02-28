package com.anonymous.astra.tracking.database

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import com.anonymous.astra.tracking.FocusStateSnapshot
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

data class SessionRecord(
    val id: Long,
    val packageName: String,
    val appName: String,
    val startTime: Long,
    val endTime: Long,
    val duration: Long,
    val switchCount: Int,
    val unlockCount: Int,
    val timeOfDay: String,
    val dayOfWeek: Int,
    val motionContext: String,
    val interruptionCount: Int,
    val isFocusSession: Boolean,
    val isDistractive: Boolean,
)

class TrackingDatabase(context: Context) : SQLiteOpenHelper(context, DB_NAME, null, DB_VERSION) {

    companion object {
        const val DB_NAME = "astra_tracking.db"
        const val DB_VERSION = 2

        const val TABLE_SESSIONS = "bg_app_sessions"
        const val TABLE_DAILY_METRICS = "bg_daily_metrics"
        const val TABLE_BEHAVIOR_FLAGS = "bg_behavior_flags"
        const val TABLE_FOCUS_STATE = "bg_focus_state"
    }

    override fun onCreate(db: SQLiteDatabase) {
        createTables(db)
        createIndexes(db)
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        if (oldVersion < 2) {
            ensureColumn(db, TABLE_SESSIONS, "switch_count", "INTEGER DEFAULT 0")
            ensureColumn(db, TABLE_SESSIONS, "unlock_count", "INTEGER DEFAULT 0")
            ensureColumn(db, TABLE_SESSIONS, "time_of_day", "TEXT DEFAULT 'unknown'")
            ensureColumn(db, TABLE_SESSIONS, "day_of_week", "INTEGER DEFAULT 0")
            ensureColumn(db, TABLE_SESSIONS, "motion_context", "TEXT DEFAULT 'unknown'")
            ensureColumn(db, TABLE_SESSIONS, "interruption_count", "INTEGER DEFAULT 0")
            ensureColumn(db, TABLE_SESSIONS, "is_focus_session", "INTEGER DEFAULT 0")

            ensureColumn(db, TABLE_DAILY_METRICS, "entropy_score", "REAL DEFAULT 0")
            ensureColumn(db, TABLE_DAILY_METRICS, "focus_session_total", "INTEGER DEFAULT 0")
            ensureColumn(db, TABLE_DAILY_METRICS, "binge_count", "INTEGER DEFAULT 0")

            db.execSQL(
                """
                CREATE TABLE IF NOT EXISTS $TABLE_FOCUS_STATE (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp INTEGER NOT NULL,
                    afi REAL DEFAULT 0,
                    focus_stability REAL DEFAULT 0,
                    distraction_risk REAL DEFAULT 0,
                    binge_probability REAL DEFAULT 0,
                    peak_focus_window TEXT,
                    drift_window TEXT,
                    planner_load REAL DEFAULT 0,
                    health_readiness REAL DEFAULT 0,
                    metadata_json TEXT
                )
                """.trimIndent(),
            )
            createIndexes(db)
        }
    }

    override fun onOpen(db: SQLiteDatabase) {
        super.onOpen(db)
        createTables(db)
        createIndexes(db)
    }

    fun insertSession(
        packageName: String,
        appName: String?,
        startTime: Long,
        endTime: Long,
        duration: Long,
        switchCount: Int,
        unlockCount: Int,
        timeOfDay: String,
        dayOfWeek: Int,
        motionContext: String,
        interruptionCount: Int,
        isFocusSession: Boolean,
        isDistractive: Boolean,
    ): Long {
        val values = ContentValues().apply {
            put("package_name", packageName)
            put("app_name", appName ?: packageName)
            put("start_time", startTime)
            put("end_time", endTime)
            put("duration", duration)
            put("switch_count", switchCount)
            put("unlock_count", unlockCount)
            put("time_of_day", timeOfDay)
            put("day_of_week", dayOfWeek)
            put("motion_context", motionContext)
            put("interruption_count", interruptionCount)
            put("is_focus_session", if (isFocusSession) 1 else 0)
            put("is_distractive", if (isDistractive) 1 else 0)
        }
        return writableDatabase.insert(TABLE_SESSIONS, null, values)
    }

    fun getTodaySessions(): JSONArray =
        toJsonArray(getSessionsSince(getStartOfDayMs(), System.currentTimeMillis()))

    fun getSessionsSince(startTime: Long, endTime: Long = System.currentTimeMillis()): List<SessionRecord> {
        val cursor = readableDatabase.query(
            TABLE_SESSIONS,
            null,
            "start_time >= ? AND start_time <= ?",
            arrayOf(startTime.toString(), endTime.toString()),
            null,
            null,
            "start_time ASC",
        )

        return buildList {
            cursor.use {
                while (it.moveToNext()) {
                    add(
                        SessionRecord(
                            id = it.getLong(it.getColumnIndexOrThrow("id")),
                            packageName = it.getString(it.getColumnIndexOrThrow("package_name")),
                            appName = it.getString(it.getColumnIndexOrThrow("app_name")),
                            startTime = it.getLong(it.getColumnIndexOrThrow("start_time")),
                            endTime = it.getLong(it.getColumnIndexOrThrow("end_time")),
                            duration = it.getLong(it.getColumnIndexOrThrow("duration")),
                            switchCount = it.getInt(it.getColumnIndexOrThrow("switch_count")),
                            unlockCount = it.getInt(it.getColumnIndexOrThrow("unlock_count")),
                            timeOfDay = it.getString(it.getColumnIndexOrThrow("time_of_day")) ?: "unknown",
                            dayOfWeek = it.getInt(it.getColumnIndexOrThrow("day_of_week")),
                            motionContext = it.getString(it.getColumnIndexOrThrow("motion_context")) ?: "unknown",
                            interruptionCount = it.getInt(it.getColumnIndexOrThrow("interruption_count")),
                            isFocusSession = it.getInt(it.getColumnIndexOrThrow("is_focus_session")) == 1,
                            isDistractive = it.getInt(it.getColumnIndexOrThrow("is_distractive")) == 1,
                        ),
                    )
                }
            }
        }
    }

    fun updateDailyMetrics(
        totalScreenTime: Long,
        totalDistractiveTime: Long,
        switchCount: Int,
        unlockCount: Int,
        longestFocusSession: Long,
        afiScore: Double,
        entropyScore: Double,
        focusSessionTotal: Int,
        bingeCount: Int,
    ) {
        val today = getTodayDateString()
        val values = ContentValues().apply {
            put("date", today)
            put("total_screen_time", totalScreenTime)
            put("total_distractive_time", totalDistractiveTime)
            put("switch_count", switchCount)
            put("unlock_count", unlockCount)
            put("longest_focus_session", longestFocusSession)
            put("afi_score", afiScore)
            put("entropy_score", entropyScore)
            put("focus_session_total", focusSessionTotal)
            put("binge_count", bingeCount)
            put("updated_at", System.currentTimeMillis())
        }

        val updated = writableDatabase.update(
            TABLE_DAILY_METRICS,
            values,
            "date = ?",
            arrayOf(today),
        )
        if (updated == 0) {
            writableDatabase.insert(TABLE_DAILY_METRICS, null, values)
        }
    }

    fun getDailyMetrics(): JSONObject? {
        val today = getTodayDateString()
        val cursor = readableDatabase.query(
            TABLE_DAILY_METRICS,
            null,
            "date = ?",
            arrayOf(today),
            null,
            null,
            null,
        )

        cursor.use {
            if (!it.moveToFirst()) {
                return null
            }

            return JSONObject().apply {
                put("date", it.getString(it.getColumnIndexOrThrow("date")))
                put("totalScreenTime", it.getLong(it.getColumnIndexOrThrow("total_screen_time")))
                put("totalDistractiveTime", it.getLong(it.getColumnIndexOrThrow("total_distractive_time")))
                put("switchCount", it.getInt(it.getColumnIndexOrThrow("switch_count")))
                put("unlockCount", it.getInt(it.getColumnIndexOrThrow("unlock_count")))
                put("longestFocusSession", it.getLong(it.getColumnIndexOrThrow("longest_focus_session")))
                put("afiScore", it.getDouble(it.getColumnIndexOrThrow("afi_score")))
                put("entropyScore", it.getDouble(it.getColumnIndexOrThrow("entropy_score")))
                put("focusSessionTotal", it.getInt(it.getColumnIndexOrThrow("focus_session_total")))
                put("bingeCount", it.getInt(it.getColumnIndexOrThrow("binge_count")))
            }
        }
    }

    fun insertBehaviorFlag(type: String, intensity: Double, triggerApp: String?, details: String?) {
        val values = ContentValues().apply {
            put("timestamp", System.currentTimeMillis())
            put("type", type)
            put("intensity", intensity)
            put("trigger_app", triggerApp)
            put("details", details)
        }
        writableDatabase.insert(TABLE_BEHAVIOR_FLAGS, null, values)
    }

    fun getTodayInterventionCount(): Int {
        val startOfDay = getStartOfDayMs()
        val cursor = readableDatabase.rawQuery(
            "SELECT COUNT(*) FROM $TABLE_BEHAVIOR_FLAGS WHERE timestamp >= ? AND (type = 'SPIRAL' OR type = 'BINGE' OR type = 'DOPAMINE_LOOP')",
            arrayOf(startOfDay.toString()),
        )
        cursor.use {
            if (it.moveToFirst()) {
                return it.getInt(0)
            }
        }
        return 0
    }

    fun getRecentBehaviorFlagCount(type: String, since: Long): Int {
        val cursor = readableDatabase.rawQuery(
            "SELECT COUNT(*) FROM $TABLE_BEHAVIOR_FLAGS WHERE timestamp >= ? AND type = ?",
            arrayOf(since.toString(), type),
        )
        cursor.use {
            if (it.moveToFirst()) {
                return it.getInt(0)
            }
        }
        return 0
    }

    fun insertFocusState(snapshot: FocusStateSnapshot) {
        val values = ContentValues().apply {
            put("timestamp", snapshot.updatedAt)
            put("afi", snapshot.AFI)
            put("focus_stability", snapshot.focusStability)
            put("distraction_risk", snapshot.distractionRisk)
            put("binge_probability", snapshot.bingeProbability)
            put("peak_focus_window", snapshot.peakFocusWindow)
            put("drift_window", snapshot.driftWindow)
            put("planner_load", snapshot.plannerLoad)
            put("health_readiness", snapshot.healthReadiness)
            put("metadata_json", snapshot.metadata.toString())
        }
        writableDatabase.insert(TABLE_FOCUS_STATE, null, values)
    }

    fun getLatestFocusState(): FocusStateSnapshot? {
        val cursor = readableDatabase.query(
            TABLE_FOCUS_STATE,
            null,
            null,
            null,
            null,
            null,
            "timestamp DESC",
            "1",
        )

        cursor.use {
            if (!it.moveToFirst()) {
                return null
            }

            return FocusStateSnapshot(
                AFI = it.getDouble(it.getColumnIndexOrThrow("afi")),
                focusStability = it.getDouble(it.getColumnIndexOrThrow("focus_stability")),
                distractionRisk = it.getDouble(it.getColumnIndexOrThrow("distraction_risk")),
                bingeProbability = it.getDouble(it.getColumnIndexOrThrow("binge_probability")),
                peakFocusWindow = it.getString(it.getColumnIndexOrThrow("peak_focus_window")),
                driftWindow = it.getString(it.getColumnIndexOrThrow("drift_window")),
                updatedAt = it.getLong(it.getColumnIndexOrThrow("timestamp")),
                plannerLoad = it.getDouble(it.getColumnIndexOrThrow("planner_load")),
                healthReadiness = it.getDouble(it.getColumnIndexOrThrow("health_readiness")),
                metadata = runCatching {
                    JSONObject(it.getString(it.getColumnIndexOrThrow("metadata_json")) ?: "{}")
                }.getOrDefault(JSONObject()),
            )
        }
    }

    private fun createTables(db: SQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS $TABLE_SESSIONS (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                package_name TEXT NOT NULL,
                app_name TEXT,
                start_time INTEGER NOT NULL,
                end_time INTEGER NOT NULL,
                duration INTEGER NOT NULL,
                switch_count INTEGER DEFAULT 0,
                unlock_count INTEGER DEFAULT 0,
                time_of_day TEXT DEFAULT 'unknown',
                day_of_week INTEGER DEFAULT 0,
                motion_context TEXT DEFAULT 'unknown',
                interruption_count INTEGER DEFAULT 0,
                is_focus_session INTEGER DEFAULT 0,
                is_distractive INTEGER DEFAULT 0,
                created_at INTEGER DEFAULT (strftime('%s','now') * 1000)
            )
            """.trimIndent(),
        )

        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS $TABLE_DAILY_METRICS (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL UNIQUE,
                total_screen_time INTEGER DEFAULT 0,
                total_distractive_time INTEGER DEFAULT 0,
                switch_count INTEGER DEFAULT 0,
                unlock_count INTEGER DEFAULT 0,
                longest_focus_session INTEGER DEFAULT 0,
                afi_score REAL DEFAULT 0,
                entropy_score REAL DEFAULT 0,
                focus_session_total INTEGER DEFAULT 0,
                binge_count INTEGER DEFAULT 0,
                updated_at INTEGER DEFAULT (strftime('%s','now') * 1000)
            )
            """.trimIndent(),
        )

        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS $TABLE_BEHAVIOR_FLAGS (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp INTEGER NOT NULL,
                type TEXT NOT NULL,
                intensity REAL DEFAULT 0,
                trigger_app TEXT,
                details TEXT
            )
            """.trimIndent(),
        )

        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS $TABLE_FOCUS_STATE (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp INTEGER NOT NULL,
                afi REAL DEFAULT 0,
                focus_stability REAL DEFAULT 0,
                distraction_risk REAL DEFAULT 0,
                binge_probability REAL DEFAULT 0,
                peak_focus_window TEXT,
                drift_window TEXT,
                planner_load REAL DEFAULT 0,
                health_readiness REAL DEFAULT 0,
                metadata_json TEXT
            )
            """.trimIndent(),
        )
    }

    private fun createIndexes(db: SQLiteDatabase) {
        db.execSQL("CREATE INDEX IF NOT EXISTS idx_bg_sess_time ON $TABLE_SESSIONS(start_time)")
        db.execSQL("CREATE INDEX IF NOT EXISTS idx_bg_sess_pkg ON $TABLE_SESSIONS(package_name)")
        db.execSQL("CREATE INDEX IF NOT EXISTS idx_bg_daily_date ON $TABLE_DAILY_METRICS(date)")
        db.execSQL("CREATE INDEX IF NOT EXISTS idx_bg_flags_ts ON $TABLE_BEHAVIOR_FLAGS(timestamp)")
        db.execSQL("CREATE INDEX IF NOT EXISTS idx_bg_focus_ts ON $TABLE_FOCUS_STATE(timestamp)")
    }

    private fun ensureColumn(db: SQLiteDatabase, table: String, column: String, definition: String) {
        if (hasColumn(db, table, column)) {
            return
        }
        db.execSQL("ALTER TABLE $table ADD COLUMN $column $definition")
    }

    private fun hasColumn(db: SQLiteDatabase, table: String, column: String): Boolean {
        db.rawQuery("PRAGMA table_info($table)", null).use { cursor ->
            val nameIndex = cursor.getColumnIndex("name")
            while (cursor.moveToNext()) {
                if (cursor.getString(nameIndex) == column) {
                    return true
                }
            }
        }
        return false
    }

    private fun toJsonArray(records: List<SessionRecord>): JSONArray =
        JSONArray().apply {
            records.forEach { record ->
                put(
                    JSONObject().apply {
                        put("id", record.id)
                        put("packageName", record.packageName)
                        put("appName", record.appName)
                        put("startTime", record.startTime)
                        put("endTime", record.endTime)
                        put("duration", record.duration)
                        put("switchCount", record.switchCount)
                        put("unlockCount", record.unlockCount)
                        put("timeOfDay", record.timeOfDay)
                        put("dayOfWeek", record.dayOfWeek)
                        put("motionContext", record.motionContext)
                        put("interruptionCount", record.interruptionCount)
                        put("isFocusSession", record.isFocusSession)
                        put("isDistractive", record.isDistractive)
                    },
                )
            }
        }

    private fun getStartOfDayMs(): Long {
        val cal = Calendar.getInstance()
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)
        cal.set(Calendar.MILLISECOND, 0)
        return cal.timeInMillis
    }

    private fun getTodayDateString(): String =
        SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
}
