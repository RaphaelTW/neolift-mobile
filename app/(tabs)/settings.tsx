import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import * as Application from 'expo-application';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { BrandMark } from '@/components/BrandMark';
import { Button, Card, Chip, Eyebrow, SectionTitle, Text } from '@/components/Ui';
import { useApp } from '@/context/AppProvider';
import type { ThemeMode, WeightUnit } from '@/types';
import { profileLabels } from '@/services/trainingPlan';
import { compactNumber } from '@/utils/format';
import { showNeoDialog } from '@/services/dialog';

export default function SettingsScreen() {
  const {
    colors, profile, latestMeasurement, themeMode, weightUnit, setThemeMode, setWeightUnit, catalogCount, catalogSources,
    syncCatalog, syncingCatalog, syncWger, syncingWger, releaseInfo, checkingUpdate, downloadingUpdate, downloadedUpdateUri,
    checkUpdates, downloadUpdate, installUpdate
  } = useApp();

  const doCheck = async () => {
    const info = await checkUpdates();
    if (!info) { showNeoDialog({ title: 'Atualizações', message: 'Não foi possível consultar o GitHub agora.', icon: 'cloud-offline-outline' }); return; }
    if (!info.hasUpdate) { showNeoDialog({ title: 'Tudo atualizado', message: `Você já está na versão mais recente (v${info.currentVersion}).`, icon: 'checkmark-circle-outline' }); return; }
    const policy = info.updateMode === 'forced' ? 'Como há 4 ou mais releases novas, o Android prepara automaticamente a versão mais recente.' : `Há ${info.newerReleaseCount} release${info.newerReleaseCount === 1 ? '' : 's'} nova${info.newerReleaseCount === 1 ? '' : 's'}.`;
    if (Platform.OS !== 'android') {
      showNeoDialog({ title: 'Nova versão disponível', message: `NeoLift v${info.latestVersion} está disponível.\n\n${policy}`, icon: 'cloud-download-outline' });
      return;
    }
    if (!info.apkUrl) {
      showNeoDialog({ title: 'APK ainda indisponível', message: `A release v${info.latestVersion} existe, mas ainda não possui um APK válido anexado.`, icon: 'warning-outline' });
      return;
    }
    try {
      await downloadUpdate(info);
      showNeoDialog({
        title: 'Atualização pronta',
        message: `NeoLift v${info.latestVersion} foi baixado e está pronto para instalar.\n\n${policy}`,
        icon: 'cloud-done-outline'
      });
    } catch (error: any) {
      showNeoDialog({ title: 'Atualização', message: error?.message || 'Não foi possível baixar a nova versão.', icon: 'warning-outline' });
    }
  };
  const sync = async () => { try { const count = await syncCatalog(); showNeoDialog({ title: 'Base offline atualizada', message: `${count} exercícios disponíveis no catálogo combinado.`, icon: 'checkmark-circle-outline' }); } catch (e: any) { showNeoDialog({ title: 'Catálogo', message: e?.message || 'Falha ao sincronizar.', icon: 'warning-outline' }); } };
  const syncWgerNow = async () => { try { const r = await syncWger(); showNeoDialog({ title: 'Wger sincronizado', message: `${r.fetched} exercícios lidos sem chave.\n${r.added} novos adicionados.\n${r.enriched} exercícios existentes enriquecidos com dados/mídias Wger.`, icon: 'cloud-done-outline' }); } catch (e: any) { showNeoDialog({ title: 'Wger', message: e?.message || 'Não foi possível sincronizar o Wger agora.', icon: 'warning-outline' }); } };
  const download = async () => { try { const uri = await downloadUpdate(); if (uri) showNeoDialog({ title: 'Atualização baixada', message: 'O APK está pronto. Toque em “Instalar atualização” para abrir o instalador do Android.', icon: 'download-outline' }); } catch (e: any) { showNeoDialog({ title: 'Atualização', message: e?.message || 'Não foi possível baixar a atualização.', icon: 'warning-outline' }); } };
  const install = async () => { try { await installUpdate(); } catch (e: any) { showNeoDialog({ title: 'Atualização', message: e?.message || 'Não foi possível abrir o instalador.', icon: 'warning-outline' }); } };

  return <Screen>
    <View style={styles.hero}><BrandMark size={64} /><View style={{ flex: 1 }}><Eyebrow>PROFILE // LOCAL FIRST</Eyebrow><Text style={styles.title}>Seu NeoLift</Text></View></View>

    {profile ? <Card style={{ borderColor: colors.accent }}>
      <View style={styles.split}><View style={{ flex: 1 }}><Text style={{ fontWeight: '900', fontSize: 19 }}>{profileLabels.experience[profile.experience]}</Text><Text style={{ color: colors.accent, fontWeight: '800', fontSize: 12, marginTop: 4 }}>{profileLabels.goal[profile.goal]}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 5 }}>{profile.age} anos · {profile.trainingDays} dias/semana{latestMeasurement ? ` · ${compactNumber(latestMeasurement.weight)} ${weightUnit}` : ''}</Text></View><Pressable onPress={() => router.push('/profile/edit')} style={[styles.iconButton,{ backgroundColor: colors.accentSoft }]}><Ionicons name="create-outline" size={21} color={colors.accent} /></Pressable></View>
      <View style={{ height: 10 }} /><Button title="Atualizar peso e medidas" onPress={() => router.push('/profile/measurements')} kind="secondary" />
    </Card> : <Button title="Criar perfil" onPress={() => router.push('/onboarding')} />}

    <SectionTitle title="Aparência" />
    <Card><Text style={{ fontWeight: '900', marginBottom: 10 }}>Tema</Text><View style={styles.row}>{(['system','light','dark'] as ThemeMode[]).map(m => <Chip key={m} label={m === 'system' ? 'Sistema' : m === 'light' ? 'Claro' : 'Escuro'} selected={themeMode === m} onPress={() => setThemeMode(m)} />)}</View><Text style={{ color: colors.muted, fontSize: 11, marginTop: 10 }}>Escuro: preto fosco. Claro: superfícies claras. Roxo é a cor principal nos dois modos.</Text></Card>
    <Card><Text style={{ fontWeight: '900', marginBottom: 10 }}>Unidade de carga</Text><View style={styles.row}>{(['kg','lb'] as WeightUnit[]).map(u => <Chip key={u} label={u.toUpperCase()} selected={weightUnit === u} onPress={() => setWeightUnit(u)} />)}</View></Card>

    <SectionTitle title="Catálogo" />
    <Card><View style={styles.split}><View style={{ flex: 1 }}><Text style={{ fontWeight: '900' }}>Biblioteca híbrida</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{catalogCount} exercícios no aparelho</Text><Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>Offline: {catalogSources.free + catalogSources.hybrid} • Wger: {catalogSources.wger + catalogSources.hybrid} • Híbridos: {catalogSources.hybrid}</Text></View><Ionicons name="library-outline" size={24} color={colors.accent} /></View></Card>
    <Card><View style={styles.split}><View style={{ flex: 1 }}><Text style={{ fontWeight: '900' }}>free-exercise-db</Text><Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>Base principal offline, sem conta obrigatória.</Text></View><Ionicons name="phone-portrait-outline" size={23} color={colors.accent} /></View><View style={{ height: 10 }} /><Button title="Sincronizar base offline" onPress={sync} loading={syncingCatalog} kind="secondary" /></Card>
    <Card style={{ borderColor: colors.accent }}><View style={styles.split}><View style={{ flex: 1 }}><Text style={{ fontWeight: '900' }}>Wger Open Exercise Library</Text><Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>Exercícios públicos sem login/API key. Novos exercícios são adicionados e equivalentes enriquecem a base atual com mídias disponíveis.</Text></View><Ionicons name="cloud-download-outline" size={24} color={colors.accent} /></View><View style={{ height: 10 }} /><Button title="Sincronizar exercícios do Wger" onPress={syncWgerNow} loading={syncingWger} /><Text style={{ color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 8 }}>Conteúdo Wger mantém fonte, autor e licença de cada entrada/mídia. A sincronização requer internet; depois os dados textuais ficam no SQLite local.</Text></Card>

    <SectionTitle title="Atualizações" />
    <Card>
      <View style={styles.split}><View style={{ flex: 1 }}><Text style={{ fontWeight: '900' }}>NeoLift v{Application.nativeApplicationVersion || '1.5.0'}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{releaseInfo?.hasUpdate ? `v${releaseInfo.latestVersion} disponível • ${releaseInfo.newerReleaseCount} releases à frente` : 'Verificação automática de GitHub Releases habilitada.'}</Text>{releaseInfo?.updateMode === 'forced' ? <Text style={{ color: colors.warning, fontSize: 11, marginTop: 5 }}>Política 4+: baixa a última release e abre o instalador automaticamente.</Text> : null}</View>{releaseInfo?.hasUpdate ? <View style={[styles.dot,{ backgroundColor: releaseInfo.updateMode === 'forced' ? colors.warning : colors.success }]} /> : null}</View>
      <View style={{ height: 10 }} />
      {releaseInfo?.hasUpdate && Platform.OS === 'android' && releaseInfo.apkUrl ? (downloadedUpdateUri ? <Button title="Instalar atualização" onPress={install} /> : <Button title="Baixar atualização" onPress={download} loading={downloadingUpdate} />) : <Button title="Verificar agora" onPress={doCheck} loading={checkingUpdate} kind="secondary" />}
      {releaseInfo?.hasUpdate ? <><View style={{ height: 8 }} /><Button title="Verificar novamente" onPress={doCheck} loading={checkingUpdate} kind="secondary" /></> : null}
      <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 9 }}>{Platform.OS === 'ios' ? 'No iOS, a detecção funciona pelo GitHub, mas a instalação deve usar App Store/TestFlight ou outro canal autorizado.' : 'No Android, 1–3 releases pedem confirmação. Com 4+ releases o app baixa a mais recente e abre o instalador; a confirmação final continua sendo do Android.'}</Text>
    </Card>

    <Card><Text style={{ fontWeight: '900' }}>Privacidade</Text><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 }}>Perfil, peso, medidas, histórico de carga e treinos ficam no SQLite do aparelho. Não existe conta obrigatória nem servidor próprio para esses dados.</Text></Card>
  </Screen>;
}

const styles = StyleSheet.create({ hero: { flexDirection: 'row', gap: 13, alignItems: 'center' }, title: { fontSize: 30, fontWeight: '900', letterSpacing: -1, marginTop: 4 }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, split: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, dot: { width: 10, height: 10, borderRadius: 5 }, iconButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' } });
