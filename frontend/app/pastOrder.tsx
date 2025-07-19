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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
} from 'lucide-react-native';
import { Order } from '@/types/Order';
import { mockOrders } from '@/mock/Order';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/types/Theme';

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
      borderBottomColor: theme.card,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    menuButton: {
      padding: 8,
    },
    filterContainer: {
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.card,
      height: 60,
      flexGrow: 0,
    },
    filterContent: {
      paddingHorizontal: 16,
      gap: 8,
      height: 40,
      flexGrow: 0,
      flexShrink: 0,
      paddingVertical: 10,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: '#000',
      height: 40,
    },
    activeFilterChip: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
      height: 40,
    },
    filterChipText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
    activeFilterChipText: {
      color: '#000',
    },
    ordersList: {
      padding: 16,
      paddingBottom: 100,
    },
    orderCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: theme.text,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    orderInfo: {
      flex: 1,
    },
    orderNumber: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    orderDate: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 2,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 6,
    },
    statusText: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
    },
    orderItems: {
      marginBottom: 16,
    },
    orderItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    orderItemImage: {
      width: 50,
      height: 50,
      borderRadius: 8,
    },
    orderItemInfo: {
      flex: 1,
      marginLeft: 12,
    },
    orderItemName: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    orderItemVariant: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 2,
    },
    orderItemPrice: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      marginTop: 2,
    },
    moreItems: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.primary,
      textAlign: 'center',
      marginTop: 8,
    },
    orderFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 16,
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
      color: theme.blue,
    },
    modalContainer: {
      height: '80%',
      backgroundColor: theme.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: 'hidden',
      flexDirection: 'column',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    modalContent: {
      flex: 1,
      padding: 16,
    },
    orderDetailsSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 12,
    },
    orderDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    orderDetailLabel: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    orderDetailValue: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    orderDetailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    orderDetailItemImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
    },
    orderDetailItemInfo: {
      flex: 1,
      marginLeft: 12,
    },
    orderDetailItemName: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    orderDetailItemVariant: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 2,
    },
    orderDetailItemPrice: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      marginTop: 4,
    },
    orderDetailItemTotal: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    addressText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      lineHeight: 20,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 16,
      borderTopWidth: 2,
      borderTopColor: theme.border,
    },
    totalLabel: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    totalValue: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    orderActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
      marginBottom: 48,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
      borderRadius: 12,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: theme.blue,
      gap: 8,
    },
    actionButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.blue,
    },
    cancelButton: {
      backgroundColor: theme.background,
      borderColor: theme.error,
    },
    cancelButtonText: {
      color: theme.error,
    },
  });
};

