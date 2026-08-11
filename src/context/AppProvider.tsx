import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import type {
  ActiveExercise, BodyMeasurement, BodyMeasurementInput, EffortRating, Exercise, ExerciseSource, LoadSuggestion,
  MuscleProgress, PlanDay, ProgressPoint, ThemeMode, UserProfile, WeightUnit
} from '@/types';
import { dark, light, type AppColors } from '@/theme/colors';
import {
  activeWorkoutName as activeWorkoutNameRepo,
  addBodyMeasurement,
  addExerciseToWorkout,
  addSet as addSetRepo,
  bodyMetricHistory,
  countExercises,
  countExercisesBySource,
  createWorkout,
  dashboardStats,
  exerciseHistory,
  finishWorkout as finishWorkoutRepo,
  getActiveExercises,
  getActiveWorkoutId,
  getExercise,
  getPreferences,
  getSetting,
  getUserProfile,
  isFavorite,
  latestBodyMeasurement,
  loadSuggestion,
  muscleHistory,
  muscleProgress,
  recentBodyMeasurements,
  recentWorkouts,
  removeWorkoutExercise,
  saveUserProfile,
  searchExercises,
  setExerciseEffort,
  setSetting,
  toggleFavorite as toggleFavoriteRepo,
  updateSet as updateSetRepo,
  workoutHistoryDetailed
} from '@/db/repository';
import { ensureCatalog, syncCatalogFromGithub } from '@/services/exerciseCatalog';
import { shouldRefreshWger, syncWgerCatalog, WGER_SYNC_SETTING } from '@/services/wgerCatalog';
import { checkGithubRelease, downloadAndroidUpdate, installOrOpenRelease, type ReleaseInfo } from '@/services/githubUpdate';
import { showNeoDialog } from '@/services/dialog';

export type Dashboard = {
  sessions: number;
  weeklyVolume: number;
  prs: number;
  lastWorkout: string | null;
};

type ProfileInput = Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>;
type CatalogSources = { free: number; wger: number; hybrid: number; total: number };

