import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Settings, 
  Grid2x2 as Grid, 
  Star, 
  LogOut, 
  Shield, 
  Users, 
  Store, 
  FileText, 
  BarChart3,
  AlertTriangle,
  ShoppingBag,
  MessageSquare,
  TrendingUp
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdminStats } from '@/hooks/useAdminStats';
import { mockPosts } from '@/mock/Post';
import { mockUsers } from '@/mock/User';
import { Post } from '@/types/Post';
import { Theme } from '@/types/Theme';  

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: -100,
      paddingBottom: -100,
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
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    headerButtons: {
      flexDirection: 'row',
      gap: 16,
    },
    headerButton: {
      padding: 4,
    },
    content: {
      flex: 1,
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.background,
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    fullName: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    username: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 2,
    },
    bio: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      marginTop: 8,
      lineHeight: 20,
    },
    statsSection: {
      flexDirection: 'row',
      backgroundColor: theme.background,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.background,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    statLabel: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 4,
    },
    tabsSection: {
      flexDirection: 'row',
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      gap: 8,
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: theme.primary,
    },
    tabText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    activeTabText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.primary,
    },
    adminSection: {
      backgroundColor: theme.card,
      margin: 16,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    adminSectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 16,
    },
    adminSectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    adminGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    adminCard: {
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      width: '47%',
      alignItems: 'center',
    },
    adminCardIcon: {
      marginBottom: 8,
    },
    adminCardTitle: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    adminCardCount: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.primary,
    },
    quickStatsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    quickStatCard: {
      backgroundColor: theme.background,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.border,
      width: '47%',
    },
    quickStatTitle: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      marginBottom: 4,
    },
    quickStatValue: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    postsGrid: {
      backgroundColor: theme.background,
    },
    postsRow: {
      paddingHorizontal: 2,
    },
    postItem: {
      width: '33%',
      aspectRatio: 1,
      margin: 1,
      position: 'relative',
    },
    postImage: {
      width: '100%',
      height: '100%',
    },
    profileInfo: {
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: 16,
      marginTop: 12,
    },
    profileInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    profileLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.textSecondary,
      flex: 1,
    },
    profileValue: {
      fontSize: 16,
      color: theme.text,
      flex: 2,
      textAlign: 'right',
    },
    adminActionItem: {
      backgroundColor: theme.card,
      borderRadius: 12,
      marginVertical: 6,
      overflow: 'hidden',
    },
    adminActionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    adminActionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    adminActionText: {
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
    // Health card styles
    healthCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginTop: 12,
    },
    healthItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    healthLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.textSecondary,
    },
    healthValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
  });

