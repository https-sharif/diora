import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGlobalToast } from '@/contexts/ToastContext';

const toastStyles = {
  error: {
    bg: '#F8D7DA',
    border: '#D9534F',
    text: '#721C24',
  },
  success: {
    bg: '#D4EDDA',
    border: '#28A745',
    text: '#155724',
  },
  neutral: {
    bg: '#E2E3E5',
    border: '#6C757D',
    text: '#383D41',
  },
  alert: {
    bg: '#FFF3CD',
    border: '#FFC107',
    text: '#856404',
  },
};

export const GlobalToast = () => {
  const { currentToast, hideToast } = useGlobalToast();

  if (!currentToast || !currentToast.visible) {
    return null;
  }

  const style = toastStyles[currentToast.type];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={hideToast}
      style={[
        styles.toast,
        {
          backgroundColor: style.bg,
          borderLeftColor: style.border,
        },
      ]}
    >
      <Text
        style={[
          styles.message,
          {
            color: style.text,
          },
        ]}
      >
        {currentToast.message}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    borderLeftWidth: 4,
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
    zIndex: 9999,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 0,
  },
});
