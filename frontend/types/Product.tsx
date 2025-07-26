import { User } from "./User";

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