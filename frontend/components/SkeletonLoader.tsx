import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const SkeletonLoader = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonLoaderProps) => {
  const { theme } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startAnimation();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
  },
  productCard: {
    width: '48%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  productInfo: {
    marginTop: 12,
  },
  titleSkeleton: {
    marginBottom: 8,
  },
  priceSkeleton: {
    marginBottom: 6,
  },
  ratingContainer: {
    marginTop: 4,
  },
  postCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  postImage: {
    marginBottom: 12,
  },
  postContent: {
    gap: 8,
  },
  profileContainer: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  productList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  postList: {
    paddingHorizontal: 16,
  },
});

export const ProductCardSkeleton = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.productCard, { backgroundColor: theme.card }]}>
      <SkeletonLoader height={150} borderRadius={8} />
      <View style={styles.productInfo}>
        <SkeletonLoader width="80%" height={16} style={styles.titleSkeleton} />
        <SkeletonLoader width="60%" height={14} style={styles.priceSkeleton} />
        <View style={styles.ratingContainer}>
          <SkeletonLoader width={60} height={12} />
        </View>
      </View>
    </View>
  );
};

export const PostCardSkeleton = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.postCard, { backgroundColor: theme.card }]}>
      <View style={styles.postHeader}>
        <SkeletonLoader width={40} height={40} borderRadius={20} />
        <View style={styles.postHeaderText}>
          <SkeletonLoader width={100} height={14} />
          <SkeletonLoader width={80} height={12} />
        </View>
      </View>
      <SkeletonLoader height={200} borderRadius={8} style={styles.postImage} />
      <View style={styles.postContent}>
        <SkeletonLoader width="90%" height={14} />
        <SkeletonLoader width="70%" height={14} />
      </View>
    </View>
  );
};

export const UserProfileSkeleton = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.profileContainer, { backgroundColor: theme.background }]}>
      <View style={styles.profileHeader}>
        <SkeletonLoader width={80} height={80} borderRadius={40} />
        <View style={styles.profileInfo}>
          <SkeletonLoader width={120} height={20} />
          <SkeletonLoader width={80} height={16} />
        </View>
      </View>
      <View style={styles.profileStats}>
        <View style={styles.statItem}>
          <SkeletonLoader width={30} height={16} />
          <SkeletonLoader width={40} height={12} />
        </View>
        <View style={styles.statItem}>
          <SkeletonLoader width={30} height={16} />
          <SkeletonLoader width={40} height={12} />
        </View>
        <View style={styles.statItem}>
          <SkeletonLoader width={30} height={16} />
          <SkeletonLoader width={40} height={12} />
        </View>
      </View>
    </View>
  );
};

export const ProductListSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <View style={styles.productList}>
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </View>
  );
};

export const PostListSkeleton = ({ count = 4 }: { count?: number }) => {
  return (
    <View style={styles.postList}>
      {Array.from({ length: count }, (_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </View>
  );
};

export default SkeletonLoader;
