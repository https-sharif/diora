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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react-native';
import { useFonts } from 'expo-font';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const [fontsLoaded] = useFonts({
      'DancingScript-Regular': require('../assets/fonts/DancingScript-Regular.ttf'),
      'DancingScript-Medium': require('../assets/fonts/DancingScript-Medium.ttf'),
      'DancingScript-SemiBold': require('../assets/fonts/DancingScript-SemiBold.ttf'),
      'DancingScript-Bold': require('../assets/fonts/DancingScript-Bold.ttf'),
    });

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLogin && (!username || !fullName)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      let success = false;
      if (isLogin) {
        success = await login(email, password);
      } else {
        success = await signup(email, password, username, fullName);
      }

      if (!success) {
        Alert.alert('Error', isLogin ? 'Login failed' : 'Signup failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
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
            <Text style={styles.title}>Miravè</Text>
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
                placeholderTextColor="#666"
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
                    placeholderTextColor="#666"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholderTextColor="#666"
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
                placeholderTextColor="#666"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#666" />
                ) : (
                  <Eye size={20} color="#666" />
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
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    fontFamily: 'DancingScript-Bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontFamily: 'DancingScript-Regular',
    color: '#666',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  passwordInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    paddingRight: 50,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  submitButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
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
    color: '#666',
  },
  switchLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
});