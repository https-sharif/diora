import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Plus,
  ArrowLeft,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useMessage } from '@/hooks/useMessage';
import { useAuthStore } from '@/stores/authStore';

import { messageService } from '@/services/messageService';
import { Conversation } from '@/types/Conversation';
import { useAuth } from '@/hooks/useAuth';
import { NewConversationModal } from '@/components/NewConversationModal';
import { useNewConversation } from '@/hooks/useNewConversation';
import Color from 'color';

const createStyles = (theme: any) => {
  return StyleSheet.create({
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
    headerButton: {
      padding: 8,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    newChatButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.accentSecondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      marginHorizontal: 20,
      marginVertical: 16,
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 44,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
    },
    conversationsList: {
      flex: 1,
      width: '95%',
      alignSelf: 'center',
      backgroundColor: theme.background,
    },
    conversationsContent: {
      paddingBottom: 100,
      gap: 4,
    },
    conversationItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.card,
      borderRadius: 12,
    },
    avatarContainer: {
      position: 'relative',
      marginRight: 16,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
    },
    userHeader: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.success,
      borderWidth: 2,
      borderColor: theme.background,
    },
    conversationContent: {
      flex: 1,
    },
    conversationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    conversationName: {
      fontSize: 17,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      flexShrink: 1,
    },
    nameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    conversationUsername: {
      fontSize: 13,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    conversationTime: {
      fontSize: 15,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginLeft: 8,
    },
    conversationFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    lastMessage: {
      fontSize: 15,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      flex: 1,
    },
    retryButton: {
      marginTop: 16,
      padding: 12,
      backgroundColor: theme.accent,
      borderRadius: 8,
    },
    unreadMessage: {
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    unreadBadge: {
      backgroundColor: '#007AFF',
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 8,
      marginLeft: 8,
    },
    unreadBadgeText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontFamily: 'Inter-Bold',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: theme.card,
      borderRadius: 16,
      width: '90%',
      maxHeight: '80%',
      overflow: 'hidden',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    closeButton: {
      padding: 4,
    },
    modalSearchContainer: {
      margin: 16,
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 44,
      flexDirection: 'row',
      alignItems: 'center',
    },
    modalSearchInput: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      marginLeft: 12,
    },
    usersList: {
      maxHeight: 400,
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.border,
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    userUsername: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 2,
    },
    emptySearchState: {
      padding: 40,
      alignItems: 'center',
    },
    emptySearchText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      textAlign: 'center',
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
    },
    chatModeSelector: {
      flexDirection: 'row',
      margin: 16,
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: 4,
    },
    chatModeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      gap: 6,
    },
    chatModeButtonActive: {
      backgroundColor: theme.accent,
    },
    chatModeButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    chatModeButtonTextActive: {
      color: '#000',
    },
    groupNameInput: {
      marginHorizontal: 16,
      marginBottom: 16,
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
    },
    selectedUsersContainer: {
      marginHorizontal: 16,
      marginBottom: 16,
    },
    selectedUsersTitle: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.text,
      marginBottom: 8,
    },
    selectedUsersList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    selectedUserChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.accent,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      gap: 6,
    },
    selectedUserName: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: '#000',
    },
    createGroupButton: {
      margin: 16,
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    createGroupButtonDisabled: {
      backgroundColor: theme.border,
    },
    createGroupButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: '#000',
    },
    createGroupButtonTextDisabled: {
      color: theme.textSecondary,
    },
    userItemSelected: {
      backgroundColor: Color(theme.accent).alpha(0.1).toString(),
    },
    sectionHeader: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.background,
    },
    sectionTitle: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.textSecondary,
    },
  });
};

