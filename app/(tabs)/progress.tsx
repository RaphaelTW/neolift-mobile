import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card, Chip, Eyebrow, SectionTitle, Text } from '@/components/Ui';
import { ProgressChart } from '@/components/ProgressChart';
import { useApp } from '@/context/AppProvider';
import type { ProgressPoint } from '@/types';
import { MUSCLES, muscleLabel } from '@/utils/muscles';
import { compactNumber } from '@/utils/format';

export default function ProgressScreen() {
  const { colors, muscles, refreshProgress, getMuscleHistory, weightUnit } = useApp();
  const [selected, setSelected] = useState('chest');
  const [history, setHistory] = useState<ProgressPoint[]>([]);
  useFocusEffect(useCallback(() => { refreshProgress(); }, [refreshProgress]));
  useEffect(() => { getMuscleHistory(selected).then(setHistory); }, [selected, getMuscleHistory, muscles]);
  const muscleMap = useMemo(() => new Map(muscles.map(m => [m.muscle, m])), [muscles]);
  const current = muscleMap.get(selected);
  const bodyMuscles = MUSCLES.filter(m => m !== 'all');

  return <Screen>
    <Eyebrow>PROGRESS // BODY MAP</Eyebrow><Text style={styles.title}>Evolução por região</Text><Text style={{ color: colors.muted, lineHeight: 21 }}>Cada gráfico usa a maior carga registrada naquele dia em exercícios cujo músculo principal pertence à região selecionada.</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>{bodyMuscles.map(m => <Chip key={m} label={muscleLabel(m)} selected={selected === m} onPress={() => setSelected(m)} />)}</ScrollView>
    <Card><View style={styles.chartHeader}><View><Text style={{ fontWeight: '900', fontSize: 18 }}>{muscleLabel(selected)}</Text><Text style={{ color: colors.muted, fontSize: 12 }}>Maior carga ao longo do tempo</Text></View><View style={{ alignItems: 'flex-end' }}><Text style={{ color: colors.accent, fontWeight: '900', fontSize: 22 }}>{current ? compactNumber(current.current) : '—'} {current ? weightUnit : ''}</Text>{current && current.first > 0 ? <Text style={{ color: current.gainPct >= 0 ? colors.success : colors.danger, fontWeight: '800', fontSize: 11 }}>{current.gainPct >= 0 ? '+' : ''}{compactNumber(current.gainPct)}%</Text> : null}</View></View><ProgressChart points={history} /></Card>
    <SectionTitle title="Corpo completo" />
    <View style={styles.grid}>{bodyMuscles.map(m => { const p = muscleMap.get(m); return <Card key={m} style={styles.muscleCard}><Text style={{ color: colors.muted, fontSize: 11, fontWeight: '800' }}>{muscleLabel(m).toUpperCase()}</Text><Text style={{ fontSize: 20, fontWeight: '900', marginTop: 5 }}>{p ? `${compactNumber(p.current)} ${weightUnit}` : '—'}</Text><Text style={{ color: p?.gainPct && p.gainPct > 0 ? colors.success : colors.muted, fontSize: 11, marginTop: 4 }}>{p ? `${p.gainPct >= 0 ? '+' : ''}${compactNumber(p.gainPct)}% · ${p.sessions} treinos` : 'Sem dados ainda'}</Text></Card>; })}</View>
  </Screen>;
}
const styles = StyleSheet.create({ title: { fontSize: 30, fontWeight: '900', letterSpacing: -1, marginTop: 7 }, chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, muscleCard: { width: '48%', padding: 13 } });
