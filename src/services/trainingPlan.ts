import type { FitnessGoal, PlanDay, PlanExercise, UserProfile, WeeklyTrainingPlan } from '@/types';

const EXERCISES = {
  squat: [
    ['Leg_Press', 'Leg Press'],
    ['Goblet_Squat', 'Goblet Squat'],
    ['Barbell_Squat', 'Barbell Squat'],
    ['Dumbbell_Lunges', 'Dumbbell Lunges']
  ],
  hinge: [
    ['Lying_Leg_Curls', 'Lying Leg Curls'],
    ['Romanian_Deadlift', 'Romanian Deadlift'],
    ['Hyperextensions_Back_Extensions', 'Hyperextensions'],
    ['Barbell_Hip_Thrust', 'Barbell Hip Thrust']
  ],
  chest: [
    ['Dumbbell_Bench_Press', 'Dumbbell Bench Press'],
    ['Barbell_Bench_Press_-_Medium_Grip', 'Barbell Bench Press'],
    ['Incline_Dumbbell_Press', 'Incline Dumbbell Press'],
    ['Pushups', 'Pushups']
  ],
  row: [
    ['Seated_Cable_Rows', 'Seated Cable Rows'],
    ['One-Arm_Dumbbell_Row', 'One-Arm Dumbbell Row'],
    ['Bent_Over_Two-Dumbbell_Row', 'Bent Over Dumbbell Row'],
    ['T-Bar_Row_with_Handle', 'T-Bar Row']
  ],
  pull: [
    ['Wide-Grip_Lat_Pulldown', 'Wide-Grip Lat Pulldown'],
    ['Close-Grip_Front_Lat_Pulldown', 'Close-Grip Lat Pulldown'],
    ['Pullups', 'Pullups'],
    ['One_Arm_Lat_Pulldown', 'One Arm Lat Pulldown']
  ],
  shoulder: [
    ['Dumbbell_Shoulder_Press', 'Dumbbell Shoulder Press'],
    ['Arnold_Dumbbell_Press', 'Arnold Dumbbell Press'],
    ['Machine_Shoulder_Military_Press', 'Machine Shoulder Press'],
    ['Side_Lateral_Raise', 'Side Lateral Raise']
  ],
  biceps: [
    ['Dumbbell_Bicep_Curl', 'Dumbbell Bicep Curl'],
    ['Hammer_Curls', 'Hammer Curls'],
    ['EZ-Bar_Curl', 'EZ-Bar Curl'],
    ['Cable_Hammer_Curls_-_Rope_Attachment', 'Cable Hammer Curl']
  ],
  triceps: [
    ['Triceps_Pushdown', 'Triceps Pushdown'],
    ['Triceps_Pushdown_-_Rope_Attachment', 'Rope Triceps Pushdown'],
    ['Dips_-_Triceps_Version', 'Triceps Dips'],
    ['Standing_Dumbbell_Triceps_Extension', 'Dumbbell Triceps Extension']
  ],
  calves: [
    ['Standing_Calf_Raises', 'Standing Calf Raises'],
    ['Seated_Calf_Raise', 'Seated Calf Raise'],
    ['Calf_Press_On_The_Leg_Press_Machine', 'Calf Press'],
    ['Donkey_Calf_Raises', 'Donkey Calf Raises']
  ],
  core: [
    ['Plank', 'Plank'],
    ['Crunches', 'Crunches'],
    ['Air_Bike', 'Air Bike'],
    ['Side_Bridge', 'Side Bridge']
  ],
  glutes: [
    ['Barbell_Hip_Thrust', 'Barbell Hip Thrust'],
    ['Barbell_Glute_Bridge', 'Barbell Glute Bridge'],
    ['Glute_Kickback', 'Glute Kickback'],
    ['Single_Leg_Glute_Bridge', 'Single Leg Glute Bridge']
  ]
} as const;

type Pool = keyof typeof EXERCISES;

const monthIndex = (date: Date) => date.getFullYear() * 12 + date.getMonth();
const monthRotation = (date: Date) => ((monthIndex(date) % 4) + 4) % 4;

function pick(pool: Pool, rotation: number, offset = 0) {
  const values = EXERCISES[pool];
  return values[(rotation + offset) % values.length];
}

function prescription(profile: UserProfile, week: number) {
  let baseSets = profile.experience === 'beginner' ? 2 : profile.experience === 'intermediate' ? 3 : 3;
  if (profile.age < 18 || profile.age >= 65) baseSets = Math.max(2, baseSets - 1);
  const reps = profile.goal === 'lose_fat' ? [10, 15] : [8, 12];
  const volumeWeek = week === 2 && profile.age >= 18 && profile.age < 65;
  const weekSets = volumeWeek ? baseSets + 1 : week === 4 ? Math.max(2, baseSets - 1) : baseSets;
  return { sets: weekSets, minReps: reps[0], maxReps: reps[1] };
}

function ex(pool: Pool, rotation: number, rx: ReturnType<typeof prescription>, offset = 0, note?: string): PlanExercise {
  const [exerciseId, name] = pick(pool, rotation, offset);
  return { exerciseId, name, sets: rx.sets, minReps: rx.minReps, maxReps: rx.maxReps, note };
}

