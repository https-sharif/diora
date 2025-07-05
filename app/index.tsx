import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Image } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

const createStyles = (theme: any) => {
  return StyleSheet.create({
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
}

export default function Index() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { isAuthenticated, loading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (loading) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        router.replace(isAuthenticated ? '/(tabs)' : '/auth');
      });
    }
  }, [loading, isAuthenticated]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Image source={theme.mode === 'light' ? require('../assets/images/lightIcon.png') : require('../assets/images/darkIcon.png')} style={styles.logo} />
    </Animated.View>
  );
}
