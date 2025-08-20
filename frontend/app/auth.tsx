import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import useBlockNavigation from '@/hooks/useBlockNavigation';
import { router } from 'expo-router';

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: -100,
      paddingBottom: -100,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    title: {
      fontSize: 48,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 24,
      fontFamily: 'Inter-Regular',
      color: theme.primary,
      textAlign: 'center',
    },
    form: {
      gap: 16,
    },
    inputContainer: {
      position: 'relative',
    },
    logo: {
      width: 100,
      height: 100,
      marginBottom: 16,
    },
    input: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      borderWidth: 1,
      borderColor: theme.border,
      color: theme.text,
    },
    passwordInput: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      paddingRight: 50,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      borderWidth: 1,
      borderColor: theme.border,
      color: theme.text,
    },
    eyeIcon: {
      position: 'absolute',
      right: 16,
      top: 16,
    },
    submitButton: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    submitButtonText: {
      color: '#000',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 16,
    },
    switchText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
    },
    switchLink: {
      fontSize: 14,
      fontFamily: 'Inter-Bold',
      color: theme.accent,
      marginLeft: 4,
      textDecorationLine: 'underline',
    },
  });

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, signup, loading } = useAuth();
  const { theme } = useTheme();

  const styles = createStyles(theme);

  useBlockNavigation();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLogin && (!username || !fullName)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await signup({
          email,
          password,
          username,
          fullName,
        });
      }

      if (result?.success) {
        setTimeout(() => {
          router.replace('/');
        }, 100);
      } else {
        if ((result as any)?.details) {
          Alert.alert(result?.error || 'Login Failed', (result as any).details);
        } else {
          Alert.alert(
            'Error',
            result?.error || (isLogin ? 'Login failed' : 'Signup failed')
          );
        }
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || (isLogin ? 'Login failed' : 'Signup failed')
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={
                theme.mode === 'dark'
                  ? require('../assets/images/darkIcon.png')
                  : require('../assets/images/lightIcon.png')
              }
              style={{ width: 100, height: 100 }}
            />
            <Text style={styles.title}>Diora</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome back' : 'Join the fashion community'}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email or Username"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            {!isLogin && (
              <>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>
              </>
            )}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={theme.textSecondary}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={theme.textSecondary} />
                ) : (
                  <Eye size={20} color={theme.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? 'Login' : 'Sign Up'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isLogin
                  ? "Don't have an account? "
                  : 'Already have an account? '}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.switchLink}>
                  {isLogin ? 'Sign Up' : 'Login'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
