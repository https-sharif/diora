import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function Empty() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }} />
  );
}