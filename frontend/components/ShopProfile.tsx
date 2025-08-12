import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Grid2x2 as Grid, Star, LogOut, Check, Package, BarChart3, Edit3, MapPin, Phone, Mail, Globe, ExternalLink } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Post } from '@/types/Post';
import { Product } from '@/types/Product';
import { Theme } from '@/types/Theme';  
import { userService, postService, productService } from '@/services';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingVertical: -100,
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
      gap: 12,
    },
    headerButton: {
      padding: 4,
    },
    actionButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionButtonText: {
      color: 'white',
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    content: {
      flex: 1,
    },
    coverImage: {
      width: '100%',
      height: 200,
    },
    shopSection: {
      backgroundColor: theme.background,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    shopHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      marginTop: -40,
    },
    shopAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginRight: 20,
      borderWidth: 4,
      borderColor: theme.background,
    },
    shopStats: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 25,
    },
    shopInfo: {
      marginBottom: 16,
    },
    nameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    shopName: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginRight: 8,
    },
    verifiedBadgeContainer: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    shopUsername: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      marginBottom: 8,
    },
    shopDescription: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      lineHeight: 22,
      marginBottom: 16,
    },
    contactInfo: {
      marginBottom: 12,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    contactText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    contactLinkText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.primary,
    },
    categories: {
      marginBottom: 20,
    },
    categoriesTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 8,
    },
    categoryTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryTag: {
      backgroundColor: theme.card,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    categoryTagText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    viewOrder: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingVertical: 12,
      gap: 8,
    },
    viewOrderText: {
      color: theme.text,
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    analyticsButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primary,
      borderRadius: 8,
      paddingVertical: 12,
      gap: 8,
    },
    analyticsButtonText: {
      color: '#000',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
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
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 2,
      textAlign: 'center',
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
      if (!user?._id || !token) return;
      
      try {
        setLoading(true);

        console.log('Fetching shop profile for:', user._id);
        const shop = await userService.getUserById(user._id, token);
        setShopProfile(shop);
      } catch (error) {
        console.error('Error fetching shop profile:', error);
        setShopProfile(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchPosts = async () => {
      if (!user?._id || !token) return;
      
      try {
        const posts = await postService.getUserPosts(user._id, token);
        setMyPosts(posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    const fetchProducts = async () => {
      if (!user?._id || !token) return;
      
      try {
        const products = await productService.getShopProducts(user._id, token);
        setMyProducts(products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchShopProfile();
    fetchPosts();
    fetchProducts();
  }, [user, token]);

  const fetchData = async () => {
    if (!user?._id || !token) return;

    try {
      // Fetch liked posts
      const likedPosts = await postService.getUserLikedPosts(user._id, token);
      setMyLikedPosts(likedPosts);

      // Fetch user's posts
      const userPosts = await postService.getUserPosts(user._id, token);
      setMyPosts(userPosts);

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

  const handleAnalyticsPress = () => {
    router.push('/shop/analytics');
  };

  const handleViewOrdersPress = () => {
    console.log('View Orders pressed');
  };

  const handleContactPress = (type: 'email' | 'phone' | 'website', value: string) => {
    if (!value) return;
    
    let url = '';
    switch (type) {
      case 'email':
        url = `mailto:${value}`;
        break;
      case 'phone':
        url = `tel:${value}`;
        break;
      case 'website':
        url = value.startsWith('http') ? value : `https://${value}`;
        break;
    }
    
    Linking.openURL(url);
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
        {/* Cover Image */}
        <Image 
          source={{ 
            uri: user.shop?.coverImageUrl || 'https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&h=1087'
          }} 
          style={styles.coverImage} 
        />

        {/* Shop Info */}
        <View style={styles.shopSection}>
          <View style={styles.shopHeader}>
            <Image source={{ uri: user.avatar }} style={styles.shopAvatar} />
            <View style={styles.shopStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{myPosts?.length || 0}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{myProducts?.length || 0}</Text>
                <Text style={styles.statLabel}>Products</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user?.followers?.length || 0}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
            </View>
          </View>

          <View style={styles.shopInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.shopName}>{user.fullName}</Text>
              {user.isVerified && (
                <View style={styles.verifiedBadgeContainer}>
                  <Check size={10} color="white" />
                </View>
              )}
            </View>
            <Text style={styles.shopUsername}>@{user.username}</Text>
            <Text style={styles.shopDescription}>{user.bio}</Text>

            {/* Contact Info */}
            <View style={styles.contactInfo}>
              {user.shop?.location && (
                <View style={styles.contactItem}>
                  <MapPin size={16} color={theme.textSecondary} />
                  <Text style={styles.contactText}>{user.shop.location}</Text>
                </View>
              )}
              
              {user.shop?.contactPhone && (
                <TouchableOpacity 
                  style={styles.contactItem}
                  onPress={() => handleContactPress('phone', user.shop?.contactPhone || '')}
                >
                  <Phone size={16} color={theme.textSecondary} />
                  <Text style={styles.contactLinkText}>{user.shop.contactPhone}</Text>
                </TouchableOpacity>
              )}
              
              {user.shop?.contactEmail && (
                <TouchableOpacity 
                  style={styles.contactItem}
                  onPress={() => handleContactPress('email', user.shop?.contactEmail || '')}
                >
                  <Mail size={16} color={theme.textSecondary} />
                  <Text style={styles.contactLinkText}>{user.shop.contactEmail}</Text>
                </TouchableOpacity>
              )}
              
              {user.shop?.website && (
                <TouchableOpacity 
                  style={styles.contactItem}
                  onPress={() => handleContactPress('website', user.shop?.website || '')}
                >
                  <Globe size={16} color={theme.primary} />
                  <Text style={styles.contactLinkText}>{user.shop.website}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Categories */}
          {user.shop?.categories && user.shop.categories.length > 0 && (
            <View style={styles.categories}>
              <Text style={styles.categoriesTitle}>Categories</Text>
              <View style={styles.categoryTags}>
                {user.shop.categories.map((category: string, index: number) => (
                  <View key={index} style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{category}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.viewOrder}
              onPress={handleViewOrdersPress}
            >
              <Package size={16} strokeWidth={2} color={theme.text} />
              <Text style={styles.viewOrderText}>View Orders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.analyticsButton}
              onPress={handleAnalyticsPress}
            >
              <BarChart3 size={16} strokeWidth={2} color="#000" />
              <Text style={styles.analyticsButtonText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs Section */}
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
