import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Check,
  Truck,
  Phone,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useShopping } from '@/hooks/useShopping';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services';
import { Theme } from '@/types/Theme';
import { Product } from '@/types/Product';
import { CartItem } from '@/types/Cart';
import * as WebBrowser from 'expo-web-browser';

interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: 'cod' | 'card' | 'bkash';
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: -100,
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
    headerRight: {
      width: 40,
    },
    scrollContainer: {
      paddingBottom: 120,
    },
    section: {
      marginBottom: 24,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 16,
      marginTop: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    sectionIcon: {
      marginRight: 12,
    },
    orderSummary: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    orderItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    orderItemImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: 12,
      resizeMode: 'cover',
    },
    orderItemInfo: {
      flex: 1,
    },
    orderItemName: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 4,
    },
    orderItemDetails: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginBottom: 4,
    },
    orderItemPrice: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    orderItemQuantity: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    summaryLabel: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    summaryValue: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    summaryTotal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      marginTop: 8,
    },
    summaryTotalLabel: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    summaryTotalValue: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.accent,
    },
    formContainer: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 8,
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      backgroundColor: theme.background,
    },
    paymentMethods: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    paymentMethod: {
      flex: 1,
      borderWidth: 2,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    paymentMethodActive: {
      borderColor: theme.accent,
      backgroundColor: theme.accentSecondary,
    },
    paymentMethodIcon: {
      marginBottom: 8,
    },
    paymentMethodText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      textAlign: 'center',
    },
    checkoutFooter: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.background,
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    placeOrderButton: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
    },
    placeOrderButtonDisabled: {
      backgroundColor: theme.textSecondary,
    },
    placeOrderButtonText: {
      color: '#000',
      fontSize: 18,
      fontFamily: 'Inter-Bold',
    },
    discountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
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
    emptyCartContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyCartText: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 24,
      textAlign: 'center',
    },
    continueShoppingButton: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 32,
      alignItems: 'center',
      minWidth: 200,
      maxWidth: 280,
    },
  });

