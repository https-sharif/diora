import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Store, Package, Settings, Camera, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { Theme } from '@/types/Theme';
import axios from 'axios';
import { API_URL } from '@/constants/api';

interface ShopOnboardingProps {
  onComplete: () => void;
}

const SHIPPING_REGIONS = [
  'Local Only', 'Nationwide', 'North America', 'Europe', 'Asia', 'Worldwide'
];

const PAYMENT_METHODS = [
  'Credit/Debit Cards', 'PayPal', 'Apple Pay', 'Google Pay', 'Bank Transfer', 'Cash on Delivery'
];

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
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    backButton: {
      padding: 8,
    },
    stepIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.border,
    },
    stepDotActive: {
      backgroundColor: theme.accent,
    },
    skipButton: {
      padding: 8,
    },
    skipText: {
      color: theme.textSecondary,
      fontSize: 16,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    stepContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      marginBottom: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 40,
    },
    inputGroup: {
      width: '100%',
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 20,
    },
    option: {
      backgroundColor: theme.card,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    optionSelected: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    optionText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '500',
    },
    optionTextSelected: {
      color: '#000',
    },
    footer: {
      padding: 20,
      gap: 12,
    },
    nextButton: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    nextButtonDisabled: {
      opacity: 0.6,
    },
    nextButtonText: {
      color: '#000',
      fontSize: 16,
      fontWeight: '600',
    },
    progressBar: {
      height: 4,
      backgroundColor: theme.border,
      borderRadius: 2,
      marginBottom: 16,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.accent,
      borderRadius: 2,
    },
    photoContainer: {
      alignItems: 'center',
      marginVertical: 20,
    },
    coverPhotoSection: {
      alignItems: 'center',
      marginBottom: 20,
    },
    coverPhotoPlaceholder: {
      width: '100%',
      height: 200,
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.border,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    coverPhoto: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      marginBottom: 12,
    },
    uploadButton: {
      backgroundColor: theme.accent,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    uploadButtonText: {
      color: '#000',
      fontWeight: '600',
    },
    profileSection: {
      alignItems: 'center',
      marginBottom: 20,
    },
    profileImageContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.card,
      borderWidth: 3,
      borderColor: theme.accent,
    },
    profileImagePlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.card,
      borderWidth: 2,
      borderColor: theme.border,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
    },
    changeProfileButton: {
      backgroundColor: theme.card,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    changeProfileButtonText: {
      color: theme.text,
      fontSize: 14,
    },
  });

