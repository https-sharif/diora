import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Heart, Share, Star, ShoppingCart, Store, Plus, Minus } from 'lucide-react-native';
import { useShopping } from '@/contexts/ShoppingContext';
import { mockProducts } from '@/mock/Product';
import { mockReviews } from '@/mock/Review';
import { mockUsers } from '@/mock/User';
import { mockShops } from '@/mock/Shop';
import { ShopProfile } from '@/types/ShopProfile';
import { Review } from '@/types/Review';

const { width } = Dimensions.get('window')

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { 
    addToCart, 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist 
  } = useShopping();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<ShopProfile | null>(null);

  const product = mockProducts.find(product => product.id === productId);

  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setSelectedSize(product.sizes[0]);
      setSelectedColor(product.colors[0]);
      setReviews(mockReviews.filter(review => review.targetId === productId && review.targetType === 'product'));
      const shop = mockShops.find(shop => shop.id === product.storeId);
      setStore(shop || null);
      setLoading(false);
    }
  }, [product]);

  useEffect(() => {
    if (product && selectedImageIndex >= product.imageUrl.length) {
      setSelectedImageIndex(0);
    }
  }, [selectedImageIndex]);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
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

  const toggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity onPress={() => setSelectedImageIndex(index)}>
      <Image source={{ uri: item }} style={styles.thumbnailImage} />
    </TouchableOpacity>
  );

  const renderReview = ({ item }: { item: Review }) => {
    const user = mockUsers.find(user => user.id === item.userId);
    return (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: user?.avatar }} style={styles.reviewAvatar} />
        <View style={styles.reviewInfo}>
          <Text style={styles.reviewUser}>{user?.username}</Text>
          <View style={styles.reviewRating}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                color={i < item.rating ? '#FFD700' : '#E0E0E0'}
                fill={i < item.rating ? '#FFD700' : 'transparent'}
              />
            ))}
            <Text style={styles.reviewDate}>{item.createdAt}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Share size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={toggleWishlist}
          >
            <Heart
              size={24}
              color={isInWishlist(product.id) ? '#FF6B6B' : '#000'}
              fill={isInWishlist(product.id) ? '#FF6B6B' : 'transparent'}
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
          <Text style={styles.productBrand}>{product.brand}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>${product.price}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  color={i < Math.floor(product.rating) ? '#FFD700' : '#E0E0E0'}
                  fill={i < Math.floor(product.rating) ? '#FFD700' : 'transparent'}
                />
              ))}
              <Text style={styles.ratingText}>{product.rating} ({reviews.length} reviews)</Text>
            </View>
          </View>

          <Text style={styles.productDescription}>{product.description}</Text>
        </View>

        {/* Store Info */}
        <View style={styles.storeSection}>
          <Text style={styles.sectionTitle}>Store</Text>
          <View style={styles.storeInfo}>
            <Image source={{ uri: store?.logoUrl }} style={styles.storeAvatar} />
            <View style={styles.storeDetails}>
              <Text style={styles.storeName}>{store?.name}</Text>
              <View style={styles.storeStats}>
                <View style={styles.storeRating}>
                  <Star size={14} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.storeRatingText}>{store?.rating}</Text>
                </View>
                <Text style={styles.storeFollowers}>{store?.followers.length} followers</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.visitStoreButton}>
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
            {product.colors.map((color: string) => (
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
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus size={20} color="#666" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Plus size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
          <FlatList
            data={reviews}
            renderItem={renderReview}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <ShoppingCart size={20} color="#fff" />
          <Text style={styles.addToCartText}>Add to Cart - ${(product.price * quantity).toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    borderBottomColor: '#e9ecef',
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
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  thumbnailContainer: {
    backgroundColor: '#f8f9fa',
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
    borderBottomColor: '#f8f9fa',
  },
  productBrand: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 4,
  },
  productName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#000',
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
    color: '#666',
  },
  productDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 24,
  },
  storeSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginBottom: 16,
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
    color: '#000',
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
    color: '#666',
  },
  storeFollowers: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  visitStoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
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
    borderBottomColor: '#f8f9fa',
  },
  optionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
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
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  optionButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  optionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  optionButtonTextActive: {
    color: '#fff',
  },
  quantitySection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
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
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
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
    borderBottomColor: '#f8f9fa',
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
    color: '#000',
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
    color: '#999',
  },
  reviewComment: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 34,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
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
});