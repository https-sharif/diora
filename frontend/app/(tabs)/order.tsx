import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Truck, CircleCheck as CheckCircle, Clock, Filter, Download, X, Search, Calendar, DollarSign, MapPin, Phone, Mail, Star, TrendingUp, Users, ShoppingCart, ChartBar as BarChart3, Settings, Plus, CreditCard as Edit, Trash2, Eye, CircleAlert as AlertCircle, RefreshCw, Tag, Percent, Gift, Target } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
    variant?: string;
  }>;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
  canCancel: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  sku: string;
  stock: number;
  variants: Array<{
    id: string;
    name: string;
    options: string[];
  }>;
  isActive: boolean;
  sales: number;
}

interface ShopAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  recentOrders: Order[];
  salesTrend: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    date: '2024-01-15',
    status: 'shipped',
    total: 129.99,
    items: [
      {
        id: '1',
        name: 'Vintage Denim Jacket',
        image: 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=300',
        quantity: 1,
        price: 89.99,
        variant: 'Size: M, Color: Blue'
      },
      {
        id: '2',
        name: 'Classic Sneakers',
        image: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=300',
        quantity: 1,
        price: 40.00,
        variant: 'Size: 9, Color: White'
      }
    ],
    shippingAddress: {
      name: 'John Doe',
      address: '123 Fashion St',
      city: 'New York',
      zipCode: '10001',
      country: 'USA'
    },
    trackingNumber: 'TRK123456789',
    estimatedDelivery: '2024-01-20',
    canCancel: false
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    date: '2024-01-18',
    status: 'processing',
    total: 79.99,
    items: [
      {
        id: '3',
        name: 'Silk Scarf',
        image: 'https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=300',
        quantity: 2,
        price: 39.99,
        variant: 'Color: Red'
      }
    ],
    shippingAddress: {
      name: 'John Doe',
      address: '123 Fashion St',
      city: 'New York',
      zipCode: '10001',
      country: 'USA'
    },
    estimatedDelivery: '2024-01-25',
    canCancel: true
  }
];

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Vintage Denim Jacket',
    description: 'Classic vintage-style denim jacket perfect for layering.',
    price: 89.99,
    images: [
      'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    category: 'Outerwear',
    sku: 'VDJ-001',
    stock: 25,
    variants: [
      { id: '1', name: 'Size', options: ['S', 'M', 'L', 'XL'] },
      { id: '2', name: 'Color', options: ['Blue', 'Black', 'White'] }
    ],
    isActive: true,
    sales: 156
  },
  {
    id: '2',
    name: 'Classic Sneakers',
    description: 'Comfortable classic sneakers for everyday wear.',
    price: 79.99,
    images: [
      'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    category: 'Shoes',
    sku: 'CS-002',
    stock: 12,
    variants: [
      { id: '1', name: 'Size', options: ['6', '7', '8', '9', '10', '11'] },
      { id: '2', name: 'Color', options: ['White', 'Black', 'Gray'] }
    ],
    isActive: true,
    sales: 89
  }
];

const mockAnalytics: ShopAnalytics = {
  totalRevenue: 15420.50,
  totalOrders: 127,
  totalCustomers: 89,
  averageOrderValue: 121.42,
  topProducts: [
    { id: '1', name: 'Vintage Denim Jacket', sales: 156, revenue: 14043.44 },
    { id: '2', name: 'Classic Sneakers', sales: 89, revenue: 7119.11 },
    { id: '3', name: 'Silk Scarf', sales: 67, revenue: 2679.33 }
  ],
  recentOrders: mockOrders,
  salesTrend: [
    { date: '2024-01-01', revenue: 1200, orders: 8 },
    { date: '2024-01-02', revenue: 1800, orders: 12 },
    { date: '2024-01-03', revenue: 2100, orders: 15 },
    { date: '2024-01-04', revenue: 1600, orders: 10 },
    { date: '2024-01-05', revenue: 2400, orders: 18 }
  ]
};

