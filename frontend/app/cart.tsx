import {
  ArrowLeft,
  Menu,
  Minus,
  Plus,
  ShoppingBag,
} from 'lucide-react-native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useShopping } from '@/hooks/useShopping';
import { useTheme } from '@/contexts/ThemeContext';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Animated } from 'react-native';
import { Cart, CartItem } from '@/types/Cart';
import { Product } from '@/types/Product';
import { Theme } from '@/types/Theme';
import { useEffect } from 'react';

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
    headerButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
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
    cartItem: {
      flexDirection: 'row',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.card,
    },
    cartItemImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
      backgroundColor: theme.card,
      resizeMode: 'contain',
    },
    cartItemInfo: {
      flex: 1,
      marginLeft: 12,
    },
    cartItemName: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 4,
    },
    cartItemDetails: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginBottom: 4,
    },
    cartItemPrice: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    cartItemPriceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cartItemOriginalPrice: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      textDecorationLine: 'line-through',
      marginRight: 8,
    },
    cartItemDiscountedPrice: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    cartItemDiscountBadge: {
      backgroundColor: '#ff4444',
      borderRadius: 4,
      paddingHorizontal: 4,
      paddingVertical: 2,
      marginLeft: 6,
    },
    cartItemDiscountText: {
      fontSize: 10,
      fontFamily: 'Inter-Bold',
      color: '#fff',
    },
    cartItemActions: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    quantityButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.accentSecondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    cartContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    cartList: {
      flex: 1,
    },
    cartFooter: {
      padding: 16,
      borderTopWidth: 2,
      borderTopColor: theme.border,
      paddingBottom: 25,
    },
    cartTotal: {
      marginBottom: 16,
    },
    cartTotalText: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      textAlign: 'center',
    },
    checkoutButton: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
    },
    checkoutButtonText: {
      color: '#000',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    swipeActionRight: {
      backgroundColor: theme.error,
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingHorizontal: 20,
      flex: 1,
    },
    swipeActionLeft: {
      backgroundColor: theme.success,
      width: 100,
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingHorizontal: 20,
      flex: 1,
    },
    swipeText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      textAlign: 'center',
    },
  });

const CartPage = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    addToWishlist,
  } = useShopping();

  // Helper function to calculate discounted price
  const getDiscountedPrice = (price: number, discount?: number) => {
    if (!discount || discount <= 0) return null;
    return price - (price * discount / 100);
  };

  // Helper function to render price with discount
  const renderCartItemPrice = (product: Product) => {
    const hasDiscount = product.discount && product.discount > 0;
    const discountedPrice = hasDiscount ? getDiscountedPrice(product.price, product.discount) : null;

    if (hasDiscount && discountedPrice) {
      return (
        <View style={styles.cartItemPriceContainer}>
          <Text style={styles.cartItemOriginalPrice}>
            ${product.price.toFixed(2)}
          </Text>
          <Text style={styles.cartItemDiscountedPrice}>
            ${discountedPrice.toFixed(2)}
          </Text>
          <View style={styles.cartItemDiscountBadge}>
            <Text style={styles.cartItemDiscountText}>
              -{product.discount}%
            </Text>
          </View>
        </View>
      );
    } else {
      return (
        <Text style={styles.cartItemPrice}>
          ${product.price.toFixed(2)}
        </Text>
      );
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <ShoppingBag size={48} color={theme.text} strokeWidth={2} />
      </View>
      <Text style={styles.emptyTitle}>No items in your cart</Text>
      <Text style={styles.emptyMessage}>
        When you add items to your cart, they'll appear here
      </Text>
    </View>
  );

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const product = item.productId as Product;
    
    const renderRightActions = (
      progress: Animated.AnimatedInterpolation<number>
    ) => {
      const translateX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [100, 0],
        extrapolate: 'clamp',
      });

      return (
        <TouchableOpacity onPress={() => removeFromCart(product._id, item.size, item.variant)}>
          <Animated.View
            style={[styles.swipeActionRight, { transform: [{ translateX }] }]}
          >
            <Text style={styles.swipeText}>Remove</Text>
          </Animated.View>
        </TouchableOpacity>
      );
    };

    const renderLeftActions = (
      progress: Animated.AnimatedInterpolation<number>
    ) => {
      const translateX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 0],
        extrapolate: 'clamp',
      });
      return (
        <TouchableOpacity onPress={() => addToWishlist(product)}>
          <Animated.View
            style={[styles.swipeActionLeft, { transform: [{ translateX }] }]}
          >
            <Text style={styles.swipeText}>Add to Wishlist</Text>
          </Animated.View>
        </TouchableOpacity>
      );
    };

    return (
      <Swipeable
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
        friction={2}
        rightThreshold={40}
      >
        <View style={styles.cartItem}>
          <TouchableOpacity
            onPress={() => router.push(`/product/${product._id}`)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: product.imageUrl?.[0] }} style={styles.cartItemImage} />
          </TouchableOpacity>
          <View style={styles.cartItemInfo}>
            <TouchableOpacity
              onPress={() => router.push(`/product/${product._id}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.cartItemName}>{product.name}</Text>
            </TouchableOpacity>
            <Text style={styles.cartItemDetails}>
              {item.size && `${item.size}${item.variant ? ' • ' : ''}`}{item.variant}
            </Text>
            {renderCartItemPrice(product)}
          </View>
          <View style={styles.cartItemActions}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateCartQuantity(product._id, item.quantity - 1, item.size, item.variant)}
              >
                <Minus size={16} color="#666" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateCartQuantity(product._id, item.quantity + 1, item.size, item.variant)}
              >
                <Plus size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Swipeable>
    );
  };

  const total = getCartTotal();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Menu size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.cartContainer}>
        {cart.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <FlatList
              data={cart}
              renderItem={renderCartItem}
              keyExtractor={(item) => {
                const product = item.productId as Product;
                return `${product._id}-${item.size || 'no-size'}-${item.variant || 'no-variant'}`;
              }}
              style={styles.cartList}
            />
            <View style={styles.cartFooter}>
              <View style={styles.cartTotal}>
                <Text style={styles.cartTotalText}>
                  Total: ${total.toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.checkoutButton}
                onPress={() => router.push('/checkout')}
              >
                <Text style={styles.checkoutButtonText}>Checkout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CartPage;
