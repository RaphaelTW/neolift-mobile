import type { SQLiteDatabase } from 'expo-sqlite';
import type { ActiveExercise, BodyMeasurement, BodyMeasurementInput, EffortRating, Exercise, ExerciseSource, LoadSuggestion, MuscleProgress, ProgressPoint, ThemeMode, UserProfile, WeightUnit } from '@/types';

const jsonArray = <T = any>(value: any): T[] => {
  try { return Array.isArray(value) ? value : JSON.parse(value || '[]'); } catch { return []; }
};

const parseExerciseRow = (row: any): Exercise => ({
  id: row.id,
  name: row.name,
  force: row.force,
  level: row.level,
  mechanic: row.mechanic,
  equipment: row.equipment,
  primaryMuscles: jsonArray<string>(row.primary_muscles),
  secondaryMuscles: jsonArray<string>(row.secondary_muscles),
  instructions: jsonArray<string>(row.instructions),
  category: row.category,
  images: jsonArray<string>(row.images),
  videos: jsonArray<string>(row.videos),
  source: (row.source || 'free-exercise-db') as ExerciseSource,
  sourceId: row.source_id ?? null,
  sourceUrl: row.source_url ?? null,
  license: row.license ?? null,
  licenseUrl: row.license_url ?? null,
  licenseAuthor: row.license_author ?? null,
  media: jsonArray(row.media)
});

export async function upsertExercises(db: SQLiteDatabase, exercises: Exercise[]) {
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    for (const e of exercises) {
      await db.runAsync(
        `INSERT INTO exercise_catalog
          (id,name,force,level,mechanic,equipment,primary_muscles,secondary_muscles,instructions,category,images,videos,source,source_id,source_url,license,license_url,license_author,media,synced_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(id) DO UPDATE SET
          name=excluded.name, force=excluded.force, level=excluded.level, mechanic=excluded.mechanic,
          equipment=excluded.equipment, primary_muscles=excluded.primary_muscles,
          secondary_muscles=excluded.secondary_muscles, instructions=excluded.instructions,
          category=excluded.category, images=excluded.images, videos=excluded.videos,
          source=excluded.source, source_id=excluded.source_id, source_url=excluded.source_url,
          license=excluded.license, license_url=excluded.license_url, license_author=excluded.license_author,
          media=excluded.media, synced_at=excluded.synced_at`,
        e.id, e.name, e.force, e.level, e.mechanic, e.equipment,
        JSON.stringify(e.primaryMuscles), JSON.stringify(e.secondaryMuscles),
        JSON.stringify(e.instructions), e.category, JSON.stringify(e.images), JSON.stringify(e.videos ?? []),
        e.source ?? 'free-exercise-db', e.sourceId ?? null, e.sourceUrl ?? null,
        e.license ?? null, e.licenseUrl ?? null, e.licenseAuthor ?? null, JSON.stringify(e.media ?? []), now
      );
    }
  });
}

export async function countExercises(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM exercise_catalog');
  return row?.count ?? 0;
}

export async function countExercisesBySource(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<{ source: string; count: number }>('SELECT source, COUNT(*) count FROM exercise_catalog GROUP BY source');
  const out = { free: 0, wger: 0, hybrid: 0, total: 0 };
  for (const row of rows) {
    const count = Number(row.count || 0);
    out.total += count;
    if (row.source === 'wger') out.wger += count;
    else if (row.source === 'hybrid') out.hybrid += count;
    else out.free += count;
  }
  return out;
}

export async function allExercises(db: SQLiteDatabase): Promise<Exercise[]> {
  const rows = await db.getAllAsync<any>('SELECT * FROM exercise_catalog ORDER BY name ASC');
  return rows.map(parseExerciseRow);
}

