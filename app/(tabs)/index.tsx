import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Button, Card, Eyebrow, SectionTitle, Text } from '@/components/Ui';
import { StatCard } from '@/components/StatCard';
import { useApp } from '@/context/AppProvider';
import { compactNumber, dateLong } from '@/utils/format';

export default function HomeScreen() {
  const { colors, dashboard, recent, refreshDashboard, activeWorkoutId, startWorkout, weightUnit, releaseInfo } = useApp();
  useFocusEffect(useCallback(() => { refreshDashboard(); }, [refreshDashboard]));
  const goWorkout = async () => { await startWorkout(); router.push('/workout/session'); };
  return <Screen>
    <View style={styles.hero}><View style={{ flex: 1 }}><Eyebrow>NEOLIFT // TRAIN LOG</Eyebrow><Text style={styles.title}>Sua força, em dados.</Text><Text style={{ color: colors.muted, maxWidth: 310, lineHeight: 21 }}>Treine, registre e veja sua evolução por exercício e por região do corpo.</Text></View><View style={[styles.orb, { backgroundColor: colors.accentSoft }]}><Ionicons name="pulse" size={28} color={colors.accent} /></View></View>
    <Card style={styles.cta}><View style={{ flex: 1, gap: 5 }}><Text style={{ fontSize: 17, fontWeight: '900' }}>{activeWorkoutId ? 'Treino em andamento' : 'Pronto para treinar?'}</Text><Text style={{ color: colors.muted, fontSize: 12 }}>{activeWorkoutId ? 'Continue de onde parou. Seus dados já estão salvos localmente.' : 'Comece um treino livre e monte as séries na hora.'}</Text></View><Pressable onPress={goWorkout} style={[styles.roundButton, { backgroundColor: colors.accent }]}><Ionicons name={activeWorkoutId ? 'arrow-forward' : 'play'} size={23} color="#fff" /></Pressable></Card>
    {releaseInfo?.hasUpdate ? <Pressable onPress={() => router.push('/(tabs)/settings')}><Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: colors.accent }}><Ionicons name="cloud-download-outline" size={24} color={colors.accent} /><View style={{ flex: 1 }}><Text style={{ fontWeight: '900' }}>NeoLift v{releaseInfo.latestVersion} disponível</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>Toque para atualizar pelo GitHub.</Text></View><Ionicons name="chevron-forward" size={20} color={colors.accent} /></Card></Pressable> : null}
    <View style={styles.stats}><StatCard label="TREINOS" value={String(dashboard.sessions)} helper="concluídos" /><StatCard label="VOLUME · 7 DIAS" value={`${compactNumber(dashboard.weeklyVolume)} ${weightUnit}`} helper="carga × repetições" /></View>
    <View style={styles.stats}><StatCard label="MARCAS" value={String(dashboard.prs)} helper="exercícios com carga" /><StatCard label="ÚLTIMO TREINO" value={dashboard.lastWorkout ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(dashboard.lastWorkout)) : '—'} helper="sessão concluída" /></View>
    <SectionTitle title="Treinos recentes" action={<Pressable onPress={() => router.push('/(tabs)/progress')}><Text style={{ color: colors.accent, fontWeight: '800', fontSize: 12 }}>Ver evolução</Text></Pressable>} />
    {recent.length === 0 ? <Card><Text style={{ fontWeight: '800' }}>Seu histórico começa no primeiro treino.</Text><Text style={{ color: colors.muted, marginTop: 5 }}>Registre peso e repetições para liberar gráficos e comparações.</Text></Card> : recent.map(item => <Card key={item.id} style={styles.recent}><View style={{ flex: 1 }}><Text style={{ fontWeight: '900' }}>{item.name}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{dateLong(item.finished_at)} · {item.exercises} exercícios</Text></View><Text style={{ color: colors.accent, fontWeight: '900' }}>{compactNumber(item.volume)} {weightUnit}</Text></Card>)}
    <Button title={activeWorkoutId ? 'Continuar treino' : 'Iniciar treino'} onPress={goWorkout} />
  </Screen>;
}
const styles = StyleSheet.create({ hero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, paddingVertical: 8 }, title: { fontSize: 32, lineHeight: 36, fontWeight: '900', letterSpacing: -1.3, marginVertical: 8 }, orb: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, cta: { flexDirection: 'row', alignItems: 'center', gap: 14 }, roundButton: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, stats: { flexDirection: 'row', gap: 10 }, recent: { flexDirection: 'row', alignItems: 'center', gap: 12 } });
