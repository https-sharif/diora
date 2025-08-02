import React, { useEffect, useState } from 'react';
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
import { Settings, Grid2x2 as Grid, Star, LogOut, Check, Package } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Post } from '@/types/Post';
import { Product } from '@/types/Product';
import { Theme } from '@/types/Theme';  
import axios from 'axios';
import { API_URL } from '@/constants/api';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
      paddingVertical: 16,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.background,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: theme.text,
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
      backgroundColor: theme.background,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.background,
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
    userNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    verifiedBadgeContainer: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullName: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    username: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 2,
    },
    bio: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      marginTop: 8,
      lineHeight: 20,
    },
    statsSection: {
      flexDirection: 'row',
      backgroundColor: theme.background,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.background,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    statLabel: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 4,
    },
    tabsSection: {
      flexDirection: 'row',
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.background,
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
    productGrid: {
      backgroundColor: theme.background,
    },
    postsRow: {
      paddingHorizontal: 2,
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
    productItem: {
      width: '46%',
      backgroundColor: theme.card,
      borderRadius: 12,
      overflow: 'hidden',
      marginVertical: 8,
      marginHorizontal: '2%',
    },
    productImage: {
      width: '100%',
      height: 200,
      backgroundColor: theme.card,
    },
    productInfo: {
      padding: 8,
    },
    productName: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 2,
    },
    productPrice: {
      fontSize: 14,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
  });

export default function ShopProfile() {
  const { user, logout, token } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'posts' | 'products' | 'liked'>('posts');
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [myPosts, setMyPosts] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [myLikedPosts, setMyLikedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shopProfile, setShopProfile] = useState(null);

  useEffect(() => {
    const fetchShopProfile = async () => {
      try {
        setLoading(true);

        console.log('Fetching shop profile for:', user?._id);
        const response = await axios.get(`${API_URL}/api/user/${user?._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === false) {
          setShopProfile(null);
          return;
        }
        const shop = response.data.user;

        setShopProfile(shop);
      } catch (error) {
        console.error('Error fetching shop profile:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/post/user/${user?._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === false) {
          return;
        }

        setMyPosts(response.data.posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/product/shop/${user?._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === false) {
          return;
        }

        setMyProducts(response.data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchShopProfile();
    fetchPosts();
    fetchProducts();
  }, [user, token]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const likedPostsResponse = await axios.get(`${API_URL}/api/post/user/${user?._id}/liked`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMyLikedPosts(likedPostsResponse.data.posts);

      const myPostsResponse = await axios.get(`${API_URL}/api/post/user/${user?._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMyPosts(myPostsResponse.data.posts);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?._id) fetchData();
  }, [user, user?.posts, user?.likedPosts, token]);

  const handleTabPress = (tab: 'posts' | 'products' | 'liked') => { setActiveTab(tab) };

  const handlePostPress = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const renderPost = ({ item }: { item: Post }) => {
    return (
      <TouchableOpacity
        style={styles.postItem}
        onPress={() => handlePostPress(item._id)}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      </TouchableOpacity>
    )
  }

  const renderProduct = ({ item }: { item: Product }) => {
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => handleProductPress(item._id)}
      >
        <Image source={{ uri: item.imageUrl[0] }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop Profile</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleSettingsPress}
          >
            <Settings size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={logout}>
            <LogOut size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image source={{ uri: user.avatar }} style={styles.profileImage} />
          <View style={styles.profileInfo}>
             <View style={styles.userNameRow}>
              <Text style={styles.fullName}>{user.fullName}</Text>
              {user.isVerified && (
                <View style={styles.verifiedBadgeContainer}>
                  <Check size={10} color="white" />
                </View>
              )}
             </View>
            <Text style={styles.username}>@{user.username}</Text>
            <Text style={styles.bio}>{user.bio}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{myPosts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{myProducts.length}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {user.followers.length.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.following.length.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {/* Posts Tab */}
        <View style={styles.tabsSection}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' ? styles.activeTab : {}]}
            onPress={() => handleTabPress('posts')}
            activeOpacity={0.7}
          >
            <Grid
              size={activeTab === 'posts' ? 22 : 20}
              color={activeTab === 'posts' ? theme.text : theme.textSecondary}
            />
            <Text
              style={
                activeTab === 'posts' ? styles.activeTabText : styles.tabText
              }
            >
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'products' ? styles.activeTab : {}]}
            onPress={() => handleTabPress('products')}
            activeOpacity={0.7}
          >
            <Package
              size={activeTab === 'products' ? 22 : 20}
              color={activeTab === 'products' ? theme.text : theme.textSecondary}
            />
            <Text
              style={
                activeTab === 'products' ? styles.activeTabText : styles.tabText
              }
            >
              Products
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'liked' ? styles.activeTab : {}]}
            onPress={() => handleTabPress('liked')}
            activeOpacity={0.7}
          >
            <Star
              size={activeTab === 'liked' ? 22 : 20}
              color={activeTab === 'liked' ? theme.text : theme.textSecondary}
            />
            <Text
              style={
                activeTab === 'liked' ? styles.activeTabText : styles.tabText
              }
            >
              Liked
            </Text>
          </TouchableOpacity>
        </View>

        {/* Posts Grid */}
        {activeTab === 'posts' && (
          <FlatList
            data={myPosts}
            renderItem={renderPost}
            keyExtractor={(item) => item._id}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.postsRow}
            contentContainerStyle={styles.postsGrid}
          />
        )}

        {/* Products Grid */}
        {activeTab === 'products' && (
          <FlatList
            data={myProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item._id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.productGrid}
          />
        )}

        {/* Liked Posts */}
        {activeTab === 'liked' && (
          <FlatList
            data={myLikedPosts}
            renderItem={renderPost}
            keyExtractor={(item) => item._id}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.postsRow}
            contentContainerStyle={styles.postsGrid}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
