import {
  ArrowLeft,
  Menu,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
} from 'lucide-react-native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useShopping } from '@/hooks/useShopping';
import { Theme } from '@/types/Theme';
import { useEffect, useCallback, useRef, useState } from 'react';
import { CartItem } from '@/types/Cart';
import { Product } from '@/types/Product';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingVertical: -100,
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
    cartSummary: {
      backgroundColor: theme.card,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    cartSummaryText: {
      fontSize: 16,
      color: theme.text,
      marginBottom: 8,
    },
    cartTotal: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    cartItem: {
      backgroundColor: theme.card,
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
    },
    cartItemImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
      backgroundColor: theme.border,
      marginRight: 16,
    },
    cartItemInfo: {
      flex: 1,
      justifyContent: 'space-between',
    },
    cartItemName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    cartItemDetails: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    cartItemPrice: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
    },
    cartItemPriceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cartItemOriginalPrice: {
      fontSize: 14,
      color: theme.textSecondary,
      textDecorationLine: 'line-through',
      marginRight: 8,
    },
    cartItemDiscountedPrice: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
    },
    cartItemDiscountBadge: {
      backgroundColor: theme.accent,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginLeft: 8,
    },
    cartItemDiscountText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#000',
    },
    cartItemActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderRadius: 8,
      padding: 4,
    },
    quantityButton: {
      width: 32,
      height: 32,
      borderRadius: 6,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      textAlign: 'center',
    },
    quantityTextContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      minWidth: 20,
      justifyContent: 'center',
    },
    removeButton: {
      padding: 8,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    emptyTitle: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    emptyMessage: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    shopButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    shopButtonText: {
      color: '#000',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    checkoutContainer: {
      backgroundColor: theme.card,
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    checkoutButton: {
      backgroundColor: theme.text,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    checkoutButtonText: {
      color: theme.background,
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

export default function Cart() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    getCartItemCount,
    fetchCart,
  } = useShopping();

  const styles = createStyles(theme);

  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());

  const updateQuantityTimeoutRef = useRef<any>(null);
  const removeItemTimeoutRef = useRef<any>(null);

  const debouncedUpdateQuantity = useCallback(
    (productId: string, quantity: number, size?: string, variant?: string) => {
      const key = `${productId}-${size || ''}-${variant || ''}`;

      setPendingUpdates((prev) => new Set(prev.add(key)));

      if (updateQuantityTimeoutRef.current) {
        clearTimeout(updateQuantityTimeoutRef.current);
      }

      updateQuantityTimeoutRef.current = setTimeout(() => {
        updateCartQuantity(productId, quantity, size, variant);
        setPendingUpdates((prev) => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }, 500);
    },
    [updateCartQuantity]
  );

  const debouncedRemoveFromCart = useCallback(
    (productId: string, size?: string, variant?: string) => {
      const key = `${productId}-${size || ''}-${variant || ''}`;

      setPendingUpdates((prev) => new Set(prev.add(key)));

      if (removeItemTimeoutRef.current) {
        clearTimeout(removeItemTimeoutRef.current);
      }

      removeItemTimeoutRef.current = setTimeout(() => {
        removeFromCart(productId, size, variant);
        setPendingUpdates((prev) => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }, 300);
    },
    [removeFromCart]
  );

  useEffect(() => {
    return () => {
      if (updateQuantityTimeoutRef.current) {
        clearTimeout(updateQuantityTimeoutRef.current);
      }
      if (removeItemTimeoutRef.current) {
        clearTimeout(removeItemTimeoutRef.current);
      }
    };
  }, []);

  const hasPendingUpdate = useCallback(
    (productId: string, size?: string, variant?: string) => {
      const key = `${productId}-${size || ''}-${variant || ''}`;
      return pendingUpdates.has(key);
    },
    [pendingUpdates]
  );

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const renderCartItemPrice = (product: Product) => {
    if (product.discount && product.discount > 0) {
      const discountedPrice = product.price * (1 - product.discount / 100);
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
              {product.discount}% OFF
            </Text>
          </View>
        </View>
      );
    } else {
      return (
        <Text style={styles.cartItemPrice}>${product.price.toFixed(2)}</Text>
      );
    }
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <ShoppingBag size={48} color={theme.text} strokeWidth={2} />
      </View>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptyMessage}>
        Discover amazing products from local shops and add them to your cart to
        get started.
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => router.push('/(tabs)/explore')}
      >
        <ShoppingBag size={20} color="#000" />
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const product = item.productId as Product;
    const isPending = hasPendingUpdate(product._id, item.size, item.variant);

    return (
      <View
        style={[
          styles.cartItem,
          isPending && { opacity: 0.7, backgroundColor: theme.accentSecondary },
        ]}
      >
        <Image
          source={{ uri: product.imageUrl?.[0] }}
          style={styles.cartItemImage}
          resizeMode="cover"
        />

        <View style={styles.cartItemInfo}>
          <Text style={styles.cartItemName} numberOfLines={2}>
            {product.name}
          </Text>

          {(item.size || item.variant) && (
            <Text style={styles.cartItemDetails}>
              {item.size && `Size: ${item.size}`}
              {item.size && item.variant && ' • '}
              {item.variant && `Color: ${item.variant}`}
            </Text>
          )}

          {renderCartItemPrice(product)}

          <View style={styles.cartItemActions}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => {
                  if (item.quantity > 1) {
                    debouncedUpdateQuantity(
                      product._id,
                      item.quantity - 1,
                      item.size,
                      item.variant
                    );
                  } else {
                    Alert.alert(
                      'Remove Item',
                      'Do you want to remove this item from your cart?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: () =>
                            debouncedRemoveFromCart(
                              product._id,
                              item.size,
                              item.variant
                            ),
                        },
                      ]
                    );
                  }
                }}
              >
                <Minus size={16} color="#000" strokeWidth={3} />
              </TouchableOpacity>

              <View style={styles.quantityTextContainer}>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                {isPending && (
                  <ActivityIndicator
                    size="small"
                    color={theme.primary}
                    style={{ marginLeft: 4 }}
                  />
                )}
              </View>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() =>
                  debouncedUpdateQuantity(
                    product._id,
                    item.quantity + 1,
                    item.size,
                    item.variant
                  )
                }
              >
                <Plus size={16} color="#000" strokeWidth={3} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => {
                Alert.alert(
                  'Remove Item',
                  'Do you want to remove this item from your cart?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Remove',
                      style: 'destructive',
                      onPress: () =>
                        debouncedRemoveFromCart(
                          product._id,
                          item.size,
                          item.variant
                        ),
                    },
                  ]
                );
              }}
            >
              <Trash2 size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <View style={styles.headerButton} />
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <AlertCircle size={48} color={theme.text} strokeWidth={2} />
          </View>
          <Text style={styles.emptyTitle}>Sign in to view your cart</Text>
          <Text style={styles.emptyMessage}>
            Please sign in to access your shopping cart and saved items.
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.shopButtonText}>Sign In</Text>
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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          {pendingUpdates.size > 0 && (
            <ActivityIndicator
              size="small"
              color={theme.primary}
              style={{ marginLeft: 8 }}
            />
          )}
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Menu size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {cart && cart.length > 0 && (
        <View style={styles.cartSummary}>
          <Text style={styles.cartSummaryText}>
            {getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'}{' '}
            in your cart
          </Text>
          <Text style={styles.cartTotal}>
            Total: ${getCartTotal().toFixed(2)}
          </Text>
        </View>
      )}

      <FlatList
        data={cart}
        renderItem={renderCartItem}
        keyExtractor={(item, index) =>
          `${item.productId._id}-${item.size || 'no-size'}-${
            item.variant || 'no-variant'
          }-${index}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          cart && cart.length > 0 ? { paddingBottom: 100 } : { flex: 1 }
        }
        ListEmptyComponent={renderEmptyCart}
      />

      {cart && cart.length > 0 && (
        <View style={styles.checkoutContainer}>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => router.push('/checkout')}
          >
            <Text style={styles.checkoutButtonText}>
              Proceed to Checkout • ${getCartTotal().toFixed(2)}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
