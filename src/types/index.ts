export type ThemeMode = 'system' | 'light' | 'dark';
export type WeightUnit = 'kg' | 'lb';

export type Exercise = {
  id: string;
  name: string;
  force: string | null;
  level: string | null;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
};

export type WorkoutSet = {
  id: number;
  workoutExerciseId: number;
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
};

export type ActiveExercise = {
  id: number;
  exerciseId: string;
  exerciseName: string;
  primaryMuscle: string;
  sets: WorkoutSet[];
};

export type ProgressPoint = {
  label: string;
  value: number;
  date: string;
};

export type MuscleProgress = {
  muscle: string;
  current: number;
  first: number;
  gainPct: number;
  sessions: number;
};
