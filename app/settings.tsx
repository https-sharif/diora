import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Image,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, User, Shield, Bell, Palette, Link, Trash2, Download, Eye, EyeOff, Camera, Check, X, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface StylePreference {
  id: string;
  name: string;
  selected: boolean;
}

interface SocialAccount {
  id: string;
  name: string;
  connected: boolean;
  icon: string;
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  
  // Profile Editor State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState(user?.avatar || '');
  const [stylePreferences, setStylePreferences] = useState<StylePreference[]>([
    { id: '1', name: 'Casual', selected: true },
    { id: '2', name: 'Formal', selected: false },
    { id: '3', name: 'Vintage', selected: true },
    { id: '4', name: 'Streetwear', selected: false },
    { id: '5', name: 'Boho', selected: false },
    { id: '6', name: 'Minimalist', selected: true },
  ]);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    sales: true,
    messages: true,
    emailFrequency: 'instant' as 'instant' | 'daily' | 'weekly',
  });

  // Social Accounts
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    { id: '1', name: 'Google', connected: false, icon: '🔍' },
    { id: '2', name: 'Apple', connected: false, icon: '🍎' },
    { id: '3', name: 'Instagram', connected: true, icon: '📷' },
  ]);

  // Modals
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const handleSaveProfile = () => {
    if (fullName.length < 2 || fullName.length > 50) {
      Alert.alert('Error', 'Full name must be between 2-50 characters');
      return;
    }
    if (bio.length > 200) {
      Alert.alert('Error', 'Bio must be less than 200 characters');
      return;
    }
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    Alert.alert('Success', 'Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleUpdateEmail = () => {
    if (!newEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    Alert.alert('Verification Required', 'A verification email has been sent to your new email address');
  };

  const toggleStylePreference = (id: string) => {
    setStylePreferences(prev =>
      prev.map(style =>
        style.id === id ? { ...style, selected: !style.selected } : style
      )
    );
  };

  const toggleSocialAccount = (id: string) => {
    setSocialAccounts(prev =>
      prev.map(account =>
        account.id === id ? { ...account, connected: !account.connected } : account
      )
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert('Account Deleted', 'Your account has been permanently deleted');
    logout();
  };

  const handleDeactivateAccount = () => {
    Alert.alert('Account Deactivated', 'Your account has been deactivated');
    logout();
  };

  const handleDownloadData = () => {
    Alert.alert('Data Export', 'Your data export will be ready in 24-48 hours. You will receive an email when it\'s ready for download.');
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
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: theme.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: theme.background }]}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement}
    </TouchableOpacity>
  );

  if (!user) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Editor */}
        {renderSection('Profile', (
          <>
            <View style={styles.profileImageSection}>
              <TouchableOpacity onPress={() => setShowImagePicker(true)}>
                <Image source={{ uri: profileImage }} style={styles.profileImageLarge} />
                <View style={styles.cameraOverlay}>
                  <Camera size={20} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Full Name</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor={theme.textSecondary}
                maxLength={50}
              />
              <Text style={[styles.characterCount, { color: theme.textSecondary }]}>
                {fullName.length}/50
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Bio</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
                maxLength={200}
              />
              <Text style={[styles.characterCount, { color: theme.textSecondary }]}>
                {bio.length}/200
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Style Preferences</Text>
              <View style={styles.stylePreferences}>
                {stylePreferences.map((style) => (
                  <TouchableOpacity
                    key={style.id}
                    style={[
                      styles.styleChip,
                      style.selected && styles.styleChipSelected,
                      { borderColor: theme.border }
                    ]}
                    onPress={() => toggleStylePreference(style.id)}
                  >
                    <Text
                      style={[
                        styles.styleChipText,
                        style.selected && styles.styleChipTextSelected,
                        { color: style.selected ? '#fff' : theme.text }
                      ]}
                    >
                      {style.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>Save Profile</Text>
            </TouchableOpacity>
          </>
        ))}

        {/* Account Security */}
        {renderSection('Security', (
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Change Password</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border, paddingRight: 50 }]}
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
                  style={[styles.textInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border, paddingRight: 50 }]}
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
                style={[styles.textInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
              />
              <TouchableOpacity style={styles.changePasswordButton} onPress={handleChangePassword}>
                <Text style={styles.changePasswordButtonText}>Change Password</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Email Address</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="Enter new email"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.updateEmailButton} onPress={handleUpdateEmail}>
                <Text style={styles.updateEmailButtonText}>Update Email</Text>
              </TouchableOpacity>
            </View>

            {renderSettingItem(
              <Shield size={20} color={theme.text} />,
              'Two-Factor Authentication',
              'Add an extra layer of security',
              <Switch
                value={twoFactorEnabled}
                onValueChange={setTwoFactorEnabled}
                trackColor={{ false: theme.border, true: '#4CAF50' }}
                thumbColor={twoFactorEnabled ? '#fff' : '#f4f3f4'}
              />
            )}
          </>
        ))}

        {/* Notification Preferences */}
        {renderSection('Notifications', (
          <>
            {renderSettingItem(
              <Bell size={20} color={theme.text} />,
              'Like Notifications',
              'Get notified when someone likes your posts',
              <Switch
                value={notifications.likes}
                onValueChange={(value) => setNotifications(prev => ({ ...prev, likes: value }))}
                trackColor={{ false: theme.border, true: '#4CAF50' }}
                thumbColor={notifications.likes ? '#fff' : '#f4f3f4'}
              />
            )}

            {renderSettingItem(
              <Bell size={20} color={theme.text} />,
              'Comment Notifications',
              'Get notified when someone comments on your posts',
              <Switch
                value={notifications.comments}
                onValueChange={(value) => setNotifications(prev => ({ ...prev, comments: value }))}
                trackColor={{ false: theme.border, true: '#4CAF50' }}
                thumbColor={notifications.comments ? '#fff' : '#f4f3f4'}
              />
            )}

            {renderSettingItem(
              <Bell size={20} color={theme.text} />,
              'Sales Alerts',
              'Get notified about sales and promotions',
              <Switch
                value={notifications.sales}
                onValueChange={(value) => setNotifications(prev => ({ ...prev, sales: value }))}
                trackColor={{ false: theme.border, true: '#4CAF50' }}
                thumbColor={notifications.sales ? '#fff' : '#f4f3f4'}
              />
            )}

            {renderSettingItem(
              <Bell size={20} color={theme.text} />,
              'Direct Messages',
              'Get notified about new messages',
              <Switch
                value={notifications.messages}
                onValueChange={(value) => setNotifications(prev => ({ ...prev, messages: value }))}
                trackColor={{ false: theme.border, true: '#4CAF50' }}
                thumbColor={notifications.messages ? '#fff' : '#f4f3f4'}
              />
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Email Frequency</Text>
              <View style={styles.frequencyOptions}>
                {['instant', 'daily', 'weekly'].map((frequency) => (
                  <TouchableOpacity
                    key={frequency}
                    style={[
                      styles.frequencyOption,
                      notifications.emailFrequency === frequency && styles.frequencyOptionSelected,
                      { borderColor: theme.border }
                    ]}
                    onPress={() => setNotifications(prev => ({ ...prev, emailFrequency: frequency as any }))}
                  >
                    <Text
                      style={[
                        styles.frequencyOptionText,
                        notifications.emailFrequency === frequency && styles.frequencyOptionTextSelected,
                        { color: notifications.emailFrequency === frequency ? '#fff' : theme.text }
                      ]}
                    >
                      {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ))}

        {/* Theme Customization */}
        {renderSection('Appearance', (
          <>
            {renderSettingItem(
              <Palette size={20} color={theme.text} />,
              'Dark Mode',
              'Switch between light and dark themes',
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: '#4CAF50' }}
                thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
              />
            )}
          </>
        ))}

        {/* Social Account Linking */}
        {renderSection('Connected Accounts', (
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
                      account.connected && styles.disconnectButton
                    ]}
                    onPress={() => toggleSocialAccount(account.id)}
                  >
                    <Text
                      style={[
                        styles.connectButtonText,
                        account.connected && styles.disconnectButtonText
                      ]}
                    >
                      {account.connected ? 'Disconnect' : 'Connect'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </>
        ))}

        {/* Account Management */}
        {renderSection('Account Management', (
          <>
            {renderSettingItem(
              <Download size={20} color={theme.text} />,
              'Download Data',
              'Export your account data',
              null,
              handleDownloadData
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
        ))}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <AlertTriangle size={24} color="#FF3B30" />
              <Text style={[styles.modalTitle, { color: theme.text }]}>Delete Account</Text>
            </View>
            <Text style={[styles.modalText, { color: theme.textSecondary }]}>
              This action cannot be undone. All your data, posts, and account information will be permanently deleted.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.border }]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Deactivate Account Confirmation Modal */}
      <Modal
        visible={showDeactivateConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeactivateConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <AlertTriangle size={24} color="#FF9500" />
              <Text style={[styles.modalTitle, { color: theme.text }]}>Deactivate Account</Text>
            </View>
            <Text style={[styles.modalText, { color: theme.textSecondary }]}>
              Your account will be temporarily disabled. You can reactivate it anytime by logging in again.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.border }]}
                onPress={() => setShowDeactivateConfirm(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deactivateButton]}
                onPress={handleDeactivateAccount}
              >
                <Text style={styles.deactivateButtonText}>Deactivate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Profile Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.imagePickerModal, { backgroundColor: theme.card }]}>
            <View style={styles.imagePickerHeader}>
              <Text style={[styles.imagePickerTitle, { color: theme.text }]}>Change Profile Picture</Text>
              <TouchableOpacity onPress={() => setShowImagePicker(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.imagePickerOptions}>
              <TouchableOpacity style={styles.imagePickerOption}>
                <Camera size={24} color={theme.text} />
                <Text style={[styles.imagePickerOptionText, { color: theme.text }]}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imagePickerOption}>
                <Download size={24} color={theme.text} />
                <Text style={[styles.imagePickerOptionText, { color: theme.text }]}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
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
    backgroundColor: '#000',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  styleChipSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  styleChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  styleChipTextSelected: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    margin: 16,
  },
  saveButtonText: {
    color: '#fff',
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
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  changePasswordButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  updateEmailButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  updateEmailButtonText: {
    color: '#fff',
    fontSize: 14,
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
    backgroundColor: '#000',
    borderColor: '#000',
  },
  frequencyOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  frequencyOptionTextSelected: {
    color: '#fff',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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