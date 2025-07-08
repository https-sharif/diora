import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import ShopProfile from '@/components/ShopProfile';
import UserProfile from '@/components/UserProfile';
import AdminProfile from '@/components/AdminProfile';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: -100,
      paddingBottom: -100,
    },
  });

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      {user?.type === 'user' ? (
        <UserProfile />
      ) : user?.type === 'shop' ? (
        <ShopProfile />
      ) : (
        <AdminProfile />
      )}
    </SafeAreaView>
  );
}
