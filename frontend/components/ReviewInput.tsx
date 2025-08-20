import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Send, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const createStyles = (theme: any) => {
  return StyleSheet.create({
    reviewInputContainer: {
      flexDirection: 'row',
      padding: 8,
      backgroundColor: theme.background,
    },
    reviewInput: {
      flex: 1,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.textSecondary,
      borderRadius: 8,
      backgroundColor: theme.card,
      marginBottom: 16,
      color: theme.text,
    },
    headerButton: {
      marginLeft: 8,
    },
  });
};

export default function ReviewInput({
  reviewInputRef,
  value,
  onChangeText,
  onSend,
  onCancel,
  isEditing,
}: {
  reviewInputRef: any;
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onCancel: () => void;
  isEditing: boolean;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.reviewInputContainer}>
      <TextInput
        ref={reviewInputRef}
        placeholder="Write a review..."
        value={value}
        onChangeText={onChangeText}
        style={styles.reviewInput}
        placeholderTextColor={theme.textSecondary}
        multiline
        numberOfLines={3}
      />
      <TouchableOpacity onPress={onSend} style={styles.headerButton}>
        <Send size={24} color={theme.text} />
      </TouchableOpacity>
      {isEditing && (
        <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
          <X size={24} color={theme.error} />
        </TouchableOpacity>
      )}
    </View>
  );
}
