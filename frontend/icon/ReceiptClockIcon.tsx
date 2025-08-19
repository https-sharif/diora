import React from 'react';
import { View } from 'react-native';
import { FileText, Clock } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function ReceiptClockIcon({ size = 40 }: { size?: number }) {
  const { theme } = useTheme();

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <FileText size={size} color={theme.text} />

      <View style={{ position: 'absolute', top: -3, right: -3, backgroundColor: theme.background, width: size * 0.6, height: size * 0.6, borderRadius: size, justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
      <Clock
        size={size * 0.5}
        color={theme.text}
        strokeWidth={3}
        />
        </View>
    </View>
  );
}
