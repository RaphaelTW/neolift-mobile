import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import * as Application from 'expo-application';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Button, Card, Chip, Eyebrow, SectionTitle, Text } from '@/components/Ui';
import { useApp } from '@/context/AppProvider';
import { installOrOpenRelease } from '@/services/githubUpdate';
import type { ThemeMode, WeightUnit } from '@/types';

export default function SettingsScreen() {
  const { colors, themeMode, weightUnit, setThemeMode, setWeightUnit, catalogCount, syncCatalog, syncingCatalog, releaseInfo, checkingUpdate, checkUpdates } = useApp();
  const [updating, setUpdating] = useState(false);
  const doCheck = async () => {
    const info = await checkUpdates();
    if (!info) return Alert.alert('Atualizações', 'Não foi possível consultar o GitHub agora.');
    Alert.alert('Atualizações', info.hasUpdate ? `NeoLift v${info.latestVersion} está disponível.` : `Você já está na versão mais recente (v${info.currentVersion}).`);
  };
  const install = async () => {
    if (!releaseInfo) return;
    setUpdating(true);
    try { await installOrOpenRelease(releaseInfo); }
    catch (e: any) { Alert.alert('Atualização', e?.message || 'Não foi possível abrir a atualização.'); }
    finally { setUpdating(false); }
  };
  const sync = async () => {
    try { const count = await syncCatalog(); Alert.alert('Catálogo atualizado', `${count} exercícios disponíveis localmente.`); }
    catch (e: any) { Alert.alert('Catálogo', e?.message || 'Falha ao sincronizar.'); }
  };
  return <Screen>
    <Eyebrow>SETTINGS // LOCAL FIRST</Eyebrow><Text style={styles.title}>Seu app, suas regras</Text><Text style={{ color: colors.muted, lineHeight: 21 }}>Não há conta obrigatória. Histórico e configurações ficam no banco SQLite do aparelho.</Text>
    <SectionTitle title="Aparência" /><Card><Text style={{ fontWeight: '900', marginBottom: 10 }}>Tema</Text><View style={styles.row}>{(['system','light','dark'] as ThemeMode[]).map(m => <Chip key={m} label={m === 'system' ? 'Sistema' : m === 'light' ? 'Claro' : 'Escuro'} selected={themeMode === m} onPress={() => setThemeMode(m)} />)}</View></Card>
    <Card><Text style={{ fontWeight: '900', marginBottom: 10 }}>Unidade de carga</Text><View style={styles.row}>{(['kg','lb'] as WeightUnit[]).map(u => <Chip key={u} label={u.toUpperCase()} selected={weightUnit === u} onPress={() => setWeightUnit(u)} />)}</View></Card>
    <SectionTitle title="Catálogo" /><Card><View style={styles.split}><View style={{ flex: 1 }}><Text style={{ fontWeight: '900' }}>free-exercise-db</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{catalogCount} exercícios no aparelho</Text></View><Ionicons name="cloud-download-outline" size={24} color={colors.accent} /></View><View style={{ height: 10 }} /><Button title="Sincronizar catálogo" onPress={sync} loading={syncingCatalog} kind="secondary" /></Card>
    <SectionTitle title="Atualizações" /><Card><View style={styles.split}><View style={{ flex: 1 }}><Text style={{ fontWeight: '900' }}>NeoLift v{Application.nativeApplicationVersion || '1.0.0'}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{releaseInfo?.hasUpdate ? `Nova versão v${releaseInfo.latestVersion} encontrada no GitHub.` : 'Verificação de releases do GitHub habilitada.'}</Text></View>{releaseInfo?.hasUpdate ? <View style={[styles.dot, { backgroundColor: colors.success }]} /> : null}</View><View style={{ height: 10 }} />{releaseInfo?.hasUpdate ? <Button title={Platform.OS === 'android' && releaseInfo.apkUrl ? 'Baixar e abrir instalador' : 'Abrir release'} onPress={install} loading={updating} /> : <Button title="Verificar agora" onPress={doCheck} loading={checkingUpdate} kind="secondary" />}<Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 9 }}>{Platform.OS === 'ios' ? 'No iOS, a instalação precisa passar pela App Store/TestFlight ou outro canal autorizado pela Apple; o GitHub é usado para detectar a release.' : 'No Android standalone, um APK anexado à release pode ser baixado e entregue ao instalador do sistema. O usuário ainda confirma a instalação.'}</Text></Card>
    <Card><Pressable><Text style={{ fontWeight: '900' }}>Privacidade</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>Nenhum histórico de treino é enviado a servidor próprio. Desinstalar o app remove os dados locais, salvo backup feito pelo sistema operacional.</Text></Pressable></Card>
  </Screen>;
}
const styles = StyleSheet.create({ title: { fontSize: 30, fontWeight: '900', letterSpacing: -1, marginTop: 7 }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, split: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, dot: { width: 10, height: 10, borderRadius: 5 } });