export const ShopOnboarding: React.FC<ShopOnboardingProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const { user, token, refreshUser } = useAuth();
  const styles = createStyles(theme);

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [businessData, setBusinessData] = useState({
    description: '',
    targetAudience: '',
    uniqueSellingPoint: '',
  });

  const [setupData, setSetupData] = useState({
    shippingRegions: [] as string[],
    paymentMethods: [] as string[],
    returnPolicy: '',
    estimatedShippingTime: '',
  });

  const [photoData, setPhotoData] = useState({
    coverPhoto: null as string | null,
    profilePicture: user?.avatar || null as string | null,
    uploadingCover: false,
    uploadingProfile: false,
  });

  const totalSteps = 4;

  const pickImage = async (type: 'cover' | 'profile') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'cover' ? [16, 9] : [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri, type);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri: string, type: 'cover' | 'profile') => {
    try {
      if (type === 'cover') {
        setPhotoData(prev => ({ ...prev, uploadingCover: true }));
      } else {
        setPhotoData(prev => ({ ...prev, uploadingProfile: true }));
      }

      const formData = new FormData();
      formData.append('image', {
        uri,
        type: 'image/jpeg',
        name: `${type}_${Date.now()}.jpg`,
      } as any);

      const response = await axios.post(
        `${API_URL}/api/user/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status && response.data.data.url) {
        if (type === 'cover') {
          setPhotoData(prev => ({ ...prev, coverPhoto: response.data.data.url }));
        } else {
          setPhotoData(prev => ({ ...prev, profilePicture: response.data.data.url }));
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      if (type === 'cover') {
        setPhotoData(prev => ({ ...prev, uploadingCover: false }));
      } else {
        setPhotoData(prev => ({ ...prev, uploadingProfile: false }));
      }
    }
  };

  const toggleShippingRegion = (region: string) => {
    setSetupData(prev => ({
      ...prev,
      shippingRegions: prev.shippingRegions.includes(region)
        ? prev.shippingRegions.filter(r => r !== region)
        : [...prev.shippingRegions, region]
    }));
  };

  const togglePaymentMethod = (method: string) => {
    setSetupData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }));
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      setLoading(true);

      const shopOnboardingData = {
        businessInfo: {
          ...businessData,
          completed: true,
        },
        setupInfo: {
          ...setupData,
          completed: true,
        },
        photos: {
          coverPhoto: photoData.coverPhoto,
          completed: true,
        },
        isComplete: true,
        step: totalSteps,
      };

      // Update profile picture if changed
      const updateData: any = { shopOnboarding: shopOnboardingData };
      if (photoData.profilePicture && photoData.profilePicture !== user?.avatar) {
        updateData.avatar = photoData.profilePicture;
      }

      const response = await axios.put(
        `${API_URL}/api/user/complete-shop-onboarding`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        await refreshUser();
        onComplete();
      } else {
        Alert.alert('Error', 'Failed to complete shop onboarding');
      }
    } catch (error) {
      console.error('Error completing shop onboarding:', error);
      Alert.alert('Error', 'Failed to complete shop onboarding');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true; // Welcome step
      case 1:
        return photoData.coverPhoto !== null; // Cover photo is required
      case 2:
        return businessData.description.trim().length > 0 && 
               businessData.targetAudience.trim().length > 0;
      case 3:
        return setupData.shippingRegions.length > 0 && 
               setupData.paymentMethods.length > 0;
      default:
        return false;
    }
  };

  const renderWelcomeStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.icon}>
        <Store size={80} color={theme.accent} />
      </View>
      <Text style={styles.title}>Welcome to Your Shop!</Text>
      <Text style={styles.subtitle}>
        Congratulations on your promotion! Let's set up your shop to start selling and connecting with customers.
      </Text>
    </View>
  );

  const renderPhotoStep = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Shop Visuals</Text>
      <Text style={styles.subtitle}>
        Upload your shop's cover photo and update your profile picture
      </Text>

      <View style={styles.coverPhotoSection}>
        <Text style={styles.label}>Cover Photo *</Text>
        <Text style={[styles.subtitle, { marginBottom: 12, fontSize: 14 }]}>
          This will be displayed at the top of your shop profile
        </Text>
        
        {photoData.coverPhoto ? (
          <Image source={{ uri: photoData.coverPhoto }} style={styles.coverPhoto} />
        ) : (
          <View style={styles.coverPhotoPlaceholder}>
            <ImageIcon size={40} color={theme.textSecondary} />
            <Text style={[styles.subtitle, { marginTop: 8 }]}>No cover photo</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={() => pickImage('cover')}
          disabled={photoData.uploadingCover}
        >
          {photoData.uploadingCover ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <>
              <Camera size={20} color="#000" />
              <Text style={styles.uploadButtonText}>
                {photoData.coverPhoto ? 'Change Cover Photo' : 'Upload Cover Photo'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.label}>Profile Picture</Text>
        <Text style={[styles.subtitle, { marginBottom: 12, fontSize: 14 }]}>
          Update your profile picture or keep the current one
        </Text>
        
        <View style={styles.profileImageContainer}>
          {photoData.profilePicture ? (
            <Image source={{ uri: photoData.profilePicture }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <ImageIcon size={40} color={theme.textSecondary} />
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.changeProfileButton} 
          onPress={() => pickImage('profile')}
          disabled={photoData.uploadingProfile}
        >
          {photoData.uploadingProfile ? (
            <ActivityIndicator color={theme.text} size="small" />
          ) : (
            <Text style={styles.changeProfileButtonText}>
              {photoData.profilePicture ? 'Change Profile Picture' : 'Upload Profile Picture'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderBusinessInfoStep = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Tell us about your business</Text>
      <Text style={styles.subtitle}>
        Help customers understand what makes your shop special
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Business Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={businessData.description}
          onChangeText={(text) => setBusinessData(prev => ({ ...prev, description: text }))}
          placeholder="Describe your business, what you sell, and your story..."
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Target Audience *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={businessData.targetAudience}
          onChangeText={(text) => setBusinessData(prev => ({ ...prev, targetAudience: text }))}
          placeholder="Who are your ideal customers? (e.g., young professionals, parents, students...)"
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Unique Selling Point (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={businessData.uniqueSellingPoint}
          onChangeText={(text) => setBusinessData(prev => ({ ...prev, uniqueSellingPoint: text }))}
          placeholder="What makes your products or service unique? What sets you apart from competitors?"
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>
    </ScrollView>
  );

  const renderSetupStep = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Shop Setup</Text>
      <Text style={styles.subtitle}>
        Configure your shipping, payments, and policies
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Shipping Regions *</Text>
        <View style={styles.optionsGrid}>
          {SHIPPING_REGIONS.map((region) => (
            <TouchableOpacity
              key={region}
              style={[
                styles.option,
                setupData.shippingRegions.includes(region) && styles.optionSelected
              ]}
              onPress={() => toggleShippingRegion(region)}
            >
              <Text style={[
                styles.optionText,
                setupData.shippingRegions.includes(region) && styles.optionTextSelected
              ]}>
                {region}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Payment Methods *</Text>
        <View style={styles.optionsGrid}>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.option,
                setupData.paymentMethods.includes(method) && styles.optionSelected
              ]}
              onPress={() => togglePaymentMethod(method)}
            >
              <Text style={[
                styles.optionText,
                setupData.paymentMethods.includes(method) && styles.optionTextSelected
              ]}>
                {method}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Return Policy (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={setupData.returnPolicy}
          onChangeText={(text) => setSetupData(prev => ({ ...prev, returnPolicy: text }))}
          placeholder="Describe your return and refund policy..."
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Estimated Shipping Time (Optional)</Text>
        <TextInput
          style={styles.input}
          value={setupData.estimatedShippingTime}
          onChangeText={(text) => setSetupData(prev => ({ ...prev, estimatedShippingTime: text }))}
          placeholder="e.g., 2-5 business days, 1-2 weeks..."
          placeholderTextColor={theme.textSecondary}
        />
      </View>
    </ScrollView>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderWelcomeStep();
      case 1: return renderPhotoStep();
      case 2: return renderBusinessInfoStep();
      case 3: return renderSetupStep();
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {currentStep > 0 ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}

        <View style={styles.stepIndicator}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.stepDot,
                index <= currentStep && styles.stepDotActive
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.skipButton} onPress={onComplete}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${((currentStep + 1) / totalSteps) * 100}%` }
          ]} 
        />
      </View>

      {renderCurrentStep()}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!canProceed() || loading) && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!canProceed() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === totalSteps - 1 ? 'Complete Setup' : 'Continue'}
              </Text>
              <ArrowRight size={20} color="#000" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
