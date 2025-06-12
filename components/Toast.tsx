import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

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

type ToastProps = {
  type: 'error' | 'success' | 'neutral' | 'alert';
  message: string;
  onClose?: () => void;
};

export const Toast = ({ type, message, onClose }: ToastProps) => {
  const style = toastStyles[type];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onClose}
      style={{
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: style.bg,
        borderLeftWidth: 4,
        borderLeftColor: style.border,
        padding: 12,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <Text
        style={{
          color: style.text,
          fontSize: 14,
          fontFamily: 'Inter-Medium',
          marginBottom: 0,
        }}
      >
        {message}
      </Text>
    </TouchableOpacity>
  );
};
