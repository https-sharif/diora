import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Image } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { messageService } from '@/services';
import { useMessage } from '@/hooks/useMessage';

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
  const { isAuthenticated, loading, user, token } = useAuth();
  const { setConversations } = useMessage();
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
          if (isAuthenticated && user) {
            if (user.type === 'admin') {
              router.replace('/(tabs)');
            } else {
              const needsOnboarding = !user.onboarding?.isComplete;

              if (needsOnboarding) {
                router.replace('/onboarding');
              } else {
                router.replace('/(tabs)');
              }
            }
          } else {
            router.replace('/auth');
          }
        }, 500);
      } else {
        if (isAuthenticated && user) {
          if (user.type === 'admin') {
            router.replace('/(tabs)');
          } else {
            const needsOnboarding = !user.onboarding?.isComplete;

            if (needsOnboarding) {
              router.replace('/onboarding');
            } else {
              router.replace('/(tabs)');
            }
          }
        } else {
          router.replace('/auth');
        }
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, loading, user, fadeAnim]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!token) return;
      const response = await messageService.getConversations(token);

      if (response.status) {
        setConversations(response.conversations);
      }
    };

    fetchConversations();
  }, [token, user]);

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
