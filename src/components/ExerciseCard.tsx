import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { Exercise } from '@/types';
import { exerciseImageUrl } from '@/services/exerciseCatalog';
import { exerciseImageGallery, isAnimatedExerciseImage, preferredExerciseVideo } from '@/services/exerciseCoach';
import { Card, Text } from './Ui';
import { useApp } from '@/context/AppProvider';

export function ExerciseCard({ exercise, compact = false, onPress }: { exercise: Exercise; compact?: boolean; onPress?: () => void }) {
  const { colors } = useApp();
  const gallery = exerciseImageGallery(exercise);
  const image = exerciseImageUrl(gallery[0]);
  const hasVideo = Boolean(preferredExerciseVideo(exercise));
  const mediaLabel = hasVideo ? 'vídeo disponível' : gallery.some(isAnimatedExerciseImage) ? 'animação disponível' : gallery.length ? `${gallery.length} imagem(ns)` : '3D disponível';
  const provider = exercise.source === 'wger' ? 'WGER' : exercise.source === 'hybrid' ? 'HYBRID' : 'OFFLINE';
  return <Pressable onPress={onPress ?? (() => router.push({ pathname: '/exercise/[id]', params: { id: exercise.id } }))}><Card style={[styles.card, compact && { padding: 10 }]}>
    <Image source={image ? { uri: image } : undefined} style={[styles.image, compact && { width: 62, height: 62 }]} contentFit="cover" cachePolicy="disk" transition={180} autoplay accessibilityLabel={`Demonstração de ${exercise.name}`} />
    <View style={{ flex: 1, gap: 5 }}><View style={styles.row}><Text numberOfLines={2} style={{ flex: 1, fontWeight: '900', fontSize: compact ? 14 : 16 }}>{exercise.name}</Text><View style={[styles.badge,{ backgroundColor: colors.accentSoft }]}><Text style={{ color: colors.accent, fontSize: 9, fontWeight: '900' }}>{provider}</Text></View></View><Text style={{ color: colors.accent, fontSize: 12, fontWeight: '800' }}>{(exercise.primaryMuscles[0] || 'geral').toUpperCase()}</Text><Text numberOfLines={1} style={{ color: colors.muted, fontSize: 12 }}>{exercise.equipment || 'sem equipamento'} · {mediaLabel}</Text></View>
  </Card></Pressable>;
}
const styles = StyleSheet.create({ card: { padding: 12, flexDirection: 'row', gap: 12, alignItems: 'center' }, image: { width: 78, height: 78, borderRadius: 14, backgroundColor: '#CBD5E1' }, row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, badge: { borderRadius: 999, paddingHorizontal: 7, paddingVertical: 4 } });
