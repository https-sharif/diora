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
import {
  ArrowLeft,
  ArrowRight,
  Store,
  Camera,
  Image as ImageIcon,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Theme } from '@/types/Theme';
import { userService } from '@/services';
import axios from 'axios';
import { config } from '@/config';

interface ShopOnboardingProps {
  onComplete: () => void;
}

const BUSINESS_CATEGORIES = [
  "Women's Clothing",
  "Men's Clothing",
  'Shoes & Footwear',
  'Bags & Accessories',
  'Jewelry & Watches',
  'Activewear & Sports',
  'Other Fashion',
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
    stripeButton: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    stripeButtonText: {
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
  const [stripeConnected, setStripeConnected] = useState(false);

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
    coverPhoto: user?.shop?.coverImageUrl || (null as string | null),
    coverPhotoId: user?.shop?.coverImageId || (null as string | null),
    profilePicture: user?.avatar || (null as string | null),
    uploadingCover: false,
    uploadingProfile: false,
  });

  const totalSteps = 5;

  const pickImage = async (type: 'cover' | 'profile') => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Please grant camera roll permissions to upload images.'
        );
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
    } catch {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadPhoto = async (
    type: string,
    result: ImagePicker.ImagePickerResult
  ) => {
    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    const propertyName = type === 'cover' ? 'coverPhoto' : 'profilePicture';
    const uploadingProperty =
      type === 'cover' ? 'uploadingCover' : 'uploadingProfile';

    setPhotoData((prev) => ({
      ...prev,
      [propertyName]: asset.uri,
      [uploadingProperty]: true,
    }));

    showToast(
      'success',
      `${type.replace(/([A-Z])/g, ' $1').toLowerCase()} selected! Uploading...`
    );

    const formData = new FormData();
    formData.append('image', {
      uri: asset.uri,
      type: asset.type || 'image/jpeg',
      name: `${type}_${Date.now()}.${asset.uri.split('.').pop()}`,
    } as any);

    try {
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await userService.uploadImage(formData, token);

      if (response.status) {
        if (type === 'cover') {
          setPhotoData((prev) => ({
            ...prev,
            coverPhoto: response.data.url,
            coverPhotoId: response.data.id,
            uploadingCover: false,
          }));
        } else {
          setPhotoData((prev) => ({
            ...prev,
            [propertyName]: response.data.url,
            [uploadingProperty]: false,
          }));
        }
        showToast(
          'success',
          `${type
            .replace(/([A-Z])/g, ' $1')
            .toLowerCase()} uploaded successfully!`
        );
      } else {
        setPhotoData((prev) => ({
          ...prev,
          [propertyName]: null,
          [uploadingProperty]: false,
        }));
        showToast(
          'error',
          `Failed to upload ${type.replace(/([A-Z])/g, ' $1').toLowerCase()}`
        );
      }
    } catch {
      setPhotoData((prev) => ({
        ...prev,
        [propertyName]: null,
        [uploadingProperty]: false,
      }));
      showToast(
        'error',
        `Failed to upload ${type.replace(/([A-Z])/g, ' $1').toLowerCase()}`
      );
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      setLoading(true);

      if (!shopData.location.trim()) {
        Alert.alert('Error', 'Please provide a shop location');
        setLoading(false);
        return;
      }

      if (!photoData.coverPhoto || photoData.coverPhoto.trim().length === 0) {
        Alert.alert('Error', 'Please upload a cover photo for your shop');
        setLoading(false);
        return;
      }

      if (shopData.categories.length === 0) {
        Alert.alert(
          'Error',
          'Please select at least one category for your shop'
        );
        setLoading(false);
        return;
      }

      const shopOnboardingData = {
        isComplete: true,
        step: totalSteps,
      };

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
          coverImageId: photoData.coverPhotoId,
        },
      };
      if (
        photoData.profilePicture &&
        photoData.profilePicture !== user?.avatar
      ) {
        updateData.avatar = photoData.profilePicture;
      }

      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await userService.completeShopOnboarding(
        updateData,
        token
      );

      if (response.status) {
        await refreshUser();
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (!user?.onboarding?.isComplete) {
          await refreshUser();
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        const isCompleteInResponse = response?.user?.onboarding?.isComplete;
        const isCompleteInStore = user?.onboarding?.isComplete;
        if (isCompleteInResponse || isCompleteInStore) {
          onComplete();
        } else {
          await refreshUser();
          await new Promise((resolve) => setTimeout(resolve, 500));
          onComplete();
        }
      } else {
        Alert.alert(
          'Error',
          response.message || 'Failed to complete shop onboarding'
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to complete shop onboarding';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return shopData.location.trim().length > 0;
      case 2:
        const hasCoverPhoto =
          photoData.coverPhoto !== null &&
          photoData.coverPhoto.trim().length > 0;
        return hasCoverPhoto;
      case 3:
        return shopData.categories.length > 0;
      case 4:
        return stripeConnected;
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
        Congratulations on your promotion! Let&apos;s set up your shop to start
        selling and connecting with customers.
      </Text>
    </View>
  );

  const renderShopDetailsStep = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: '#000' }]}>Shop Details</Text>
      <Text style={[styles.subtitle, { color: '#000' }]}>
        Tell customers about your shop
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Shop Location *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your shop address or area"
          value={shopData.location}
          onChangeText={(text) =>
            setShopData((prev) => ({ ...prev, location: text }))
          }
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Contact Email</Text>
        <TextInput
          style={styles.input}
          placeholder="shop@example.com"
          value={shopData.contactEmail}
          onChangeText={(text) =>
            setShopData((prev) => ({ ...prev, contactEmail: text }))
          }
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Contact Phone</Text>
        <TextInput
          style={styles.input}
          placeholder="+1 (555) 123-4567"
          value={shopData.contactPhone}
          onChangeText={(text) =>
            setShopData((prev) => ({ ...prev, contactPhone: text }))
          }
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Website (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://yourshop.com"
          value={shopData.website}
          onChangeText={(text) =>
            setShopData((prev) => ({ ...prev, website: text }))
          }
          keyboardType="url"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Instagram (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="@yourshop"
          value={shopData.socialLinks.instagram}
          onChangeText={(text) =>
            setShopData((prev) => ({
              ...prev,
              socialLinks: { ...prev.socialLinks, instagram: text },
            }))
          }
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Facebook (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="facebook.com/yourshop"
          value={shopData.socialLinks.facebook}
          onChangeText={(text) =>
            setShopData((prev) => ({
              ...prev,
              socialLinks: { ...prev.socialLinks, facebook: text },
            }))
          }
        />
      </View>
    </ScrollView>
  );

  const renderImagesStep = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: '#000' }]}>Shop Images</Text>
      <Text style={[styles.subtitle, { color: '#000' }]}>
        Upload your shop&apos;s cover photo and profile picture
      </Text>

      <View style={styles.coverPhotoSection}>
        <Text style={styles.label}>Cover Photo *</Text>
        <Text style={[styles.subtitle, { marginBottom: 12, fontSize: 14 }]}>
          This will be displayed at the top of your shop profile
        </Text>

        {photoData.coverPhoto ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: photoData.coverPhoto }}
              style={styles.coverPhoto}
            />
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
            <Text style={[styles.subtitle, { marginTop: 8 }]}>
              No cover photo
            </Text>
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
                {photoData.coverPhoto
                  ? 'Change Cover Photo'
                  : 'Upload Cover Photo'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.label}>Profile Picture</Text>
        <Text style={[styles.subtitle, { marginBottom: 12, fontSize: 14 }]}>
          This will be your shop&apos;s avatar
        </Text>

        <View style={styles.profileImageContainer}>
          {photoData.profilePicture ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: photoData.profilePicture }}
                style={styles.profileImage}
              />
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
              {photoData.profilePicture
                ? 'Change Profile Picture'
                : 'Upload Profile Picture'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderCategoriesStep = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: '#000' }]}>Shop Categories</Text>
      <Text style={[styles.subtitle, { color: '#000' }]}>
        What type of products do you sell? Select all that apply.
      </Text>

      <View style={styles.optionsGrid}>
        {BUSINESS_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.option,
              shopData.categories.includes(category) && styles.optionSelected,
            ]}
            onPress={() => {
              setShopData((prev) => ({
                ...prev,
                categories: prev.categories.includes(category)
                  ? prev.categories.filter((c: string) => c !== category)
                  : [...prev.categories, category],
              }));
            }}
          >
            <Text
              style={[
                styles.optionText,
                shopData.categories.includes(category) &&
                  styles.optionTextSelected,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {shopData.categories.length > 0 && (
        <View
          style={{
            marginTop: 20,
            paddingTop: 20,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          <Text style={[styles.label, { marginBottom: 8 }]}>
            Selected Categories:
          </Text>
          <Text style={[styles.subtitle, { fontSize: 14 }]}>
            {shopData.categories.join(', ')}
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const handleStripeOnboarding = async () => {
    try {
      setLoading(true);
      const statusRes = await axios.get(
        `${config.apiUrl}/api/stripe/check-onboarding-status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (statusRes.data.onboarded) {
        setStripeConnected(true);
        handleNext();
        return;
      }

      const { data } = await axios.post(
        `${config.apiUrl}/api/stripe/create-account-link`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.url) {
        setStripeConnected(true);
        handleNext();
      } else {
        alert('Failed to get Stripe onboarding link.');
      }
    } catch {
      alert('Failed to connect Stripe. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStripeOnboardingStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.title}>Connect Your Stripe Account</Text>
      <Text style={styles.subtitle}>
        You need a Stripe account to receive payments from customers.
      </Text>

      <TouchableOpacity
        style={styles.stripeButton}
        onPress={handleStripeOnboarding}
      >
        <Text style={styles.stripeButtonText}>Connect with Stripe</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return renderShopDetailsStep();
      case 2:
        return renderImagesStep();
      case 3:
        return renderCategoriesStep();
      case 4:
        return renderStripeOnboardingStep();
      default:
        return null;
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
                index <= currentStep && styles.stepDotActive,
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
            { width: `${((currentStep + 1) / totalSteps) * 100}%` },
          ]}
        />
      </View>

      {renderCurrentStep()}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!canProceed() || loading) && styles.nextButtonDisabled,
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
}