export default function MessagesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeout = useRef<any>(null);
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);

  const { theme } = useTheme();
  const { conversations, setConversations } = useMessage();
  const { user } = useAuth();
  const { token } = useAuthStore();
  const styles = createStyles(theme);

  // New conversation functionality
  const newConversationHook = useNewConversation({
    token,
    user,
    conversations,
    onConversationCreated: (conversation) => {
      setConversations([conversation, ...conversations]);
    },
  });

  useEffect(() => {
    const fetchConversations = async () => {
      if (!token || !user) return;

      setLoading(true);
      setError(null);

      try {
        const response = await messageService.getConversations(token);

        if (response.status) {
          setConversations(response.conversations);
        } else {
          setError('Failed to load conversations');
        }
      } catch {
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const handleConversationPress = (conversationId: string) => {
    router.push(`/message/${conversationId}`);
  };

  function handleNewChatPress() {
    newConversationHook.actions.openModal();
  }



  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      if (!searchQuery.trim()) {
        setFilteredConversations(sortedConversations);
        return;
      }
      const lower = searchQuery.toLowerCase();
      setFilteredConversations(
        sortedConversations.filter((conv) => {
          if (conv.type === 'group') {
            return (conv.name || '').toLowerCase().includes(lower);
          } else {
            const other = conv.participants?.find((p: any) => {
              const id = typeof p === 'string' ? p : p._id;
              return id !== user?._id;
            });
            if (other && typeof other === 'object') {
              const u = other as any;
              return (
                (u.fullName && u.fullName.toLowerCase().includes(lower)) ||
                (u.username && u.username.toLowerCase().includes(lower))
              );
            }
            return false;
          }
        })
      );
    }, 250);
    return () =>
      debounceTimeout.current && clearTimeout(debounceTimeout.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, conversations]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayMidnight = new Date(midnight);
    yesterdayMidnight.setDate(midnight.getDate() - 1);
    const weekAgoMidnight = new Date(midnight);
    weekAgoMidnight.setDate(midnight.getDate() - 6);

    if (date >= midnight) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (date >= yesterdayMidnight && date < midnight) {
      return 'Yesterday';
    } else if (date >= weekAgoMidnight) {
      return date.toLocaleDateString(undefined, { weekday: 'long' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMessagePreview = (message: any) => {
    if (!message) return 'No messages';
    if (message.type === 'info' && !message.text) return 'Group info';

    const isMyMessage =
      message.senderId === user?._id ||
      (typeof message.senderId === 'object' &&
        message.senderId._id === user?._id);
    const prefix = isMyMessage ? 'You: ' : '';

    switch (message.type) {
      case 'deleted':
        return `${prefix}This message was deleted`;
      case 'image':
        return `${prefix}📷 Photo`;
      case 'product':
        return `${prefix}🛍️ Product`;
      case 'profile':
        return `${prefix}👤 Profile`;
      case 'post':
        return `${prefix}🖼️ Post`;
      case 'info':
        return message.text || '';
      case 'text':
      default:
        return `${prefix}${message.text || 'Message'}`;
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const lastMessage = item.lastMessageId as any;

    const participants = item.participants;
    let senderName = '';
    let senderAvatar = '';

    if (item.type === 'group') {
      senderName = item.name || 'Group Chat';
      senderAvatar = item.avatar || '';
    } else {
      const otherParticipant = participants?.find((p) => {
        const participantId = typeof p === 'string' ? p : (p as any)._id;
        return participantId !== user?._id;
      });

      if (otherParticipant && typeof otherParticipant === 'object') {
        const userObj = otherParticipant as any;
        senderName = userObj.fullName || userObj.username || 'Unknown User';
        senderAvatar = userObj.avatar || '';
      } else {
        senderName = 'Unknown User';
        senderAvatar = '';
      }
    }

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item._id)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {senderAvatar && senderAvatar.trim() ? (
            <Image source={{ uri: senderAvatar }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: theme.card,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <Text style={styles.userHeader}>
                {senderName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <View style={styles.nameContainer}>
              <Text style={styles.conversationName} numberOfLines={1}>
                {senderName}
              </Text>
              {item.type !== 'group' &&
                participants &&
                participants.length <= 2 &&
                (() => {
                  const otherParticipant = participants?.find((p) => {
                    const participantId =
                      typeof p === 'string' ? p : (p as any)._id;
                    return participantId !== user?._id;
                  });

                  if (
                    otherParticipant &&
                    typeof otherParticipant === 'object'
                  ) {
                    const userObj = otherParticipant as any;
                    if (
                      userObj.fullName &&
                      userObj.username &&
                      userObj.fullName !== userObj.username
                    ) {
                      return (
                        <Text
                          style={styles.conversationUsername}
                          numberOfLines={1}
                        >
                          @{userObj.username}
                        </Text>
                      );
                    }
                  }
                  return null;
                })()}
            </View>
            <Text style={styles.conversationTime}>
              {lastMessage && lastMessage.createdAt
                ? formatTime(lastMessage.createdAt)
                : lastMessage && lastMessage.type === 'info'
                ? 'Info'
                : ''}
            </Text>
          </View>

          <View style={styles.conversationFooter}>
            <Text
              style={[
                styles.lastMessage,
                item.unreadCount &&
                  item.unreadCount[user._id] > 0 &&
                  styles.unreadMessage,
              ]}
              numberOfLines={1}
            >
              {lastMessage ? getMessagePreview(lastMessage) : 'No messages'}
            </Text>

            {item.unreadCount && item.unreadCount[user._id] > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unreadCount[user._id] > 99
                    ? '99+'
                    : item.unreadCount[user._id]}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const sortedConversations = [...conversations].sort((a, b) => {
    const aLastMessage = a.lastMessageId as any;
    const bLastMessage = b.lastMessageId as any;
    const aTime =
      aLastMessage && aLastMessage.createdAt
        ? new Date(aLastMessage.createdAt).getTime()
        : 0;
    const bTime =
      bLastMessage && bLastMessage.createdAt
        ? new Date(bLastMessage.createdAt).getTime()
        : 0;
    return bTime - aTime;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity
          style={styles.newChatButton}
          onPress={handleNewChatPress}
        >
          <Plus size={24} color={theme.background} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search
          size={20}
          color={theme.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      {loading ? (
        <View
          style={[
            styles.conversationsList,
            { justifyContent: 'center', alignItems: 'center' },
          ]}
        >
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.lastMessage, { marginTop: 16 }]}>
            Loading conversations...
          </Text>
        </View>
      ) : error ? (
        <View
          style={[
            styles.conversationsList,
            { justifyContent: 'center', alignItems: 'center' },
          ]}
        >
          <Text style={styles.lastMessage}>{error}</Text>
          <TouchableOpacity
            onPress={() => {
              setError(null);
              setLoading(true);
              const fetchConversations = async () => {
                if (!token || !user) return;

                try {
                  const response = await messageService.getConversations(token);
                  if (response.status) {
                    setConversations(response.conversations);
                  } else {
                    setError('Failed to load conversations');
                  }
                } catch {
                  setError('Failed to load conversations');
                } finally {
                  setLoading(false);
                }
              };
              fetchConversations();
            }}
            style={styles.retryButton}
          >
            <Text style={{ color: '#000' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={
            searchQuery.trim() ? filteredConversations : sortedConversations
          }
          renderItem={renderConversationItem}
          keyExtractor={(item) => item._id}
          style={styles.conversationsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.conversationsContent}
        />
      )}

      <NewConversationModal
        visible={newConversationHook.state.isModalVisible}
        onClose={newConversationHook.actions.closeModal}
        mode={newConversationHook.state.mode}
        onModeChange={newConversationHook.actions.setMode}
        searchQuery={newConversationHook.state.searchQuery}
        onSearchChange={newConversationHook.actions.searchUsers}
        groupName={newConversationHook.state.groupName}
        onGroupNameChange={newConversationHook.actions.setGroupName}
        selectedUsers={newConversationHook.state.selectedUsers}
        onRemoveUser={newConversationHook.actions.removeSelectedUser}
        displayUsers={newConversationHook.computed.displayUsers}
        onUserSelect={newConversationHook.actions.selectUser}
        onCreateGroup={newConversationHook.actions.createGroupConversation}
        canCreateGroup={newConversationHook.computed.canCreateGroup}
        isLoading={newConversationHook.computed.isLoading}
        error={newConversationHook.state.error}
      />
    </SafeAreaView>
  );
}