const CheckoutPage = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { cart, fetchCart } = useShopping();
  const { user, token } = useAuth();

  const [form, setForm] = useState<CheckoutForm>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cod',
  });

  const [isValid, setIsValid] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city'];
    const allFieldsFilled = requiredFields.every(
      (field) => form[field as keyof CheckoutForm]?.trim() !== ''
    );
    setIsValid(allFieldsFilled);
  }, [form]);

  const updateForm = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const calculateSubtotal = () => {
    return cart.reduce((total: number, item: CartItem) => {
      const product = item.productId as Product;
      const itemPrice =
        product.discount && product.discount > 0
          ? product.price - (product.price * product.discount) / 100
          : product.price;
      return total + itemPrice * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shippingFee = subtotal > 100 ? 0 : 10;
  const total = subtotal + shippingFee;

  const getDiscountedPrice = (price: number, discount?: number) => {
    if (!discount || discount <= 0) return null;
    return price - (price * discount) / 100;
  };

  const renderPriceWithDiscount = (product: Product, quantity: number) => {
    const hasDiscount = product.discount && product.discount > 0;
    const discountedPrice = hasDiscount
      ? getDiscountedPrice(product.price, product.discount)
      : null;

    if (hasDiscount && discountedPrice) {
      return (
        <View>
          <View style={styles.discountContainer}>
            <Text style={styles.originalPrice}>
              ${(product.price * quantity).toFixed(2)}
            </Text>
            <Text style={styles.discountedPrice}>
              ${(discountedPrice * quantity).toFixed(2)}
            </Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <Text style={styles.orderItemPrice}>
          ${(product.price * quantity).toFixed(2)}
        </Text>
      );
    }
  };

  const handlePlaceOrder = async () => {
    if (!isValid || isPlacingOrder) return;

    setIsPlacingOrder(true);

    try {
      const orderData = {
        shippingAddress: {
          name: form.fullName,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          phone: form.phone,
          email: form.email,
        },
        paymentMethod: form.paymentMethod,
      };

      if (!token) {
        Alert.alert('Error', 'Authentication required. Please log in again.');
        return;
      }

      const response = await orderService.createOrder(orderData, token);

      if (!response.status) throw new Error(response.message);

      if (form.paymentMethod === 'cod') {
        await fetchCart();
        Alert.alert(
          'Order Placed Successfully!',
          `Order #${response.order.orderNumber} has been placed. You will receive updates via email.`,
          [
            {
              text: 'View Order',
              onPress: () => router.push(`/order/${response.order._id}`),
            },
            {
              text: 'Continue Shopping',
              onPress: () => router.push('/shopping'),
            },
          ]
        );
      } else if (form.paymentMethod === 'card') {
        const stripeResponse = await orderService.createStripeSession(response.order._id, token);
        const { sessionUrl } = stripeResponse;

        if (sessionUrl) {
          await WebBrowser.openBrowserAsync(sessionUrl);
        } else {
          alert('Failed to start Stripe payment.');
        }
      }
    } catch {
      Alert.alert(
        'Order Failed',
        'There was an error placing your order. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const renderOrderSummary = () => (
    <View style={styles.section}>
      <View style={styles.sectionTitle}>
        <Truck size={24} color={theme.text} style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>Order Summary</Text>
      </View>
      <View style={styles.orderSummary}>
        {cart.map((item: CartItem) => {
          const product = item.productId as Product;
          return (
            <View
              key={`${product._id}-${item.size}-${item.variant}`}
              style={styles.orderItem}
            >
              <Image
                source={{ uri: product.imageUrl[0] }}
                style={styles.orderItemImage}
              />
              <View style={styles.orderItemInfo}>
                <Text style={styles.orderItemName}>{product.name}</Text>
                <Text style={styles.orderItemDetails}>
                  {item.size && `${item.size}${item.variant ? ' • ' : ''}`}
                  {item.variant}
                </Text>
                <Text style={styles.orderItemQuantity}>
                  Qty: {item.quantity}
                </Text>
              </View>
              <View>{renderPriceWithDiscount(product, item.quantity)}</View>
            </View>
          );
        })}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}
          </Text>
        </View>
        <View style={styles.summaryTotal}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  const renderShippingForm = () => (
    <View style={styles.section}>
      <View style={styles.sectionTitle}>
        <MapPin size={24} color={theme.text} style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>Shipping Address</Text>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            value={form.fullName}
            onChangeText={(value) => updateForm('fullName', value)}
            placeholder="Enter your full name"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.textInput}
            value={form.email}
            onChangeText={(value) => updateForm('email', value)}
            placeholder="Enter your email"
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.textInput}
            value={form.phone}
            onChangeText={(value) => updateForm('phone', value)}
            placeholder="Enter your phone number"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Address</Text>
          <TextInput
            style={styles.textInput}
            value={form.address}
            onChangeText={(value) => updateForm('address', value)}
            placeholder="Enter your street address"
            placeholderTextColor={theme.textSecondary}
            multiline
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>City</Text>
          <TextInput
            style={styles.textInput}
            value={form.city}
            onChangeText={(value) => updateForm('city', value)}
            placeholder="Enter your city"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Postal Code (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={form.postalCode}
            onChangeText={(value) => updateForm('postalCode', value)}
            placeholder="Enter postal code"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const renderPaymentMethods = () => (
    <View style={[styles.section, { marginBottom: 80 }]}>
      <View style={styles.sectionTitle}>
        <CreditCard size={24} color={theme.text} style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>Payment Method</Text>
      </View>
      <View style={styles.paymentMethods}>
        <TouchableOpacity
          style={[
            styles.paymentMethod,
            form.paymentMethod === 'cod' && styles.paymentMethodActive,
          ]}
          onPress={() => updateForm('paymentMethod', 'cod')}
        >
          <Truck
            size={24}
            color={theme.text}
            style={styles.paymentMethodIcon}
          />
          <Text style={styles.paymentMethodText}>Cash on Delivery</Text>
          {form.paymentMethod === 'cod' && (
            <Check size={16} color={theme.accent} style={{ marginTop: 4 }} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentMethod,
            form.paymentMethod === 'card' && styles.paymentMethodActive,
          ]}
          onPress={() => updateForm('paymentMethod', 'card')}
        >
          <CreditCard
            size={24}
            color={theme.text}
            style={styles.paymentMethodIcon}
          />
          <Text style={styles.paymentMethodText}>Credit/Debit Card</Text>
          {form.paymentMethod === 'card' && (
            <Check size={16} color={theme.accent} style={{ marginTop: 4 }} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentMethod,
            form.paymentMethod === 'bkash' && styles.paymentMethodActive,
          ]}
          onPress={() => updateForm('paymentMethod', 'bkash')}
        >
          <Phone
            size={24}
            color={theme.text}
            style={styles.paymentMethodIcon}
          />
          <Text style={styles.paymentMethodText}>bKash</Text>
          {form.paymentMethod === 'bkash' && (
            <Check size={16} color={theme.accent} style={{ marginTop: 4 }} />
          )}
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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerRight} />
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => router.push('/shopping')}
          >
            <Text style={styles.placeOrderButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {renderOrderSummary()}
            {renderShippingForm()}
            {renderPaymentMethods()}
          </ScrollView>

          <View style={styles.checkoutFooter}>
            <TouchableOpacity
              style={[
                styles.placeOrderButton,
                (!isValid || isPlacingOrder) && styles.placeOrderButtonDisabled,
              ]}
              onPress={handlePlaceOrder}
              disabled={!isValid || isPlacingOrder}
            >
              <Text style={styles.placeOrderButtonText}>
                {isPlacingOrder
                  ? 'Placing Order...'
                  : `Place Order • $${total.toFixed(2)}`}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default CheckoutPage;
