import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Store, 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Eye,
  ExternalLink 
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/types/Theme';
import { PromotionRequest } from '@/types/PromotionRequest';
import axios from 'axios';
import { config } from '@/config';

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
    },
    backButton: {
      padding: 4,
      marginRight: 16,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      flex: 1,
    },
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
    },
    filterButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    filterButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
    filterButtonTextActive: {
      color: '#000',
    },
    requestCard: {
      backgroundColor: theme.card,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    requestHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.border,
      marginRight: 12,
    },
    requestInfo: {
      flex: 1,
    },
    businessName: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    userName: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    statusText: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
    },
    requestDetails: {
      marginVertical: 12,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    detailIcon: {
      marginRight: 8,
    },
    detailText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      flex: 1,
    },
    description: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      lineHeight: 20,
      marginTop: 8,
    },
    actionButtons: {
      flexDirection: 'row',
      marginTop: 16,
      gap: 12,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 8,
      gap: 6,
    },
    approveButton: {
      backgroundColor: '#10B981',
    },
    rejectButton: {
      backgroundColor: '#EF4444',
    },
    viewButton: {
      backgroundColor: theme.primary,
    },
    actionButtonText: {
      color: 'white',
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: 20,
      maxHeight: '80%',
      width: '90%',
      maxWidth: 500,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    closeButton: {
      padding: 4,
    },
    modalContent: {
      maxHeight: 400,
    },
    fieldGroup: {
      marginBottom: 16,
    },
    fieldLabel: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 4,
    },
    fieldValue: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      lineHeight: 20,
    },
    documentsSection: {
      marginBottom: 16,
    },
    documentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    documentName: {
      flex: 1,
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
    },
    commentsInput: {
      backgroundColor: theme.card,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
      height: 80,
      textAlignVertical: 'top',
      marginBottom: 16,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 16,
    },
  });

const getStatusColor = (status: string, theme: any) => {
  switch (status) {
    case 'pending':
      return { backgroundColor: '#F59E0B', color: 'white' };
    case 'approved':
      return { backgroundColor: '#10B981', color: 'white' };
    case 'rejected':
      return { backgroundColor: '#EF4444', color: 'white' };
    default:
      return { backgroundColor: theme.border, color: theme.text };
  }
};

