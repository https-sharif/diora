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
  Keyboard,
  TouchableWithoutFeedback,
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
  ImageIcon,
  Check,
} from 'lucide-react-native';
import ImageSlashIcon from '@/icon/ImageSlashIcon';
import { useShopping } from '@/hooks/useShopping';
import { useAuth } from '@/hooks/useAuth';
import { useMessage } from '@/hooks/useMessage';
import { Product } from '@/types/Product';
import { Review } from '@/types/Review';
import { User } from '@/types/User';
import { Post } from '@/types/Post';
import { Theme } from '@/types/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import { userService, reviewService, postService, messageService, searchService, reportService } from '@/services';
import Color from 'color';
import { BlurView } from 'expo-blur';
import { format as timeago } from 'timeago.js';
import { format } from 'date-fns';
import { EmptyState } from '@/components/EmptyState';
import ProductSlashIcon from '@/icon/ProductSlashIcon';
import StarSlashIcon from '@/icon/StarSlashIcon';
import RatingStars from '@/components/RatingStar';
import ReviewInput from '@/components/ReviewInput';
import * as ImagePicker from 'expo-image-picker';

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
      backgroundColor: theme.card,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: theme.accentSecondary,
    },
    categoryTagText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
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
    addImageBtn: {
      backgroundColor: theme.accent,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start',
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
    userNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    verifiedBadgeContainer: {
      width: 12,
      height: 12,
      borderRadius: 8,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
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
    reportModal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    reportContainer: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      width: '100%',
      maxWidth: 400,
    },
    reportHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    reportTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    reportSubtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      marginBottom: 16,
    },
    reportOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 8,
    },
    reportOptionSelected: {
      borderColor: theme.text,
      backgroundColor: theme.background,
    },
    reportOptionText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    reportInput: {
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
    reportButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
    },
    reportButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    reportButtonCancel: {
      borderWidth: 1,
    },
    reportButtonSubmit: {},
    reportButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
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

