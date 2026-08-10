import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from './Ui';
import { useApp } from '@/context/AppProvider';

export function StatCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  const { colors } = useApp();
  return <Card style={styles.card}><Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700' }}>{label}</Text><Text style={{ fontSize: 25, fontWeight: '900', marginTop: 7 }}>{value}</Text>{helper ? <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>{helper}</Text> : null}</Card>;
}
const styles = StyleSheet.create({ card: { flex: 1, minWidth: 145, padding: 14 } });
