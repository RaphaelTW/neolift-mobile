import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Button, Card, Eyebrow, Text } from '@/components/Ui';
import { useApp } from '@/context/AppProvider';

export default function WorkoutScreen() {
  const { colors, activeWorkoutId, activeExercises, startWorkout } = useApp();
  const open = async () => { await startWorkout(); router.push('/workout/session'); };
  const doneSets = activeExercises.flatMap(e => e.sets).filter(s => s.completed).length;
  const totalSets = activeExercises.flatMap(e => e.sets).length;
  return <Screen>
    <Eyebrow>SESSION // LIVE</Eyebrow><Text style={styles.title}>{activeWorkoutId ? 'Seu treino está ativo' : 'Monte o treino na hora'}</Text><Text style={{ color: colors.muted, lineHeight: 21 }}>Sem cadastro obrigatório, sem nuvem. O treino fica no aparelho e pode ser retomado se você fechar o app.</Text>
    <Card style={styles.main}><View style={[styles.icon, { backgroundColor: colors.accentSoft }]}><Ionicons name="barbell" size={32} color={colors.accent} /></View><Text style={{ fontWeight: '900', fontSize: 21 }}>{activeWorkoutId ? `${activeExercises.length} exercícios` : 'Treino livre'}</Text><Text style={{ color: colors.muted, textAlign: 'center' }}>{activeWorkoutId ? `${doneSets}/${totalSets || 0} séries concluídas` : 'Adicione exercícios, ajuste cargas e marque cada série conforme executa.'}</Text></Card>
    <Button title={activeWorkoutId ? 'Continuar treino' : 'Começar agora'} onPress={open} />
    <Card><Text style={{ fontWeight: '900', marginBottom: 7 }}>Como a evolução é calculada</Text><Text style={{ color: colors.muted, lineHeight: 21 }}>A carga registrada em cada série alimenta o histórico do exercício e do músculo principal. Assim, uma progressão de 5 kg para 10 kg aparece automaticamente nos gráficos.</Text></Card>
  </Screen>;
}
const styles = StyleSheet.create({ title: { fontSize: 30, fontWeight: '900', letterSpacing: -1, marginTop: 7 }, main: { alignItems: 'center', gap: 12, paddingVertical: 30 }, icon: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' } });
