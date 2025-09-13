import { User } from './User';
import React, { ErrorInfo } from 'react';

export interface ShopOnboardingProps {
  onComplete: () => void;
}

export interface PromotionRequestModalProps {
  visible: boolean;
  onClose: () => void;
}

export interface UserOnboardingProps {
  onComplete: () => void;
}

export interface OnboardingManagerProps {
  onComplete: () => void;
}

export type ToastProps = {
  type: 'error' | 'success' | 'neutral' | 'alert';
  message: string;
  onClose?: () => void;
};

export interface LoadingViewProps {
  message?: string;
  size?: 'small' | 'large' | number;
}

export interface EmptyStateProps {
  type?: 'default' | 'search' | 'products' | 'reviews' | 'posts' | 'messages' | 'wishlist' | 'cart' | 'orders';
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface NewConversationModalProps {
  visible: boolean;
  onClose: () => void;
  mode: 'direct' | 'group';
  onModeChange: (mode: 'direct' | 'group') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  groupName: string;
  onGroupNameChange: (name: string) => void;
  selectedUsers: User[];
  onUserSelect: (user: User) => void;
  onRemoveUser: (userId: string) => void;
  displayUsers: User[];
  onCreateGroup: () => void;
  canCreateGroup: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}
