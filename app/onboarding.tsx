import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { BrandMark } from '@/components/BrandMark';
import { Button, Card, Chip, Eyebrow, Text } from '@/components/Ui';
import { useApp } from '@/context/AppProvider';
import type { ExperienceLevel, FitnessGoal, Gender } from '@/types';
import { profileLabels } from '@/services/trainingPlan';

const numberValue = (value: string) => Number(value.replace(',', '.')) || 0;

export default function OnboardingScreen() {
  const { colors, weightUnit, saveProfile, recordMeasurement } = useApp();
  const [gender, setGender] = useState<Gender>('prefer_not_to_say');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [experience, setExperience] = useState<ExperienceLevel>('beginner');
  const [goal, setGoal] = useState<FitnessGoal>('gain_muscle');
  const [trainingDays, setTrainingDays] = useState(3);
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    const ageNumber = Math.round(numberValue(age));
    const weightNumber = numberValue(weight);
    if (ageNumber < 13 || ageNumber > 100) return Alert.alert('Idade', 'Informe uma idade entre 13 e 100 anos.');
    if (weightNumber <= (weightUnit === 'kg' ? 20 : 44) || weightNumber > (weightUnit === 'kg' ? 400 : 880)) return Alert.alert('Peso', `Informe um peso válido em ${weightUnit}.`);

    setSaving(true);
    try {
      await saveProfile({ gender, age: ageNumber, experience, goal, trainingDays, onboardingCompleted: true });
      await recordMeasurement({ weight: weightNumber, neck: null, chest: null, waist: null, hips: null, leftArm: null, rightArm: null, leftThigh: null, rightThigh: null, leftCalf: null, rightCalf: null });
      if (ageNumber < 18) {
        Alert.alert('Perfil criado', 'Para menores de 18 anos, o NeoLift mantém sugestões conservadoras. Supervisão de um profissional qualificado é recomendada.');
      }
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  return <Screen>
    <View style={styles.brandRow}>
      <BrandMark size={66} />
      <View style={{ flex: 1 }}><Eyebrow>NEOLIFT // SETUP</Eyebrow><Text style={styles.title}>Vamos montar seu ponto de partida.</Text></View>
    </View>
    <Text style={{ color: colors.muted, lineHeight: 21 }}>Seu perfil fica somente neste aparelho e serve para ajustar volume, frequência e acompanhar sua evolução. A carga sugerida nunca é obrigatória.</Text>

    <Card>
      <View style={styles.cardTitle}><Ionicons name="person-outline" size={21} color={colors.accent} /><Text style={styles.heading}>Perfil básico</Text></View>
      <Text style={styles.label}>Sexo</Text>
      <View style={styles.wrap}>{(['male','female','prefer_not_to_say'] as Gender[]).map(item => <Chip key={item} label={profileLabels.gender[item]} selected={gender === item} onPress={() => setGender(item)} />)}</View>
      <View style={styles.twoCols}>
        <View style={{ flex: 1 }}><Text style={styles.label}>Idade</Text><TextInput value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="Ex.: 28" placeholderTextColor={colors.muted} style={[styles.input,{ color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} /></View>
        <View style={{ flex: 1 }}><Text style={styles.label}>Peso atual ({weightUnit})</Text><TextInput value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="Ex.: 78,5" placeholderTextColor={colors.muted} style={[styles.input,{ color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} /></View>
      </View>
    </Card>

    <Card>
      <View style={styles.cardTitle}><Ionicons name="speedometer-outline" size={21} color={colors.accent} /><Text style={styles.heading}>Experiência</Text></View>
      <View style={styles.wrap}>{(['beginner','intermediate','advanced'] as ExperienceLevel[]).map(item => <Chip key={item} label={profileLabels.experience[item]} selected={experience === item} onPress={() => { setExperience(item); setTrainingDays(item === 'beginner' ? 3 : item === 'intermediate' ? 4 : 5); }} />)}</View>
      <Text style={[styles.label,{ marginTop: 15 }]}>Dias de treino por semana</Text>
      <View style={styles.wrap}>{[2,3,4,5,6].map(item => <Chip key={item} label={`${item} dias`} selected={trainingDays === item} onPress={() => setTrainingDays(item)} />)}</View>
    </Card>

    <Card>
      <View style={styles.cardTitle}><Ionicons name="flag-outline" size={21} color={colors.accent} /><Text style={styles.heading}>Objetivo principal</Text></View>
      <View style={styles.wrap}>{(['lose_fat','gain_muscle','gain_weight'] as FitnessGoal[]).map(item => <Chip key={item} label={profileLabels.goal[item]} selected={goal === item} onPress={() => setGoal(item)} />)}</View>
      <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 12 }}>O plano mensal usa seu objetivo e experiência. Sexo e peso não são usados para inventar uma carga inicial: as sugestões de peso passam a usar seu desempenho real.</Text>
    </Card>

    <Button title="Criar meu plano" onPress={finish} loading={saving} />
  </Screen>;
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', gap: 14, alignItems: 'center', marginTop: 6 },
  title: { fontSize: 27, lineHeight: 31, fontWeight: '900', letterSpacing: -1, marginTop: 4 },
  cardTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  heading: { fontWeight: '900', fontSize: 18 },
  label: { fontSize: 11, fontWeight: '800', marginBottom: 7, marginTop: 4 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  twoCols: { flexDirection: 'row', gap: 10, marginTop: 12 },
  input: { height: 50, borderWidth: 1, borderRadius: 15, paddingHorizontal: 13, fontWeight: '700' }
});
