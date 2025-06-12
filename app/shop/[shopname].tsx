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
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  ShoppingBag,
  X,
  Flag,
  UserPlus,
  UserMinus
} from 'lucide-react-native';
import { Product, useShopping } from '@/contexts/ShoppingContext';

const { width } = Dimensions.get('window');

interface ShopProfile {
  id: string;
  shopname: string;
  displayName: string;
  avatar: string;
  coverImage: string;
  description: string;
  followers: number;
  products: number;
  rating: number;
  reviewCount: number;
  isFollowing: boolean;
  isVerified: boolean;
  location: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours: string;
  establishedYear: string;
  categories: string[];
  shopProducts: Product[];
  reviews: Array<{
    id: string;
    user: string;
    avatar: string;
    rating: number;
    comment: string;
    date: string;
    images?: string[];
  }>;
}

const mockShopProfiles: Record<string, ShopProfile> = {
  'urban_threads': {
    id: '1',
    shopname: 'urban_threads',
    displayName: 'Urban Threads',
    avatar: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=300',
    coverImage: 'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Curated vintage and contemporary fashion pieces. Sustainable fashion for the modern wardrobe. Quality over quantity, style over trends.',
    followers: 25600,
    products: 156,
    rating: 4.8,
    reviewCount: 1247,
    isFollowing: false,
    isVerified: true,
    location: 'Brooklyn, NY',
    phone: '+1 (555) 123-4567',
    email: 'hello@urbanthreads.com',
    website: 'urbanthreads.com',
    openingHours: 'Mon-Sat 10AM-8PM, Sun 12PM-6PM',
    establishedYear: '2019',
    categories: ['Vintage', 'Streetwear', 'Accessories'],
    shopProducts: [
      {
        id: '1',
        name: 'Vintage Denim Jacket',
        price: 89.99,
        image: 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Outerwear',
        brand: 'Urban Threads',
        description: 'A classic vintage denim jacket with a modern twist. Perfect for layering or as a statement piece.',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Blue', 'Black'],
        stock: 25,
        rating: 4.5,
        reviews: 120,
        isAvailable: true,
        discount: 10,
      },
      {
        id: '2',
        name: 'Classic White Sneakers',
        price: 79.99,
        image: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Shoes',
        brand: 'Urban Threads',
        description: 'Timeless white sneakers that go with everything. Made from sustainable materials for a stylish and eco-friendly choice.',
        sizes: ['6', '7', '8', '9', '10'],
        colors: ['White'],
        stock: 50,
        rating: 4.7,
        reviews: 200,
        isAvailable: true,
      },
      {
        id: '3',
        name: 'Leather Crossbody Bag',
        price: 129.99,
        image: 'https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Accessories',
        brand: 'Urban Threads',
        description: 'A chic leather crossbody bag with multiple compartments. Perfect for everyday use or a night out.',
        sizes: [],
        colors: ['Black', 'Brown'],
        stock: 15,
        rating: 4.9,
        reviews: 75,
        isAvailable: true,
      },
      {
        id: '4',
        name: 'Oversized Blazer',
        price: 149.99,
        image: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Outerwear',
        brand: 'Urban Threads',
        description: 'A stylish oversized blazer that adds a touch of sophistication to any outfit.',
        sizes: ['S', 'M', 'L'],
        colors: ['Gray', 'Black'],
        stock: 20,
        rating: 4.6,
        reviews: 50,
        isAvailable: true,
      },
      {
        id: '5',
        name: 'High-Waisted Jeans',
        price: 69.99,
        image: 'https://images.pexels.com/photos/1040424/pexels-photo-1040424.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Bottoms',
        brand: 'Urban Threads',
        description: 'A pair of stylish high-waisted jeans that flatter your figure.',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Blue', 'Black'],
        stock: 30,
        rating: 4.5,
        reviews: 100,
        isAvailable: true,
      },
      {
        id: '6',
        name: 'Silk Scarf',
        price: 39.99,
        image: 'https://images.pexels.com/photos/1457983/pexels-photo-1457983.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Accessories',
        brand: 'Urban Threads',
        description: 'A luxurious silk scarf that adds a touch of elegance to any outfit.',
        sizes: [],
        colors: ['Red', 'Blue', 'Green'],
        stock: 50,
        rating: 4.8,
        reviews: 30,
        isAvailable: true,
      },
    ],
    reviews: [
      {
        id: '1',
        user: 'fashionista_jane',
        avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 5,
        comment: 'Amazing quality and unique pieces! The vintage denim jacket is perfect. Fast shipping and great customer service.',
        date: '2 days ago',
        images: ['https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=200'],
      },
      {
        id: '2',
        user: 'style_maven',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 4,
        comment: 'Great selection of sustainable fashion. Love supporting this local business!',
        date: '1 week ago',
      },
      {
        id: '3',
        user: 'trendy_alex',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 5,
        comment: 'The blazer fits perfectly and the quality is outstanding. Will definitely shop here again!',
        date: '2 weeks ago',
      },
    ],
  },
  'street_wear': {
    id: '2',
    shopname: 'street_wear',
    displayName: 'Vintage Treasures',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=300',
    coverImage: 'https://images.pexels.com/photos/1884584/pexels-photo-1884584.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Authentic vintage clothing from the 60s, 70s, and 80s. Each piece tells a story and brings timeless style to your wardrobe.',
    followers: 18200,
    products: 89,
    rating: 4.6,
    reviewCount: 892,
    isFollowing: true,
    isVerified: false,
    location: 'San Francisco, CA',
    phone: '+1 (555) 987-6543',
    website: 'vintagetreasures.com',
    openingHours: 'Tue-Sun 11AM-7PM, Closed Mondays',
    establishedYear: '2015',
    categories: ['Vintage', 'Retro', 'Collectibles'],
    shopProducts: [
      {
        id: '7',
        name: '70s Floral Dress',
        price: 95.99,
        image: 'https://images.pexels.com/photos/1457983/pexels-photo-1457983.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Dresses',
        brand: 'Vintage Treasures',
        description: 'A beautiful 70s floral dress that captures the essence of vintage fashion.',
        sizes: ['M', 'L'],
        colors: ['Red', 'Yellow'],
        stock: 10,
        rating: 4.5,
        reviews: 25,
        isAvailable: true,
      },
      {
        id: '8',
        name: 'Vintage Band Tee',
        price: 45.99,
        image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Tops',
        brand: 'Vintage Treasures',
        description: 'A classic vintage band tee that never goes out of style.',
        sizes: ['S', 'M', 'L'],
        colors: ['Black', 'White'],
        stock: 20,
        rating: 4.8,
        reviews: 30,
        isAvailable: true,
      },
    ],
    reviews: [
      {
        id: '4',
        user: 'retro_lover',
        avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 5,
        comment: 'Found the perfect 70s dress here! Authentic vintage pieces at great prices.',
        date: '3 days ago',
      },
    ],
  },
};

