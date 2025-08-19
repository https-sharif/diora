import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, MessageCircle } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { useMessage } from '@/hooks/useMessage';
import { router } from 'expo-router';
import PostCard from '@/components/PostCard';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/types/Theme';
import axios from 'axios';
import { config } from '@/config';

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingVertical: -100,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.background,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 16,
    },
    notificationButton: {
      position: 'relative',
      padding: 8,
    },
    notificationBadge: {
      position: 'absolute',
      top: 2,
      right: 2,
      backgroundColor: theme.error,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.background,
    },
    notificationBadgeText: {
      color: '#fff',
      fontSize: 11,
      fontFamily: 'Inter-Bold',
    },
    feed: {
      padding: 16,
      paddingBottom: 50,
    },
  });
};

export default function FeedScreen() {
  const { isAuthenticated, user, token } = useAuth();
  const { unreadCount } = useNotification();
  const { conversations } = useMessage();
  const [posts, setPosts] = useState();
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const styles = createStyles(theme);

  // Calculate unread conversations count
  const unreadConversationsCount = conversations?.filter(conv => 
    conv.unreadCount && user?._id && conv.unreadCount[user._id] > 0
  ).length || 0;

  // Move all useEffects before early returns
  useEffect(() => {
    if (user?.type === 'admin') {
      router.replace('/(tabs)/analytics');
    }
  }, [user]);

  useEffect(() => {
    if(!user || !token) return;
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${config.apiUrl}/api/post`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data.status) {
          setPosts(response.data.posts);
        }
      } catch (err: any) {
        console.error('❌ Refresh failed:', err.response?.data || err.message);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [user, token]);

  if (!isAuthenticated) {
    return null;
  }

  const onRefresh = async () => {
    if(!user) return;
    setRefreshing(true);

    try {
      const response = await axios.get(`${config.apiUrl}/api/post`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.status) {
        setPosts(response.data.posts);
      }
    } catch (err: any) {
      console.error('❌ Refresh failed:', err.response?.data || err.message);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  const handleMessagePress = () => {
    router.push('/messages');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Diora</Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={handleNotificationPress}
            >
              <Bell size={24} color={theme.text} strokeWidth={2} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.notificationButton}
              onPress={handleMessagePress}
            >
              <MessageCircle size={24} color={theme.text} strokeWidth={2} />
              {unreadConversationsCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadConversationsCount > 99 ? '99+' : unreadConversationsCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.text} />
          <Text style={{ color: theme.text, fontSize: 16 , marginTop: 8 }}>
            Loading posts...
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => <PostCard post={item} />}
          contentContainerStyle={styles.feed}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
