import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { X, Upload, Store } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/types/Theme';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services';
import * as ImagePicker from 'expo-image-picker';
import { showToast } from '@/utils/toastUtils';
import { checkNetworkConnectivity } from '@/utils/networkUtils';

interface PromotionRequestModalProps {
  visible: boolean;
  onClose: () => void;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: 20,
      maxHeight: '80%',
      width: '90%',
      maxWidth: 400,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      flex: 1,
    },
    closeButton: {
      padding: 4,
    },
    content: {
      maxHeight: 400,
    },
    description: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginBottom: 20,
      lineHeight: 20,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.card,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    uploadSection: {
      marginBottom: 16,
    },
    uploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.card,
      borderRadius: 8,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.border,
      paddingVertical: 20,
      paddingHorizontal: 16,
      gap: 8,
    },
    uploadButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    uploadedFile: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
      gap: 8,
    },
    uploadedFileName: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      flex: 1,
    },
    removeButton: {
      padding: 4,
    },
    submitButton: {
      backgroundColor: theme.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 10,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: 'white',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    characterCount: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'right',
      marginTop: 4,
    },
  });

export const PromotionRequestModal: React.FC<PromotionRequestModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  const { token } = useAuth();
  const styles = createStyles(theme);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    businessType: '',
    yearsInBusiness: '',
    expectedProducts: '',
    additionalInfo: '',
  });

  const [proofDocuments, setProofDocuments] = useState<any[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickDocument = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast.error('Please grant media library permissions to upload documents.');
        return;
      }

      // Launch image library with Android-compatible settings
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Validate selected files
        const validAssets = result.assets.filter(asset => {
          if (!asset.uri) {
            console.warn('Asset missing URI:', asset);
            return false;
          }
          return true;
        });

        if (validAssets.length > 0) {
          setProofDocuments((prev) => [...prev, ...validAssets]);
          showToast.success(`${validAssets.length} document(s) selected successfully!`);
        } else {
          showToast.error('No valid documents were selected');
        }
      }
    } catch (error) {
      console.error('Error picking documents:', error);
      showToast.error('Failed to pick document. Please try again.');
    }
  };

  const removeDocument = (index: number) => {
    setProofDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (
      !formData.businessName ||
      !formData.businessDescription ||
      !formData.businessType
    ) {
      showToast.error('Please fill in all required fields');
      return;
    }

    if (proofDocuments.length === 0) {
      showToast.error('Please upload at least one proof document');
      return;
    }

    try {
      setLoading(true);

      // Check network connectivity first
      const isConnected = await checkNetworkConnectivity();
      if (!isConnected) {
        showToast.error('No internet connection. Please check your network and try again.');
        return;
      }

      const requestFormData = new FormData();

      Object.keys(formData).forEach((key) => {
        requestFormData.append(key, formData[key as keyof typeof formData]);
      });

      proofDocuments.forEach((doc, index) => {
        const fileExtension = doc.uri.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = doc.fileName || `promotion_document_${Date.now()}_${index}.${fileExtension}`;
        
        // Better MIME type detection for Android compatibility
        let mimeType = doc.type || doc.mimeType;
        if (!mimeType) {
          switch (fileExtension) {
            case 'jpg':
            case 'jpeg':
              mimeType = 'image/jpeg';
              break;
            case 'png':
              mimeType = 'image/png';
              break;
            case 'webp':
              mimeType = 'image/webp';
              break;
            default:
              mimeType = 'image/jpeg';
          }
        }

        requestFormData.append('proofDocuments', {
          uri: doc.uri,
          type: mimeType,
          name: fileName,
        } as any);
      });

      if (!token) {
        showToast.error('No authentication token available');
        return;
      }

      console.log('Submitting promotion request with:', {
        documentsCount: proofDocuments.length,
        businessName: formData.businessName,
        businessType: formData.businessType,
      });

      const response = await userService.requestPromotion(
        requestFormData,
        token
      );

      if (response.status) {
        showToast.success('Your promotion request has been submitted successfully! You will be notified once an admin reviews your request.');
        setFormData({
          businessName: '',
          businessDescription: '',
          businessType: '',
          yearsInBusiness: '',
          expectedProducts: '',
          additionalInfo: '',
        });
        setProofDocuments([]);
        onClose();
      } else {
        showToast.error(response.data.message || 'Failed to submit request');
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 400 && error.response.data?.message) {
          const message = error.response.data.message;

          if (message.includes('already have a pending promotion request')) {
            showToast.error('You already have a pending promotion request. Please wait for admin review before submitting a new request.');
            onClose();
            return;
          } else if (message.includes('required')) {
            showToast.error(message);
            return;
          }
        }

        showToast.error(
          error.response.data?.message ||
            'Failed to submit request. Please try again.'
        );
      } else {
        showToast.error('Failed to submit request. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Store size={24} color={theme.primary} />
            <Text style={styles.title}>Request Shop Promotion</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.description}>
              Submit your business information and required documents to request
              promotion to a shop account. Our team will review your application
              and get back to you within 3-5 business days.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.businessName}
                onChangeText={(value) =>
                  handleInputChange('businessName', value)
                }
                placeholder="Enter your business name"
                placeholderTextColor={theme.textSecondary}
                maxLength={100}
              />
              <Text style={styles.characterCount}>
                {formData.businessName.length}/100
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.businessDescription}
                onChangeText={(value) =>
                  handleInputChange('businessDescription', value)
                }
                placeholder="Describe your business, products, and services..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              <Text style={styles.characterCount}>
                {formData.businessDescription.length}/500
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Type *</Text>
              <TextInput
                style={styles.input}
                value={formData.businessType}
                onChangeText={(value) =>
                  handleInputChange('businessType', value)
                }
                placeholder="e.g., Retail, Handmade, Digital Services, etc."
                placeholderTextColor={theme.textSecondary}
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Years in Business</Text>
              <TextInput
                style={styles.input}
                value={formData.yearsInBusiness}
                onChangeText={(value) =>
                  handleInputChange('yearsInBusiness', value)
                }
                placeholder="How long have you been in business?"
                placeholderTextColor={theme.textSecondary}
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Expected Number of Products</Text>
              <TextInput
                style={styles.input}
                value={formData.expectedProducts}
                onChangeText={(value) =>
                  handleInputChange('expectedProducts', value)
                }
                placeholder="How many products do you plan to list?"
                placeholderTextColor={theme.textSecondary}
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Additional Information</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.additionalInfo}
                onChangeText={(value) =>
                  handleInputChange('additionalInfo', value)
                }
                placeholder="Any additional information you'd like to share..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
                maxLength={300}
              />
              <Text style={styles.characterCount}>
                {formData.additionalInfo.length}/300
              </Text>
            </View>

            <View style={styles.uploadSection}>
              <Text style={styles.label}>Proof Documents *</Text>
              <Text style={[styles.description, { marginBottom: 8 }]}>
                Upload business documents, licenses, or images (JPG, PNG, etc.)
              </Text>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={pickDocument}
              >
                <Upload size={20} color={theme.textSecondary} />
                <Text style={styles.uploadButtonText}>Upload Documents</Text>
              </TouchableOpacity>

              {proofDocuments.map((doc, index) => (
                <View key={index} style={styles.uploadedFile}>
                  <Text style={styles.uploadedFileName}>
                    {doc.fileName || `Document ${index + 1}`}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeDocument(index)}
                  >
                    <X size={16} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (loading ||
                  !formData.businessName ||
                  !formData.businessDescription ||
                  !formData.businessType ||
                  proofDocuments.length === 0) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={
                loading ||
                !formData.businessName ||
                !formData.businessDescription ||
                !formData.businessType ||
                proofDocuments.length === 0
              }
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Request</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
