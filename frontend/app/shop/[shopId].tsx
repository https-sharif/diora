import React, { useState, useEffect, useRef } from 'react';
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
  Linking,
  Animated,
  PanResponder,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  MessageCircle,
  Share,
  MoreHorizontal,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  ShoppingBag,
  X,
  Flag,
  UserPlus,
  UserMinus,
  Bookmark,
  Send,
  ImageIcon,
} from 'lucide-react-native';
import ImageSlashIcon from '@/icon/ImageSlashIcon';
import { useShopping } from '@/hooks/useShopping';
import { useAuth } from '@/hooks/useAuth';
import { ShopProfile } from '@/types/ShopProfile';
import { Product } from '@/types/Product';
import { Review } from '@/types/Review';
import { Post } from '@/types/Post';
import { Theme } from '@/types/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import Color from 'color';
import { BlurView } from 'expo-blur';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import { cancel, format } from 'timeago.js';
import { EmptyState } from '@/components/EmptyState';
import ProductSlashIcon from '@/icon/ProductSlashIcon';
import StarSlashIcon from '@/icon/StarSlashIcon';
import { set } from 'zod';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 360;

const createStyles = (theme: Theme) => {
  const outOfStockOverlay = Color(theme.text).alpha(0.5).toString();
  const bookmarkInactiveColor = Color(theme.text).alpha(0.5).toString();

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
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      padding: 8,
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
    websiteText: {
      color: '#007AFF',
    },
    establishedText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.accent,
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
      backgroundColor: theme.accentSecondary,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: theme.accentSecondary,
    },
    categoryTagText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.background,
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
    contactButton: {
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
    contactButtonText: {
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
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    activeTabText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    productsGrid: {
      backgroundColor: theme.background,
      marginTop: 16,
    },
    productsRow: {
      justifyContent: 'space-between',
      paddingHorizontal: 16,
    },
    productItem: {
      width: '48%',
      backgroundColor: theme.card,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
      shadowColor: theme.text,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
      position: 'relative',
    },
    productImageContainer: {
      position: 'relative',
    },
    productImage: {
      width: '100%',
      height: 160,
    },
    discountBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: theme.error,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      zIndex: 10,
    },
    discountText: {
      color: '#fff',
      fontSize: 12,
      fontFamily: 'Inter-Bold',
    },
    outOfStockOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: outOfStockOverlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    outOfStockText: {
      color: theme.background,
      fontSize: 20,
      fontFamily: 'Inter-Bold',
    },
    wishlistButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: bookmarkInactiveColor,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 8,
      zIndex: 15,
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
    productInfo: {
      padding: 12,
    },
    productName: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 4,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    productPrice: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    originalPrice: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      textDecorationLine: 'line-through',
    },
    discountPrice: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    productCategory: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    ratingRow: {
      flexDirection: 'row',
      gap: 4,
      position: 'absolute',
      bottom: 16,
      right: 16,
    },
    ratingText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    reviewsBox: {
      padding: 16,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    reviewHeading: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      padding: 8,
    },
    reviewInputContainer: {
      flexDirection: 'row',
      padding: 8,
      backgroundColor: theme.background,
    },
    reviewInput: {
      flex: 1,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.textSecondary,
      borderRadius: 8,
      backgroundColor: theme.card,
      marginBottom: 16,
      color: theme.text,
    },
    reviewItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    reviewAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    reviewInfo: {
      marginLeft: 12,
    },
    reviewUser: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 2,
    },
    reviewRating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    reviewDate: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    reviewComment: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      lineHeight: 20,
      marginBottom: 8,
    },
    reviewImages: {},
    reviewImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
      marginRight: 8,
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
    enlargedContainer: {
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',

      justifyContent: 'center',
      alignItems: 'center',
    },
    enlargedBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    enlargedContent: {
      width: width * 0.9,
      maxHeight: height * 0.8,
      backgroundColor: 'rgba(55, 55, 55, 0.8)',
      borderRadius: 20,
      overflow: 'hidden',
    },
    enlargedImage: {
      width: '100%',
      height: width * 0.9,
      resizeMode: 'contain',
    },
  });
};

