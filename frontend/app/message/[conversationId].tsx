import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Send,
  Plus,
  Camera,
  Menu,
  MessageCircleOff,
  Inbox,
  Clock,
  Check,
  CheckCheck,
  X,
  Ban,
  AlertTriangle,
  UserPlus,
  Search,
  Edit2,
  DoorOpen,
  Users,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMessage } from '@/hooks/useMessage';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { messageService } from '@/services/messageService';
import { reportService } from '@/services/reportService';
import { useTheme } from '@/contexts/ThemeContext';
import { config } from '@/config';
import Color from 'color';
import { Theme } from '@/types/Theme';
import { User } from '@/types/User';
import { Conversation } from '@/types/Conversation';
import { Message } from '@/types/Message';
import { ReportData } from '@/types/Report';
import axios from 'axios';
import { searchService } from '@/services';

const { width } = Dimensions.get('window');

const createStyles = (theme: Theme, lightTheme: Theme, darkTheme: Theme) => {
  return StyleSheet.create({
    editGroupModalMenu: {
      padding: 24,
      gap: 20,
      minHeight: 300,
    },
    editGroupPhotoButton: {
      alignSelf: 'center',
    },
    editGroupPhoto: {
      width: 72,
      height: 72,
      borderRadius: 36,
      marginBottom: 8,
    },
    editGroupPhotoFallback: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    editGroupPhotoText: {
      color: theme.accent,
      textAlign: 'center',
    },
    editGroupNameInput: {
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      marginBottom: 8,
      paddingLeft: 8,
    },
    groupMemberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
    },
    groupMemberAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: 12,
    },
    groupMemberAvatarFallback: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    groupMemberAvatarFallbackText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    groupMemberName: {
      fontSize: 16,
      color: theme.text,
    },
    groupMemberEmptyText: {
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 24,
    },
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingBottom: -100,
      paddingTop: -100,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.border,
    },
    backButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    headerInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    headerText: {
      flex: 1,
    },
    headerName: {
      fontSize: 17,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    headerStatus: {
      fontSize: 13,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 1,
    },
    bannedIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    bannedText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.error,
    },
    bannedWarning: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Color(theme.error).alpha(0.1).toString(),
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
      borderTopWidth: 1,
      borderTopColor: Color(theme.error).alpha(0.2).toString(),
    },
    bannedWarningText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.error,
      flex: 1,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerAction: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    messagesList: {
      flex: 1,
    },
    messagesContent: {
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    messageContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      alignItems: 'flex-end',
    },
    myMessageContainer: {
      justifyContent: 'flex-end',
    },
    otherMessageContainer: {
      justifyContent: 'flex-start',
    },
    avatarContainer: {
      marginRight: 8,
      marginLeft: 8,
    },
    messageAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      marginRight: 8,
    },
    messageBubble: {
      alignSelf: 'flex-start',
      maxWidth: width * 0.8,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    myMessageBubble: {
      backgroundColor: darkTheme.card,
      borderBottomRightRadius: 6,
      borderWidth: 1,
      borderColor: theme.border,
    },
    otherMessageBubble: {
      backgroundColor: darkTheme.accent,
      borderBottomLeftRadius: 6,
    },
    messageText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: lightTheme.text,
      lineHeight: 22,
    },
    infoMessageContainer: {
      backgroundColor: Color(theme.accent).alpha(0.1).toString(),
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 16,
      justifyContent: 'center',
    },
    infoText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.accent,
      lineHeight: 22,
      textAlign: 'center',
    },
    productText: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: lightTheme.text,
      lineHeight: 22,
    },
    myMessageText: {
      color: darkTheme.text,
    },
    messageImage: {
      width: width * 0.6,
      height: width * 0.6,
      resizeMode: 'contain',
      borderRadius: 12,
      marginBottom: 4,
    },
    messageTime: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: darkTheme.border,
      marginTop: 4,
    },
    myMessageTime: {
      color: darkTheme.textSecondary,
    },
    messageTimeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 4,
      gap: 4,
    },
    myMessageTimeContainer: {
      justifyContent: 'flex-end',
    },
    messageStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 2,
      gap: 4,
    },
    statusText: {
      fontSize: 10,
      fontFamily: 'Inter-Regular',
      color: darkTheme.textSecondary,
      opacity: 0.7,
    },
    statusIcon: {
      opacity: 0.7,
    },
    inputContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: Platform.OS === 'ios' ? 34 : 12,
      borderTopWidth: 0.5,
      borderTopColor: theme.border,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 12,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    imagePickerMenu: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    imagePickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    imagePickerTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    imagePickerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      gap: 16,
    },
    imagePickerItemText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
    cameraButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: darkTheme.accent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textInputContainer: {
      flex: 1,
      backgroundColor: theme.card,
      alignContent: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      maxHeight: 100,
    },
    textInput: {
      fontSize: 16,
      paddingTop: 0,
      height: 40,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      minHeight: 20,
    },
    textInputDisabled: {
      opacity: 0.5,
      backgroundColor: Color(theme.border).alpha(0.3).toString(),
    },
    sendButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.accent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: theme.border,
    },
    micButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.accent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    errorText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginBottom: 24,
    },
    errorBackButton: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    backButtonText: {
      color: '#000',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    productInfo: {
      flexDirection: 'column',
      gap: 4,
    },
    profileContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 4,
    },
    profileImage: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8,
    },
    postImage: {
      width: 250,
      height: 250,
      borderRadius: 8,
      marginBottom: 8,
    },
    postUserContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      gap: 4,
    },
    postUsername: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    postCaption: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
    },
    profileName: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: '#000000',
    },
    profileUsername: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    productContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 4,
    },
    productName: {
      fontSize: 14,
      fontFamily: 'Inter-Bold',
      color: '#000000',
    },
    myProductName: {
      color: '#fff',
    },
    productPrice: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: '#000',
      marginVertical: 4,
    },
    productImage: {
      width: 75,
      height: 75,
      resizeMode: 'contain',
      borderRadius: 8,
    },
    deletedMessageText: {
      opacity: 0.6,
      transform: [{ skewX: '-10deg' }],
      fontSize: 14,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    loadingText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    moreMenu: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    moreMenuHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    moreMenuTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    moreMenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      gap: 16,
    },
    moreMenuItemText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
    groupMessageContainer: {
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    groupMessageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
      marginLeft: 40,
    },
    groupMessageUsername: {
      fontSize: 13,
      fontFamily: 'Inter-SemiBold',
      color: theme.textSecondary,
      marginBottom: 4,
      marginLeft: 2,
    },
    groupMessageAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8,
    },
    groupMessageAvatarText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: '#000',
    },
    groupMessageContent: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    createGroupButton: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 8,
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
    closeButton: {
      alignSelf: 'center',
      marginTop: 8,
      paddingVertical: 12,
      paddingHorizontal: 48,
      borderRadius: 8,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
    },
    closeButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    modalCancelButton: {
      width: '100%',
      backgroundColor: theme.background,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalCancelButtonText: {
      color: theme.text,
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
  });
};