export async function searchExercises(db: SQLiteDatabase, query = '', muscle = 'all', limit = 80, source: 'all' | ExerciseSource = 'all') {
  const q = `%${query.trim()}%`;
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM exercise_catalog
     WHERE (? = '' OR name LIKE ? OR equipment LIKE ?)
       AND (? = 'all' OR primary_muscles LIKE ?)
       AND (? = 'all' OR source = ? OR (? = 'wger' AND source = 'hybrid') OR (? = 'free-exercise-db' AND source = 'hybrid'))
     ORDER BY name ASC LIMIT ?`,
    query.trim(), q, q, muscle, `%\"${muscle}\"%`, source, source, source, source, limit
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

export async function addExerciseToWorkout(db: SQLiteDatabase, workoutId: number, exercise: Exercise, setCount = 3, defaultReps = 10) {
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
  for (let setNumber = 1; setNumber <= setCount; setNumber++) {
    await db.runAsync(
      'INSERT INTO workout_sets(workout_exercise_id,set_number,reps,weight,completed,created_at) VALUES (?,?,?,?,?,?)',
      id, setNumber, defaultReps, 0, 0, new Date().toISOString()
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
    const feedback = await db.getFirstAsync<{ effort: EffortRating }>('SELECT effort FROM workout_exercise_feedback WHERE workout_exercise_id = ?', e.id);
    result.push({
      id: e.id,
      exerciseId: e.exercise_id,
      exerciseName: e.exercise_name,
      primaryMuscle: e.primary_muscle,
      effort: feedback?.effort ?? null,
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

const parseProfile = (row: any): UserProfile => ({
  id: Number(row.id),
  gender: row.gender,
  age: Number(row.age),
  experience: row.experience,
  goal: row.goal,
  trainingDays: Number(row.training_days),
  onboardingCompleted: Boolean(row.onboarding_completed),
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const parseMeasurement = (row: any): BodyMeasurement => ({
  id: Number(row.id),
  recordedAt: row.recorded_at,
  weight: Number(row.weight),
  neck: row.neck == null ? null : Number(row.neck),
  chest: row.chest == null ? null : Number(row.chest),
  waist: row.waist == null ? null : Number(row.waist),
  hips: row.hips == null ? null : Number(row.hips),
  leftArm: row.left_arm == null ? null : Number(row.left_arm),
  rightArm: row.right_arm == null ? null : Number(row.right_arm),
  leftThigh: row.left_thigh == null ? null : Number(row.left_thigh),
  rightThigh: row.right_thigh == null ? null : Number(row.right_thigh),
  leftCalf: row.left_calf == null ? null : Number(row.left_calf),
  rightCalf: row.right_calf == null ? null : Number(row.right_calf)
});

export async function getUserProfile(db: SQLiteDatabase): Promise<UserProfile | null> {
  const row = await db.getFirstAsync<any>('SELECT * FROM user_profile WHERE id=1');
  return row ? parseProfile(row) : null;
}

export async function saveUserProfile(db: SQLiteDatabase, profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO user_profile(id,gender,age,experience,goal,training_days,onboarding_completed,created_at,updated_at)
     VALUES (1,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET gender=excluded.gender, age=excluded.age, experience=excluded.experience,
       goal=excluded.goal, training_days=excluded.training_days, onboarding_completed=excluded.onboarding_completed,
       updated_at=excluded.updated_at`,
    profile.gender, profile.age, profile.experience, profile.goal, profile.trainingDays,
    profile.onboardingCompleted ? 1 : 0, now, now
  );
  return getUserProfile(db);
}

export async function addBodyMeasurement(db: SQLiteDatabase, input: BodyMeasurementInput) {
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO body_measurements(recorded_at,weight,neck,chest,waist,hips,left_arm,right_arm,left_thigh,right_thigh,left_calf,right_calf)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    now, input.weight, input.neck, input.chest, input.waist, input.hips, input.leftArm, input.rightArm,
    input.leftThigh, input.rightThigh, input.leftCalf, input.rightCalf
  );
  return Number(result.lastInsertRowId);
}

export async function latestBodyMeasurement(db: SQLiteDatabase): Promise<BodyMeasurement | null> {
  const row = await db.getFirstAsync<any>('SELECT * FROM body_measurements ORDER BY datetime(recorded_at) DESC, id DESC LIMIT 1');
  return row ? parseMeasurement(row) : null;
}

export async function recentBodyMeasurements(db: SQLiteDatabase, limit = 24): Promise<BodyMeasurement[]> {
  const rows = await db.getAllAsync<any>('SELECT * FROM body_measurements ORDER BY datetime(recorded_at) DESC, id DESC LIMIT ?', limit);
  return rows.map(parseMeasurement);
}

const metricColumns: Record<string, string> = {
  weight: 'weight', neck: 'neck', chest: 'chest', waist: 'waist', hips: 'hips',
  leftArm: 'left_arm', rightArm: 'right_arm', leftThigh: 'left_thigh', rightThigh: 'right_thigh',
  leftCalf: 'left_calf', rightCalf: 'right_calf'
};

export async function bodyMetricHistory(db: SQLiteDatabase, metric: keyof typeof metricColumns, limit = 24): Promise<ProgressPoint[]> {
  const column = metricColumns[metric];
  const rows = await db.getAllAsync<any>(
    `SELECT date(recorded_at) d, ${column} value FROM body_measurements
     WHERE ${column} IS NOT NULL AND ${column} > 0 ORDER BY datetime(recorded_at) ASC, id ASC LIMIT ?`, limit
  );
  return rows.map((row) => ({ label: row.d.slice(5).split('-').reverse().join('/'), value: Number(row.value), date: row.d }));
}

export async function setExerciseEffort(db: SQLiteDatabase, workoutExerciseId: number, effort: EffortRating) {
  await db.runAsync(
    `INSERT INTO workout_exercise_feedback(workout_exercise_id,effort,updated_at) VALUES (?,?,?)
     ON CONFLICT(workout_exercise_id) DO UPDATE SET effort=excluded.effort, updated_at=excluded.updated_at`,
    workoutExerciseId, effort, new Date().toISOString()
  );
}

function roundLoad(value: number, unit: WeightUnit) {
  const step = unit === 'kg' ? 0.5 : 1;
  return Math.max(0, Math.round(value / step) * step);
}

export async function loadSuggestion(db: SQLiteDatabase, exerciseId: string, unit: WeightUnit): Promise<LoadSuggestion | null> {
  const rows = await db.getAllAsync<any>(`
    SELECT we.id, w.finished_at, MAX(ws.weight) max_weight,
      SUM(CASE WHEN ws.completed=1 THEN 1 ELSE 0 END) completed_sets,
      wf.effort
    FROM workout_exercises we
    JOIN workouts w ON w.id=we.workout_id
    JOIN workout_sets ws ON ws.workout_exercise_id=we.id
    LEFT JOIN workout_exercise_feedback wf ON wf.workout_exercise_id=we.id
    WHERE we.exercise_id=? AND w.finished_at IS NOT NULL AND ws.completed=1 AND ws.weight>0
    GROUP BY we.id ORDER BY datetime(w.finished_at) DESC, we.id DESC LIMIT 2
  `, exerciseId);

  if (!rows.length) return null;
  const current = Number(rows[0].max_weight || 0);
  if (current <= 0) return null;
  const latestEffort = rows[0].effort as EffortRating | null;
  const previousEffort = rows[1]?.effort as EffortRating | null;

  let deltaPct = 0;
  let confidence: LoadSuggestion['confidence'] = 'low';
  let reason = 'Mantenha a carga e priorize técnica e amplitude confortáveis.';

  if (latestEffort === 'hard') {
    deltaPct = -5;
    confidence = 'medium';
    reason = 'A última sessão foi marcada como pesada. Uma pequena redução pode ajudar a recuperar técnica e repetições.';
  } else if (latestEffort === 'easy' && previousEffort === 'easy') {
    deltaPct = 5;
    confidence = 'high';
    reason = 'Duas sessões seguidas foram marcadas como confortáveis. O app sugere um aumento conservador.';
  } else if (latestEffort === 'easy') {
    deltaPct = 2.5;
    confidence = 'medium';
    reason = 'A última sessão teve boa sobra. O app sugere um pequeno aumento, sem obrigar a mudança.';
  } else if (latestEffort === 'good') {
    deltaPct = 0;
    confidence = 'medium';
    reason = 'A carga parece adequada. Repita e tente melhorar repetições ou execução antes de aumentar.';
  }

  return {
    exerciseId,
    currentWeight: current,
    suggestedWeight: roundLoad(current * (1 + deltaPct / 100), unit),
    deltaPct,
    reason,
    confidence
  };
}

export async function activeWorkoutName(db: SQLiteDatabase, workoutId: number) {
  const row = await db.getFirstAsync<{ name: string }>('SELECT name FROM workouts WHERE id=?', workoutId);
  return row?.name ?? 'Treino livre';
}

export async function workoutHistoryDetailed(db: SQLiteDatabase, limit = 20) {
  const workouts = await db.getAllAsync<any>(`
    SELECT w.id,w.name,w.started_at,w.finished_at,
      COUNT(DISTINCT we.id) exercises,
      COALESCE(SUM(CASE WHEN ws.completed=1 THEN ws.weight*ws.reps ELSE 0 END),0) volume
    FROM workouts w
    LEFT JOIN workout_exercises we ON we.workout_id=w.id
    LEFT JOIN workout_sets ws ON ws.workout_exercise_id=we.id
    WHERE w.finished_at IS NOT NULL
    GROUP BY w.id ORDER BY datetime(w.finished_at) DESC LIMIT ?`, limit);

  for (const workout of workouts) {
    workout.items = await db.getAllAsync<any>(`
      SELECT we.exercise_name name, we.primary_muscle muscle, MAX(ws.weight) max_weight,
        SUM(CASE WHEN ws.completed=1 THEN 1 ELSE 0 END) completed_sets
      FROM workout_exercises we LEFT JOIN workout_sets ws ON ws.workout_exercise_id=we.id
      WHERE we.workout_id=? GROUP BY we.id ORDER BY we.position,we.id`, workout.id);
  }
  return workouts;
}
