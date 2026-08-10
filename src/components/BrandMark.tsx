import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '@/context/AppProvider';

export function BrandMark({ size = 58 }: { size?: number }) {
  const { colors } = useApp();
  return <View style={[styles.shell, { width: size, height: size, borderRadius: Math.round(size * 0.31), backgroundColor: colors.accentSoft, borderColor: colors.accent }]}> 
    <View style={[styles.inner, { backgroundColor: colors.accent, borderRadius: Math.round(size * 0.24) }]}>
      <MaterialCommunityIcons name="weight-lifter" size={Math.round(size * 0.56)} color="#FFFFFF" />
    </View>
  </View>;
}

const styles = StyleSheet.create({
  shell: { borderWidth: 1, padding: 5 },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});
