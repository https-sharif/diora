import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Alert,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Grid2x2 as Grid,
  MessageCircle,
  Share,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Flag,
  X,
  Star,
  Check,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useMessage } from '@/hooks/useMessage';
import { User } from '@/types/User';
import { Post } from '@/types/Post';
import { Theme } from '@/types/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import UserSlashIcon from '@/icon/UserSlashIcon';
import ImageSlashIcon from '@/icon/ImageSlashIcon';
import { userService } from '@/services/userService';
import { reportService } from '@/services/reportService';
import { searchService } from '@/services/searchService';
import { messageService } from '@/services';
import Color from 'color';

const createStyles = (theme: Theme) => {
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
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerButton: {
      padding: 8,
      width: 40,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    headerActions: {
      flexDirection: 'row',
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.textSecondary,
      marginBottom: 20,
    },
    backButton: {
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
    profileSection: {
      backgroundColor: theme.background,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginRight: 20,
    },
    profileStats: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    statLabel: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 2,
    },
    profileInfo: {
      marginBottom: 16,
    },
    nameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    fullName: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginRight: 8,
    },
    verifiedBadge: {
      backgroundColor: '#007AFF',
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    verifiedText: {
      color: '#fff',
      fontSize: 12,
      fontFamily: 'Inter-Bold',
    },
    bio: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      lineHeight: 22,
      marginBottom: 8,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    followButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.text,
      borderRadius: 8,
      paddingVertical: 12,
      gap: 8,
    },
    followingButton: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    followButtonText: {
      color: theme.background,
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    followingButtonText: {
      color: theme.text,
    },
    messageButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accent,
      borderRadius: 8,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 8,
    },
    messageButtonText: {
      color: '#000',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
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
      borderBottomColor: theme.text,
    },
    tabText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    activeTabText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    postsGrid: {
      backgroundColor: theme.background,
    },
    postsRow: {
      paddingHorizontal: 1,
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
      backgroundColor: theme.card,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
      backgroundColor: theme.background,
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
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 24,
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    moreMenu: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: 34,
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
      fontFamily: 'Inter-Bold',
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
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      width: '100%',
      maxWidth: 400,
      maxHeight: '85%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalSearchInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      marginBottom: 16,
      backgroundColor: theme.background,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    modalSubtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      marginBottom: 16,
    },
    modalOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 8,
    },
    modalOptionSelected: {
      borderColor: theme.text,
      backgroundColor: theme.background,
    },
    modalOptionText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    modalInput: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginTop: 12,
      marginBottom: 20,
      height: 80,
      textAlignVertical: 'top',
      fontSize: 14,
      fontFamily: 'Inter-Regular',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
    },
    modalFooter: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingVertical: 4,
      alignItems: 'center',
    },
    modalButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    modalButtonCancel: {
      borderWidth: 1,
    },
    modalButtonSubmit: {},
    modalButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
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
    usersList: {
      flexGrow: 1,
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.border,
    },
    userItemSelected: {
      backgroundColor: Color(theme.accent).alpha(0.1).toString(),
      borderRadius: 16,
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
  });
};

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user, followUser, token } = useAuth();
  const { conversations } = useMessage();

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'posts' | 'liked'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchedUsers, setSearchedUsers] = useState<User[]>([]);

  const { theme } = useTheme();

  const styles = createStyles(theme);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      setLoading(true);
      try {
        const [profileRes, postsRes, likedRes] = await Promise.all([
          userService.getUserById(userId, token),
          userService.getUserPosts(userId, token),
          userService.getUserLikedPosts(userId, token),
        ]);

        if (!profileRes) {
          router.back();
          return;
        }

        setUserProfile(profileRes);
        setIsFollowing(user?.following.includes(user._id) || false);
        setPosts(postsRes.posts);
        setLikedPosts(likedRes.posts);
      } catch {
        router.back();
      } finally {
        setSelectedTab('posts');
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, token, user]);

  const handleFollow = () => {
    if (!userProfile) return;

    followUser(userProfile._id, 'user');
    setIsFollowing(!isFollowing);
  };

  const handleMessage = () => {
    if (!userProfile || !user) return;
    const existingConversation = conversations.find((conversation) => {
      if (conversation.type !== 'private') return false;

      const participantIds = conversation.participants.map(
        (participant: any) => {
          return typeof participant === 'string'
            ? participant
            : participant._id;
        }
      );

      return (
        participantIds.includes(user._id) &&
        participantIds.includes(userProfile._id)
      );
    });

    if (existingConversation) {
      router.push(`/message/${existingConversation._id}`);
    } else {
      router.push(`/message/${userProfile._id}`);
    }
  };

  const handleShare = async () => {
    if (!userProfile || !token) return;

    setShowShareModal(false);
    await Promise.all(
      selectedUsers.map(async (user) => {
        const conversation = await messageService.getConversationId(
          user._id,
          token
        );
        await messageService.sendMessage(
          conversation.conversationId,
          `Check out ${userProfile?.fullName}'s profile`,
          'profile',
          token,
          undefined,
          undefined,
          userProfile._id,
          undefined,
          undefined
        );
      })
    );
  };

  const handleUserSelect = (selectedUser: any) => {
    setSelectedUsers((prev) => {
      if (prev.find((u) => u._id === selectedUser._id)) {
        return prev.filter((u) => u._id !== selectedUser._id);
      }
      return [...prev, selectedUser];
    });
  };

  const searchUsers = async (query: string) => {
    if (!token) {
      setSearchedUsers([]);
      return;
    }

    try {
      const [userRes, shopRes] = await Promise.all([
        searchService.searchUsers(query, token),
        searchService.searchShops(query, token),
      ]);
      let merged: any[] = [];
      if (userRes.status) {
        merged = merged.concat(
          userRes.users.filter((u: any) => u._id !== user?._id)
        );
      }
      if (shopRes.status) {
        merged = merged.concat(
          shopRes.users.filter((s: any) => s._id !== user?._id)
        );
      }
      setSearchedUsers(merged);
    } catch {
      setSearchedUsers([]);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(userSearchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [userSearchQuery]);

  const renderUserList = (item: any) => {
    const isSelected = selectedUsers.find((u) => u._id === item._id);
    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.userItemSelected]}
        onPress={() => handleUserSelect(item)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.fullName || item.username || 'Unknown User'}
          </Text>
          {item.username && (
            <Text style={styles.userUsername}>@{item.username}</Text>
          )}
        </View>
        {isSelected && <Check size={20} color={theme.accent} />}
      </TouchableOpacity>
    );
  };

  const handleReport = async () => {
    if (!reportReason.trim() || !user || !userProfile || !token) return;

    const reasonMap: { [key: string]: string } = {
      Harassment: 'harassment',
      Spam: 'spam',
      'Inappropriate Behavior': 'inappropriate_content',
      'Fake Account': 'fraud',
      Other: 'other',
    };

    try {
      const reportData = {
        targetType: 'user' as const,
        targetId: userProfile._id,
        reason: reasonMap[reportReason] || 'other',
        description:
          reportDescription.trim() || 'No additional details provided',
      };

      const response = await reportService.createReport(reportData, token);

      if (response.status) {
        setShowReportModal(false);
        setShowMoreMenu(false);
        setReportReason('');
        setReportDescription('');
        Alert.alert(
          'Report Submitted',
          `Thank you for reporting this user. We will review it shortly.`
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  };

  const getReportReasons = () => {
    return [
      'Harassment',
      'Spam',
      'Inappropriate Behavior',
      'Fake Account',
      'Other',
    ];
  };

  const handlePostPress = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => handlePostPress(item._id)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
    </TouchableOpacity>
  );

  const renderGrid = (data: Post[], emptyText: string) => {
    if (!data) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <ImageSlashIcon size={40} />
          </View>
          <Text style={styles.emptyTitle}>{emptyText}</Text>
        </View>
      );
    }

    return data.length > 0 ? (
      <FlatList
        data={data}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        numColumns={3}
        scrollEnabled={false}
        columnWrapperStyle={styles.postsRow}
        contentContainerStyle={styles.postsGrid}
      />
    ) : (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <ImageSlashIcon size={40} />
        </View>
        <Text style={styles.emptyTitle}>{emptyText}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity activeOpacity={1}>
              <MoreHorizontal size={24} color="transparent" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <UserSlashIcon />
          </View>
          <Text style={styles.emptyTitle}>User not found</Text>
          <TouchableOpacity
            style={styles.backButton}
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userProfile.username}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              setShowMoreMenu(true);
            }}
          >
            <MoreHorizontal size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: userProfile.avatar }}
              style={styles.profileImage}
            />
            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userProfile.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {userProfile.followers.length}
                </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {userProfile.following.length}
                </Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.fullName}>{userProfile.fullName}</Text>
              {userProfile.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
            {userProfile.bio ? (
              <Text style={styles.bio}>{userProfile.bio}</Text>
            ) : null}
          </View>

          {userProfile._id !== user?._id && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  isFollowing && styles.followingButton,
                ]}
                onPress={handleFollow}
              >
                {isFollowing ? (
                  <UserMinus size={18} color={theme.text} />
                ) : (
                  <UserPlus size={18} color={theme.background} />
                )}
                <Text
                  style={[
                    styles.followButtonText,
                    isFollowing && styles.followingButtonText,
                  ]}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.messageButton}
                onPress={handleMessage}
              >
                <MessageCircle size={18} color="#000" />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.tabsSection}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'posts' && styles.activeTab]}
            onPress={() => setSelectedTab('posts')}
          >
            <Grid size={20} color={selectedTab === 'posts' ? '#000' : '#666'} />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'posts' && styles.activeTabText,
              ]}
            >
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'liked' && styles.activeTab]}
            onPress={() => setSelectedTab('liked')}
          >
            <Star
              size={20}
              color={selectedTab === 'liked' ? '#000' : theme.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'liked' && styles.activeTabText,
              ]}
            >
              Liked
            </Text>
          </TouchableOpacity>
        </View>
        {renderGrid(
          selectedTab === 'posts' ? posts : likedPosts,
          selectedTab === 'posts' ? 'No posts yet' : 'No liked posts yet'
        )}
      </ScrollView>

      <Modal
        visible={showMoreMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoreMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMoreMenu(false)}
        >
          <View style={styles.moreMenu}>
            <View style={styles.moreMenuHeader}>
              <Text style={styles.moreMenuTitle}>More Options</Text>
              <TouchableOpacity onPress={() => setShowMoreMenu(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => {
                setShowMoreMenu(false);
                setShowShareModal(true);
              }}
            >
              <Share size={20} color={theme.text} />
              <Text style={styles.moreMenuItemText}>Share Profile</Text>
            </TouchableOpacity>

            {userProfile && userProfile._id !== user?._id && (
              <TouchableOpacity
                style={styles.moreMenuItem}
                onPress={() => {
                  setShowMoreMenu(false);
                  setShowReportModal(true);
                }}
              >
                <Flag size={20} color={theme.error} />
                <Text style={[styles.moreMenuItemText, { color: theme.error }]}>
                  Report User
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => {
                Alert.alert('Block User', `Block ${userProfile.fullName}?`);
                setShowMoreMenu(false);
              }}
            >
              <X size={20} color={theme.error} />
              <Text style={[styles.moreMenuItemText, { color: theme.error }]}>
                Block User
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showReportModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowReportModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modal}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Report User</Text>
                <TouchableOpacity onPress={() => setShowReportModal(false)}>
                  <X size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              <Text
                style={[styles.modalSubtitle, { color: theme.textSecondary }]}
              >
                Why are you reporting this user?
              </Text>

              {getReportReasons().map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.modalOption,
                    reportReason === reason && styles.modalOptionSelected,
                  ]}
                  onPress={() => setReportReason(reason)}
                >
                  <Text style={[styles.modalOptionText, { color: theme.text }]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Additional details (optional)"
                placeholderTextColor={theme.textSecondary}
                value={reportDescription}
                onChangeText={setReportDescription}
                multiline
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.modalButtonSubmit,
                    {
                      backgroundColor: theme.error,
                    },
                  ]}
                  onPress={() => setShowReportModal(false)}
                  disabled={!reportReason.trim()}
                >
                  <Text style={[styles.modalButtonText, { color: '#000' }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.modalButtonCancel,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={handleReport}
                >
                  <Text style={[styles.modalButtonText, { color: theme.text }]}>
                    Submit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showShareModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowShareModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modal}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Share User Profile</Text>
                  <TouchableOpacity onPress={() => setShowShareModal(false)}>
                    <X size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.modalSearchInput}
                  placeholder={'Search user...'}
                  value={userSearchQuery}
                  onChangeText={setUserSearchQuery}
                  placeholderTextColor={theme.textSecondary}
                  autoFocus
                />

                <FlatList
                  data={searchedUsers}
                  renderItem={({ item }) => {
                    return renderUserList(item);
                  }}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={styles.usersList}
                  ListEmptyComponent={
                    <View style={styles.emptySearchState}>
                      <Text style={styles.emptySearchText}>No users found</Text>
                    </View>
                  }
                />

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={handleShare}
                  >
                    <Text style={styles.modalButtonText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
