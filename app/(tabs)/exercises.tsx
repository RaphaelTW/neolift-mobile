import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseCard } from '@/components/ExerciseCard';
import { Chip, Eyebrow, Text } from '@/components/Ui';
import { useApp } from '@/context/AppProvider';
import type { Exercise, ExerciseSource } from '@/types';
import { MUSCLES, muscleLabel } from '@/utils/muscles';

export default function ExercisesScreen() {
  const { colors, findExercises, catalogCount, catalogSources } = useApp();
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState('all');
  const [source, setSource] = useState<'all' | ExerciseSource>('all');
  const [items, setItems] = useState<Exercise[]>([]);
  useEffect(() => { const t = setTimeout(() => findExercises(query, muscle, 100, source).then(setItems), 120); return () => clearTimeout(t); }, [query, muscle, source, findExercises, catalogCount]);
  return <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
    <FlatList data={items} keyExtractor={i => i.id} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} ListHeaderComponent={<>
      <Eyebrow>CATÁLOGO HÍBRIDO // {catalogCount} EXERCÍCIOS</Eyebrow><Text style={styles.title}>Encontre seu movimento</Text>
      <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}><Ionicons name="search" size={20} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar exercício ou equipamento" placeholderTextColor={colors.muted} style={{ flex: 1, color: colors.text, fontSize: 15 }} />{query ? <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={20} color={colors.muted} /></Pressable> : null}</View>
      <FlatList horizontal data={[
        { key: 'all', label: `Todos ${catalogSources.total}` },
        { key: 'free-exercise-db', label: `Base offline ${catalogSources.free + catalogSources.hybrid}` },
        { key: 'wger', label: `Wger ${catalogSources.wger + catalogSources.hybrid}` }
      ]} keyExtractor={i => i.key} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 10 }} renderItem={({ item }) => <Chip label={item.label} selected={source === item.key} onPress={() => setSource(item.key as any)} />} />
      <FlatList horizontal data={MUSCLES} keyExtractor={i => i} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4, paddingBottom: 12 }} renderItem={({ item }) => <Chip label={item === 'all' ? 'Todos músculos' : muscleLabel(item)} selected={muscle === item} onPress={() => setMuscle(item)} />} />
      <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 5 }}>{items.length} resultados exibidos</Text>
    </>} renderItem={({ item }) => <View style={{ marginBottom: 10 }}><ExerciseCard exercise={item} compact /></View>} ListEmptyComponent={<Text style={{ color: colors.muted, textAlign: 'center', padding: 30 }}>Nenhum exercício encontrado.</Text>} />
  </SafeAreaView>;
}
const styles = StyleSheet.create({ content: { padding: 18, paddingBottom: 120 }, title: { fontSize: 28, fontWeight: '900', letterSpacing: -1, marginTop: 7, marginBottom: 14 }, search: { borderWidth: 1, borderRadius: 17, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 14, minHeight: 52, marginBottom: 10 } });
