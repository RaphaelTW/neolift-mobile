import type { SQLiteDatabase } from 'expo-sqlite';
import type { ActiveExercise, Exercise, MuscleProgress, ProgressPoint, ThemeMode, WeightUnit } from '@/types';

const parseExerciseRow = (row: any): Exercise => ({
  id: row.id,
  name: row.name,
  force: row.force,
  level: row.level,
  mechanic: row.mechanic,
  equipment: row.equipment,
  primaryMuscles: JSON.parse(row.primary_muscles || '[]'),
  secondaryMuscles: JSON.parse(row.secondary_muscles || '[]'),
  instructions: JSON.parse(row.instructions || '[]'),
  category: row.category,
  images: JSON.parse(row.images || '[]')
});

export async function upsertExercises(db: SQLiteDatabase, exercises: Exercise[]) {
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    for (const e of exercises) {
      await db.runAsync(
        `INSERT INTO exercise_catalog
          (id,name,force,level,mechanic,equipment,primary_muscles,secondary_muscles,instructions,category,images,synced_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(id) DO UPDATE SET
          name=excluded.name, force=excluded.force, level=excluded.level, mechanic=excluded.mechanic,
          equipment=excluded.equipment, primary_muscles=excluded.primary_muscles,
          secondary_muscles=excluded.secondary_muscles, instructions=excluded.instructions,
          category=excluded.category, images=excluded.images, synced_at=excluded.synced_at`,
        e.id, e.name, e.force, e.level, e.mechanic, e.equipment,
        JSON.stringify(e.primaryMuscles), JSON.stringify(e.secondaryMuscles),
        JSON.stringify(e.instructions), e.category, JSON.stringify(e.images), now
      );
    }
  });
}

export async function countExercises(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM exercise_catalog');
  return row?.count ?? 0;
}

export async function searchExercises(db: SQLiteDatabase, query = '', muscle = 'all', limit = 80) {
  const q = `%${query.trim()}%`;
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM exercise_catalog
     WHERE (? = '' OR name LIKE ? OR equipment LIKE ?)
       AND (? = 'all' OR primary_muscles LIKE ?)
     ORDER BY name ASC LIMIT ?`,
    query.trim(), q, q, muscle, `%\"${muscle}\"%`, limit
  );
  return rows.map(parseExerciseRow);
}

export async function getExercise(db: SQLiteDatabase, id: string) {
  const row = await db.getFirstAsync<any>('SELECT * FROM exercise_catalog WHERE id = ?', id);
  return row ? parseExerciseRow(row) : null;
}

export async function toggleFavorite(db: SQLiteDatabase, id: string) {
  const exists = await db.getFirstAsync('SELECT exercise_id FROM favorites WHERE exercise_id = ?', id);
  if (exists) await db.runAsync('DELETE FROM favorites WHERE exercise_id = ?', id);
  else await db.runAsync('INSERT INTO favorites(exercise_id,created_at) VALUES (?,?)', id, new Date().toISOString());
}

export async function isFavorite(db: SQLiteDatabase, id: string) {
  return Boolean(await db.getFirstAsync('SELECT exercise_id FROM favorites WHERE exercise_id = ?', id));
}

export async function getSetting(db: SQLiteDatabase, key: string, fallback: string) {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? fallback;
}

export async function setSetting(db: SQLiteDatabase, key: string, value: string) {
  await db.runAsync('INSERT INTO settings(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', key, value);
}

export async function getPreferences(db: SQLiteDatabase) {
  const theme = (await getSetting(db, 'theme', 'system')) as ThemeMode;
  const unit = (await getSetting(db, 'weightUnit', 'kg')) as WeightUnit;
  return { theme, unit };
}

export async function createWorkout(db: SQLiteDatabase, name = 'Treino livre') {
  const active = await getActiveWorkoutId(db);
  if (active) return active;
  const result = await db.runAsync('INSERT INTO workouts(name,started_at) VALUES (?,?)', name, new Date().toISOString());
  return Number(result.lastInsertRowId);
}

