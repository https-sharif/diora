// App-specific types and interfaces

export interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  conversionRate: number;
  orderTrend: { date: string; orders: number }[];
  revenueTrend: { date: string; revenue: number }[];
  topProducts: { name: string; sales: number }[];
  categoryDistribution: { category: string; percentage: number }[];
}

export interface SocialAccount {
  platform: 'facebook' | 'instagram' | 'twitter' | 'tiktok';
  username: string;
  connected: boolean;
}

export interface SearchResult {
  type: 'user' | 'shop' | 'post' | 'product';
  results: (UserResult | ShopResult | PostResult | ProductResult)[];
}

export interface UserResult {
  _id: string;
  username: string;
  displayName: string;
  profilePicture?: string;
  isVerified: boolean;
  type: 'user' | 'shop' | 'admin';
}

export interface ShopResult {
  _id: string;
  username: string;
  displayName: string;
  profilePicture?: string;
  isVerified: boolean;
  type: 'shop';
  categories: string[];
}

export interface PostResult {
  _id: string;
  content: string;
  images: string[];
  user: {
    _id: string;
    username: string;
    displayName: string;
    profilePicture?: string;
    isVerified: boolean;
    type: 'user' | 'shop' | 'admin';
  };
  createdAt: string;
  likes: number;
  comments: number;
}

export interface ProductResult {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  shop: {
    _id: string;
    name: string;
    displayName: string;
    profilePicture?: string;
    isVerified: boolean;
  };
  category: string[];
  rating: number;
  reviewCount: number;
}
