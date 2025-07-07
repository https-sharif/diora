import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Shirt, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function ProductSlashIcon({ size = 40 }: { size?: number }) {
  const { theme } = useTheme();

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <Shirt size={size + 10} color={theme.text} style={{position: 'absolute', top: -5, left: -5}} />
      <X size={size} color={theme.card} strokeWidth={5} style={StyleSheet.absoluteFill} />
      <X size={size} color={theme.text} style={StyleSheet.absoluteFill} />
    </View>
  );
}
