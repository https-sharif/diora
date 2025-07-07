export interface Product {
    id: string;
    storeId: string;
    name: string;
    price: number;
    imageUrl: string[];
    brand: string;
    category: string;
    description: string;
    sizes: string[];
    colors: string[];
    stock: number;
    rating: number;
    discount?: number;
  }