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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  Heart, 
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
  UserMinus
} from 'lucide-react-native';
import { useShopping } from '@/contexts/ShoppingContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockProducts } from '@/mock/Product';
import { mockReviews } from '@/mock/Review';
import { mockShops } from '@/mock/Shop';
import { mockUsers } from '@/mock/User';
import { User } from '@/types/User';
import { ShopProfile } from '@/types/ShopProfile';
import { Product } from '@/types/Product';
import { Review } from '@/types/Review';
import { Theme } from '@/types/Theme';

export default function ShopProfileScreen() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { addToWishlist, isInWishlist } = useShopping();
  
  const [shopProfile, setShopProfile] = useState<ShopProfile | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'products' | 'reviews'>('products');
  const [loading, setLoading] = useState(true);
  const { user, followUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (shopId) {
      const profile = mockShops.find(p => p.id === shopId);
      if (profile) {
        setShopProfile(profile);
      }
    }
    setLoading(false);
  }, [shopId]);

  
  useEffect(() => {
    if (shopProfile) {
      setIsFollowing(user?.id ? shopProfile.followers.includes(user.id) : false);
      const fetchedProducts: Product[] = mockProducts.filter(product => shopProfile.productIds.includes(product.id));
      setProducts(fetchedProducts);

      const fetchedReviews: Review[] = mockReviews.filter(review => review.targetId === shopProfile.id && review.targetType === 'shop');
      setReviews(fetchedReviews);
    }
  }, [shopProfile]);

  const toggleFollow = () => {
    if (!shopProfile || !user) return;
    followUser(shopProfile.id);
  };


  const handleContact = () => {
    Alert.alert('Contact Shop', `Contact ${shopProfile?.name}`);
  };

  const handleShare = () => {
    Alert.alert('Share Shop', `Share ${shopProfile?.name}'s shop`);
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

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productItem}
      onPress={() => handleProductPress(item.id)}
    >
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

  const renderReview = ({ item }: { item: Review }) => {
    const user = mockUsers.find(user => user.id === item.userId) as User;
    if (!user) return null;

    return (
      <View style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
          <Image source={{ uri: user.avatar }} style={styles.reviewAvatar} />
          <View style={styles.reviewInfo}>
            <Text style={styles.reviewUser}>{user.fullName}</Text>
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
        {item.images && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImages}>
            {item.images.map((image : any , index : number) => (
              <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
            ))}
          </ScrollView>
        )}
      </View>
    );
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
        <Text style={styles.headerTitle}>{shopProfile.name}</Text>
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
        <Image source={{ uri: shopProfile.coverImageUrl }} style={styles.coverImage} />

        {/* Shop Info */}
        <View style={styles.shopSection}>
          <View style={styles.shopHeader}>
            <Image source={{ uri: shopProfile.logoUrl }} style={styles.shopAvatar} />
            <View style={styles.shopStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{products.length}</Text>
                <Text style={styles.statLabel}>Products</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{shopProfile.followers.length}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.ratingContainer}>
                  <Star size={16} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.statNumber}>{shopProfile.rating}</Text>
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
            <Text style={styles.shopDescription}>{shopProfile.description}</Text>
            
            {/* Contact Info */}
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <MapPin size={16} color="#666" />
                <Text style={styles.contactText}>{shopProfile.location}</Text>
              </View>
              {/* <View style={styles.contactItem}>
                <Clock size={16} color="#666" />
                <Text style={styles.contactText}>{shopProfile.openingHours}</Text>
              </View> */}
              {shopProfile.contactPhone && (
                <View style={styles.contactItem}>
                  <Phone size={16} color="#666" />
                  <Text style={styles.contactText}>{shopProfile.contactPhone}</Text>
                </View>
              )}
              {shopProfile.contactEmail && (
                <View style={styles.contactItem}>
                  <Mail size={16} color="#666" />
                  <Text style={styles.contactText}>{shopProfile.contactEmail}</Text>
                </View>
              )}
              {shopProfile.website && (
                <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL(shopProfile.website!)}>
                  <Globe size={16} color="#007AFF" />
                  <Text style={[styles.contactText, styles.websiteText]}>{shopProfile.website}</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.establishedText}>Established {shopProfile.createdAt}</Text>
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
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={toggleFollow}
            >
              {isFollowing ? (
                <UserMinus size={16} color="#666" />
              ) : (
                <UserPlus size={16} color="#fff" />
              )}
              <Text style={[
                styles.followButtonText, 
                isFollowing && styles.followingButtonText
              ]}>
                {isFollowing ? 'Following' : 'Follow'}
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
              Products ({products.length})
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
              Reviews ({reviews.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {selectedTab === 'products' ? (
          <FlatList
            data={products}
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
              data={reviews}
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
    paddingTop: -100,
    paddingBottom: -100,
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