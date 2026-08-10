import React from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import * as Application from 'expo-application';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Button, Card, Chip, Eyebrow, SectionTitle, Text } from '@/components/Ui';
import { useApp } from '@/context/AppProvider';
import type { ThemeMode, WeightUnit } from '@/types';

export default function SettingsScreen() {
  const {
    colors,
    themeMode,
    weightUnit,
    setThemeMode,
    setWeightUnit,
    catalogCount,
    syncCatalog,
    syncingCatalog,
    releaseInfo,
    checkingUpdate,
    downloadingUpdate,
    downloadedUpdateUri,
    checkUpdates,
    downloadUpdate,
    installUpdate
  } = useApp();

  const doCheck = async () => {
    const info = await checkUpdates();
    if (!info) return Alert.alert('Atualizações', 'Não foi possível consultar o GitHub agora.');
    if (!info.hasUpdate) {
      return Alert.alert('Atualizações', `Você já está na versão mais recente (v${info.currentVersion}).`);
    }

    const policy = info.updateMode === 'forced'
      ? 'Como há 4 ou mais releases novas, o Android prepara automaticamente a versão mais recente.'
      : `Há ${info.newerReleaseCount} release${info.newerReleaseCount === 1 ? '' : 's'} nova${info.newerReleaseCount === 1 ? '' : 's'}.`;
    Alert.alert('Nova versão disponível', `NeoLift v${info.latestVersion} está disponível.\n\n${policy}`);
  };

  const sync = async () => {
    try {
      const count = await syncCatalog();
      Alert.alert('Catálogo atualizado', `${count} exercícios disponíveis localmente.`);
    } catch (e: any) {
      Alert.alert('Catálogo', e?.message || 'Falha ao sincronizar.');
    }
  };

  const download = async () => {
    try {
      const uri = await downloadUpdate();
      if (uri) Alert.alert('Atualização baixada', 'O APK está pronto. Toque em “Instalar atualização” para abrir o instalador do Android.');
    } catch (e: any) {
      Alert.alert('Atualização', e?.message || 'Não foi possível baixar a atualização.');
    }
  };

  const install = async () => {
    try {
      await installUpdate();
    } catch (e: any) {
      Alert.alert('Atualização', e?.message || 'Não foi possível abrir o instalador. Verifique a permissão para instalar apps desta fonte.');
    }
  };

  return <Screen>
    <Eyebrow>SETTINGS // LOCAL FIRST</Eyebrow>
    <Text style={styles.title}>Seu app, suas regras</Text>
    <Text style={{ color: colors.muted, lineHeight: 21 }}>Não há conta obrigatória. Histórico e configurações ficam no banco SQLite do aparelho.</Text>

    <SectionTitle title="Aparência" />
    <Card>
      <Text style={{ fontWeight: '900', marginBottom: 10 }}>Tema</Text>
      <View style={styles.row}>{(['system','light','dark'] as ThemeMode[]).map(m => <Chip key={m} label={m === 'system' ? 'Sistema' : m === 'light' ? 'Claro' : 'Escuro'} selected={themeMode === m} onPress={() => setThemeMode(m)} />)}</View>
    </Card>

    <Card>
      <Text style={{ fontWeight: '900', marginBottom: 10 }}>Unidade de carga</Text>
      <View style={styles.row}>{(['kg','lb'] as WeightUnit[]).map(u => <Chip key={u} label={u.toUpperCase()} selected={weightUnit === u} onPress={() => setWeightUnit(u)} />)}</View>
    </Card>

    <SectionTitle title="Catálogo" />
    <Card>
      <View style={styles.split}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '900' }}>free-exercise-db</Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{catalogCount} exercícios no aparelho</Text>
          <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>Fonte pública sem API key; o catálogo continua disponível offline.</Text>
        </View>
        <Ionicons name="cloud-download-outline" size={24} color={colors.accent} />
      </View>
      <View style={{ height: 10 }} />
      <Button title="Sincronizar catálogo" onPress={sync} loading={syncingCatalog} kind="secondary" />
    </Card>

    <SectionTitle title="Atualizações" />
    <Card>
      <View style={styles.split}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '900' }}>NeoLift v{Application.nativeApplicationVersion || '1.1.0'}</Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>
            {releaseInfo?.hasUpdate
              ? `v${releaseInfo.latestVersion} disponível • ${releaseInfo.newerReleaseCount} release${releaseInfo.newerReleaseCount === 1 ? '' : 's'} à frente`
              : 'Verificação automática de GitHub Releases habilitada.'}
          </Text>
          {releaseInfo?.updateMode === 'forced' ? <Text style={{ color: colors.warning, fontSize: 11, marginTop: 5 }}>Política 4+: baixa a última release e abre o instalador automaticamente.</Text> : null}
        </View>
        {releaseInfo?.hasUpdate ? <View style={[styles.dot, { backgroundColor: releaseInfo.updateMode === 'forced' ? colors.warning : colors.success }]} /> : null}
      </View>

      <View style={{ height: 10 }} />
      {releaseInfo?.hasUpdate && Platform.OS === 'android' && releaseInfo.apkUrl ? (
        downloadedUpdateUri
          ? <Button title="Instalar atualização" onPress={install} />
          : <Button title="Baixar atualização" onPress={download} loading={downloadingUpdate} />
      ) : (
        <Button title="Verificar agora" onPress={doCheck} loading={checkingUpdate} kind="secondary" />
      )}

      {releaseInfo?.hasUpdate ? <><View style={{ height: 8 }} /><Button title="Verificar novamente" onPress={doCheck} loading={checkingUpdate} kind="secondary" /></> : null}

      <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 9 }}>
        {Platform.OS === 'ios'
          ? 'No iOS, o GitHub detecta a nova release, mas a instalação precisa usar App Store/TestFlight ou outro canal autorizado pela Apple.'
          : 'No Android: com 1–3 releases de diferença o APK é preparado e o app pede confirmação. Com 4+ releases de diferença ele baixa a última e abre o instalador automaticamente. O Android ainda exige a confirmação do usuário na tela do sistema.'}
      </Text>
    </Card>

    <Card>
      <Pressable>
        <Text style={{ fontWeight: '900' }}>Privacidade</Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>Nenhum histórico de treino é enviado a servidor próprio. Desinstalar o app remove os dados locais, salvo backup feito pelo sistema operacional.</Text>
      </Pressable>
    </Card>
  </Screen>;
}

const styles = StyleSheet.create({
  title: { fontSize: 30, fontWeight: '900', letterSpacing: -1, marginTop: 7 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  split: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 }
});
