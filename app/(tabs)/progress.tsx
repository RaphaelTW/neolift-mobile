import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Card, Chip, Eyebrow, SectionTitle, Text } from '@/components/Ui';
import { ProgressChart } from '@/components/ProgressChart';
import { useApp } from '@/context/AppProvider';
import type { ProgressPoint } from '@/types';
import { MUSCLES, muscleLabel } from '@/utils/muscles';
import { compactNumber } from '@/utils/format';

const bodyMetrics = [
  ['weight','Peso'], ['chest','Peitoral'], ['waist','Cintura'], ['hips','Quadril'], ['leftArm','Braço E'], ['rightArm','Braço D'], ['leftThigh','Coxa E'], ['rightThigh','Coxa D'], ['leftCalf','Panturrilha E'], ['rightCalf','Panturrilha D']
] as const;

export default function ProgressScreen() {
  const { colors, muscles, refreshProgress, getMuscleHistory, getBodyHistory, latestMeasurement, weightUnit } = useApp();
  const [mode, setMode] = useState<'strength' | 'body'>('strength');
  const [selected, setSelected] = useState('chest');
  const [bodyMetric, setBodyMetric] = useState<(typeof bodyMetrics)[number][0]>('weight');
  const [history, setHistory] = useState<ProgressPoint[]>([]);
  useFocusEffect(useCallback(() => { refreshProgress(); }, [refreshProgress]));
  useEffect(() => { if (mode === 'strength') getMuscleHistory(selected).then(setHistory); else getBodyHistory(bodyMetric).then(setHistory); }, [mode, selected, bodyMetric, getMuscleHistory, getBodyHistory, muscles, latestMeasurement]);
  const muscleMap = useMemo(() => new Map(muscles.map(m => [m.muscle, m])), [muscles]);
  const current = muscleMap.get(selected);
  const bodyMuscles = MUSCLES.filter(m => m !== 'all');
  const bodyValue = bodyMetric === 'weight' ? latestMeasurement?.weight : latestMeasurement?.[bodyMetric];
  const bodyUnit = bodyMetric === 'weight' ? weightUnit : 'cm';
  const bodyDelta = history.length > 1 ? history[history.length - 1].value - history[0].value : null;

  return <Screen>
    <Eyebrow>PROGRESS // LOAD + BODY</Eyebrow><Text style={styles.title}>Sua evolução</Text>
    <View style={styles.modeRow}><Chip label="Força e carga" selected={mode === 'strength'} onPress={() => setMode('strength')} /><Chip label="Peso e medidas" selected={mode === 'body'} onPress={() => setMode('body')} /></View>

    {mode === 'strength' ? <>
      <Text style={{ color: colors.muted, lineHeight: 21 }}>Acompanhe a maior carga registrada por região e veja a evolução histórica dos seus treinos.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>{bodyMuscles.map(m => <Chip key={m} label={muscleLabel(m)} selected={selected === m} onPress={() => setSelected(m)} />)}</View>
      <Card><View style={styles.chartHeader}><View><Text style={{ fontWeight: '900', fontSize: 18 }}>{muscleLabel(selected)}</Text><Text style={{ color: colors.muted, fontSize: 12 }}>Maior carga ao longo do tempo</Text></View><View style={{ alignItems: 'flex-end' }}><Text style={{ color: colors.accent, fontWeight: '900', fontSize: 22 }}>{current ? compactNumber(current.current) : '—'} {current ? weightUnit : ''}</Text>{current && current.first > 0 ? <Text style={{ color: current.gainPct >= 0 ? colors.success : colors.danger, fontWeight: '800', fontSize: 11 }}>{current.gainPct >= 0 ? '+' : ''}{compactNumber(current.gainPct)}%</Text> : null}</View></View><ProgressChart points={history} /></Card>
      <SectionTitle title="Corpo completo" />
      <View style={styles.grid}>{bodyMuscles.map(m => { const p = muscleMap.get(m); return <Card key={m} style={styles.muscleCard}><Text style={{ color: colors.muted, fontSize: 11, fontWeight: '800' }}>{muscleLabel(m).toUpperCase()}</Text><Text style={{ fontSize: 20, fontWeight: '900', marginTop: 5 }}>{p ? `${compactNumber(p.current)} ${weightUnit}` : '—'}</Text><Text style={{ color: p?.gainPct && p.gainPct > 0 ? colors.success : colors.muted, fontSize: 11, marginTop: 4 }}>{p ? `${p.gainPct >= 0 ? '+' : ''}${compactNumber(p.gainPct)}% · ${p.sessions} treinos` : 'Sem dados ainda'}</Text></Card>; })}</View>
    </> : <>
      <Text style={{ color: colors.muted, lineHeight: 21 }}>Peso e circunferências ficam registrados por data. Assim você consegue ver ganho ou redução sem apagar medições antigas.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>{bodyMetrics.map(([key,label]) => <Chip key={key} label={label} selected={bodyMetric === key} onPress={() => setBodyMetric(key)} />)}</View>
      <Card><View style={styles.chartHeader}><View><Text style={{ fontWeight: '900', fontSize: 18 }}>{bodyMetrics.find(([key]) => key === bodyMetric)?.[1]}</Text><Text style={{ color: colors.muted, fontSize: 12 }}>Histórico corporal</Text></View><View style={{ alignItems: 'flex-end' }}><Text style={{ color: colors.accent, fontWeight: '900', fontSize: 22 }}>{bodyValue ? `${compactNumber(Number(bodyValue))} ${bodyUnit}` : '—'}</Text>{bodyDelta != null ? <Text style={{ color: bodyDelta === 0 ? colors.muted : bodyDelta > 0 ? colors.success : colors.warning, fontWeight: '800', fontSize: 11 }}>{bodyDelta > 0 ? '+' : ''}{compactNumber(bodyDelta)} {bodyUnit} desde o 1º registro</Text> : null}</View></View><ProgressChart points={history} /></Card>
      <Pressable onPress={() => router.push('/profile/measurements')}><Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center', borderColor: colors.accent }}><View style={[styles.measureIcon,{ backgroundColor: colors.accentSoft }]}><Ionicons name="body-outline" size={24} color={colors.accent} /></View><View style={{ flex: 1 }}><Text style={{ fontWeight: '900' }}>Registrar nova medição</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>Peso, cintura, peito, braços, coxas e panturrilhas.</Text></View><Ionicons name="chevron-forward" size={20} color={colors.accent} /></Card></Pressable>
    </>}

    <Pressable onPress={() => router.push('/workout/history')}><Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Ionicons name="time-outline" size={24} color={colors.accent} /><View style={{ flex: 1 }}><Text style={{ fontWeight: '900' }}>Histórico de todos os treinos</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>Veja carga máxima e séries de cada sessão.</Text></View><Ionicons name="chevron-forward" size={20} color={colors.muted} /></Card></Pressable>
  </Screen>;
}
const styles = StyleSheet.create({ title: { fontSize: 30, fontWeight: '900', letterSpacing: -1, marginTop: 7 }, modeRow: { flexDirection: 'row', gap: 8 }, chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, muscleCard: { width: '48%', padding: 13 }, measureIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' } });
