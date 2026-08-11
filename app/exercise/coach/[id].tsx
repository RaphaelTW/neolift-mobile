import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Button, Card, Eyebrow, SectionTitle, Text } from '@/components/Ui';
import { Exercise3D } from '@/components/Exercise3D';
import { useApp } from '@/context/AppProvider';
import type { Exercise } from '@/types';
import { coachProfile, openExerciseVideo, preferredExerciseVideo } from '@/services/exerciseCoach';
import { muscleLabel } from '@/utils/muscles';

export default function ExerciseCoachScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, findExercise } = useApp();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  useEffect(() => { if (id) findExercise(id).then(setExercise); }, [id, findExercise]);
  const profile = useMemo(() => exercise ? coachProfile(exercise) : null, [exercise]);
  if (!exercise || !profile) return <Screen><Text>Preparando demonstração 3D...</Text></Screen>;

  return <Screen contentContainerStyle={{ paddingBottom: 70 }}>
    <View style={styles.top}>
      <Pressable onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.surface }]}><Ionicons name="arrow-back" size={22} color={colors.text} /></Pressable>
      <View style={{ flex: 1 }}><Eyebrow>EXERCISE COACH // OFFLINE 3D</Eyebrow><Text style={styles.title} numberOfLines={2}>{exercise.name}</Text></View>
    </View>

    <Exercise3D exercise={exercise} />

    <Card style={{ borderColor: colors.accent }}>
      <View style={styles.infoHead}><Ionicons name="body-outline" size={21} color={colors.accent} /><View style={{ flex: 1 }}><Text style={{ fontWeight: '900' }}>{profile.label}</Text><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3 }}>{profile.cue}</Text></View></View>
      <View style={styles.muscles}><Text style={{ color: colors.accent, fontWeight: '900', fontSize: 11 }}>{muscleLabel(exercise.primaryMuscles[0] || 'geral').toUpperCase()}</Text>{exercise.secondaryMuscles.slice(0, 3).map(m => <Text key={m} style={{ color: colors.muted, fontSize: 11 }}>• {muscleLabel(m)}</Text>)}</View>
    </Card>

    <Button title={preferredExerciseVideo(exercise) ? 'Assistir vídeo Wger' : 'Procurar exemplo em vídeo'} onPress={() => preferredExerciseVideo(exercise) ? router.push(`/exercise/video/${exercise.id}`) : openExerciseVideo(exercise, () => {})} kind="secondary" />

    <SectionTitle title="Passo a passo" />
    {exercise.instructions.map((step, index) => <Card key={`${exercise.id}-${index}`} style={styles.stepCard}><View style={[styles.step, { backgroundColor: colors.accentSoft }]}><Text style={{ color: colors.accent, fontWeight: '900' }}>{index + 1}</Text></View><Text style={{ flex: 1, color: colors.muted, lineHeight: 20 }}>{step}</Text></Card>)}

    <Card><View style={styles.infoHead}><Ionicons name="shield-checkmark-outline" size={22} color={colors.accent} /><View style={{ flex: 1 }}><Text style={{ fontWeight: '900' }}>Use como referência visual</Text><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3 }}>O avatar representa a família biomecânica do movimento. Ajustes finos de banco, pegada e equipamento devem seguir o passo a passo específico deste exercício.</Text></View></View></Card>
  </Screen>;
}

const styles = StyleSheet.create({ top: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' }, iconButton: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 24, lineHeight: 28, fontWeight: '900', letterSpacing: -0.7, marginTop: 3 }, infoHead: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' }, muscles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }, stepCard: { flexDirection: 'row', gap: 12 }, step: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' } });
