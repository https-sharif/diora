import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  Dimensions,
  TextInput,
  Modal,
  Pressable,
  Animated,
  PanResponder, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Share, Star, ShoppingCart, Store, Plus, Minus, Bookmark, X, Flag } from 'lucide-react-native';
import { useShopping } from '@/hooks/useShopping';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types/User';
import { Product } from '@/types/Product';
import { Review } from '@/types/Review';
import { Theme } from '@/types/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import ProductSlashIcon from '@/icon/ProductSlashIcon'
import axios from 'axios';
import { BlurView } from 'expo-blur';
import { API_URL } from '@/constants/api';
import RatingStars from '@/components/RatingStar';
import ReviewInput from '@/components/ReviewInput';
import * as ImagePicker from 'expo-image-picker';
import { format as timeago } from 'timeago.js';
import LoadingView from '@/components/Loading';

const { width, height } = Dimensions.get('window')

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: -59,
      paddingBottom: -34,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    headerButton: {
      padding: 8,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8,
    },
    content: {
      flex: 1,
    },
    imageContainer: {
      width: '100%',
      height: width,
      aspectRatio: 1,
      backgroundColor: theme.background,
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
    mainImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    thumbnailContainer: {
      backgroundColor: theme.card,
    },
    thumbnailContent: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    thumbnailImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
    },
    productInfo: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    productBrand: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      marginBottom: 4,
    },
    productName: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 8,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    originalPrice: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.textSecondary,
      marginBottom: 12,
      textDecorationLine: 'line-through',
    },
    productPrice: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 12,
    },
    ratingContainer: {
      marginBottom: 16,
    },
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    ratingText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    productDescription: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      lineHeight: 24,
    },
    storeSection: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 16,
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
    storeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    storeAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    storeDetails: {
      flex: 1,
      marginLeft: 12,
    },
    storeName: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 4,
    },
    storeStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    storeRating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    storeRatingText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    storeFollowers: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    visitStoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.accent,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 4,
    },
    visitStoreText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: '#000',
    },
    optionSection: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    optionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 12,
    },
    optionButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    optionButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
    },
    optionButtonActive: {
      backgroundColor: theme.accentSecondary,
      borderColor: theme.accentSecondary,
    },
    optionButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    optionButtonTextActive: {
      color: '#000',
    },
    quantitySection: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    quantityButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.accentSecondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityButtonDisabled: {
      opacity: 0.5,
    },
    quantityText: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      minWidth: 30,
      textAlign: 'center',
    },
    reviewsSection: {
      padding: 16,
    },
    reviewItem: {
      marginBottom: 16,
      paddingBottom: 16,
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
    },
    bottomPadding: {
      height: 34,
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.background,
    },
    addToCartButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingVertical: 16,
      gap: 8,
    },
    addToCartButtonDisabled: {
      opacity: 0.5,
    },
    addToCartButtonDisabledText: {
      color: theme.text,
    },
    addToCartText: {
      color: '#000',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
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
    reviewImages: {},
    reviewImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
      marginRight: 8,
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
}

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { addToCart, addToWishlist, isInWishlist } = useShopping();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { token, user } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopProfile, setShopProfile] = useState<User | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [rating, setRating] = useState(0);
  const reviewInputRef = useRef<TextInput>(null);
  const [newReview, setNewReview] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [editingReview, setEditingReview] = useState(false);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [enlargedPost, setEnlargedPost] = useState<string | null>(null);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/product/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if(!response.data.status) {
          Alert.alert('Error', response.data.message);
          return;
        }

        console.log('Product fetched successfully:', response.data.product);

        setProduct(response.data.product);
        setShopProfile(response.data.product.shopId);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/review/product/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status) {
          setReviews(response.data.reviews);
        } else {
          Alert.alert('Error', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    const fetchReviewedStatus = async () => {
      if (!user) return;

      try {
        const response = await axios.get(
          `${API_URL}/api/review/reviewed/${user._id}/product/${productId}`,
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

    fetchProduct();
    fetchReviews();
    fetchReviewedStatus();
  }, [productId]);

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

  useEffect(() => {
    if (product && selectedImageIndex >= product.imageUrl.length) {
      setSelectedImageIndex(0);
    }
  }, [selectedImageIndex]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingView />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.emptyIconContainer}>
            <ProductSlashIcon size={40} />
          </View>
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      Alert.alert('Please select size and color');
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize, selectedColor);
    }
    Alert.alert('Success', `${quantity} item(s) added to cart!`);
  };

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

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity onPress={() => setSelectedImageIndex(index)}>
      <Image source={{ uri: item }} style={styles.thumbnailImage} />
    </TouchableOpacity>
  );

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
        `${API_URL}/api/review/product/${selectedReview._id}`,
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
      const form = new FormData();

      form.append('comment', newReview.trim());
      form.append('rating', String(rating));
      form.append('targetId', product._id);
      form.append('targetType', 'product');

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
        response = await axios.put(
          `${API_URL}/api/review/product/${selectedReview._id}`,
          form,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        response = await axios.post(`${API_URL}/api/review`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
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
      setReviewImages([]);
    } catch (error) {
      console.error('Error submitting review:', error);
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
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 3,
    });

    if (!result.canceled) {
      const selected = result.assets.map((asset) => asset.uri);
      setReviewImages([...reviewImages, ...selected]);
    }
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{product.name}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Share size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => addToWishlist(product)}
          >
            <Bookmark
              size={24}
              color={theme.text}
              fill={isInWishlist(product._id) ? theme.text : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.imageUrl[selectedImageIndex] }}
            style={styles.mainImage}
            resizeMode="contain"
          />
        </View>           


        {/* Image Thumbnails */}
        <FlatList
          data={product.imageUrl}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailContainer}
          contentContainerStyle={styles.thumbnailContent}
        />

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productBrand}>{product.shopId.fullName}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>${(product.discount && product.discount > 0 ? (product.price * (1 - product.discount / 100)).toFixed(2) : product.price)}</Text>
            {product.discount && product.discount > 0 && (
              <Text style={styles.originalPrice}>${product.price}</Text>
            )}
          </View>
          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  color={i < Math.floor(product.rating) ? '#FFD700' : theme.textSecondary}
                  fill={i < Math.floor(product.rating) ? '#FFD700' : 'transparent'}
                />
              ))}
              <Text style={styles.ratingText}>{(product.rating / (product.ratingCount || 1)).toFixed(1)} ({product.ratingCount} reviews)</Text>
            </View>
          </View>

          <Text style={styles.productDescription}>{product.description}</Text>
        </View>

        {/* Store Info */}
        <View style={styles.storeSection}>
          <Text style={styles.sectionTitle}>Store</Text>
          <View style={styles.storeInfo}>
            <Image source={{ uri: shopProfile?.avatar }} style={styles.storeAvatar} />
            <View style={styles.storeDetails}>
              <Text style={styles.storeName}>{shopProfile?.fullName}</Text>
              <View style={styles.storeStats}>
                <View style={styles.storeRating}>
                  <Star size={14} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.storeRatingText}>
                    {(shopProfile?.shop?.ratingCount ?? 0) > 0
                      ? ((shopProfile?.shop?.rating ?? 0) / (shopProfile?.shop?.ratingCount ?? 1)).toFixed(1)
                      : '0.0'}
                  </Text>


                </View>
                <Text style={styles.storeFollowers}>{shopProfile?.followers.length} followers</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.visitStoreButton} onPress={() => router.push(`/shop/${shopProfile?._id}`)}>
              <Store size={16} color="#000" />
              <Text style={styles.visitStoreText}>Visit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Size Selection */}
        <View style={styles.optionSection}>
          <Text style={styles.optionTitle}>Size</Text>
          <View style={styles.optionButtons}>
            {product.sizes.map((size: string) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.optionButton,
                  selectedSize === size && styles.optionButtonActive
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={[
                  styles.optionButtonText,
                  selectedSize === size && styles.optionButtonTextActive
                ]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color Selection */}
        <View style={styles.optionSection}>
          <Text style={styles.optionTitle}>Color</Text>
          <View style={styles.optionButtons}>
            {product.variants.map((color: string) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.optionButton,
                  selectedColor === color && styles.optionButtonActive
                ]}
                onPress={() => setSelectedColor(color)}
              >
                <Text style={[
                  styles.optionButtonText,
                  selectedColor === color && styles.optionButtonTextActive
                ]}>
                  {color}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quantity */}
        <View style={styles.quantitySection}>
          <Text style={styles.optionTitle}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={[styles.quantityButton, (!product.stock || quantity <= 1) && styles.quantityButtonDisabled]}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={!product.stock || quantity <= 1}
            >
              <Minus size={20} color="#000" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity 
              style={[styles.quantityButton, (!product.stock || quantity >= product.stock) && styles.quantityButtonDisabled]}
              onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={!product.stock || quantity >= product.stock}
            >
              <Plus size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
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
                  <TouchableOpacity onPress={pickReviewImages} style={styles.addImageBtn}>
                    <Text style={{ color: '#000' }}>+ Add Images</Text>
                  </TouchableOpacity>

                  <ScrollView horizontal style={{ marginTop: 8 }}>
                    {reviewImages.map((uri, i) => (
                      <Image
                        key={i}
                        source={{ uri }}
                        style={{ width: 80, height: 80, marginRight: 8, borderRadius: 8 }}
                      />
                    ))}
                  </ScrollView>
                </View>
              </>
          )}
          <FlatList
            data={reviews}
            renderItem={renderReview}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.addToCartButton, !product.stock && styles.addToCartButtonDisabled]} onPress={handleAddToCart} disabled={!product.stock}>
          {product.stock ? <ShoppingCart size={20} color="#000" /> : null}
          <Text style={[styles.addToCartText, !product.stock && styles.addToCartButtonDisabledText]}>{!product.stock ? 'Out of Stock' : 'Add to Cart'}</Text>
        </TouchableOpacity>
      </View>

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