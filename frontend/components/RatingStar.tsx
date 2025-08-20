import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const createStyles = () => {
  return StyleSheet.create({
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      padding: 8,
    },
  });
};

export default function RatingStars({
  rating,
  onPress,
}: {
  rating: number;
  onPress: (star: number) => void;
}) {
  const styles = createStyles();
  const { theme } = useTheme();

  return (
    <View style={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onPress(star)}>
          <Star
            size={24}
            color={star <= rating ? '#FFD700' : theme.textSecondary}
            fill={star <= rating ? '#FFD700' : 'none'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
