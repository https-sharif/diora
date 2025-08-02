import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Modal,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShoppingCart,
  Heart,
  Search,
  Filter,
  X,
  Bookmark,
  Star,
  Check,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useShopping } from '@/hooks/useShopping';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import Color from 'color';
import { Product } from '@/types/Product';
import { Theme } from '@/types/Theme';
import ReceiptClockIcon from '@/icon/ReceiptClockIcon';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import LoadingView from '@/components/Loading';
import debounce from 'lodash.debounce';

const categories = [
  'All',
  'Men',
  'Women',
  'Unisex',
  'Tops',
  'Bottoms',
  'Footwear',
  'Accessories',
];

const createStyles = (theme: Theme) => {
  const bookmarkInactiveColor = Color(theme.text).alpha(0.5).toString();
  const outOfStockOverlay = Color(theme.text).alpha(0.5).toString();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: -100,
      paddingBottom: -100,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.background,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 16,
    },
    headerButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    headerButton: {
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: 0,
      right: -2,
      backgroundColor: theme.error,
      borderRadius: 10,
      minWidth: 10,
      height: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
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
      color: theme.text,
    },
    filterButton: {
      padding: 4,
    },
    categoriesContainer: {
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.card,
      height: 60,
      flexShrink: 0,
      flexGrow: 0,
    },
    categories: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    categoryChip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: '#000',
      height: 40,
    },
    categoryChipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    categoryText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
    categoryTextActive: {
      color: '#000',
    },
    productsGrid: {
      padding: 16,
      paddingBottom: 50,
    },
    productRow: {
      justifyContent: 'space-between',
    },
    productCard: {
      width: '48%',
      backgroundColor: theme.card,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
      position: 'relative',
    },
    productImageContainer: {
      position: 'relative',
    },
    discountBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: '#FF3B30',
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
      zIndex: 5,
    },
    outOfStockText: {
      color: theme.background,
      fontSize: 14,
      fontFamily: 'Inter-Bold',
    },
    productImage: {
      width: '100%',
      height: 160,
    },
    wishlistButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: bookmarkInactiveColor,
      borderRadius: 20,
      padding: 8,
    },
    wishlistButtonActive: {
      backgroundColor: theme.text,
      zIndex: 15,
    },
    productInfo: {
      padding: 12,
    },
    productBrand: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      marginBottom: 2,
    },
    productName: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 4,
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
      color: theme.text,
    },
    originalPrice: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      textDecorationLine: 'line-through',
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
    addToCartContainer: {
      paddingHorizontal: 12,
      paddingBottom: 12,
    },
    addToCartButton: {
      backgroundColor: theme.accent,
      borderRadius: 8,
      paddingVertical: 8,
      alignItems: 'center',
    },
    addToCartButtonDisabled: {
      opacity: 0.5,
    },
    addToCartButtonDisabledText: {
      color: theme.text,
    },
    addToCartText: {
      color: '#000',
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    productModal: {
      flex: 1,
      backgroundColor: theme.background,
    },
    productModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingTop: 60,
    },
    productModalTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    productModalContent: {
      flex: 1,
      padding: 16,
    },
    productModalImage: {
      width: '100%',
      height: 300,
      borderRadius: 12,
      marginBottom: 16,
      resizeMode: 'contain',
    },
    productModalName: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 8,
    },
    productModalPrice: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 16,
    },
    productModalDescription: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      lineHeight: 24,
      marginBottom: 24,
    },
    optionSection: {
      marginBottom: 24,
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
      borderColor: theme.text,
      backgroundColor: theme.background,
    },
    optionButtonActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    optionButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
    optionButtonTextActive: {
      color: '#000',
    },
    confirmButton: {
      backgroundColor: theme.accent,
      margin: 16,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 48,
    },
    confirmButtonText: {
      color: '#000',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    filterModal: {
      flex: 1,
      backgroundColor: theme.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 20,
      overflow: 'hidden',
    },
    filterHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    filterHeaderTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
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
      color: theme.text,
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
      borderColor: theme.border,
      backgroundColor: theme.background,
      gap: 6,
    },
    filterOptionActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    filterOptionText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
    filterOptionTextActive: {
      color: '#000',
    },
    filterCheck: {
      marginLeft: 4,
    },
    filterFooter: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    clearFiltersButton: {
      flex: 1,
      backgroundColor: '#f8f9fa',
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    clearFiltersText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: '#000',
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
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
    },
  });
};

const filterOptions = {
  priceRange: ['All', '$0-$50', '$50-$100', '$100-$200', '$200+'],
  rating: ['All', '4+ Stars', '4.5+ Stars', '4.8+ Stars'],
  availability: ['All', 'In Stock', 'On Sale', 'New Arrivals'],
  categories: [
    'All',
    'Men',
    'Women',
    'Unisex',
    'Tops',
    'Bottoms',
    'Footwear',
    'Accessories',
  ],
};

const initialFilter = {
  priceRange: 'All',
  rating: 'All',
  availability: 'All',
  categories: 'All',
};

