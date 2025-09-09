import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Keyboard,
} from 'react-native';
import { X, MessageCircle, Users, Search, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { User } from '@/types/User';
import { createNewConversationStyles } from './NewConversationModal.styles';

interface NewConversationModalProps {
  visible: boolean;
  onClose: () => void;
  mode: 'direct' | 'group';
  onModeChange: (mode: 'direct' | 'group') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  groupName: string;
  onGroupNameChange: (name: string) => void;
  selectedUsers: User[];
  onUserSelect: (user: User) => void;
  onRemoveUser: (userId: string) => void;
  displayUsers: User[];
  onCreateGroup: () => void;
  canCreateGroup: boolean;
  isLoading: boolean;
  error: string | null;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  visible,
  onClose,
  mode,
  onModeChange,
  searchQuery,
  onSearchChange,
  groupName,
  onGroupNameChange,
  selectedUsers,
  onUserSelect,
  onRemoveUser,
  displayUsers,
  onCreateGroup,
  canCreateGroup,
  isLoading,
  error,
}) => {
  const { theme } = useTheme();
  const styles = createNewConversationStyles(theme);

  const renderUserItem = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.find(u => u._id === item._id);
    
    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.userItemSelected]}
        onPress={() => onUserSelect(item)}
        activeOpacity={0.7}
      >
        {item.avatar && item.avatar.trim() ? (
          <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
        ) : (
          <View style={[styles.userAvatar, styles.userAvatarFallback]}>
            <Text style={styles.userAvatarText}>
              {(item.fullName || item.username || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.fullName || item.username || 'Unknown User'}
          </Text>
          {item.username && (
            <Text style={styles.userUsername}>@{item.username}</Text>
          )}
        </View>
        
        {mode === 'group' && isSelected && (
          <Check size={20} color={theme.accent} />
        )}
      </TouchableOpacity>
    );
  };

  const renderSelectedUser = (user: User) => (
    <View key={user._id} style={styles.selectedUserChip}>
      <Text style={styles.selectedUserName}>
        {user.fullName || user.username}
      </Text>
      <TouchableOpacity onPress={() => onRemoveUser(user._id)}>
        <X size={14} color="#000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        >
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modal}>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.title}>New Message</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <X size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>

                {/* Mode Selector */}
                <View style={styles.modeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      mode === 'direct' && styles.modeButtonActive,
                    ]}
                    onPress={() => onModeChange('direct')}
                  >
                    <MessageCircle
                      size={16}
                      color={mode === 'direct' ? '#000' : theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.modeButtonText,
                        mode === 'direct' && styles.modeButtonTextActive,
                      ]}
                    >
                      Direct
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      mode === 'group' && styles.modeButtonActive,
                    ]}
                    onPress={() => onModeChange('group')}
                  >
                    <Users
                      size={16}
                      color={mode === 'group' ? '#000' : theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.modeButtonText,
                        mode === 'group' && styles.modeButtonTextActive,
                      ]}
                    >
                      Group
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Group Name Input */}
                {mode === 'group' && (
                  <TextInput
                    style={styles.groupNameInput}
                    placeholder="Group name..."
                    value={groupName}
                    onChangeText={onGroupNameChange}
                    placeholderTextColor={theme.textSecondary}
                  />
                )}

                {/* Selected Users */}
                {mode === 'group' && selectedUsers.length > 0 && (
                  <View style={styles.selectedUsersContainer}>
                    <Text style={styles.selectedUsersTitle}>
                      Selected ({selectedUsers.length})
                    </Text>
                    <View style={styles.selectedUsersList}>
                      {selectedUsers.map(renderSelectedUser)}
                    </View>
                  </View>
                )}

                {/* Search Input */}
                <View style={styles.searchContainer}>
                  <Search size={20} color={theme.textSecondary} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder={
                      mode === 'group'
                        ? 'Search users to add...'
                        : 'Search users...'
                    }
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    placeholderTextColor={theme.textSecondary}
                    autoFocus
                  />
                </View>

                {/* Content */}
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.accent} />
                    <Text style={styles.loadingText}>Loading...</Text>
                  </View>
                ) : error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : displayUsers.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      {searchQuery.trim() 
                        ? 'No users found.' 
                        : "Start typing to search for users."}
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={displayUsers}
                    keyExtractor={(item) => item._id}
                    renderItem={renderUserItem}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={
                      mode === 'group' ? (
                        <TouchableOpacity
                          style={[
                            styles.createGroupButton,
                            !canCreateGroup && styles.createGroupButtonDisabled,
                          ]}
                          onPress={onCreateGroup}
                          disabled={!canCreateGroup}
                        >
                          <Text
                            style={[
                              styles.createGroupButtonText,
                              !canCreateGroup && styles.createGroupButtonTextDisabled,
                            ]}
                          >
                            Create Group ({selectedUsers.length} members)
                          </Text>
                        </TouchableOpacity>
                      ) : null
                    }
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};
