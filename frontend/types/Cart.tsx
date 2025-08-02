import { Product } from './Product';

export interface Cart {
  _id: string;
  userId: string;
  products: {
    productId: string | Product;
    quantity: number;
    size?: string;
    variant?: string;
    _id?: string;
  }[];
}

export interface CartItem {
  productId: Product;
  quantity: number;
  size?: string;
  variant?: string;
  _id?: string;
}
