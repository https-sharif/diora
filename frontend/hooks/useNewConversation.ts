import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { messageService } from '@/services/messageService';
import { searchService } from '@/services/searchService';
import { userService } from '@/services/userService';
import { User } from '@/types/User';
import { Conversation } from '@/types/Conversation';

interface UseNewConversationProps {
  token: string | null;
  user: User | null;
  conversations: Conversation[];
  onConversationCreated?: (conversation: Conversation) => void;
}

export const useNewConversation = ({
  token,
  user,
  conversations,
  onConversationCreated,
}: UseNewConversationProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mode, setMode] = useState<'direct' | 'group'>('direct');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [followingUsers, setFollowingUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setMode('direct');
    setSearchQuery('');
    setGroupName('');
    setSelectedUsers([]);
    setSearchResults([]);
    setError(null);
  };

  const openModal = async () => {
    setIsModalVisible(true);
    await loadFollowingUsers();
  };

  const closeModal = () => {
    setIsModalVisible(false);
    resetState();
  };

  const loadFollowingUsers = async () => {
    if (!token || !user?.following?.length) {
      setFollowingUsers([]);
      setIsLoadingFollowing(false);
      return;
    }

    setIsLoadingFollowing(true);
    setError(null);

    try {
      const followingPromises = user.following.map(async (userId: string) => {
        try {
          const response = await userService.getUserById(userId, token);
          return response.status ? response.user : null;
        } catch {
          return null;
        }
      });

      const followingData = await Promise.all(followingPromises);
      const validFollowing = followingData.filter((user: any): user is User => user !== null);
      
      setFollowingUsers(validFollowing);
    } catch {
      setError('Failed to load following users');
    } finally {
      setIsLoadingFollowing(false);
    }
  };

  const searchUsers = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim() || !token) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const [userRes, shopRes] = await Promise.all([
        searchService.searchUsers(query, token),
        searchService.searchShops(query, token),
      ]);

      let merged: User[] = [];
      
      if (userRes.status && userRes.users) {
        merged = merged.concat(
          userRes.users.filter((u: User) => u._id !== user?._id)
        );
      }
      
      if (shopRes.status && shopRes.users) {
        merged = merged.concat(
          shopRes.users.filter((s: User) => s._id !== user?._id)
        );
      }

      setSearchResults(merged);
    } catch {
      setError('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const findExistingConversation = (userId: string): Conversation | null => {
    return conversations.find(conv => 
      conv.type === 'private' && 
      conv.participants?.some((p: any) => {
        const participantId = typeof p === 'string' ? p : p._id;
        return participantId === userId;
      })
    ) || null;
  };

  const selectUser = (selectedUser: User) => {
    if (mode === 'group') {
      const isAlreadySelected = selectedUsers.find(u => u._id === selectedUser._id);
      
      if (isAlreadySelected) {
        setSelectedUsers(selectedUsers.filter(u => u._id !== selectedUser._id));
      } else {
        if (selectedUsers.length >= 9) {
          Alert.alert('Limit Reached', 'Group chat is limited to 10 members maximum');
          return;
        }
        setSelectedUsers([...selectedUsers, selectedUser]);
      }
    } else {
      startDirectConversation(selectedUser);
    }
  };

  const startDirectConversation = async (selectedUser: User) => {
    try {
      const existingConv = findExistingConversation(selectedUser._id);
      
      if (existingConv) {
        closeModal();
        router.push(`/message/${existingConv._id}`);
        return;
      }

      closeModal();
      router.push(`/message/${selectedUser._id}`);
    } catch {
      Alert.alert('Error', 'Failed to start conversation');
    }
  };

  const createGroupConversation = async () => {
    if (selectedUsers.length < 2) {
      Alert.alert('Error', 'Please select at least 2 members for a group chat');
      return;
    }
    
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    
    if (!token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    try {
      const participantIds = selectedUsers.map(member => member._id);
      const response = await messageService.createGroupConversation(
        {
          name: groupName.trim(),
          participants: participantIds,
        },
        token
      );

      if (response.status) {
        closeModal();
        onConversationCreated?.(response.conversation);
        router.push(`/message/${response.conversation._id}`);
      } else {
        Alert.alert('Error', 'Failed to create group chat');
      }
    } catch {
      Alert.alert('Error', 'Failed to create group chat');
    }
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u._id !== userId));
  };

  const getDisplayUsers = () => {
    return searchQuery.trim() === '' ? followingUsers : searchResults;
  };

  return {
    state: {
      isModalVisible,
      mode,
      searchQuery,
      groupName,
      selectedUsers,
      searchResults,
      followingUsers,
      isSearching,
      isLoadingFollowing,
      error,
    },
    actions: {
      openModal,
      closeModal,
      searchUsers,
      selectUser,
      createGroupConversation,
      setMode,
      setGroupName,
      removeSelectedUser,
    },
    computed: {
      displayUsers: getDisplayUsers(),
      canCreateGroup: selectedUsers.length >= 2 && groupName.trim().length > 0,
      isLoading: isSearching || isLoadingFollowing,
    },
  };
};
