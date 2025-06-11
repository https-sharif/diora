import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Heart, Share, Star, ShoppingCart, Store, Plus, Minus } from 'lucide-react-native';
import { useShopping, Product } from '@/contexts/ShoppingContext';

const { width } = Dimensions.get('window');

const mockProductDetails: Record<string, Product & {
  images: string[];
  store: {
    name: string;
    avatar: string;
    rating: number;
    followers: string;
  };
  reviews: Array<{
    id: string;
    user: string;
    avatar: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  rating: number;
  reviewCount: number;
}> = {
  '1': {
    id: '1',
    name: 'Vintage Denim Jacket',
    price: 89.99,
    image: 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=400',
    brand: 'Urban Threads',
    category: 'Tops',
    description: 'Classic vintage-style denim jacket perfect for layering. Made from premium cotton denim with authentic distressing. Features include classic button closure, chest pockets, and adjustable waist tabs. This timeless piece adds effortless cool to any outfit.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Black', 'White'],
    images: [
      'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1457983/pexels-photo-1457983.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    store: {
      name: 'Urban Threads',
      avatar: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.8,
      followers: '12.5K',
    },
    reviews: [
      {
        id: '1',
        user: 'sarah_style',
        avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 5,
        comment: 'Amazing quality! The fit is perfect and the vintage wash looks authentic.',
        date: '2 days ago',
      },
      {
        id: '2',
        user: 'fashion_lover',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 4,
        comment: 'Love this jacket! Goes with everything in my wardrobe.',
        date: '1 week ago',
      },
    ],
    rating: 4.6,
    reviewCount: 127,
  },
  '2': {
    id: '2',
    name: 'Classic White Sneakers',
    price: 69.99,
    image: 'https://images.pexels.com/photos/1040424/pexels-photo-1040424.jpeg?auto=compress&cs=tinysrgb&w=400',
    brand: 'Sneaker Co.',
    category: 'Footwear',
    description: 'Timeless white sneakers made from premium leather. Features include cushioned insole, durable rubber sole, and classic lace-up design. Perfect for everyday wear or dressing up casual outfits.',
    sizes: ['6', '7', '8', '9', '10'],
    colors: ['White', 'Black'],
    images: [
      'https://images.pexels.com/photos/1040424/pexels-photo-1040424.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1457983/pexels-photo-1457983.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    store: {
      name: 'Sneaker Co.',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 4.5,
      followers: '8K',
    },
    reviews: [
      {
        id: '1',
        user: 'john_doe',
        avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 5,
        comment: 'Best sneakers I\'ve ever owned! Super comfortable and stylish.',
        date: '3 days ago',
      },
      {
        id: '2',
        user: 'jane_smith',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 4,
        comment: 'Great quality for the price. Love the minimalist design.',
        date: '1 week ago',
      },
    ],
    rating: 4.7,
    reviewCount: 89,
  },
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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

  const product = mockProductDetails[id || '1'];

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

  const renderReview = ({ item }: { item: typeof product.reviews[0] }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: item.avatar }} style={styles.reviewAvatar} />
        <View style={styles.reviewInfo}>
          <Text style={styles.reviewUser}>{item.user}</Text>
          <View style={styles.reviewRating}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                color={i < item.rating ? '#FFD700' : '#E0E0E0'}
                fill={i < item.rating ? '#FFD700' : 'transparent'}
              />
            ))}
            <Text style={styles.reviewDate}>{item.date}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

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
            source={{ uri: product.images[selectedImageIndex] }} 
            style={styles.mainImage} 
          />
        </View>

        {/* Image Thumbnails */}
        <FlatList
          data={product.images}
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
              <Text style={styles.ratingText}>{product.rating} ({product.reviewCount} reviews)</Text>
            </View>
          </View>

          <Text style={styles.productDescription}>{product.description}</Text>
        </View>

        {/* Store Info */}
        <View style={styles.storeSection}>
          <Text style={styles.sectionTitle}>Store</Text>
          <View style={styles.storeInfo}>
            <Image source={{ uri: product.store.avatar }} style={styles.storeAvatar} />
            <View style={styles.storeDetails}>
              <Text style={styles.storeName}>{product.store.name}</Text>
              <View style={styles.storeStats}>
                <View style={styles.storeRating}>
                  <Star size={14} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.storeRatingText}>{product.store.rating}</Text>
                </View>
                <Text style={styles.storeFollowers}>{product.store.followers} followers</Text>
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
            {product.sizes.map(size => (
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
            {product.colors.map(color => (
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
          <Text style={styles.sectionTitle}>Reviews ({product.reviewCount})</Text>
          <FlatList
            data={product.reviews}
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
  },
  mainImage: {
    width: '100%',
    height: '100%',
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