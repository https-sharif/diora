import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Heart, MessageCircle, UserPlus, AtSign, Package, Tag, Trash2, Check, CheckCheck, Star, BellOff } from 'lucide-react-native';
import { useNotification } from '@/hooks/useNotification';
import { Notification } from '@/types/Notification';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

const createStyle = (theme: any) => StyleSheet.create({
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.text,
    marginLeft: 8,
  },
  notificationsList: {
    paddingBottom: 50,
  },
  notificationItem: {
    backgroundColor: theme.background,
  },
  unreadNotification: {
    backgroundColor: theme.card,
  },
  selectedNotification: {
    backgroundColor: theme.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  notificationAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: theme.primary,
  },
  notificationBody: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
  },
  notificationRight: {
    alignItems: 'center',
    gap: 8,
  },
  postThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  selectionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.border,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedCircle: {
    backgroundColor: theme.background,
    borderColor: theme.background,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

const getNotificationIcon = (type: Notification['type'], theme : any) => {
  switch (type) {
    case 'like':
      return <Star size={20} color= "#FFD700" fill="#FFD700" />;
    case 'comment':
      return <MessageCircle size={20} color="#1DA1F2" fill="#1DA1F2" />;
    case 'follow':
      return <UserPlus size={20} color="#17BF63"/>;
    case 'mention':
      return <AtSign size={20} color="#794BC4" />;
    case 'order':
      return <Package size={20} color='#FF9500' />;
    case 'promotion':
      return <Tag size={20} color="#FF9FF3" />;
    default:
      return <Heart size={20} color="#ff453a" />;
  }
};

export default function NotificationsScreen() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotification();
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const { theme } = useTheme();

  const styles = createStyle(theme);

  const handleNotificationPress = (notification: Notification) => {
    if (selectionMode) {
      toggleSelection(notification._id);
      return;
    }

    if (!notification.read) {
      markAsRead(notification._id);
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl as any);
    }
  };

  const toggleSelection = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleLongPress = (notificationId: string) => {
    setSelectionMode(true);
    setSelectedNotifications([notificationId]);
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedNotifications([]);
  };

  const deleteSelected = () => {
    Alert.alert(
      'Delete Notifications',
      `Are you sure you want to delete ${selectedNotifications.length} notification(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            selectedNotifications.forEach(id => deleteNotification(id));
            exitSelectionMode();
          },
        },
      ]
    );
  };

  const markSelectedAsRead = () => {
    selectedNotifications.forEach(id => markAsRead(id));
    exitSelectionMode();
  };

  const formatTime = (timestamp: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, value] of Object.entries(intervals)) {
      const count = Math.floor(seconds / value);
      if (count >= 1) {
        return `${count} ${unit}${count > 1 ? 's' : ''} ago`;
      }
    }

    return `just now`;
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification,
        selectedNotifications.includes(item._id) && styles.selectedNotification,
      ]}
      onPress={() => handleNotificationPress(item)}
      onLongPress={() => handleLongPress(item._id)}
    >
      <View style={styles.notificationContent}>
        {selectionMode && (
            <View style={[
              styles.selectionCircle,
              selectedNotifications.includes(item._id) && styles.selectedCircle
            ]}>
              {selectedNotifications.includes(item._id) && (
                <Check size={12} color={theme.text} />
              )}
            </View>
          )}
        <View style={styles.notificationLeft}>
          <View style={styles.iconContainer}>
            {getNotificationIcon(item.type, theme)}
          </View>
          {item.avatar && (
            <Image source={{ uri: item.avatar }} style={styles.notificationAvatar} />
          )}
        </View>

        <View style={styles.notificationBody}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{formatTime(item.timestamp)}</Text>
        </View>

        <View style={styles.notificationRight}>
          {/* Implement Later */}
          {/* {item.postImage && (
            // <Image source={{ uri: item.postImage }} style={styles.postThumbnail} />
          )} */}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <BellOff size={48} color={theme.text} />
      </View>
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptyMessage}>
        No notifications to show. You will see updates here when you receive new notifications.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={selectionMode ? exitSelectionMode : () => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {selectionMode ? `${selectedNotifications.length} selected` : 'Notifications'}
        </Text>

        {selectionMode ? (
          <>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={markSelectedAsRead}
            >
              <CheckCheck size={24} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={deleteSelected}
            >
              <Trash2 size={24} color={theme.error} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={markAllAsRead}
            >
              <Check size={24} color={theme.text} />
            </TouchableOpacity>
          </>
        ) }
      </View>

      {notifications.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.notificationsList}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
}