import {
  Menu,
  AlertTriangle,
  Eye,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  Trash2,
  X,
  User,
  FileText,
  Package,
  Store,
} from 'lucide-react-native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { Theme } from '@/types/Theme';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { config } from '@/config';
import { reportService } from '@/services';
import { Report, ReportStats } from '@/types/Report';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingVertical: -100,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.background,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 16,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 16,
      backgroundColor: theme.background,
      marginBottom: 8,
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
    },
    categoryTabs: {
      flexDirection: 'row',
      backgroundColor: theme.background,
      paddingHorizontal: 4,
      paddingVertical: 8,
      marginBottom: 8,
    },
    categoryTab: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginHorizontal: 2,
      borderRadius: 20,
      backgroundColor: theme.card,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    categoryTabActive: {
      backgroundColor: theme.primary,
    },
    categoryTabText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
    categoryTabTextActive: {
      color: '#000',
    },
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.background,
      marginBottom: 8,
    },
    searchInput: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginRight: 8,
      color: theme.text,
      backgroundColor: theme.card,
    },
    filterButton: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    reportItem: {
      backgroundColor: theme.card,
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
    },
    reportHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    reporterInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    reporterAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.border,
      marginRight: 8,
    },
    reporterName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    reportTime: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    itemTypeBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    itemTypeText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#000',
    },
    reportContent: {
      marginVertical: 8,
    },
    reportType: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
    },
    reportDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    reportFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },
    actionsContainer: {
      flexDirection: 'row',
    },
    actionButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      marginLeft: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    moreMenu: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: 34,
    },
    moreMenuHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    moreMenuTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    moreMenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      gap: 16,
    },
    moreMenuItemText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
    modalContent: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      margin: 20,
      height: '50%',
      width: '70%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    modalButton: {
      backgroundColor: theme.primary,
      padding: 12,
      borderRadius: 8,
      marginVertical: 4,
      alignItems: 'center',
    },
    modalButtonText: {
      color: '#000',
      fontWeight: '600',
    },
    cancelButton: {
      backgroundColor: theme.border,
      marginTop: 8,
    },
    reportModal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    reportContainer: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      width: '100%',
      maxWidth: 400,
    },
    reportTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    reportSubtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      marginBottom: 16,
    },
    reportOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    reportOptionText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    reportButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 16,
    },
    reportButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    reportButtonCancel: {
      borderWidth: 1,
    },
    reportButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
    },
  });

