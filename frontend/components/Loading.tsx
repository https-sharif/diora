import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface LoadingViewProps {
  message?: string;
  size?: 'small' | 'large' | number;
}

const LoadingView = ({ message = 'Loading...', size = 'large' }: LoadingViewProps) => {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={theme.text} />
      <Text style={[styles.text, { color: theme.text }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  text: {
    fontSize: 16,
    marginTop: 8,
  },
});

export default LoadingView;
