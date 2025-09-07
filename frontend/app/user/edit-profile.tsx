import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, Save } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/types/Theme';
import * as ImagePicker from 'expo-image-picker';
import { userService } from '@/services/userService';
import { showToast } from '@/utils/toastUtils';

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
    profileImageContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    profileImageWrapper: {
      width: 120,
      height: 120,
      borderRadius: 60,
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
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
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
    characterCount: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'right',
      marginTop: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default function EditUserProfile() {
  const { user, token, setUser } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const [selectedFile, setSelectedFile] = useState<any>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      showToast.error('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      setSelectedFile({
        uri: asset.uri,
        type: 'image/jpeg',
        name: `avatar_${Date.now()}.jpg`,
      });

      setFormData((prev) => ({ ...prev, avatar: asset.uri }));
    }
  };

  const handleSave = async () => {
    if (!token) return;

    try {
      setSaving(true);

      const requestFormData = new FormData();

      requestFormData.append('fullName', formData.fullName);
      requestFormData.append('username', formData.username);
      requestFormData.append('bio', formData.bio);

      if (selectedFile) {
        requestFormData.append('avatar', selectedFile as any);
      }

      const response = await userService.updateProfile(requestFormData, token);

      if (response.status) {
        showToast.success('Profile updated successfully!');
        setUser(response.user);
        router.back();
      } else {
        showToast.error(response.message || 'Failed to update profile');
      }
    } catch {
      showToast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user || (user.type !== 'user' && user.type !== 'admin')) {
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
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
        <View style={styles.profileImageContainer}>
          <TouchableOpacity
            style={styles.profileImageWrapper}
            onPress={pickImage}
          >
            {formData.avatar ? (
              <Image
                source={{ uri: formData.avatar }}
                style={styles.profileImage}
              />
            ) : (
              <View
                style={[styles.profileImage, { backgroundColor: theme.border }]}
              />
            )}
            <View style={styles.profileImageOverlay}>
              <View style={styles.imageButton}>
                <Camera size={16} color="white" />
                <Text style={styles.imageButtonText}>
                  {formData.avatar ? 'Change' : 'Add Photo'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              placeholder="Enter your full name"
              placeholderTextColor={theme.textSecondary}
              maxLength={50}
            />
            <Text style={styles.characterCount}>
              {formData.fullName.length}/50
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(value) =>
                handleInputChange('username', value.toLowerCase())
              }
              placeholder="Enter your username"
              placeholderTextColor={theme.textSecondary}
              maxLength={20}
            />
            <Text style={styles.characterCount}>
              {formData.username.length}/20
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(value) => handleInputChange('bio', value)}
              placeholder="Tell us about yourself..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
              maxLength={200}
            />
            <Text style={styles.characterCount}>{formData.bio.length}/200</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
