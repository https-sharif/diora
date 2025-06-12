import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Modal, Dimensions, Animated, PanResponder, } from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Filter, X, Check, Star, Heart, ShoppingBag, User, Store } from 'lucide-react-native';
import { router } from 'expo-router';
import { useShopping } from '@/contexts/ShoppingContext';

const { width, height } = Dimensions.get('window');

const trendingUsers = [
  {
    id: '1',
    username: 'fashion_guru',
    avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150',
    followers: '12.5K',
    isShop: false,
    category: 'Users',
    bio: 'Fashion enthusiast & style blogger',
    location: 'New York',
    verified: true,
  },
  {
    id: '2',
    username: 'vintage_store',
    avatar: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=150',
    followers: '8.2K',
    isShop: true,
    category: 'Shops',
    bio: 'Curated vintage fashion pieces',
    location: 'Los Angeles',
    verified: false,
  },
  {
    id: '3',
    username: 'street_wear',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    followers: '15.7K',
    isShop: true,
    category: 'Shops',
    bio: 'Urban streetwear collection',
    location: 'Chicago',
    verified: true,
  },
  {
    id: '4',
    username: 'boho_chic',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
    followers: '9.3K',
    isShop: false,
    category: 'Users',
    bio: 'Bohemian style inspiration',
    location: 'Austin',
    verified: false,
  },
];

const trendingProducts = [
  {
    id: 'p1',
    name: 'Vintage Denim Jacket',
    price: 89.99,
    originalPrice: 120.00,
    image: 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=400',
    shop: 'Urban Threads',
    shopAvatar: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=100',
    rating: 4.8,
    reviews: 127,
    category: 'Products',
    subcategory: 'Outerwear',
    tags: ['vintage', 'denim', 'casual'],
    inStock: true,
    discount: 25,
  },
  {
    id: 'p2',
    name: 'Silk Scarf Collection',
    price: 45.99,
    image: 'https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=400',
    shop: 'Luxury Accessories',
    shopAvatar: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=100',
    rating: 4.6,
    reviews: 89,
    category: 'Products',
    subcategory: 'Accessories',
    tags: ['silk', 'luxury', 'accessories'],
    inStock: true,
  },
  {
    id: 'p3',
    name: 'High-Waisted Jeans',
    price: 69.99,
    image: 'https://images.pexels.com/photos/1040424/pexels-photo-1040424.jpeg?auto=compress&cs=tinysrgb&w=400',
    shop: 'Denim Co',
    shopAvatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
    rating: 4.7,
    reviews: 203,
    category: 'Products',
    subcategory: 'Bottoms',
    tags: ['denim', 'high-waisted', 'casual'],
    inStock: false,
  },
  {
    id: 'p4',
    name: 'Flowy Maxi Dress',
    price: 129.99,
    image: 'https://images.pexels.com/photos/1457983/pexels-photo-1457983.jpeg?auto=compress&cs=tinysrgb&w=400',
    shop: 'Boho Chic',
    shopAvatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100',
    rating: 4.9,
    reviews: 156,
    category: 'Products',
    subcategory: 'Dresses',
    tags: ['maxi', 'flowy', 'boho'],
    inStock: true,
  },
];

const exploreGrid = [
  {
    id: '1',
    image: 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=400',
    user: 'fashionista_jane',
    userAvatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100',
    stars: 128,
    comments: 23,
    category: 'Posts',
    caption: 'Loving this vintage look! Perfect for a casual day out ✨',
    timestamp: '2h ago',
    tags: ['vintage', 'casual', 'ootd'],
  },
  {
    id: '2',
    image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400',
    user: 'style_maven',
    userAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    stars: 256,
    comments: 41,
    category: 'Posts',
    caption: 'Black and white never goes out of style 🖤🤍',
    timestamp: '4h ago',
    tags: ['minimalist', 'monochrome', 'chic'],
  },
  {
    id: '3',
    image: 'https://images.pexels.com/photos/1457983/pexels-photo-1457983.jpeg?auto=compress&cs=tinysrgb&w=400',
    user: 'trendy_alex',
    userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    stars: 89,
    comments: 12,
    category: 'Posts',
    caption: 'Summer vibes with this flowy dress 🌸',
    timestamp: '6h ago',
    tags: ['summer', 'flowy', 'dress'],
  },
  {
    id: '4',
    image: 'https://images.pexels.com/photos/1040424/pexels-photo-1040424.jpeg?auto=compress&cs=tinysrgb&w=400',
    user: 'urban_chic',
    userAvatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
    stars: 167,
    comments: 28,
    category: 'Posts',
    caption: 'Street style inspiration from NYC 🏙️',
    timestamp: '8h ago',
    tags: ['streetstyle', 'urban', 'nyc'],
  },
];

