// Context Types
import React from 'react';

export type ContentType = 'post' | 'product';

export interface FormData {
  name: string;
  description: string;
  price: string;
  sizes: string[];
  variants: string[];
  stock?: number;
  discount?: number;
  category: string[];
}

export interface CreatePostContextType {
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
  images: string[];
  setImages: (uris: string[]) => void;
  imageUri: string | null;
  setImageUri: (uri: string | null) => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  createPost: () => Promise<void>;
  createProduct: () => Promise<void>;
  reset: () => void;
}

export interface ThemeContextType {
  theme: any; // Using any to avoid circular import with Theme type
  isDarkMode: boolean;
  toggleTheme: () => void;
  lightTheme: any;
  darkTheme: any;
}

export type ToastType = 'error' | 'success' | 'neutral' | 'alert';

export interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

export interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  hideToast: () => void;
  currentToast: ToastState | null;
}

export interface ToastProviderProps {
  children: React.ReactNode;
}