export default function OrdersScreen() {
  const { user } = useAuth();
  const isShopOwner = user?.type === 'shop';
  
  // Customer states
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState<'all' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  // Shop owner states
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'orders' | 'products' | 'analytics' | 'promotions'>('dashboard');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [analytics, setAnalytics] = useState<ShopAnalytics>(mockAnalytics);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showPromotionModal, setShowPromotionModal] = useState(false);

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

  const filteredOrders = orders.filter(order => 
    orderFilter === 'all' || order.status === orderFilter
  );

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            setOrders(prev => prev.map(order =>
              order.id === orderId ? { ...order, status: 'cancelled' } : order
            ));
            Alert.alert('Success', 'Order has been cancelled');
          }
        }
      ]
    );
  };

  const handleDownloadInvoice = (order: Order) => {
    Alert.alert('Download Invoice', `Invoice for order ${order.orderNumber} will be downloaded`);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setProducts(prev => prev.filter(p => p.id !== productId));
          }
        }
      ]
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
          <Text style={styles.orderDate}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderItems}>
        {item.items.slice(0, 2).map((orderItem, index) => (
          <View key={index} style={styles.orderItemRow}>
            <Image source={{ uri: orderItem.image }} style={styles.orderItemImage} />
            <View style={styles.orderItemInfo}>
              <Text style={styles.orderItemName} numberOfLines={1}>{orderItem.name}</Text>
              <Text style={styles.orderItemVariant}>{orderItem.variant}</Text>
              <Text style={styles.orderItemPrice}>Qty: {orderItem.quantity} × ${orderItem.price}</Text>
            </View>
          </View>
        ))}
        {item.items.length > 2 && (
          <Text style={styles.moreItems}>+{item.items.length - 2} more items</Text>
        )}
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>Total: ${item.total.toFixed(2)}</Text>
        {item.trackingNumber && (
          <Text style={styles.trackingNumber}>Tracking: {item.trackingNumber}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderShopOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.shopOrderCard}>
      <View style={styles.shopOrderHeader}>
        <View>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.orderDate}>{new Date(item.date).toLocaleDateString()}</Text>
          <Text style={styles.customerName}>{item.shippingAddress.name}</Text>
        </View>
        <View style={styles.shopOrderActions}>
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: getStatusColor(item.status) }]}
            onPress={() => {
              const statuses: Order['status'][] = ['processing', 'shipped', 'delivered'];
              const currentIndex = statuses.indexOf(item.status);
              if (currentIndex < statuses.length - 1) {
                handleUpdateOrderStatus(item.id, statuses[currentIndex + 1]);
              }
            }}
          >
            <Text style={styles.statusButtonText}>
              {item.status === 'processing' ? 'Mark Shipped' : 
               item.status === 'shipped' ? 'Mark Delivered' : 'Delivered'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.orderSummary}>
        <Text style={styles.itemCount}>{item.items.length} items</Text>
        <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.productActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setEditingProduct(item);
                setShowProductModal(true);
              }}
            >
              <Edit size={16} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteProduct(item.id)}
            >
              <Trash2 size={16} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.productSku}>SKU: {item.sku}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        <View style={styles.productStats}>
          <Text style={[styles.stockText, item.stock < 10 && styles.lowStock]}>
            Stock: {item.stock}
          </Text>
          <Text style={styles.salesText}>Sales: {item.sales}</Text>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: item.isActive ? '#4CAF50' : '#FF3B30' }]}>
          <Text style={styles.statusIndicatorText}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderAnalyticsCard = (title: string, value: string, icon: React.ReactNode, trend?: string) => (
    <View style={styles.analyticsCard}>
      <View style={styles.analyticsHeader}>
        <View style={styles.analyticsIcon}>{icon}</View>
        <Text style={styles.analyticsTitle}>{title}</Text>
      </View>
      <Text style={styles.analyticsValue}>{value}</Text>
      {trend && (
        <Text style={styles.analyticsTrend}>{trend}</Text>
      )}
    </View>
  );

  if (isShopOwner) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Shop Dashboard</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}
          contentContainerStyle={styles.tabContent}
        >
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <BarChart3 size={16} color={selectedTab === 'dashboard' ? '#fff' : '#666'} /> },
            { id: 'orders', name: 'Orders', icon: <Package size={16} color={selectedTab === 'orders' ? '#fff' : '#666'} /> },
            { id: 'products', name: 'Products', icon: <ShoppingCart size={16} color={selectedTab === 'products' ? '#fff' : '#666'} /> },
            { id: 'analytics', name: 'Analytics', icon: <TrendingUp size={16} color={selectedTab === 'analytics' ? '#fff' : '#666'} /> },
            { id: 'promotions', name: 'Promotions', icon: <Tag size={16} color={selectedTab === 'promotions' ? '#fff' : '#666'} /> }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, selectedTab === tab.id && styles.activeTab]}
              onPress={() => setSelectedTab(tab.id as any)}
            >
              {tab.icon}
              <Text style={[styles.tabText, selectedTab === tab.id && styles.activeTabText]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {selectedTab === 'dashboard' && (
            <View style={styles.dashboardContent}>
              {/* Analytics Cards */}
              <View style={styles.analyticsGrid}>
                {renderAnalyticsCard(
                  'Total Revenue',
                  `$${analytics.totalRevenue.toLocaleString()}`,
                  <DollarSign size={20} color="#4CAF50" />,
                  '+12.5% from last month'
                )}
                {renderAnalyticsCard(
                  'Total Orders',
                  analytics.totalOrders.toString(),
                  <Package size={20} color="#007AFF" />,
                  '+8.3% from last month'
                )}
                {renderAnalyticsCard(
                  'Customers',
                  analytics.totalCustomers.toString(),
                  <Users size={20} color="#FF9500" />,
                  '+15.2% from last month'
                )}
                {renderAnalyticsCard(
                  'Avg Order Value',
                  `$${analytics.averageOrderValue.toFixed(2)}`,
                  <TrendingUp size={20} color="#9C27B0" />,
                  '+5.7% from last month'
                )}
              </View>

              {/* Recent Orders */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Orders</Text>
                <FlatList
                  data={analytics.recentOrders.slice(0, 5)}
                  renderItem={renderShopOrderItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </View>

              {/* Top Products */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Products</Text>
                {analytics.topProducts.map((product, index) => (
                  <View key={product.id} style={styles.topProductItem}>
                    <Text style={styles.topProductRank}>#{index + 1}</Text>
                    <View style={styles.topProductInfo}>
                      <Text style={styles.topProductName}>{product.name}</Text>
                      <Text style={styles.topProductStats}>
                        {product.sales} sales • ${product.revenue.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {selectedTab === 'orders' && (
            <View style={styles.ordersContent}>
              <View style={styles.ordersHeader}>
                <Text style={styles.sectionTitle}>Manage Orders</Text>
                <View style={styles.orderFilters}>
                  {['all', 'processing', 'shipped', 'delivered'].map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[styles.filterChip, orderFilter === filter && styles.activeFilterChip]}
                      onPress={() => setOrderFilter(filter as any)}
                    >
                      <Text style={[styles.filterChipText, orderFilter === filter && styles.activeFilterChipText]}>
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <FlatList
                data={filteredOrders}
                renderItem={renderShopOrderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          {selectedTab === 'products' && (
            <View style={styles.productsContent}>
              <View style={styles.productsHeader}>
                <Text style={styles.sectionTitle}>Product Management</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    setEditingProduct(null);
                    setShowProductModal(true);
                  }}
                >
                  <Plus size={16} color="#fff" />
                  <Text style={styles.addButtonText}>Add Product</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={products}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.productRow}
                scrollEnabled={false}
              />
            </View>
          )}

          {selectedTab === 'analytics' && (
            <View style={styles.analyticsContent}>
              <Text style={styles.sectionTitle}>Detailed Analytics</Text>
              
              {/* Sales Trend Chart Placeholder */}
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Sales Trend (Last 7 Days)</Text>
                <View style={styles.chartPlaceholder}>
                  <BarChart3 size={48} color="#ccc" />
                  <Text style={styles.chartPlaceholderText}>Chart visualization would go here</Text>
                </View>
              </View>

              {/* Detailed Metrics */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Conversion Rate</Text>
                  <Text style={styles.metricValue}>3.2%</Text>
                  <Text style={styles.metricChange}>+0.5% from last week</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Return Rate</Text>
                  <Text style={styles.metricValue}>2.1%</Text>
                  <Text style={styles.metricChange}>-0.3% from last week</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Customer Satisfaction</Text>
                  <Text style={styles.metricValue}>4.8/5</Text>
                  <Text style={styles.metricChange}>+0.1 from last week</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricTitle}>Inventory Turnover</Text>
                  <Text style={styles.metricValue}>6.2x</Text>
                  <Text style={styles.metricChange}>+0.8x from last month</Text>
                </View>
              </View>
            </View>
          )}

          {selectedTab === 'promotions' && (
            <View style={styles.promotionsContent}>
              <View style={styles.promotionsHeader}>
                <Text style={styles.sectionTitle}>Promotions & Discounts</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowPromotionModal(true)}
                >
                  <Plus size={16} color="#fff" />
                  <Text style={styles.addButtonText}>Create Promotion</Text>
                </TouchableOpacity>
              </View>

              {/* Active Promotions */}
              <View style={styles.promotionCard}>
                <View style={styles.promotionHeader}>
                  <View style={styles.promotionIcon}>
                    <Percent size={20} color="#4CAF50" />
                  </View>
                  <View style={styles.promotionInfo}>
                    <Text style={styles.promotionTitle}>Winter Sale</Text>
                    <Text style={styles.promotionDescription}>20% off all winter items</Text>
                  </View>
                  <View style={styles.promotionStatus}>
                    <Text style={styles.activeStatus}>Active</Text>
                  </View>
                </View>
                <View style={styles.promotionStats}>
                  <Text style={styles.promotionStat}>Used: 45 times</Text>
                  <Text style={styles.promotionStat}>Revenue: $2,340</Text>
                </View>
              </View>

              <View style={styles.promotionCard}>
                <View style={styles.promotionHeader}>
                  <View style={styles.promotionIcon}>
                    <Gift size={20} color="#FF9500" />
                  </View>
                  <View style={styles.promotionInfo}>
                    <Text style={styles.promotionTitle}>Free Shipping</Text>
                    <Text style={styles.promotionDescription}>Free shipping on orders over $100</Text>
                  </View>
                  <View style={styles.promotionStatus}>
                    <Text style={styles.activeStatus}>Active</Text>
                  </View>
                </View>
                <View style={styles.promotionStats}>
                  <Text style={styles.promotionStat}>Used: 78 times</Text>
                  <Text style={styles.promotionStat}>Avg Order: $145</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Product Modal */}
        <Modal
          visible={showProductModal}
          animationType="slide"
          onRequestClose={() => setShowProductModal(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </Text>
              <TouchableOpacity onPress={() => setShowProductModal(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Product Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter product name"
                  defaultValue={editingProduct?.name}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Enter product description"
                  multiline
                  numberOfLines={4}
                  defaultValue={editingProduct?.description}
                />
              </View>
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>Price</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0.00"
                    keyboardType="numeric"
                    defaultValue={editingProduct?.price.toString()}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.formLabel}>Stock</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0"
                    keyboardType="numeric"
                    defaultValue={editingProduct?.stock.toString()}
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Select category"
                  defaultValue={editingProduct?.category}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>SKU</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter SKU"
                  defaultValue={editingProduct?.sku}
                />
              </View>
              <TouchableOpacity style={styles.saveButton}>
                <Text style={styles.saveButtonText}>
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Promotion Modal */}
        <Modal
          visible={showPromotionModal}
          animationType="slide"
          onRequestClose={() => setShowPromotionModal(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Promotion</Text>
              <TouchableOpacity onPress={() => setShowPromotionModal(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Promotion Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter promotion name"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Discount Type</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity style={styles.radioOption}>
                    <View style={styles.radioButton} />
                    <Text style={styles.radioLabel}>Percentage</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.radioOption}>
                    <View style={styles.radioButton} />
                    <Text style={styles.radioLabel}>Fixed Amount</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Discount Value</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter discount value"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>Start Date</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Select start date"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.formLabel}>End Date</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Select end date"
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Create Promotion</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

  // Customer View
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Order Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, orderFilter === filter && styles.activeFilterChip]}
            onPress={() => setOrderFilter(filter as any)}
          >
            <Text style={[styles.filterChipText, orderFilter === filter && styles.activeFilterChipText]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
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
      >
        {selectedOrder && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity onPress={() => setShowOrderDetails(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Order Info */}
              <View style={styles.orderDetailsSection}>
                <Text style={styles.sectionTitle}>Order Information</Text>
                <View style={styles.orderDetailRow}>
                  <Text style={styles.orderDetailLabel}>Order Number:</Text>
                  <Text style={styles.orderDetailValue}>{selectedOrder.orderNumber}</Text>
                </View>
                <View style={styles.orderDetailRow}>
                  <Text style={styles.orderDetailLabel}>Date:</Text>
                  <Text style={styles.orderDetailValue}>
                    {new Date(selectedOrder.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.orderDetailRow}>
                  <Text style={styles.orderDetailLabel}>Status:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) + '20' }]}>
                    {getStatusIcon(selectedOrder.status)}
                    <Text style={[styles.statusText, { color: getStatusColor(selectedOrder.status) }]}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Text>
                  </View>
                </View>
                {selectedOrder.trackingNumber && (
                  <View style={styles.orderDetailRow}>
                    <Text style={styles.orderDetailLabel}>Tracking:</Text>
                    <Text style={styles.orderDetailValue}>{selectedOrder.trackingNumber}</Text>
                  </View>
                )}
                {selectedOrder.estimatedDelivery && (
                  <View style={styles.orderDetailRow}>
                    <Text style={styles.orderDetailLabel}>Estimated Delivery:</Text>
                    <Text style={styles.orderDetailValue}>
                      {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Items */}
              <View style={styles.orderDetailsSection}>
                <Text style={styles.sectionTitle}>Items</Text>
                {selectedOrder.items.map((item, index) => (
                  <View key={index} style={styles.orderDetailItem}>
                    <Image source={{ uri: item.image }} style={styles.orderDetailItemImage} />
                    <View style={styles.orderDetailItemInfo}>
                      <Text style={styles.orderDetailItemName}>{item.name}</Text>
                      <Text style={styles.orderDetailItemVariant}>{item.variant}</Text>
                      <Text style={styles.orderDetailItemPrice}>
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </Text>
                    </View>
                    <Text style={styles.orderDetailItemTotal}>
                      ${(item.quantity * item.price).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Shipping Address */}
              <View style={styles.orderDetailsSection}>
                <Text style={styles.sectionTitle}>Shipping Address</Text>
                <Text style={styles.addressText}>
                  {selectedOrder.shippingAddress.name}{'\n'}
                  {selectedOrder.shippingAddress.address}{'\n'}
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.zipCode}{'\n'}
                  {selectedOrder.shippingAddress.country}
                </Text>
              </View>

              {/* Order Total */}
              <View style={styles.orderDetailsSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>${selectedOrder.total.toFixed(2)}</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.orderActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDownloadInvoice(selectedOrder)}
                >
                  <Download size={16} color="#007AFF" />
                  <Text style={styles.actionButtonText}>Download Invoice</Text>
                </TouchableOpacity>
                
                {selectedOrder.canCancel && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => {
                      handleCancelOrder(selectedOrder.id);
                      setShowOrderDetails(false);
                    }}
                  >
                    <X size={16} color="#FF3B30" />
                    <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                      Cancel Order
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  filterButton: {
    padding: 8,
  },
  settingsButton: {
    padding: 8,
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeFilterChip: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  activeFilterChipText: {
    color: '#fff',
  },
  ordersList: {
    padding: 16,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
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
    color: '#000',
  },
  orderDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
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
    color: '#000',
  },
  orderItemVariant: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginTop: 2,
  },
  moreItems: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f8f9fa',
  },
  orderTotal: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  trackingNumber: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000',
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
    color: '#000',
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
    color: '#666',
  },
  orderDetailValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  orderDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
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
    color: '#000',
  },
  orderDetailItemVariant: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  orderDetailItemPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginTop: 4,
  },
  orderDetailItemTotal: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#000',
    lineHeight: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#e9ecef',
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#FF3B30',
  },
  // Shop Owner Styles
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  dashboardContent: {
    padding: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  analyticsCard: {
    width: (width - 44) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  analyticsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyticsTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    flex: 1,
  },
  analyticsValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginBottom: 4,
  },
  analyticsTrend: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#4CAF50',
  },
  section: {
    marginBottom: 24,
  },
  shopOrderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  shopOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginTop: 2,
  },
  shopOrderActions: {
    alignItems: 'flex-end',
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  topProductRank: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFD700',
    marginRight: 16,
    width: 30,
  },
  topProductInfo: {
    flex: 1,
  },
  topProductName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  topProductStats: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  ordersContent: {
    padding: 16,
  },
  ordersHeader: {
    marginBottom: 16,
  },
  orderFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  productsContent: {
    padding: 16,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 44) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  productInfo: {
    padding: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    flex: 1,
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  productSku: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginBottom: 8,
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stockText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#4CAF50',
  },
  lowStock: {
    color: '#FF3B30',
  },
  salesText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusIndicatorText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  analyticsContent: {
    padding: 16,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  chartPlaceholderText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#999',
    marginTop: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (width - 44) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  metricTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#4CAF50',
  },
  promotionsContent: {
    padding: 16,
  },
  promotionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  promotionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
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
  promotionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  promotionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  promotionInfo: {
    flex: 1,
  },
  promotionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  promotionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  promotionStatus: {
    alignItems: 'flex-end',
  },
  activeStatus: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4CAF50',
    backgroundColor: '#4CAF50' + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  promotionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  promotionStat: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  radioLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  bottomPadding: {
    height: 100,
  },
});