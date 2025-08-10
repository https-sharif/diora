import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Shield,
  AlertTriangle,
  Ban,
  Clock,
  User,
  MessageSquare,
  Eye,
  Flag,
  XCircle,
  FileText,
  Package,
  Grid3x3,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { Theme } from '@/types/Theme';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import { router } from 'expo-router';
import LoadingView from '@/components/Loading';
import debounce from 'lodash.debounce';

interface SearchResult {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  avatar: string;
  type: 'user' | 'shop' | 'admin';
  isVerified: boolean;
  followers: string[];
  following: string[];
  posts: string[];
  createdAt: string;
  status?: 'active' | 'suspended' | 'banned';
  suspendedUntil?: string;
  banReason?: string;
  lastActiveAt?: string;
}

interface PostResult {
  _id: string;
  caption: string;
  user: {
    _id: string;
    username: string;
    avatar: string;
    type: 'user' | 'shop' | 'admin';
  };
  imageUrl: string;
  likes: number;
  comments: number;
  createdAt: string;
  reports?: number;
  isHidden?: boolean;
}

interface ProductResult {
  _id: string;
  name: string;
  description: string;
  price: number;
  shopId: {
    _id: string;
    username: string;
    avatar: string;
  };
  images: string[];
  stock: number;
  reviews: number;
  createdAt: string;
  reports?: number;
  isHidden?: boolean;
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingVertical: -100,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: theme.text,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.text,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterButtonActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.text,
  },
  filterButtonTextActive: {
    color: '#000',
  },
  userCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userCardSuspended: {
    borderColor: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderWidth: 2,
  },
  userCardBanned: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 2,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    borderWidth: 2,
    borderColor: theme.border,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userFullName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.text,
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    minWidth: 60,
    alignItems: 'center',
  },
  statusBadgeActive: {
    backgroundColor: theme.primary,
  },
  statusBadgeSuspended: {
    backgroundColor: '#f59e0b',
  },
  statusBadgeBanned: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: '#000',
    textAlign: 'center',
  },
  userStats: {
    flexDirection: 'row',
    backgroundColor: theme.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: theme.text,
    marginLeft: 6,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: theme.border,
    flex: 1,
    minHeight: 44,
  },
  viewButton: {
    backgroundColor: theme.primary,
  },
  warnButton: {
    backgroundColor: '#f59e0b',
  },
  suspendButton: {
    backgroundColor: '#f97316',
  },
  banButton: {
    backgroundColor: '#ef4444',
  },
  unbanButton: {
    backgroundColor: '#22c55e',
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: -100,
  },
  contentTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 4,
  },
  contentTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  contentTypeButtonActive: {
    backgroundColor: theme.primary,
  },
  contentTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
    marginLeft: 6,
  },
  contentTypeTextActive: {
    color: '#000',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: theme.text,
  },
  userLocation: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
  postImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginLeft: 12,
  },
});

