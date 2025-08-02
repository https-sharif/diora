import { create } from 'zustand';
import axios from 'axios';
import { Product } from '@/types/Product';
import { CartItem } from '@/types/Cart';
import { useAuthStore } from '@/stores/useAuthStore';
import { API_URL } from '@/constants/api';

interface ShoppingStore {
  cart: CartItem[];
  wishlist: Product[];

  addToCart: (product: Product, quantity: number, size?: string, variant?: string ) => Promise<void>;
  removeFromCart: (productId: string, size?: string, variant?: string) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number, size?: string, variant?: string) => Promise<void>;

  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;

  getCartTotal: () => number;
  getCartItemCount: () => number;
  fetchCart: () => Promise<void>;
  fetchWishlist: () => Promise<void>;

  reset: () => void;
}

export const useShoppingStore = create<ShoppingStore>((set, get) => {
  useAuthStore.subscribe((state, prevState) => {
    if (prevState.user && !state.user) {
      set({ cart: [], wishlist: [] });
    }
  });

  return {
    cart: [],
    wishlist: [],

    fetchCart: async () => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) return;

      try {
        const res = await axios.get(`${API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const cartItems: CartItem[] = res.data.cart?.products?.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          variant: item.variant,
          _id: item._id,
        })) || [];

        set({ cart: cartItems });
      } catch (error) {
        console.error('Error fetching cart:', error);
        set({ cart: [] });
      }
    },

    fetchWishlist: async () => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) return;

      try {
        const res = await axios.get(`${API_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        set({ wishlist: res.data.wishlist || [] });
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        set({ wishlist: [] });
      }
    },

    addToCart: async (product, quantity, size, variant) => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) return console.error('User not authenticated');

      try {
        const res = await axios.post(`${API_URL}/api/cart`, {
          productId: product._id,
          size,
          variant,
          quantity: quantity || 1,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const cartItems: CartItem[] = res.data.cart?.products?.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          variant: item.variant,
          _id: item._id,
        })) || [];

        set({ cart: cartItems });
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    },

    removeFromCart: async (productId, size, variant) => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) return;

      try {
        const res = await axios.delete(`${API_URL}/api/cart`, {
          data: { productId, size, variant },
          headers: { Authorization: `Bearer ${token}` },
        });

        const cartItems: CartItem[] = res.data.cart?.products?.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          variant: item.variant,
          _id: item._id,
        })) || [];

        set({ cart: cartItems });
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    },

    updateCartQuantity: async (productId, quantity, size, variant) => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) return;

      try {
        if (quantity <= 0) {
          await get().removeFromCart(productId, size, variant);
          return;
        }

        const res = await axios.patch(`${API_URL}/api/cart`, {
          productId,
          size,
          variant,
          quantity,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const cartItems: CartItem[] = res.data.cart?.products?.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          variant: item.variant,
          _id: item._id,
        })) || [];

        set({ cart: cartItems });
      } catch (error) {
        console.error('Error updating cart quantity:', error);
      }
    },

    addToWishlist: async (product) => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) return console.error('User not authenticated');

      try {
        await axios.post(`${API_URL}/api/wishlist/toggle`, {
          productId: product._id,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        await get().fetchWishlist();
      } catch (error) {
        console.error('Error toggling wishlist:', error);
      }
    },

    removeFromWishlist: async (productId) => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) return;

      try {
        await axios.delete(`${API_URL}/api/wishlist`, {
          data: { productId },
          headers: { Authorization: `Bearer ${token}` },
        });

        await get().fetchWishlist();
      } catch (error) {
        console.error('Error removing from wishlist:', error);
      }
    },

    isInWishlist: (productId) => {
      return get().wishlist.some((item) => item._id === productId);
    },

    getCartTotal: () => {
      const cart = get().cart;
      return cart.reduce((total, item) => {
        const product = typeof item.productId === 'string' ? null : item.productId;
        if (!product) return total;
        return total + product.price * item.quantity;
      }, 0);
    },

    getCartItemCount: () => {
      return get().cart.reduce((total, item) => total + item.quantity, 0);
    },

    reset: () => set({
      cart: [],
      wishlist: [],
    }),
  };
});
