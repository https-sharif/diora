import React from 'react';
import { Platform, KeyboardAvoidingView } from 'react-native';
import { CreatePostProvider } from '@/contexts/CreatePostContext';
import CreatePostFlow from '../CreatePostFlow';
import { useTheme } from '@/contexts/ThemeContext';

export default function CreateScreen() {
  const { theme } = useTheme();
  return (
    <CreatePostProvider>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <CreatePostFlow />
      </KeyboardAvoidingView>
    </CreatePostProvider>
  );
}
