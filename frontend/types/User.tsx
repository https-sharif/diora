import { Product } from "./Product";

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
  status?: 'active' | 'suspended' | 'banned';
  suspendedUntil?: string;
  suspensionReason?: string;
  banReason?: string;
  bannedAt?: string;
  lastActiveAt?: string;
  stripeCustomerId: string;
  onboarding?: {
    isComplete: boolean;
    completedAt?: string;
    step: number;
    profile: {
      completed: boolean;
      dateOfBirth?: string;
      gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
      location?: string;
      interests: string[];
    };
    preferences: {
      completed: boolean;
      favoriteCategories: string[];
      shoppingFrequency?: 'rarely' | 'monthly' | 'weekly' | 'daily';
      budgetRange?: 'under-50' | '50-200' | '200-500' | '500-1000' | 'over-1000';
    };
  };
  shop?: {
    coverImageUrl?: string;
    coverImageId?: string;
    location?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      tiktok?: string;
    };
    categories?: string[];
    productIds: Product[];
    rating: number;
    reviewCount: number;
    businessType?: string;
    yearsInBusiness?: string;
    expectedProducts?: string;
    stripeAccountId?: string;
  };
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

export interface UserProfileData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  profilePicture?: string;
}

export interface UserSettings {
  notifications?: {
    orders?: boolean;
    messages?: boolean;
    promotions?: boolean;
  };
}
