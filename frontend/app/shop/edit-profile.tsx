import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, Save, Globe, Phone, Mail, MapPin } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/types/Theme';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import * as ImagePicker from 'expo-image-picker';

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
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
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
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 8,
    },
    saveButtonText: {
      color: 'white',
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    content: {
      flex: 1,
    },
    section: {
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 16,
    },
    coverImageContainer: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: theme.card,
      position: 'relative',
    },
    coverImage: {
      width: '100%',
      height: '100%',
    },
    coverImageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageButton: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      padding: 12,
      borderRadius: 25,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    imageButtonText: {
      color: 'white',
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    profileImageContainer: {
      alignItems: 'center',
      marginTop: -50,
      marginBottom: 16,
    },
    profileImageWrapper: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.card,
      borderWidth: 4,
      borderColor: theme.background,
      overflow: 'hidden',
      position: 'relative',
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    profileImageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
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
    socialSection: {
      marginTop: 8,
    },
    socialInput: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 12,
    },
    socialIcon: {
      paddingHorizontal: 12,
    },
    socialTextInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default function EditShopProfile() {
  const { user, token, setUser } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    coverImageUrl: user?.shop?.coverImageUrl || '',
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
  });

  // Store actual files for upload
  const [selectedFiles, setSelectedFiles] = useState<{
    avatar?: any;
    coverImage?: any;
  }>({});

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('social.')) {
      const socialField = field.replace('social.', '');
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const pickImage = async (type: 'avatar' | 'cover') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      // Store the file for upload
      setSelectedFiles(prev => ({
        ...prev,
        [type === 'avatar' ? 'avatar' : 'coverImage']: {
          uri: asset.uri,
          type: 'image/jpeg',
          name: `${type}_${Date.now()}.jpg`,
        }
      }));

      // Update form data with URI for preview
      if (type === 'avatar') {
        setFormData(prev => ({ ...prev, avatar: asset.uri }));
      } else {
        setFormData(prev => ({ ...prev, coverImageUrl: asset.uri }));
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const requestFormData = new FormData();
      
      // Append text fields
      requestFormData.append('fullName', formData.fullName);
      requestFormData.append('bio', formData.bio);
      requestFormData.append('location', formData.location);
      requestFormData.append('contactEmail', formData.contactEmail);
      requestFormData.append('contactPhone', formData.contactPhone);
      requestFormData.append('website', formData.website);
      requestFormData.append('socialLinks', JSON.stringify(formData.socialLinks));
      
      // Append files if selected
      if (selectedFiles.avatar) {
        requestFormData.append('avatar', selectedFiles.avatar as any);
      }
      
      if (selectedFiles.coverImage) {
        requestFormData.append('coverImage', selectedFiles.coverImage as any);
      }

      const response = await axios.put(`${API_URL}/api/shop/profile`, requestFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData, let axios handle it
        },
      });

      if (response.data.status) {
        Alert.alert('Success', 'Profile updated successfully!');
        setUser(response.data.user); // Update user data
        router.back();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.type !== 'shop') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.label}>Access denied</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Shop Profile</Text>
        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Save size={16} color="white" />
          )}
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cover Image</Text>
          <TouchableOpacity
            style={styles.coverImageContainer}
            onPress={() => pickImage('cover')}
          >
            {formData.coverImageUrl ? (
              <Image source={{ uri: formData.coverImageUrl }} style={styles.coverImage} />
            ) : null}
            <View style={styles.coverImageOverlay}>
              <View style={styles.imageButton}>
                <Camera size={20} color="white" />
                <Text style={styles.imageButtonText}>
                  {formData.coverImageUrl ? 'Change Cover' : 'Add Cover'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <TouchableOpacity
            style={styles.profileImageWrapper}
            onPress={() => pickImage('avatar')}
          >
            {formData.avatar ? (
              <Image source={{ uri: formData.avatar }} style={styles.profileImage} />
            ) : null}
            <View style={styles.profileImageOverlay}>
              <Camera size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Shop Name</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              placeholder="Enter shop name"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(value) => handleInputChange('bio', value)}
              placeholder="Describe your shop..."
              placeholderTextColor={theme.textSecondary}
              multiline
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.socialInput}>
              <View style={styles.socialIcon}>
                <MapPin size={20} color={theme.textSecondary} />
              </View>
              <TextInput
                style={styles.socialTextInput}
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                placeholder="Shop location"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Email</Text>
            <View style={styles.socialInput}>
              <View style={styles.socialIcon}>
                <Mail size={20} color={theme.textSecondary} />
              </View>
              <TextInput
                style={styles.socialTextInput}
                value={formData.contactEmail}
                onChangeText={(value) => handleInputChange('contactEmail', value)}
                placeholder="contact@shop.com"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Phone</Text>
            <View style={styles.socialInput}>
              <View style={styles.socialIcon}>
                <Phone size={20} color={theme.textSecondary} />
              </View>
              <TextInput
                style={styles.socialTextInput}
                value={formData.contactPhone}
                onChangeText={(value) => handleInputChange('contactPhone', value)}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website</Text>
            <View style={styles.socialInput}>
              <View style={styles.socialIcon}>
                <Globe size={20} color={theme.textSecondary} />
              </View>
              <TextInput
                style={styles.socialTextInput}
                value={formData.website}
                onChangeText={(value) => handleInputChange('website', value)}
                placeholder="https://yourshop.com"
                placeholderTextColor={theme.textSecondary}
                keyboardType="url"
              />
            </View>
          </View>
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Facebook</Text>
            <View style={styles.socialInput}>
              <View style={styles.socialIcon}>
                <Text style={{ color: '#1877F2', fontWeight: 'bold' }}>f</Text>
              </View>
              <TextInput
                style={styles.socialTextInput}
                value={formData.socialLinks.facebook}
                onChangeText={(value) => handleInputChange('social.facebook', value)}
                placeholder="Facebook profile/page URL"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instagram</Text>
            <View style={styles.socialInput}>
              <View style={styles.socialIcon}>
                <Text style={{ color: '#E4405F', fontWeight: 'bold' }}>📷</Text>
              </View>
              <TextInput
                style={styles.socialTextInput}
                value={formData.socialLinks.instagram}
                onChangeText={(value) => handleInputChange('social.instagram', value)}
                placeholder="Instagram profile URL"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Twitter</Text>
            <View style={styles.socialInput}>
              <View style={styles.socialIcon}>
                <Text style={{ color: '#1DA1F2', fontWeight: 'bold' }}>🐦</Text>
              </View>
              <TextInput
                style={styles.socialTextInput}
                value={formData.socialLinks.twitter}
                onChangeText={(value) => handleInputChange('social.twitter', value)}
                placeholder="Twitter profile URL"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>TikTok</Text>
            <View style={styles.socialInput}>
              <View style={styles.socialIcon}>
                <Text style={{ color: '#000000', fontWeight: 'bold' }}>🎵</Text>
              </View>
              <TextInput
                style={styles.socialTextInput}
                value={formData.socialLinks.tiktok}
                onChangeText={(value) => handleInputChange('social.tiktok', value)}
                placeholder="TikTok profile URL"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
