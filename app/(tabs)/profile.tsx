import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Grid2x2 as Grid, Heart, LogOut } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

const userPosts = [
  {
    id: '1',
    image: 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=300',
    stars: 128,
  },
  {
    id: '2',
    image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300',
    stars: 256,
  },
  {
    id: '3',
    image: 'https://images.pexels.com/photos/1457983/pexels-photo-1457983.jpeg?auto=compress&cs=tinysrgb&w=300',
    stars: 89,
  },
  {
    id: '4',
    image: 'https://images.pexels.com/photos/1040424/pexels-photo-1040424.jpeg?auto=compress&cs=tinysrgb&w=300',
    stars: 167,
  },
  {
    id: '5',
    image: 'https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=300',
    stars: 203,
  },
  {
    id: '6',
    image: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=300',
    stars: 145,
  },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handlePostPress = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const renderPost = ({ item }: { item: typeof userPosts[0] }) => (
    <TouchableOpacity 
      style={styles.postItem}
      onPress={() => handlePostPress(item.id)}
    >
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <View style={styles.postOverlay}>
        <Text style={styles.postStars}>⭐ {item.stars}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={handleSettingsPress}>
            <Settings size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={logout}>
            <LogOut size={24} color="#000" />
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
            <Text style={styles.statNumber}>{user.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.followers.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareButtonText}>Share Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Demographics */}
        <View style={styles.demographicsSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.demographicItem}>
            <Text style={styles.demographicLabel}>Email</Text>
            <Text style={styles.demographicValue}>{user.email}</Text>
          </View>
          <View style={styles.demographicItem}>
            <Text style={styles.demographicLabel}>Member Since</Text>
            <Text style={styles.demographicValue}>January 2024</Text>
          </View>
          <View style={styles.demographicItem}>
            <Text style={styles.demographicLabel}>Location</Text>
            <Text style={styles.demographicValue}>New York, NY</Text>
          </View>
          <View style={styles.demographicItem}>
            <Text style={styles.demographicLabel}>Style Preference</Text>
            <Text style={styles.demographicValue}>Casual Chic</Text>
          </View>
        </View>

        {/* Posts Tab */}
        <View style={styles.tabsSection}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Grid size={20} color="#000" />
            <Text style={styles.activeTabText}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Heart size={20} color="#666" />
            <Text style={styles.tabText}>Liked</Text>
          </TouchableOpacity>
        </View>

        {/* Posts Grid */}
        <FlatList
          data={userPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          numColumns={3}
          scrollEnabled={false}
          columnWrapperStyle={styles.postsRow}
          contentContainerStyle={styles.postsGrid}
        />

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#000',
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
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  fullName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  username: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  bio: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#000',
    marginTop: 8,
    lineHeight: 20,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  shareButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  demographicsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginBottom: 16,
  },
  demographicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  demographicLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  demographicValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
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
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  postStars: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  bottomPadding: {
    height: 34,
  },
});