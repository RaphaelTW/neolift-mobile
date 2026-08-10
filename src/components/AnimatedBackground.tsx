import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useApp } from '@/context/AppProvider';

export function AnimatedBackground() {
  const { colors, isDark } = useApp();
  const drift = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const driftLoop = Animated.loop(Animated.sequence([
      Animated.timing(drift, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(drift, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
    ]));
    const pulseLoop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 5200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 5200, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
    ]));
    driftLoop.start();
    pulseLoop.start();
    return () => { driftLoop.stop(); pulseLoop.stop(); };
  }, [drift, pulse]);

  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <Animated.View style={[
      styles.orb,
      styles.orbOne,
      { backgroundColor: colors.glow, opacity: isDark ? 0.11 : 0.08 },
      { transform: [
        { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [-18, 42] }) },
        { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [8, 70] }) },
        { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] }) }
      ] }
    ]} />
    <Animated.View style={[
      styles.orb,
      styles.orbTwo,
      { backgroundColor: colors.accent2, opacity: isDark ? 0.08 : 0.06 },
      { transform: [
        { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [28, -24] }) },
        { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [-22, 34] }) },
        { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1.08, 0.94] }) }
      ] }
    ]} />
    <View style={[styles.grid, { borderColor: colors.accent, opacity: isDark ? 0.022 : 0.018 }]} />
  </View>;
}

const styles = StyleSheet.create({
  orb: { position: 'absolute', width: 300, height: 300, borderRadius: 150 },
  orbOne: { top: -120, right: -115 },
  orbTwo: { bottom: 60, left: -170, width: 360, height: 360, borderRadius: 180 },
  grid: { position: 'absolute', top: 84, left: -60, width: 520, height: 520, borderWidth: 36, borderRadius: 260, transform: [{ rotate: '18deg' }] }
});
