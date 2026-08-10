import React, { useEffect, useMemo } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Button, Card, Eyebrow, SectionTitle, Text } from '@/components/Ui';
import { useApp } from '@/context/AppProvider';
import { buildMonthlyTrainingPlan, profileLabels } from '@/services/trainingPlan';
import type { PlanDay } from '@/types';

export default function WorkoutScreen() {
  const { colors, profile, ready, activeWorkoutId, activeWorkoutName, activeExercises, startWorkout, startPlannedWorkout } = useApp();
  useEffect(() => { if (ready && !profile) router.replace('/onboarding'); }, [ready, profile]);
  const plan = useMemo(() => profile ? buildMonthlyTrainingPlan(profile) : null, [profile]);
  const doneSets = activeExercises.flatMap(e => e.sets).filter(s => s.completed).length;
  const totalSets = activeExercises.flatMap(e => e.sets).length;

  const openFree = async () => { await startWorkout(); router.push('/workout/session'); };
  const startDay = async (day: PlanDay) => {
    if (activeWorkoutId) {
      return Alert.alert('Treino já em andamento', `Você já está fazendo “${activeWorkoutName}”. Conclua ou continue antes de iniciar outro plano.`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar', onPress: () => router.push('/workout/session') }
      ]);
    }
    await startPlannedWorkout(day);
    router.push('/workout/session');
  };

  return <Screen>
    <Eyebrow>PLAN // ADAPTIVE MONTH</Eyebrow>
    <Text style={styles.title}>Seu plano de treino</Text>
    {plan && profile ? <>
      <Card style={{ borderColor: colors.accent }}>
        <View style={styles.split}><View style={{ flex: 1 }}><Text style={{ color: colors.accent, fontWeight: '900', fontSize: 11 }}>{plan.monthLabel.toUpperCase()}</Text><Text style={{ fontSize: 20, fontWeight: '900', marginTop: 4 }}>{plan.weekLabel}</Text><Text style={{ color: colors.muted, lineHeight: 19, marginTop: 5 }}>{plan.guidance}</Text></View><View style={[styles.icon,{ backgroundColor: colors.accentSoft }]}><Ionicons name="calendar" size={28} color={colors.accent} /></View></View>
        <View style={[styles.rule,{ backgroundColor: colors.border }]} />
        <Text style={{ color: colors.muted, fontSize: 12 }}>{profileLabels.experience[profile.experience]} · {profileLabels.goal[profile.goal]} · {profile.trainingDays} dias por semana</Text>
      </Card>

      {activeWorkoutId ? <Pressable onPress={() => router.push('/workout/session')}><Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: colors.accent }}><Ionicons name="barbell" size={25} color={colors.accent} /><View style={{ flex: 1 }}><Text style={{ fontWeight: '900' }}>{activeWorkoutName}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>{doneSets}/{totalSets} séries concluídas</Text></View><Ionicons name="chevron-forward" size={20} color={colors.accent} /></Card></Pressable> : null}

      <SectionTitle title="Semana sugerida" />
      {plan.days.map((day, index) => <Card key={day.id}>
        <View style={styles.dayHead}><View style={[styles.dayNumber,{ backgroundColor: colors.accentSoft }]}><Text style={{ color: colors.accent, fontWeight: '900' }}>{index + 1}</Text></View><View style={{ flex: 1 }}><Text style={{ fontWeight: '900', fontSize: 18 }}>{day.name}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{day.focus}</Text></View><Pressable onPress={() => startDay(day)} style={[styles.play,{ backgroundColor: colors.accent }]}><Ionicons name="play" size={18} color="#fff" /></Pressable></View>
        <View style={{ gap: 8, marginTop: 12 }}>{day.exercises.map((exercise) => <View key={`${day.id}-${exercise.exerciseId}`} style={styles.exerciseRow}><View style={[styles.dot,{ backgroundColor: colors.accent }]} /><Text style={{ flex: 1, fontWeight: '700' }}>{exercise.name}</Text><Text style={{ color: colors.muted, fontSize: 11 }}>{exercise.sets}×{exercise.minReps}–{exercise.maxReps}</Text></View>)}</View>
      </Card>)}

      <Card><View style={styles.split}><View style={{ flex: 1 }}><Text style={{ fontWeight: '900' }}>Mudança mensal automática</Text><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 }}>A cada novo mês o NeoLift troca variações dos movimentos. Dentro do mês, as quatro semanas alternam base, volume, progressão e consolidação.</Text></View><Ionicons name="repeat" size={25} color={colors.accent} /></View></Card>
      <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 17 }}>As sugestões são para adultos saudáveis em contexto geral. Dor, lesão, gestação, doença crônica ou restrição médica exigem orientação profissional individual.</Text>
    </> : null}
    <Button title={activeWorkoutId ? 'Continuar treino atual' : 'Treino livre'} onPress={openFree} kind="secondary" />
  </Screen>;
}

const styles = StyleSheet.create({ title: { fontSize: 31, fontWeight: '900', letterSpacing: -1.1, marginTop: 5 }, split: { flexDirection: 'row', alignItems: 'center', gap: 12 }, icon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, rule: { height: 1, marginVertical: 13 }, dayHead: { flexDirection: 'row', alignItems: 'center', gap: 11 }, dayNumber: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, play: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, dot: { width: 6, height: 6, borderRadius: 3 } });
