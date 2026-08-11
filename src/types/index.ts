export type ThemeMode = 'system' | 'light' | 'dark';
export type WeightUnit = 'kg' | 'lb';
export type Gender = 'male' | 'female' | 'prefer_not_to_say';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type FitnessGoal = 'lose_fat' | 'gain_muscle' | 'gain_weight';
export type EffortRating = 'easy' | 'good' | 'hard';
export type ExerciseSource = 'free-exercise-db' | 'wger' | 'hybrid';

export type ExerciseMedia = {
  type: 'image' | 'video';
  url: string;
  source: 'free-exercise-db' | 'wger';
  isMain?: boolean;
  animated?: boolean;
  style?: string | null;
  width?: number | null;
  height?: number | null;
  durationSeconds?: number | null;
  codec?: string | null;
  license?: string | null;
  licenseUrl?: string | null;
  author?: string | null;
};

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
  videos?: string[];
  source?: ExerciseSource;
  sourceId?: string | null;
  sourceUrl?: string | null;
  license?: string | null;
  licenseUrl?: string | null;
  licenseAuthor?: string | null;
  media?: ExerciseMedia[];
};

export type UserProfile = {
  id: number;
  gender: Gender;
  age: number;
  experience: ExperienceLevel;
  goal: FitnessGoal;
  trainingDays: number;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BodyMeasurement = {
  id: number;
  recordedAt: string;
  weight: number;
  neck: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  leftArm: number | null;
  rightArm: number | null;
  leftThigh: number | null;
  rightThigh: number | null;
  leftCalf: number | null;
  rightCalf: number | null;
};

export type BodyMeasurementInput = Omit<BodyMeasurement, 'id' | 'recordedAt'>;

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
  effort: EffortRating | null;
  sets: WorkoutSet[];
};

export type ProgressPoint = { label: string; value: number; date: string };
export type MuscleProgress = { muscle: string; current: number; first: number; gainPct: number; sessions: number };

export type LoadSuggestion = {
  exerciseId: string;
  currentWeight: number;
  suggestedWeight: number;
  deltaPct: number;
  reason: string;
  confidence: 'low' | 'medium' | 'high';
};

export type PlanExercise = { exerciseId: string; name: string; sets: number; minReps: number; maxReps: number; note?: string };
export type PlanDay = { id: string; name: string; focus: string; exercises: PlanExercise[] };
export type WeeklyTrainingPlan = {
  monthKey: string;
  monthLabel: string;
  weekOfMonth: number;
  weekLabel: string;
  volumeModifier: number;
  guidance: string;
  days: PlanDay[];
};
