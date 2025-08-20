import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { Theme } from '@/types/Theme';
import axios from 'axios';
import { config } from '@/config';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  FileText,
  Package,
  Store,
} from 'lucide-react-native';

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
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.background,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 16,
    },
    placeholder: {
      width: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      padding: 16,
    },
    reportCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderLeftWidth: 4,
    },
    reportHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    reportType: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    typeIcon: {
      marginRight: 8,
    },
    typeText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      textTransform: 'capitalize',
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      alignSelf: 'flex-start',
    },
    statusText: {
      fontSize: 12,
      fontFamily: 'Inter-Bold',
      textTransform: 'uppercase',
    },
    reportInfo: {
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    infoLabel: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      width: 80,
    },
    infoValue: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      flex: 1,
    },
    reasonText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      lineHeight: 24,
      marginBottom: 16,
    },
    reportedItemCard: {
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 12,
    },
    itemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    itemTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginLeft: 8,
    },
    itemImage: {
      width: 120,
      height: 120,
      borderRadius: 8,
      marginBottom: 12,
    },
    itemDescription: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      lineHeight: 20,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    userAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8,
    },
    userName: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
    userUsername: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    actionButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 24,
      gap: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 8,
      minWidth: '45%',
      marginBottom: 8,
    },
    warnButton: {
      backgroundColor: '#FFC107',
    },
    suspendButton: {
      backgroundColor: '#FF9800',
    },
    banButton: {
      backgroundColor: '#F44336',
    },
    removeContentButton: {
      backgroundColor: '#9C27B0',
    },
    resolveButton: {
      backgroundColor: '#4CAF50',
    },
    dismissButton: {
      backgroundColor: '#FF5722',
    },
    actionButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: '#000',
    },
    reporterCard: {
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    reporterHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    reporterAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    reporterName: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    reporterUsername: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
  });

