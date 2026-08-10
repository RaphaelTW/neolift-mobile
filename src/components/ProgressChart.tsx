import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { useApp } from '@/context/AppProvider';
import type { ProgressPoint } from '@/types';

export function ProgressChart({ points, height = 210 }: { points: ProgressPoint[]; height?: number }) {
  const { colors } = useApp();
  const width = 340;
  const padX = 28;
  const padY = 28;
  const values = points.map(p => p.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const coords = points.map((p, i) => ({
    x: padX + (i * (width - padX * 2)) / Math.max(points.length - 1, 1),
    y: height - padY - ((p.value - min) / range) * (height - padY * 2),
    ...p
  }));
  const line = coords.map(p => `${p.x},${p.y}`).join(' ');

  if (points.length === 0) return <View style={[styles.empty, { height, borderColor: colors.border }]}><Svg width="100%" height="100%"><SvgText x="50%" y="50%" textAnchor="middle" fill={colors.muted} fontSize="13">Registre cargas para gerar o gráfico</SvgText></Svg></View>;

  return <View style={{ alignItems: 'center' }}><Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
    {[0.25, 0.5, 0.75].map((f, i) => <Line key={i} x1={padX} x2={width - padX} y1={padY + f * (height - padY * 2)} y2={padY + f * (height - padY * 2)} stroke={colors.border} strokeWidth="1" strokeDasharray="4 6" />)}
    <Polyline points={line} fill="none" stroke={colors.accent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    {coords.map((p, i) => <React.Fragment key={`${p.date}-${i}`}><Circle cx={p.x} cy={p.y} r="5" fill={colors.surface} stroke={colors.accent} strokeWidth="3" />{i === 0 || i === coords.length - 1 ? <><SvgText x={p.x} y={Math.max(14, p.y - 12)} textAnchor="middle" fill={colors.text} fontSize="11" fontWeight="700">{p.value}</SvgText><SvgText x={p.x} y={height - 7} textAnchor="middle" fill={colors.muted} fontSize="9">{p.label}</SvgText></> : null}</React.Fragment>)}
  </Svg></View>;
}
const styles = StyleSheet.create({ empty: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' } });
