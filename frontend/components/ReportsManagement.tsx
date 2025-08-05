import {
  ArrowLeft,
  Menu,
  AlertTriangle,
  Eye,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { Theme } from '@/types/Theme';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '@/constants/api';

interface Report {
  _id: string;
  reporter: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  reportedItem: {
    itemType: 'user' | 'post' | 'product' | 'comment' | 'review' | 'shop';
    itemId: string;
  };
  type: string;
  description: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  adminNotes?: string;
  reviewedBy?: {
    _id: string;
    username: string;
    fullName: string;
  };
  reviewedAt?: string;
  actionTaken: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportStats {
  pending: number;
  underReview: number;
  resolved: number;
  dismissed: number;
  urgent: number;
  high: number;
  last24Hours: number;
  byType: { _id: string; count: number }[];
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
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 16,
      backgroundColor: theme.card,
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
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.card,
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
      backgroundColor: theme.background,
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
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    priorityText: {
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
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      margin: 20,
      maxHeight: '80%',
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
  });

export default function ReportsManagement() {
  const { theme } = useTheme();
  const { user, token } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const styles = createStyles(theme);

  // Check if user is admin
  useEffect(() => {
    if (!user || user.type !== 'admin') {
      router.replace('/(tabs)');
      return;
    }
    fetchReports();
    fetchStats();
  }, [user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: filterStatus !== 'all' ? filterStatus : undefined,
          limit: 50,
        },
      });

      if (response.data.status) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error('Fetch reports error:', error);
      Alert.alert('Error', 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reports/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const updateReportStatus = async (reportId: string, status: string, adminNotes?: string) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/reports/${reportId}`,
        { status, adminNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        setReports(prev => 
          prev.map(report => 
            report._id === reportId 
              ? { ...report, status: status as any, adminNotes }
              : report
          )
        );
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Update report error:', error);
      Alert.alert('Error', 'Failed to update report');
    }
  };

  const takeModerationAction = async (reportId: string, action: string, reason?: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/reports/${reportId}/moderate`,
        { action, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        Alert.alert('Success', 'Moderation action completed');
        fetchReports(); // Refresh reports
        fetchStats(); // Refresh stats
        setShowActionModal(false);
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Moderation action error:', error);
      Alert.alert('Error', 'Failed to take moderation action');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#10B981';
      case 'low': return '#6B7280';
      default: return theme.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'under_review': return '#3B82F6';
      case 'resolved': return '#10B981';
      case 'dismissed': return '#6B7280';
      default: return theme.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'under_review': return Eye;
      case 'resolved': return CheckCircle;
      case 'dismissed': return XCircle;
      default: return Clock;
    }
  };

  const getBorderColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#10B981';
      case 'low': return '#6B7280';
      default: return theme.border;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const renderReport = ({ item }: { item: Report }) => {
    const StatusIcon = getStatusIcon(item.status);
    
    return (
      <TouchableOpacity 
        style={[
          styles.reportItem, 
          { borderLeftColor: getBorderColor(item.priority) }
        ]}
        onPress={() => {
          setSelectedReport(item);
          setShowActionModal(true);
        }}
      >
        <View style={styles.reportHeader}>
          <View style={styles.reporterInfo}>
            <View style={styles.reporterAvatar}>
              {item.reporter.avatar && (
                <Image source={{ uri: item.reporter.avatar }} style={styles.reporterAvatar} />
              )}
            </View>
            <View>
              <Text style={styles.reporterName}>{item.reporter.fullName}</Text>
              <Text style={styles.reportTime}>{formatTimeAgo(item.createdAt)}</Text>
            </View>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.reportContent}>
          <Text style={[styles.reportType, { color: theme.text }]}>
            {item.type.replace('_', ' ').toUpperCase()} - {item.reportedItem.itemType.toUpperCase()}
          </Text>
          <Text style={styles.reportDescription} numberOfLines={3}>
            {item.description}
          </Text>
        </View>

        <View style={styles.reportFooter}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <StatusIcon size={12} color={getStatusColor(item.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
              onPress={() => {
                setSelectedReport(item);
                setShowActionModal(true);
              }}
            >
              <Eye size={12} color={theme.primary} />
              <Text style={[styles.actionButtonText, { color: theme.primary }]}>Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerButton} />
          <Text style={styles.headerTitle}>Reports</Text>
          <View style={styles.headerButton} />
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
        <View style={styles.headerButton} />
        <Text style={styles.headerTitle}>Reports Management</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Menu size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#3B82F6' }]}>{stats.underReview}</Text>
            <Text style={styles.statLabel}>Reviewing</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.resolved}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#EF4444' }]}>{stats.urgent}</Text>
            <Text style={styles.statLabel}>Urgent</Text>
          </View>
        </View>
      )}

      {/* Search and Filter */}
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

      {/* Reports List */}
      <FlatList
        data={filteredReports}
        renderItem={renderReport}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshing={loading}
        onRefresh={fetchReports}
        ListEmptyComponent={
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
        }
      />

      {/* Action Modal */}
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
                  Report: {selectedReport.type} - {selectedReport.reportedItem.itemType}
                </Text>
                
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => updateReportStatus(selectedReport._id, 'under_review')}
                >
                  <Text style={styles.modalButtonText}>Mark Under Review</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => takeModerationAction(selectedReport._id, 'warn_user', 'Warning issued')}
                >
                  <Text style={styles.modalButtonText}>Send Warning</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => takeModerationAction(selectedReport._id, 'remove_content', 'Content removed')}
                >
                  <Text style={styles.modalButtonText}>Remove Content</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => takeModerationAction(selectedReport._id, 'suspend_user', 'User suspended for 7 days')}
                >
                  <Text style={styles.modalButtonText}>Suspend User (7 days)</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => takeModerationAction(selectedReport._id, 'ban_user', 'User banned permanently')}
                >
                  <Text style={styles.modalButtonText}>Ban User</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => updateReportStatus(selectedReport._id, 'dismissed', 'No action needed')}
                >
                  <Text style={styles.modalButtonText}>Dismiss Report</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowActionModal(false)}
                >
                  <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
