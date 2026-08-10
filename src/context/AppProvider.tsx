import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, useColorScheme } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import type { ActiveExercise, Exercise, MuscleProgress, ProgressPoint, ThemeMode, WeightUnit } from '@/types';
import { dark, light, type AppColors } from '@/theme/colors';
import {
  addExerciseToWorkout,
  addSet as addSetRepo,
  countExercises,
  createWorkout,
  dashboardStats,
  exerciseHistory,
  finishWorkout as finishWorkoutRepo,
  getActiveExercises,
  getActiveWorkoutId,
  getExercise,
  getPreferences,
  isFavorite,
  muscleHistory,
  muscleProgress,
  recentWorkouts,
  removeWorkoutExercise,
  searchExercises,
  setSetting,
  toggleFavorite as toggleFavoriteRepo,
  updateSet as updateSetRepo
} from '@/db/repository';
import { ensureCatalog, syncCatalogFromGithub } from '@/services/exerciseCatalog';
import { checkGithubRelease, downloadAndroidUpdate, installOrOpenRelease, type ReleaseInfo } from '@/services/githubUpdate';

export type Dashboard = {
  sessions: number;
  weeklyVolume: number;
  prs: number;
  lastWorkout: string | null;
};

type AppContextValue = {
  colors: AppColors;
  isDark: boolean;
  themeMode: ThemeMode;
  weightUnit: WeightUnit;
  ready: boolean;
  catalogCount: number;
  syncingCatalog: boolean;
  dashboard: Dashboard;
  recent: any[];
  muscles: MuscleProgress[];
  activeWorkoutId: number | null;
  activeExercises: ActiveExercise[];
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setWeightUnit: (unit: WeightUnit) => Promise<void>;
  findExercises: (query?: string, muscle?: string, limit?: number) => Promise<Exercise[]>;
  findExercise: (id: string) => Promise<Exercise | null>;
  favorite: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<boolean>;
  syncCatalog: () => Promise<number>;
  startWorkout: () => Promise<number>;
  addExercise: (exercise: Exercise) => Promise<void>;
  addSet: (workoutExerciseId: number) => Promise<void>;
  updateSet: (setId: number, reps: number, weight: number, completed: boolean) => Promise<void>;
  removeExercise: (id: number) => Promise<void>;
  finishWorkout: () => Promise<void>;
  refreshActive: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  getMuscleHistory: (muscle: string) => Promise<ProgressPoint[]>;
  getExerciseHistory: (exerciseId: string) => Promise<ProgressPoint[]>;
  refreshDashboard: () => Promise<void>;
  releaseInfo: ReleaseInfo | null;
  checkingUpdate: boolean;
  downloadingUpdate: boolean;
  downloadedUpdateUri: string | null;
  checkUpdates: () => Promise<ReleaseInfo | null>;
  downloadUpdate: () => Promise<string | null>;
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
  const [syncingCatalog, setSyncingCatalog] = useState(false);
  const [dashboard, setDashboard] = useState<Dashboard>({ sessions: 0, weeklyVolume: 0, prs: 0, lastWorkout: null });
  const [recent, setRecent] = useState<any[]>([]);
  const [muscles, setMuscles] = useState<MuscleProgress[]>([]);
  const [activeWorkoutId, setActiveWorkoutId] = useState<number | null>(null);
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>([]);
  const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [downloadingUpdate, setDownloadingUpdate] = useState(false);
  const [downloadedUpdateUri, setDownloadedUpdateUri] = useState<string | null>(null);
  const promptedUpdateRef = useRef<string | null>(null);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const colors = isDark ? dark : light;

  const checkUpdates = useCallback(async () => {
    setCheckingUpdate(true);
    try {
      const info = await checkGithubRelease();
      setReleaseInfo(info);
      if (!info.hasUpdate) setDownloadedUpdateUri(null);
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
      setDownloadedUpdateUri(uri);
      return uri;
    } finally {
      setDownloadingUpdate(false);
    }
  }, []);

  const downloadUpdate = useCallback(async () => {
    if (!releaseInfo?.hasUpdate) return null;
    return prepareUpdate(releaseInfo);
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

      Alert.alert(
        'Atualização pronta',
        `NeoLift v${info.latestVersion} foi baixado. Você está ${info.newerReleaseCount} release${info.newerReleaseCount === 1 ? '' : 's'} atrás. Deseja atualizar agora?`,
        [
          { text: 'Depois', style: 'cancel' },
          {
            text: 'Atualizar agora',
            onPress: () => installOrOpenRelease(info, uri).catch(() => {
              Alert.alert('Atualização', 'Não foi possível abrir o instalador do Android. Verifique a permissão para instalar apps desta fonte.');
            })
          }
        ]
      );
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
    setMuscles(await muscleProgress(db));
  }, [db]);

  const refreshActive = useCallback(async () => {
    const id = await getActiveWorkoutId(db);
    setActiveWorkoutId(id);
    setActiveExercises(id ? await getActiveExercises(db, id) : []);
  }, [db]);

  useEffect(() => {
    (async () => {
      await ensureCatalog(db);
      const prefs = await getPreferences(db);
      setThemeState(prefs.theme);
      setWeightUnitState(prefs.unit);
      setCatalogCount(await countExercises(db));
      await Promise.all([refreshDashboard(), refreshProgress(), refreshActive()]);
      setReady(true);
      checkUpdates().then((info) => {
        if (info) handleStartupUpdate(info).catch(() => {});
      }).catch(() => {});
      if ((await countExercises(db)) < 500) {
        syncCatalogFromGithub(db).then(setCatalogCount).catch(() => {});
      }
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
    setWeightUnitState(unit);
    await setSetting(db, 'weightUnit', unit);
    await Promise.all([refreshDashboard(), refreshProgress(), refreshActive()]);
  }, [db, weightUnit, refreshDashboard, refreshProgress, refreshActive]);

  const findExercises = useCallback((query = '', muscle = 'all', limit = 80) => searchExercises(db, query, muscle, limit), [db]);
  const findExercise = useCallback((id: string) => getExercise(db, id), [db]);
  const favorite = useCallback((id: string) => isFavorite(db, id), [db]);
  const toggleFavorite = useCallback(async (id: string) => {
    await toggleFavoriteRepo(db, id);
    return isFavorite(db, id);
  }, [db]);

  const syncCatalog = useCallback(async () => {
    setSyncingCatalog(true);
    try {
      const count = await syncCatalogFromGithub(db);
      setCatalogCount(count);
      return count;
    } finally {
      setSyncingCatalog(false);
    }
  }, [db]);

  const startWorkout = useCallback(async () => {
    const id = await createWorkout(db);
    setActiveWorkoutId(id);
    setActiveExercises(await getActiveExercises(db, id));
    return id;
  }, [db]);

  const addExercise = useCallback(async (exercise: Exercise) => {
    const id = activeWorkoutId ?? await createWorkout(db);
    setActiveWorkoutId(id);
    await addExerciseToWorkout(db, id, exercise);
    setActiveExercises(await getActiveExercises(db, id));
  }, [activeWorkoutId, db]);

  const addSet = useCallback(async (workoutExerciseId: number) => {
    await addSetRepo(db, workoutExerciseId);
    await refreshActive();
  }, [db, refreshActive]);

  const updateSet = useCallback(async (setId: number, reps: number, weight: number, completed: boolean) => {
    await updateSetRepo(db, setId, reps, weight, completed);
    await refreshActive();
  }, [db, refreshActive]);

  const removeExercise = useCallback(async (id: number) => {
    await removeWorkoutExercise(db, id);
    await refreshActive();
  }, [db, refreshActive]);

  const finishWorkout = useCallback(async () => {
    if (!activeWorkoutId) return;
    await finishWorkoutRepo(db, activeWorkoutId);
    setActiveWorkoutId(null);
    setActiveExercises([]);
    await Promise.all([refreshDashboard(), refreshProgress()]);
  }, [activeWorkoutId, db, refreshDashboard, refreshProgress]);

  const getMuscleHistory = useCallback((muscle: string) => muscleHistory(db, muscle), [db]);
  const getExerciseHistory = useCallback((exerciseId: string) => exerciseHistory(db, exerciseId), [db]);

  const value = useMemo<AppContextValue>(() => ({
    colors, isDark, themeMode, weightUnit, ready, catalogCount, syncingCatalog,
    dashboard, recent, muscles, activeWorkoutId, activeExercises,
    setThemeMode, setWeightUnit, findExercises, findExercise, favorite, toggleFavorite,
    syncCatalog, startWorkout, addExercise, addSet, updateSet, removeExercise, finishWorkout,
    refreshActive, refreshProgress, getMuscleHistory, getExerciseHistory, refreshDashboard,
    releaseInfo, checkingUpdate, downloadingUpdate, downloadedUpdateUri, checkUpdates, downloadUpdate, installUpdate
  }), [
    colors, isDark, themeMode, weightUnit, ready, catalogCount, syncingCatalog, dashboard, recent,
    muscles, activeWorkoutId, activeExercises, setThemeMode, setWeightUnit, findExercises, findExercise,
    favorite, toggleFavorite, syncCatalog, startWorkout, addExercise, addSet, updateSet, removeExercise,
    finishWorkout, refreshActive, refreshProgress, getMuscleHistory, getExerciseHistory, refreshDashboard,
    releaseInfo, checkingUpdate, downloadingUpdate, downloadedUpdateUri, checkUpdates, downloadUpdate, installUpdate
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp precisa estar dentro de AppProvider');
  return value;
}
