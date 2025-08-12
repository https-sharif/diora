import { Product } from "./Product";

export interface ShopProfile {

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
  productIds: Product[];
  rating: number;
  reviewCount: number;
  followers: number;
  isVerified: boolean;
  createdAt: string;
}

// Shop service types  
export interface ShopProfileData {
  name?: string;
  description?: string;
  profilePicture?: string;
  bannerImage?: string;
  address?: string;
  phone?: string;
}
