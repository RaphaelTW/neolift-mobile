import React from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppProvider';

export function Screen({ children, scroll = true, contentContainerStyle, ...props }: ScrollViewProps & { scroll?: boolean }) {
  const { colors } = useApp();
  if (!scroll) {
    return <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}><View style={[styles.content, contentContainerStyle as ViewProps['style']]}>{children}</View></SafeAreaView>;
  }
  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, contentContainerStyle]} {...props}>{children}</ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({ safe: { flex: 1 }, content: { padding: 18, paddingBottom: 120, gap: 14 } });