export default function Monitor() {
  const { theme } = useTheme();
  const { user, token } = useAuth();
  const styles = createStyles(theme);

  // Debug helper function
  const safeRender = (content: any, fallback: string = 'N/A') => {
    if (content === null || content === undefined) return fallback;
    if (typeof content === 'string') return content;
    if (typeof content === 'number') return content.toString();
    return String(content);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [contentType, setContentType] = useState<'users' | 'posts' | 'products'>('users');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [postResults, setPostResults] = useState<PostResult[]>([]);
  const [productResults, setProductResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [contentTypeLoading, setContentTypeLoading] = useState({
    users: false,
    posts: false,
    products: false
  });

  const userFilters = ['All', 'Users', 'Shops', 'Suspended', 'Banned'];
  const postFilters = ['All', 'Recent', 'Reported', 'Hidden'];
  const productFilters = ['All', 'Recent', 'Reported', 'Out of Stock'];

  const getCurrentFilters = () => {
    switch (contentType) {
      case 'posts': return postFilters;
      case 'products': return productFilters;
      default: return userFilters;
    }
  };

  const debouncedSearch = useCallback(
    debounce(async (query: string, filter: string, type: 'users' | 'posts' | 'products' = contentType) => {
      setLoading(true);
      setContentTypeLoading(prev => ({ ...prev, [type]: true }));
      
      try {
        let endpoint = '';
        const params = new URLSearchParams();
        
        if (query.trim()) params.append('query', query.trim());

        switch (type) {
          case 'users':
            endpoint = `${API_URL}/api/admin/users/search`;
            if (filter !== 'All') {
              if (filter === 'Users') params.append('type', 'user');
              if (filter === 'Shops') params.append('type', 'shop');
              if (filter === 'Suspended') params.append('status', 'suspended');
              if (filter === 'Banned') params.append('status', 'banned');
            }
            break;
          case 'posts':
            endpoint = `${API_URL}/api/admin/posts/search`;
            if (filter !== 'All') {
              if (filter === 'Recent') params.append('sort', 'recent');
              if (filter === 'Reported') params.append('reported', 'true');
              if (filter === 'Hidden') params.append('hidden', 'true');
            }
            break;
          case 'products':
            endpoint = `${API_URL}/api/admin/products/search`;
            if (filter !== 'All') {
              if (filter === 'Recent') params.append('sort', 'recent');
              if (filter === 'Reported') params.append('reported', 'true');
              if (filter === 'Out of Stock') params.append('outOfStock', 'true');
            }
            break;
        }
        
        console.log(`Searching ${type} - API endpoint:`, `${endpoint}?${params.toString()}`);
        const response = await axios.get(`${endpoint}?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(`${type} response:`, response.data);

        if (response.data.status) {
          switch (type) {
            case 'users':
              const users = Array.isArray(response.data.users) ? response.data.users : [];
              console.log('Users data received:', users.length, 'items');
              setSearchResults(users);
              setPostResults([]);
              setProductResults([]);
              break;
            case 'posts':
              const posts = Array.isArray(response.data.posts) ? response.data.posts : [];
              console.log('Posts data received:', posts.length, 'items');
              setPostResults(posts);
              setSearchResults([]);
              setProductResults([]);
              break;
            case 'products':
              const products = Array.isArray(response.data.products) ? response.data.products : [];
              console.log('Products data received:', products.length, 'items');
              setProductResults(products);
              setSearchResults([]);
              setPostResults([]);
              break;
          }
        } else {
          console.log('API response status false:', response.data);
          // Clear results on failed response
          setSearchResults([]);
          setPostResults([]);
          setProductResults([]);
        }
      } catch (error: any) {
        console.error(`Search ${type} error:`, error);
        console.error('Error details:', error.response?.data);
        Alert.alert('Error', `Failed to search ${type}: ${error.response?.data?.message || error.message}`);
        // Clear results on error
        setSearchResults([]);
        setPostResults([]);
        setProductResults([]);
      } finally {
        setLoading(false);
        setContentTypeLoading(prev => ({ ...prev, [type]: false }));
      }
    }, 500),
    [token, contentType]
  );

  useEffect(() => {
    debouncedSearch(searchQuery, activeFilter, contentType);
  }, [searchQuery, activeFilter, contentType, debouncedSearch]);

  // Reset filter when content type changes
  useEffect(() => {
    setActiveFilter('All');
    setSearchQuery('');
  }, [contentType]);

  // Initial load when component mounts
  useEffect(() => {
    if (token) {
      // Clear current results
      setSearchResults([]);
      setPostResults([]);
      setProductResults([]);
      
      // Reset filter
      setActiveFilter('All');
      // Load current content type
      debouncedSearch('', 'All', contentType);
    }
  }, [token, contentType]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await debouncedSearch(searchQuery, activeFilter, contentType);
    setRefreshing(false);
  }, [searchQuery, activeFilter, contentType, debouncedSearch]);

  const handleUserAction = async (userId: string, action: string, duration?: number) => {
    try {
      let endpoint = '';
      let payload: any = { action };

      switch (action) {
        case 'suspend':
          endpoint = `${API_URL}/api/admin/users/${userId}/suspend`;
          payload.duration = duration || 7;
          break;
        case 'ban':
          endpoint = `${API_URL}/api/admin/users/${userId}/ban`;
          break;
        case 'unban':
          endpoint = `${API_URL}/api/admin/users/${userId}/unban`;
          break;
        case 'warn':
          endpoint = `${API_URL}/api/admin/users/${userId}/warn`;
          payload.message = 'Please review community guidelines';
          break;
      }

      const response = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        Alert.alert('Success', `User ${action} completed successfully`);
        handleRefresh();
      }
    } catch (error: any) {
      console.error(`${action} error:`, error);
      Alert.alert('Error', `Failed to ${action} user`);
    }
  };

  const showActionDialog = (user: SearchResult, action: string) => {
    const actionName = action.charAt(0).toUpperCase() + action.slice(1);
    Alert.alert(
      `${actionName} User`,
      `Are you sure you want to ${action} ${user.fullName} (@${user.username})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: actionName, 
          style: 'destructive',
          onPress: () => handleUserAction(user._id, action)
        }
      ]
    );
  };

  const renderUserCard = ({ item: user }: { item: SearchResult }) => {
    const isActive = !user.status || user.status === 'active';
    const isSuspended = user.status === 'suspended';
    const isBanned = user.status === 'banned';

    return (
      <View style={[
        styles.userCard,
        isSuspended && styles.userCardSuspended,
        isBanned && styles.userCardBanned
      ]}>
        <View style={styles.userHeader}>
          <Image 
            source={{ 
              uri: user.avatar || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png' 
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userFullName}>{safeRender(user.fullName)}</Text>
            <Text style={styles.userUsername}>@{safeRender(user.username)}</Text>
            <Text style={styles.userEmail}>{safeRender(user.email)}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            isActive && styles.statusBadgeActive,
            isSuspended && styles.statusBadgeSuspended,
            isBanned && styles.statusBadgeBanned
          ]}>
            <Text style={styles.statusText}>
              {safeRender(isBanned ? 'BANNED' : isSuspended ? 'SUSPENDED' : 'ACTIVE')}
            </Text>
          </View>
        </View>

        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <User size={12} color={theme.textSecondary} />
            <Text style={styles.statText}>{safeRender(user.followers?.length || 0)} followers</Text>
          </View>
          <View style={styles.statItem}>
            <MessageSquare size={12} color={theme.textSecondary} />
            <Text style={styles.statText}>{safeRender(user.posts?.length || 0)} posts</Text>
          </View>
          <View style={styles.statItem}>
            <Shield size={12} color={theme.textSecondary} />
            <Text style={styles.statText}>{safeRender(user.type)}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => router.push(`/${user.type}/${user._id}` as any)}
          >
            <Eye size={14} color="#000" />
            <Text style={styles.actionButtonText}>View Profile</Text>
          </TouchableOpacity>

          {isActive && (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.warnButton]}
                onPress={() => showActionDialog(user, 'warn')}
              >
                <AlertTriangle size={14} color="#000" />
                <Text style={styles.actionButtonText}>Warn</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.suspendButton]}
                onPress={() => showActionDialog(user, 'suspend')}
              >
                <Clock size={14} color="#000" />
                <Text style={styles.actionButtonText}>Suspend</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.banButton]}
                onPress={() => showActionDialog(user, 'ban')}
              >
                <Ban size={14} color="#fff" />
                <Text style={[styles.actionButtonText, { color: '#fff' }]}>Ban</Text>
              </TouchableOpacity>
            </>
          )}

          {(isSuspended || isBanned) && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.unbanButton]}
              onPress={() => showActionDialog(user, 'unban')}
            >
              <XCircle size={14} color="#000" />
              <Text style={styles.actionButtonText}>Restore</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderPostCard = ({ item: post }: { item: PostResult }) => {
    // More robust null checking
    if (!post || !post._id || typeof post._id !== 'string') {
      console.warn('Invalid post item:', post);
      return null;
    }

    // Safely extract user data
    const userData = post.user || {};
    const userName = safeRender(userData.username, 'Unknown User');
    const userAvatar = safeRender(userData.avatar, 'https://via.placeholder.com/50');
    const postCaption = safeRender(post.caption, 'No caption');
    const createdDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown date';
    const postLikes = typeof post.likes === 'number' ? post.likes : 0;
    const postComments = typeof post.comments === 'number' ? post.comments : 0;
    const postReports = typeof post.reports === 'number' ? post.reports : 0;
    
    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <Image 
            source={{ uri: userAvatar }} 
            style={styles.avatar} 
          />
          <View style={styles.userInfo}>
            <Text style={styles.userFullName}>{userName}</Text>
            <Text style={styles.userUsername}>{postCaption}</Text>
            <Text style={styles.userEmail}>{createdDate}</Text>
          </View>
          <View style={[styles.statusBadge, styles.statusBadgeActive]}>
            <Text style={styles.statusText}>Post</Text>
          </View>
        </View>

        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <MessageSquare size={12} color={theme.textSecondary} />
            <Text style={styles.statText}>{postLikes} likes</Text>
          </View>
          <View style={styles.statItem}>
            <MessageSquare size={12} color={theme.textSecondary} />
            <Text style={styles.statText}>{postComments} comments</Text>
          </View>
          {postReports > 0 && (
            <View style={styles.statItem}>
              <Flag size={12} color="#ef4444" />
              <Text style={[styles.statText, { color: '#ef4444' }]}>{postReports} reports</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => router.push(`/post/${post._id}` as any)}
          >
            <Eye size={14} color="#000" />
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>
          {post.isHidden ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.unbanButton]}
              onPress={() => handlePostAction(post._id, 'show')}
            >
              <Eye size={14} color="#000" />
              <Text style={styles.actionButtonText}>Show</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.suspendButton]}
              onPress={() => handlePostAction(post._id, 'hide')}
            >
              <XCircle size={14} color="#000" />
              <Text style={styles.actionButtonText}>Hide</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderProductCard = ({ item: product }: { item: ProductResult }) => {
    // More robust null checking
    if (!product || !product._id || typeof product._id !== 'string') {
      console.warn('Invalid product item:', product);
      return null;
    }

    // Safely extract shop data
    const shopData = product.shopId || {};
    const shopName = safeRender(shopData.username, 'Unknown Shop');
    const shopAvatar = safeRender(shopData.avatar, 'https://via.placeholder.com/50');
    const productName = safeRender(product.name, 'Unnamed Product');
    const productPrice = typeof product.price === 'number' ? product.price : 0;
    const createdDate = product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Unknown date';
    const productStock = typeof product.stock === 'number' ? product.stock : 0;
    const productReviews = typeof product.reviews === 'number' ? product.reviews : 0;
    const productReports = typeof product.reports === 'number' ? product.reports : 0;
    
    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <Image 
            source={{ uri: shopAvatar }} 
            style={styles.avatar} 
          />
          <View style={styles.userInfo}>
            <Text style={styles.userFullName}>{productName}</Text>
            <Text style={styles.userUsername}>Shop: {shopName}</Text>
            <Text style={styles.userEmail}>{createdDate}</Text>
          </View>
          <View style={[styles.statusBadge, styles.statusBadgeActive]}>
            <Text style={styles.statusText}>${productPrice}</Text>
          </View>
        </View>

        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <Package size={12} color={theme.textSecondary} />
            <Text style={styles.statText}>{productStock} in stock</Text>
          </View>
          <View style={styles.statItem}>
            <MessageSquare size={12} color={theme.textSecondary} />
            <Text style={styles.statText}>{productReviews} reviews</Text>
          </View>
          {productReports > 0 && (
            <View style={styles.statItem}>
              <Flag size={12} color="#ef4444" />
              <Text style={[styles.statText, { color: '#ef4444' }]}>{productReports} reports</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => router.push(`/product/${product._id}` as any)}
          >
            <Eye size={14} color="#000" />
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>
          {product.isHidden ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.unbanButton]}
              onPress={() => handleProductAction(product._id, 'show')}
            >
              <Eye size={14} color="#000" />
              <Text style={styles.actionButtonText}>Show</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.suspendButton]}
              onPress={() => handleProductAction(product._id, 'hide')}
            >
              <XCircle size={14} color="#000" />
              <Text style={styles.actionButtonText}>Hide</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const handlePostAction = async (postId: string, action: string) => {
    try {
      const endpoint = `${API_URL}/api/admin/posts/${postId}/${action}`;
      console.log('Post action endpoint:', endpoint);
      
      const response = await axios.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        Alert.alert('Success', `Post ${action} completed successfully`);
        handleRefresh();
      } else {
        Alert.alert('Error', response.data.message || `Failed to ${action} post`);
      }
    } catch (error: any) {
      console.error(`Post ${action} error:`, error);
      Alert.alert('Error', `Failed to ${action} post`);
    }
  };

  const handleProductAction = async (productId: string, action: string) => {
    try {
      const endpoint = `${API_URL}/api/admin/products/${productId}/${action}`;
      console.log('Product action endpoint:', endpoint);
      
      const response = await axios.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        Alert.alert('Success', `Product ${action} completed successfully`);
        handleRefresh();
      } else {
        Alert.alert('Error', response.data.message || `Failed to ${action} product`);
      }
    } catch (error: any) {
      console.error(`Product ${action} error:`, error);
      Alert.alert('Error', `Failed to ${action} product`);
    }
  };

  if (user?.type !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Shield size={64} color={theme.textSecondary} />
          <Text style={styles.emptyStateText}>
            Access denied. Admin privileges required.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Monitor</Text>
        
        {/* Content Type Selector */}
        <View style={styles.contentTypeContainer}>
          <TouchableOpacity
            style={[
              styles.contentTypeButton,
              contentType === 'users' && styles.contentTypeButtonActive
            ]}
            onPress={() => setContentType('users')}
            disabled={contentTypeLoading.users}
          >
            <User size={18} color={contentType === 'users' ? '#000' : theme.textSecondary} />
            <Text style={[
              styles.contentTypeText,
              contentType === 'users' && styles.contentTypeTextActive
            ]}>Users</Text>
            {contentTypeLoading.users && (
              <View style={{ marginLeft: 4, width: 12, height: 12, backgroundColor: theme.textSecondary, borderRadius: 6 }} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.contentTypeButton,
              contentType === 'posts' && styles.contentTypeButtonActive
            ]}
            onPress={() => setContentType('posts')}
            disabled={contentTypeLoading.posts}
          >
            <FileText size={18} color={contentType === 'posts' ? '#000' : theme.textSecondary} />
            <Text style={[
              styles.contentTypeText,
              contentType === 'posts' && styles.contentTypeTextActive
            ]}>Posts</Text>
            {contentTypeLoading.posts && (
              <View style={{ marginLeft: 4, width: 12, height: 12, backgroundColor: theme.textSecondary, borderRadius: 6 }} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.contentTypeButton,
              contentType === 'products' && styles.contentTypeButtonActive
            ]}
            onPress={() => setContentType('products')}
            disabled={contentTypeLoading.products}
          >
            <Package size={18} color={contentType === 'products' ? '#000' : theme.textSecondary} />
            <Text style={[
              styles.contentTypeText,
              contentType === 'products' && styles.contentTypeTextActive
            ]}>Products</Text>
            {contentTypeLoading.products && (
              <View style={{ marginLeft: 4, width: 12, height: 12, backgroundColor: theme.textSecondary, borderRadius: 6 }} />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${contentType}...`}
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {getCurrentFilters().map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.filterButtonActive
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[
                styles.filterButtonText,
                activeFilter === filter && styles.filterButtonTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <LoadingView />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {contentType === 'users' && (
            <>
              {searchResults.length === 0 ? (
                <View style={styles.emptyState}>
                  <Search size={64} color={theme.textSecondary} />
                  <Text style={styles.emptyStateText}>
                    {searchQuery.trim() || activeFilter !== 'All' 
                      ? 'No users found matching your criteria'
                      : 'Enter a search term or select a filter to find users'}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item._id}
                  renderItem={renderUserCard}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={handleRefresh}
                      colors={[theme.accent]}
                      tintColor={theme.accent}
                    />
                  }
                  contentContainerStyle={{ paddingVertical: 8 }}
                />
              )}
            </>
          )}

          {contentType === 'posts' && (
            <>
              {postResults.length === 0 ? (
                <View style={styles.emptyState}>
                  <Search size={64} color={theme.textSecondary} />
                  <Text style={styles.emptyStateText}>
                    {searchQuery.trim() || activeFilter !== 'All' 
                      ? 'No posts found matching your criteria'
                      : 'Enter a search term or select a filter to find posts'}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={postResults}
                  keyExtractor={(item) => item._id}
                  renderItem={renderPostCard}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={handleRefresh}
                      colors={[theme.accent]}
                      tintColor={theme.accent}
                    />
                  }
                  contentContainerStyle={{ paddingVertical: 8 }}
                />
              )}
            </>
          )}

          {contentType === 'products' && (
            <>
              {productResults.length === 0 ? (
                <View style={styles.emptyState}>
                  <Search size={64} color={theme.textSecondary} />
                  <Text style={styles.emptyStateText}>
                    {searchQuery.trim() || activeFilter !== 'All' 
                      ? 'No products found matching your criteria'
                      : 'Enter a search term or select a filter to find products'}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={productResults}
                  keyExtractor={(item) => item._id}
                  renderItem={renderProductCard}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={handleRefresh}
                      colors={[theme.accent]}
                      tintColor={theme.accent}
                    />
                  }
                  contentContainerStyle={{ paddingVertical: 8 }}
                />
              )}
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
