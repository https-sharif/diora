export interface User {
  _id: string;
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
  type: 'user' | 'shop' | 'admin';
}
