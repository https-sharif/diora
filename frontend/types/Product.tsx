export interface Product {
    _id: string;
    shopId: string;
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