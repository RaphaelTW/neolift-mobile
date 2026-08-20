import React, { useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import type { Exercise } from '@/types';
import { exerciseImageUrl } from '@/services/exerciseCatalog';
import { muscleLabel } from '@/utils/muscles';
import { Text } from './Ui';

const fallbackImage = require('../../assets/exercise-fallback.webp');

type ExerciseIdentity = Pick<Exercise, 'name' | 'primaryMuscles'>;

type ExerciseImageProps = {
  exercise: ExerciseIdentity;
  path?: string | null;
  style?: StyleProp<ViewStyle>;
  contentFit?: 'cover' | 'contain';
  compact?: boolean;
};

/**
 * Centraliza imagens de exercícios e garante um asset local quando a mídia
 * remota estiver ausente ou falhar. Assim catálogo, treino e detalhes nunca
 * dependem de uma área vazia nem de conectividade para mostrar uma imagem.
 */
export function ExerciseImage({ exercise, path, style, contentFit = 'cover', compact = false }: ExerciseImageProps) {
  const uri = exerciseImageUrl(path ?? undefined);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [uri]);

  const usingFallback = !uri || failed;

  return <View style={[styles.frame, style]} accessibilityLabel={`Imagem do exercício ${exercise.name}`}>
    <Image
      source={usingFallback ? fallbackImage : { uri }}
      style={StyleSheet.absoluteFill}
      contentFit={usingFallback ? 'cover' : contentFit}
      cachePolicy="disk"
      transition={180}
      autoplay
      onError={() => setFailed(true)}
    />
    {usingFallback ? <View style={styles.caption}>
      <Text numberOfLines={1} style={[styles.captionText, compact && styles.captionTextCompact]}>
        {muscleLabel(exercise.primaryMuscles[0] || 'geral').toUpperCase()}
      </Text>
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', backgroundColor: '#17141D' },
  caption: { position: 'absolute', left: 8, right: 8, bottom: 8, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(11,10,13,0.78)' },
  captionText: { color: '#FFFFFF', textAlign: 'center', fontSize: 10, fontWeight: '900' },
  captionTextCompact: { fontSize: 8, paddingHorizontal: 1 }
});