export default function MessageScreen() {
  const [messageText, setMessageText] = useState('');
  const [myMessages, setMyMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { theme, lightTheme, darkTheme } = useTheme();
  const styles = createStyles(theme, lightTheme, darkTheme);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const { user } = useAuth();
  const { token } = useAuthStore();
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const {
    conversations,
    setConversations,
    markConversationAsRead,
    updateLastMessage,
    updateConversation,
  } = useMessage();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [editGroupName, setEditGroupName] = useState(conversation?.name || '');
  const [editGroupPhoto, setEditGroupPhoto] = useState(
    conversation?.avatar || ''
  );
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserSearch, setAddUserSearch] = useState('');
  const [addUserResults, setAddUserResults] = useState<User[]>([]);
  const [addUserSelected, setAddUserSelected] = useState<User | null>(null);
  const [addUserSearching, setAddUserSearching] = useState(false);

  const handleOpenEditGroup = () => {
    setEditGroupName(conversation?.name || '');
    setEditGroupPhoto(conversation?.avatar || '');
    setShowEditGroupModal(true);
  };

  const handleSaveEditGroup = async () => {
    if (!conversation) return;
    try {
      const formData = new FormData();
      formData.append('name', editGroupName);

      if (editGroupPhoto.startsWith('file://')) {
        const fileName = editGroupPhoto.split('/').pop();
        const fileType = `image/${fileName?.split('.').pop()}`;
        formData.append('avatar', {
          uri: editGroupPhoto,
          name: fileName,
          type: fileType,
        } as any);
      }

      const response = await axios.put(
        `${config.apiUrl}/api/message/conversations/${conversation._id}/edit`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status) {
        const updatedConversation = response.data.conversation;
        setConversation(updatedConversation);
        updateConversation(updatedConversation._id, updatedConversation);
        setMyMessages((prev) => [...prev, response.data.message]);
      }
    } catch {
      alert('Failed to update group');
    } finally {
      setShowEditGroupModal(false);
    }
  };

  const handlePickGroupPhoto = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Gallery permission denied');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        quality: 1,
        allowsEditing: true,
      });

      if (!result.canceled) {
        setEditGroupPhoto(result.assets[0].uri);
      }
    } catch {
      alert('Failed to pick image');
    }
  };
  const handleOpenMembersModal = () => setShowMembersModal(true);
  const handleCloseMembersModal = () => setShowMembersModal(false);

  const handleSearchMessages = () => {
    setShowMenu(false);
    setSearchModalVisible(true);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleSearchInput = (text: string) => {
    setSearchTerm(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }
    const lower = text.toLowerCase();
    const filtered = myMessages.filter(
      (msg) => msg.text && msg.text.toLowerCase().includes(lower)
    );
    setSearchResults(filtered);
  };

  const scrollToMessage = (messageId: string) => {
    const idx = myMessages.findIndex((msg) => msg._id === messageId);
    if (idx !== -1 && flatListRef.current) {
      setSearchModalVisible(false);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: idx, animated: true });
      }, 350);
    }
  };

  const renderEditGroupModal = () => (
    <Modal
      visible={showEditGroupModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowEditGroupModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={() => setShowEditGroupModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.moreMenu, styles.editGroupModalMenu]}>
                <Text style={styles.moreMenuTitle}>Edit Group</Text>
                <TouchableOpacity
                  style={styles.editGroupPhotoButton}
                  onPress={handlePickGroupPhoto}
                >
                  {editGroupPhoto ? (
                    <Image
                      source={{ uri: editGroupPhoto }}
                      style={styles.editGroupPhoto}
                    />
                  ) : (
                    <View
                      style={[
                        styles.editGroupPhoto,
                        styles.editGroupPhotoFallback,
                        { backgroundColor: theme.card },
                      ]}
                    >
                      <Camera size={32} color={theme.textSecondary} />
                    </View>
                  )}
                  <Text style={styles.editGroupPhotoText}>Change Photo</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.textInput, styles.editGroupNameInput]}
                  value={editGroupName}
                  onChangeText={setEditGroupName}
                  placeholder="Group Name"
                  placeholderTextColor={theme.textSecondary}
                />
                <TouchableOpacity
                  style={[
                    styles.createGroupButton,
                    !editGroupName.trim() && styles.createGroupButtonDisabled,
                  ]}
                  onPress={handleSaveEditGroup}
                  disabled={!editGroupName.trim()}
                >
                  <Text
                    style={[
                      styles.createGroupButtonText,
                      !editGroupName.trim() &&
                        styles.createGroupButtonTextDisabled,
                    ]}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowEditGroupModal(false)}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderMembersModal = () => (
    <Modal
      visible={showMembersModal}
      animationType="slide"
      transparent
      onRequestClose={handleCloseMembersModal}
    >
      <TouchableWithoutFeedback onPress={handleCloseMembersModal}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.moreMenu,
                { padding: 24, gap: 20, minHeight: 300 },
              ]}
            >
              <Text style={styles.moreMenuTitle}>Group Members</Text>
              <FlatList
                data={
                  (conversation?.participants?.filter(
                    (p: any) => typeof p === 'object' && p._id
                  ) as any[]) || []
                }
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => {
                  const member = item as {
                    _id: string;
                    type?: string;
                    avatar?: string;
                    fullName?: string;
                    username?: string;
                  };
                  return (
                    <TouchableOpacity
                      style={styles.groupMemberRow}
                      onPress={() => {
                        router.push(`/${member.type}/${member._id}` as any);
                        setShowMembersModal(false);
                      }}
                    >
                      {member.avatar ? (
                        <Image
                          source={{ uri: member.avatar }}
                          style={styles.groupMemberAvatar}
                        />
                      ) : (
                        <View
                          style={[
                            styles.groupMemberAvatar,
                            styles.groupMemberAvatarFallback,
                            { backgroundColor: theme.card },
                          ]}
                        >
                          <Text style={styles.groupMemberAvatarFallbackText}>
                            {(member.fullName || member.username || 'U')
                              .charAt(0)
                              .toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.groupMemberName}>
                        {member.fullName || member.username || 'Unknown'}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <Text style={styles.groupMemberEmptyText}>
                    No members found.
                  </Text>
                }
              />
              <TouchableOpacity
                onPress={handleCloseMembersModal}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderSearchModal = () => (
    <Modal
      visible={searchModalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setSearchModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setSearchModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ width: '100%' }}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
              <View style={[styles.moreMenu, styles.editGroupModalMenu]}>
                <Text style={styles.moreMenuTitle}>Search Messages</Text>
                <TextInput
                  style={[styles.textInput, styles.editGroupNameInput]}
                  value={searchTerm}
                  onChangeText={handleSearchInput}
                  placeholder="Type to search..."
                  placeholderTextColor={theme.textSecondary}
                  autoFocus
                />
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => scrollToMessage(item._id)}>
                      <View style={{ paddingVertical: 10 }}>
                        <Text style={{ color: theme.text }}>{item.text}</Text>
                        <Text
                          style={{ color: theme.textSecondary, fontSize: 12 }}
                        >
                          {new Date(item.createdAt).toLocaleString()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    searchTerm ? (
                      <Text style={styles.groupMemberEmptyText}>
                        No results found.
                      </Text>
                    ) : null
                  }
                  style={{ maxHeight: 250 }}
                  keyboardShouldPersistTaps="handled"
                />
                <TouchableOpacity
                  onPress={() => setSearchModalVisible(false)}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const handleAddUserSearch = async (text: string) => {
    setAddUserSearch(text);
    setAddUserSearching(true);
    setAddUserSelected(null);
    if (!text.trim() || !token) {
      setAddUserResults([]);
      setAddUserSearching(false);
      return;
    }
    try {
      const res = await searchService.searchUsers(text, token);
      if (res.status && Array.isArray(res.users)) {
        const existingIds = (conversation?.participants || []).map((p: any) =>
          typeof p === 'string' ? p : p._id
        );
        setAddUserResults(
          res.users.filter((u: User) => !existingIds.includes(u._id))
        );
      } else {
        setAddUserResults([]);
      }
    } catch {
      setAddUserResults([]);
    }
    setAddUserSearching(false);
  };

  const handleAddUserToGroup = async () => {
    if (!addUserSelected || !conversation || !token) return;
    try {
      const data = await messageService.addUser(conversation._id, token, [
        addUserSelected._id,
      ]);
      if (data.status) {
        updateConversation(conversation._id, data.conversation);
        setConversation(data.conversation);
        setShowAddUserModal(false);
        setAddUserSelected(null);
      } else {
        alert(data.message || 'Failed to add user');
      }
    } catch {
      alert('Failed to add user');
    }
  };

  const renderAddUserModal = () => (
    <Modal
      visible={showAddUserModal}
      transparent
      animationType="slide"
      onRequestClose={handleCloseMenu}
    >
      <TouchableWithoutFeedback onPress={() => setShowAddUserModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ width: '100%' }}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
              <View style={[styles.moreMenu, styles.editGroupModalMenu]}>
                <Text style={styles.moreMenuTitle}>Add User</Text>
                <TextInput
                  style={[styles.textInput, styles.editGroupNameInput]}
                  value={addUserSearch}
                  onChangeText={handleAddUserSearch}
                  placeholder="Search users by name or username"
                  placeholderTextColor={theme.textSecondary}
                  autoFocus
                />
                <View style={{ maxHeight: 200, marginVertical: 8 }}>
                  {addUserSearching ? (
                    <ActivityIndicator color={theme.accent} />
                  ) : (
                    <FlatList
                      data={addUserResults}
                      keyExtractor={(item) => item._id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 10,
                            paddingHorizontal: 8,
                            backgroundColor:
                              addUserSelected?._id === item._id
                                ? theme.accent
                                : 'transparent',
                            borderRadius: 8,
                            marginBottom: 2,
                          }}
                          onPress={() => setAddUserSelected(item)}
                        >
                          {item.avatar ? (
                            <Image
                              source={{ uri: item.avatar }}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                marginRight: 10,
                              }}
                            />
                          ) : (
                            <View
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: theme.card,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 10,
                              }}
                            >
                              <Text style={{ color: theme.text }}>
                                {(item.fullName || item.username || 'U')
                                  .charAt(0)
                                  .toUpperCase()}
                              </Text>
                            </View>
                          )}
                          <View>
                            <Text
                              style={{
                                color:
                                  addUserSelected?._id === item._id
                                    ? '#000'
                                    : theme.text,
                                fontWeight: 'bold',
                              }}
                            >
                              {item.fullName || item.username}
                            </Text>
                            <Text
                              style={{
                                color: theme.textSecondary,
                                fontSize: 12,
                              }}
                            >
                              @{item.username}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                      ListEmptyComponent={
                        addUserSearch.trim() ? (
                          <Text
                            style={{
                              color: theme.textSecondary,
                              textAlign: 'center',
                              marginTop: 12,
                            }}
                          >
                            No users found
                          </Text>
                        ) : null
                      }
                      keyboardShouldPersistTaps="handled"
                    />
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.createGroupButton,
                    !addUserSelected && styles.createGroupButtonDisabled,
                  ]}
                  onPress={handleAddUserToGroup}
                  disabled={!addUserSelected}
                >
                  <Text
                    style={[
                      styles.createGroupButtonText,
                      !addUserSelected && styles.createGroupButtonTextDisabled,
                    ]}
                  >
                    Add
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowAddUserModal(false)}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  useEffect(() => {
    const fetchConversationData = async () => {
      if (!conversationId || !token) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const foundConv = conversations.find(
          (c: Conversation) => c._id === conversationId
        ) as Conversation;

        if (foundConv) {
          setConversation(foundConv);

          if (foundConv.participants && foundConv.participants.length > 0) {
            const otherParticipant = foundConv.participants.find(
              (participant: any) => {
                const participantId =
                  typeof participant === 'string'
                    ? participant
                    : participant._id;
                return participantId !== user?._id;
              }
            );

            if (otherParticipant) {
              const participantId =
                typeof otherParticipant === 'string'
                  ? otherParticipant
                  : (otherParticipant as any)._id;

              try {
                const userResponse = await fetch(
                  `${config.apiUrl}/api/user/${participantId}`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );

                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  if (userData.status) {
                    setOtherUser(userData.user);
                  }
                } else {
                  if (
                    typeof otherParticipant === 'object' &&
                    (otherParticipant as any)._id
                  ) {
                    setOtherUser(otherParticipant as User);
                  }
                }
              } catch {
                if (
                  typeof otherParticipant === 'object' &&
                  (otherParticipant as any)._id
                ) {
                  setOtherUser(otherParticipant as User);
                }
              }
            }
          }
        }

        try {
          const messagesResponse = await messageService.getMessages(
            conversationId,
            1,
            50,
            token
          );

          if (messagesResponse.status && messagesResponse.messages.length > 0) {
            const sortedMessages = messagesResponse.messages.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
            setMyMessages(sortedMessages);

            try {
              await messageService.markMessagesAsRead(conversationId, token);
              markConversationAsRead(conversationId);
            } catch {}
          } else {
            setMyMessages([]);
          }
        } catch {
          setMyMessages([]);
          setConversation(null);
        }

        if (!otherUser && !foundConv) {
          try {
            const userResponse = await fetch(
              `${config.apiUrl}/api/user/${conversationId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (userResponse.ok) {
              const userData = await userResponse.json();

              if (userData.status) {
                setOtherUser(userData.user);
              }
            }
          } catch {}
        }
      } catch {
        setMyMessages([]);
        setConversation(null);

        if (!otherUser) {
          try {
            const userResponse = await fetch(
              `${config.apiUrl}/api/user/${conversationId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (userResponse.ok) {
              const userData = await userResponse.json();

              if (userData.status) {
                setOtherUser(userData.user);
              }
            }
          } catch {
            setError('Failed to load conversation or user profile');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConversationData();
  }, [conversationId, token]);

  useEffect(() => {
    if (myMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 200);
    }
  }, [myMessages.length]);

  const handleProfilePress = (userId: string, type: string) => {
    if (conversation?.type === 'private') {
      router.push(`/${type}/${userId}` as any);
    }
  };

  const handleGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        alert('Gallery permission denied');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: false,
      });

      if (!result.canceled) {
        const photo = result.assets[0];

        await sendImageMessage(photo.uri);
      } else {
      }
    } catch {
      alert('Error opening gallery');
    }
  };

  const handleCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        alert('Camera permission denied');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const photo = result.assets[0];

        await sendImageMessage(photo.uri);
      }
    } catch {
      alert('Error opening camera');
    }
  };

  const sendImageMessage = async (imageUri: string) => {
    if (!conversationId || !token || !user) {
      return;
    }

    const optimisticMessageId = `temp_${Date.now()}`;
    const optimisticMessage: Message = {
      _id: optimisticMessageId,
      text: '',
      imageUrl: imageUri,
      createdAt: new Date(),
      conversationId: conversationId,
      senderId: user._id,
      type: 'image',
      status: 'sending',
      reactions: {},
    };

    try {
      let targetConversationId = conversationId;

      if (!conversation) {
        try {
          const messagesResponse = await messageService.getMessages(
            conversationId,
            1,
            1,
            token
          );

          if (messagesResponse.status) {
            targetConversationId = conversationId;
          } else {
            throw new Error('Not a conversation ID');
          }
        } catch {
          try {
            const conversationResponse =
              await messageService.getOrCreateConversation(
                conversationId,
                'private',
                token
              );

            if (conversationResponse.status) {
              setConversation(conversationResponse.conversation);
              targetConversationId = conversationResponse.conversation._id;
            } else {
              alert('Failed to start conversation. User may not exist.');
              return;
            }
          } catch {
            alert('Failed to start conversation. Please try again.');
            return;
          }
        }
      }

      optimisticMessage.conversationId = targetConversationId;
      setMyMessages((prev) => [...prev, optimisticMessage]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      const response = await messageService.sendMessage(
        targetConversationId,
        '',
        'image',
        token,
        undefined,
        undefined,
        imageUri
      );

      if (response.status) {
        const sentMessage = { ...response.message, status: 'sent' as const };
        setMyMessages((prev) =>
          prev.map((msg) =>
            msg._id === optimisticMessageId ? sentMessage : msg
          )
        );

        updateLastMessage(targetConversationId, sentMessage);
      } else {
        setMyMessages((prev) =>
          prev.filter((msg) => msg._id !== optimisticMessageId)
        );

        alert('Failed to send image. Please try again.');
      }
    } catch {
      setMyMessages((prev) =>
        prev.filter((msg) => msg._id !== optimisticMessageId)
      );
      alert('Failed to send image. Please check your connection.');
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversationId || !token || !user) {
      return;
    }

    const messageToSend = messageText.trim();
    const optimisticMessageId = `temp_${Date.now()}`;

    setMessageText('');

    try {
      let targetConversationId = conversationId;

      if (!conversation) {
        try {
          const messagesResponse = await messageService.getMessages(
            conversationId,
            1,
            1,
            token
          );

          if (messagesResponse.status) {
            targetConversationId = conversationId;
          } else {
            throw new Error('Not a conversation ID');
          }
        } catch {
          try {
            const conversationResponse =
              await messageService.getOrCreateConversation(
                conversationId,
                'private',
                token
              );

            if (conversationResponse.status) {
              setConversation(conversationResponse.conversation);
              targetConversationId = conversationResponse.conversation._id;
            } else {
              alert('Failed to start conversation. User may not exist.');
              setMessageText(messageToSend);
              return;
            }
          } catch {
            alert('Failed to start conversation. Please try again.');
            setMessageText(messageToSend);
            return;
          }
        }
      }

      const optimisticMessage: Message = {
        _id: optimisticMessageId,
        text: messageToSend,
        createdAt: new Date(),
        conversationId: targetConversationId,
        senderId: user._id,
        type: 'text',
        status: 'sending',
        reactions: {},
      };

      setMyMessages((prev) => [...prev, optimisticMessage]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      const response = await messageService.sendMessage(
        targetConversationId,
        messageToSend,
        'text',
        token
      );

      if (response.status) {
        const updatedMessage: Message = {
          ...response.message,
          status: 'sent' as const,
        };
        setMyMessages((prev) =>
          prev.map((msg) =>
            msg._id === optimisticMessageId ? updatedMessage : msg
          )
        );

        updateLastMessage(targetConversationId, updatedMessage);
      } else {
        setMyMessages((prev) =>
          prev.filter((msg) => msg._id !== optimisticMessageId)
        );
        setMessageText(messageToSend);
        alert('Failed to send message. Please try again.');
      }
    } catch {
      setMyMessages((prev) =>
        prev.filter((msg) => msg._id !== optimisticMessageId)
      );
      setMessageText(messageToSend);
      alert('Failed to send message. Please check your connection.');
    }
  };

  const handleMenuPress = () => {
    setShowMenu(true);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  const handleLeaveGroup = () => {
    setShowMenu(false);

    if (conversation?.type !== 'group') return;

    Alert.alert(
      'Leave Group',
      `Are you sure you want to leave "${conversation?.name || 'this group'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!conversation?._id || !token) return;

              const response = await messageService.leaveGroup(
                conversation._id,
                token
              );

              if (response.status) {
                const updatedConversations = conversations.filter(
                  (c) => c._id !== conversation._id
                );
                setConversations(updatedConversations);

                router.back();
                Alert.alert('Success', 'Left group successfully');
              } else {
                Alert.alert(
                  'Error',
                  response.message || 'Failed to leave group'
                );
              }
            } catch {
              Alert.alert('Error', 'Failed to leave group');
            }
          },
        },
      ]
    );
  };

  const handleEditGroup = () => {
    setShowMenu(false);

    if (conversation?.type !== 'group') return;

    handleOpenEditGroup();
  };

  const handleViewGroupMembers = () => {
    setShowMenu(false);

    if (conversation?.type !== 'group') return;

    handleOpenMembersModal();
  };

  const handleReportUser = () => {
    setShowMenu(false);

    if (!otherUser || !token) return;

    Alert.alert(
      'Report User',
      `Are you sure you want to report ${
        otherUser.fullName || otherUser.username || 'this user'
      }?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: async () => {
            try {
              const reportData: ReportData = {
                targetType: 'user',
                targetId: otherUser._id,
                reason: 'Inappropriate behavior in chat',
                description: 'User reported from private message conversation',
              };

              const response = await reportService.createReport(
                reportData,
                token
              );

              if (response.status) {
                Alert.alert(
                  'Report Submitted',
                  'Thank you for your report. We will review it shortly.',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert(
                  'Error',
                  'Failed to submit report. Please try again later.',
                  [{ text: 'OK' }]
                );
              }
            } catch {
              Alert.alert(
                'Error',
                'Failed to submit report. Please try again later.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!token) return;

    try {
      const response = await messageService.deleteMessage(messageId, token);
      if (response.status) {
        Alert.alert('Success', 'Message deleted successfully');
        setMyMessages((prev) =>
          prev.map((m) =>
            m._id === messageId ? { ...m, type: 'deleted', text: '' } : m
          )
        );
      } else {
        Alert.alert('Error', 'Failed to delete message');
      }
    } catch {
      Alert.alert('Error', 'Failed to delete message');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (!user) return null;

    const senderId =
      typeof item.senderId === 'string'
        ? item.senderId
        : (item.senderId as any)?._id;
    const currentUserId = user._id;
    const isMe = senderId === currentUserId;

    const formattedTime = new Date(item.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const senderInfo =
      typeof item.senderId === 'object' ? (item.senderId as any) : null;
    const senderName =
      senderInfo?.fullName || senderInfo?.username || 'Unknown User';
    const senderAvatar = senderInfo?.avatar;

    if (item.type === 'info' && item.text) {
      return (
        <View style={styles.infoMessageContainer}>
          <Text style={styles.infoText}>{item.text}</Text>
        </View>
      );
    }

    if (conversation?.type === 'group' && !isMe) {
      return (
        <View style={styles.groupMessageContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable
              onPress={() => {
                router.push(`/${senderInfo?.type}/${senderInfo._id}` as any);
              }}
              style={{ marginRight: 8 }}
            >
              <Image
                source={{ uri: senderAvatar }}
                style={styles.groupMessageAvatar}
              />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.groupMessageUsername}>{senderName}</Text>
              <View style={[styles.messageBubble, styles.otherMessageBubble]}>
                {item.type === 'text' && item.text ? (
                  <Text style={styles.messageText}>{item.text}</Text>
                ) : item.type === 'image' && item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.messageImage}
                  />
                ) : item.type === 'product' && item.productId ? (
                  <TouchableOpacity
                    style={styles.productContainer}
                    activeOpacity={1}
                    onPress={() => {
                      router.push(`/product/${item.productId?._id}`);
                    }}
                  >
                    <Image
                      source={{ uri: item.productId.imageUrl[0] }}
                      style={styles.productImage}
                    />
                    <View>
                      <Text style={styles.productText}>
                        {item.productId.name}
                      </Text>
                      <Text style={styles.productPrice}>
                        ${item.productId.price.toFixed(2)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : item.type === 'profile' && item.profileId ? (
                  <TouchableOpacity
                    style={styles.profileContainer}
                    activeOpacity={1}
                    onPress={() => {
                      router.push(
                        `/${item.profileId?.type}/${item.profileId?._id}` as any
                      );
                    }}
                  >
                    <Image
                      source={{ uri: item.profileId.avatar }}
                      style={styles.profileImage}
                    />
                    <View>
                      <Text style={styles.profileName}>
                        {item.profileId.fullName}
                      </Text>
                      <Text style={styles.profileUsername}>
                        @{item.profileId.username}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : item.type === 'post' && item.postId ? (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      router.push(`/post/${item.postId?._id}`);
                    }}
                  >
                    <Image
                      source={{ uri: item.postId.imageUrl }}
                      style={styles.postImage}
                    />
                    <View style={styles.postUserContainer}>
                      <Text style={styles.postUsername}>
                        {item.postId.user.username}
                      </Text>
                      <Text style={styles.postCaption}>
                        {item.postId.caption}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : item.type === 'deleted' ? (
                  <Text style={[styles.messageText, styles.deletedMessageText]}>
                    This message was deleted
                  </Text>
                ) : item.type === 'info' && item.text ? (
                  <Text style={styles.infoText}>{item.text}</Text>
                ) : null}
                <View style={styles.messageTimeContainer}>
                  <Text style={styles.messageTime}>{formattedTime}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View
        style={[styles.messageContainer, isMe && styles.myMessageContainer]}
      >
        {!isMe &&
          conversation?.type === 'private' &&
          (otherUser?.avatar || senderAvatar) && (
            <Image
              source={{
                uri: otherUser?.avatar || senderAvatar,
              }}
              style={styles.messageAvatar}
            />
          )}

        <TouchableOpacity
          style={[
            styles.messageBubble,
            isMe ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
          activeOpacity={1}
          onLongPress={() => {
            if (!isMe) return;

            Alert.alert(
              'Delete Message',
              'Are you sure you want to delete this message?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    handleDeleteMessage(item._id);
                  },
                },
              ]
            );
          }}
        >
          {item.type === 'text' && item.text ? (
            <Text style={[styles.messageText, isMe && styles.myMessageText]}>
              {item.text}
            </Text>
          ) : item.type === 'image' && item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.messageImage}
            />
          ) : item.type === 'product' && item.productId ? (
            <TouchableOpacity
              style={styles.productContainer}
              activeOpacity={1}
              onPress={() => {
                router.push(`/product/${item.productId?._id}`);
              }}
            >
              <Image
                source={{ uri: item.productId.imageUrl[0] }}
                style={styles.productImage}
              />
              <View>
                <Text
                  style={[styles.productText, isMe && styles.myMessageText]}
                >
                  {item.productId.name}
                </Text>
                <Text
                  style={[styles.productPrice, isMe && styles.myMessageText]}
                >
                  ${item.productId.price.toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          ) : item.type === 'profile' && item.profileId ? (
            <TouchableOpacity
              style={styles.profileContainer}
              activeOpacity={1}
              onPress={() => {
                router.push(
                  `/${item.profileId?.type}/${item.profileId?._id}` as any
                );
              }}
            >
              <Image
                source={{ uri: item.profileId.avatar }}
                style={styles.profileImage}
              />
              <View>
                <Text
                  style={[styles.profileName, isMe && styles.myMessageText]}
                >
                  {item.profileId.fullName}
                </Text>
                <Text style={styles.profileUsername}>
                  @{item.profileId.username}
                </Text>
              </View>
            </TouchableOpacity>
          ) : item.type === 'post' && item.postId ? (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                router.push(`/post/${item.postId?._id}`);
              }}
            >
              <Image
                source={{ uri: item.postId.imageUrl }}
                style={styles.postImage}
              />
              <View style={styles.postUserContainer}>
                <Text
                  style={[styles.postUsername, isMe && styles.myMessageText]}
                >
                  {item.postId.user.username}
                </Text>
                <Text
                  style={[styles.postCaption, isMe && styles.myMessageText]}
                >
                  {item.postId.caption}
                </Text>
              </View>
            </TouchableOpacity>
          ) : item.type === 'deleted' ? (
            <Text
              style={[
                styles.messageText,
                styles.deletedMessageText,
                isMe && styles.myMessageText,
              ]}
            >
              This message was deleted
            </Text>
          ) : null}

          <View
            style={[
              styles.messageTimeContainer,
              isMe && styles.myMessageTimeContainer,
            ]}
          >
            <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>
              {formattedTime}
            </Text>

            {isMe && (
              <>
                {item.status === 'sending' && (
                  <Clock
                    size={12}
                    color={darkTheme.textSecondary}
                    style={styles.statusIcon}
                  />
                )}
                {item.status === 'sent' && (
                  <Check
                    size={12}
                    color={darkTheme.textSecondary}
                    style={styles.statusIcon}
                  />
                )}
                {item.status === 'delivered' && (
                  <CheckCheck
                    size={12}
                    color={darkTheme.textSecondary}
                    style={styles.statusIcon}
                  />
                )}
                {item.status === 'read' && (
                  <CheckCheck
                    size={12}
                    color={theme.accent}
                    style={styles.statusIcon}
                  />
                )}
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View
              style={[styles.headerAvatar, { backgroundColor: theme.card }]}
            />
            <View style={styles.headerText}>
              <Text style={styles.headerName}>Loading...</Text>
            </View>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>Error</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <MessageCircleOff
              size={40}
              color={theme.textSecondary}
              strokeWidth={2}
            />
          </View>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.errorBackButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View
              style={[
                styles.headerAvatar,
                !conversation?.avatar &&
                  !otherUser?.avatar && { backgroundColor: theme.card },
              ]}
            >
              {conversation?.type === 'group' ? (
                conversation?.avatar ? (
                  <Image
                    source={{ uri: conversation.avatar }}
                    style={styles.headerAvatar}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {(conversation?.name || 'G').charAt(0).toUpperCase()}
                  </Text>
                )
              ) : otherUser?.avatar ? (
                <Image
                  source={{ uri: otherUser.avatar }}
                  style={styles.headerAvatar}
                />
              ) : otherUser ? (
                <Text style={styles.avatarText}>
                  {(otherUser.fullName || otherUser.username || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              ) : (
                <Text style={styles.avatarText}>?</Text>
              )}
            </View>
            <View style={styles.headerText}>
              <TouchableOpacity
                onPress={() => {
                  if (conversation?.type === 'private' && otherUser?._id) {
                    handleProfilePress(otherUser._id, otherUser.type);
                  }
                }}
                disabled={conversation?.type === 'group'}
              >
                <Text style={styles.headerName}>
                  {conversation?.type === 'group'
                    ? conversation?.name || 'Group Chat'
                    : otherUser?.fullName ||
                      otherUser?.username ||
                      'New Conversation'}
                </Text>
                {conversation?.type !== 'group' &&
                  otherUser?.username &&
                  otherUser?.fullName && (
                    <Text style={styles.headerStatus}>
                      @{otherUser.username}
                    </Text>
                  )}
                {conversation?.type !== 'group' &&
                  otherUser?.status &&
                  (otherUser.status === 'banned' ||
                    otherUser.status === 'suspended') && (
                    <View style={styles.bannedIndicator}>
                      <Ban size={12} color={theme.error} />
                      <Text style={styles.bannedText}>
                        {otherUser.status === 'banned' ? 'Banned' : 'Suspended'}
                      </Text>
                    </View>
                  )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={handleMenuPress}
            >
              <Menu size={22} color={theme.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {myMessages.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={myMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
              }, 100);
            }}
            onLayout={() => {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
              }, 100);
            }}
          />
        ) : (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <MessageCircleOff
                size={40}
                color={theme.textSecondary}
                strokeWidth={1.5}
              />
            </View>
            <Text style={styles.errorText}>
              {conversation
                ? 'No messages yet'
                : 'Start your first conversation'}
            </Text>
            <Text style={[styles.errorText, { fontSize: 14, marginTop: 8 }]}>
              Send your first message below
            </Text>
          </View>
        )}

        {otherUser?.status &&
          (otherUser.status === 'banned' ||
            otherUser.status === 'suspended') && (
            <View style={styles.bannedWarning}>
              <AlertTriangle size={20} color={theme.error} />
              <Text style={styles.bannedWarningText}>
                This user is {otherUser.status}. Messages cannot be sent.
              </Text>
            </View>
          )}

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={[
                styles.cameraButton,
                (otherUser?.status === 'banned' ||
                  otherUser?.status === 'suspended') &&
                  styles.sendButtonDisabled,
              ]}
              onPress={() => setShowDropdown(true)}
              disabled={
                otherUser?.status === 'banned' ||
                otherUser?.status === 'suspended'
              }
            >
              <Plus
                size={24}
                color={
                  otherUser?.status === 'banned' ||
                  otherUser?.status === 'suspended'
                    ? theme.textSecondary
                    : '#000'
                }
                strokeWidth={2}
              />
            </TouchableOpacity>
            <Modal
              visible={showDropdown}
              transparent
              animationType="slide"
              onRequestClose={() => setShowDropdown(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowDropdown(false)}
              >
                <View style={styles.imagePickerMenu}>
                  <View style={styles.imagePickerHeader}>
                    <Text style={styles.imagePickerTitle}>Choose Photo</Text>
                    <TouchableOpacity onPress={() => setShowDropdown(false)}>
                      <X size={24} color={theme.text} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setShowDropdown(false);
                      setTimeout(() => {
                        handleCamera();
                      }, 600);
                    }}
                    style={styles.imagePickerItem}
                  >
                    <Camera size={20} color={theme.text} />
                    <Text style={styles.imagePickerItemText}>Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setShowDropdown(false);
                      setTimeout(() => {
                        handleGallery();
                      }, 600);
                    }}
                    style={styles.imagePickerItem}
                  >
                    <Inbox size={20} color={theme.text} />
                    <Text style={styles.imagePickerItemText}>
                      Open from {Platform.OS === 'ios' ? 'Photos' : 'Gallery'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>

            <Modal
              visible={showMenu}
              transparent
              animationType="slide"
              onRequestClose={handleCloseMenu}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={handleCloseMenu}
              >
                <View style={styles.moreMenu}>
                  <View style={styles.moreMenuHeader}>
                    <Text style={styles.moreMenuTitle}>Options</Text>
                    <TouchableOpacity onPress={handleCloseMenu}>
                      <X size={24} color={theme.text} />
                    </TouchableOpacity>
                  </View>

                  {conversation?.type === 'group' ? (
                    <>
                      <TouchableOpacity
                        onPress={handleSearchMessages}
                        style={styles.moreMenuItem}
                      >
                        <Search size={20} color={theme.text} />
                        <Text style={styles.moreMenuItemText}>
                          Search Messages
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleViewGroupMembers}
                        style={styles.moreMenuItem}
                      >
                        <Users size={20} color={theme.text} />
                        <Text style={styles.moreMenuItemText}>
                          Group Members
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleEditGroup}
                        style={styles.moreMenuItem}
                      >
                        <Edit2 size={20} color={theme.text} />
                        <Text style={styles.moreMenuItemText}>Edit Group</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setShowMenu(false);
                          setTimeout(() => {
                            setShowAddUserModal(true);
                          }, 300);
                        }}
                        style={styles.moreMenuItem}
                      >
                        <UserPlus size={20} color={theme.text} />
                        <Text style={styles.moreMenuItemText}>Add User</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleLeaveGroup}
                        style={styles.moreMenuItem}
                      >
                        <DoorOpen size={20} color={theme.error} />
                        <Text
                          style={[
                            styles.moreMenuItemText,
                            { color: theme.error },
                          ]}
                        >
                          Leave Group
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={handleSearchMessages}
                        style={styles.moreMenuItem}
                      >
                        <Search size={20} color={theme.text} />
                        <Text style={styles.moreMenuItemText}>
                          Search Messages
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleReportUser}
                        style={styles.moreMenuItem}
                      >
                        <AlertTriangle size={20} color={theme.error} />
                        <Text
                          style={[
                            styles.moreMenuItemText,
                            { color: theme.error },
                          ]}
                        >
                          Report User
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </Modal>

            {renderEditGroupModal()}
            {renderMembersModal()}
            {renderSearchModal()}
            {renderAddUserModal()}

            <View style={styles.textInputContainer}>
              <TextInput
                style={[
                  styles.textInput,
                  (otherUser?.status === 'banned' ||
                    otherUser?.status === 'suspended') &&
                    styles.textInputDisabled,
                ]}
                placeholder={
                  otherUser?.status === 'banned' ||
                  otherUser?.status === 'suspended'
                    ? `Cannot message ${otherUser.status} user`
                    : 'Message...'
                }
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={1000}
                placeholderTextColor={theme.textSecondary}
                editable={
                  !(
                    otherUser?.status === 'banned' ||
                    otherUser?.status === 'suspended'
                  )
                }
              />
            </View>

            <TouchableOpacity
              style={[
                styles.sendButton,
                messageText.trim() === '' ||
                otherUser?.status === 'banned' ||
                otherUser?.status === 'suspended'
                  ? styles.sendButtonDisabled
                  : null,
              ]}
              onPress={handleSendMessage}
              disabled={
                messageText.trim() === '' ||
                otherUser?.status === 'banned' ||
                otherUser?.status === 'suspended'
              }
            >
              <Send
                size={20}
                color={
                  messageText.trim() === '' ||
                  otherUser?.status === 'banned' ||
                  otherUser?.status === 'suspended'
                    ? theme.textSecondary
                    : '#000'
                }
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
