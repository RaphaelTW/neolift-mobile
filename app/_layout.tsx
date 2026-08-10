import React from 'react';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '@/context/AppProvider';
import { migrateDb } from '@/db/schema';

function Navigation() {
  const { isDark } = useApp();
  return <><StatusBar style={isDark ? 'light' : 'dark'} /><Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
    <Stack.Screen name="exercise/[id]" />
    <Stack.Screen name="workout/session" />
    <Stack.Screen name="workout/history" />
    <Stack.Screen name="profile/edit" />
    <Stack.Screen name="profile/measurements" />
  </Stack></>;
}

export default function RootLayout() {
  return <SQLiteProvider databaseName="neolift.db" onInit={migrateDb}><AppProvider><Navigation /></AppProvider></SQLiteProvider>;
}