export default function ShopProfileScreen() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { addToWishlist, isInWishlist } = useShopping();
  const { conversations } = useMessage();

  const [shopProfile, setShopProfile] = useState<User | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedTab, setSelectedTab] = useState<
    'posts' | 'products' | 'reviews'
  >('posts');
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
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchedUsers, setSearchedUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchShopProfile = async () => {
      try {
        if (!token || !shopId) return;
        setLoading(true);
        const response = await userService.getUserById(shopId, token);

        if (response.status === false) {
          router.back();
          return;
        }
        const shop = response.user;

        setShopProfile(shop);

        if (user) {
          setIsFollowing(user.following.includes(shop._id));
        }
      } catch {
        router.back();
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        if (!token || !shopId) return;
        const response = await reviewService.getShopReviews(shopId, token);

        if (response.status === false) {
          setReviews([]);
          return;
        }

        setReviews(response.reviews);
      } catch {}
    };

    const fetchPosts = async () => {
      try {
        if (!token || !shopId) return;
        const response = await postService.getUserPosts(shopId, token);

        if (response.status === false) {
          return;
        }

        setPosts(response);
      } catch {}
    };

    const fetchReviewedStatus = async () => {
      if (!user || !token || !shopId) return;

      try {
        const reviewed = await reviewService.hasUserReviewedShop(user._id, shopId, token);
        setHasReviewed(reviewed);
      } catch {}
    };

    fetchShopProfile();
    fetchReviews();
    fetchPosts();
    fetchReviewedStatus();
  }, [shopId, user, token]);

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
    if (!selectedReview || !user || !token) return;
    try {
      await reviewService.deleteReview(selectedReview._id, token);

      setReviews(reviews.filter((review) => review._id !== selectedReview._id));
      setSelectedReview(null);
      setShowReviewModal(false);
      setHasReviewed(false);

      Alert.alert(
        'Review Deleted',
        'Your review has been deleted successfully.'
      );
    } catch {
      Alert.alert('Error', 'Failed to delete review. Please try again later.');
    }
  };

  const handleSubmitReview = async () => {
    if (!shopProfile || !user || !token) return;
    if (rating === 0) return;

    try {
      const form = new FormData();

      form.append('comment', newReview.trim());
      form.append('rating', String(rating));
      form.append('targetId', shopProfile._id);
      form.append('targetType', 'shop');

      reviewImages.forEach((uri, index) => {
        const filename = uri.split('/').pop() || `review_${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        form.append('images', {
          uri,
          name: filename,
          type,
        } as any);
      });

      let response;
      if (editingReview && selectedReview) {
        response = await reviewService.updateReview(selectedReview._id, form, token);
      } else {
        response = await reviewService.createReview(form, token);
      }

      if (response.status === false) {
        Alert.alert('Error', response.message);
        return;
      }

      const review = response.review;

      setReviews([...reviews, review]);
      setEditingReview(false);
      setSelectedReview(null);
      setNewReview('');
      setRating(0);
      setHasReviewed(true);
      setReviewImages([]);
    } catch {
      Alert.alert('Error', 'Failed to submit review. Try again.');
    }
  };

  const pickReviewImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission denied!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 3,
    });

    if (!result.canceled) {
      const selected = result.assets.map((asset) => asset.uri);
      setReviewImages([...reviewImages, ...selected]);
    }
  };

  const handleContact = () => {
    if (!shopProfile || !user) return;

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
        participantIds.includes(shopProfile._id)
      );
    });

    if (existingConversation) {
      router.push(`/message/${existingConversation._id}`);
    } else {
      router.push(`/message/${shopProfile._id}`);
    }
  };

  const handleShare = async () => {
    if (!shopProfile || !token) return;

    setShowShareModal(false);
    await Promise.all(
      selectedUsers.map(async (user) => {
        const conversation = await messageService.getConversationId(
          user._id,
          token
        );
        await messageService.sendMessage(
          conversation.conversationId,
          `Check out ${shopProfile?.fullName}'s shop`,
          'profile',
          token,
          undefined,
          undefined,
          shopProfile._id,
          undefined,
          undefined
        );
      })
    );
  };

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

  const handleReport = async () => {
    if (!reportReason.trim() || !user || !shopProfile || !token) return;

    const reasonMap: { [key: string]: string } = {
      Spam: 'spam',
      'Inappropriate Content': 'inappropriate_content',
      Fraud: 'fraud',
      'Copyright Violation': 'copyright_violation',
      'Fake Business': 'fraud',
      Other: 'other',
    };

    try {
      const payload = {
        targetType: 'user' as const,
        targetId: shopProfile._id,
        reason: reasonMap[reportReason] || 'other',
        description: reportDescription.trim() || 'No additional details provided',
      };

      const response = await reportService.createReport(payload, token);

      if (response.status) {
        setShowReportModal(false);
        setShowMoreMenu(false);
        setReportReason('');
        setReportDescription('');
        Alert.alert(
          'Report Submitted',
          'Thank you for reporting this shop. We will review it shortly.'
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  };

  const getReportReasons = () => {
    return [
      'Spam',
      'Inappropriate Content',
      'Fraud',
      'Copyright Violation',
      'Fake Business',
      'Other',
    ];
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
        {item.stock === 0 && (
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
        <Text style={styles.ratingText}>
          {(item.rating / (item.reviewCount || 1)).toFixed(1)}
        </Text>
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
            onPress={() =>
              router.push(`/${item.user.type}/${item.user._id}` as any)
            }
          >
            <Image
              source={{ uri: item.user.avatar }}
              style={styles.reviewAvatar}
            />
          </TouchableOpacity>
          <View style={styles.reviewInfo}>
            <TouchableOpacity
              onPress={() =>
                router.push(`/${item.user.type}/${item.user._id}` as any)
              }
            >
              <View style={styles.userNameRow}>
                <Text style={styles.reviewUser}>{item.user.username}</Text>
                {item.user.isVerified && (
                  <View style={styles.verifiedBadgeContainer}>
                    <Check size={8} strokeWidth={4} color="white" />
                  </View>
                )}
              </View>
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
                {timeago(new Date(item.createdAt))}
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
    if (!shopProfile || shopProfile.type !== 'shop' || !shopProfile.shop)
      return null;

    switch (selectedTab) {
      case 'products':
        return shopProfile.shop.productIds.length > 0 ? (
          <FlatList
            key={'products'}
            data={shopProfile.shop.productIds}
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
                <RatingStars rating={rating} onPress={setRating} />
                <ReviewInput
                  reviewInputRef={reviewInputRef}
                  value={newReview}
                  onChangeText={setNewReview}
                  onSend={handleSubmitReview}
                  onCancel={cancelEditReview}
                  isEditing={!!editingReview}
                />
                <View style={{ marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={pickReviewImages}
                    style={styles.addImageBtn}
                  >
                    <Text style={{ color: '#000' }}>+ Add Images</Text>
                  </TouchableOpacity>

                  <ScrollView horizontal style={{ marginTop: 8 }}>
                    {reviewImages.map((uri, i) => (
                      <Image
                        key={i}
                        source={{ uri }}
                        style={{
                          width: 80,
                          height: 80,
                          marginRight: 8,
                          borderRadius: 8,
                        }}
                      />
                    ))}
                  </ScrollView>
                </View>
              </>
            )}

            {reviews.length > 0 ? (
              <FlatList
                key={'reviews'}
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
            key={'posts'}
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

  if (!shopProfile || !shopProfile.shop) {
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
          <Image
            source={{ uri: shopProfile.shop.coverImageUrl }}
            style={styles.coverImage}
          />

          <View style={styles.shopSection}>
            <View style={styles.shopHeader}>
              <Image
                source={{ uri: shopProfile.avatar }}
                style={styles.shopAvatar}
              />
              <View style={styles.shopStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {shopProfile.shop.productIds.length}
                  </Text>
                  <Text style={styles.statLabel}>Products</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {shopProfile.followers.length}
                  </Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={styles.ratingContainer}>
                    <Star size={16} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.statNumber}>
                      {(shopProfile.shop.reviewCount > 0
                        ? shopProfile.shop.rating / shopProfile.shop.reviewCount
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
                <Text style={styles.shopName}>{shopProfile.fullName}</Text>
                {shopProfile.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.shopUsername}>@{shopProfile.username}</Text>

              {shopProfile.bio && (
                <Text style={styles.shopDescription}>{shopProfile.bio}</Text>
              )}

              <View style={styles.contactInfo}>
                {shopProfile.shop.location && (
                  <View style={styles.contactItem}>
                    <MapPin size={16} color={theme.textSecondary} />
                    <Text style={styles.contactText}>
                      {shopProfile.shop.location}
                    </Text>
                  </View>
                )}
                {shopProfile.shop.contactPhone && (
                  <View style={styles.contactItem}>
                    <Phone size={16} color={theme.textSecondary} />
                    <Text style={styles.contactText}>
                      {shopProfile.shop.contactPhone}
                    </Text>
                  </View>
                )}
                {shopProfile.shop.contactEmail && (
                  <View style={styles.contactItem}>
                    <Mail size={16} color={theme.textSecondary} />
                    <Text style={styles.contactText}>
                      {shopProfile.shop.contactEmail}
                    </Text>
                  </View>
                )}
                {shopProfile.shop.website && (
                  <TouchableOpacity
                    style={styles.contactItem}
                    onPress={() => {
                      const url = shopProfile?.shop?.website;
                      if (url?.trim()) {
                        Linking.openURL(url);
                      } else {
                        Alert.alert(
                          'Invalid URL',
                          'This shop does not have a valid website.'
                        );
                      }
                    }}
                  >
                    <Globe size={16} color="#007AFF" />
                    <Text style={[styles.contactText, styles.websiteText]}>
                      {shopProfile.shop.website}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {shopProfile.createdAt ? (
                <Text style={styles.establishedText}>
                  Established{' '}
                  {format(new Date(shopProfile.createdAt), 'MMMM yyyy')}
                </Text>
              ) : null}
            </View>

            <View style={styles.categories}>
              <Text style={styles.categoriesTitle}>Categories</Text>
              <View style={styles.categoryTags}>
                {(shopProfile.shop.categories || []).map((category, index) => (
                  <View key={index} style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{category}</Text>
                  </View>
                ))}
              </View>
            </View>

            {user && user._id !== shopProfile._id && (
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
            )}
          </View>

          <View style={styles.tabsSection}>
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
                  Products ({shopProfile.shop.productIds.length})
                </Text>
              )}
            </TouchableOpacity>

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
              <Text style={styles.moreMenuItemText}>Share Shop</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => {
                setShowMoreMenu(false);
                setShowReportModal(true);
              }}
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

      <Modal
        visible={showReportModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowReportModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.reportModal}>
            <View style={styles.reportContainer}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>Report User</Text>
                <TouchableOpacity onPress={() => setShowReportModal(false)}>
                  <X size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              <Text
                style={[styles.reportSubtitle, { color: theme.textSecondary }]}
              >
                Why are you reporting this user?
              </Text>

              {getReportReasons().map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reportOption,
                    reportReason === reason && styles.reportOptionSelected,
                  ]}
                  onPress={() => setReportReason(reason)}
                >
                  <Text
                    style={[styles.reportOptionText, { color: theme.text }]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}

              <TextInput
                style={[
                  styles.reportInput,
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

              <View style={styles.reportButtons}>
                <TouchableOpacity
                  style={[
                    styles.reportButton,
                    styles.reportButtonCancel,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => setShowReportModal(false)}
                >
                  <Text
                    style={[styles.reportButtonText, { color: theme.text }]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.reportButton,
                    styles.reportButtonSubmit,
                    {
                      backgroundColor: theme.error,
                    },
                  ]}
                  onPress={handleReport}
                  disabled={!reportReason.trim()}
                >
                  <Text style={[styles.reportButtonText, { color: '#000' }]}>
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
