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
  avatarId?: string;
  settings: {
    theme: 'light' | 'dark';
    notifications: {
      likes: boolean;
      comments: boolean;
      follow: boolean;
      mention: boolean;
      order: boolean;
      promotion: boolean;
      system: boolean;
      warning: boolean;
      reportUpdate: boolean;
      messages: boolean;
      emailFrequency: 'instant' | 'daily' | 'weekly';
    };
  };
}
