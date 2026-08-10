export const muscleLabel = (muscle: string) => ({
  abdominals: 'Abdômen', abductors: 'Abdutores', adductors: 'Adutores', biceps: 'Bíceps', calves: 'Panturrilhas',
  chest: 'Peitoral', forearms: 'Antebraços', glutes: 'Glúteos', hamstrings: 'Posteriores', lats: 'Dorsais',
  'lower back': 'Lombar', 'middle back': 'Costas', neck: 'Pescoço', quadriceps: 'Quadríceps', shoulders: 'Ombros',
  traps: 'Trapézio', triceps: 'Tríceps'
}[muscle] || muscle.replace(/\b\w/g, c => c.toUpperCase()));

export const MUSCLES = ['all','chest','lats','middle back','shoulders','biceps','triceps','forearms','abdominals','lower back','glutes','quadriceps','hamstrings','calves','adductors','abductors','traps','neck'];
