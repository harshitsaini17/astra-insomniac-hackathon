// ─────────────────────────────────────────────────────────────────────────────
// Habit Module — SQLite Schema
// ─────────────────────────────────────────────────────────────────────────────

export const HABIT_TABLES: string[] = [
    `CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT NOT NULL,
        display_name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'custom',
        target_count REAL NOT NULL DEFAULT 1,
        target_unit TEXT NOT NULL DEFAULT 'times',
        preferred_time TEXT NOT NULL DEFAULT 'anytime',
        days_of_week TEXT NOT NULL DEFAULT 'mon,tue,wed,thu,fri,sat,sun',
        created_at INTEGER NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1
    )`,

    `CREATE TABLE IF NOT EXISTS habit_logs (
        id TEXT PRIMARY KEY,
        habit_id TEXT NOT NULL,
        date TEXT NOT NULL,
        count REAL NOT NULL DEFAULT 1,
        completed_at INTEGER NOT NULL,
        nudge_id TEXT,
        notes TEXT,
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS nudge_history (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        habit_id TEXT NOT NULL,
        template_used TEXT NOT NULL,
        sent_at INTEGER NOT NULL,
        was_acted_upon INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    )`,
];

export const HABIT_INDICES: string[] = [
    `CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON habit_logs(habit_id, date)`,
    `CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date)`,
    `CREATE INDEX IF NOT EXISTS idx_nudge_history_habit ON nudge_history(habit_id, sent_at)`,
    `CREATE INDEX IF NOT EXISTS idx_habits_active ON habits(is_active)`,
];