export default function ShoppingScreen() {
  const {
    cart,
    wishlist,
    addToCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getCartItemCount,
    getCartTotal,
    updateCartQuantity,
    removeFromCart,
  } = useShopping();

  const { theme } = useTheme();

  const styles = createStyles(theme);
  const { token } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilter, setShowFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState(initialFilter);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (!token) {
        console.error('No token available for refreshing products');
        return;
      }

      console.log('Refreshing products from /api/product');
      const response = await axios.get(`${API_URL}/api/product`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Refresh response:', response.data);

      if (response.data && response.data.products) {
        setProducts(response.data.products);
      } else {
        console.warn('No products found in refresh response:', response.data);
        setProducts([]);
      }
    } catch (err: any) {
      console.error(
        'Error fetching products:',
        err.response?.data || err.message
      );
      // Keep existing products on error
    } finally {
      setRefreshing(false);
    }
  };

  const fetchProductResults = async (query: string, filterSnapshot: any) => {
    try {
      if (!token) {
        console.error('No token available for product search');
        return;
      }

      console.log('Fetching products with:', { query, filterSnapshot });

      const response = await axios.get(`${API_URL}/api/search`, {
        params: {
          query,
          ...filterSnapshot,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Search response:', response.data);

      if (response.data.status && response.data.products) {
        setProducts(response.data.products);
      } else {
        console.warn('No products found or invalid response:', response.data);
        setProducts([]);
      }
    } catch (err: any) {
      console.error(
        'Error fetching product results: ',
        err.response?.data || err.message
      );
    }
  };

  const debouncedProductSearch = useCallback(
    debounce((query, filterSnapshot) => {
      fetchProductResults(query, filterSnapshot);
    }, 500),
    []
  );

  useEffect(() => {
    if (!token) return; // Don't fetch if no token

    // Only use search API if there's a search query or non-default filters
    const hasSearchQuery = searchQuery.trim() !== '';
    const hasActiveFilters = selectedCategory !== 'All';

    if (hasSearchQuery || hasActiveFilters) {
      const filterSnapshot = {
        categories: selectedCategory !== 'All' ? selectedCategory : undefined,
        query: searchQuery,
        contentType: 'Products',
      };
      debouncedProductSearch(searchQuery, filterSnapshot);
    } else {
      // Use the regular product endpoint for initial load without filters
      onRefresh();
    }
  }, [searchQuery, selectedCategory, debouncedProductSearch, token]);

  useEffect(() => {
    const fetch = async () => {
      if (!token) return; // Don't fetch if no token

      setLoading(true);
      await onRefresh();
      setLoading(false);
    };

    fetch();
  }, [token]); // Add token as dependency

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product._id}`);
  };

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0]);
    setSelectedColor(product.variants[0]);
  };

  const confirmAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, 1, selectedSize, selectedColor);
      setSelectedProduct(null);
      Alert.alert('Success', 'Item added to cart!');
    }
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <TouchableOpacity onPress={() => handleProductPress(item)}>
        <View style={styles.productImageContainer}>
          {item.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{item.discount}%</Text>
            </View>
          )}
          {!item.stock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
          <Image
            source={{ uri: item.imageUrl[0] }}
            style={styles.productImage}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.wishlistButton,
          isInWishlist(item._id) && styles.wishlistButtonActive,
        ]}
        onPress={() => toggleWishlist(item)}
        activeOpacity={0.7}
      >
        <Bookmark
          size={20}
          color={theme.background}
          fill={isInWishlist(item._id) ? theme.background : 'transparent'}
        />
      </TouchableOpacity>

      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{item.shopId.fullName}</Text>
        <TouchableOpacity onPress={() => handleProductPress(item)}>
          <Text style={styles.productName}>{item.name}</Text>
        </TouchableOpacity>
        <View style={styles.priceRow}>
          {item.discount ? (
            <>
              <Text style={styles.productPrice}>
                ${(item.price - item.price * (item.discount / 100)).toFixed(2)}
              </Text>
              <Text style={styles.originalPrice}>${item.price.toFixed(2)}</Text>
            </>
          ) : (
            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          )}
        </View>
        <View style={styles.ratingRow}>
          <Star size={12} color="#FFD700" fill="#FFD700" />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>
      <View style={styles.addToCartContainer}>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            !item.stock && styles.addToCartButtonDisabled,
          ]}
          onPress={() => handleAddToCart(item)}
          disabled={!item.stock}
        >
          <Text
            style={[
              styles.addToCartText,
              !item.stock && styles.addToCartButtonDisabledText,
            ]}
          >
            {!item.stock ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterOption = (
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
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
                <Check size={14} color="#000" style={styles.filterCheck} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Shop</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => {
                  router.push('/wishlist');
                }}
              >
                <Heart size={24} color={theme.text} />
                {wishlist.length > 0 && <View style={styles.badge}></View>}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => {
                  router.push('/cart');
                }}
              >
                <ShoppingCart size={24} color={theme.text} />
                {getCartItemCount() > 0 && <View style={styles.badge}></View>}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => {
                  router.push('/pastOrder');
                }}
              >
                <ReceiptClockIcon size={24} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Search
              size={20}
              color={theme.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theme.textSecondary}
            />
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilter(true)}
            >
              <Filter size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categories}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <LoadingView message="Loading products..." size="large" />
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item._id}
            numColumns={2}
            contentContainerStyle={styles.productsGrid}
            columnWrapperStyle={styles.productRow}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}

        {/* Product Selection Modal */}
        <Modal
          visible={!!selectedProduct}
          animationType="slide"
          onRequestClose={() => setSelectedProduct(null)}
        >
          {selectedProduct && (
            <View style={styles.productModal}>
              <View style={styles.productModalHeader}>
                <Text style={styles.productModalTitle}>Select Options</Text>
                <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                  <X size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.productModalContent}>
                <Image
                  source={{ uri: selectedProduct.imageUrl[0] }}
                  style={styles.productModalImage}
                />
                <Text style={styles.productModalName}>
                  {selectedProduct.name}
                </Text>
                <Text style={styles.productModalPrice}>
                  ${selectedProduct.price}
                </Text>
                <Text style={styles.productModalDescription}>
                  {selectedProduct.description}
                </Text>

                <View style={styles.optionSection}>
                  <Text style={styles.optionTitle}>Size</Text>
                  <View style={styles.optionButtons}>
                    {selectedProduct.sizes.map((size) => (
                      <TouchableOpacity
                        key={size}
                        style={[
                          styles.optionButton,
                          selectedSize === size && styles.optionButtonActive,
                        ]}
                        onPress={() => setSelectedSize(size)}
                      >
                        <Text
                          style={[
                            styles.optionButtonText,
                            selectedSize === size &&
                              styles.optionButtonTextActive,
                          ]}
                        >
                          {size}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.optionSection}>
                  <Text style={styles.optionTitle}>Color</Text>
                  <View style={styles.optionButtons}>
                    {selectedProduct.variants.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.optionButton,
                          selectedColor === color && styles.optionButtonActive,
                        ]}
                        onPress={() => setSelectedColor(color)}
                      >
                        <Text
                          style={[
                            styles.optionButtonText,
                            selectedColor === color &&
                              styles.optionButtonTextActive,
                          ]}
                        >
                          {color}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmAddToCart}
              >
                <Text style={styles.confirmButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          )}
        </Modal>

        <Modal
          visible={showFilter}
          animationType="slide"
          transparent
          onRequestClose={() => setShowFilter(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowFilter(false)}>
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <View
                  style={{
                    height: '80%',
                    backgroundColor: theme.background,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    overflow: 'hidden',
                  }}
                >
                  <SafeAreaView style={styles.filterModal}>
                    <View style={styles.filterHeader}>
                      <Text style={styles.filterHeaderTitle}>
                        Advanced Filters
                      </Text>
                      <TouchableOpacity onPress={() => setShowFilter(false)}>
                        <X size={24} color={theme.text} />
                      </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.filterContent}>
                      {renderFilterOption(
                        'Price Range',
                        filterOptions.priceRange,
                        filters.priceRange,
                        (value) =>
                          setFilters((prev) => ({
                            ...prev,
                            priceRange: value,
                          }))
                      )}

                      {renderFilterOption(
                        'Rating',
                        filterOptions.rating,
                        filters.rating,
                        (value) =>
                          setFilters((prev) => ({ ...prev, rating: value }))
                      )}

                      {renderFilterOption(
                        'Availability',
                        filterOptions.availability,
                        filters.availability,
                        (value) =>
                          setFilters((prev) => ({
                            ...prev,
                            availability: value,
                          }))
                      )}

                      {renderFilterOption(
                        'Categories',
                        filterOptions.categories,
                        filters.categories,
                        (value) =>
                          setFilters((prev) => ({ ...prev, categories: value }))
                      )}
                    </ScrollView>

                    <View style={styles.filterFooter}>
                      <TouchableOpacity
                        style={styles.clearFiltersButton}
                        onPress={() => setFilters(initialFilter)}
                      >
                        <Text style={styles.clearFiltersText}>Clear All</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.applyFiltersButton}
                        onPress={() => {
                          setShowFilter(false);
                          const filterSnapshot = {
                            categories:
                              filters.categories !== 'All'
                                ? filters.categories
                                : undefined,
                            priceRange:
                              filters.priceRange !== 'All'
                                ? filters.priceRange
                                : undefined,
                            rating:
                              filters.rating !== 'All'
                                ? filters.rating
                                : undefined,
                            availability:
                              filters.availability !== 'All'
                                ? filters.availability
                                : undefined,
                            query: searchQuery,
                            contentType: 'Products',
                          };
                          fetchProductResults(searchQuery, filterSnapshot);
                        }}
                      >
                        <Text style={styles.applyFiltersText}>
                          Apply Filters
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </SafeAreaView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
