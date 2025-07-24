import React from 'react';
import { View } from 'react-native';
import { StarOff } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function StarSlashIcon({ size = 40 }: { size?: number }) {
  const { theme } = useTheme();

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <StarOff size={size } color={theme.text} />
    </View>
  );
}
