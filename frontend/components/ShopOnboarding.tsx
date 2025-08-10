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
import { useToast } from '@/hooks/useToast';
import { Theme } from '@/types/Theme';
import axios from 'axios';
import { API_URL } from '@/constants/api';

interface ShopOnboardingProps {
  onComplete: () => void;
}

const BUSINESS_CATEGORIES = [
  'Women\'s Clothing', 'Men\'s Clothing', 'Shoes & Footwear', 'Bags & Accessories', 
  'Jewelry & Watches', 'Activewear & Sports', 'Other Fashion'
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
    imageContainer: {
      position: 'relative',
    },
    uploadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    uploadingText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
  });

export default function ShopOnboarding({ onComplete }: ShopOnboardingProps) {
  const { theme } = useTheme();
  const { user, token, refreshUser } = useAuth();
  const { showToast } = useToast();
  const styles = createStyles(theme);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [shopData, setShopData] = useState({
    location: user?.shop?.location || '',
    contactEmail: user?.shop?.contactEmail || '',
    contactPhone: user?.shop?.contactPhone || '',
    website: user?.shop?.website || '',
    socialLinks: {
      facebook: user?.shop?.socialLinks?.facebook || '',
      instagram: user?.shop?.socialLinks?.instagram || '',
      twitter: user?.shop?.socialLinks?.twitter || '',
      tiktok: user?.shop?.socialLinks?.tiktok || '',
    },
    categories: user?.shop?.categories || [],
  });

  const [photoData, setPhotoData] = useState({
    coverPhoto: user?.shop?.coverImageUrl || null as string | null,
    coverPhotoId: user?.shop?.coverImageId || null as string | null,
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
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: type === 'cover' ? [16, 9] : [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(type, result);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

    const uploadPhoto = async (type: string, result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) {
      console.log('Photo upload cancelled by user');
      return;
    }

    const asset = result.assets[0];
    console.log('Starting photo upload - Type:', type, 'Asset URI:', asset.uri);
    
    // Map the type to the correct property name
    const propertyName = type === 'cover' ? 'coverPhoto' : 'profilePicture';
    const uploadingProperty = type === 'cover' ? 'uploadingCover' : 'uploadingProfile';

    // Optimistic update - immediately show the image in UI
    setPhotoData(prev => ({
      ...prev,
      [propertyName]: asset.uri, // Use local URI for immediate display
      [uploadingProperty]: true
    }));

    console.log('Optimistic update applied - showing local image immediately');
    showToast('success', `${type.replace(/([A-Z])/g, ' $1').toLowerCase()} selected! Uploading...`);
    
    const formData = new FormData();
    formData.append('image', {
      uri: asset.uri,
      type: asset.type || 'image/jpeg',
      name: `${type}_${Date.now()}.${asset.uri.split('.').pop()}`,
    } as any);

    // Background upload
    try {
      const response = await axios.post(`${API_URL}/api/user/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Photo upload response:', response.data);
      console.log('Response status:', response.status);

      if (response.data.status) {
        // Update with the actual cloud URL and ID after successful upload
        if (type === 'cover') {
          setPhotoData(prev => ({
            ...prev,
            coverPhoto: response.data.data.url,
            coverPhotoId: response.data.data.id,
            uploadingCover: false
          }));
        } else {
          setPhotoData(prev => ({
            ...prev,
            [propertyName]: response.data.data.url,
            [uploadingProperty]: false
          }));
        }
        console.log('Upload completed - URL:', response.data.data.url, 'ID:', response.data.data.id);
        showToast('success', `${type.replace(/([A-Z])/g, ' $1').toLowerCase()} uploaded successfully!`);
      } else {
        // Revert optimistic update on failure
        setPhotoData(prev => ({
          ...prev,
          [propertyName]: null,
          [uploadingProperty]: false
        }));
        console.error('Upload failed - Response:', response.data);
        showToast('error', `Failed to upload ${type.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setPhotoData(prev => ({
        ...prev,
        [propertyName]: null,
        [uploadingProperty]: false
      }));
      console.error('Photo upload error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      showToast('error', `Failed to upload ${type.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    }
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

      console.log('Starting shop onboarding completion...');
      console.log('Cover photo:', photoData.coverPhoto);

      const shopOnboardingData = {
        isComplete: true,
        step: totalSteps,
      };

      // Update data including cover image in shop object
      const updateData: any = { 
        onboarding: shopOnboardingData,
        shop: {
          location: shopData.location,
          contactEmail: shopData.contactEmail,
          contactPhone: shopData.contactPhone,
          website: shopData.website,
          socialLinks: shopData.socialLinks,
          categories: shopData.categories,
          coverImageUrl: photoData.coverPhoto,
          coverImageId: photoData.coverPhotoId
        }
      };
      if (photoData.profilePicture && photoData.profilePicture !== user?.avatar) {
        updateData.avatar = photoData.profilePicture;
      }

      console.log('Sending shop onboarding data:', updateData);

      const response = await axios.put(
        `${API_URL}/api/user/complete-shop-onboarding`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Shop onboarding response:', response.data);

      if (response.data.status) {
        console.log('Shop onboarding completed successfully');
        console.log('Backend response user data:', JSON.stringify(response.data.user?.onboarding, null, 2));
        
        // First refresh to sync latest data
        console.log('🔄 First refresh attempt...');
        await refreshUser();
        
        // Wait for state to propagate
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log('User state after first refresh:', JSON.stringify(user?.onboarding, null, 2));
        console.log('Shop onboarding isComplete after first refresh:', user?.onboarding?.isComplete);
        
        // Double check with another refresh if not complete yet
        if (!user?.onboarding?.isComplete) {
          console.log('🔄 Not complete yet, trying second refresh...');
          await refreshUser();
          await new Promise(resolve => setTimeout(resolve, 300));
          console.log('User state after second refresh:', JSON.stringify(user?.onboarding, null, 2));
        }
        
        // Verify completion before calling onComplete
        const isCompleteInResponse = response.data.user?.onboarding?.isComplete;
        const isCompleteInStore = user?.onboarding?.isComplete;
        
        console.log('🔍 Final verification:');
        console.log('  - Backend response says complete:', isCompleteInResponse);
        console.log('  - Store state says complete:', isCompleteInStore);
        
        if (isCompleteInResponse || isCompleteInStore) {
          console.log('✅ Shop onboarding verified as complete, calling onComplete...');
          onComplete();
        } else {
          console.log('❌ Shop onboarding not marked as complete anywhere, forcing completion...');
          // Force another sync attempt
          await refreshUser();
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Call onComplete anyway since backend succeeded
          console.log('🔧 Forcing completion despite state mismatch...');
          onComplete();
        }
      } else {
        console.error('Shop onboarding failed:', response.data.message);
        Alert.alert('Error', response.data.message || 'Failed to complete shop onboarding');
      }
    } catch (error: any) {
      console.error('Error completing shop onboarding:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.message || 'Failed to complete shop onboarding');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true; // Welcome step
      case 1:
        // Shop details step - require location
        return shopData.location.trim().length > 0;
      case 2:
        // Images step - require cover photo
        const hasCoverPhoto = photoData.coverPhoto !== null && photoData.coverPhoto.trim().length > 0;
        return hasCoverPhoto;
      case 3:
        // Categories step - require at least one category
        return shopData.categories.length > 0;
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
          <View style={styles.imageContainer}>
            <Image source={{ uri: photoData.coverPhoto }} style={styles.coverPhoto} />
            {photoData.uploadingCover && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}
          </View>
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
            <View style={styles.imageContainer}>
              <Image source={{ uri: photoData.profilePicture }} style={styles.profileImage} />
              {photoData.uploadingProfile && (
                <View style={[styles.uploadingOverlay, { borderRadius: 60 }]}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
            </View>
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

  const renderShopDetailsStep = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: '#000' }]}>Shop Details</Text>
      <Text style={[styles.subtitle, { color: '#000' }]}>Tell customers about your shop</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Shop Location *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your shop address or area"
          value={shopData.location}
          onChangeText={(text) => setShopData(prev => ({ ...prev, location: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Contact Email</Text>
        <TextInput
          style={styles.input}
          placeholder="shop@example.com"
          value={shopData.contactEmail}
          onChangeText={(text) => setShopData(prev => ({ ...prev, contactEmail: text }))}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Contact Phone</Text>
        <TextInput
          style={styles.input}
          placeholder="+1 (555) 123-4567"
          value={shopData.contactPhone}
          onChangeText={(text) => setShopData(prev => ({ ...prev, contactPhone: text }))}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Website (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://yourshop.com"
          value={shopData.website}
          onChangeText={(text) => setShopData(prev => ({ ...prev, website: text }))}
          keyboardType="url"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Instagram (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="@yourshop"
          value={shopData.socialLinks.instagram}
          onChangeText={(text) => setShopData(prev => ({ 
            ...prev, 
            socialLinks: { ...prev.socialLinks, instagram: text }
          }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Facebook (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="facebook.com/yourshop"
          value={shopData.socialLinks.facebook}
          onChangeText={(text) => setShopData(prev => ({ 
            ...prev, 
            socialLinks: { ...prev.socialLinks, facebook: text }
          }))}
        />
      </View>
    </ScrollView>
  );

  const renderImagesStep = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: '#000' }]}>Shop Images</Text>
      <Text style={[styles.subtitle, { color: '#000' }]}>Upload your shop's cover photo and profile picture</Text>

      <View style={styles.coverPhotoSection}>
        <Text style={styles.label}>Cover Photo *</Text>
        <Text style={[styles.subtitle, { marginBottom: 12, fontSize: 14 }]}>
          This will be displayed at the top of your shop profile
        </Text>
        
        {photoData.coverPhoto ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: photoData.coverPhoto }} style={styles.coverPhoto} />
            {photoData.uploadingCover && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}
          </View>
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
          This will be your shop's avatar
        </Text>
        
        <View style={styles.profileImageContainer}>
          {photoData.profilePicture ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: photoData.profilePicture }} style={styles.profileImage} />
              {photoData.uploadingProfile && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
            </View>
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

  const renderCategoriesStep = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: '#000' }]}>Shop Categories</Text>
      <Text style={[styles.subtitle, { color: '#000' }]}>What type of products do you sell? Select all that apply.</Text>
      
      <View style={styles.optionsGrid}>
        {BUSINESS_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.option,
              shopData.categories.includes(category) && styles.optionSelected
            ]}
            onPress={() => {
              setShopData(prev => ({
                ...prev,
                categories: prev.categories.includes(category)
                  ? prev.categories.filter(c => c !== category)
                  : [...prev.categories, category]
              }));
            }}
          >
            <Text style={[
              styles.optionText,
              shopData.categories.includes(category) && styles.optionTextSelected
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {shopData.categories.length > 0 && (
        <View style={{ marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: theme.border }}>
          <Text style={[styles.label, { marginBottom: 8 }]}>Selected Categories:</Text>
          <Text style={[styles.subtitle, { fontSize: 14 }]}>
            {shopData.categories.join(', ')}
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderWelcomeStep();
      case 1: return renderShopDetailsStep();
      case 2: return renderImagesStep();
      case 3: return renderCategoriesStep();
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

        <View style={styles.skipButton} />
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
