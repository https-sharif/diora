import React from 'react';
import { View } from 'react-native';
import { PackageX } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function ProductSlashIcon({ size = 40 }: { size?: number }) {
  const { theme } = useTheme();

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <PackageX size={size} color={theme.text} />
    </View>
  );
}
