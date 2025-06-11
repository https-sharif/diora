import React, { useState } from 'react';
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
import { ArrowLeft, Heart, MessageCircle, UserPlus, AtSign, Package, Tag, MoveVertical as MoreVertical, Trash2, Check, CheckCheck } from 'lucide-react-native';
import { useNotifications, Notification } from '@/contexts/NotificationContext';

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'like':
      return <Heart size={20} color="#FF6B6B" fill="#FF6B6B" />;
    case 'comment':
      return <MessageCircle size={20} color="#4ECDC4" />;
    case 'follow':
      return <UserPlus size={20} color="#45B7D1" />;
    case 'mention':
      return <AtSign size={20} color="#96CEB4" />;
    case 'order':
      return <Package size={20} color="#FECA57" />;
    case 'promotion':
      return <Tag size={20} color="#FF9FF3" />;
    default:
      return <Heart size={20} color="#666" />;
  }
};

export default function NotificationsScreen() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications 
  } = useNotifications();
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const handleNotificationPress = (notification: Notification) => {
    if (selectionMode) {
      toggleSelection(notification.id);
      return;
    }

    if (!notification.read) {
      markAsRead(notification.id);
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

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification,
        selectedNotifications.includes(item.id) && styles.selectedNotification,
      ]}
      onPress={() => handleNotificationPress(item)}
      onLongPress={() => handleLongPress(item.id)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationLeft}>
          <View style={styles.iconContainer}>
            {getNotificationIcon(item.type)}
          </View>
          {item.avatar && (
            <Image source={{ uri: item.avatar }} style={styles.notificationAvatar} />
          )}
        </View>

        <View style={styles.notificationBody}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{item.timestamp}</Text>
        </View>

        <View style={styles.notificationRight}>
          {item.postImage && (
            <Image source={{ uri: item.postImage }} style={styles.postThumbnail} />
          )}
          {!item.read && <View style={styles.unreadDot} />}
          {selectionMode && (
            <View style={[
              styles.selectionCircle,
              selectedNotifications.includes(item.id) && styles.selectedCircle
            ]}>
              {selectedNotifications.includes(item.id) && (
                <Check size={12} color="#fff" />
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Heart size={48} color="#E0E0E0" />
      </View>
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptyMessage}>
        When people interact with your posts, you'll see notifications here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={selectionMode ? exitSelectionMode : () => router.back()}
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectionMode ? `${selectedNotifications.length} selected` : 'Notifications'}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {selectionMode ? (
            <>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={markSelectedAsRead}
              >
                <CheckCheck size={24} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={deleteSelected}
              >
                <Trash2 size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              {unreadCount > 0 && (
                <TouchableOpacity 
                  style={styles.markAllButton}
                  onPress={markAllAsRead}
                >
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => {
                  Alert.alert(
                    'Clear All Notifications',
                    'Are you sure you want to delete all notifications?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Clear All',
                        style: 'destructive',
                        onPress: clearAllNotifications,
                      },
                    ]
                  );
                }}
              >
                <MoreVertical size={24} color="#000" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {notifications.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {unreadCount > 0 && !selectionMode && (
            <View style={styles.unreadBanner}>
              <Text style={styles.unreadBannerText}>
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.notificationsList}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: -34,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
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
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginLeft: 8,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
  },
  markAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  unreadBanner: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  unreadBannerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1976D2',
  },
  notificationsList: {
    paddingBottom: 50,
  },
  notificationItem: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  unreadNotification: {
    backgroundColor: '#FAFBFC',
  },
  selectedNotification: {
    backgroundColor: '#E3F2FD',
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
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
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  notificationAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  notificationBody: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
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
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
  },
  selectionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCircle: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
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
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});