const filterOptions = {
  contentType: ['All', 'Users', 'Shops', 'Products', 'Posts'],
  priceRange: ['All', '$0-$50', '$50-$100', '$100-$200', '$200+'],
  rating: ['All', '4+ Stars', '4.5+ Stars', '4.8+ Stars'],
  availability: ['All', 'In Stock', 'On Sale', 'New Arrivals'],
  style: ['All', 'Vintage', 'Modern', 'Casual', 'Formal', 'Streetwear', 'Boho', 'Minimalist'],
  verification: ['All', 'Verified Only', 'Unverified'],
  followers: ['All', '0-1K', '1K-10K', '10K-50K', '50K+'],
  likes: ['All', '0-100', '100-500', '500-1000', '1000+'],
};

export default function ExploreScreen() {
  const { addToWishlist, isInWishlist } = useShopping();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [enlargedPost, setEnlargedPost] = useState<ExploreGridItem | null>(null);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [opacityAnim] = useState(new Animated.Value(0));

  const insets = useSafeAreaInsets();
  const [topInset, setTopInset] = useState(44);

  useEffect(() => {
    if (insets.top > 0) {
      setTopInset(insets.top);
    }
  }, [insets.top]);
  
  const [filters, setFilters] = useState({
    contentType: 'All',
    priceRange: 'All',
    rating: 'All',
    availability: 'All',
    style: 'All',
    location: 'All',
    verification: 'All',
    followers: 'All',
    likes: 'All',
  });

  const applyFilters = () => {
    let filteredUsers = trendingUsers.filter(user => !user.isShop);
    let filteredShops = trendingUsers.filter(user => user.isShop);
    let filteredProducts = trendingProducts;
    let filteredPosts = exploreGrid;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.bio.toLowerCase().includes(query) ||
        user.location.toLowerCase().includes(query)
      );
      filteredShops = filteredShops.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.bio.toLowerCase().includes(query) ||
        user.location.toLowerCase().includes(query)
      );
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.shop.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query))
      );
      filteredPosts = filteredPosts.filter(post =>
        post.user.toLowerCase().includes(query) ||
        post.caption.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply advanced filters
    if (filters.contentType !== 'All') {
      if (filters.contentType === 'Users') {
        filteredProducts = [];
        filteredPosts = [];
        filteredShops = [];
        filteredUsers = filteredUsers.filter(user => !user.isShop);
      } else if (filters.contentType === 'Shops') {
        filteredUsers = [];
        filteredProducts = [];
        filteredPosts = [];
        filteredShops = filteredShops.filter(user => user.isShop);
      } else if (filters.contentType === 'Products') {
        filteredUsers = [];
        filteredPosts = [];
        filteredShops = [];
      } else if (filters.contentType === 'Posts') {
        filteredUsers = [];
        filteredShops = [];
        filteredProducts = [];
      }
    }

    // Price range filter for products
    if (filters.priceRange !== 'All' && filteredProducts.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        const price = product.price;
        switch (filters.priceRange) {
          case '$0-$50':
            return price <= 50;
          case '$50-$100':
            return price > 50 && price <= 100;
          case '$100-$200':
            return price > 100 && price <= 200;
          case '$200+':
            return price > 200;
          default:
            return true;
        }
      });
    }

    // Rating filter
    if (filters.rating !== 'All') {
      const minRating = parseFloat(filters.rating.split('+')[0]);
      filteredProducts = filteredProducts.filter(product => product.rating >= minRating);
    }

    // Availability filter
    if (filters.availability !== 'All') {
      filteredProducts = filteredProducts.filter(product => {
        switch (filters.availability) {
          case 'In Stock':
            return product.inStock;
          case 'On Sale':
            if(!product.discount) return false;
            return product.discount > 0;
          case 'New Arrivals':
            return true;
          default:
            return true;
        }
      });
    }

    if (filters.style !== 'All') {
      const style = filters.style.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.tags.some(tag => tag.toLowerCase().includes(style))
      );
      filteredPosts = filteredPosts.filter(post =>
        post.tags.some(tag => tag.toLowerCase().includes(style))
      );
    }

    if (filters.verification !== 'All') {
      if (filters.verification === 'Verified Only') {
        filteredUsers = filteredUsers.filter(user => user.verified);
      } else {
        filteredUsers = filteredUsers.filter(user => !user.verified);
      }
    }

    if (filters.followers !== 'All') {
      const followersRange = filters.followers.split('-');
      filteredUsers = filteredUsers.filter(user => {
        const followersCount = parseFloat(user.followers.replace(/K$/, '')) * 1000;
        const minimum = parseFloat(followersRange[0].replace(/K$/, '')) * 1000;
        const maximum = followersRange[1] ? parseFloat(followersRange[1].replace(/K$/, '')) * 1000 : Infinity;
        return followersCount >= minimum && followersCount < maximum;
      });

      filteredShops = filteredShops.filter(user => {
        const followersCount = parseFloat(user.followers.replace(/K$/, '')) * 1000;
        const minimum = parseFloat(followersRange[0].replace(/K$/, '')) * 1000;
        const maximum = followersRange[1] ? parseFloat(followersRange[1].replace(/K$/, '')) * 1000 : Infinity;
        return followersCount >= minimum && followersCount < maximum;
      });
    }

    if (filters.likes !== 'All') {
      const likesRange = filters.likes.split('-');
      filteredPosts = filteredPosts.filter(post => {
        const likesCount = post.stars;
        const minimum = parseFloat(likesRange[0].replace('+', '')) * 1000;
        const maximum = likesRange[1] ? parseFloat(likesRange[1]) * 1000 : Infinity;
        if (likesRange.length === 1) {
          return likesCount >= parseFloat(likesRange[0]);
        } else {
          return likesCount >= parseFloat(likesRange[0]) && likesCount < parseFloat(likesRange[1]);
        }
      });
    }

    return { filteredUsers, filteredProducts, filteredPosts , filteredShops};
  };

  const { filteredUsers, filteredProducts, filteredPosts, filteredShops } = applyFilters();

  const handleLongPress = (post : any) => {
    setEnlargedPost(post);
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

  type TrendingUser = {
    id: string;
    username: string;
    avatar: string;
    followers: string;
    isShop: boolean;
    category: string;
    bio: string;
    location: string;
    verified: boolean;
  };

  const renderUserCard = ({ item }: { item: TrendingUser }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => {
        if (item.isShop) {
          router.push(`/shop/${item.username}`);
        } else {
          router.push(`/user/${item.username}`);
        }
      }}
    >
      <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
      <View style={styles.userInfo}>
        <View style={styles.userNameRow}>
          <Text style={styles.userName}>{item.username}</Text>
          {item.verified && <Text style={styles.verifiedBadge}>✓</Text>}
          {item.isShop && <Store size={14} color="#FFD700" />}
        </View>
        <Text style={styles.userBio} numberOfLines={2}>{item.bio}</Text>
        <Text style={styles.userLocation}>📍 {item.location}</Text>
        <Text style={styles.userFollowers}>{item.followers} followers</Text>
      </View>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  type TrendingProduct = {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    shop: string;
    shopAvatar: string;
    rating: number;
    reviews: number;
    category: string;
    subcategory: string;
    tags: string[];
    inStock: boolean;
    discount?: number;
  };

  const renderProductCard = ({ item }: { item: TrendingProduct }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discount}%</Text>
          </View>
        )}
        {!item.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() =>
            addToWishlist({
              ...item,
              brand: item.shop || 'Unknown',
              description: item.name,
              sizes: [],
              colors: [],
              image: item.image,
              stock: 0,
              isAvailable: false
            })
          }
        >
          <Heart
            size={16}
            color={isInWishlist(item.id) ? '#FF6B6B' : '#fff'}
            fill={isInWishlist(item.id) ? '#FF6B6B' : 'transparent'}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.productInfo}>
        <View style={styles.shopInfo}>
          <Image source={{ uri: item.shopAvatar }} style={styles.shopAvatar} />
          <Text style={styles.shopName}>{item.shop}</Text>
        </View>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>${item.price}</Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>${item.originalPrice}</Text>
          )}
        </View>
        <View style={styles.ratingRow}>
          <Star size={12} color="#FFD700" fill="#FFD700" />
          <Text style={styles.ratingText}>{item.rating} ({item.reviews})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  type ExploreGridItem = {
    id: string;
    image: string;
    user: string;
    userAvatar: string;
    stars: number;
    comments: number;
    category: string;
    caption: string;
    timestamp: string;
    tags: string[];
  };

  const renderGridItem = ({ item }: { item: ExploreGridItem }) => (
    <TouchableOpacity 
      style={styles.gridItem}
      onPress={() => router.push(`/post/${item.id}`)}
      onLongPress={() => handleLongPress(item)}
      delayLongPress={500}
    >
      <Image source={{ uri: item.image }} style={styles.gridImage} />
      <View style={styles.gridOverlay}>
        <View style={styles.gridStats}>
          <View style={styles.gridStat}>
            <Star size={12} color="#fff" fill="#fff" />
            <Text style={styles.gridStatText}>{item.stars}</Text>
          </View>
          <View style={styles.gridStat}>
            <Heart size={12} color="#fff" />
            <Text style={styles.gridStatText}>{item.comments}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterOption = (title: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, options: any[], selectedValue: string, onSelect: { (value: any): void; (value: any): void; (value: any): void; (value: any): void; (value: any): void; (value: any): void; (value: any): void; (arg0: any): void; }) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.filterOption,
                selectedValue === option && styles.filterOptionActive,
              ]}
              onPress={() => onSelect(option)}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedValue === option && styles.filterOptionTextActive,
                ]}
              >
                {option}
              </Text>
              {selectedValue === option && (
                <Check size={14} color="#fff" style={styles.filterCheck} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users, shops, products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilter(true)}
          >
            <Filter size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Trending Users */}
        {filteredUsers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? 'People & Shops' : 'Trending Creators'}
            </Text>
            <FlatList
              data={filteredUsers}
              renderItem={renderUserCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Trending Shops */}
        {filteredShops.length > 0 && filteredShops.some(user => user.isShop) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Shops</Text>
            <FlatList
              data={filteredShops}
              renderItem={renderUserCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {filteredProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <FlatList
              data={filteredProducts}
              renderItem={renderProductCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.gridRow}
            />
          </View>
        )}

        {/* Discover Posts */}
        {filteredPosts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Discover</Text>
            <FlatList
              data={filteredPosts}
              renderItem={renderGridItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.gridRow}
            />
          </View>
        )}

        {/* No Results */}
        {filteredUsers.length === 0 && filteredShops.length === 0 && filteredProducts.length === 0 && filteredPosts.length === 0 && (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No results found</Text>
            <Text style={styles.noResultsSubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Enhanced Filter Modal */}
      <Modal
        visible={showFilter}
        animationType="slide"
        onRequestClose={() => setShowFilter(false)}
      >
        <SafeAreaView style={[styles.filterModal, { paddingTop: topInset }]} >
          <View style={styles.filterHeader}>
            <Text style={styles.filterHeaderTitle}>Advanced Filters</Text>
            <TouchableOpacity onPress={() => setShowFilter(false)}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            {renderFilterOption(
              'Content Type',
              filterOptions.contentType,
              filters.contentType,
              (value) => setFilters(prev => ({ ...prev, contentType: value }))
            )}

            {(filters.contentType == 'All' || filters.contentType == 'Products') && renderFilterOption(
              'Price Range',
              filterOptions.priceRange,
              filters.priceRange,
              (value) => setFilters(prev => ({ ...prev, priceRange: value }))
            )}

            {(filters.contentType == 'All' || filters.contentType == 'Products') && renderFilterOption(
              'Rating',
              filterOptions.rating,
              filters.rating,
              (value) => setFilters(prev => ({ ...prev, rating: value }))
            )}

            {(filters.contentType == 'All' || filters.contentType == 'Products') && renderFilterOption(
              'Availability',
              filterOptions.availability,
              filters.availability,
              (value) => setFilters(prev => ({ ...prev, availability: value }))
            )}

            {(filters.contentType == 'All' || filters.contentType == 'Products') && renderFilterOption(
              'Style',
              filterOptions.style,
              filters.style,
              (value) => setFilters(prev => ({ ...prev, style: value }))
            )}

            {(filters.contentType == 'All' || filters.contentType == 'Users' || filters.contentType == 'Shops') && renderFilterOption(
              'Verification',
              filterOptions.verification,
              filters.verification,
              (value) => setFilters(prev => ({ ...prev, verification: value }))
            )}

            {(filters.contentType == 'All' || filters.contentType == 'Users' || filters.contentType == 'Shops') && renderFilterOption(
              'Followers',
              filterOptions.followers,
              filters.followers,
              (value) => setFilters(prev => ({ ...prev, followers: value }))
            )}

            {(filters.contentType == 'All' || filters.contentType == 'Posts') && renderFilterOption(
              'Likes',
              filterOptions.likes,
              filters.likes,
              (value) => setFilters(prev => ({ ...prev, likes: value }))
            )}


          </ScrollView>

          <View style={styles.filterFooter}>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => setFilters({
                contentType: 'All',
                priceRange: 'All',
                rating: 'All',
                availability: 'All',
                style: 'All',
                location: 'All',
                verification: 'All',
                followers: 'All',
                likes: 'All',
              })}
            >
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={() => setShowFilter(false)}
            >
              <Text style={styles.applyFiltersText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {enlargedPost && (
        <Modal
          visible={!!enlargedPost}
          transparent
          animationType="none"
          onRequestClose={handleCloseEnlarged}
        >
          {/* Add BlurView for background blur */}
          <Animated.View 
            style={[
              styles.enlargedContainer,
              { opacity: opacityAnim }
            ]}
            {...panResponder.panHandlers}
          >
            {/* BlurView background */}
            <BlurView
              intensity={50}
              tint="light"
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
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <View style={styles.enlargedHeader}>
                <View style={styles.enlargedUserInfo}>
                  <Image source={{ uri: enlargedPost.userAvatar }} style={styles.enlargedUserAvatar} />
                  <View>
                    <Text style={styles.enlargedUsername}>{enlargedPost.user}</Text>
                    <Text style={styles.enlargedTimestamp}>{enlargedPost.timestamp}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={handleCloseEnlarged}>
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <Image source={{ uri: enlargedPost.image }} style={styles.enlargedImage} />
              
              <View style={styles.enlargedFooter}>
                <View style={styles.enlargedActions}>
                  <View style={styles.enlargedStat}>
                    <Star size={20} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.enlargedStatText}>{enlargedPost.stars}</Text>
                  </View>
                  <View style={styles.enlargedStat}>
                    <Heart size={20} color="#fff" />
                    <Text style={styles.enlargedStatText}>{enlargedPost.comments}</Text>
                  </View>
                </View>
                <Text style={styles.enlargedCaption}>{enlargedPost.caption}</Text>
                <View style={styles.enlargedTags}>
                  {enlargedPost.tags.map((tag, index) => (
                    <Text key={index} style={styles.enlargedTag}>#{tag}</Text>
                  ))}
                </View>
              </View>
            </Animated.View>
          </Animated.View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: -34,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000',
  },
  filterButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  verifiedBadge: {
    fontSize: 14,
    color: '#007AFF',
  },
  userBio: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
  userLocation: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
    marginTop: 4,
  },
  userFollowers: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginTop: 4,
  },
  followButton: {
    backgroundColor: '#000',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  productsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    marginBottom: 12,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    padding: 8,
  },
  productInfo: {
    padding: 12,
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  shopAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  shopName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    marginBottom: 6,
    lineHeight: 18,
  },
  priceRow: {
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  gridItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 12,
  },
  gridStats: {
    flexDirection: 'row',
    gap: 12,
  },
  gridStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gridStatText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  bottomPadding: {
    height: 100,
  },
  filterModal: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterHeaderTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  filterContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    marginBottom: 16,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
    gap: 6,
  },
  filterOptionActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  filterCheck: {
    marginLeft: 4,
  },
  filterFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  clearFiltersButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  clearFiltersText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
  },
  applyFiltersText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  applyFiltersButton: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
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
  enlargedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  enlargedUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  enlargedUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  enlargedUsername: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  enlargedTimestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#ccc',
  },
  enlargedImage: {
    width: '100%',
    height: width * 0.9,
    resizeMode: 'contain',
  },
  enlargedFooter: {
    padding: 16,
  },
  enlargedActions: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  enlargedStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  enlargedStatText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  enlargedCaption: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
    marginBottom: 12,
  },
  enlargedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  enlargedTag: {
    color: '#007AFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});