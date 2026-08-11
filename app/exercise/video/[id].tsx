import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEvent } from 'expo';
import NetInfo from '@react-native-community/netinfo';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Screen } from '@/components/Screen';
import { Button, Card, Eyebrow, SectionTitle, Text } from '@/components/Ui';
import { useApp } from '@/context/AppProvider';
import type { Exercise } from '@/types';
import { openExerciseVideo, preferredExerciseVideo } from '@/services/exerciseCoach';
import { showNeoDialog } from '@/services/dialog';

function Player({ uri, onError }: { uri: string; onError: (message: string) => void }) {
  const source = useMemo(() => ({ uri, useCaching: true }), [uri]);
  const player = useVideoPlayer(source, p => { p.loop = true; p.play(); });
  const { status, error } = useEvent(player, 'statusChange', { status: player.status });
  useEffect(() => { if (status === 'error') onError(error?.message ?? 'Formato de vídeo não suportado neste aparelho.'); }, [status, error, onError]);
  return <VideoView player={player} style={styles.video} nativeControls contentFit="contain" fullscreenOptions={{ enable: true }} />;
}

export default function ExerciseVideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, findExercise } = useApp();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [online, setOnline] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);
  useEffect(() => { if (id) findExercise(id).then(setExercise); }, [id, findExercise]);
  useEffect(() => { NetInfo.fetch().then(s => setOnline(Boolean(s.isConnected && s.isInternetReachable !== false))); }, []);
  const uri = exercise ? preferredExerciseVideo(exercise) : null;
  const videoMedia = exercise?.media?.find(m => m.type === 'video' && m.url === uri);

  useEffect(() => {
    if (exercise && !online) showNeoDialog({
      title: 'Vídeo indisponível offline',
      message: 'A demonstração 3D continua funcionando sem internet.',
      icon: 'cloud-offline-outline',
      actions: [{ label: 'Voltar', style: 'cancel' }, { label: 'Abrir 3D', style: 'accent', onPress: () => router.replace(`/exercise/coach/${exercise.id}`) }]
    });
  }, [exercise, online]);

  if (!exercise) return <Screen><Text>Carregando vídeo...</Text></Screen>;
  return <Screen>
    <View style={styles.top}><Pressable onPress={() => router.back()} style={[styles.iconButton,{ backgroundColor: colors.surface }]}><Ionicons name="arrow-back" size={22} color={colors.text} /></Pressable><Eyebrow>EXERCISE COACH // VÍDEO</Eyebrow></View>
    <Text style={styles.title}>{exercise.name}</Text>
    {uri && online && !playerError ? <Card style={{ padding: 8 }}><Player uri={uri} onError={setPlayerError} /></Card> : <Card><Ionicons name="videocam-off-outline" size={38} color={colors.muted} /><Text style={{ fontWeight: '900', marginTop: 10 }}>Sem vídeo Wger reproduzível agora</Text><Text style={{ color: colors.muted, lineHeight: 19, marginTop: 5 }}>{playerError ? 'O formato deste vídeo não é compatível com o aparelho. ' : ''}Você pode usar o 3D offline ou procurar outra demonstração online.</Text></Card>}
    <View style={{ gap: 8 }}><Button title="Ver em 3D" onPress={() => router.replace(`/exercise/coach/${exercise.id}`)} /><Button title="Procurar outro vídeo" onPress={() => openExerciseVideo(exercise, () => router.replace(`/exercise/coach/${exercise.id}`))} kind="secondary" /></View>
    {uri ? <><SectionTitle title="Fonte da mídia" /><Card><Text style={{ fontWeight: '900' }}>Wger</Text><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }}>{videoMedia?.author ? `Autor: ${videoMedia.author}\n` : ''}{videoMedia?.license ? `Licença: ${videoMedia.license}` : exercise.license ? `Licença: ${exercise.license}` : 'Consulte os metadados da entrada Wger.'}</Text></Card></> : null}
    <SectionTitle title="Execução" />
    {exercise.instructions.slice(0, 8).map((step, i) => <Card key={i} style={{ flexDirection: 'row', gap: 10 }}><View style={[styles.step,{ backgroundColor: colors.accentSoft }]}><Text style={{ color: colors.accent, fontWeight: '900' }}>{i + 1}</Text></View><Text style={{ flex: 1, color: colors.muted, lineHeight: 20 }}>{step}</Text></Card>)}
  </Screen>;
}

const styles = StyleSheet.create({ top: { flexDirection: 'row', alignItems: 'center', gap: 12 }, iconButton: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.8 }, video: { width: '100%', aspectRatio: 16 / 9, borderRadius: 16, overflow: 'hidden' }, step: { width: 31, height: 31, borderRadius: 10, alignItems: 'center', justifyContent: 'center' } });
