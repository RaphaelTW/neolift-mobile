import React, { useCallback, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { BrandMark } from '@/components/BrandMark';
import { Button, Card, Eyebrow, SectionTitle, Text } from '@/components/Ui';
import { StatCard } from '@/components/StatCard';
import { useApp } from '@/context/AppProvider';
import { compactNumber, dateLong } from '@/utils/format';
import { buildMonthlyTrainingPlan, profileLabels } from '@/services/trainingPlan';

export default function HomeScreen() {
  const { colors, dashboard, recent, refreshDashboard, activeWorkoutId, startWorkout, weightUnit, releaseInfo, ready, profile, latestMeasurement } = useApp();
  useFocusEffect(useCallback(() => { refreshDashboard(); }, [refreshDashboard]));
  useEffect(() => { if (ready && !profile) router.replace('/onboarding'); }, [ready, profile]);
  const plan = useMemo(() => profile ? buildMonthlyTrainingPlan(profile) : null, [profile]);
  const goWorkout = async () => { await startWorkout(); router.push('/workout/session'); };

  return <Screen>
    <View style={styles.hero}>
      <View style={{ flex: 1 }}><Eyebrow>NEOLIFT // PERSONAL TRAIN LOG</Eyebrow><Text style={styles.title}>Treino que evolui com você.</Text><Text style={{ color: colors.muted, maxWidth: 320, lineHeight: 21 }}>Plano mensal, sugestão de carga e histórico corporal — tudo salvo localmente.</Text></View>
      <BrandMark size={62} />
    </View>

    {profile && plan ? <Card style={[styles.profileCard,{ borderColor: colors.accent }]}>
      <View style={{ flex: 1 }}><Text style={{ fontSize: 12, color: colors.accent, fontWeight: '900' }}>{plan.weekLabel.toUpperCase()}</Text><Text style={{ fontSize: 18, fontWeight: '900', marginTop: 4 }}>{profileLabels.goal[profile.goal]}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{profileLabels.experience[profile.experience]} · {profile.trainingDays} dias/semana{latestMeasurement ? ` · ${compactNumber(latestMeasurement.weight)} ${weightUnit}` : ''}</Text></View>
      <Pressable onPress={() => router.push('/(tabs)/workout')} style={[styles.roundButton,{ backgroundColor: colors.accent }]}><Ionicons name="calendar-outline" size={22} color="#fff" /></Pressable>
    </Card> : null}

    <Card style={styles.cta}><View style={{ flex: 1, gap: 5 }}><Text style={{ fontSize: 17, fontWeight: '900' }}>{activeWorkoutId ? 'Treino em andamento' : 'Quer começar agora?'}</Text><Text style={{ color: colors.muted, fontSize: 12 }}>{activeWorkoutId ? 'Continue exatamente de onde parou.' : 'Use o plano sugerido ou abra um treino livre.'}</Text></View><Pressable onPress={goWorkout} style={[styles.roundButton, { backgroundColor: colors.accent }]}><Ionicons name={activeWorkoutId ? 'arrow-forward' : 'play'} size={23} color="#fff" /></Pressable></Card>

    {releaseInfo?.hasUpdate ? <Pressable onPress={() => router.push('/(tabs)/settings')}><Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: colors.accent }}><Ionicons name="cloud-download-outline" size={24} color={colors.accent} /><View style={{ flex: 1 }}><Text style={{ fontWeight: '900' }}>NeoLift v{releaseInfo.latestVersion} disponível</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>Toque para atualizar pelo GitHub.</Text></View><Ionicons name="chevron-forward" size={20} color={colors.accent} /></Card></Pressable> : null}

    <View style={styles.stats}><StatCard label="TREINOS" value={String(dashboard.sessions)} helper="concluídos" /><StatCard label="VOLUME · 7 DIAS" value={`${compactNumber(dashboard.weeklyVolume)} ${weightUnit}`} helper="carga × repetições" /></View>
    <View style={styles.stats}><StatCard label="MARCAS" value={String(dashboard.prs)} helper="exercícios com carga" /><StatCard label="PESO ATUAL" value={latestMeasurement ? `${compactNumber(latestMeasurement.weight)} ${weightUnit}` : '—'} helper="última medição" /></View>

    <SectionTitle title="Treinos recentes" action={<Pressable onPress={() => router.push('/workout/history')}><Text style={{ color: colors.accent, fontWeight: '800', fontSize: 12 }}>Histórico completo</Text></Pressable>} />
    {recent.length === 0 ? <Card><Text style={{ fontWeight: '800' }}>Seu histórico começa no primeiro treino.</Text><Text style={{ color: colors.muted, marginTop: 5 }}>Registre peso, repetições e como a carga pareceu para liberar recomendações.</Text></Card> : recent.map(item => <Card key={item.id} style={styles.recent}><View style={{ flex: 1 }}><Text style={{ fontWeight: '900' }}>{item.name}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{dateLong(item.finished_at)} · {item.exercises} exercícios</Text></View><Text style={{ color: colors.accent, fontWeight: '900' }}>{compactNumber(item.volume)} {weightUnit}</Text></Card>)}
    <Button title={activeWorkoutId ? 'Continuar treino' : 'Iniciar treino livre'} onPress={goWorkout} />
  </Screen>;
}
const styles = StyleSheet.create({ hero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, paddingVertical: 8 }, title: { fontSize: 32, lineHeight: 36, fontWeight: '900', letterSpacing: -1.3, marginVertical: 8 }, profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14 }, cta: { flexDirection: 'row', alignItems: 'center', gap: 14 }, roundButton: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, stats: { flexDirection: 'row', gap: 10 }, recent: { flexDirection: 'row', alignItems: 'center', gap: 12 } });
