import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppProvider';
import { Text } from '@/components/Ui';
import { setNeoDialogListener, type NeoDialogAction, type NeoDialogConfig } from '@/services/dialog';

export function NeoDialogHost() {
  const { colors } = useApp();
  const [config, setConfig] = useState<NeoDialogConfig | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    setNeoDialogListener(setConfig);
    return () => setNeoDialogListener(null);
  }, []);

  useEffect(() => {
    if (!config) return;
    opacity.setValue(0);
    scale.setValue(0.94);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 170, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, damping: 18, stiffness: 230, mass: 0.7, useNativeDriver: true })
    ]).start();
  }, [config, opacity, scale]);

  if (!config) return null;
  const actions = config.actions?.length ? config.actions : [{ label: 'OK', style: 'accent' as const }];
  const closeAndRun = (action: NeoDialogAction) => {
    Animated.timing(opacity, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setConfig(null);
      if (action.onPress) Promise.resolve(action.onPress()).catch(() => {});
    });
  };

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={() => closeAndRun(actions.find(a => a.style === 'cancel') || actions[0])}>
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => {
          const cancel = actions.find(a => a.style === 'cancel');
          if (cancel) closeAndRun(cancel);
        }} />
        <Animated.View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, transform: [{ scale }] }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}>
            <Ionicons name={config.icon || 'sparkles-outline'} size={24} color={colors.accent} />
          </View>
          <Text style={styles.title}>{config.title}</Text>
          {config.message ? <Text style={[styles.message, { color: colors.muted }]}>{config.message}</Text> : null}
          <View style={styles.actions}>
            {actions.map((action, index) => {
              const danger = action.style === 'danger';
              const accent = action.style === 'accent' || (!action.style && index === actions.length - 1);
              const backgroundColor = danger ? colors.danger : accent ? colors.accent : colors.surfaceAlt;
              const color = danger || accent ? '#FFFFFF' : colors.text;
              return <Pressable key={`${action.label}-${index}`} onPress={() => closeAndRun(action)} style={({ pressed }) => [styles.action, { backgroundColor, opacity: pressed ? 0.78 : 1 }]}>
                <Text style={{ color, fontWeight: '900', fontSize: 13 }}>{action.label}</Text>
              </Pressable>;
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(5,4,8,0.72)', alignItems: 'center', justifyContent: 'center', padding: 22 },
  card: { width: '100%', maxWidth: 420, borderWidth: 1, borderRadius: 28, padding: 20, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 32, shadowOffset: { width: 0, height: 18 }, elevation: 16 },
  iconWrap: { width: 50, height: 50, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  message: { fontSize: 13, lineHeight: 20, marginTop: 8 },
  actions: { marginTop: 18, gap: 8 },
  action: { minHeight: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }
});
