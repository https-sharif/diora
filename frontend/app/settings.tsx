import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  Palette,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Camera,
  X,
  TriangleAlert as AlertTriangle,
  ImageIcon,
  ImageOff,
  Store,
  Edit,
  ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/Toast';
import { PromotionRequestModal } from '@/components/PromotionRequestModal';
import axios from 'axios';
import { config } from '@/config';
import * as ImagePicker from 'expo-image-picker';

interface SocialAccount {
  id: string;
  name: string;
  connected: boolean;
  icon: string;
}

const createTheme = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: -100,
      paddingBottom: -100,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      marginBottom: 16,
    },
    headerButton: {
      padding: 8,
      width: 40,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
    },
    content: {
      flex: 1,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      marginBottom: 12,
      paddingHorizontal: 16,
    },
    sectionContent: {
      borderRadius: 12,
      marginHorizontal: 16,
      overflow: 'hidden',
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingRight: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    settingText: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    settingSubtitle: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      marginTop: 2,
    },
    profileImageSection: {
      alignItems: 'center',
      padding: 20,
    },
    profileImageLarge: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    cameraOverlay: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.background,
      borderRadius: 15,
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    inputGroup: {
      padding: 16,
    },
    inputLabel: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 8,
    },
    textInput: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      marginBottom: 8,
    },
    textArea: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      marginBottom: 8,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    characterCount: {
      position: 'absolute',
      right: 16,
      bottom: 8,
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      textAlign: 'right',
    },
    stylePreferences: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    styleChip: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    styleChipSelected: {
      backgroundColor: theme.accentSecondary,
      borderColor: theme.border,
    },
    styleChipText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      alignContent: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    },
    styleChipTextSelected: {
      color: '#fff',
    },
    saveButton: {
      backgroundColor: theme.accentSecondary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      margin: 16,
    },
    saveButtonText: {
      color: '#000',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    passwordInput: {
      position: 'relative',
      marginBottom: 8,
    },
    eyeIcon: {
      position: 'absolute',
      right: 12,
      top: 12,
    },
    changePasswordButton: {
      backgroundColor: theme.accentSecondary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    changePasswordButtonText: {
      color: '#000',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    updateEmailButton: {
      backgroundColor: theme.accentSecondary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    updateEmailButtonText: {
      color: '#000',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    frequencyOptions: {
      flexDirection: 'row',
      gap: 8,
    },
    frequencyOption: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
    },
    frequencyOptionSelected: {
      backgroundColor: theme.accentSecondary,
      borderColor: theme.border,
    },
    frequencyOptionText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
    },
    frequencyOptionTextSelected: {
      color: theme.text,
    },
    socialIcon: {
      fontSize: 20,
    },
    connectButton: {
      backgroundColor: '#007AFF',
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    disconnectButton: {
      backgroundColor: '#FF3B30',
    },
    connectButtonText: {
      color: '#fff',
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
    },
    disconnectButtonText: {
      color: '#fff',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      borderRadius: 16,
      padding: 24,
      margin: 20,
      maxWidth: 400,
      width: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
    },
    modalText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      lineHeight: 24,
      marginBottom: 24,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      borderWidth: 1,
    },
    cancelButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    deleteButton: {
      backgroundColor: '#FF3B30',
    },
    deleteButtonText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    deactivateButton: {
      backgroundColor: '#FF9500',
    },
    deactivateButtonText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    imagePickerModal: {
      position: 'absolute',
      borderTopColor: '#e9ecef',
      borderTopWidth: 1,
      bottom: 0,
      left: 0,
      right: 0,
      borderRadius: 16,
    },
    imagePickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#e9ecef',
    },
    imagePickerTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
    },
    imagePickerOptions: {
      padding: 20,
    },
    imagePickerOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      gap: 16,
    },
    imagePickerOptionText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
    },
    bottomPadding: {
      height: 84,
    },
  });