export default function PastOrderScreen() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState<
    'all' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  >('all');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return <Clock size={16} color="#FF9500" />;
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
      case 'shipped':
        return '#007AFF';
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#FF3B30';
    }
  };

  const getPaymentMethodIcon = (paymentMethod: Order['paymentMethod']) => {
    switch (paymentMethod) {
      case 'cod':
        return <Banknote size={16} color={theme.blue} />;
      case 'card':
        return <CreditCard size={16} color={theme.blue} />;
      case 'bkash':
        return <Wallet size={16} color={theme.blue} />;
    }
  };

  useEffect(() => {
    if (user) {
      setOrders(mockOrders.filter((order) => order.userId === user._id));
    }
  }, [user]);

  const filteredOrders = orders.filter(
    (order) => orderFilter === 'all' || order.status === orderFilter
  );

  const handleCancelOrder = (orderId: string) => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => {
          setOrders((prev) =>
            prev.map((order) =>
              order.id === orderId ? { ...order, status: 'cancelled' } : order
            )
          );
          Alert.alert('Success', 'Order has been cancelled');
        },
      },
    ]);
  };

  const handleDownloadInvoice = (order: Order) => {
    Alert.alert(
      'Download Invoice',
      `Invoice for order ${order.orderNumber} will be downloaded`
    );
  };

  const renderCustomerOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => {
        setSelectedOrder(item);
        setShowOrderDetails(true);
      }}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
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
              <Text style={styles.orderItemVariant}>{orderItem.variant}</Text>
              <Text style={styles.orderItemPrice}>
                Qty: {orderItem.quantity}
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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Past Orders</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Menu size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map(
          (filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                orderFilter === filter && styles.activeFilterChip,
              ]}
              onPress={() => setOrderFilter(filter as any)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  orderFilter === filter && styles.activeFilterChipText,
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      <FlatList
        data={filteredOrders}
        renderItem={renderCustomerOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
      />

      {/* Order Details Modal */}
      <Modal
        visible={showOrderDetails}
        animationType="slide"
        onRequestClose={() => setShowOrderDetails(false)}
        transparent
      >
        <TouchableWithoutFeedback onPress={() => setShowOrderDetails(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              {selectedOrder && (
                <SafeAreaView style={styles.modalContainer}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Order Details</Text>
                    <TouchableOpacity
                      onPress={() => setShowOrderDetails(false)}
                    >
                      <X size={24} color="#000" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    style={styles.modalContent}
                    showsVerticalScrollIndicator={false}
                  >
                    <TouchableWithoutFeedback onPress={() => {}}>
                      <View style={styles.orderDetailsSection}>
                        <View style={styles.orderDetailRow}>
                          <Text style={styles.sectionTitle}>
                            Order Information
                          </Text>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor:
                                  getStatusColor(selectedOrder.status) + '20',
                              },
                            ]}
                          >
                            {getStatusIcon(selectedOrder.status)}
                            <Text
                              style={[
                                styles.statusText,
                                { color: getStatusColor(selectedOrder.status) },
                              ]}
                            >
                              {selectedOrder.status.charAt(0).toUpperCase() +
                                selectedOrder.status.slice(1)}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.orderDetailRow}>
                          <Text style={styles.orderDetailLabel}>
                            Order Number:
                          </Text>
                          <Text style={styles.orderDetailValue}>
                            {selectedOrder.orderNumber}
                          </Text>
                        </View>
                        <View style={styles.orderDetailRow}>
                          <Text style={styles.orderDetailLabel}>Date:</Text>
                          <Text style={styles.orderDetailValue}>
                            {new Date(
                              selectedOrder.timestamp
                            ).toLocaleDateString()}
                          </Text>
                        </View>
                        {selectedOrder.trackingNumber && (
                          <View style={styles.orderDetailRow}>
                            <Text style={styles.orderDetailLabel}>
                              Tracking:
                            </Text>
                            <Text style={styles.orderDetailValue}>
                              {selectedOrder.trackingNumber}
                            </Text>
                          </View>
                        )}
                        {selectedOrder.estimatedDelivery && (
                          <View style={styles.orderDetailRow}>
                            <Text style={styles.orderDetailLabel}>
                              Estimated Delivery:
                            </Text>
                            <Text style={styles.orderDetailValue}>
                              {new Date(
                                selectedOrder.estimatedDelivery
                              ).toLocaleDateString()}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableWithoutFeedback>

                    {/* Items */}
                    <TouchableWithoutFeedback onPress={() => {}}>
                      <View style={styles.orderDetailsSection}>
                        <Text style={styles.sectionTitle}>Items</Text>
                        {selectedOrder.items.map((item, index) => (
                          <View key={index} style={styles.orderDetailItem}>
                            <Image
                              source={{ uri: item.image }}
                              style={styles.orderDetailItemImage}
                            />
                            <View style={styles.orderDetailItemInfo}>
                              <Text style={styles.orderDetailItemName}>
                                {item.name}
                              </Text>
                              <Text style={styles.orderDetailItemVariant}>
                                {item.variant}
                              </Text>
                              <Text style={styles.orderDetailItemPrice}>
                                Qty: {item.quantity}
                              </Text>
                            </View>
                            <Text style={styles.orderDetailItemTotal}>
                              ${(item.quantity * item.price).toFixed(2)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </TouchableWithoutFeedback>

                    {/* Shipping Address */}
                    <TouchableWithoutFeedback onPress={() => {}}>
                      <View style={styles.orderDetailsSection}>
                        <Text style={styles.sectionTitle}>
                          Shipping Address
                        </Text>
                        <Text style={styles.addressText}>
                          {selectedOrder.shippingAddress.name}
                          {'\n'}
                          {selectedOrder.shippingAddress.address}
                          {'\n'}
                          {selectedOrder.shippingAddress.city}
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>

                    {/* Order Total */}
                    <TouchableWithoutFeedback onPress={() => {}}>
                      <View style={styles.orderDetailsSection}>
                        <View style={styles.totalRow}>
                          <Text style={styles.totalLabel}>Total</Text>
                          <Text style={styles.totalValue}>
                            ${selectedOrder.total.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>

                    {/* Actions */}
                    <View style={styles.orderActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDownloadInvoice(selectedOrder)}
                      >
                        <Download size={16} color={theme.blue} />
                        <Text style={styles.actionButtonText}>
                          Download Invoice
                        </Text>
                      </TouchableOpacity>

                      {selectedOrder.canCancel && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.cancelButton]}
                          onPress={() => {
                            handleCancelOrder(selectedOrder.id);
                            setShowOrderDetails(false);
                          }}
                        >
                          <X size={16} color={theme.error} />
                          <Text
                            style={[
                              styles.actionButtonText,
                              styles.cancelButtonText,
                            ]}
                          >
                            Cancel Order
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </ScrollView>
                </SafeAreaView>
              )}
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
