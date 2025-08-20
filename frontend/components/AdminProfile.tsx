import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, LogOut, Shield, User } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/types/Theme';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingVertical: -100,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.background,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
    },
    profileSection: {
      paddingHorizontal: 16,
      paddingVertical: 24,
      backgroundColor: theme.background,
      marginTop: 0,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginRight: 16,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    adminBadge: {
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    adminBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#000',
    },
    adminSection: {
      backgroundColor: theme.card,
      margin: 16,
      borderRadius: 12,
      padding: 16,
    },
    adminSectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    adminSectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginLeft: 8,
    },
    profileInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    profileInfoLabel: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    profileInfoValue: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
    },
    adminActions: {
      gap: 12,
      marginTop: 16,
    },
    adminAction: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    adminActionContent: {
      marginLeft: 12,
      flex: 1,
    },
    adminActionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    adminActionSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
    },
  });

export default function AdminProfile() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const styles = createStyles(theme);

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Profile</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Image
              source={{
                uri: user.avatar || 'https://via.placeholder.com/80x80',
              }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.username}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Administrator</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.adminSection}>
          <View style={styles.adminSectionTitleContainer}>
            <Shield size={20} color={theme.primary} />
            <Text style={styles.adminSectionTitle}>Account Information</Text>
          </View>
          <View style={{ gap: 12 }}>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>User ID:</Text>
              <Text style={styles.profileInfoValue}>{user._id}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>Account Type:</Text>
              <Text style={styles.profileInfoValue}>Administrator</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>Status:</Text>
              <Text style={[styles.profileInfoValue, { color: '#10B981' }]}>
                Active
              </Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>Member Since:</Text>
              <Text style={styles.profileInfoValue}>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.adminActions}>
            <TouchableOpacity
              style={styles.adminAction}
              onPress={() => router.push('/settings')}
            >
              <Settings size={20} color={theme.primary} />
              <View style={styles.adminActionContent}>
                <Text style={styles.adminActionTitle}>Account Settings</Text>
                <Text style={styles.adminActionSubtitle}>
                  Manage your account preferences
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.adminAction}
              onPress={() => router.push('/admin/promotion-requests')}
            >
              <User size={20} color={theme.primary} />
              <View style={styles.adminActionContent}>
                <Text style={styles.adminActionTitle}>Promotion Requests</Text>
                <Text style={styles.adminActionSubtitle}>
                  Approve/reject shop promotion requests
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.adminAction} onPress={logout}>
              <LogOut size={20} color="#EF4444" />
              <View style={styles.adminActionContent}>
                <Text style={[styles.adminActionTitle, { color: '#EF4444' }]}>
                  Logout
                </Text>
                <Text style={styles.adminActionSubtitle}>
                  Sign out of admin account
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
