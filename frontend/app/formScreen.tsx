import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useCreatePost } from '@/contexts/CreatePostContext';
import CategorySelector from '@/components/CategorySelector';
import { Theme } from '@/types/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Check, Plus, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { postValidation, validateField, postRateLimiter } from '@/utils/validationUtils';
import { useAuth } from '@/hooks/useAuth';
import { showToast, toastMessages } from '@/utils/toastUtils';

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: -100,
      paddingBottom: -100,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.background,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    labelContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginLeft: 4,
    },
    input: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      marginTop: 6,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
      color: theme.text,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 16,
      paddingVertical: 6,
      paddingHorizontal: 12,
      marginRight: 8,
      marginBottom: 8,
    },
    tagText: {
      marginRight: 6,
      color: theme.text,
      fontSize: 14,
    },
    remove: {
      color: theme.textSecondary,
      fontSize: 16,
      fontWeight: 'bold',
    },
    buttonContainer: {
      padding: 20,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    submitButton: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowColor: theme.accentSecondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    submitButtonDisabled: {
      backgroundColor: theme.border,
      shadowOpacity: 0.1,
    },
    submitButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: '#000',
    },
    submitButtonTextDisabled: {
      color: '#fff',
    },
  });
};

export default function CreateFormScreen() {
  const {
    formData,
    setFormData,
    contentType,
    images,
    createPost,
    createProduct,
    reset,
  } = useCreatePost();
  const isProduct = contentType === 'product';
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = createStyles(theme);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempSize, setTempSize] = useState('');
  const [tempVariant, setTempVariant] = useState('');

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (isSubmitting || !user) return;

    if (!postRateLimiter.isAllowed(user._id)) {
      showToast.error('Rate limit exceeded. Please wait before creating another post.');
      return;
    }

    if (formData.description?.trim()) {
      const validation = validateField(postValidation.caption, formData.description.trim());
      if (!validation.success) {
        showToast.error(validation.error || 'Invalid caption');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (isProduct) {
        await createProduct();
      } else {
        await createPost();
      }
      showToast.success(toastMessages.createSuccess(isProduct ? 'Product' : 'Post'));
      reset();
      // Navigate back to main screen after successful creation
      router.push('/(tabs)');
    } catch (error) {
      console.error('Post creation failed:', error);
      showToast.error(error instanceof Error ? error.message : 'Failed to create post. Please try again.');
      setIsSubmitting(false);
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={images.length === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={theme.text} />
            ) : (
              <Check size={24} color={theme.text} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }} style={{ flex: 1 }}>
          {isProduct && (
            <View style={{ marginBottom: 16 }}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Product Name</Text>
                <Text style={[styles.label, { color: theme.error }]}>*</Text>
              </View>
              <TextInput
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Add a product name"
                placeholderTextColor={theme.textSecondary}
                style={styles.input}
              />
            </View>
          )}

          <View style={{ marginBottom: 16 }}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>
                {isProduct ? 'Description' : 'Caption'}
              </Text>
              {isProduct && (
                <Text style={[styles.label, { color: theme.error }]}>*</Text>
              )}
            </View>
            <TextInput
              value={formData.description}
              onChangeText={(text) => handleChange('description', text)}
              placeholder={isProduct ? 'Add a description' : 'Add a caption'}
              multiline
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { height: 100 }]}
            />
          </View>

          {isProduct && (
            <>
              <View style={{ marginBottom: 16 }}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>Price (BDT)</Text>
                  <Text style={[styles.label, { color: theme.error }]}>*</Text>
                </View>
                <TextInput
                  value={formData.price}
                  onChangeText={(text) => handleChange('price', text)}
                  placeholder="Add a price"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>Category</Text>
                  <Text style={[styles.label, { color: theme.error }]}>*</Text>
                </View>
                <CategorySelector
                  selected={formData.category}
                  onSelect={(updated) => handleChange('category', updated)}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>Sizes</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    value={tempSize}
                    onChangeText={setTempSize}
                    placeholder="Enter a size e.g. M"
                    style={[styles.input, { flex: 1 }]}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      if (tempSize.trim()) {
                        handleChange('sizes', [
                          ...formData.sizes,
                          tempSize.trim(),
                        ]);
                        setTempSize('');
                      }
                    }}
                    style={styles.submitButton}
                  >
                    <Text style={styles.submitButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    marginTop: 8,
                  }}
                >
                  {formData.sizes.map((size, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{size}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          const updated = formData.sizes.filter(
                            (_, i) => i !== index
                          );
                          handleChange('sizes', updated);
                        }}
                      >
                        <X color={theme.textSecondary} size={16} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>Variants</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    value={tempVariant}
                    onChangeText={setTempVariant}
                    placeholder="Enter a variant e.g. Black, Striped"
                    style={[styles.input, { flex: 1 }]}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      if (tempVariant.trim()) {
                        handleChange('variants', [
                          ...formData.variants,
                          tempVariant.trim(),
                        ]);
                        setTempVariant('');
                      }
                    }}
                    style={styles.submitButton}
                  >
                    <Text style={styles.submitButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    marginTop: 8,
                  }}
                >
                  {formData.variants.map((variant, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{variant}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          const updated = formData.variants.filter(
                            (_, i) => i !== index
                          );
                          handleChange('variants', updated);
                        }}
                      >
                        <X color={theme.textSecondary} size={16} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>Discount (%)</Text>
                </View>
                <TextInput
                  value={
                    formData.discount !== undefined
                      ? String(formData.discount)
                      : ''
                  }
                  onChangeText={(text) => {
                    const num = parseInt(text);
                    handleChange('discount', isNaN(num) ? '' : num);
                  }}
                  placeholder="e.g. 10"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>Stock</Text>
                </View>
                <TextInput
                  value={
                    formData.stock !== undefined ? String(formData.stock) : ''
                  }
                  onChangeText={(text) => {
                    const num = parseInt(text);
                    handleChange('stock', isNaN(num) ? '' : num);
                  }}
                  placeholder="e.g. 50"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </>
          )}
        </ScrollView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Plus size={20} color="#000" />
            )}
            <Text
              style={[
                styles.submitButtonText,
                isSubmitting && styles.submitButtonTextDisabled,
              ]}
            >
              {isSubmitting
                ? 'Creating...'
                : `Create ${contentType === 'post' ? 'Post' : 'Product'}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
