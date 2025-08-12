// Context types and interfaces

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  colors: any;
}

export type ContentType = 'post' | 'product';

export interface FormData {
  content: string;
  images: string[];
  price?: number;
  category?: string;
  description?: string;
  name?: string;
  specifications?: any;
  variants?: any[];
}

export interface CreatePostContextType {
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
  resetForm: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
}