export default function PromotionRequestsScreen() {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<PromotionRequest[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<PromotionRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'view' | 'approve' | 'reject'>('view');
  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  useEffect(() => {
    if (user?.type !== 'admin') {
      Alert.alert('Access Denied', 'You need admin privileges to access this page.');
      router.back();
      return;
    }
    fetchRequests();
  }, [selectedFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = selectedFilter !== 'all' ? `?status=${selectedFilter}` : '';
      const response = await axios.get(`${config.apiUrl}/api/admin/promotion-requests${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        setRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to fetch promotion requests');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const handleAction = async (request: PromotionRequest, action: 'approve' | 'reject') => {
    try {
      setProcessing(true);
      const response = await axios.put(
        `${config.apiUrl}/api/admin/promotion-requests/${request._id}`,
        { action, comments },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        Alert.alert(
          'Success',
          `Request ${action}d successfully`,
          [{ text: 'OK', onPress: () => setShowModal(false) }]
        );
        fetchRequests();
      }
    } catch (error) {
      console.error('Error processing request:', error);
      Alert.alert('Error', `Failed to ${action} request`);
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (request: PromotionRequest, type: 'view' | 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(type);
    setComments('');
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user || user.type !== 'admin') {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Promotion Requests</Text>
      </View>

      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === filter.key && styles.filterButtonTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Store size={48} color={theme.textSecondary} />
          <Text style={styles.emptyText}>
            No {selectedFilter !== 'all' ? selectedFilter : ''} promotion requests found
          </Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.accent]}
              tintColor={theme.accent}
            />
          }
        >
          {requests.map((request) => (
            <View key={request._id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <Image
                  source={{
                    uri: request.userId.avatar || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
                  }}
                  style={styles.userAvatar}
                />
                <View style={styles.requestInfo}>
                  <Text style={styles.businessName}>{request.businessName}</Text>
                  <Text style={styles.userName}>by {request.userId.fullName}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    getStatusColor(request.status, theme),
                  ]}
                >
                  <Text style={[styles.statusText, { color: getStatusColor(request.status, theme).color }]}>
                    {request.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.requestDetails}>
                <View style={styles.detailRow}>
                  <Store size={16} color={theme.textSecondary} style={styles.detailIcon} />
                  <Text style={styles.detailText}>{request.businessType}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Calendar size={16} color={theme.textSecondary} style={styles.detailIcon} />
                  <Text style={styles.detailText}>Submitted {formatDate(request.submittedAt)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <FileText size={16} color={theme.textSecondary} style={styles.detailIcon} />
                  <Text style={styles.detailText}>{request.proofDocuments.length} documents</Text>
                </View>
              </View>

              <Text style={styles.description} numberOfLines={3}>
                {request.businessDescription}
              </Text>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.viewButton]}
                  onPress={() => openModal(request, 'view')}
                >
                  <Eye size={16} color="white" />
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>

                {request.status === 'pending' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => openModal(request, 'approve')}
                    >
                      <CheckCircle size={16} color="white" />
                      <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => openModal(request, 'reject')}
                    >
                      <XCircle size={16} color="white" />
                      <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {actionType === 'view' ? 'Request Details' : 
                 actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
                <XCircle size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Business Name</Text>
                  <Text style={styles.fieldValue}>{selectedRequest.businessName}</Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Business Type</Text>
                  <Text style={styles.fieldValue}>{selectedRequest.businessType}</Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Description</Text>
                  <Text style={styles.fieldValue}>{selectedRequest.businessDescription}</Text>
                </View>

                {selectedRequest.yearsInBusiness && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Years in Business</Text>
                    <Text style={styles.fieldValue}>{selectedRequest.yearsInBusiness}</Text>
                  </View>
                )}

                {selectedRequest.expectedProducts && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Expected Products</Text>
                    <Text style={styles.fieldValue}>{selectedRequest.expectedProducts}</Text>
                  </View>
                )}

                {selectedRequest.additionalInfo && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Additional Information</Text>
                    <Text style={styles.fieldValue}>{selectedRequest.additionalInfo}</Text>
                  </View>
                )}

                <View style={styles.documentsSection}>
                  <Text style={styles.fieldLabel}>Proof Documents</Text>
                  {selectedRequest.proofDocuments.length > 0 ? (
                    selectedRequest.proofDocuments.map((doc, index) => (
                      <View key={index}>
                        <TouchableOpacity
                          style={styles.documentItem}
                          onPress={() => {
                            const documentUrl = doc.path.startsWith('http') ? doc.path : `${config.apiUrl}/${doc.path}`;
                            console.log('Opening document:', documentUrl);
                            Linking.openURL(documentUrl).catch(err => {
                              console.error('Error opening document:', err);
                              Alert.alert('Error', 'Unable to open document. Please try again.');
                            });
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={styles.documentName}>{doc.originalName}</Text>
                            <Text style={[styles.fieldValue, { fontSize: 12 }]}>
                              Type: {doc.mimetype}
                            </Text>
                          </View>
                          <ExternalLink size={16} color={theme.primary} />
                        </TouchableOpacity>
                        
                        {doc.mimetype.startsWith('image/') && (
                          <View style={{ marginTop: 8, marginBottom: 12 }}>
                            <Image
                              source={{ 
                                uri: doc.path.startsWith('http') ? doc.path : `${config.apiUrl}/${doc.path}`
                              }}
                              style={{
                                width: '100%',
                                height: 200,
                                borderRadius: 8,
                                backgroundColor: theme.card,
                              }}
                              resizeMode="contain"
                              onError={(error) => {
                                console.error('Error loading image:', error);
                              }}
                            />
                          </View>
                        )}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.fieldValue}>No documents uploaded</Text>
                  )}
                </View>

                {actionType !== 'view' && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Comments (Optional)</Text>
                    <TextInput
                      style={styles.commentsInput}
                      value={comments}
                      onChangeText={setComments}
                      placeholder={`Add comments for ${actionType}...`}
                      placeholderTextColor={theme.textSecondary}
                      multiline
                    />
                  </View>
                )}

                {actionType !== 'view' && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.border }]}
                      onPress={() => setShowModal(false)}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.text }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        actionType === 'approve' ? styles.approveButton : styles.rejectButton,
                        processing && { opacity: 0.6 },
                      ]}
                      onPress={() => handleAction(selectedRequest, actionType)}
                      disabled={processing}
                    >
                      {processing ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <>
                          {actionType === 'approve' ? (
                            <CheckCircle size={16} color="white" />
                          ) : (
                            <XCircle size={16} color="white" />
                          )}
                          <Text style={styles.actionButtonText}>
                            {actionType === 'approve' ? 'Approve' : 'Reject'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
