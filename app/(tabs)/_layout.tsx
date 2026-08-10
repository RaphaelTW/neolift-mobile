import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppProvider';

const iconFor = (name: string, focused: boolean) => {
  const map: Record<string, [string,string]> = {
    index: ['home-outline','home'],
    exercises: ['search-outline','search'],
    workout: ['barbell-outline','barbell'],
    progress: ['analytics-outline','analytics'],
    settings: ['person-circle-outline','person-circle']
  };
  return (map[name] || ['ellipse-outline','ellipse'])[focused ? 1 : 0] as any;
};

export default function TabsLayout() {
  const { colors } = useApp();
  return <Tabs screenOptions={({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: colors.accent,
    tabBarInactiveTintColor: colors.muted,
    tabBarStyle: { position: 'absolute', height: 78, paddingTop: 8, paddingBottom: 10, backgroundColor: colors.tab, borderTopColor: colors.border },
    tabBarLabelStyle: { fontSize: 10, fontWeight: '800' },
    tabBarIcon: ({ focused, color, size }) => <Ionicons name={iconFor(route.name, focused)} size={size} color={color} />
  })}>
    <Tabs.Screen name="index" options={{ title: 'Início' }} />
    <Tabs.Screen name="exercises" options={{ title: 'Exercícios' }} />
    <Tabs.Screen name="workout" options={{ title: 'Plano' }} />
    <Tabs.Screen name="progress" options={{ title: 'Evolução' }} />
    <Tabs.Screen name="settings" options={{ title: 'Perfil' }} />
  </Tabs>;
}