export default function ShopProfileScreen() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { addToWishlist, isInWishlist } = useShopping();

  const [shopProfile, setShopProfile] = useState<ShopProfile | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'posts' | 'products' | 'reviews'>('posts');
  const [loading, setLoading] = useState(true);
  const { user, followUser, token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [enlargedPost, setEnlargedPost] = useState<string | null>(null);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [newReview, setNewReview] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [rating, setRating] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [editingReview, setEditingReview] = useState(false);
  const reviewInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const fetchShopProfile = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${API_URL}/api/shop/${shopId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === false) {
          setShopProfile(null);
          return;
        }
        const shop = response.data.shop;

        setShopProfile(shop);

        if (user) {
          setIsFollowing(user.following.includes(shop._id));
        }
      } catch (error) {
        console.error('Error fetching shop profile:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/review/shop/${shopId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.status === false) {
          setReviews([]);
          return;
        }

        setReviews(response.data.reviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/post/shop/${shopId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === false) {
          return;
        }

        setPosts(response.data.posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    const fetchReviewedStatus = async () => {
      if (!user) return;

      try {
        const response = await axios.get(
          `${API_URL}/api/review/reviewed/${user._id}/shop/${shopId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.status === false) {
          setHasReviewed(false);
          return;
        }

        setHasReviewed(response.data.reviewed);
      } catch (error) {
        console.error('Error fetching reviewed status:', error);
      }
    };

    fetchShopProfile();
    fetchReviews();
    fetchPosts();
    fetchReviewedStatus();
  }, [shopId]);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 20;
    },
    onPanResponderMove: (evt, gestureState) => {
      const progress = Math.min(Math.abs(gestureState.dy) / 200, 1);
      scaleAnim.setValue(1 - progress * 0.2);
      opacityAnim.setValue(1 - progress);
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (Math.abs(gestureState.dy) > 100) {
        handleCloseEnlarged();
      } else {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },
  });

  const handleReviewImage = (image: string) => {
    setEnlargedPost(image);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseEnlarged = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.8,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setEnlargedPost(null);
      scaleAnim.setValue(1);
    });
  };

  const toggleFollow = () => {
    if (!shopProfile || !user) return;
    followUser(shopProfile._id, 'shop');
    setIsFollowing(!isFollowing);
  };

  const cancelEditReview = () => {
    if (!selectedReview) return;
    setEditingReview(false);
    setNewReview('');
    setRating(0);
    setReviews([selectedReview, ...reviews]);
    setHasReviewed(true);
    setSelectedReview(null);
  };

  const handleEditReview = () => {
    if (!selectedReview) return;
    setShowReviewModal(false);
    setEditingReview(true);
    setNewReview(selectedReview.comment || '');
    setRating(selectedReview.rating);
    setReviews(reviews.filter((review) => review._id !== selectedReview._id));
    setHasReviewed(false);
    reviewInputRef.current?.focus();
  };

  const handleDeleteReview = async () => {
    if (!selectedReview || !user) return;
    try {
      const response = await axios.delete(
        `${API_URL}/api/review/shop/${selectedReview._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === false) {
        Alert.alert('Error', response.data.message);
        return;
      }
      setReviews(reviews.filter((review) => review._id !== selectedReview._id));
      setSelectedReview(null);
      setShowReviewModal(false);
      setHasReviewed(false);

      Alert.alert(
        'Review Deleted',
        'Your review has been deleted successfully.'
      );
    } catch (error) {
      console.error('Error deleting review:', error);
      Alert.alert('Error', 'Failed to delete review. Please try again later.');
    }
  };

  const handleSubmitReview = async () => {
    if (!shopProfile || !user) return;
    if (rating === 0) return;

    try {
      let response;
      if (editingReview) {
        response = await axios.put(
          `${API_URL}/api/review/shop/${selectedReview?._id}`,
          {
            comment: newReview.trim(),
            rating,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axios.post(
          `${API_URL}/api/review`,
          {
            targetId: shopProfile._id,
            targetType: 'shop',
            comment: newReview.trim(),
            rating,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      if (response.data.status === false) {
        Alert.alert('Error', response.data.message);
        return;
      }

      const review = response.data.review;

      
      setReviews([...reviews, review]);
      setEditingReview(false);
      setSelectedReview(null);
      setNewReview('');
      setRating(0);
      setHasReviewed(true);
    } catch (error) {
      console.error('Error submitting review:', error);
      return;
    }
  };

  const handleContact = () => {
    if (!shopProfile) return;
    router.push(`/message/${shopProfile.userId}`);
  };

  const handleShare = () => {
    Alert.alert('Share Shop', `Share ${shopProfile?.name}'s shop`);
  };

  const handleReport = () => {
    Alert.alert('Report Shop', 'Are you sure you want to report this shop?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Reported',
            'Shop has been reported. Thank you for keeping our community safe.'
          );
          setShowMoreMenu(false);
        },
      },
    ]);
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handlePostPress = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => handleProductPress(item._id)}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.imageUrl[0] }} style={styles.productImage} />
        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discount}%</Text>
          </View>
        )}
        {item.stock == 0 && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={styles.wishlistButton}
        onPress={() => {
          if (!shopProfile) return;
          addToWishlist({ ...item });
        }}
      >
        <Bookmark
          size={16}
          color={theme.background}
          fill={isInWishlist(item._id) ? theme.background : 'transparent'}
        />
      </TouchableOpacity>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.priceContainer}>
          {item.discount ? (
            <>
              <Text style={styles.discountPrice}>
                ${(item.price * (1 - item.discount / 100)).toFixed(2)}
              </Text>
              <Text style={styles.originalPrice}>${item.price}</Text>
            </>
          ) : (
            <Text style={styles.productPrice}>${item.price}</Text>
          )}
        </View>
        <Text style={styles.productCategory}>{item.category}</Text>
      </View>
      <View style={styles.ratingRow}>
        <Star size={12} color="#FFD700" fill="#FFD700" />
        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderReview = ({ item }: { item: Review }) => {
    return (
      <Pressable
        style={styles.reviewItem}
        onLongPress={() => {
          if (!user || user._id !== item.user._id) return;
          setSelectedReview(item);
          setShowReviewModal(true);
        }}
      >
        <View style={styles.reviewHeader}>
          <TouchableOpacity
            onPress={() => router.push(`/user/${item.user._id}`)}
          >
            <Image
              source={{ uri: item.user.avatar }}
              style={styles.reviewAvatar}
            />
          </TouchableOpacity>
          <View style={styles.reviewInfo}>
            <TouchableOpacity
              onPress={() => router.push(`/user/${item.user._id}`)}
            >
              <Text style={styles.reviewUser}>{item.user.username}</Text>
            </TouchableOpacity>
            <View style={styles.reviewRating}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  color={i < item.rating ? '#FFD700' : theme.textSecondary}
                  fill={i < item.rating ? '#FFD700' : 'transparent'}
                />
              ))}
              <Text style={styles.reviewDate}>
                {format(new Date(item.updatedAt))}
              </Text>
            </View>
          </View>
        </View>
        {item.comment && (
          <Text style={styles.reviewComment}>{item.comment}</Text>
        )}
        {item.images && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.reviewImages}
          >
            {item.images.map((image: string, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleReviewImage(image)}
              >
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.reviewImage}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </Pressable>
    );
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

  const renderTabContent = () => {
    if (!shopProfile) return null;

    switch (selectedTab) {
      case 'products':
        return shopProfile.productIds.length > 0 ? (
          <FlatList
            data={shopProfile.productIds}
            renderItem={({ item }) => renderProduct({ item })}
            keyExtractor={(item) => item._id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.productsRow}
            contentContainerStyle={styles.productsGrid}
          />
        ) : (
          <EmptyState
            text="No products available"
            icon={<ProductSlashIcon size={40} />}
          />
        );

      case 'reviews':
        return (
          <View style={styles.reviewsBox}>
            {!hasReviewed && (
              <>
                <Text style={styles.reviewHeading}>Leave a review</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                    >
                      <Star
                        size={24}
                        color={star <= rating ? '#FFD700' : theme.textSecondary}
                        fill={star <= rating ? '#FFD700' : 'none'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.reviewInputContainer}>
                  <TextInput
                    ref={reviewInputRef}
                    placeholder="Write a review..."
                    value={newReview}
                    onChangeText={setNewReview}
                    style={styles.reviewInput}
                    placeholderTextColor={theme.textSecondary}
                    multiline={true}
                    numberOfLines={3}
                  />
                  <>
                    <TouchableOpacity
                      onPress={handleSubmitReview}
                      style={styles.headerButton}
                    >
                      <Send size={24} color={theme.text} />
                    </TouchableOpacity>
                    {editingReview && (
                      <TouchableOpacity
                        onPress={cancelEditReview}
                        style={styles.headerButton}
                      >
                        <X size={24} color={theme.error} />
                      </TouchableOpacity>
                    )}
                  </>
                </View>
              </>
            )}

            {reviews.length > 0 ? (
              <FlatList
                data={reviews}
                renderItem={renderReview}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
              />
            ) : (
              <EmptyState
                text="No reviews yet"
                icon={<StarSlashIcon size={40} />}
              />
            )}
          </View>
        );

      case 'posts':
        return posts.length > 0 ? (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item._id}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.postsRow}
            contentContainerStyle={styles.postsGrid}
          />
        ) : (
          <EmptyState text="No posts yet" icon={<ImageSlashIcon size={40} />} />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading shop...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!shopProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shop</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Shop not found</Text>
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
        <Text style={styles.headerTitle}>{shopProfile.username}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowMoreMenu(true)}
          >
            <MoreHorizontal size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Cover Image */}
          <Image
            source={{ uri: shopProfile.coverImageUrl }}
            style={styles.coverImage}
          />

          {/* Shop Info */}
          <View style={styles.shopSection}>
            <View style={styles.shopHeader}>
              <Image
                source={{ uri: shopProfile.logoUrl }}
                style={styles.shopAvatar}
              />
              <View style={styles.shopStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {shopProfile.productIds.length}
                  </Text>
                  <Text style={styles.statLabel}>Products</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{shopProfile.followers}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={styles.ratingContainer}>
                    <Star size={16} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.statNumber}>
                      {(shopProfile.ratingCount > 0
                        ? shopProfile.rating / shopProfile.ratingCount
                        : 0.0
                      ).toFixed(1)}
                    </Text>
                  </View>
                  <Text style={styles.statLabel}>{reviews.length} reviews</Text>
                </View>
              </View>
            </View>

            <View style={styles.shopInfo}>
              <View style={styles.nameContainer}>
                <Text style={styles.shopName}>{shopProfile.name}</Text>
                {shopProfile.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.shopDescription}>
                {shopProfile.description}
              </Text>

              {/* Contact Info */}
              <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                  <MapPin size={16} color={theme.textSecondary} />
                  <Text style={styles.contactText}>{shopProfile.location}</Text>
                </View>
                {shopProfile.contactPhone && (
                  <View style={styles.contactItem}>
                    <Phone size={16} color={theme.textSecondary} />
                    <Text style={styles.contactText}>
                      {shopProfile.contactPhone}
                    </Text>
                  </View>
                )}
                {shopProfile.contactEmail && (
                  <View style={styles.contactItem}>
                    <Mail size={16} color={theme.textSecondary} />
                    <Text style={styles.contactText}>
                      {shopProfile.contactEmail}
                    </Text>
                  </View>
                )}
                {shopProfile.website && (
                  <TouchableOpacity
                    style={styles.contactItem}
                    onPress={() => Linking.openURL(shopProfile.website!)}
                  >
                    <Globe size={16} color="#007AFF" />
                    <Text style={[styles.contactText, styles.websiteText]}>
                      {shopProfile.website}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.establishedText}>
                Established {shopProfile.createdAt}
              </Text>
            </View>

            {/* Categories */}
            <View style={styles.categories}>
              <Text style={styles.categoriesTitle}>Categories</Text>
              <View style={styles.categoryTags}>
                {shopProfile.categories.map((category, index) => (
                  <View key={index} style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{category}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  isFollowing && styles.followingButton,
                ]}
                onPress={toggleFollow}
              >
                {isFollowing ? (
                  <UserMinus size={16} color={theme.text} />
                ) : (
                  <UserPlus size={16} color={theme.background} />
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
                style={styles.contactButton}
                onPress={handleContact}
              >
                <MessageCircle size={16} color="#000" />
                <Text style={styles.contactButtonText}>Contact</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tabs Section */}
          <View style={styles.tabsSection}>
            {/* Posts */}
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'posts' && styles.activeTab]}
              onPress={() => setSelectedTab('posts')}
            >
              <ImageIcon
                size={20}
                color={
                  selectedTab === 'posts' ? theme.text : theme.textSecondary
                }
              />
              {!isSmallScreen && (
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === 'posts' && styles.activeTabText,
                  ]}
                >
                  Posts ({posts.length})
                </Text>
              )}
            </TouchableOpacity>

            {/* Products */}
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'products' && styles.activeTab,
              ]}
              onPress={() => setSelectedTab('products')}
            >
              <ShoppingBag
                size={20}
                color={
                  selectedTab === 'products' ? theme.text : theme.textSecondary
                }
              />
              {!isSmallScreen && (
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === 'products' && styles.activeTabText,
                  ]}
                >
                  Products ({shopProfile.productIds.length})
                </Text>
              )}
            </TouchableOpacity>

            {/* Reviews */}
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'reviews' && styles.activeTab,
              ]}
              onPress={() => setSelectedTab('reviews')}
            >
              <Star
                size={20}
                color={
                  selectedTab === 'reviews' ? theme.text : theme.textSecondary
                }
              />
              {!isSmallScreen && (
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === 'reviews' && styles.activeTabText,
                  ]}
                >
                  Reviews ({reviews.length})
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {renderTabContent()}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* More Menu Modal */}
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

            <TouchableOpacity style={styles.moreMenuItem} onPress={handleShare}>
              <Share size={20} color={theme.text} />
              <Text style={styles.moreMenuItemText}>Share Shop</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={handleReport}
            >
              <Flag size={20} color={theme.error} />
              <Text style={[styles.moreMenuItemText, { color: theme.error }]}>
                Report Shop
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {enlargedPost && (
        <Modal
          visible={!!enlargedPost}
          transparent
          animationType="none"
          onRequestClose={handleCloseEnlarged}
        >
          <Animated.View
            style={[styles.enlargedContainer, { opacity: opacityAnim }]}
            {...panResponder.panHandlers}
          >
            <BlurView
              intensity={10}
              tint={theme.mode === 'dark' ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
            <TouchableOpacity
              style={styles.enlargedBackdrop}
              onPress={handleCloseEnlarged}
              activeOpacity={1}
            />

            <Animated.View
              style={[
                styles.enlargedContent,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <Image
                source={{ uri: enlargedPost }}
                style={styles.enlargedImage}
              />
            </Animated.View>
          </Animated.View>
        </Modal>
      )}

      <Modal
        visible={showReviewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReviewModal(false)}
        >
          <View style={styles.moreMenu}>
            <View style={styles.moreMenuHeader}>
              <Text style={styles.moreMenuTitle}>Manage Review</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={handleEditReview}
            >
              <Share size={20} color={theme.text} />
              <Text style={styles.moreMenuItemText}>Edit Review</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={handleDeleteReview}
            >
              <Flag size={20} color={theme.error} />
              <Text style={[styles.moreMenuItemText, { color: theme.error }]}>
                Delete Review
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