export default function ReportDetail() {
  const { theme } = useTheme();
  const { user, token } = useAuth();
  const { reportId } = useLocalSearchParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const styles = createStyles(theme);

  useEffect(() => {
    if (!user || user.type !== 'admin') {
      router.replace('/(tabs)');
      return;
    }
    fetchReportDetail();
  }, [reportId]);

  const fetchReportDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${config.apiUrl}/api/report/${reportId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status) {
        setReport(response.data.report);
      }
    } catch {
      Alert.alert('Error', 'Failed to fetch report details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (status: 'resolved' | 'dismissed') => {
    try {
      const response = await axios.put(
        `${config.apiUrl}/api/report/${reportId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        Alert.alert('Success', `Report has been ${status}`, [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch {
      Alert.alert('Error', 'Failed to update report status');
    }
  };

  const takeModerationAction = async (action: string) => {
    const actionMessages = {
      warn_user: 'warn the user',
      suspend_user: 'suspend the user',
      ban_user: 'ban the user permanently',
      remove_content: 'remove the content',
    };

    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${
        actionMessages[action as keyof typeof actionMessages]
      }?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.post(
                `${config.apiUrl}/api/report/${reportId}/moderate`,
                {
                  action,
                  reason: `Admin action taken: ${action.replace('_', ' ')}`,
                  duration: action === 'suspend_user' ? 7 : undefined,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (response.data.status) {
                Alert.alert('Success', `Action completed successfully`, [
                  { text: 'OK', onPress: () => router.back() },
                ]);
              }
            } catch {
              Alert.alert('Error', 'Failed to take moderation action');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'resolved':
        return '#4CAF50';
      case 'dismissed':
        return '#9E9E9E';
      default:
        return '#FFA500';
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'resolved':
        return '#4CAF50';
      case 'dismissed':
        return '#9E9E9E';
      default:
        return '#FFA500';
    }
  };

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'user':
        return <User size={20} color={theme.text} />;
      case 'post':
        return <FileText size={20} color={theme.text} />;
      case 'product':
        return <Package size={20} color={theme.text} />;
      case 'shop':
        return <Store size={20} color={theme.text} />;
      default:
        return <AlertTriangle size={20} color={theme.text} />;
    }
  };

  const renderReportedItem = () => {
    if (!report) return null;

    const { itemType } = report;

    switch (itemType) {
      case 'user':
        const user = report.reportedUser;
        return (
          <View style={styles.reportedItemCard}>
            <Text style={styles.sectionTitle}>Reported User</Text>
            <View style={styles.itemHeader}>
              {getItemIcon('user')}
              <Text style={styles.itemTitle}>
                {user?.displayName || 'Unknown User'}
              </Text>
            </View>
            {user?.profilePicture && (
              <Image
                source={{ uri: user.profilePicture }}
                style={styles.itemImage}
              />
            )}
            <Text style={styles.itemDescription}>
              Username: @{user?.username || 'unknown'}
              {'\n'}
              Email: {user?.email || 'N/A'}
              {'\n'}
              Bio: {user?.bio || 'No bio available'}
            </Text>
          </View>
        );

      case 'post':
        const post = report.reportedPost;
        return (
          <View style={styles.reportedItemCard}>
            <Text style={styles.sectionTitle}>Reported Post</Text>

            {post?.images && post.images.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push(`/post/${post._id}`)}
              >
                <Image
                  source={{ uri: post.images[0] }}
                  style={styles.itemImage}
                />
              </TouchableOpacity>
            )}
            <Text style={styles.itemDescription}>
              {post?.caption || 'No content available'}
            </Text>
            {post?.user && (
              <View style={styles.userInfo}>
                {post.user.profilePicture && (
                  <TouchableOpacity
                    onPress={() => router.push(`/user/${post.user._id}`)}
                  >
                    <Image
                      source={{ uri: post.user.profilePicture }}
                      style={styles.userAvatar}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => router.push(`/user/${post.user._id}`)}
                >
                  <Text style={styles.userName}>{post.user.displayName}</Text>
                  <Text style={styles.userUsername}>@{post.user.username}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );

      case 'product':
        const product = report.reportedProduct;
        return (
          <View style={styles.reportedItemCard}>
            <Text style={styles.sectionTitle}>Reported Product</Text>
            <View style={styles.itemHeader}>
              {getItemIcon('product')}
              <Text style={styles.itemTitle}>
                {product?.name || 'Unknown Product'}
              </Text>
            </View>
            {product?.images && product.images.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push(`/product/${product._id}`)}
              >
                <Image
                  source={{ uri: product.images[0] }}
                  style={styles.itemImage}
                />
              </TouchableOpacity>
            )}
            <Text style={styles.itemDescription}>
              Price: ${product?.price || '0'}
              {'\n'}
              Description: {product?.description || 'No description available'}
            </Text>
            {product?.shop && (
              <View style={styles.userInfo}>
                {product.shop.profilePicture && (
                  <TouchableOpacity
                    onPress={() => router.push(`/shop/${product.shop._id}`)}
                  >
                    <Image
                      source={{ uri: product.shop.profilePicture }}
                      style={styles.userAvatar}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => router.push(`/shop/${product.shop._id}`)}
                >
                  <Text style={styles.userName}>
                    {product.shop.displayName}
                  </Text>
                  <Text style={styles.userUsername}>
                    @{product.shop.username}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );

      case 'shop':
        const shop = report.reportedShop;
        return (
          <View style={styles.reportedItemCard}>
            <Text style={styles.sectionTitle}>Reported Shop</Text>
            <View style={styles.itemHeader}>
              {getItemIcon('shop')}
              <Text style={styles.itemTitle}>
                {shop?.name ||
                  shop?.displayName ||
                  shop?.username ||
                  'Unknown Shop'}
              </Text>
            </View>
            {shop?.profilePicture && (
              <Image
                source={{ uri: shop.profilePicture }}
                style={styles.itemImage}
              />
            )}
            <Text style={styles.itemDescription}>
              Description: {shop?.bio || 'No description available'}
              {'\n'}
              Shop Owner:{' '}
              {shop?.displayName || shop?.username || 'Unknown Owner'}
            </Text>
          </View>
        );

      default:
        return (
          <View style={styles.reportedItemCard}>
            <Text style={styles.sectionTitle}>Reported Item</Text>
            <Text style={styles.itemDescription}>Unknown item type</Text>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.textSecondary, marginTop: 16 }}>
            Loading report details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={{ color: theme.textSecondary }}>Report not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContent}>
        <View
          style={[
            styles.reportCard,
            { borderLeftColor: getBorderColor(report.status) },
          ]}
        >
          <View style={styles.reportHeader}>
            <View style={styles.reportType}>
              <View style={styles.typeIcon}>
                {getItemIcon(report.itemType)}
              </View>
              <Text style={styles.typeText}>{report.itemType} Report</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(report.status) },
              ]}
            >
              <Text style={styles.statusText}>{report.status}</Text>
            </View>
          </View>

          <View style={styles.reportInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reason:</Text>
              <Text style={styles.infoValue}>{report.reason}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>
                {new Date(report.createdAt).toLocaleDateString()} at{' '}
                {new Date(report.createdAt).toLocaleTimeString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Report ID:</Text>
              <Text style={styles.infoValue}>{report._id}</Text>
            </View>
          </View>

          {report.description && (
            <View>
              <Text style={styles.sectionTitle}>Additional Details</Text>
              <Text style={styles.reasonText}>{report.description}</Text>
            </View>
          )}
        </View>

        {report.reporter && (
          <View style={styles.reporterCard}>
            <Text style={styles.sectionTitle}>Reporter</Text>
            <View style={styles.reporterHeader}>
              {report.reporter.profilePicture && (
                <TouchableOpacity
                  onPress={() => router.push(`/user/${report.reporter._id}`)}
                >
                  <Image
                    source={{ uri: report.reporter.profilePicture }}
                    style={styles.reporterAvatar}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => router.push(`/user/${report.reporter._id}`)}
              >
                <Text style={styles.reporterName}>
                  {report.reporter.displayName}
                </Text>
                <Text style={styles.reporterUsername}>
                  @{report.reporter.username}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {renderReportedItem()}

        {report.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.warnButton]}
              onPress={() => takeModerationAction('warn_user')}
            >
              <AlertTriangle size={18} color="#000" />
              <Text style={styles.actionButtonText}>Warn User</Text>
            </TouchableOpacity>

            {(report.itemType === 'user' || report.itemType === 'User') && (
              <TouchableOpacity
                style={[styles.actionButton, styles.suspendButton]}
                onPress={() => takeModerationAction('suspend_user')}
              >
                <XCircle size={18} color="#000" />
                <Text style={styles.actionButtonText}>Suspend User</Text>
              </TouchableOpacity>
            )}

            {(report.itemType === 'user' || report.itemType === 'User') && (
              <TouchableOpacity
                style={[styles.actionButton, styles.banButton]}
                onPress={() => takeModerationAction('ban_user')}
              >
                <XCircle size={18} color="#fff" />
                <Text style={[styles.actionButtonText, { color: '#fff' }]}>
                  Ban User
                </Text>
              </TouchableOpacity>
            )}

            {report.itemType !== 'user' && report.itemType !== 'User' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.removeContentButton]}
                onPress={() => takeModerationAction('remove_content')}
              >
                <XCircle size={18} color="#fff" />
                <Text style={[styles.actionButtonText, { color: '#fff' }]}>
                  Remove Content
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.resolveButton]}
              onPress={() => updateReportStatus('resolved')}
            >
              <CheckCircle size={18} color="#000" />
              <Text style={styles.actionButtonText}>Resolve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.dismissButton]}
              onPress={() => updateReportStatus('dismissed')}
            >
              <XCircle size={18} color="#fff" />
              <Text style={[styles.actionButtonText, { color: '#fff' }]}>
                Dismiss
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
