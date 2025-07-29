import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { Theme } from '@/types/Theme';
import { useTheme } from '@/contexts/ThemeContext';

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 6,
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      shadowColor: theme.text,
    },
    pill: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: theme.background,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillActive: {
      backgroundColor: theme.accent,
    },
    pillText: {
      color: theme.text,
      fontSize: 14,
    },
    pillTextActive: {
      color: '#000',
    },
  });
};

const categories = [
  'Men',
  'Women',
  'Unisex',
  'Tops',
  'Bottoms',
  'Footwear',
  'Accessories',
];

export default function CategorySelector({
  selected = [],
  onSelect,
}: {
  selected: string[];
  onSelect: (cat: string[]) => void;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const toggleCategory = (cat: string) => {
    if (selected.includes(cat)) {
      onSelect(selected.filter((c) => c !== cat));
    } else {
      onSelect([...selected, cat]);
    }
  };

  return (
    <View style={styles.wrapper}>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat}
          style={[styles.pill, selected.includes(cat) && styles.pillActive]}
          onPress={() => toggleCategory(cat)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.pillText,
              selected.includes(cat) && styles.pillTextActive,
            ]}
          >
            {cat}
          </Text>
          {selected.includes(cat) && <Check size={16} color="#000" style={{ marginRight: -4, marginLeft: 4 }} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}
