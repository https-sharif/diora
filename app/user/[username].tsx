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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  Grid2x2 as Grid, 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Flag,
  X,
  Star
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';

const { width } = Dimensions.get('window');

interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  isFollowing: boolean;
  isVerified: boolean;
  location?: string;
  website?: string;
  joinDate: string;
  stylePreferences: string[];
  userPosts: Array<{
    id: string;
    image: string;
    stars: number;
    comments: number;
    caption: string;
    timestamp: string;
  }>;
}

const mockUserProfiles: Record<string, UserProfile> = {
  'fashionista_jane': {
    id: '1',
    username: 'fashionista_jane',
    fullName: 'Jane Smith',
    avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=300',
    bio: 'Fashion enthusiast & style blogger ✨ Sharing daily outfit inspiration and vintage finds 💫',
    followers: 12500,
    following: 890,
    posts: 234,
    isFollowing: false,
    isVerified: true,
    location: 'New York, NY',
    website: 'fashionistajane.com',
    joinDate: 'January 2023',
    stylePreferences: ['Vintage', 'Casual', 'Boho'],
    userPosts: [
      {
        id: '1',
        image: 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=400',
        stars: 128,
        comments: 23,
        caption: 'Loving this vintage look! Perfect for a casual day out ✨',
        timestamp: '2h ago',
      },
      {
        id: '2',
        image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400',
        stars: 256,
        comments: 41,
        caption: 'Black and white never goes out of style 🖤🤍',
        timestamp: '1d ago',
      },
      {
        id: '3',
        image: 'https://images.pexels.com/photos/1457983/pexels-photo-1457983.jpeg?auto=compress&cs=tinysrgb&w=400',
        stars: 89,
        comments: 12,
        caption: 'Summer vibes with this flowy dress 🌸',
        timestamp: '3d ago',
      },
      {
        id: '4',
        image: 'https://images.pexels.com/photos/1040424/pexels-photo-1040424.jpeg?auto=compress&cs=tinysrgb&w=400',
        stars: 167,
        comments: 28,
        caption: 'Street style inspiration from NYC 🏙️',
        timestamp: '5d ago',
      },
      {
        id: '5',
        image: 'https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=400',
        stars: 203,
        comments: 35,
        caption: 'Accessorizing with vintage jewelry 💎',
        timestamp: '1w ago',
      },
      {
        id: '6',
        image: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=400',
        stars: 145,
        comments: 19,
        caption: 'Classic blazer for the office look 👔',
        timestamp: '1w ago',
      },
    ],
  },
  'style_maven': {
    id: '2',
    username: 'style_maven',
    fullName: 'Alex Rodriguez',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300',
    bio: 'Minimalist fashion advocate | Sustainable style choices | Less is more 🌱',
    followers: 8200,
    following: 456,
    posts: 156,
    isFollowing: true,
    isVerified: false,
    location: 'Los Angeles, CA',
    joinDate: 'March 2023',
    stylePreferences: ['Minimalist', 'Casual', 'Formal'],
    userPosts: [
      {
        id: '7',
        image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
        stars: 95,
        comments: 15,
        caption: 'Minimalist wardrobe essentials 🤍',
        timestamp: '4h ago',
      },
      {
        id: '8',
        image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
        stars: 142,
        comments: 22,
        caption: 'Sustainable fashion choices matter 🌍',
        timestamp: '2d ago',
      },
    ],
  },
};

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const { addNotification } = useNotifications();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'posts' | 'liked'>('posts');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username && mockUserProfiles[username]) {
      setUserProfile(mockUserProfiles[username]);
    }
    setLoading(false);
  }, [username]);

  const handleFollow = () => {
    if (!userProfile) return;
    
    const newFollowingState = !userProfile.isFollowing;
    setUserProfile(prev => prev ? {
      ...prev,
      isFollowing: newFollowingState,
      followers: newFollowingState ? prev.followers + 1 : prev.followers - 1,
    } : null);

    // Add notification
    addNotification({
      type: 'follow',
      title: newFollowingState ? 'New Follower' : 'Unfollowed',
      message: newFollowingState 
        ? `${currentUser?.username} started following you`
        : `${currentUser?.username} unfollowed you`,
      avatar: currentUser?.avatar,
    });
  };

  const handleMessage = () => {
    Alert.alert('Message', `Send a message to ${userProfile?.fullName}`);
  };

  const handleShare = () => {
    Alert.alert('Share Profile', `Share ${userProfile?.fullName}'s profile`);
  };

  const handleReport = () => {
    Alert.alert(
      'Report User',
      'Are you sure you want to report this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', style: 'destructive', onPress: () => {
          Alert.alert('Reported', 'User has been reported. Thank you for keeping our community safe.');
          setShowMoreMenu(false);
        }},
      ]
    );
  };

  const handlePostPress = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const renderPost = ({ item }: { item: UserProfile['userPosts'][0] }) => (
    <TouchableOpacity 
      style={styles.postItem}
      onPress={() => handlePostPress(item.id)}
    >
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <View style={styles.postOverlay}>
        <View style={styles.postStats}>
          <View style={styles.postStat}>
            <Star size={12} color="#fff" fill="#fff" />
            <Text style={styles.postStatText}>{item.stars}</Text>
          </View>
          <View style={styles.postStat}>
            <MessageCircle size={12} color="#fff" />
            <Text style={styles.postStatText}>{item.comments}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  // const renderPost = ({ item }: { item: typeof userProfile.userPosts[0] }) => (
  //   <TouchableOpacity 
  //     style={styles.postItem}
  //     onPress={() => handlePostPress(item.id)}
  //   >
  //     <Image source={{ uri: item.image }} style={styles.postImage} />
  //     <View style={styles.postOverlay}>
  //       <View style={styles.postStats}>
  //         <View style={styles.postStat}>
  //           <Star size={12} color="#fff" fill="#fff" />
  //           <Text style={styles.postStatText}>{item.stars}</Text>
  //         </View>
  //         <View style={styles.postStat}>
  //           <MessageCircle size={12} color="#fff" />
  //           <Text style={styles.postStatText}>{item.comments}</Text>
  //         </View>
  //       </View>
  //     </View>
  //   </TouchableOpacity>
  // );

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
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userProfile.username}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Share size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => setShowMoreMenu(true)}
          >
            <MoreHorizontal size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: userProfile.avatar }} style={styles.profileImage} />
            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userProfile.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userProfile.followers.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userProfile.following}</Text>
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
            <Text style={styles.bio}>{userProfile.bio}</Text>
            {userProfile.location && (
              <Text style={styles.location}>📍 {userProfile.location}</Text>
            )}
            {userProfile.website && (
              <TouchableOpacity>
                <Text style={styles.website}>🔗 {userProfile.website}</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.joinDate}>Joined {userProfile.joinDate}</Text>
          </View>

          {/* Style Preferences */}
          <View style={styles.stylePreferences}>
            <Text style={styles.styleTitle}>Style Preferences</Text>
            <View style={styles.styleTags}>
              {userProfile.stylePreferences.map((style, index) => (
                <View key={index} style={styles.styleTag}>
                  <Text style={styles.styleTagText}>{style}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.followButton, userProfile.isFollowing && styles.followingButton]}
              onPress={handleFollow}
            >
              {userProfile.isFollowing ? (
                <UserMinus size={16} color="#666" />
              ) : (
                <UserPlus size={16} color="#fff" />
              )}
              <Text style={[
                styles.followButtonText, 
                userProfile.isFollowing && styles.followingButtonText
              ]}>
                {userProfile.isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
              <MessageCircle size={16} color="#000" />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Posts Tab */}
        <View style={styles.tabsSection}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'posts' && styles.activeTab]}
            onPress={() => setSelectedTab('posts')}
          >
            <Grid size={20} color={selectedTab === 'posts' ? '#000' : '#666'} />
            <Text style={[
              styles.tabText, 
              selectedTab === 'posts' && styles.activeTabText
            ]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'liked' && styles.activeTab]}
            onPress={() => setSelectedTab('liked')}
          >
            <Heart size={20} color={selectedTab === 'liked' ? '#000' : '#666'} />
            <Text style={[
              styles.tabText, 
              selectedTab === 'liked' && styles.activeTabText
            ]}>
              Liked
            </Text>
          </TouchableOpacity>
        </View>

        {/* Posts Grid */}
        {selectedTab === 'posts' ? (
          <FlatList
            data={userProfile.userPosts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.postsRow}
            contentContainerStyle={styles.postsGrid}
          />
        ) : (
          <View style={styles.emptyState}>
            <Heart size={48} color="#E0E0E0" />
            <Text style={styles.emptyStateText}>No liked posts yet</Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* More Menu Modal */}
      <Modal
        visible={showMoreMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoreMenu(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.moreMenu}>
            <View style={styles.moreMenuHeader}>
              <Text style={styles.moreMenuTitle}>More Options</Text>
              <TouchableOpacity onPress={() => setShowMoreMenu(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.moreMenuItem} onPress={handleReport}>
              <Flag size={20} color="#FF3B30" />
              <Text style={styles.moreMenuItemText}>Report User</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.moreMenuItem}
              onPress={() => {
                Alert.alert('Block User', `Block ${userProfile.fullName}?`);
                setShowMoreMenu(false);
              }}
            >
              <X size={20} color="#FF3B30" />
              <Text style={styles.moreMenuItemText}>Block User</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
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
    color: '#666',
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
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  profileSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
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
    color: '#000',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
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
    color: '#000',
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
    color: '#000',
    lineHeight: 22,
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  website: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#007AFF',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  stylePreferences: {
    marginBottom: 20,
  },
  styleTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    marginBottom: 8,
  },
  styleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleTag: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  styleTagText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
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
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  followingButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  followingButtonText: {
    color: '#666',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 8,
  },
  messageButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  tabsSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
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
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  activeTabText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  postsGrid: {
    backgroundColor: '#fff',
    paddingBottom: 84,
  },
  postsRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  postItem: {
    width: '32%',
    aspectRatio: 1,
    margin: 1,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  postStats: {
    flexDirection: 'row',
    gap: 16,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#fff',
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#999',
    marginTop: 16,
  },
  bottomPadding: {
    height: 34,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  moreMenu: {
    backgroundColor: '#fff',
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
    borderBottomColor: '#e9ecef',
  },
  moreMenuTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#000',
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
    color: '#FF3B30',
  },
});