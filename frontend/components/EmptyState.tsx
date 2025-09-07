import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import {
  Inbox,
  Search,
  ShoppingBag,
  Star,
  Package,
  MessageSquare,
  Heart,
} from 'lucide-react-native';
import Color from 'color';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/types/Theme';

interface EmptyStateProps {
  type?: 'default' | 'search' | 'products' | 'reviews' | 'posts' | 'messages' | 'wishlist' | 'cart' | 'orders';
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const getEmptyStateConfig = (type: EmptyStateProps['type']) => {
  switch (type) {
    case 'search':
      return {
        icon: <Search size={40} />,
        title: 'No results found',
        message: 'Try adjusting your search terms or filters',
      };
    case 'products':
      return {
        icon: <Package size={40} />,
        title: 'No products found',
        message: 'Check back later for new arrivals',
      };
    case 'reviews':
      return {
        icon: <Star size={40} />,
        title: 'No reviews yet',
        message: 'Be the first to leave a review!',
      };
    case 'posts':
      return {
        icon: <MessageSquare size={40} />,
        title: 'No posts yet',
        message: 'Follow users to see their posts here',
      };
    case 'messages':
      return {
        icon: <MessageSquare size={40} />,
        title: 'No messages',
        message: 'Start a conversation with someone',
      };
    case 'wishlist':
      return {
        icon: <Heart size={40} />,
        title: 'Your wishlist is empty',
        message: 'Save items you love for later',
      };
    case 'cart':
      return {
        icon: <ShoppingBag size={40} />,
        title: 'Your cart is empty',
        message: 'Add some products to get started',
      };
    case 'orders':
      return {
        icon: <Package size={40} />,
        title: 'No orders yet',
        message: 'Your order history will appear here',
      };
    default:
      return {
        icon: <Inbox size={40} />,
        title: 'Nothing here',
        message: 'This space is waiting for content',
      };
  }
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 20,
      backgroundColor: theme.background,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    emptyTitle: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    emptyMessage: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: Color(theme.text).alpha(0.7).toString(),
      marginBottom: 24,
      textAlign: 'center',
      lineHeight: 22,
    },
    actionButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 25,
      marginTop: 8,
    },
    actionButtonText: {
      color: '#000',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
  });

export const EmptyState = ({
  type = 'default',
  title,
  message,
  actionText,
  onAction,
  icon,
}: EmptyStateProps) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const config = getEmptyStateConfig(type);

  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  const displayIcon = icon || config.icon;

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        {displayIcon}
      </View>
      <Text style={styles.emptyTitle}>{displayTitle}</Text>
      <Text style={styles.emptyMessage}>{displayMessage}</Text>
      {actionText && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
