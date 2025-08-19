import { ArrowLeft, Bookmark, Menu, PackageMinus,  X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useShopping } from '@/hooks/useShopping';
import { useTheme } from '@/contexts/ThemeContext';
import { Product } from '@/types/Product';
import { Theme } from '@/types/Theme';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    itemContainer: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    itemText: { fontSize: 18 },
    headerButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    wishlistModal: {
      flex: 1,
      backgroundColor: theme.background,
    },
    wishlistGrid: {
      padding: 16,
      paddingBottom: 50,
    },
    emptyWishlist: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
      shadowColor: theme.accent,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
      position: 'relative',
    },
    productImage: {
      width: '100%',
      height: 160,
      resizeMode: 'contain',
    },
    wishlistButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 8,
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
    productPrice: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 8,
    },
    productPriceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    originalPrice: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      textDecorationLine: 'line-through',
      marginRight: 8,
    },
    discountedPrice: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    discountBadge: {
      backgroundColor: '#ff4444',
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: 8,
    },
    discountText: {
      fontSize: 10,
      fontFamily: 'Inter-Bold',
      color: '#fff',
    },
    addToCartButton: {
      backgroundColor: theme.text,
      borderRadius: 8,
      paddingVertical: 8,
      alignItems: 'center',
    },
    addToCartText: {
      color: theme.background,
      fontSize: 12,
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
    productModalPriceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalOriginalPrice: {
      fontSize: 18,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      textDecorationLine: 'line-through',
      marginRight: 12,
    },
    modalDiscountedPrice: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    modalDiscountBadge: {
      backgroundColor: '#ff4444',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginLeft: 12,
    },
    modalDiscountText: {
      fontSize: 12,
      fontFamily: 'Inter-Bold',
      color: '#fff',
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
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
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
    emptyTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyMessage: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
  });

const Wishlist = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  const {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    addToCart,
  } = useShopping();

  const getDiscountedPrice = (price: number, discount?: number) => {
    if (!discount || discount <= 0) return null;
    return price - (price * discount / 100);
  };

  const renderPrice = (item: Product, isModal = false) => {
    const hasDiscount = item.discount && item.discount > 0;
    const discountedPrice = hasDiscount ? getDiscountedPrice(item.price, item.discount) : null;

    if (hasDiscount && discountedPrice) {
      return (
        <View style={isModal ? styles.productModalPriceContainer : styles.productPriceContainer}>
          <Text style={isModal ? styles.modalOriginalPrice : styles.originalPrice}>
            ${item.price.toFixed(2)}
          </Text>
          <Text style={isModal ? styles.modalDiscountedPrice : styles.discountedPrice}>
            ${discountedPrice.toFixed(2)}
          </Text>
          <View style={isModal ? styles.modalDiscountBadge : styles.discountBadge}>
            <Text style={isModal ? styles.modalDiscountText : styles.discountText}>
              -{item.discount}%
            </Text>
          </View>
        </View>
      );
    } else {
      return (
        <Text style={isModal ? styles.productModalPrice : styles.productPrice}>
          ${item.price.toFixed(2)}
        </Text>
      );
    }
  };

  const renderEmptyState = () => (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <PackageMinus size={48} color={theme.text} />
        </View>
        <Text style={styles.emptyTitle}>No items in your wishlist</Text>
        <Text style={styles.emptyMessage}>
          When you add items to your wishlist, they&apos;ll appear here
        </Text>
      </View>
    );

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

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

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <TouchableOpacity onPress={() => handleProductPress(item)}>
        <Image source={{ uri: item.imageUrl[0] }} style={styles.productImage} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.wishlistButton,
          isInWishlist(item._id) && { backgroundColor: theme.text },
        ]}
        onPress={() => toggleWishlist(item)}
      >
        <Bookmark
          size={20}
          color={ theme.background }
          fill={isInWishlist(item._id) ? theme.background : 'transparent'}
        />
      </TouchableOpacity>

      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{item.shopId.fullName}</Text>
        <TouchableOpacity onPress={() => handleProductPress(item)}>
          <Text style={styles.productName}>{item.name}</Text>
        </TouchableOpacity>
        {renderPrice(item)}

        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Menu size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.wishlistModal}>
        {wishlist.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={wishlist}
            renderItem={renderProduct}
            keyExtractor={(item) => item._id}
            numColumns={2}
            contentContainerStyle={styles.wishlistGrid}
            columnWrapperStyle={styles.productRow}
          />
        )}
      </View>

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
              {renderPrice(selectedProduct, true)}
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
    </SafeAreaView>
  );
};

export default Wishlist;
