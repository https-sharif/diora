import { User } from './User';

export interface Product {
  _id: string;
  shopId: User;
  name: string;
  price: number;
  imageUrl: string[];
  category: string[];
  description: string;
  sizes: string[];
  variants: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  discount?: number;
}

export interface ProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
  specifications?: any;
  variants?: any[];
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  shopId?: string;
  page?: number;
  limit?: number;
}

export interface ProductSearchParams {
  q: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}