function buildDays(profile: UserProfile, rotation: number, week: number): PlanDay[] {
  const rx = prescription(profile, week);
  const accessory = { ...rx, sets: Math.max(2, rx.sets - (profile.experience === 'advanced' ? 0 : 1)) };

  const fullA: PlanDay = { id: 'full-a', name: 'Full Body A', focus: 'Base completa', exercises: [
    ex('squat', rotation, rx), ex('chest', rotation, rx), ex('row', rotation, rx), ex('hinge', rotation, accessory), ex('core', rotation, accessory)
  ]};
  const fullB: PlanDay = { id: 'full-b', name: 'Full Body B', focus: 'Corpo inteiro + posterior', exercises: [
    ex('hinge', rotation, rx, 1), ex('pull', rotation, rx), ex('shoulder', rotation, accessory), ex('glutes', rotation, accessory), ex('calves', rotation, accessory)
  ]};
  const fullC: PlanDay = { id: 'full-c', name: 'Full Body C', focus: 'Volume equilibrado', exercises: [
    ex('squat', rotation, rx, 1), ex('chest', rotation, rx, 1), ex('pull', rotation, rx, 1), ex('biceps', rotation, accessory), ex('triceps', rotation, accessory), ex('core', rotation, accessory, 1)
  ]};

  const upperA: PlanDay = { id: 'upper-a', name: 'Upper A', focus: 'Peito + costas + braços', exercises: [
    ex('chest', rotation, rx), ex('row', rotation, rx), ex('shoulder', rotation, accessory), ex('pull', rotation, accessory), ex('biceps', rotation, accessory), ex('triceps', rotation, accessory)
  ]};
  const upperB: PlanDay = { id: 'upper-b', name: 'Upper B', focus: 'Costas + ombros + peito', exercises: [
    ex('pull', rotation, rx, 1), ex('chest', rotation, rx, 1), ex('row', rotation, rx, 1), ex('shoulder', rotation, accessory, 1), ex('biceps', rotation, accessory, 1), ex('triceps', rotation, accessory, 1)
  ]};
  const lowerA: PlanDay = { id: 'lower-a', name: 'Lower A', focus: 'Quadríceps + posterior', exercises: [
    ex('squat', rotation, rx), ex('hinge', rotation, rx), ex('glutes', rotation, accessory), ex('calves', rotation, accessory), ex('core', rotation, accessory)
  ]};
  const lowerB: PlanDay = { id: 'lower-b', name: 'Lower B', focus: 'Posterior + glúteos', exercises: [
    ex('hinge', rotation, rx, 1), ex('squat', rotation, rx, 1), ex('glutes', rotation, accessory, 1), ex('calves', rotation, accessory, 1), ex('core', rotation, accessory, 1)
  ]};
  const push: PlanDay = { id: 'push', name: 'Push', focus: 'Peito + ombros + tríceps', exercises: [
    ex('chest', rotation, rx), ex('chest', rotation, accessory, 1), ex('shoulder', rotation, rx), ex('shoulder', rotation, accessory, 3), ex('triceps', rotation, accessory)
  ]};
  const pull: PlanDay = { id: 'pull', name: 'Pull', focus: 'Costas + bíceps', exercises: [
    ex('pull', rotation, rx), ex('row', rotation, rx), ex('pull', rotation, accessory, 1), ex('row', rotation, accessory, 1), ex('biceps', rotation, accessory)
  ]};
  const legs: PlanDay = { id: 'legs', name: 'Legs', focus: 'Pernas completas', exercises: [
    ex('squat', rotation, rx), ex('hinge', rotation, rx), ex('glutes', rotation, accessory), ex('squat', rotation, accessory, 1), ex('calves', rotation, accessory), ex('core', rotation, accessory)
  ]};

  if (profile.trainingDays <= 2) return [fullA, fullB];
  if (profile.trainingDays === 3) return [fullA, fullB, fullC];
  if (profile.trainingDays === 4) return [upperA, lowerA, upperB, lowerB];
  if (profile.trainingDays === 5) return [push, pull, legs, upperA, lowerB];
  return [push, pull, legs, upperA, lowerB, fullC];
}

function weekOfMonth(date: Date) {
  return Math.min(4, Math.max(1, Math.ceil(date.getDate() / 7)));
}

export function buildMonthlyTrainingPlan(profile: UserProfile, date = new Date()): WeeklyTrainingPlan {
  const week = weekOfMonth(date);
  const rotation = monthRotation(date);
  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
  const weekGuidance: Record<number, { label: string; modifier: number; guidance: string }> = {
    1: { label: 'Semana 1 · Base', modifier: 1, guidance: 'Encontre cargas confortáveis, técnica consistente e termine as séries com margem.' },
    2: { label: 'Semana 2 · Volume', modifier: 1.12, guidance: 'Aumente uma série nos principais movimentos quando a recuperação estiver boa.' },
    3: { label: 'Semana 3 · Progressão', modifier: 1.05, guidance: 'Busque o topo da faixa de repetições. Se sobrar, use a sugestão de carga do histórico.' },
    4: { label: 'Semana 4 · Consolidação', modifier: 0.85, guidance: 'Reduza um pouco o volume e consolide execução. No próximo mês, o app troca variações de exercícios.' }
  };
  const current = weekGuidance[week];
  const ageGuidance = profile.age < 18
    ? ' Perfil adolescente: volume conservador e foco em técnica; supervisão qualificada é recomendada.'
    : profile.age >= 65
      ? ' Perfil 65+: volume inicial mais conservador; inclua equilíbrio e mobilidade conforme capacidade.'
      : '';

  return {
    monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    monthLabel,
    weekOfMonth: week,
    weekLabel: current.label,
    volumeModifier: current.modifier,
    guidance: `${current.guidance}${ageGuidance}`,
    days: buildDays(profile, rotation, week)
  };
}

export const profileLabels = {
  gender: { male: 'Homem', female: 'Mulher', prefer_not_to_say: 'Prefiro não informar' },
  experience: { beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Avançado / profissional' },
  goal: { lose_fat: 'Emagrecer', gain_muscle: 'Ganhar massa muscular', gain_weight: 'Ganhar peso e massa' }
} as const;
