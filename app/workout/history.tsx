import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Card, Eyebrow, Text } from '@/components/Ui';
import { useApp } from '@/context/AppProvider';
import { compactNumber, dateLong } from '@/utils/format';
import { muscleLabel } from '@/utils/muscles';

export default function WorkoutHistoryScreen() {
  const { colors, getWorkoutHistory, weightUnit } = useApp();
  const [items, setItems] = useState<any[]>([]);
  useFocusEffect(useCallback(() => { getWorkoutHistory(30).then(setItems); }, [getWorkoutHistory]));

  return <Screen>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={[styles.back,{ backgroundColor: colors.surface }]}><Ionicons name="chevron-back" size={23} color={colors.text} /></Pressable><View><Eyebrow>HISTORY // SESSIONS</Eyebrow><Text style={styles.title}>Histórico de treinos</Text></View></View>
    {items.length === 0 ? <Card><Text style={{ fontWeight: '900' }}>Nenhuma sessão concluída ainda.</Text><Text style={{ color: colors.muted, marginTop: 5 }}>Quando concluir um treino, ele aparece aqui com as cargas registradas.</Text></Card> : items.map(workout => <Card key={workout.id}>
      <View style={styles.top}><View style={{ flex: 1 }}><Text style={{ fontWeight: '900', fontSize: 18 }}>{workout.name}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>{dateLong(workout.finished_at)} · {workout.exercises} exercícios</Text></View><Text style={{ color: colors.accent, fontWeight: '900' }}>{compactNumber(workout.volume)} {weightUnit}</Text></View>
      <View style={[styles.separator,{ backgroundColor: colors.border }]} />
      <View style={{ gap: 9 }}>{workout.items.map((exercise: any, index: number) => <View key={`${workout.id}-${index}`} style={styles.row}><View style={[styles.dot,{ backgroundColor: colors.accent }]} /><View style={{ flex: 1 }}><Text style={{ fontWeight: '800', fontSize: 13 }}>{exercise.name}</Text><Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>{muscleLabel(exercise.muscle)} · {exercise.completed_sets} séries</Text></View><Text style={{ fontWeight: '900' }}>{exercise.max_weight > 0 ? `${compactNumber(exercise.max_weight)} ${weightUnit}` : '—'}</Text></View>)}</View>
    </Card>)}
  </Screen>;
}

const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, back: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 27, fontWeight: '900', marginTop: 3 }, top: { flexDirection: 'row', alignItems: 'center', gap: 12 }, separator: { height: 1, marginVertical: 12 }, row: { flexDirection: 'row', alignItems: 'center', gap: 8 }, dot: { width: 6, height: 6, borderRadius: 3 } });
