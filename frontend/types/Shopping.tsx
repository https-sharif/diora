import { Product } from './Product';
import { CartItem } from './Cart';

export interface CartItemData {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface WishlistItemData {
  productId: string;
}

export interface ShoppingStore {
  cart: CartItem[];
  wishlist: Product[];

  cartOperations: Set<string>;
  wishlistOperations: Set<string>;

  wishlistDebounceMap: Map<string, ReturnType<typeof setTimeout>>;

  addToCart: (
    product: Product,
    quantity: number,
    size?: string,
    variant?: string
  ) => Promise<void>;
  removeFromCart: (
    productId: string,
    size?: string,
    variant?: string
  ) => Promise<void>;
  updateCartQuantity: (
    productId: string,
    quantity: number,
    size?: string,
    variant?: string
  ) => Promise<void>;

  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;

  getCartTotal: () => number;
  getCartItemCount: () => number;
  fetchCart: () => Promise<void>;
  fetchWishlist: (silent?: boolean) => Promise<void>;
  initializeUserData: () => Promise<void>;

  reset: () => void;
}

export interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  paymentMethod: 'cash' | 'card';
}
