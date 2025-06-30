export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  isVerified?: boolean;
  followers: string[];
  following: string[];
  createdAt?: string;
  posts: number;
  likedPosts: string[];
  isShop?: boolean;
}
