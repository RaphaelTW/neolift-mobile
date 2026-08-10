import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button, Card, Chip, Eyebrow, Text } from '@/components/Ui';
import { ExerciseCard } from '@/components/ExerciseCard';
import { useApp } from '@/context/AppProvider';
import type { Exercise, WorkoutSet } from '@/types';
import { muscleLabel } from '@/utils/muscles';

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
    <TextInput value={weight} onChangeText={setWeight} onBlur={persist} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.muted} style={[styles.field, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} />
    <Text style={{ color: colors.muted, fontSize: 11, width: 22 }}>{unit}</Text>
    <TextInput value={reps} onChangeText={setReps} onBlur={persist} keyboardType="number-pad" placeholder="10" placeholderTextColor={colors.muted} style={[styles.field, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} />
    <Pressable onPress={toggle} style={[styles.check, { borderColor: set.completed ? colors.accent : colors.border, backgroundColor: set.completed ? colors.accent : colors.surface }]}><Ionicons name="checkmark" size={18} color={set.completed ? '#fff' : colors.muted} /></Pressable>
  </View>;
}

export default function SessionScreen() {
  const { colors, weightUnit, activeWorkoutId, activeExercises, startWorkout, refreshActive, addSet, updateSet, removeExercise, finishWorkout, findExercises, addExercise } = useApp();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Exercise[]>([]);
  useEffect(() => { if (!activeWorkoutId) startWorkout(); }, [activeWorkoutId, startWorkout]);
  useFocusEffect(useCallback(() => { refreshActive(); }, [refreshActive]));
  useEffect(() => { if (!pickerOpen) return; const t = setTimeout(() => findExercises(query, 'all', 50).then(setResults), 100); return () => clearTimeout(t); }, [pickerOpen, query, findExercises]);
  const complete = async () => {
    if (activeExercises.length === 0) return Alert.alert('Treino vazio', 'Adicione pelo menos um exercício antes de concluir.');
    Alert.alert('Concluir treino?', 'As séries marcadas serão usadas nos gráficos de evolução.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Concluir', style: 'default', onPress: async () => { await finishWorkout(); router.replace('/(tabs)/progress'); } }]);
  };
  const choose = async (exercise: Exercise) => { await addExercise(exercise); setPickerOpen(false); setQuery(''); };
  const done = activeExercises.flatMap(e => e.sets).filter(s => s.completed).length;
  const total = activeExercises.flatMap(e => e.sets).length;

  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top','bottom']}>
    <FlatList data={activeExercises} keyExtractor={e => String(e.id)} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} ListHeaderComponent={<>
      <View style={styles.header}><Pressable onPress={() => router.back()} style={[styles.iconButton,{ backgroundColor: colors.surface }]}><Ionicons name="chevron-down" size={23} color={colors.text} /></Pressable><View style={{ flex: 1, alignItems: 'center' }}><Eyebrow>ACTIVE SESSION</Eyebrow><Text style={{ fontWeight: '900', fontSize: 16 }}>Treino livre</Text></View><Pressable onPress={complete} style={[styles.finishSmall,{ borderColor: colors.accent }]}><Text style={{ color: colors.accent, fontWeight: '900', fontSize: 12 }}>Concluir</Text></Pressable></View>
      <Card style={{ marginTop: 12 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: colors.muted, fontSize: 12 }}>PROGRESSO DA SESSÃO</Text><Text style={{ color: colors.accent, fontWeight: '900' }}>{done}/{total}</Text></View><View style={[styles.track,{ backgroundColor: colors.surfaceAlt }]}><View style={[styles.fill,{ backgroundColor: colors.accent, width: `${total ? Math.round(done / total * 100) : 0}%` }]} /></View></Card>
    </>} renderItem={({ item }) => <Card style={{ marginTop: 12 }}>
      <View style={styles.exerciseHeader}><View style={{ flex: 1 }}><Text style={{ fontSize: 17, fontWeight: '900' }}>{item.exerciseName}</Text><Text style={{ color: colors.accent, fontSize: 11, fontWeight: '800', marginTop: 3 }}>{muscleLabel(item.primaryMuscle).toUpperCase()}</Text></View><Pressable onPress={() => Alert.alert('Remover exercício?', item.exerciseName, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Remover', style: 'destructive', onPress: () => removeExercise(item.id) }])}><Ionicons name="trash-outline" size={20} color={colors.muted} /></Pressable></View>
      <View style={styles.labels}><Text style={{ width: 28, color: colors.muted, fontSize: 10 }}>SÉRIE</Text><Text style={{ width: 72, color: colors.muted, fontSize: 10 }}>CARGA</Text><View style={{ width: 22 }} /><Text style={{ width: 72, color: colors.muted, fontSize: 10 }}>REPS</Text><Text style={{ width: 42, textAlign: 'center', color: colors.muted, fontSize: 10 }}>OK</Text></View>
      {item.sets.map(set => <SetRow key={set.id} set={set} unit={weightUnit} onSave={(reps, weight, completed) => updateSet(set.id, reps, weight, completed)} />)}
      <Pressable onPress={() => addSet(item.id)} style={{ paddingVertical: 10, alignItems: 'center' }}><Text style={{ color: colors.accent, fontWeight: '900' }}>+ Adicionar série</Text></Pressable>
    </Card>} ListEmptyComponent={<Card style={{ marginTop: 12, alignItems: 'center', gap: 8 }}><Ionicons name="add-circle-outline" size={34} color={colors.accent} /><Text style={{ fontWeight: '900' }}>Adicione o primeiro exercício</Text><Text style={{ color: colors.muted, textAlign: 'center' }}>Depois ajuste a carga e as repetições de cada série.</Text></Card>} ListFooterComponent={<View style={{ gap: 10, marginTop: 14 }}><Button title="+ Adicionar exercício" onPress={() => setPickerOpen(true)} kind="secondary" /><Button title="Concluir treino" onPress={complete} /></View>} />

    <Modal visible={pickerOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPickerOpen(false)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top','bottom']}>
        <FlatList data={results} keyExtractor={e => e.id} contentContainerStyle={{ padding: 18, paddingBottom: 50 }} keyboardShouldPersistTaps="handled" ListHeaderComponent={<><View style={styles.pickerHead}><View><Eyebrow>ADD EXERCISE</Eyebrow><Text style={{ fontSize: 25, fontWeight: '900', marginTop: 4 }}>Escolha um movimento</Text></View><Pressable onPress={() => setPickerOpen(false)}><Ionicons name="close" size={27} color={colors.text} /></Pressable></View><View style={[styles.search,{ borderColor: colors.border, backgroundColor: colors.surface }]}><Ionicons name="search" size={20} color={colors.muted} /><TextInput autoFocus value={query} onChangeText={setQuery} placeholder="Buscar exercício" placeholderTextColor={colors.muted} style={{ flex: 1, color: colors.text, fontSize: 15 }} /></View></>} renderItem={({ item }) => <View style={{ marginTop: 10 }}><ExerciseCard exercise={item} compact onPress={() => choose(item)} /></View>} />
      </SafeAreaView>
    </Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({ content: { padding: 18, paddingBottom: 40 }, header: { flexDirection: 'row', alignItems: 'center', gap: 10 }, iconButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, finishSmall: { minWidth: 68, height: 38, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, track: { height: 8, borderRadius: 99, overflow: 'hidden', marginTop: 10 }, fill: { height: '100%', borderRadius: 99 }, exerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }, labels: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 }, setRow: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 13, paddingVertical: 5, paddingHorizontal: 4 }, field: { width: 72, height: 42, borderWidth: 1, borderRadius: 11, textAlign: 'center', fontWeight: '800' }, check: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, pickerHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }, search: { height: 52, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 8 } });
