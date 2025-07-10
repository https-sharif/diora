export interface Product {
    id: string;
    shopId: string;
    name: string;
    price: number;
    imageUrl: string[];
    brand: string;
    category: string;
    description: string;
    sizes: string[];
    variants: string[];
    stock: number;
    rating: number;
    discount?: number;
  }