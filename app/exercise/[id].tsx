import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
import { exerciseImageGallery, isAnimatedExerciseImage, openExerciseVideo, preferredExerciseVideo } from '@/services/exerciseCoach';
import { showNeoDialog } from '@/services/dialog';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, findExercise, favorite, toggleFavorite, addExercise, getExerciseHistory, weightUnit } = useApp();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [fav, setFav] = useState(false);
  const [history, setHistory] = useState<ProgressPoint[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  useEffect(() => { if (!id) return; Promise.all([findExercise(id), favorite(id), getExerciseHistory(id)]).then(([e,f,h]) => { setExercise(e); setFav(f); setHistory(h); setSelectedImage(e ? exerciseImageGallery(e)[0] ?? null : null); }); }, [id, findExercise, favorite, getExerciseHistory]);
  if (!exercise) return <Screen><Text>Carregando exercício...</Text></Screen>;
  const gallery = exerciseImageGallery(exercise);
  const image = exerciseImageUrl(selectedImage ?? gallery[0]);
  const video = preferredExerciseVideo(exercise);
  const add = async () => { await addExercise(exercise); showNeoDialog({ title: 'Adicionado ao treino', message: `${exercise.name} entrou no treino atual.`, icon: 'checkmark-circle-outline', actions: [{ label: 'Continuar', style: 'cancel' }, { label: 'Abrir treino', style: 'accent', onPress: () => router.push('/workout/session') }] }); };
  return <Screen>
    <View style={styles.top}><Pressable onPress={() => router.back()} style={[styles.iconButton,{ backgroundColor: colors.surface }]}><Ionicons name="arrow-back" size={22} color={colors.text} /></Pressable><Pressable onPress={async () => setFav(await toggleFavorite(exercise.id))} style={[styles.iconButton,{ backgroundColor: colors.surface }]}><Ionicons name={fav ? 'heart' : 'heart-outline'} size={22} color={fav ? colors.danger : colors.text} /></Pressable></View>
    <View>
      <Image source={image ? { uri: image } : undefined} style={[styles.hero, { backgroundColor: colors.surfaceAlt }]} contentFit="contain" cachePolicy="disk" transition={180} autoplay accessibilityLabel={`Demonstração visual de ${exercise.name}`} />
      {selectedImage && isAnimatedExerciseImage(selectedImage) ? <View style={[styles.mediaBadge, { backgroundColor: colors.accent }]}><Text style={styles.mediaBadgeText}>GIF ANIMADO</Text></View> : null}
    </View>
    {gallery.length > 1 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>{gallery.map((item, index) => { const uri = exerciseImageUrl(item); const active = item === (selectedImage ?? gallery[0]); return <Pressable key={`${item}-${index}`} onPress={() => setSelectedImage(item)} style={[styles.thumbWrap, { borderColor: active ? colors.accent : colors.border }]}><Image source={uri ? { uri } : undefined} style={styles.thumb} contentFit="cover" cachePolicy="disk" autoplay accessibilityLabel={`Imagem ${index + 1} de ${exercise.name}`} /></Pressable>; })}</ScrollView> : null}
    <Eyebrow>{exercise.category} // {exercise.level || 'all levels'}</Eyebrow><Text style={styles.title}>{exercise.name}</Text>
    <View style={styles.chips}><Chip label={muscleLabel(exercise.primaryMuscles[0] || 'geral')} selected /><Chip label={exercise.equipment || 'sem equipamento'} /><Chip label={exercise.mechanic || 'livre'} /></View>
    <SectionTitle title="Como fazer" />
    <View style={{ gap: 9 }}>
      {video ? <Button title="Assistir vídeo do Wger" onPress={() => router.push(`/exercise/video/${exercise.id}`)} /> : <Button title="Procurar demonstração em vídeo" onPress={() => openExerciseVideo(exercise, () => router.push(`/exercise/coach/${exercise.id}`))} />}
      <Button title="Ver animação 3D" onPress={() => router.push(`/exercise/coach/${exercise.id}`)} kind="secondary" />
      <Button title="Adicionar ao treino" onPress={add} kind="secondary" />
    </View>
    <SectionTitle title="Sua evolução" /><Card><View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}><Text style={{ fontWeight: '900' }}>Maior carga</Text><Text style={{ color: colors.muted, fontSize: 12 }}>{weightUnit}</Text></View><ProgressChart points={history} height={190} /></Card>
    <SectionTitle title="Execução" />{exercise.instructions.map((step, index) => <Card key={index} style={{ flexDirection: 'row', gap: 12 }}><View style={[styles.step,{ backgroundColor: colors.accentSoft }]}><Text style={{ color: colors.accent, fontWeight: '900' }}>{index + 1}</Text></View><Text style={{ flex: 1, lineHeight: 21, color: colors.muted }}>{step}</Text></Card>)}
    {exercise.secondaryMuscles.length ? <><SectionTitle title="Músculos secundários" /><Text style={{ color: colors.muted }}>{exercise.secondaryMuscles.map(muscleLabel).join(' · ')}</Text></> : null}
    <SectionTitle title="Fonte" /><Card><Text style={{ fontWeight: '900' }}>{exercise.source === 'wger' ? 'Wger' : exercise.source === 'hybrid' ? 'free-exercise-db + Wger' : 'free-exercise-db'}</Text><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }}>{exercise.licenseAuthor ? `Autor/licenciante: ${exercise.licenseAuthor}\n` : ''}{exercise.license ? `Licença: ${exercise.license}` : 'Metadados de licença preservados conforme a fonte.'}{exercise.videos?.length ? `\n${exercise.videos.length} vídeo(s) vinculado(s)` : ''}</Text></Card>
  </Screen>;
}
const styles = StyleSheet.create({ top: { flexDirection: 'row', justifyContent: 'space-between' }, iconButton: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, hero: { height: 250, borderRadius: 24 }, mediaBadge: { position: 'absolute', right: 12, bottom: 12, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }, mediaBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' }, gallery: { gap: 8 }, thumbWrap: { borderWidth: 2, borderRadius: 13, padding: 2 }, thumb: { width: 62, height: 62, borderRadius: 9 }, title: { fontSize: 29, lineHeight: 34, fontWeight: '900', letterSpacing: -1 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, step: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' } });
