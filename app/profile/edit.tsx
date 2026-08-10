import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Button, Card, Chip, Eyebrow, Text } from '@/components/Ui';
import { useApp } from '@/context/AppProvider';
import type { ExperienceLevel, FitnessGoal, Gender } from '@/types';
import { profileLabels } from '@/services/trainingPlan';
import { showNeoDialog } from '@/services/dialog';

export default function EditProfileScreen() {
  const { colors, profile, saveProfile } = useApp();
  const [gender, setGender] = useState<Gender>('prefer_not_to_say');
  const [age, setAge] = useState('');
  const [experience, setExperience] = useState<ExperienceLevel>('beginner');
  const [goal, setGoal] = useState<FitnessGoal>('gain_muscle');
  const [trainingDays, setTrainingDays] = useState(3);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setGender(profile.gender); setAge(String(profile.age)); setExperience(profile.experience); setGoal(profile.goal); setTrainingDays(profile.trainingDays);
  }, [profile]);

  const save = async () => {
    const n = Math.round(Number(age) || 0);
    if (n < 13 || n > 100) { showNeoDialog({ title: 'Idade inválida', message: 'Informe uma idade entre 13 e 100 anos.', icon: 'calendar-outline' }); return; }
    setSaving(true);
    try {
      await saveProfile({ gender, age: n, experience, goal, trainingDays, onboardingCompleted: true });
      router.back();
    } finally { setSaving(false); }
  };

  return <Screen>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={[styles.back,{ backgroundColor: colors.surface }]}><Ionicons name="chevron-back" size={23} color={colors.text} /></Pressable><View><Eyebrow>PROFILE // EDIT</Eyebrow><Text style={styles.title}>Seu perfil</Text></View></View>
    <Card><Text style={styles.label}>Sexo</Text><View style={styles.wrap}>{(['male','female','prefer_not_to_say'] as Gender[]).map(item => <Chip key={item} label={profileLabels.gender[item]} selected={gender === item} onPress={() => setGender(item)} />)}</View><Text style={styles.label}>Idade</Text><TextInput value={age} onChangeText={setAge} keyboardType="number-pad" style={[styles.input,{ color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} /></Card>
    <Card><Text style={styles.label}>Nível</Text><View style={styles.wrap}>{(['beginner','intermediate','advanced'] as ExperienceLevel[]).map(item => <Chip key={item} label={profileLabels.experience[item]} selected={experience === item} onPress={() => setExperience(item)} />)}</View><Text style={styles.label}>Dias por semana</Text><View style={styles.wrap}>{[2,3,4,5,6].map(item => <Chip key={item} label={`${item} dias`} selected={trainingDays === item} onPress={() => setTrainingDays(item)} />)}</View></Card>
    <Card><Text style={styles.label}>Foco</Text><View style={styles.wrap}>{(['lose_fat','gain_muscle','gain_weight'] as FitnessGoal[]).map(item => <Chip key={item} label={profileLabels.goal[item]} selected={goal === item} onPress={() => setGoal(item)} />)}</View></Card>
    <Button title="Salvar perfil" onPress={save} loading={saving} />
  </Screen>;
}

const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, back: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 27, fontWeight: '900', marginTop: 3 }, label: { fontSize: 11, fontWeight: '800', marginTop: 8, marginBottom: 8 }, wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, input: { borderWidth: 1, borderRadius: 14, height: 48, paddingHorizontal: 12, fontWeight: '700' } });
