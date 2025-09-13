import React from 'react';
import { FlashListProps } from '@shopify/flash-list';

// Utility Types
export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: any) => boolean;
}

export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

export interface SyncItem {
  id: string;
  type: 'comment' | 'like' | 'post';
  data: any;
  timestamp: number;
  retryCount: number;
}

export interface VirtualizedListProps<T> extends Omit<FlashListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  emptyMessage?: string;
  estimatedItemSize?: number;
  showsVerticalScrollIndicator?: boolean;
}

export interface VirtualizedCommentListProps extends Omit<FlashListProps<any>, 'renderItem' | 'data'> {
  comments: any[];
  renderComment: (comment: any) => React.ReactElement | null;
  emptyMessage?: string;
}