export default function ReportsManagement() {
  const { theme } = useTheme();
  const { user, token } = useAuth();
  
  const categories = [
    { id: 'all', label: 'All', icon: Shield },
    { id: 'user', label: 'Users', icon: null },
    { id: 'post', label: 'Posts', icon: null },
    { id: 'product', label: 'Products', icon: null },
    { id: 'shop', label: 'Shops', icon: null },
  ];

  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const styles = createStyles(theme);

  useEffect(() => {
    if (!user || user.type !== 'admin') {
      router.replace('/(tabs)');
      return;
    }
    fetchReports();
  }, [user, activeCategory, filterStatus]);

  const fetchReports = async () => {
    try {
      if (reports.length === 0) {
        setLoading(true);
      } else {
        setReportsLoading(true);
      }
      
      const response = await axios.get(`${config.apiUrl}/api/report`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: filterStatus !== 'all' ? filterStatus : undefined,
          itemType: activeCategory !== 'all' ? activeCategory : undefined,
          limit: 50,
        },
      });

      if (response.data.status) {
        setReports(response.data.reports);
        console.log('Fetched reports:', response.data.reports);
      }
      
      await fetchStats();
    } catch (error) {
      console.error('Fetch reports error:', error);
      Alert.alert('Error', 'Failed to fetch reports');
    } finally {
      setLoading(false);
      setReportsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await axios.get(`${config.apiUrl}/api/report/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchReports(),
      fetchStats()
    ]);
    setRefreshing(false);
  };

  const updateReportStatus = async (
    reportId: string,
    status: string,
    adminNotes?: string
  ) => {
    try {
      const response = await axios.put(
        `${config.apiUrl}/api/report/${reportId}`,
        { status, adminNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        setReports((prev) =>
          prev.map((report) =>
            report._id === reportId
              ? { ...report, status: status as any, adminNotes }
              : report
          )
        );
        fetchStats();
      }
    } catch (error) {
      console.error('Update report error:', error);
      Alert.alert('Error', 'Failed to update report');
    }
  };

  const takeModerationAction = async (
    reportId: string,
    action: string,
    reason?: string
  ) => {
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/report/${reportId}/moderate`,
        { action, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        Alert.alert('Success', 'Moderation action completed');
        fetchReports();
        setShowActionModal(false);
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Moderation action error:', error);
      Alert.alert('Error', 'Failed to take moderation action');
    }
  };

  const clearOldReports = async () => {
    try {
      Alert.alert(
        'Clear Old Reports',
        'This will permanently delete all reports older than 7 days. This action cannot be undone. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear Reports',
            style: 'destructive',
            onPress: async () => {
              try {
                if (!token) return;
                setShowActionsMenu(false);
                const response = await reportService.clearOldReports(token);

                if (response.status) {
                  Alert.alert(
                    'Success',
                    `Cleared ${response.deletedCount} old reports`
                  );
                  fetchReports();
                } else {
                  Alert.alert('Error', 'Failed to clear old reports');
                }
              } catch (error) {
                console.error('Clear old reports error:', error);
                Alert.alert('Error', 'Failed to clear old reports');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Clear old reports error:', error);
      Alert.alert('Error', 'Failed to clear old reports');
    }
  };

  const clearResolvedReports = async () => {
    try {
      Alert.alert(
        'Clear Resolved/Dismissed Reports',
        'This will permanently delete all resolved and dismissed reports. This action cannot be undone. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear Reports',
            style: 'destructive',
            onPress: async () => {
              try {
                if (!token) return;
                setShowActionsMenu(false);
                const response = await reportService.clearResolvedReports(token);

                if (response.status) {
                  Alert.alert(
                    'Success',
                    `Cleared ${response.deletedCount} resolved/dismissed reports`
                  );
                  fetchReports();
                } else {
                  Alert.alert(
                    'Error',
                    'Failed to clear resolved/dismissed reports'
                  );
                }
              } catch (error) {
                console.error('Clear resolved reports error:', error);
                Alert.alert(
                  'Error',
                  'Failed to clear resolved/dismissed reports'
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Clear resolved reports error:', error);
      Alert.alert('Error', 'Failed to clear resolved/dismissed reports');
    }
  };

  const getItemTypeIcon = (itemType: string) => {
    switch (itemType) {
      case 'user':
        return User;
      case 'post':
        return FileText;
      case 'product':
        return Package;
      case 'shop':
        return Store;
      default:
        return AlertTriangle;
    }
  };

  const getItemTypeColor = (itemType: string) => {
    switch (itemType) {
      case 'user':
        return '#3B82F6';
      case 'post':
        return '#8B5CF6';
      case 'product':
        return '#F59E0B';
      case 'shop':
        return '#10B981';
      default:
        return theme.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'under_review':
        return '#3B82F6';
      case 'resolved':
        return '#10B981';
      case 'dismissed':
        return '#6B7280';
      default:
        return theme.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'under_review':
        return Eye;
      case 'resolved':
        return CheckCircle;
      case 'dismissed':
        return XCircle;
      default:
        return Clock;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      searchTerm === '' ||
      (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      report.reporter.username
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      report.itemType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || report.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const renderReport = ({ item }: { item: Report }) => {
    const StatusIcon = getStatusIcon(item.status);

    const getReportedItemInfo = () => {
      switch (item.itemType) {
        case 'user':
          return {
            title: `User: ${item.reportedUser?.displayName || 'Unknown User'}`,
            subtitle: `@${item.reportedUser?.username || 'unknown'}`,
          };
        case 'post':
          return {
            title: `Post: ${item.reportedPost?.title || 'Untitled Post'}`,
            subtitle: `By: ${item.reportedPost?.user?.displayName || 'Unknown User'}`,
          };
        case 'product':
          return {
            title: `Product: ${item.reportedProduct?.name || 'Unknown Product'}`,
            subtitle: `Shop: ${item.reportedProduct?.shop?.name || 'Unknown Shop'}`,
          };
        case 'shop':
          return {
            title: `Shop: ${item.reportedShop?.name || item.reportedShop?.displayName || 'Unknown Shop'}`,
            subtitle: `Username: ${item.reportedShop?.username || 'Unknown Username'}`,
          };
        default:
          return {
            title: 'Unknown Item Type',
            subtitle: '',
          };
      }
    };

    const itemInfo = getReportedItemInfo();
    const ItemTypeIcon = getItemTypeIcon(item.itemType);

    return (
      <TouchableOpacity
        style={[
          styles.reportItem,
          { borderLeftColor: getItemTypeColor(item.itemType) },
        ]}
        onPress={() => router.push(`/report/${item._id}` as any)}
      >
        <View style={styles.reportHeader}>
          <View style={styles.reporterInfo}>
            <View style={styles.reporterAvatar}>
              {item.reporter?.profilePicture && (
                <Image
                  source={{ uri: item.reporter.profilePicture }}
                  style={styles.reporterAvatar}
                />
              )}
            </View>
            <View>
              <Text style={styles.reporterName}>{item.reporter?.displayName || 'Unknown Reporter'}</Text>
              <Text style={styles.reportTime}>
                {formatTimeAgo(item.createdAt)}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.itemTypeBadge,
              { backgroundColor: getItemTypeColor(item.itemType) + '20' },
            ]}
          >
            <ItemTypeIcon size={14} color={getItemTypeColor(item.itemType)} />
            <Text style={[styles.itemTypeText, { color: getItemTypeColor(item.itemType) }]}>
              {item.itemType.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.reportContent}>
          <Text style={[styles.reportType, { color: theme.text }]}>
            {itemInfo.title}
          </Text>
          <Text style={styles.reportDescription} numberOfLines={2}>
            {itemInfo.subtitle}
          </Text>
          <Text style={styles.reportDescription} numberOfLines={3}>
            Reason: {item.reason}
          </Text>
        </View>

        <View style={styles.reportFooter}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + '20' },
            ]}
          >
            <StatusIcon size={12} color={getStatusColor(item.status)} />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.accent + '20' },
              ]}
              onPress={() => router.push(`/report/${item._id}` as any)}
            >
              <Eye size={12} color={theme.primary} />
              <Text style={[styles.actionButtonText, { color: theme.primary }]}>
                Review
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && reports.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Reports</Text>
            <View style={{ position: 'relative' }}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowActionsMenu(true)}
              >
                <Menu size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.filterContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search reports..."
            placeholderTextColor={theme.textSecondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
                {stats.pending}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#3B82F6' }]}>
                {stats.underReview}
              </Text>
              <Text style={styles.statLabel}>Reviewing</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#10B981' }]}>
                {stats.resolved}
              </Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#EF4444' }]}>
                {stats.urgent}
              </Text>
              <Text style={styles.statLabel}>Urgent</Text>
            </View>
          </View>
        )}

        <View style={styles.categoryTabs}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                activeCategory === category.id && styles.categoryTabActive,
              ]}
              onPress={() => setActiveCategory(category.id)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[
                  styles.categoryTabText,
                  activeCategory === category.id && styles.categoryTabTextActive,
                ]}>
                  {category.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.textSecondary, marginTop: 16 }}>
            Loading reports...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Reports</Text>
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowActionsMenu(true)}
            >
              <Menu size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search reports..."
          placeholderTextColor={theme.textSecondary}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
              {stats.pending}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#3B82F6' }]}>
              {stats.underReview}
            </Text>
            <Text style={styles.statLabel}>Reviewing</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>
              {stats.resolved}
            </Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#EF4444' }]}>
              {stats.urgent}
            </Text>
            <Text style={styles.statLabel}>Urgent</Text>
          </View>
        </View>
      )}

      <View style={styles.categoryTabs}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              activeCategory === category.id && styles.categoryTabActive,
            ]}
            onPress={() => setActiveCategory(category.id)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[
                styles.categoryTabText,
                activeCategory === category.id && styles.categoryTabTextActive,
              ]}>
                {category.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {reportsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.textSecondary, marginTop: 16 }}>
            Loading reports...
          </Text>
        </View>
      ) : filteredReports.length > 0 ? (
        <FlatList
          data={filteredReports}
          renderItem={renderReport}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.accent]}
              tintColor={theme.accent}
            />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Shield size={48} color={theme.text} strokeWidth={2} />
          </View>
          <Text style={styles.emptyTitle}>No Reports Found</Text>
          <Text style={styles.emptyMessage}>
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'All reports have been handled. Great job keeping the community safe!'}
          </Text>
        </View>
      )}

      <Modal
        visible={showActionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Moderation Actions</Text>
            {selectedReport && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={{ color: theme.textSecondary, marginBottom: 16 }}>
                  Report: {selectedReport.itemType} report
                </Text>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() =>
                    updateReportStatus(selectedReport._id, 'under_review')
                  }
                >
                  <Text style={styles.modalButtonText}>Mark Under Review</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() =>
                    takeModerationAction(
                      selectedReport._id,
                      'warn_user',
                      'Warning issued'
                    )
                  }
                >
                  <Text style={styles.modalButtonText}>Send Warning</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() =>
                    takeModerationAction(
                      selectedReport._id,
                      'remove_content',
                      'Content removed'
                    )
                  }
                >
                  <Text style={styles.modalButtonText}>Remove Content</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() =>
                    takeModerationAction(
                      selectedReport._id,
                      'suspend_user',
                      'User suspended for 7 days'
                    )
                  }
                >
                  <Text style={styles.modalButtonText}>
                    Suspend User (7 days)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() =>
                    takeModerationAction(
                      selectedReport._id,
                      'ban_user',
                      'User banned permanently'
                    )
                  }
                >
                  <Text style={styles.modalButtonText}>Ban User</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() =>
                    updateReportStatus(
                      selectedReport._id,
                      'dismissed',
                      'No action needed'
                    )
                  }
                >
                  <Text style={styles.modalButtonText}>Dismiss Report</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowActionModal(false)}
                >
                  <Text style={[styles.modalButtonText, { color: theme.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showActionsMenu}
        animationType="slide"
        transparent
        onRequestClose={() => setShowActionsMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionsMenu(false)}
        >
          <View style={styles.moreMenu}>
            <View style={styles.moreMenuHeader}>
              <Text style={styles.moreMenuTitle}>Admin Actions</Text>
              <TouchableOpacity onPress={() => setShowActionsMenu(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.reportOption}
              onPress={clearOldReports}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <Trash2 size={20} color={theme.error} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.reportOptionText, { color: theme.text }]}
                  >
                    Clear Old Reports (7+ days)
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reportOption}
              onPress={clearResolvedReports}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <CheckCircle size={20} color={theme.success} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.reportOptionText, { color: theme.text }]}
                  >
                    Clear Resolved Reports
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