export async function getActiveWorkoutId(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ id: number }>('SELECT id FROM workouts WHERE finished_at IS NULL ORDER BY id DESC LIMIT 1');
  return row?.id ?? null;
}

export async function addExerciseToWorkout(db: SQLiteDatabase, workoutId: number, exercise: Exercise) {
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM workout_exercises WHERE workout_id = ? AND exercise_id = ?', workoutId, exercise.id
  );
  if (existing) return existing.id;
  const pos = await db.getFirstAsync<{ maxPos: number }>('SELECT COALESCE(MAX(position),-1) maxPos FROM workout_exercises WHERE workout_id = ?', workoutId);
  const result = await db.runAsync(
    'INSERT INTO workout_exercises(workout_id,exercise_id,exercise_name,primary_muscle,position) VALUES (?,?,?,?,?)',
    workoutId, exercise.id, exercise.name, exercise.primaryMuscles[0] ?? 'other', (pos?.maxPos ?? -1) + 1
  );
  const id = Number(result.lastInsertRowId);
  for (let setNumber = 1; setNumber <= 3; setNumber++) {
    await db.runAsync(
      'INSERT INTO workout_sets(workout_exercise_id,set_number,reps,weight,completed,created_at) VALUES (?,?,?,?,?,?)',
      id, setNumber, 10, 0, 0, new Date().toISOString()
    );
  }
  return id;
}

export async function getActiveExercises(db: SQLiteDatabase, workoutId: number): Promise<ActiveExercise[]> {
  const exercises = await db.getAllAsync<any>(
    'SELECT * FROM workout_exercises WHERE workout_id = ? ORDER BY position,id', workoutId
  );
  const result: ActiveExercise[] = [];
  for (const e of exercises) {
    const sets = await db.getAllAsync<any>(
      'SELECT * FROM workout_sets WHERE workout_exercise_id = ? ORDER BY set_number', e.id
    );
    result.push({
      id: e.id,
      exerciseId: e.exercise_id,
      exerciseName: e.exercise_name,
      primaryMuscle: e.primary_muscle,
      sets: sets.map(s => ({
        id: s.id,
        workoutExerciseId: s.workout_exercise_id,
        setNumber: s.set_number,
        reps: s.reps,
        weight: s.weight,
        completed: Boolean(s.completed)
      }))
    });
  }
  return result;
}

export async function addSet(db: SQLiteDatabase, workoutExerciseId: number) {
  const row = await db.getFirstAsync<{ n: number }>('SELECT COALESCE(MAX(set_number),0)+1 n FROM workout_sets WHERE workout_exercise_id = ?', workoutExerciseId);
  await db.runAsync(
    'INSERT INTO workout_sets(workout_exercise_id,set_number,reps,weight,completed,created_at) VALUES (?,?,?,?,?,?)',
    workoutExerciseId, row?.n ?? 1, 10, 0, 0, new Date().toISOString()
  );
}

export async function updateSet(db: SQLiteDatabase, setId: number, reps: number, weight: number, completed: boolean) {
  await db.runAsync('UPDATE workout_sets SET reps=?, weight=?, completed=? WHERE id=?', reps, weight, completed ? 1 : 0, setId);
}

export async function removeWorkoutExercise(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM workout_exercises WHERE id = ?', id);
}

export async function finishWorkout(db: SQLiteDatabase, workoutId: number) {
  await db.runAsync('UPDATE workouts SET finished_at = ? WHERE id = ?', new Date().toISOString(), workoutId);
}

export async function dashboardStats(db: SQLiteDatabase) {
  const sessions = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) count FROM workouts WHERE finished_at IS NOT NULL');
  const volume = await db.getFirstAsync<{ volume: number }>(`
    SELECT COALESCE(SUM(ws.weight * ws.reps),0) volume
    FROM workout_sets ws
    JOIN workout_exercises we ON we.id = ws.workout_exercise_id
    JOIN workouts w ON w.id = we.workout_id
    WHERE ws.completed=1 AND w.finished_at IS NOT NULL AND datetime(w.finished_at) >= datetime('now','-7 days')
  `);
  const prs = await db.getFirstAsync<{ count: number }>(`
    SELECT COUNT(*) count FROM (
      SELECT we.exercise_id, MAX(ws.weight) maxw
      FROM workout_sets ws JOIN workout_exercises we ON we.id=ws.workout_exercise_id
      WHERE ws.completed=1 GROUP BY we.exercise_id HAVING maxw > 0
    )
  `);
  const last = await db.getFirstAsync<{ finished_at: string }>('SELECT finished_at FROM workouts WHERE finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 1');
  return { sessions: sessions?.count ?? 0, weeklyVolume: volume?.volume ?? 0, prs: prs?.count ?? 0, lastWorkout: last?.finished_at ?? null };
}

