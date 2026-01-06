import { useEffect } from 'react';
import * as React from 'react';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import 'react-native-reanimated';
import '../global.css';

import { StoreProvider, parentStore } from '@/stores/root';

SplashScreen.preventAutoHideAsync();

function AppContent({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider value={parentStore}>
      {children}
    </StoreProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Custom dark theme matching our design system
  const darkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: '#6EE7FF',
      background: '#0B0F14',
      card: '#111827',
      text: '#F8FAFC',
      border: 'rgba(148,163,184,0.18)',
      notification: '#FB7185',
    },
  };

  return (
    <AppContent>
      <ThemeProvider value={darkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(driver-onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="chat/[id]" />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </AppContent>
  );
}