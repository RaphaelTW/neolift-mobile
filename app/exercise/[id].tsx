import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Button, Card, Chip, Eyebrow, SectionTitle, Text } from '@/components/Ui';
import { ProgressChart } from '@/components/ProgressChart';
import { useApp } from '@/context/AppProvider';
import type { Exercise, ProgressPoint } from '@/types';
import { exerciseImageUrl } from '@/services/exerciseCatalog';
import { muscleLabel } from '@/utils/muscles';
import { chooseExerciseDemo } from '@/services/exerciseCoach';
import { showNeoDialog } from '@/services/dialog';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, findExercise, favorite, toggleFavorite, addExercise, getExerciseHistory, weightUnit } = useApp();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [fav, setFav] = useState(false);
  const [history, setHistory] = useState<ProgressPoint[]>([]);
  useEffect(() => { if (!id) return; Promise.all([findExercise(id), favorite(id), getExerciseHistory(id)]).then(([e,f,h]) => { setExercise(e); setFav(f); setHistory(h); }); }, [id, findExercise, favorite, getExerciseHistory]);
  if (!exercise) return <Screen><Text>Carregando exercício...</Text></Screen>;
  const image = exerciseImageUrl(exercise.images?.[0]);
  const add = async () => { await addExercise(exercise); showNeoDialog({ title: 'Adicionado ao treino', message: `${exercise.name} entrou no treino atual.`, icon: 'checkmark-circle-outline', actions: [{ label: 'Continuar', style: 'cancel' }, { label: 'Abrir treino', style: 'accent', onPress: () => router.push('/workout/session') }] }); };
  return <Screen>
    <View style={styles.top}><Pressable onPress={() => router.back()} style={[styles.iconButton,{ backgroundColor: colors.surface }]}><Ionicons name="arrow-back" size={22} color={colors.text} /></Pressable><Pressable onPress={async () => setFav(await toggleFavorite(exercise.id))} style={[styles.iconButton,{ backgroundColor: colors.surface }]}><Ionicons name={fav ? 'heart' : 'heart-outline'} size={22} color={fav ? colors.danger : colors.text} /></Pressable></View>
    <Image source={image ? { uri: image } : undefined} style={[styles.hero, { backgroundColor: colors.surfaceAlt }]} contentFit="contain" cachePolicy="disk" transition={180} />
    <Eyebrow>{exercise.category} // {exercise.level || 'all levels'}</Eyebrow><Text style={styles.title}>{exercise.name}</Text>
    <View style={styles.chips}><Chip label={muscleLabel(exercise.primaryMuscles[0] || 'geral')} selected /><Chip label={exercise.equipment || 'sem equipamento'} /><Chip label={exercise.mechanic || 'livre'} /></View>
    <View style={{ gap: 9 }}><Button title="Como fazer" onPress={() => chooseExerciseDemo(exercise, () => router.push(`/exercise/coach/${exercise.id}`))} /><Button title="Adicionar ao treino" onPress={add} kind="secondary" /></View>
    <SectionTitle title="Sua evolução" /><Card><View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}><Text style={{ fontWeight: '900' }}>Maior carga</Text><Text style={{ color: colors.muted, fontSize: 12 }}>{weightUnit}</Text></View><ProgressChart points={history} height={190} /></Card>
    <SectionTitle title="Execução" />{exercise.instructions.map((step, index) => <Card key={index} style={{ flexDirection: 'row', gap: 12 }}><View style={[styles.step,{ backgroundColor: colors.accentSoft }]}><Text style={{ color: colors.accent, fontWeight: '900' }}>{index + 1}</Text></View><Text style={{ flex: 1, lineHeight: 21, color: colors.muted }}>{step}</Text></Card>)}
    {exercise.secondaryMuscles.length ? <><SectionTitle title="Músculos secundários" /><Text style={{ color: colors.muted }}>{exercise.secondaryMuscles.map(muscleLabel).join(' · ')}</Text></> : null}
  </Screen>;
}
const styles = StyleSheet.create({ top: { flexDirection: 'row', justifyContent: 'space-between' }, iconButton: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, hero: { height: 250, borderRadius: 24 }, title: { fontSize: 29, lineHeight: 34, fontWeight: '900', letterSpacing: -1 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, step: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' } });
