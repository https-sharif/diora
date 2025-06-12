import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { ShoppingProvider } from '@/contexts/ShoppingContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import React from 'react';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { SafeAreaProvider } from '@/contexts/SafeAreaContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const insets = useSafeAreaInsets();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider>
      <ThemeAwareRoot insets={insets} />
    </ThemeProvider>
  );
}

function ThemeAwareRoot({ insets }: { insets: EdgeInsets }) {
  const { theme, isDarkMode } = useTheme();

  return (
    <SafeAreaProvider>
    <AuthProvider>
      <NotificationProvider>
        <ShoppingProvider>
          <View style={{ flex: 1, backgroundColor: theme.background, paddingBottom: insets.bottom, paddingTop: insets.top }} >
            <Stack screenOptions={{ headerShown: false }} >
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="notifications" options={{ headerShown: false }} />
              <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="post/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="user/[username]" options={{ headerShown: false }} />
              <Stack.Screen name="shop/[shopname]" options={{ headerShown: false }} />
              <Stack.Screen name="settings" options={{ headerShown: false }} />
            </Stack>
          </View>
          <StatusBar style={isDarkMode ? 'light' : 'dark'} animated translucent backgroundColor="transparent" />
        </ShoppingProvider>
      </NotificationProvider>
    </AuthProvider>
    </SafeAreaProvider>
  );
}