export default function ShopProfileScreen() {
  const { shopname } = useLocalSearchParams<{ shopname: string }>();
  const { addToWishlist, isInWishlist } = useShopping();
  
  const [shopProfile, setShopProfile] = useState<ShopProfile | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'products' | 'reviews'>('products');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shopname && mockShopProfiles[shopname]) {
      setShopProfile(mockShopProfiles[shopname]);
    }
    setLoading(false);
  }, [shopname]);

  const handleFollow = () => {
    if (!shopProfile) return;
    
    const newFollowingState = !shopProfile.isFollowing;
    setShopProfile(prev => prev ? {
      ...prev,
      isFollowing: newFollowingState,
      followers: newFollowingState ? prev.followers + 1 : prev.followers - 1,
    } : null);
  };

  const handleContact = () => {
    Alert.alert('Contact Shop', `Contact ${shopProfile?.displayName}`);
  };

  const handleShare = () => {
    Alert.alert('Share Shop', `Share ${shopProfile?.displayName}'s shop`);
  };

  const handleReport = () => {
    Alert.alert(
      'Report Shop',
      'Are you sure you want to report this shop?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', style: 'destructive', onPress: () => {
          Alert.alert('Reported', 'Shop has been reported. Thank you for keeping our community safe.');
          setShowMoreMenu(false);
        }},
      ]
    );
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.productItem}
      onPress={() => handleProductPress(item.id)}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
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
      <TouchableOpacity
        style={styles.wishlistButton}
        onPress={() => {
          if (!shopProfile) return;
          addToWishlist({ ...item });
        }}
      >
        <Heart
          size={16}
          color={isInWishlist(item.id) ? '#FF6B6B' : '#666'}
          fill={isInWishlist(item.id) ? '#FF6B6B' : 'transparent'}
        />
      </TouchableOpacity>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceContainer}>
          {item.discount ? (
            <>
              <Text style={styles.originalPrice}>${item.price}</Text>
              <Text style={styles.discountPrice}>
                ${(item.price * (1 - item.discount / 100)).toFixed(2)}
              </Text>
            </>
          ) : (
            <Text style={styles.productPrice}>${item.price}</Text>
          )}
        </View>
        <Text style={styles.productCategory}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderReview = ({ item }: { item: any }) => (
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
      {item.images && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImages}>
          {item.images.map((image : any , index : number) => (
            <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
          ))}
        </ScrollView>
      )}
    </View>
  );

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
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shop</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Shop not found</Text>
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
        <Text style={styles.headerTitle}>{shopProfile.shopname}</Text>
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
        {/* Cover Image */}
        <Image source={{ uri: shopProfile.coverImage }} style={styles.coverImage} />

        {/* Shop Info */}
        <View style={styles.shopSection}>
          <View style={styles.shopHeader}>
            <Image source={{ uri: shopProfile.avatar }} style={styles.shopAvatar} />
            <View style={styles.shopStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{shopProfile.products}</Text>
                <Text style={styles.statLabel}>Products</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{shopProfile.followers.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.ratingContainer}>
                  <Star size={16} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.statNumber}>{shopProfile.rating}</Text>
                </View>
                <Text style={styles.statLabel}>{shopProfile.reviewCount} reviews</Text>
              </View>
            </View>
          </View>

          <View style={styles.shopInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.shopName}>{shopProfile.displayName}</Text>
              {shopProfile.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.shopDescription}>{shopProfile.description}</Text>
            
            {/* Contact Info */}
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <MapPin size={16} color="#666" />
                <Text style={styles.contactText}>{shopProfile.location}</Text>
              </View>
              <View style={styles.contactItem}>
                <Clock size={16} color="#666" />
                <Text style={styles.contactText}>{shopProfile.openingHours}</Text>
              </View>
              {shopProfile.phone && (
                <View style={styles.contactItem}>
                  <Phone size={16} color="#666" />
                  <Text style={styles.contactText}>{shopProfile.phone}</Text>
                </View>
              )}
              {shopProfile.email && (
                <View style={styles.contactItem}>
                  <Mail size={16} color="#666" />
                  <Text style={styles.contactText}>{shopProfile.email}</Text>
                </View>
              )}
              {shopProfile.website && (
                <TouchableOpacity style={styles.contactItem}>
                  <Globe size={16} color="#007AFF" />
                  <Text style={[styles.contactText, styles.websiteText]}>{shopProfile.website}</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.establishedText}>Established {shopProfile.establishedYear}</Text>
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
              style={[styles.followButton, shopProfile.isFollowing && styles.followingButton]}
              onPress={handleFollow}
            >
              {shopProfile.isFollowing ? (
                <UserMinus size={16} color="#666" />
              ) : (
                <UserPlus size={16} color="#fff" />
              )}
              <Text style={[
                styles.followButtonText, 
                shopProfile.isFollowing && styles.followingButtonText
              ]}>
                {shopProfile.isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
              <MessageCircle size={16} color="#000" />
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsSection}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'products' && styles.activeTab]}
            onPress={() => setSelectedTab('products')}
          >
            <ShoppingBag size={20} color={selectedTab === 'products' ? '#000' : '#666'} />
            <Text style={[
              styles.tabText, 
              selectedTab === 'products' && styles.activeTabText
            ]}>
              Products ({shopProfile.products})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'reviews' && styles.activeTab]}
            onPress={() => setSelectedTab('reviews')}
          >
            <Star size={20} color={selectedTab === 'reviews' ? '#000' : '#666'} />
            <Text style={[
              styles.tabText, 
              selectedTab === 'reviews' && styles.activeTabText
            ]}>
              Reviews ({shopProfile.reviewCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {selectedTab === 'products' ? (
          <FlatList
            data={shopProfile.shopProducts}
            renderItem={({ item }) => renderProduct({ item })}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.productsRow}
            contentContainerStyle={styles.productsGrid}
          />
        ) : (
          <View style={styles.reviewsContainer}>
            <FlatList
              data={shopProfile.reviews}
              renderItem={renderReview}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
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
              <Text style={styles.moreMenuItemText}>Report Shop</Text>
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
  coverImage: {
    width: '100%',
    height: 200,
  },
  shopSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
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
    borderColor: '#fff',
  },
  shopStats: {
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
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  shopDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000',
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
    color: '#666',
  },
  websiteText: {
    color: '#007AFF',
  },
  establishedText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  categories: {
    marginBottom: 20,
  },
  categoriesTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    marginBottom: 8,
  },
  categoryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  categoryTagText: {
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
  contactButton: {
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
  contactButtonText: {
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
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  activeTabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  productsGrid: {
    backgroundColor: '#fff',
    paddingBottom: 84,
  },
  productsRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  productItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 8,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
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
    color: '#000',
  },
  originalPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FF3B30',
  },
  productCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  reviewsContainer: {
    backgroundColor: '#fff',
    paddingBottom: 84,
  },
  reviewItem: {
    padding: 16,
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
    color: '#000',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewImages: {
    marginTop: 8,
  },
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