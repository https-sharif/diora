import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, BarChart3, Shield } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Theme } from '@/types/Theme';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingVertical: -100,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: -100,
    },
    loadingText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: theme.text,
      textAlign: 'center',
      marginTop: 16,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    errorText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: '#EF4444',
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: theme.accent,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: '#000',
    },
    adminSection: {
      backgroundColor: theme.background,
      padding: 20,
      marginBottom: 1,
    },
    adminSectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
    },
    adminSectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    quickStatsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    quickStatCard: {
      backgroundColor: theme.card,
      padding: 16,
      borderRadius: 12,
      flex: 1,
      minWidth: '45%',
      alignItems: 'center',
    },
    quickStatTitle: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    quickStatValue: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      textAlign: 'center',
    },
    healthCard: {
      backgroundColor: theme.card,
      padding: 16,
      borderRadius: 12,
      gap: 12,
    },
    healthItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    healthLabel: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    healthValue: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    unauthorizedContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    unauthorizedText: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.textSecondary,
      textAlign: 'center',
    },
  });

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const {
    stats,
    health,
    loading: statsLoading,
    error: statsError,
    refreshData,
  } = useAdminStats();
  const styles = createStyles(theme);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  if (!user || user.type !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <Shield size={48} color={theme.textSecondary} />
          <Text style={styles.unauthorizedText}>Admin access required</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
      </View>

      {statsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      ) : statsError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error loading analytics: {statsError}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.accent]}
              tintColor={theme.accent}
            />
          }
        >
          {stats ? (
            <>
              <View style={styles.adminSection}>
                <View style={styles.adminSectionTitleContainer}>
                  <TrendingUp size={20} color={theme.accent} />
                  <Text style={styles.adminSectionTitle}>Key Metrics</Text>
                </View>
                <View style={styles.quickStatsGrid}>
                  <View style={styles.quickStatCard}>
                    <Text style={styles.quickStatTitle}>Total Users</Text>
                    <Text style={styles.quickStatValue}>
                      {stats.users.total.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.quickStatCard}>
                    <Text style={styles.quickStatTitle}>Active Shops</Text>
                    <Text style={styles.quickStatValue}>
                      {stats.users.shops.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.quickStatCard}>
                    <Text style={styles.quickStatTitle}>Total Posts</Text>
                    <Text style={styles.quickStatValue}>
                      {stats.content.posts.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.quickStatCard}>
                    <Text style={styles.quickStatTitle}>Pending Requests</Text>
                    <Text style={styles.quickStatValue}>
                      {stats.promotionRequests.pending.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.adminSection}>
                <View style={styles.adminSectionTitleContainer}>
                  <BarChart3 size={20} color={theme.accent} />
                  <Text style={styles.adminSectionTitle}>
                    Growth Analytics (This Month)
                  </Text>
                </View>
                <View style={styles.quickStatsGrid}>
                  <View style={styles.quickStatCard}>
                    <Text style={styles.quickStatTitle}>New Users</Text>
                    <Text style={styles.quickStatValue}>
                      {stats.growth.newUsersThisMonth}
                    </Text>
                  </View>
                  <View style={styles.quickStatCard}>
                    <Text style={styles.quickStatTitle}>New Shops</Text>
                    <Text style={styles.quickStatValue}>
                      {stats.growth.newShopsThisMonth}
                    </Text>
                  </View>
                  <View style={styles.quickStatCard}>
                    <Text style={styles.quickStatTitle}>New Posts</Text>
                    <Text style={styles.quickStatValue}>
                      {stats.growth.newPostsThisMonth}
                    </Text>
                  </View>
                  <View style={styles.quickStatCard}>
                    <Text style={styles.quickStatTitle}>New Products</Text>
                    <Text style={styles.quickStatValue}>
                      {stats.growth.newProductsThisMonth}
                    </Text>
                  </View>
                </View>
              </View>

              {health && (
                <View style={styles.adminSection}>
                  <View style={styles.adminSectionTitleContainer}>
                    <Shield size={20} color={theme.accent} />
                    <Text style={styles.adminSectionTitle}>System Health</Text>
                  </View>
                  <View style={styles.healthCard}>
                    <View style={styles.healthItem}>
                      <Text style={styles.healthLabel}>Database:</Text>
                      <Text
                        style={[
                          styles.healthValue,
                          {
                            color: health.database.connected
                              ? '#10B981'
                              : '#EF4444',
                          },
                        ]}
                      >
                        {health.database.connected
                          ? 'Connected'
                          : 'Disconnected'}
                      </Text>
                    </View>
                    <View style={styles.healthItem}>
                      <Text style={styles.healthLabel}>Status:</Text>
                      <Text
                        style={[
                          styles.healthValue,
                          {
                            color:
                              health.status === 'healthy'
                                ? '#10B981'
                                : '#EF4444',
                          },
                        ]}
                      >
                        {health.status}
                      </Text>
                    </View>
                    <View style={styles.healthItem}>
                      <Text style={styles.healthLabel}>Uptime:</Text>
                      <Text style={styles.healthValue}>
                        {Math.floor(health.uptime / 3600)}h{' '}
                        {Math.floor((health.uptime % 3600) / 60)}m
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
