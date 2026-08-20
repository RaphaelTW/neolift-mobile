import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Button, Card, Chip, Eyebrow, Text } from '@/components/Ui';
import { ExerciseCard } from '@/components/ExerciseCard';
import { ExerciseImage } from '@/components/ExerciseImage';
import { useApp } from '@/context/AppProvider';
import type { ActiveExercise, EffortRating, Exercise, LoadSuggestion, WorkoutSet } from '@/types';
import { muscleLabel } from '@/utils/muscles';
import { compactNumber } from '@/utils/format';
import { chooseExerciseDemo, exerciseImageGallery } from '@/services/exerciseCoach';
import { showNeoDialog } from '@/services/dialog';

function SetRow({ set, unit, onSave }: { set: WorkoutSet; unit: string; onSave: (reps: number, weight: number, completed: boolean) => Promise<void> }) {
  const { colors } = useApp();
  const [reps, setReps] = useState(String(set.reps));
  const [weight, setWeight] = useState(String(set.weight || ''));
  useEffect(() => { setReps(String(set.reps)); setWeight(String(set.weight || '')); }, [set.reps, set.weight]);
  const values = () => ({ reps: Math.max(0, Number(reps.replace(',', '.')) || 0), weight: Math.max(0, Number(weight.replace(',', '.')) || 0) });
  const persist = async () => { const v = values(); await onSave(v.reps, v.weight, set.completed); };
  const toggle = async () => { const v = values(); await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); await onSave(v.reps, v.weight, !set.completed); };
  return <View style={[styles.setRow, set.completed && { backgroundColor: colors.accentSoft }]}>
    <Text style={{ width: 28, fontWeight: '900', color: set.completed ? colors.accent : colors.muted }}>{set.setNumber}</Text>
    <TextInput value={weight} onChangeText={setWeight} onBlur={persist} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.muted} style={[styles.field,{ color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} />
    <Text style={{ color: colors.muted, fontSize: 11, width: 22 }}>{unit}</Text>
    <TextInput value={reps} onChangeText={setReps} onBlur={persist} keyboardType="number-pad" placeholder="10" placeholderTextColor={colors.muted} style={[styles.field,{ color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} />
    <Pressable onPress={toggle} style={[styles.check,{ borderColor: set.completed ? colors.accent : colors.border, backgroundColor: set.completed ? colors.accent : colors.surface }]}><Ionicons name="checkmark" size={18} color={set.completed ? '#fff' : colors.muted} /></Pressable>
  </View>;
}

function ExerciseBlock({ item }: { item: ActiveExercise }) {
  const { colors, weightUnit, addSet, updateSet, removeExercise, setEffort, getLoadSuggestion, findExercise } = useApp();
  const [suggestion, setSuggestion] = useState<LoadSuggestion | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  useEffect(() => { getLoadSuggestion(item.exerciseId).then(setSuggestion); }, [item.exerciseId, getLoadSuggestion]);
  useEffect(() => {
    let active = true;
    findExercise(item.exerciseId).then(result => { if (active) setExercise(result); });
    return () => { active = false; };
  }, [item.exerciseId, findExercise]);
  const completed = item.sets.some(set => set.completed);
  const effortLabels: Record<EffortRating,string> = { easy: 'Sobrou', good: 'Ideal', hard: 'Pesou' };

  const applySuggestion = async () => {
    if (!suggestion) return;
    for (const set of item.sets) {
      if (!set.completed) await updateSet(set.id, set.reps, suggestion.suggestedWeight, false);
    }
    await Haptics.selectionAsync().catch(() => {});
  };

  const exerciseIdentity = exercise ?? { name: item.exerciseName, primaryMuscles: [item.primaryMuscle] };

  return <Card style={{ marginTop: 12 }}>
    <View style={styles.exerciseHeader}><ExerciseImage exercise={exerciseIdentity} path={exercise ? exerciseImageGallery(exercise)[0] : null} style={styles.workoutImage} compact /><View style={{ flex: 1 }}><Text style={{ fontSize: 17, fontWeight: '900' }}>{item.exerciseName}</Text><Text style={{ color: colors.accent, fontSize: 11, fontWeight: '800', marginTop: 3 }}>{muscleLabel(item.primaryMuscle).toUpperCase()}</Text></View><Pressable onPress={() => showNeoDialog({ title: 'Remover exercício?', message: item.exerciseName, icon: 'trash-outline', actions: [{ label: 'Cancelar', style: 'cancel' }, { label: 'Remover', style: 'danger', onPress: () => removeExercise(item.id) }] })}><Ionicons name="trash-outline" size={20} color={colors.muted} /></Pressable></View>

    <Pressable onPress={() => { if (exercise) chooseExerciseDemo(exercise, () => router.push(`/exercise/coach/${exercise.id}`), () => router.push(`/exercise/video/${exercise.id}`)); }} style={[styles.coachButton, { borderColor: colors.accent, backgroundColor: colors.accentSoft }]}><Ionicons name="body-outline" size={18} color={colors.accent} /><Text style={{ color: colors.accent, fontWeight: '900', fontSize: 12 }}>COMO FAZER</Text><Ionicons name="chevron-forward" size={16} color={colors.accent} /></Pressable>

    {suggestion ? <View style={[styles.suggestion,{ backgroundColor: colors.accentSoft, borderColor: colors.accent }]}>
      <Ionicons name="sparkles" size={19} color={colors.accent} />
      <View style={{ flex: 1 }}><Text style={{ fontWeight: '900', color: colors.accent }}>Sugestão: {compactNumber(suggestion.suggestedWeight)} {weightUnit}</Text><Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 2 }}>{suggestion.reason}</Text></View>
      <Pressable onPress={applySuggestion} style={[styles.apply,{ backgroundColor: colors.accent }]}><Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>USAR</Text></Pressable>
    </View> : <View style={[styles.firstLoad,{ borderColor: colors.border }]}><Ionicons name="information-circle-outline" size={18} color={colors.muted} /><Text style={{ flex: 1, color: colors.muted, fontSize: 11, lineHeight: 16 }}>Primeira referência deste exercício: escolha uma carga confortável e priorize a execução. Depois o histórico passa a sugerir ajustes.</Text></View>}

    <View style={styles.labels}><Text style={{ width: 28, color: colors.muted, fontSize: 10 }}>SÉRIE</Text><Text style={{ width: 72, color: colors.muted, fontSize: 10 }}>CARGA</Text><View style={{ width: 22 }} /><Text style={{ width: 72, color: colors.muted, fontSize: 10 }}>REPS</Text><Text style={{ width: 42, textAlign: 'center', color: colors.muted, fontSize: 10 }}>OK</Text></View>
    {item.sets.map(set => <SetRow key={set.id} set={set} unit={weightUnit} onSave={(reps, weight, done) => updateSet(set.id, reps, weight, done)} />)}
    <Pressable onPress={() => addSet(item.id)} style={{ paddingVertical: 10, alignItems: 'center' }}><Text style={{ color: colors.accent, fontWeight: '900' }}>+ Adicionar série</Text></Pressable>

    {completed ? <View style={{ marginTop: 5 }}><Text style={{ color: colors.muted, fontSize: 10, fontWeight: '800', marginBottom: 7 }}>COMO ESSA CARGA PARECEU?</Text><View style={{ flexDirection: 'row', gap: 7 }}>{(['easy','good','hard'] as EffortRating[]).map(effort => <Chip key={effort} label={effortLabels[effort]} selected={item.effort === effort} onPress={() => setEffort(item.id, effort)} />)}</View></View> : null}
  </Card>;
}

export default function SessionScreen() {
  const { colors, activeWorkoutId, activeWorkoutName, activeExercises, startWorkout, refreshActive, finishWorkout, findExercises, addExercise } = useApp();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Exercise[]>([]);
  useEffect(() => { if (!activeWorkoutId) startWorkout(); }, [activeWorkoutId, startWorkout]);
  useFocusEffect(useCallback(() => { refreshActive(); }, [refreshActive]));
  useEffect(() => { if (!pickerOpen) return; const t = setTimeout(() => findExercises(query, 'all', 50).then(setResults), 100); return () => clearTimeout(t); }, [pickerOpen, query, findExercises]);
  const complete = async () => {
    if (activeExercises.length === 0) { showNeoDialog({ title: 'Treino vazio', message: 'Adicione pelo menos um exercício antes de concluir.', icon: 'barbell-outline' }); return; }
    const missingEffort = activeExercises.some(item => item.sets.some(set => set.completed) && !item.effort);
    showNeoDialog({ title: 'Concluir treino?', message: missingEffort ? 'Você pode concluir agora. Para melhorar as sugestões de carga, marque “Sobrou”, “Ideal” ou “Pesou” nos exercícios executados.' : 'As séries concluídas serão usadas nos gráficos e nas próximas sugestões de carga.', icon: 'checkmark-done-outline', actions: [{ label: 'Cancelar', style: 'cancel' }, { label: 'Concluir treino', style: 'accent', onPress: async () => { await finishWorkout(); router.replace('/(tabs)/progress'); } }] });
  };
  const choose = async (exercise: Exercise) => { await addExercise(exercise); setPickerOpen(false); setQuery(''); };
  const done = activeExercises.flatMap(e => e.sets).filter(s => s.completed).length;
  const total = activeExercises.flatMap(e => e.sets).length;

  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top','bottom']}>
    <AnimatedBackground />
    <FlatList data={activeExercises} keyExtractor={e => String(e.id)} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} ListHeaderComponent={<>
      <View style={styles.header}><Pressable onPress={() => router.back()} style={[styles.iconButton,{ backgroundColor: colors.surface }]}><Ionicons name="chevron-down" size={23} color={colors.text} /></Pressable><View style={{ flex: 1, alignItems: 'center' }}><Eyebrow>ACTIVE SESSION</Eyebrow><Text style={{ fontWeight: '900', fontSize: 16 }} numberOfLines={1}>{activeWorkoutName}</Text></View><Pressable onPress={complete} style={[styles.finishSmall,{ borderColor: colors.accent }]}><Text style={{ color: colors.accent, fontWeight: '900', fontSize: 12 }}>Concluir</Text></Pressable></View>
      <Card style={{ marginTop: 12 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: colors.muted, fontSize: 12 }}>PROGRESSO DA SESSÃO</Text><Text style={{ color: colors.accent, fontWeight: '900' }}>{done}/{total}</Text></View><View style={[styles.track,{ backgroundColor: colors.surfaceAlt }]}><View style={[styles.fill,{ backgroundColor: colors.accent, width: `${total ? Math.round(done / total * 100) : 0}%` }]} /></View></Card>
    </>} renderItem={({ item }) => <ExerciseBlock item={item} />} ListEmptyComponent={<Card style={{ marginTop: 12, alignItems: 'center', gap: 8 }}><Ionicons name="barbell-outline" size={34} color={colors.accent} /><Text style={{ fontWeight: '900' }}>Adicione o primeiro exercício</Text><Text style={{ color: colors.muted, textAlign: 'center' }}>Depois ajuste carga e repetições. O NeoLift aprende com seu histórico, não inventa uma carga inicial.</Text></Card>} ListFooterComponent={<View style={{ gap: 10, marginTop: 14 }}><Button title="+ Adicionar exercício" onPress={() => setPickerOpen(true)} kind="secondary" /><Button title="Concluir treino" onPress={complete} /></View>} />

    <Modal visible={pickerOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPickerOpen(false)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top','bottom']}>
        <AnimatedBackground />
        <FlatList data={results} keyExtractor={e => e.id} contentContainerStyle={{ padding: 18, paddingBottom: 50 }} keyboardShouldPersistTaps="handled" ListHeaderComponent={<><View style={styles.pickerHead}><View><Eyebrow>ADD EXERCISE</Eyebrow><Text style={{ fontSize: 25, fontWeight: '900', marginTop: 4 }}>Escolha um movimento</Text></View><Pressable onPress={() => setPickerOpen(false)}><Ionicons name="close" size={27} color={colors.text} /></Pressable></View><View style={[styles.search,{ borderColor: colors.border, backgroundColor: colors.surface }]}><Ionicons name="search" size={20} color={colors.muted} /><TextInput autoFocus value={query} onChangeText={setQuery} placeholder="Buscar exercício" placeholderTextColor={colors.muted} style={{ flex: 1, color: colors.text, fontSize: 15 }} /></View></>} renderItem={({ item }) => <View style={{ marginTop: 10 }}><ExerciseCard exercise={item} compact onPress={() => choose(item)} /></View>} />
      </SafeAreaView>
    </Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({ content: { padding: 18, paddingBottom: 40 }, header: { flexDirection: 'row', alignItems: 'center', gap: 10 }, iconButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, finishSmall: { minWidth: 68, height: 38, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, track: { height: 8, borderRadius: 99, overflow: 'hidden', marginTop: 10 }, fill: { height: '100%', borderRadius: 99 }, exerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }, workoutImage: { width: 64, height: 64, borderRadius: 14 }, labels: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5, marginTop: 10 }, setRow: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 13, paddingVertical: 5, paddingHorizontal: 4 }, field: { width: 72, height: 42, borderWidth: 1, borderRadius: 11, textAlign: 'center', fontWeight: '800' }, check: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, pickerHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }, search: { height: 52, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 8 }, suggestion: { borderWidth: 1, borderRadius: 15, padding: 10, flexDirection: 'row', gap: 9, alignItems: 'center' }, firstLoad: { borderWidth: 1, borderRadius: 15, padding: 10, flexDirection: 'row', gap: 8, alignItems: 'center' }, apply: { paddingHorizontal: 9, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, coachButton: { minHeight: 42, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 9 } });