type AppContextValue = {
  colors: AppColors;
  isDark: boolean;
  themeMode: ThemeMode;
  weightUnit: WeightUnit;
  ready: boolean;
  catalogCount: number;
  catalogSources: CatalogSources;
  syncingCatalog: boolean;
  syncingWger: boolean;
  dashboard: Dashboard;
  recent: any[];
  muscles: MuscleProgress[];
  profile: UserProfile | null;
  latestMeasurement: BodyMeasurement | null;
  activeWorkoutId: number | null;
  activeWorkoutName: string;
  activeExercises: ActiveExercise[];
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setWeightUnit: (unit: WeightUnit) => Promise<void>;
  findExercises: (query?: string, muscle?: string, limit?: number, source?: 'all' | ExerciseSource) => Promise<Exercise[]>;
  findExercise: (id: string) => Promise<Exercise | null>;
  favorite: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<boolean>;
  syncCatalog: () => Promise<number>;
  syncWger: () => Promise<{ fetched: number; enriched: number; added: number; free: number; wger: number; hybrid: number; total: number }>;
  startWorkout: (name?: string) => Promise<number>;
  startPlannedWorkout: (day: PlanDay) => Promise<number>;
  addExercise: (exercise: Exercise) => Promise<void>;
  addSet: (workoutExerciseId: number) => Promise<void>;
  updateSet: (setId: number, reps: number, weight: number, completed: boolean) => Promise<void>;
  setEffort: (workoutExerciseId: number, effort: EffortRating) => Promise<void>;
  getLoadSuggestion: (exerciseId: string) => Promise<LoadSuggestion | null>;
  removeExercise: (id: number) => Promise<void>;
  finishWorkout: () => Promise<void>;
  refreshActive: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  getMuscleHistory: (muscle: string) => Promise<ProgressPoint[]>;
  getExerciseHistory: (exerciseId: string) => Promise<ProgressPoint[]>;
  getBodyHistory: (metric: 'weight' | 'neck' | 'chest' | 'waist' | 'hips' | 'leftArm' | 'rightArm' | 'leftThigh' | 'rightThigh' | 'leftCalf' | 'rightCalf') => Promise<ProgressPoint[]>;
  refreshDashboard: () => Promise<void>;
  saveProfile: (profile: ProfileInput) => Promise<void>;
  recordMeasurement: (measurement: BodyMeasurementInput) => Promise<void>;
  getMeasurements: (limit?: number) => Promise<BodyMeasurement[]>;
  getWorkoutHistory: (limit?: number) => Promise<any[]>;
  releaseInfo: ReleaseInfo | null;
  checkingUpdate: boolean;
  downloadingUpdate: boolean;
  downloadedUpdateUri: string | null;
  checkUpdates: () => Promise<ReleaseInfo | null>;
  downloadUpdate: (info?: ReleaseInfo) => Promise<string | null>;
  installUpdate: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const systemScheme = useColorScheme();
  const [ready, setReady] = useState(false);
  const [themeMode, setThemeState] = useState<ThemeMode>('system');
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>('kg');
  const [catalogCount, setCatalogCount] = useState(0);
  const [catalogSources, setCatalogSources] = useState<CatalogSources>({ free: 0, wger: 0, hybrid: 0, total: 0 });
  const [syncingCatalog, setSyncingCatalog] = useState(false);
  const [syncingWger, setSyncingWger] = useState(false);
  const [dashboard, setDashboard] = useState<Dashboard>({ sessions: 0, weeklyVolume: 0, prs: 0, lastWorkout: null });
  const [recent, setRecent] = useState<any[]>([]);
  const [muscles, setMuscles] = useState<MuscleProgress[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [latestMeasurementState, setLatestMeasurement] = useState<BodyMeasurement | null>(null);
  const [activeWorkoutId, setActiveWorkoutId] = useState<number | null>(null);
  const [activeWorkoutName, setActiveWorkoutName] = useState('Treino livre');
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>([]);
  const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [downloadingUpdate, setDownloadingUpdate] = useState(false);
  const [downloadedUpdate, setDownloadedUpdate] = useState<{ version: string; uri: string } | null>(null);
  const promptedUpdateRef = useRef<string | null>(null);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const colors = isDark ? dark : light;
  const downloadedUpdateUri = downloadedUpdate && releaseInfo && downloadedUpdate.version === releaseInfo.latestVersion
    ? downloadedUpdate.uri
    : null;

  const checkUpdates = useCallback(async () => {
    setCheckingUpdate(true);
    try {
      const info = await checkGithubRelease();
      setReleaseInfo(info);
      setDownloadedUpdate((downloaded) => downloaded?.version === info.latestVersion && info.hasUpdate
        ? downloaded
        : null);
      return info;
    } catch {
      return null;
    } finally {
      setCheckingUpdate(false);
    }
  }, []);

  const prepareUpdate = useCallback(async (info: ReleaseInfo) => {
    if (Platform.OS !== 'android' || !info.apkUrl) return null;
    setDownloadingUpdate(true);
    try {
      const uri = await downloadAndroidUpdate(info);
      setDownloadedUpdate({ version: info.latestVersion, uri });
      return uri;
    } finally {
      setDownloadingUpdate(false);
    }
  }, []);

  const downloadUpdate = useCallback(async (info?: ReleaseInfo) => {
    const target = info ?? releaseInfo;
    if (!target?.hasUpdate) return null;
    return prepareUpdate(target);
  }, [prepareUpdate, releaseInfo]);

  const installUpdate = useCallback(async () => {
    if (!releaseInfo?.hasUpdate) return;
    const uri = downloadedUpdateUri || await prepareUpdate(releaseInfo);
    await installOrOpenRelease(releaseInfo, uri || undefined);
  }, [downloadedUpdateUri, prepareUpdate, releaseInfo]);

  const handleStartupUpdate = useCallback(async (info: ReleaseInfo) => {
    if (Platform.OS !== 'android' || !info.hasUpdate || !info.apkUrl) return;
    if (promptedUpdateRef.current === info.latestVersion) return;
    promptedUpdateRef.current = info.latestVersion;
    try {
      const uri = await prepareUpdate(info);
      if (!uri) return;
      if (info.updateMode === 'forced') {
        await installOrOpenRelease(info, uri);
        return;
      }
      showNeoDialog({
        title: 'Atualização pronta',
        message: `NeoLift v${info.latestVersion} foi baixado. Você está ${info.newerReleaseCount} release${info.newerReleaseCount === 1 ? '' : 's'} atrás. Deseja atualizar agora?`,
        icon: 'cloud-download-outline',
        actions: [
          { label: 'Depois', style: 'cancel' },
          { label: 'Atualizar agora', style: 'accent', onPress: async () => {
            try {
              await installOrOpenRelease(info, uri);
            } catch {
              showNeoDialog({ title: 'Atualização', message: 'Não foi possível abrir o instalador do Android. Verifique a permissão para instalar apps desta fonte.', icon: 'warning-outline' });
            }
          } }
        ]
      });
    } catch {
      // Falhas de rede não impedem o uso offline do app.
    }
  }, [prepareUpdate]);

  const refreshDashboard = useCallback(async () => {
    const [stats, items] = await Promise.all([dashboardStats(db), recentWorkouts(db)]);
    setDashboard(stats);
    setRecent(items);
  }, [db]);

  const refreshProgress = useCallback(async () => {
    const [muscleItems, measurement] = await Promise.all([muscleProgress(db), latestBodyMeasurement(db)]);
    setMuscles(muscleItems);
    setLatestMeasurement(measurement);
  }, [db]);

  const refreshActive = useCallback(async () => {
    const id = await getActiveWorkoutId(db);
    setActiveWorkoutId(id);
    if (id) {
      const [items, name] = await Promise.all([getActiveExercises(db, id), activeWorkoutNameRepo(db, id)]);
      setActiveExercises(items);
      setActiveWorkoutName(name);
    } else {
      setActiveExercises([]);
      setActiveWorkoutName('Treino livre');
    }
  }, [db]);

  useEffect(() => {
    (async () => {
      await ensureCatalog(db);
      const [prefs, savedProfile, measurement, count, sources] = await Promise.all([
        getPreferences(db), getUserProfile(db), latestBodyMeasurement(db), countExercises(db), countExercisesBySource(db)
      ]);
      setThemeState(prefs.theme);
      setWeightUnitState(prefs.unit);
      setProfile(savedProfile);
      setLatestMeasurement(measurement);
      setCatalogCount(count);
      setCatalogSources(sources);
      await Promise.all([refreshDashboard(), refreshProgress(), refreshActive()]);
      setReady(true);
      checkUpdates().then((info) => {
        if (info) handleStartupUpdate(info).catch(() => {});
      }).catch(() => {});
      if (count < 500) syncCatalogFromGithub(db).then(async () => { const c = await countExercisesBySource(db); setCatalogCount(c.total); setCatalogSources(c); }).catch(() => {});

      // Wger é uma fonte pública opcional. A atualização acontece em segundo plano
      // no máximo uma vez a cada 7 dias, sem bloquear a abertura do app.
      getSetting(db, WGER_SYNC_SETTING, '').then(lastSync => {
        if (!shouldRefreshWger(lastSync)) return;
        syncWgerCatalog(db).then(async result => {
          await setSetting(db, WGER_SYNC_SETTING, new Date().toISOString());
          setCatalogCount(result.total);
          setCatalogSources({ free: result.free, wger: result.wger, hybrid: result.hybrid, total: result.total });
        }).catch(() => {});
      }).catch(() => {});
    })().catch(console.error);
  }, [db, refreshActive, refreshDashboard, refreshProgress, checkUpdates, handleStartupUpdate]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeState(mode);
    await setSetting(db, 'theme', mode);
  }, [db]);

  const setWeightUnit = useCallback(async (unit: WeightUnit) => {
    if (unit === weightUnit) return;
    const factor = weightUnit === 'kg' && unit === 'lb' ? 2.2046226218 : 1 / 2.2046226218;
    await db.runAsync('UPDATE workout_sets SET weight = ROUND(weight * ?, 2) WHERE weight > 0', factor);
    await db.runAsync('UPDATE body_measurements SET weight = ROUND(weight * ?, 2) WHERE weight > 0', factor);
    setWeightUnitState(unit);
    await setSetting(db, 'weightUnit', unit);
    await Promise.all([refreshDashboard(), refreshProgress(), refreshActive()]);
  }, [db, weightUnit, refreshDashboard, refreshProgress, refreshActive]);

  const findExercises = useCallback((query = '', muscle = 'all', limit = 80, source: 'all' | ExerciseSource = 'all') => searchExercises(db, query, muscle, limit, source), [db]);
  const findExercise = useCallback((id: string) => getExercise(db, id), [db]);
  const favorite = useCallback((id: string) => isFavorite(db, id), [db]);
  const toggleFavorite = useCallback(async (id: string) => {
    await toggleFavoriteRepo(db, id);
    return isFavorite(db, id);
  }, [db]);

  const syncCatalog = useCallback(async () => {
    setSyncingCatalog(true);
    try {
      await syncCatalogFromGithub(db);
      const counts = await countExercisesBySource(db);
      setCatalogCount(counts.total);
      setCatalogSources(counts);
      return counts.total;
    } finally {
      setSyncingCatalog(false);
    }
  }, [db]);

  const syncWger = useCallback(async () => {
    setSyncingWger(true);
    try {
      const result = await syncWgerCatalog(db);
      await setSetting(db, WGER_SYNC_SETTING, new Date().toISOString());
      setCatalogCount(result.total);
      setCatalogSources({ free: result.free, wger: result.wger, hybrid: result.hybrid, total: result.total });
      return result;
    } finally {
      setSyncingWger(false);
    }
  }, [db]);

  const startWorkout = useCallback(async (name = 'Treino livre') => {
    const id = await createWorkout(db, name);
    setActiveWorkoutId(id);
    await refreshActive();
    return id;
  }, [db, refreshActive]);

  const startPlannedWorkout = useCallback(async (day: PlanDay) => {
    const id = await createWorkout(db, day.name);
    for (const item of day.exercises) {
      const exercise = await getExercise(db, item.exerciseId);
      if (!exercise) continue;
      const reps = Math.round((item.minReps + item.maxReps) / 2);
      await addExerciseToWorkout(db, id, exercise, item.sets, reps);
    }
    setActiveWorkoutId(id);
    await refreshActive();
    return id;
  }, [db, refreshActive]);

  const addExercise = useCallback(async (exercise: Exercise) => {
    const id = activeWorkoutId ?? await createWorkout(db);
    setActiveWorkoutId(id);
    await addExerciseToWorkout(db, id, exercise);
    await refreshActive();
  }, [activeWorkoutId, db, refreshActive]);

  const addSet = useCallback(async (workoutExerciseId: number) => {
    await addSetRepo(db, workoutExerciseId);
    await refreshActive();
  }, [db, refreshActive]);

  const updateSet = useCallback(async (setId: number, reps: number, weight: number, completed: boolean) => {
    await updateSetRepo(db, setId, reps, weight, completed);
    await refreshActive();
  }, [db, refreshActive]);

  const setEffort = useCallback(async (workoutExerciseId: number, effort: EffortRating) => {
    await setExerciseEffort(db, workoutExerciseId, effort);
    await refreshActive();
  }, [db, refreshActive]);

  const getLoadSuggestion = useCallback((exerciseId: string) => loadSuggestion(db, exerciseId, weightUnit), [db, weightUnit]);

  const removeExercise = useCallback(async (id: number) => {
    await removeWorkoutExercise(db, id);
    await refreshActive();
  }, [db, refreshActive]);

  const finishWorkout = useCallback(async () => {
    if (!activeWorkoutId) return;
    await finishWorkoutRepo(db, activeWorkoutId);
    setActiveWorkoutId(null);
    setActiveWorkoutName('Treino livre');
    setActiveExercises([]);
    await Promise.all([refreshDashboard(), refreshProgress()]);
  }, [activeWorkoutId, db, refreshDashboard, refreshProgress]);

  const getMuscleHistory = useCallback((muscle: string) => muscleHistory(db, muscle), [db]);
  const getExerciseHistory = useCallback((exerciseId: string) => exerciseHistory(db, exerciseId), [db]);
  const getBodyHistory = useCallback((metric: Parameters<typeof bodyMetricHistory>[1]) => bodyMetricHistory(db, metric), [db]);

  const saveProfile = useCallback(async (input: ProfileInput) => {
    const saved = await saveUserProfile(db, input);
    setProfile(saved);
  }, [db]);

  const recordMeasurement = useCallback(async (input: BodyMeasurementInput) => {
    await addBodyMeasurement(db, input);
    setLatestMeasurement(await latestBodyMeasurement(db));
  }, [db]);

  const getMeasurements = useCallback((limit = 24) => recentBodyMeasurements(db, limit), [db]);
  const getWorkoutHistory = useCallback((limit = 20) => workoutHistoryDetailed(db, limit), [db]);

  const value = useMemo<AppContextValue>(() => ({
    colors, isDark, themeMode, weightUnit, ready, catalogCount, catalogSources, syncingCatalog, syncingWger,
    dashboard, recent, muscles, profile, latestMeasurement: latestMeasurementState,
    activeWorkoutId, activeWorkoutName, activeExercises,
    setThemeMode, setWeightUnit, findExercises, findExercise, favorite, toggleFavorite,
    syncCatalog, syncWger, startWorkout, startPlannedWorkout, addExercise, addSet, updateSet, setEffort, getLoadSuggestion,
    removeExercise, finishWorkout, refreshActive, refreshProgress, getMuscleHistory, getExerciseHistory,
    getBodyHistory, refreshDashboard, saveProfile, recordMeasurement, getMeasurements, getWorkoutHistory,
    releaseInfo, checkingUpdate, downloadingUpdate, downloadedUpdateUri, checkUpdates, downloadUpdate, installUpdate
  }), [
    colors, isDark, themeMode, weightUnit, ready, catalogCount, catalogSources, syncingCatalog, syncingWger, dashboard, recent, muscles,
    profile, latestMeasurementState, activeWorkoutId, activeWorkoutName, activeExercises, setThemeMode, setWeightUnit,
    findExercises, findExercise, favorite, toggleFavorite, syncCatalog, syncWger, startWorkout, startPlannedWorkout,
    addExercise, addSet, updateSet, setEffort, getLoadSuggestion, removeExercise, finishWorkout, refreshActive,
    refreshProgress, getMuscleHistory, getExerciseHistory, getBodyHistory, refreshDashboard, saveProfile,
    recordMeasurement, getMeasurements, getWorkoutHistory, releaseInfo, checkingUpdate, downloadingUpdate,
    downloadedUpdateUri, checkUpdates, downloadUpdate, installUpdate
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp precisa estar dentro de AppProvider');
  return value;
}
