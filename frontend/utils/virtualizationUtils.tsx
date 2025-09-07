import React from 'react';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/types/Theme';

/**
 * VirtualizedList - A high-performance list component using FlashList
 * Optimized for rendering large lists of comments, reviews, and other items
 */
interface VirtualizedListProps<T> extends Omit<FlashListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  emptyMessage?: string;
  estimatedItemSize?: number;
  showsVerticalScrollIndicator?: boolean;
}

export function VirtualizedList<T>({
  data,
  renderItem,
  emptyMessage = 'No items to display',
  estimatedItemSize = 100,
  showsVerticalScrollIndicator = false,
  ...props
}: VirtualizedListProps<T>) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlashList
      data={data}
      renderItem={({ item, index }) => renderItem(item, index)}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyExtractor={(item: any, index: number) =>
        item._id || item.id || `item-${index}`
      }
      {...props}
    />
  );
}

/**
 * VirtualizedCommentList - Specialized component for comment lists
 * Includes optimizations for nested replies and dynamic heights
 */
interface VirtualizedCommentListProps extends Omit<FlashListProps<any>, 'renderItem' | 'data'> {
  comments: any[];
  renderComment: (comment: any) => React.ReactElement | null;
  emptyMessage?: string;
}

export function VirtualizedCommentList({
  comments,
  renderComment,
  emptyMessage = 'No comments yet',
  ...props
}: VirtualizedCommentListProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (!comments || comments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlashList
      data={comments}
      renderItem={({ item }) => {
        const element = renderComment(item);
        return element || <View />;
      }}
      getItemType={(item) => {
        return item.replies && item.replies.length > 0 ? 'comment-with-replies' : 'comment';
      }}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item._id}
      {...props}
    />
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});

/**
 * Memoized wrapper for stable performance
 */
export const MemoizedVirtualizedList = React.memo(VirtualizedList) as typeof VirtualizedList;
export const MemoizedVirtualizedCommentList = React.memo(VirtualizedCommentList) as typeof VirtualizedCommentList;
