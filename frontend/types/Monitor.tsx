// Monitor Types
export interface SearchResult {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  avatar: string;
  type: 'user' | 'shop' | 'admin';
  isVerified: boolean;
  followers: string[];
  following: string[];
  posts: string[];
  createdAt: string;
  status?: 'active' | 'suspended' | 'banned';
  suspendedUntil?: string;
  banReason?: string;
  lastActiveAt?: string;
}

export interface PostResult {
  _id: string;
  caption: string;
  user: {
    _id: string;
    username: string;
    avatar: string;
    type: 'user' | 'shop' | 'admin';
  };
  imageUrl: string;
  likes: number;
  comments: number;
  createdAt: string;
  reports?: number;
  isHidden?: boolean;
}

export interface ProductResult {
  _id: string;
  name: string;
  description: string;
  price: number;
  shopId: {
    _id: string;
    username: string;
    avatar: string;
  };
  images: string[];
  stock: number;
  reviews: number;
  createdAt: string;
  reports?: number;
  isHidden?: boolean;
}