export default function AdminProfile() {
  const { user, logout } = useAuth();
  const { stats, health, loading: statsLoading, error: statsError, refreshData } = useAdminStats();
  const [activeTab, setActiveTab] = React.useState<'profile' | 'analytics'>('profile');

  const handleTabPress = (tab: 'profile' | 'analytics') => {
    setActiveTab(tab);
  };
  const { theme } = useTheme();
  const myPosts = mockPosts.filter(post => post.user._id === user?._id);
  const likedPosts = mockPosts.filter(post => user?.likedPosts.includes(post._id));

  const styles = createStyles(theme);

  const handlePostPress = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const renderPost = ({ item }: { item: Post }) => {
    const user = mockUsers.find(user => user._id === item.user._id);
    if (!user) return null;

    return (
      <TouchableOpacity
        style={styles.postItem}
        onPress={() => handlePostPress(item._id)}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      </TouchableOpacity>
    )
  }

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Profile</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleSettingsPress}
          >
            <Settings size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={logout}>
            <LogOut size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image source={{ uri: user.avatar }} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <Text style={styles.fullName}>{user.fullName}</Text>
            <Text style={styles.username}>@{user.username}</Text>
            <Text style={styles.bio}>{user.bio}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.posts.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {user.followers.length.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.following.length.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {/* Admin Tabs */}
        <View style={styles.tabsSection}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'profile' ? styles.activeTab : {}]}
            onPress={() => handleTabPress('profile')}
            activeOpacity={0.7}
          >
            <Settings
              size={activeTab === 'profile' ? 22 : 20}
              color={activeTab === 'profile' ? theme.primary : theme.textSecondary}
            />
            <Text
              style={
                activeTab === 'profile' ? styles.activeTabText : styles.tabText
              }
            >
              Profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'analytics' ? styles.activeTab : {}]}
            onPress={() => handleTabPress('analytics')}
            activeOpacity={0.7}
          >
            <BarChart3
              size={activeTab === 'analytics' ? 22 : 20}
              color={activeTab === 'analytics' ? theme.primary : theme.textSecondary}
            />
            <Text
              style={
                activeTab === 'analytics' ? styles.activeTabText : styles.tabText
              }
            >
              Analytics
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <View>
            {/* Admin Profile Information */}
            <View style={styles.adminSection}>
              <View style={styles.adminSectionTitleContainer}>
                <Settings size={20} color={theme.primary} />
                <Text style={styles.adminSectionTitle}>Admin Profile</Text>
              </View>
              <View style={styles.profileInfo}>
                <View style={styles.profileInfoRow}>
                  <Text style={styles.profileLabel}>Name:</Text>
                  <Text style={styles.profileValue}>{user?.fullName}</Text>
                </View>
                <View style={styles.profileInfoRow}>
                  <Text style={styles.profileLabel}>Username:</Text>
                  <Text style={styles.profileValue}>@{user?.username}</Text>
                </View>
                <View style={styles.profileInfoRow}>
                  <Text style={styles.profileLabel}>Email:</Text>
                  <Text style={styles.profileValue}>{user?.email}</Text>
                </View>
                <View style={styles.profileInfoRow}>
                  <Text style={styles.profileLabel}>Role:</Text>
                  <Text style={[styles.profileValue, { color: theme.primary, fontWeight: '600' }]}>Administrator</Text>
                </View>
                <View style={styles.profileInfoRow}>
                  <Text style={styles.profileLabel}>Bio:</Text>
                  <Text style={styles.profileValue}>{user?.bio || 'System Administrator'}</Text>
                </View>
              </View>
            </View>

            {/* Quick Access */}
            <View style={styles.adminSection}>
              <View style={styles.adminSectionTitleContainer}>
                <Shield size={20} color={theme.primary} />
                <Text style={styles.adminSectionTitle}>Quick Access</Text>
              </View>
              <View style={styles.adminGrid}>
                <TouchableOpacity 
                  style={styles.adminCard}
                  onPress={() => router.push('/cart')}
                >
                  <AlertTriangle size={32} color="#EF4444" style={styles.adminCardIcon} />
                  <Text style={styles.adminCardTitle}>Reports</Text>
                  <Text style={styles.adminCardCount}>Manage</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.adminCard}
                  onPress={() => router.push('/wishlist')}
                >
                  <Users size={32} color="#10B981" style={styles.adminCardIcon} />
                  <Text style={styles.adminCardTitle}>Monitor</Text>
                  <Text style={styles.adminCardCount}>Users</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.adminCard}
                  onPress={() => router.push('/post/create')}
                >
                  <FileText size={32} color="#8B5CF6" style={styles.adminCardIcon} />
                  <Text style={styles.adminCardTitle}>Create</Text>
                  <Text style={styles.adminCardCount}>Announcement</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.adminCard}>
                  <Settings size={32} color="#F59E0B" style={styles.adminCardIcon} />
                  <Text style={styles.adminCardTitle}>Settings</Text>
                  <Text style={styles.adminCardCount}>System</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Admin Actions */}
            <View style={styles.adminSection}>
              <View style={styles.adminSectionTitleContainer}>
                <Shield size={20} color={theme.primary} />
                <Text style={styles.adminSectionTitle}>Admin Actions</Text>
              </View>
              <TouchableOpacity style={styles.adminActionItem}>
                <View style={styles.adminActionContent}>
                  <View style={styles.adminActionIcon}>
                    <Store size={24} color={theme.primary} />
                  </View>
                  <View style={styles.adminActionText}>
                    <Text style={styles.adminActionTitle}>Review Shop Requests</Text>
                    <Text style={styles.adminActionSubtitle}>Approve or reject promotion requests</Text>
                  </View>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.adminActionItem}
                onPress={logout}
              >
                <View style={styles.adminActionContent}>
                  <View style={styles.adminActionIcon}>
                    <LogOut size={24} color="#EF4444" />
                  </View>
                  <View style={styles.adminActionText}>
                    <Text style={[styles.adminActionTitle, { color: '#EF4444' }]}>Logout</Text>
                    <Text style={styles.adminActionSubtitle}>Sign out of admin account</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <View>
            {statsLoading ? (
              <View style={styles.adminSection}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.adminCardTitle, { textAlign: 'center', marginTop: 10 }]}>
                  Loading analytics...
                </Text>
              </View>
            ) : statsError ? (
              <View style={styles.adminSection}>
                <Text style={[styles.adminCardTitle, { color: '#EF4444', textAlign: 'center' }]}>
                  Error loading analytics: {statsError}
                </Text>
                <TouchableOpacity 
                  style={[styles.adminCard, { width: '100%', marginTop: 10 }]}
                  onPress={refreshData}
                >
                  <Text style={styles.adminCardTitle}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : stats ? (
              <>
                {/* Key Metrics */}
                <View style={styles.adminSection}>
                  <View style={styles.adminSectionTitleContainer}>
                    <TrendingUp size={20} color={theme.primary} />
                    <Text style={styles.adminSectionTitle}>Key Metrics</Text>
                  </View>
                  <View style={styles.quickStatsGrid}>
                    <View style={styles.quickStatCard}>
                      <Text style={styles.quickStatTitle}>Total Users</Text>
                      <Text style={styles.quickStatValue}>{stats.users.total.toLocaleString()}</Text>
                    </View>
                    <View style={styles.quickStatCard}>
                      <Text style={styles.quickStatTitle}>Active Shops</Text>
                      <Text style={styles.quickStatValue}>{stats.users.shops.toLocaleString()}</Text>
                    </View>
                    <View style={styles.quickStatCard}>
                      <Text style={styles.quickStatTitle}>Total Posts</Text>
                      <Text style={styles.quickStatValue}>{stats.content.posts.toLocaleString()}</Text>
                    </View>
                    <View style={styles.quickStatCard}>
                      <Text style={styles.quickStatTitle}>Pending Requests</Text>
                      <Text style={styles.quickStatValue}>{stats.promotionRequests.pending.toLocaleString()}</Text>
                    </View>
                  </View>
                </View>

                {/* Growth Analytics */}
                <View style={styles.adminSection}>
                  <View style={styles.adminSectionTitleContainer}>
                    <BarChart3 size={20} color={theme.primary} />
                    <Text style={styles.adminSectionTitle}>Growth Analytics (This Month)</Text>
                  </View>
                  <View style={styles.quickStatsGrid}>
                    <View style={styles.quickStatCard}>
                      <Text style={styles.quickStatTitle}>New Users</Text>
                      <Text style={styles.quickStatValue}>{stats.growth.newUsersThisMonth}</Text>
                    </View>
                    <View style={styles.quickStatCard}>
                      <Text style={styles.quickStatTitle}>New Shops</Text>
                      <Text style={styles.quickStatValue}>{stats.growth.newShopsThisMonth}</Text>
                    </View>
                    <View style={styles.quickStatCard}>
                      <Text style={styles.quickStatTitle}>New Posts</Text>
                      <Text style={styles.quickStatValue}>{stats.growth.newPostsThisMonth}</Text>
                    </View>
                    <View style={styles.quickStatCard}>
                      <Text style={styles.quickStatTitle}>New Products</Text>
                      <Text style={styles.quickStatValue}>{stats.growth.newProductsThisMonth}</Text>
                    </View>
                  </View>
                </View>

                {/* System Health */}
                {health && (
                  <View style={styles.adminSection}>
                    <View style={styles.adminSectionTitleContainer}>
                      <Shield size={20} color={theme.primary} />
                      <Text style={styles.adminSectionTitle}>System Health</Text>
                    </View>
                    <View style={styles.healthCard}>
                      <View style={styles.healthItem}>
                        <Text style={styles.healthLabel}>Database:</Text>
                        <Text style={[styles.healthValue, { color: health.database.connected ? '#10B981' : '#EF4444' }]}>
                          {health.database.connected ? 'Connected' : 'Disconnected'}
                        </Text>
                      </View>
                      <View style={styles.healthItem}>
                        <Text style={styles.healthLabel}>Status:</Text>
                        <Text style={[styles.healthValue, { color: health.status === 'healthy' ? '#10B981' : '#EF4444' }]}>
                          {health.status}
                        </Text>
                      </View>
                      <View style={styles.healthItem}>
                        <Text style={styles.healthLabel}>Uptime:</Text>
                        <Text style={styles.healthValue}>{Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m</Text>
                      </View>
                    </View>
                  </View>
                )}
              </>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
