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
  const { isAuthenticated, loading, user } = useAuth();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      if (loading) {
        setTimeout(() => {
          if (isAuthenticated) {
            router.replace('/(tabs)');
          } else {
            router.replace('/auth');
          }
        }, 500);
      } else {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/auth');
        }
      }
    }, 1000);
  
    return () => clearTimeout(timeout);
  }, []);

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
