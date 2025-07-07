import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Image } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotificationStore } from '@/stores/useNotificationStore';

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    logo: {
      width: 150,
      height: 150,
    },
  });

export default function Index() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { isAuthenticated, loading, login } = useAuth();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      setSplashDone(true);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (__DEV__ && !isAuthenticated) {
      login('1', '1');
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const types = ['like', 'comment', 'follow'] as const;
      const randomType = types[Math.floor(Math.random() * types.length)];
      const messages = {
        like: 'Someone liked your post',
        comment: 'Someone commented on your post',
        follow: 'Someone started following you',
      };
  
      useNotificationStore.getState().addNotification({
        type: randomType,
        title: `New ${randomType}`,
        message: messages[randomType],
        avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100',
        userId: '1',
      });
    }, 30000);
  
    return () => clearInterval(interval);
  }, []);
  

  useEffect(() => {
    if (splashDone && !loading) {
      router.replace(isAuthenticated ? '/(tabs)' : '/auth');
    }
  }, [splashDone, loading, isAuthenticated]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image
        source={
          theme.mode === 'light'
            ? require('../assets/images/lightIcon.png')
            : require('../assets/images/darkIcon.png')
        }
        style={styles.logo}
      />
    </Animated.View>
  );
}
