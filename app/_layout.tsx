import { useEffect } from 'react';
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
import { ThemeProvider } from '@/contexts/ThemeContext';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { SafeAreaProvider } from '@/contexts/SafeAreaContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '@/hooks/useAuth';

SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
  useFrameworkReady();
  const insets = useSafeAreaInsets();

  return (
      <ThemeProvider>
        <SafeAreaProvider>
          <AppReadyWrapper insets={insets} />
        </SafeAreaProvider>
      </ThemeProvider>
  );
}

function AppReadyWrapper({ insets }: { insets: EdgeInsets }) {
  const { theme, isDarkMode } = useTheme();
  const { loading } = useAuth();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded && !loading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loading]);

  if (!fontsLoaded || loading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: theme.background, paddingBottom: insets.bottom, paddingTop: insets.top }} >
      <Stack screenOptions={{ headerShown: false }} >
        <Stack.Screen name='empty' options={{ headerShown: false }} />
        <Stack.Screen name='index' options={{ headerShown: false }} />
        <Stack.Screen name='auth' options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="product/[productId]" options={{ headerShown: false }} />
        <Stack.Screen name="post/[postId]" options={{ headerShown: false }} />
        <Stack.Screen name="user/[userId]" options={{ headerShown: false }} />
        <Stack.Screen name="shop/[shopId]" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
      </Stack>
    </View>
    <StatusBar style={isDarkMode ? 'light' : 'dark'} animated translucent backgroundColor="transparent" />
    </GestureHandlerRootView>
  );
}
