import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { Exercise } from '@/types';
import { exerciseImageUrl } from '@/services/exerciseCatalog';
import { Card, Text } from './Ui';
import { useApp } from '@/context/AppProvider';

export function ExerciseCard({ exercise, compact = false, onPress }: { exercise: Exercise; compact?: boolean; onPress?: () => void }) {
  const { colors } = useApp();
  const image = exerciseImageUrl(exercise.images?.[0]);
  return <Pressable onPress={onPress ?? (() => router.push({ pathname: '/exercise/[id]', params: { id: exercise.id } }))}><Card style={[styles.card, compact && { padding: 10 }]}>
    <Image source={image ? { uri: image } : undefined} style={[styles.image, compact && { width: 62, height: 62 }]} contentFit="cover" cachePolicy="disk" transition={180} />
    <View style={{ flex: 1, gap: 5 }}><Text numberOfLines={2} style={{ fontWeight: '900', fontSize: compact ? 14 : 16 }}>{exercise.name}</Text><Text style={{ color: colors.accent, fontSize: 12, fontWeight: '800' }}>{(exercise.primaryMuscles[0] || 'geral').toUpperCase()}</Text><Text numberOfLines={1} style={{ color: colors.muted, fontSize: 12 }}>{exercise.equipment || 'sem equipamento'} · {exercise.level || 'todos os níveis'}</Text></View>
  </Card></Pressable>;
}
const styles = StyleSheet.create({ card: { padding: 12, flexDirection: 'row', gap: 12, alignItems: 'center' }, image: { width: 78, height: 78, borderRadius: 14, backgroundColor: '#CBD5E1' } });
