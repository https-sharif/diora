import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Clock,
  Truck,
  CheckCircle,
  X,
  Package,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/types/Theme';
import { orderService } from '@/services/orderService';

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  shippingFee: number;
  paymentMethod: 'cod' | 'card' | 'bkash';
  paymentStatus: 'pending' | 'paid' | 'failed';
  items: {
    _id: string;
    productId: {
      _id: string;
      name: string;
      imageUrl: string[];
    };
    name: string;
    image: string;
    quantity: number;
    price: number;
    size?: string;
    variant?: string;
  }[];
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode?: string;
    phone: string;
    email: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
}

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
    headerRight: {
      width: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 18,
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    errorText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    retryButton: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    retryButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: '#000',
    },
    content: {
      flex: 1,
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
      flexDirection: 'row',
      alignItems: 'center',
    },
    sectionIcon: {
      marginRight: 8,
    },
    orderNumberContainer: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      alignItems: 'center',
    },
    orderNumber: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    orderDate: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 4,
    },
    statusContainer: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginBottom: 8,
    },
    statusText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      marginLeft: 8,
    },
    infoContainer: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    infoLabel: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    infoValue: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    itemsContainer: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
    },
    orderItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    itemImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: 12,
      resizeMode: 'cover',
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 4,
    },
    itemVariant: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginBottom: 4,
    },
    itemPrice: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    itemTotal: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    addressContainer: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
    },
    addressText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      lineHeight: 24,
      marginBottom: 12,
    },
    contactText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      lineHeight: 20,
    },
    summaryContainer: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
    totalRow: {
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      marginTop: 8,
    },
    totalLabel: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    totalValue: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.accent,
    },
    actionsContainer: {
      paddingHorizontal: 16,
      marginBottom: 32,
    },
    cancelButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FF3B30',
      borderRadius: 12,
      paddingVertical: 16,
    },
    cancelButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: '#fff',
      marginLeft: 8,
    },
  });

const OrderDetailsScreen = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { orderId } = useLocalSearchParams() as { orderId: string };
  const { token } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId || !token) {
      setError('Order ID or authentication token missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await orderService.getOrderById(orderId, token);

      if (response.status) {
        setOrder(response.order);
        setError(null);
      } else {
        setError('Order not found');
      }
    } catch {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId, token]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleCancelOrder = async () => {
    if (!order || !token) return;

    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          if (!token) return;
          try {
            const response = await orderService.cancelOrder(order._id, token);

            if (response.status) {
              setOrder((prev) =>
                prev ? { ...prev, status: 'cancelled' } : null
              );
              Alert.alert('Success', 'Order has been cancelled');
            }
          } catch {
            Alert.alert('Error', 'Failed to cancel order');
          }
        },
      },
    ]);
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return <Clock size={16} color="#FF9500" />;
      case 'confirmed':
        return <CheckCircle size={16} color="#007AFF" />;
      case 'shipped':
        return <Truck size={16} color="#007AFF" />;
      case 'delivered':
        return <CheckCircle size={16} color="#4CAF50" />;
      case 'cancelled':
        return <X size={16} color="#FF3B30" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return '#FF9500';
      case 'confirmed':
        return '#007AFF';
      case 'shipped':
        return '#007AFF';
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#FF3B30';
    }
  };

  const canCancelOrder = (order: Order) => {
    return ['processing', 'confirmed'].includes(order.status);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Order not found'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchOrderDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
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
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.orderNumberContainer}>
            <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
            <Text style={styles.orderDate}>
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status) + '20' },
              ]}
            >
              {getStatusIcon(order.status)}
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(order.status) },
                ]}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Package size={20} color={theme.text} style={styles.sectionIcon} />
            Order Information
          </Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Method</Text>
              <Text style={styles.infoValue}>
                {order.paymentMethod === 'cod'
                  ? 'Cash on Delivery'
                  : order.paymentMethod === 'card'
                  ? 'Credit/Debit Card'
                  : 'bKash'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Status</Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color:
                      order.paymentStatus === 'paid'
                        ? '#4CAF50'
                        : order.paymentStatus === 'failed'
                        ? '#FF3B30'
                        : '#FF9500',
                  },
                ]}
              >
                {order.paymentStatus.charAt(0).toUpperCase() +
                  order.paymentStatus.slice(1)}
              </Text>
            </View>
            {order.trackingNumber && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tracking Number</Text>
                <Text style={styles.infoValue}>{order.trackingNumber}</Text>
              </View>
            )}
            {order.estimatedDelivery && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estimated Delivery</Text>
                <Text style={styles.infoValue}>
                  {new Date(order.estimatedDelivery).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
          <View style={styles.itemsContainer}>
            {order.items.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.orderItem,
                  index === order.items.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {(item.size || item.variant) && (
                    <Text style={styles.itemVariant}>
                      {item.size && `Size: ${item.size}`}
                      {item.size && item.variant && ' • '}
                      {item.variant && `Color: ${item.variant}`}
                    </Text>
                  )}
                  <Text style={styles.itemPrice}>
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  ${(item.quantity * item.price).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MapPin size={20} color={theme.text} style={styles.sectionIcon} />
            Shipping Address
          </Text>
          <View style={styles.addressContainer}>
            <Text style={styles.addressText}>
              {order.shippingAddress.name}
              {'\n'}
              {order.shippingAddress.address}
              {'\n'}
              {order.shippingAddress.city}
              {order.shippingAddress.postalCode &&
                `, ${order.shippingAddress.postalCode}`}
            </Text>
            <Text style={styles.contactText}>
              <Phone size={14} color={theme.textSecondary} />{' '}
              {order.shippingAddress.phone}
              {'\n'}
              <Mail size={14} color={theme.textSecondary} />{' '}
              {order.shippingAddress.email}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ${order.subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>
                {order.shippingFee === 0
                  ? 'Free'
                  : `$${order.shippingFee.toFixed(2)}`}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {canCancelOrder(order) && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelOrder}
            >
              <X size={16} color="#fff" />
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetailsScreen;
