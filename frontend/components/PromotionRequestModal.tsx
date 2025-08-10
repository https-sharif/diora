import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { X, Upload, Store } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/types/Theme';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import * as ImagePicker from 'expo-image-picker';

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
  const { user, token } = useAuth();
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
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickDocument = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        setProofDocuments(prev => [...prev, ...result.assets]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const removeDocument = (index: number) => {
    setProofDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.businessName || !formData.businessDescription || !formData.businessType) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (proofDocuments.length === 0) {
      Alert.alert('Error', 'Please upload at least one proof document');
      return;
    }

    try {
      setLoading(true);

      const requestFormData = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        requestFormData.append(key, formData[key as keyof typeof formData]);
      });
      
      // Append documents
      proofDocuments.forEach((doc, index) => {
        requestFormData.append('proofDocuments', {
          uri: doc.uri,
          type: doc.type || 'image/jpeg',
          name: doc.fileName || `document_${index}.jpg`,
        } as any);
      });

      const response = await axios.post(`${API_URL}/api/user/request-promotion`, requestFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData, let axios handle it
        },
      });

      if (response.data.status) {
        Alert.alert(
          'Success', 
          'Your promotion request has been submitted successfully! You will be notified once an admin reviews your request.',
          [{ text: 'OK', onPress: onClose }]
        );
        // Reset form
        setFormData({
          businessName: '',
          businessDescription: '',
          businessType: '',
          yearsInBusiness: '',
          expectedProducts: '',
          additionalInfo: '',
        });
        setProofDocuments([]);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      Alert.alert('Error', 'Failed to submit request. Please try again.');
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

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.description}>
              Submit your business information and required documents to request promotion to a shop account.
              Our team will review your application and get back to you within 3-5 business days.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.businessName}
                onChangeText={(value) => handleInputChange('businessName', value)}
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
                onChangeText={(value) => handleInputChange('businessDescription', value)}
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
                onChangeText={(value) => handleInputChange('businessType', value)}
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
                onChangeText={(value) => handleInputChange('yearsInBusiness', value)}
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
                onChangeText={(value) => handleInputChange('expectedProducts', value)}
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
                onChangeText={(value) => handleInputChange('additionalInfo', value)}
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
              
              <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
                <Upload size={20} color={theme.textSecondary} />
                <Text style={styles.uploadButtonText}>
                  Upload Documents
                </Text>
              </TouchableOpacity>

              {proofDocuments.map((doc, index) => (
                <View key={index} style={styles.uploadedFile}>
                  <Text style={styles.uploadedFileName}>{doc.fileName || `Document ${index + 1}`}</Text>
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
                (loading || !formData.businessName || !formData.businessDescription || !formData.businessType || proofDocuments.length === 0) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={loading || !formData.businessName || !formData.businessDescription || !formData.businessType || proofDocuments.length === 0}
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
