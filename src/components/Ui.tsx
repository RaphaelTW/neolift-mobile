import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text as RNText, View, type TextProps, type ViewProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppProvider';

export function Text({ style, ...props }: TextProps) {
  const { colors } = useApp();
  return <RNText {...props} style={[{ color: colors.text, fontSize: 15 }, style]} />;
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  const { colors } = useApp();
  return <RNText style={{ color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1.3, textTransform: 'uppercase' }}>{children}</RNText>;
}

export function Card({ style, children, ...props }: ViewProps) {
  const { colors, isDark } = useApp();
  return <View {...props} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowOpacity: isDark ? 0 : 0.06 }, style]}>{children}</View>;
}

export function Button({ title, onPress, kind = 'primary', loading = false, disabled = false }: { title: string; onPress: () => void; kind?: 'primary' | 'secondary' | 'danger'; loading?: boolean; disabled?: boolean }) {
  const { colors } = useApp();
  const bg = kind === 'primary' ? colors.accent : kind === 'danger' ? colors.danger : colors.surfaceAlt;
  const fg = kind === 'secondary' ? colors.text : '#FFFFFF';
  return (
    <Pressable disabled={disabled || loading} onPress={() => { Haptics.selectionAsync().catch(() => {}); onPress(); }} style={({ pressed }) => [styles.button, { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.78 : 1 }]}>
      {loading ? <ActivityIndicator color={fg} /> : <RNText style={{ color: fg, fontWeight: '800', fontSize: 15 }}>{title}</RNText>}
    </Pressable>
  );
}

export function Chip({ label, selected = false, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const { colors } = useApp();
  return <Pressable onPress={onPress} style={[styles.chip, { backgroundColor: selected ? colors.accentSoft : colors.surface, borderColor: selected ? colors.accent : colors.border }]}><RNText style={{ color: selected ? colors.accent : colors.muted, fontWeight: '700', fontSize: 12 }}>{label}</RNText></Pressable>;
}

export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}><Text style={{ fontSize: 18, fontWeight: '900' }}>{title}</Text>{action}</View>;
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowRadius: 20 },
  button: { minHeight: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }
});