export default function SettingsScreen() {
  const { user, logout, setUser, token } = useAuth();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const { showToast, visible, hideToast, messages } = useToast();

  const styles = createTheme(theme);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState(user?.avatar || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    { id: '1', name: 'Google', connected: false, icon: '🔍' },
    { id: '2', name: 'Facebook', connected: false, icon: '📘' },
    { id: '3', name: 'Apple', connected: false, icon: '🍎' },
    { id: '4', name: 'Instagram', connected: true, icon: '📷' },
  ]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const saveTimeoutRef = useRef<any>(null);

  const saveSettings = useCallback(
    async (updatedSettings: any) => {
      try {
        await axios.put(
          `${config.apiUrl}/api/user/settings`,
          {
            theme: updatedSettings.theme,
            notifications: updatedSettings.notifications,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch {
        showToast('error', 'Failed to save settings');
      }
    },
    [token, showToast]
  );

  const debouncedSaveSettings = useCallback(
    (updatedUser: any) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveSettings(updatedUser.settings);
      }, 1000);
    },
    [saveSettings]
  );

  const updateUserSettings = useCallback(
    (updatedUser: any) => {
      setUser(updatedUser);
      debouncedSaveSettings(updatedUser);
    },
    [setUser, debouncedSaveSettings]
  );

  const handleThemeToggle = useCallback(() => {
    toggleTheme();
    if (user) {
      const newTheme = isDarkMode ? 'light' : 'dark';
      updateUserSettings({
        ...user,
        settings: {
          ...user.settings,
          theme: newTheme,
        },
      });
    }
  }, [toggleTheme, isDarkMode, user, updateUserSettings]);

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      setShowImagePicker(false);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      setShowImagePicker(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    if (fullName.length < 2 || fullName.length > 50) {
      showToast('error', 'Full name must be between 2-50 characters');
      return;
    }

    if (username.length < 3 || username.length > 20) {
      showToast('error', 'Username must be between 3-20 characters');
      return;
    }

    if (bio.length > 200) {
      showToast('error', 'Bio must be less than 200 characters');
      return;
    }

    const formData = new FormData();

    if (profileImage) {
      formData.append('avatar', {
        uri: profileImage,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as any);
    }

    formData.append('fullName', fullName);
    formData.append('username', username);
    formData.append('bio', bio);

    const response = await axios.put(
      `${config.apiUrl}/api/user/update/profile`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.data.status) {
      showToast('error', response.data.message || 'Failed to update profile');
      return;
    }

    setUser(response.data.user);

    showToast('success', 'Profile updated successfully');
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('error', 'Please fill in all password fields');
      return;
    }
    if (newPassword.length < 8) {
      showToast('error', 'New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'New passwords do not match');
      return;
    }

    const response = await axios.put(
      `${config.apiUrl}/api/user/update/security`,
      {
        currentPassword,
        newPassword,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.data.status) {
      showToast('error', response.data.message || 'Failed to change password');
      return;
    }
    setUser(response.data.user);

    showToast('success', 'Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.includes('@')) {
      showToast('error', 'Please enter a valid email address');
      return;
    }

    const response = await axios.put(
      `${config.apiUrl}/api/user/update/email`,
      { email: newEmail },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.data.status) {
      showToast('error', 'Failed to update email');
      return;
    }

    setUser(response.data.user);

    showToast(
      'alert',
      'A verification email has been sent to your new email address'
    );
  };

  const toggleSocialAccount = (id: string) => {
    setSocialAccounts((prev) =>
      prev.map((account) =>
        account.id === id
          ? { ...account, connected: !account.connected }
          : account
      )
    );
  };

  const handleDeleteAccount = () => {
    showToast('alert', 'Your account has been permanently deleted');
    setShowDeleteConfirm(false);
    setTimeout(() => {
      logout();
      router.replace('/auth');
    }, 2000);
  };

  const handleDeactivateAccount = () => {
    setShowDeactivateConfirm(false);
    showToast('alert', 'Your account has been deactivated');
    setTimeout(() => {
      logout();
      router.replace('/auth');
    }, 2000);
  };

  const handleDownloadData = () => {
    setDownloadLoading(true);
    setTimeout(() => {
      showToast(
        'neutral',
        "Your data export will be ready in 24-48 hours. You will receive an email when it's ready for download."
      );
      setDownloadLoading(false);
    }, 2000);
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: theme.card }]}>
        {children}
      </View>
    </View>
  );

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    rightElement?: React.ReactNode,
    onPress?: () => void,
    loading?: boolean
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: theme.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View
          style={[styles.settingIcon, { backgroundColor: theme.background }]}
        >
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.settingSubtitle, { color: theme.textSecondary }]}
            >
              {subtitle}
            </Text>
          )}
        </View>
        <View style={styles.settingRight}>
          {loading && <ActivityIndicator size="small" color={theme.text} />}
        </View>
      </View>
      {rightElement}
    </TouchableOpacity>
  );

  if (!user) return null;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Settings
        </Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderSection(
          'Profile',
          <>
            {renderSettingItem(
              <Edit size={20} color={theme.primary} />,
              'Edit Profile',
              'Update your profile information',
              <ChevronRight size={20} color={theme.textSecondary} />,
              () => {
                if (user?.type === 'shop') {
                  router.push('/shop/edit-profile');
                } else if (user?.type === 'user' || user?.type === 'admin') {
                  router.push('/user/edit-profile');
                }
              }
            )}
            {user?.type === 'user' &&
              renderSettingItem(
                <Store size={20} color={theme.primary} />,
                'Request Shop Promotion',
                'Apply to become a shop owner',
                <ChevronRight size={20} color={theme.textSecondary} />,
                () => setShowPromotionModal(true)
              )}
          </>
        )}

        {renderSection(
          'Security',
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                Change Password
              </Text>
              <View style={styles.passwordInput}>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.background,
                      color: theme.text,
                      borderColor: theme.border,
                      paddingRight: 50,
                    },
                  ]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Current password"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={20} color={theme.textSecondary} />
                  ) : (
                    <Eye size={20} color={theme.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.passwordInput}>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.background,
                      color: theme.text,
                      borderColor: theme.border,
                      paddingRight: 50,
                    },
                  ]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="New password (min 8 characters)"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff size={20} color={theme.textSecondary} />
                  ) : (
                    <Eye size={20} color={theme.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.changePasswordButton}
                onPress={handleChangePassword}
              >
                <Text style={styles.changePasswordButtonText}>
                  Change Password
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                Email Address
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="Enter new email"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.updateEmailButton}
                onPress={handleUpdateEmail}
              >
                <Text style={styles.updateEmailButtonText}>Update Email</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {renderSection(
          'Notifications',
          <>
            {renderSettingItem(
              <Bell size={20} color={theme.text} />,
              'Like Notifications',
              'Get notified when someone likes your posts',
              <Switch
                value={user?.settings.notifications.likes}
                onValueChange={(value) =>
                  updateUserSettings({
                    ...user,
                    settings: {
                      ...user.settings,
                      notifications: {
                        ...user.settings.notifications,
                        likes: value,
                      },
                    },
                  })
                }
                trackColor={{ false: theme.border, true: '#4CAF50' }}
                thumbColor={
                  user?.settings.notifications.likes ? '#fff' : '#f4f3f4'
                }
              />
            )}

            {renderSettingItem(
              <Bell size={20} color={theme.text} />,
              'Comment Notifications',
              'Get notified when someone comments on your posts',
              <Switch
                value={user?.settings.notifications.comments}
                onValueChange={(value) =>
                  updateUserSettings({
                    ...user,
                    settings: {
                      ...user.settings,
                      notifications: {
                        ...user.settings.notifications,
                        comments: value,
                      },
                    },
                  })
                }
                trackColor={{ false: theme.border, true: '#4CAF50' }}
                thumbColor={
                  user?.settings.notifications.comments ? '#fff' : '#f4f3f4'
                }
              />
            )}

            {renderSettingItem(
              <Bell size={20} color={theme.text} />,
              'Follow Notifications',
              'Get notified when someone follows you',
              <Switch
                value={user?.settings.notifications.follow}
                onValueChange={(value) =>
                  updateUserSettings({
                    ...user,
                    settings: {
                      ...user.settings,
                      notifications: {
                        ...user.settings.notifications,
                        follow: value,
                      },
                    },
                  })
                }
                trackColor={{ false: theme.border, true: '#4CAF50' }}
                thumbColor={
                  user?.settings.notifications.follow ? '#fff' : '#f4f3f4'
                }
              />
            )}

            {renderSettingItem(
              <Bell size={20} color={theme.text} />,
              'Mention Notifications',
              'Get notified when someone mentions you',
              <Switch
                value={user?.settings.notifications.mention}
                onValueChange={(value) =>
                  updateUserSettings({
                    ...user,
                    settings: {
                      ...user.settings,
                      notifications: {
                        ...user.settings.notifications,
                        mention: value,
                      },
                    },
                  })
                }
                trackColor={{ false: theme.border, true: '#4CAF50' }}
                thumbColor={
                  user?.settings.notifications.mention ? '#fff' : '#f4f3f4'
                }
              />
            )}

            {user?.type === 'shop' &&
              renderSettingItem(
                <Bell size={20} color={theme.text} />,
                'Order Notifications',
                'Get notified about new orders',
                <Switch
                  value={user?.settings.notifications.order}
                  onValueChange={(value) =>
                    updateUserSettings({
                      ...user,
                      settings: {
                        ...user.settings,
                        notifications: {
                          ...user.settings.notifications,
                          order: value,
                        },
                      },
                    })
                  }
                  trackColor={{ false: theme.border, true: '#4CAF50' }}
                  thumbColor={
                    user?.settings.notifications.order ? '#fff' : '#f4f3f4'
                  }
                />
              )}

            {renderSettingItem(
              <Bell size={20} color={theme.text} />,
              'System Notifications',
              'Get notified about system updates and changes',
              <Switch
                value={user?.settings.notifications.system}
                onValueChange={(value) =>
                  updateUserSettings({
                    ...user,
                    settings: {
                      ...user.settings,
                      notifications: {
                        ...user.settings.notifications,
                        system: value,
                      },
                    },
                  })
                }
                trackColor={{ false: theme.border, true: '#4CAF50' }}
                thumbColor={
                  user?.settings.notifications.system ? '#fff' : '#f4f3f4'
                }
              />
            )}

            {renderSettingItem(
              <Bell size={20} color={theme.text} />,
              'Warning Notifications',
              'Get notified about account warnings',
              <Switch
                value={user?.settings.notifications.warning}
                onValueChange={(value) =>
                  updateUserSettings({
                    ...user,
                    settings: {
                      ...user.settings,
                      notifications: {
                        ...user.settings.notifications,
                        warning: value,
                      },
                    },
                  })
                }
                trackColor={{ false: theme.border, true: '#4CAF50' }}
                thumbColor={
                  user?.settings.notifications.warning ? '#fff' : '#f4f3f4'
                }
              />
            )}

            {renderSettingItem(
              <Bell size={20} color={theme.text} />,
              'Report Updates',
              'Get notified about updates on your reports',
              <Switch
                value={user?.settings.notifications.reportUpdate}
                onValueChange={(value) =>
                  updateUserSettings({
                    ...user,
                    settings: {
                      ...user.settings,
                      notifications: {
                        ...user.settings.notifications,
                        reportUpdate: value,
                      },
                    },
                  })
                }
                trackColor={{ false: theme.border, true: '#4CAF50' }}
                thumbColor={
                  user?.settings.notifications.reportUpdate ? '#fff' : '#f4f3f4'
                }
              />
            )}

            {renderSettingItem(
              <Bell size={20} color={theme.text} />,
              'Sales Alerts',
              'Get notified about sales and promotions',
              <Switch
                value={user?.settings.notifications.promotion}
                onValueChange={(value) =>
                  updateUserSettings({
                    ...user,
                    settings: {
                      ...user.settings,
                      notifications: {
                        ...user.settings.notifications,
                        promotion: value,
                      },
                    },
                  })
                }
                trackColor={{ false: theme.border, true: '#4CAF50' }}
                thumbColor={
                  user?.settings.notifications.promotion ? '#fff' : '#f4f3f4'
                }
              />
            )}

            {renderSettingItem(
              <Bell size={20} color={theme.text} />,
              'Direct Messages',
              'Get notified about new messages',
              <Switch
                value={user?.settings.notifications.messages}
                onValueChange={(value) =>
                  updateUserSettings({
                    ...user,
                    settings: {
                      ...user.settings,
                      notifications: {
                        ...user.settings.notifications,
                        messages: value,
                      },
                    },
                  })
                }
                trackColor={{ false: theme.border, true: '#4CAF50' }}
                thumbColor={
                  user?.settings.notifications.messages ? '#fff' : '#f4f3f4'
                }
              />
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                Email Frequency
              </Text>
              <View style={styles.frequencyOptions}>
                {['instant', 'daily', 'weekly'].map((frequency) => (
                  <TouchableOpacity
                    key={frequency}
                    style={[
                      styles.frequencyOption,
                      user?.settings.notifications.emailFrequency ===
                        frequency && styles.frequencyOptionSelected,
                      { borderColor: theme.border },
                    ]}
                    onPress={() =>
                      updateUserSettings({
                        ...user,
                        settings: {
                          ...user.settings,
                          notifications: {
                            ...user.settings.notifications,
                            emailFrequency: frequency as any,
                          },
                        },
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.frequencyOptionText,
                        user?.settings.notifications.emailFrequency ===
                          frequency && styles.frequencyOptionTextSelected,
                        {
                          color:
                            user?.settings.notifications.emailFrequency ===
                            frequency
                              ? '#000'
                              : theme.text,
                        },
                      ]}
                    >
                      {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {renderSection(
          'Appearance',
          <>
            {renderSettingItem(
              <Palette size={20} color={theme.text} />,
              'Dark Mode',
              'Switch between light and dark themes',
              <Switch
                value={isDarkMode}
                onValueChange={handleThemeToggle}
                trackColor={{ false: theme.border, true: '#4CAF50' }}
                thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
              />
            )}
          </>
        )}

        {renderSection(
          'Connected Accounts',
          <>
            {socialAccounts.map((account) => (
              <View key={account.id}>
                {renderSettingItem(
                  <Text style={styles.socialIcon}>{account.icon}</Text>,
                  account.name,
                  account.connected ? 'Connected' : 'Not connected',
                  <TouchableOpacity
                    style={[
                      styles.connectButton,
                      account.connected && styles.disconnectButton,
                    ]}
                    onPress={() => toggleSocialAccount(account.id)}
                  >
                    <Text
                      style={[
                        styles.connectButtonText,
                        account.connected && styles.disconnectButtonText,
                      ]}
                    >
                      {account.connected ? 'Disconnect' : 'Connect'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </>
        )}

        {renderSection(
          'Account Management',
          <>
            {renderSettingItem(
              <Download size={20} color={theme.text} />,
              'Download Data',
              'Export your account data',
              null,
              handleDownloadData,
              downloadLoading
            )}

            {renderSettingItem(
              <AlertTriangle size={20} color="#FF9500" />,
              'Deactivate Account',
              'Temporarily disable your account',
              null,
              () => setShowDeactivateConfirm(true)
            )}

            {renderSettingItem(
              <Trash2 size={20} color="#FF3B30" />,
              'Delete Account',
              'Permanently delete your account',
              null,
              () => setShowDeleteConfirm(true)
            )}
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDeleteConfirm(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={[styles.modalContent, { backgroundColor: theme.card }]}
              >
                <View style={styles.modalHeader}>
                  <AlertTriangle size={24} color="#FF3B30" />
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    Delete Account
                  </Text>
                </View>
                <Text
                  style={[styles.modalText, { color: theme.textSecondary }]}
                >
                  This action cannot be undone. All your data, posts, and
                  account information will be permanently deleted.
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.cancelButton,
                      { borderColor: theme.border },
                    ]}
                    onPress={() => setShowDeleteConfirm(false)}
                  >
                    <Text
                      style={[styles.cancelButtonText, { color: theme.text }]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={handleDeleteAccount}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showDeactivateConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeactivateConfirm(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setShowDeactivateConfirm(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={[styles.modalContent, { backgroundColor: theme.card }]}
              >
                <View style={styles.modalHeader}>
                  <AlertTriangle size={24} color="#FF9500" />
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    Deactivate Account
                  </Text>
                </View>
                <Text
                  style={[styles.modalText, { color: theme.textSecondary }]}
                >
                  Your account will be temporarily disabled. You can reactivate
                  it anytime by logging in again.
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.cancelButton,
                      { borderColor: theme.border },
                    ]}
                    onPress={() => setShowDeactivateConfirm(false)}
                  >
                    <Text
                      style={[styles.cancelButtonText, { color: theme.text }]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.deactivateButton]}
                    onPress={handleDeactivateAccount}
                  >
                    <Text style={styles.deactivateButtonText}>Deactivate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showImagePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowImagePicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={[
                  styles.imagePickerModal,
                  { backgroundColor: theme.card },
                ]}
              >
                <View style={styles.imagePickerHeader}>
                  <Text
                    style={[styles.imagePickerTitle, { color: theme.text }]}
                  >
                    Change Profile Picture
                  </Text>
                  <TouchableOpacity onPress={() => setShowImagePicker(false)}>
                    <X size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>
                <View style={styles.imagePickerOptions}>
                  <TouchableOpacity
                    style={styles.imagePickerOption}
                    onPress={openCamera}
                  >
                    <Camera size={24} color={theme.text} />
                    <Text
                      style={[
                        styles.imagePickerOptionText,
                        { color: theme.text },
                      ]}
                    >
                      Take Photo
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.imagePickerOption}
                    onPress={openGallery}
                  >
                    <ImageIcon size={24} color={theme.text} />
                    <Text
                      style={[
                        styles.imagePickerOptionText,
                        { color: theme.text },
                      ]}
                    >
                      Choose from Gallery
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.imagePickerOption}
                    onPress={() => {
                      setProfileImage('');
                      setShowImagePicker(false);
                    }}
                  >
                    <ImageOff size={24} color={theme.error} />
                    <Text
                      style={[
                        styles.imagePickerOptionText,
                        { color: theme.error },
                      ]}
                    >
                      Remove Photo
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <PromotionRequestModal
        visible={showPromotionModal}
        onClose={() => setShowPromotionModal(false)}
      />

      {visible.error && (
        <Toast
          type="error"
          message={messages.error}
          onClose={() => hideToast('error')}
        />
      )}
      {visible.success && (
        <Toast
          type="success"
          message={messages.success}
          onClose={() => hideToast('success')}
        />
      )}
      {visible.neutral && (
        <Toast
          type="neutral"
          message={messages.neutral}
          onClose={() => hideToast('neutral')}
        />
      )}
      {visible.alert && (
        <Toast
          type="alert"
          message={messages.alert}
          onClose={() => hideToast('alert')}
        />
      )}
    </SafeAreaView>
  );
}
