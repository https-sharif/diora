import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  FlatList,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingUp, Package, Users, Heart, DollarSign, Calendar, Star } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/types/Theme';
import axios from 'axios';
import { config } from '@/config';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    wishlistCount: number;
    followers: number;
  };
  orderTrends: Array<{
    _id: string;
    orderCount: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    _id: string;
    userId: {
      fullName: string;
      avatar: string;
    };
    totalAmount: number;
    status: string;
    createdAt: string;
    items: Array<any>;
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    imageUrl: string[];
    totalSold: number;
    revenue: number;
    price: number;
  }>;
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
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: {
      padding: 4,
      marginRight: 16,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    content: {
      flex: 1,
    },
    summarySection: {
      padding: 16,
    },
    summaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    summaryCard: {
      width: (width - 48) / 2,
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    summaryIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    summaryText: {
      flex: 1,
    },
    summaryNumber: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    summaryLabel: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 2,
    },
    section: {
      marginTop: 16,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 12,
    },
    trendCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    trendItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    trendDate: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
    trendStats: {
      alignItems: 'flex-end',
    },
    trendOrders: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    trendRevenue: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    orderCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    orderAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    orderInfo: {
      flex: 1,
    },
    orderCustomer: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    orderDate: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 2,
    },
    orderAmount: {
      fontSize: 14,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    orderStatus: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      marginTop: 2,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      textAlign: 'center',
    },
    productCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    productImage: {
      width: 50,
      height: 50,
      borderRadius: 8,
      marginRight: 12,
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    productStats: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 2,
    },
    productRevenue: {
      fontSize: 14,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    emptyState: {
      padding: 32,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 16,
    },
  });

export default function ShopAnalytics() {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/shop/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9500';
      case 'confirmed':
        return '#007AFF';
      case 'delivered':
        return '#34C759';
      case 'cancelled':
        return '#FF3B30';
      default:
        return theme.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const renderSummaryCard = (
    icon: React.ReactNode,
    value: number | string,
    label: string,
    color: string
  ) => (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIconContainer, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <View style={styles.summaryText}>
        <Text style={styles.summaryNumber}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
        <Text style={styles.summaryLabel}>{label}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Analytics</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!analytics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Analytics</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No analytics data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.summarySection}>
          <View style={styles.summaryGrid}>
            {renderSummaryCard(
              <Package size={20} color="#007AFF" />,
              analytics.summary.totalOrders,
              'Total Orders',
              '#007AFF'
            )}
            {renderSummaryCard(
              <DollarSign size={20} color="#34C759" />,
              formatCurrency(analytics.summary.totalRevenue),
              'Total Revenue',
              '#34C759'
            )}
            {renderSummaryCard(
              <TrendingUp size={20} color="#FF9500" />,
              analytics.summary.totalProducts,
              'Products Listed',
              '#FF9500'
            )}
            {renderSummaryCard(
              <Heart size={20} color="#FF3B30" />,
              analytics.summary.wishlistCount,
              'Wishlist Count',
              '#FF3B30'
            )}
            {renderSummaryCard(
              <Users size={20} color="#5856D6" />,
              analytics.summary.followers,
              'Followers',
              '#5856D6'
            )}
          </View>
        </View>

        {analytics.orderTrends.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Trends (Last 30 Days)</Text>
            <View style={styles.trendCard}>
              {analytics.orderTrends.slice(-7).map((trend, index) => (
                <View key={trend._id} style={styles.trendItem}>
                  <Text style={styles.trendDate}>{formatDate(trend._id)}</Text>
                  <View style={styles.trendStats}>
                    <Text style={styles.trendOrders}>{trend.orderCount} orders</Text>
                    <Text style={styles.trendRevenue}>{formatCurrency(trend.revenue)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {analytics.recentOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            {analytics.recentOrders.slice(0, 5).map((order) => (
              <View key={order._id} style={styles.orderCard}>
                <Image
                  source={{ uri: order.userId.avatar }}
                  style={styles.orderAvatar}
                />
                <View style={styles.orderInfo}>
                  <Text style={styles.orderCustomer}>{order.userId.fullName}</Text>
                  <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.orderAmount}>{formatCurrency(order.totalAmount)}</Text>
                  <Text
                    style={[
                      styles.orderStatus,
                      { color: getStatusColor(order.status) }
                    ]}
                  >
                    {order.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {analytics.topProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Selling Products</Text>
            {analytics.topProducts.map((product) => (
              <View key={product._id} style={styles.productCard}>
                <Image
                  source={{ uri: product.imageUrl[0] }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productStats}>
                    {product.totalSold} sold • {formatCurrency(product.price)}
                  </Text>
                </View>
                <Text style={styles.productRevenue}>
                  {formatCurrency(product.revenue)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
