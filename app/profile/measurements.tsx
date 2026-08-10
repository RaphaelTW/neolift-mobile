import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Button, Card, Eyebrow, Text } from '@/components/Ui';
import { useApp } from '@/context/AppProvider';

const parse = (v: string) => v.trim() ? Number(v.replace(',', '.')) || null : null;

export default function MeasurementsScreen() {
  const { colors, latestMeasurement, recordMeasurement, weightUnit } = useApp();
  const initial = useMemo(() => latestMeasurement, [latestMeasurement]);
  const [weight, setWeight] = useState(initial ? String(initial.weight) : '');
  const [values, setValues] = useState<Record<string,string>>({
    neck: initial?.neck ? String(initial.neck) : '', chest: initial?.chest ? String(initial.chest) : '', waist: initial?.waist ? String(initial.waist) : '', hips: initial?.hips ? String(initial.hips) : '',
    leftArm: initial?.leftArm ? String(initial.leftArm) : '', rightArm: initial?.rightArm ? String(initial.rightArm) : '', leftThigh: initial?.leftThigh ? String(initial.leftThigh) : '', rightThigh: initial?.rightThigh ? String(initial.rightThigh) : '', leftCalf: initial?.leftCalf ? String(initial.leftCalf) : '', rightCalf: initial?.rightCalf ? String(initial.rightCalf) : ''
  });
  const [saving, setSaving] = useState(false);
  const set = (key: string, value: string) => setValues(old => ({ ...old, [key]: value }));

  const save = async () => {
    const w = Number(weight.replace(',', '.')) || 0;
    if (w <= (weightUnit === 'kg' ? 20 : 44) || w > (weightUnit === 'kg' ? 400 : 880)) return Alert.alert('Peso', `Informe seu peso atual em ${weightUnit}.`);
    setSaving(true);
    try {
      await recordMeasurement({ weight: w, neck: parse(values.neck), chest: parse(values.chest), waist: parse(values.waist), hips: parse(values.hips), leftArm: parse(values.leftArm), rightArm: parse(values.rightArm), leftThigh: parse(values.leftThigh), rightThigh: parse(values.rightThigh), leftCalf: parse(values.leftCalf), rightCalf: parse(values.rightCalf) });
      Alert.alert('Medidas registradas', 'O novo ponto já aparece na evolução corporal.', [{ text: 'OK', onPress: () => router.back() }]);
    } finally { setSaving(false); }
  };

  const Field = ({ id, label, unit = 'cm' }: { id: string; label: string; unit?: string }) => <View style={styles.fieldWrap}><Text style={styles.label}>{label}</Text><View style={[styles.fieldBox,{ borderColor: colors.border, backgroundColor: colors.background }]}><TextInput value={id === 'weight' ? weight : values[id]} onChangeText={id === 'weight' ? setWeight : v => set(id,v)} keyboardType="decimal-pad" placeholder="—" placeholderTextColor={colors.muted} style={{ flex: 1, color: colors.text, fontWeight: '800' }} /><Text style={{ color: colors.muted, fontSize: 11 }}>{unit}</Text></View></View>;

  return <Screen>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={[styles.back,{ backgroundColor: colors.surface }]}><Ionicons name="chevron-back" size={23} color={colors.text} /></Pressable><View><Eyebrow>BODY // TRACKING</Eyebrow><Text style={styles.title}>Atualizar medidas</Text></View></View>
    <Text style={{ color: colors.muted, lineHeight: 20 }}>Registre quando quiser. O NeoLift mantém cada medição para mostrar aumento ou redução ao longo do tempo.</Text>
    <Card><Field id="weight" label="Peso atual" unit={weightUnit} /><View style={styles.grid}><Field id="neck" label="Pescoço" /><Field id="chest" label="Peitoral" /><Field id="waist" label="Cintura" /><Field id="hips" label="Quadril" /><Field id="leftArm" label="Braço E" /><Field id="rightArm" label="Braço D" /><Field id="leftThigh" label="Coxa E" /><Field id="rightThigh" label="Coxa D" /><Field id="leftCalf" label="Panturrilha E" /><Field id="rightCalf" label="Panturrilha D" /></View></Card>
    <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 17 }}>Dica: tente medir sempre em condições semelhantes. As circunferências são registradas em centímetros.</Text>
    <Button title="Salvar nova medição" onPress={save} loading={saving} />
  </Screen>;
}

const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, back: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 27, fontWeight: '900', marginTop: 3 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 }, fieldWrap: { width: '48%', marginBottom: 5 }, label: { fontSize: 10, fontWeight: '800', marginBottom: 6 }, fieldBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 13, height: 46, paddingHorizontal: 11, gap: 6 } });
