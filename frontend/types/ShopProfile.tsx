export interface ShopProfile {
  id: string;
  userId: string;
  name: string;
  username: string;
  logoUrl?: string;
  coverImageUrl?: string;
  description?: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
  categories: string[];
  productIds: string[];
  rating: number;
  ratingCount: number;
  followers: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