export async function recentWorkouts(db: SQLiteDatabase, limit = 5) {
  return db.getAllAsync<any>(`
    SELECT w.id,w.name,w.started_at,w.finished_at,COUNT(DISTINCT we.id) exercises,
      COALESCE(SUM(CASE WHEN ws.completed=1 THEN ws.weight*ws.reps ELSE 0 END),0) volume
    FROM workouts w
    LEFT JOIN workout_exercises we ON we.workout_id=w.id
    LEFT JOIN workout_sets ws ON ws.workout_exercise_id=we.id
    WHERE w.finished_at IS NOT NULL
    GROUP BY w.id ORDER BY w.finished_at DESC LIMIT ?`, limit);
}

export async function muscleProgress(db: SQLiteDatabase): Promise<MuscleProgress[]> {
  const rows = await db.getAllAsync<any>(`
    SELECT we.primary_muscle muscle, w.id workout_id, w.finished_at finished_at, MAX(ws.weight) value
    FROM workout_sets ws
    JOIN workout_exercises we ON we.id=ws.workout_exercise_id
    JOIN workouts w ON w.id=we.workout_id
    WHERE ws.completed=1 AND ws.weight > 0 AND w.finished_at IS NOT NULL
    GROUP BY we.primary_muscle, w.id
    ORDER BY we.primary_muscle ASC, datetime(w.finished_at) ASC, w.id ASC
  `);
  const grouped = new Map<string, any[]>();
  for (const row of rows) {
    const list = grouped.get(row.muscle) ?? [];
    list.push(row);
    grouped.set(row.muscle, list);
  }
  return [...grouped.entries()].map(([muscle, items]) => {
    const first = Number(items[0]?.value || 0);
    const current = Number(items[items.length - 1]?.value || 0);
    return { muscle, first, current, gainPct: first > 0 ? ((current - first) / first) * 100 : 0, sessions: items.length };
  }).sort((a, b) => b.current - a.current);
}

export async function muscleHistory(db: SQLiteDatabase, muscle: string): Promise<ProgressPoint[]> {
  const rows = await db.getAllAsync<any>(`
    SELECT date(w.finished_at) d, MAX(ws.weight) value
    FROM workout_sets ws
    JOIN workout_exercises we ON we.id=ws.workout_exercise_id
    JOIN workouts w ON w.id=we.workout_id
    WHERE ws.completed=1 AND ws.weight > 0 AND w.finished_at IS NOT NULL AND we.primary_muscle=?
    GROUP BY date(w.finished_at) ORDER BY d ASC LIMIT 16
  `, muscle);
  return rows.map(r => ({ label: r.d.slice(5).split('-').reverse().join('/'), value: Number(r.value), date: r.d }));
}

export async function exerciseHistory(db: SQLiteDatabase, exerciseId: string): Promise<ProgressPoint[]> {
  const rows = await db.getAllAsync<any>(`
    SELECT date(w.finished_at) d, MAX(ws.weight) value
    FROM workout_sets ws
    JOIN workout_exercises we ON we.id=ws.workout_exercise_id
    JOIN workouts w ON w.id=we.workout_id
    WHERE ws.completed=1 AND ws.weight > 0 AND w.finished_at IS NOT NULL AND we.exercise_id=?
    GROUP BY date(w.finished_at) ORDER BY d ASC LIMIT 16
  `, exerciseId);
  return rows.map(r => ({ label: r.d.slice(5).split('-').reverse().join('/'), value: Number(r.value), date: r.d }));
}
