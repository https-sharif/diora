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
  TouchableWithoutFeedback,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Truck,
  CircleCheck as CheckCircle,
  Clock,
  Filter,
  Download,
  X,
  CreditCard,
  Wallet,
  Banknote,
  Menu,
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/types/Theme';
import { API_URL } from '@/constants/api';
import axios from 'axios';

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
  items: Array<{
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
  }>;
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

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
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
      paddingVertical: 16,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    headerRight: {
      flexDirection: 'row',
      gap: 12,
    },
    headerButton: {
      padding: 8,
    },
    filterContainer: {
      backgroundColor: theme.card,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    filterScrollView: {
      flexDirection: 'row',
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
    },
    filterChipActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    filterChipText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
    filterChipTextActive: {
      color: '#000',
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
      marginTop: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyText: {
      fontSize: 18,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    emptySubtext: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      textAlign: 'center',
    },
    ordersList: {
      flex: 1,
    },
    orderCard: {
      backgroundColor: theme.card,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    orderInfo: {
      flex: 1,
    },
    orderNumber: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 4,
    },
    orderDate: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    customerInfo: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.text,
      marginTop: 2,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 6,
    },
    statusText: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
    },
    orderItems: {
      marginBottom: 12,
    },
    orderItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    orderItemImage: {
      width: 40,
      height: 40,
      borderRadius: 8,
      marginRight: 12,
    },
    orderItemInfo: {
      flex: 1,
    },
    orderItemName: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 2,
    },
    orderItemVariant: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginBottom: 2,
    },
    orderItemPrice: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    moreItems: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      fontStyle: 'italic',
      marginTop: 4,
    },
    orderFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    orderTotal: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    trackingNumber: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    orderActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
    },
    actionButton: {
      flex: 1,
      backgroundColor: theme.accent,
      borderRadius: 8,
      paddingVertical: 8,
      alignItems: 'center',
    },
    actionButtonSecondary: {
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
    },
    actionButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: '#000',
    },
    actionButtonTextSecondary: {
      color: theme.text,
    },
  });
};

export default function PastOrderScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState<
    'all' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  >('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const filterOptions = [
    { key: 'all', label: 'All Orders' },
    { key: 'processing', label: 'Processing' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Check if user is a shop owner
      const endpoint = user?.type === 'shop' ? `${API_URL}/api/order/shop` : `${API_URL}/api/order`;
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
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

  const filteredOrders = orders.filter(
    (order) => orderFilter === 'all' || order.status === orderFilter
  );

  const handleOrderPress = (order: Order) => {
    router.push(`/order/${order._id}`);
  };

  const handleUpdateOrderStatus = (order: Order) => {
    Alert.alert(
      'Update Order Status',
      'Choose the new status for this order:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Order',
          onPress: () => updateOrderStatus(order._id, 'confirmed'),
        },
        {
          text: 'Mark as Shipped',
          onPress: () => updateOrderStatus(order._id, 'shipped'),
        },
        {
          text: 'Mark as Delivered',
          onPress: () => updateOrderStatus(order._id, 'delivered'),
        },
      ]
    );
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/order/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        // Update the local state
        setOrders(prev => 
          prev.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus as any }
              : order
          )
        );
        Alert.alert('Success', `Order status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard} onPress={() => handleOrderPress(item)}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          {/* Show customer info for shop owners */}
          {user?.type === 'shop' && (item as any).customer && (
            <Text style={styles.customerInfo}>
              Customer: {(item as any).customer[0]?.fullName || 'N/A'}
            </Text>
          )}
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          {getStatusIcon(item.status)}
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {item.items.slice(0, 2).map((orderItem, index) => (
          <View key={index} style={styles.orderItemRow}>
            <Image
              source={{ uri: orderItem.image }}
              style={styles.orderItemImage}
            />
            <View style={styles.orderItemInfo}>
              <Text style={styles.orderItemName} numberOfLines={1}>
                {orderItem.name}
              </Text>
              {(orderItem.size || orderItem.variant) && (
                <Text style={styles.orderItemVariant}>
                  {orderItem.size && `Size: ${orderItem.size}`}
                  {orderItem.size && orderItem.variant && ' • '}
                  {orderItem.variant && `Color: ${orderItem.variant}`}
                </Text>
              )}
              <Text style={styles.orderItemPrice}>
                Qty: {orderItem.quantity} × ${orderItem.price.toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
        {item.items.length > 2 && (
          <Text style={styles.moreItems}>
            + {item.items.length - 2} more items
          </Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>Total: ${item.total.toFixed(2)}</Text>
        {item.trackingNumber && (
          <Text style={styles.trackingNumber}>
            Tracking: {item.trackingNumber}
          </Text>
        )}
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleOrderPress(item)}
        >
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
        {user?.type === 'shop' && ['processing', 'confirmed'].includes(item.status) ? (
          <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => handleUpdateOrderStatus(item)}
          >
            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
              Update Status
            </Text>
          </TouchableOpacity>
        ) : item.status === 'delivered' && user?.type !== 'shop' ? (
          <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => Alert.alert('Feature Coming Soon', 'Reorder functionality will be available soon!')}
          >
            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
              Reorder
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {user?.type === 'shop' ? 'Shop Orders' : 'Past Orders'}
            </Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <Package size={48} color={theme.textSecondary} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Past Orders</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => Alert.alert('Feature Coming Soon', 'Export functionality will be available soon!')}
          >
            <Download size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollView}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                orderFilter === filter.key && styles.filterChipActive,
              ]}
              onPress={() => setOrderFilter(filter.key as any)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  orderFilter === filter.key && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Package size={64} color={theme.textSecondary} />
          <Text style={styles.emptyText}>
            {orderFilter === 'all' ? 'No orders yet' : `No ${orderFilter} orders`}
          </Text>
          <Text style={styles.emptySubtext}>
            {orderFilter === 'all' 
              ? 'Start shopping to see your orders here!'
              : 'Try changing the filter to see other orders.'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.ordersList}
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}
