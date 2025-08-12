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
import { ArrowLeft, ArrowRight, User, Camera, Upload } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { Theme } from '@/types/Theme';
import { userService } from '@/services';
import * as ImagePicker from 'expo-image-picker';

interface UserOnboardingProps {
  onComplete: () => void;
}

const FASHION_INTERESTS = [
  'Streetwear', 'Luxury Fashion', 'Vintage/Thrift', 'Sustainable Fashion', 'Activewear',
  'Formal Wear', 'Casual Wear', 'Designer Items', 'Accessories', 'Shoes',
  'Jewelry', 'Bags & Purses', 'Makeup & Beauty', 'Skincare', 'Hair Care'
];

const FASHION_CATEGORIES = [
  'Women\'s Clothing', 'Men\'s Clothing', 'Shoes', 'Accessories', 'Jewelry',
  'Bags & Handbags', 'Beauty & Skincare', 'Watches', 'Sunglasses', 'Activewear'
];

const STYLE_PREFERENCES = [
  'Minimalist', 'Bohemian', 'Classic/Timeless', 'Trendy/Fashion Forward', 'Edgy/Alternative',
  'Romantic/Feminine', 'Sporty/Casual', 'Professional/Business', 'Vintage/Retro', 'Streetwear'
];

export const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const { user, token, refreshUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    bio: '',
    dateOfBirth: '',
    gender: null as string | null,
    location: '',
    interests: [] as string[],
    stylePreferences: [] as string[],
  });

  const [profileImage, setProfileImage] = useState<any>(null);

  const [preferencesData, setPreferencesData] = useState({
    favoriteCategories: [] as string[],
    shoppingFrequency: null as string | null,
    budgetRange: null as string | null,
  });

  const totalSteps = 4;

  const pickProfileImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setProfileImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const toggleInterest = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const toggleStylePreference = (style: string) => {
    setProfileData(prev => ({
      ...prev,
      stylePreferences: prev.stylePreferences.includes(style)
        ? prev.stylePreferences.filter(s => s !== style)
        : [...prev.stylePreferences, style]
    }));
  };

  const toggleCategory = (category: string) => {
    setPreferencesData(prev => ({
      ...prev,
      favoriteCategories: prev.favoriteCategories.includes(category)
        ? prev.favoriteCategories.filter(c => c !== category)
        : [...prev.favoriteCategories, category]
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

      // First upload profile image if provided
      let avatarUrl = user?.avatar;
      if (profileImage) {
        if (!token) {
          Alert.alert('Error', 'No authentication token available');
          return;
        }

        const imageFormData = new FormData();
        imageFormData.append('avatar', {
          uri: profileImage.uri,
          type: profileImage.type || 'image/jpeg',
          name: profileImage.fileName || 'profile.jpg',
        } as any);

        const uploadResponse = await userService.updateProfileWithImage(imageFormData, token);

        if (uploadResponse.status) {
          avatarUrl = uploadResponse.user.avatar;
        }
      }

      // Update profile information
      const profileUpdateData = {
        fullName: profileData.fullName,
        bio: profileData.bio,
      };

      if (!token) {
        Alert.alert('Error', 'No authentication token available');
        return;
      }

      await userService.updateProfileDetails(profileUpdateData, token);

      // Complete onboarding
      const cleanedProfile = {
        ...profileData,
        completed: true,
        // Convert empty strings to null for enum fields
        gender: profileData.gender || null,
      };

      const cleanedPreferences = {
        ...preferencesData,
        completed: true,
        // Convert empty strings to null for enum fields
        shoppingFrequency: preferencesData.shoppingFrequency || null,
        budgetRange: preferencesData.budgetRange || null,
      };

      const onboardingData = {
        profile: cleanedProfile,
        preferences: cleanedPreferences,
        isComplete: true,
        step: totalSteps,
      };

      const response = await userService.completeUserOnboarding(
        { onboarding: onboardingData },
        token
      );

      if (response.status) {
        await refreshUser();
        onComplete();
      } else {
        Alert.alert('Error', 'Failed to complete onboarding');
      }
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      if (error.response?.data?.message) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'Failed to complete onboarding');
      }
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true; // Welcome step
      case 1:
        return profileImage !== null; // Profile picture required
      case 2:
        return profileData.fullName.trim().length > 0 && 
               profileData.bio.trim().length > 0 &&
               profileData.interests.length > 0;
      case 3:
        return preferencesData.favoriteCategories.length > 0;
      default:
        return false;
    }
  };

  const renderWelcomeStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.icon}>
        <User size={80} color={theme.accent} />
      </View>
      <Text style={styles.title}>Welcome to Diora!</Text>
      <Text style={styles.subtitle}>
        Your ultimate fashion destination! Let's personalize your experience to help you discover amazing styles and connect with fashion-forward shops.
      </Text>
    </View>
  );

  const renderProfilePictureStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.title}>Add Your Profile Picture</Text>
      <Text style={styles.subtitle}>
        Show your style! Upload a profile picture to personalize your fashion journey.
      </Text>
      
      <TouchableOpacity style={styles.profileImageContainer} onPress={pickProfileImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage.uri }} style={styles.profileImagePreview} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Camera size={40} color={theme.textSecondary} />
            <Text style={styles.profileImageText}>Tap to upload photo</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderProfileStep = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>
        Tell us about yourself and your fashion interests
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={profileData.fullName}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, fullName: text }))}
          placeholder="Enter your full name"
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bio *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={profileData.bio}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
          placeholder="Tell us about your style and what you love about fashion..."
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Location (Optional)</Text>
        <TextInput
          style={styles.input}
          value={profileData.location}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, location: text }))}
          placeholder="Enter your city or region"
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gender (Optional)</Text>
        <View style={styles.optionsGrid}>
          {['male', 'female', 'other', 'prefer-not-to-say'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                profileData.gender === option && styles.optionSelected
              ]}
              onPress={() => setProfileData(prev => ({ ...prev, gender: option }))}
            >
              <Text style={[
                styles.optionText,
                profileData.gender === option && styles.optionTextSelected
              ]}>
                {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Fashion Interests *</Text>
        <View style={styles.optionsGrid}>
          {FASHION_INTERESTS.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.option,
                profileData.interests.includes(interest) && styles.optionSelected
              ]}
              onPress={() => toggleInterest(interest)}
            >
              <Text style={[
                styles.optionText,
                profileData.interests.includes(interest) && styles.optionTextSelected
              ]}>
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Style Preferences</Text>
        <View style={styles.optionsGrid}>
          {STYLE_PREFERENCES.map((style) => (
            <TouchableOpacity
              key={style}
              style={[
                styles.option,
                profileData.stylePreferences.includes(style) && styles.optionSelected
              ]}
              onPress={() => toggleStylePreference(style)}
            >
              <Text style={[
                styles.optionText,
                profileData.stylePreferences.includes(style) && styles.optionTextSelected
              ]}>
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderPreferencesStep = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Shopping Preferences</Text>
      <Text style={styles.subtitle}>
        Help us curate the perfect shopping experience for you
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Favorite Categories *</Text>
        <View style={styles.optionsGrid}>
          {FASHION_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.option,
                preferencesData.favoriteCategories.includes(category) && styles.optionSelected
              ]}
              onPress={() => toggleCategory(category)}
            >
              <Text style={[
                styles.optionText,
                preferencesData.favoriteCategories.includes(category) && styles.optionTextSelected
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Shopping Frequency (Optional)</Text>
        <View style={styles.optionsGrid}>
          {[
            { key: 'rarely', label: 'Rarely' },
            { key: 'monthly', label: 'Monthly' },
            { key: 'weekly', label: 'Weekly' },
            { key: 'daily', label: 'Daily' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.option,
                preferencesData.shoppingFrequency === option.key && styles.optionSelected
              ]}
              onPress={() => setPreferencesData(prev => ({ ...prev, shoppingFrequency: option.key }))}
            >
              <Text style={[
                styles.optionText,
                preferencesData.shoppingFrequency === option.key && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Budget Range (Optional)</Text>
        <View style={styles.optionsGrid}>
          {[
            { key: 'under-50', label: 'Under $50' },
            { key: '50-200', label: '$50 - $200' },
            { key: '200-500', label: '$200 - $500' },
            { key: '500-1000', label: '$500 - $1000' },
            { key: 'over-1000', label: 'Over $1000' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.option,
                preferencesData.budgetRange === option.key && styles.optionSelected
              ]}
              onPress={() => setPreferencesData(prev => ({ ...prev, budgetRange: option.key }))}
            >
              <Text style={[
                styles.optionText,
                preferencesData.budgetRange === option.key && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderWelcomeStep();
      case 1: return renderProfilePictureStep();
      case 2: return renderProfileStep();
      case 3: return renderPreferencesStep();
      default: return null;
    }
  };

  const styles = StyleSheet.create({
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
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    skipButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    skipText: {
      color: theme.textSecondary,
      fontSize: 16,
    },
    stepIndicator: {
      flexDirection: 'row',
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
    progressBar: {
      height: 3,
      backgroundColor: theme.card,
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 1.5,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.accent,
      borderRadius: 1.5,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    stepContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    icon: {
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 40,
    },
    profileImageContainer: {
      alignSelf: 'center',
      marginBottom: 30,
      borderRadius: 80,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    profileImagePreview: {
      width: 160,
      height: 160,
      borderRadius: 80,
    },
    profileImagePlaceholder: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: theme.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.border,
      borderStyle: 'dashed',
    },
    profileImageText: {
      marginTop: 8,
      color: theme.textSecondary,
      fontSize: 14,
      textAlign: 'center',
    },
    inputGroup: {
      marginBottom: 24,
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
      minHeight: 80,
      textAlignVertical: 'top',
    },
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    option: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: theme.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    optionSelected: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    optionText: {
      fontSize: 14,
      color: theme.text,
    },
    optionTextSelected: {
      color: '#000',
    },
    footer: {
      padding: 20,
    },
    nextButton: {
      backgroundColor: theme.accent,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    nextButtonDisabled: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    nextButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#000',
    },
  });

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
                {currentStep === totalSteps - 1 ? 'Complete' : 'Continue'}
              </Text>
              <ArrowRight size={20} color="#000" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default UserOnboarding;
