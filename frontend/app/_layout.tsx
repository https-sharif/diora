import React, { useEffect } from 'react';
import { router, SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Alert } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { SafeAreaProvider } from '@/contexts/SafeAreaContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { useMessage } from '@/hooks/useMessage';
import { useShopping } from '@/hooks/useShopping';
import { ToastProvider, useGlobalToast } from '@/contexts/ToastContext';
import { GlobalToast } from '@/components/GlobalToast';
import { initializeGlobalToast } from '@/utils/toastUtils';
import initSocket, { getSocket } from './utils/useSocket';
import { Message } from '@/types/Message';
import * as Linking from 'expo-linking';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const insets = useSafeAreaInsets();

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <ToastProvider>
          <AppReadyWrapper insets={insets} />
        </ToastProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

function AppReadyWrapper({ insets }: { insets: EdgeInsets }) {
  const { theme, isDarkMode } = useTheme();
  const { user, loading, syncUser } = useAuth();
  const { handleIncomingNotification } = useNotification();
  const { handleIncomingMessage } = useMessage();
  const { initializeUserData, fetchCart } = useShopping();

  const toastInstance = useGlobalToast();
  React.useEffect(() => {
    initializeGlobalToast(toastInstance);
  }, [toastInstance]);

  useEffect(() => {
    const handleUrl = async ({ url }: { url: string }) => {
      const { path, queryParams } = Linking.parse(url);
      const params = queryParams || {};

      if (path === 'order-success') {
        Alert.alert(
          'Payment Completed!',
          `Order #${params.orderId ?? ''} is paid.`
        );

        await fetchCart();
        Alert.alert(
          'Order Placed Successfully!',
          `Order #${
            params.orderId ?? ''
          } has been placed. You will receive updates via email.`,
          [
            {
              text: 'View Order',
              onPress: () => router.push(`/order/${params.orderId ?? ''}`),
            },
            {
              text: 'Continue Shopping',
              onPress: () => router.push('/shopping'),
            },
          ]
        );
      } else if (path === 'order-cancel') {
        Alert.alert('Payment Cancelled', 'Your payment was not completed.');
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    return () => subscription.remove();
  }, [fetchCart]);

  useEffect(() => {
    if (user?._id && user?.onboarding?.isComplete) {
      initializeUserData();
      syncUser();
    }
  }, [user?._id, user?.onboarding?.isComplete, initializeUserData, syncUser]);
  useEffect(() => {
    if (user?._id) {
      const onNotification = (notif: any) => {
        console.log('🔔 Handling incoming notification');
        handleIncomingNotification(notif);
      };

      const onMessage = (data: {
        conversationId: string;
        message: Message;
      }) => {
        console.log('💬 Handling incoming message for conversation:', data.conversationId);
        handleIncomingMessage(data.conversationId, data.message);
      };

      const onConnect = () => {
        console.log('✅ Socket connected');
      };

      const onDisconnect = () => {
        console.log('🔌 Socket disconnected');
      };

      const onMessageReaction = (data: any) => {
        console.log('😀 Handling message reaction');
      };

      const onMessageDeleted = (data: any) => {
        console.log('🗑️ Handling message deleted');
      };

      const onMessagesRead = (data: any) => {
        console.log('👀 Handling messages read');
      };

      initSocket(
        user._id,
        onNotification,
        onMessage,
        onConnect,
        onDisconnect,
        onMessageReaction,
        onMessageDeleted,
        onMessagesRead
      );

      return () => {
        const socket = getSocket();
        socket.off('notification');
        socket.off('newMessage');
        socket.off('messageReaction');
        socket.off('messageDeleted');
        socket.off('messagesRead');
        socket.disconnect();
      };
    }
  }, [
    user?._id,
    handleIncomingNotification,
    handleIncomingMessage,
  ]);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const [initialLoadComplete, setInitialLoadComplete] = React.useState(false);

  useEffect(() => {
    if (fontsLoaded && !loading && !initialLoadComplete) {
      setInitialLoadComplete(true);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loading, initialLoadComplete]);

  if (!fontsLoaded || (!initialLoadComplete && loading)) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          paddingBottom: insets.bottom,
          paddingTop: insets.top,
        }}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="empty" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
          <Stack.Screen
            name="product/[productId]"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="post/[postId]" options={{ headerShown: false }} />
          <Stack.Screen name="user/[userId]" options={{ headerShown: false }} />
          <Stack.Screen name="shop/[shopId]" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="pastOrder" options={{ headerShown: false }} />
        </Stack>
        <GlobalToast />
      </View>
      <StatusBar
        style={isDarkMode ? 'light' : 'dark'}
        animated
        translucent
        backgroundColor="transparent"
      />
    </GestureHandlerRootView>
  );
}
