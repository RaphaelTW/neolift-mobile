import type { SQLiteDatabase } from 'expo-sqlite';

async function ensureColumn(db: SQLiteDatabase, table: string, column: string, definition: string) {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  if (!columns.some((item) => item.name === column)) {
    await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  }
}

export async function migrateDb(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);

    CREATE TABLE IF NOT EXISTS exercise_catalog (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      force TEXT,
      level TEXT,
      mechanic TEXT,
      equipment TEXT,
      primary_muscles TEXT NOT NULL,
      secondary_muscles TEXT NOT NULL,
      instructions TEXT NOT NULL,
      category TEXT NOT NULL,
      images TEXT NOT NULL,
      videos TEXT NOT NULL DEFAULT '[]',
      source TEXT NOT NULL DEFAULT 'free-exercise-db',
      source_id TEXT,
      source_url TEXT,
      license TEXT,
      license_url TEXT,
      license_author TEXT,
      media TEXT NOT NULL DEFAULT '[]',
      synced_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS favorites (exercise_id TEXT PRIMARY KEY NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS workouts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, started_at TEXT NOT NULL, finished_at TEXT, notes TEXT DEFAULT '');
    CREATE TABLE IF NOT EXISTS workout_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT, workout_id INTEGER NOT NULL, exercise_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL, primary_muscle TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(workout_id) REFERENCES workouts(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS workout_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT, workout_exercise_id INTEGER NOT NULL, set_number INTEGER NOT NULL,
      reps INTEGER NOT NULL DEFAULT 10, weight REAL NOT NULL DEFAULT 0, completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL, FOREIGN KEY(workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS workout_exercise_feedback (
      workout_exercise_id INTEGER PRIMARY KEY NOT NULL, effort TEXT NOT NULL CHECK(effort IN ('easy','good','hard')),
      updated_at TEXT NOT NULL, FOREIGN KEY(workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY NOT NULL CHECK(id = 1), gender TEXT NOT NULL, age INTEGER NOT NULL,
      experience TEXT NOT NULL, goal TEXT NOT NULL, training_days INTEGER NOT NULL DEFAULT 3,
      onboarding_completed INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS body_measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT, recorded_at TEXT NOT NULL, weight REAL NOT NULL,
      neck REAL, chest REAL, waist REAL, hips REAL, left_arm REAL, right_arm REAL,
      left_thigh REAL, right_thigh REAL, left_calf REAL, right_calf REAL
    );

    CREATE INDEX IF NOT EXISTS idx_exercise_catalog_source ON exercise_catalog(source);
    CREATE INDEX IF NOT EXISTS idx_exercise_catalog_name ON exercise_catalog(name);
    CREATE INDEX IF NOT EXISTS idx_workouts_finished ON workouts(finished_at);
    CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises(workout_id);
    CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise ON workout_sets(workout_exercise_id);
    CREATE INDEX IF NOT EXISTS idx_measurements_date ON body_measurements(recorded_at);
  `);

  await ensureColumn(db, 'user_profile', 'training_days', 'INTEGER NOT NULL DEFAULT 3');
  await ensureColumn(db, 'user_profile', 'onboarding_completed', 'INTEGER NOT NULL DEFAULT 1');
  await ensureColumn(db, 'exercise_catalog', 'videos', `TEXT NOT NULL DEFAULT '[]'`);
  await ensureColumn(db, 'exercise_catalog', 'source', `TEXT NOT NULL DEFAULT 'free-exercise-db'`);
  await ensureColumn(db, 'exercise_catalog', 'source_id', 'TEXT');
  await ensureColumn(db, 'exercise_catalog', 'source_url', 'TEXT');
  await ensureColumn(db, 'exercise_catalog', 'license', 'TEXT');
  await ensureColumn(db, 'exercise_catalog', 'license_url', 'TEXT');
  await ensureColumn(db, 'exercise_catalog', 'license_author', 'TEXT');
  await ensureColumn(db, 'exercise_catalog', 'media', `TEXT NOT NULL DEFAULT '[]'`);
}
