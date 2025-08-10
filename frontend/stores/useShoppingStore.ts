import { create } from 'zustand';
import axios from 'axios';
import { Product } from '@/types/Product';
import { CartItem } from '@/types/Cart';
import { useAuthStore } from '@/stores/useAuthStore';
import { API_URL } from '@/constants/api';

interface ShoppingStore {
  cart: CartItem[];
  wishlist: Product[];
  
  // Loading states for optimistic updates
  cartOperations: Set<string>;
  wishlistOperations: Set<string>;
  
  // Debounce mechanism for wishlist
  wishlistDebounceMap: Map<string, ReturnType<typeof setTimeout>>;

  addToCart: (product: Product, quantity: number, size?: string, variant?: string ) => Promise<void>;
  removeFromCart: (productId: string, size?: string, variant?: string) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number, size?: string, variant?: string) => Promise<void>;

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

export const useShoppingStore = create<ShoppingStore>((set, get) => {
  // Helper functions for operation tracking
  const addCartOperation = (key: string) => {
    const operations = new Set(get().cartOperations);
    operations.add(key);
    set({ cartOperations: operations });
  };

  const removeCartOperation = (key: string) => {
    const operations = new Set(get().cartOperations);
    operations.delete(key);
    set({ cartOperations: operations });
  };

  const addWishlistOperation = (key: string) => {
    const operations = new Set(get().wishlistOperations);
    operations.add(key);
    set({ wishlistOperations: operations });
  };

  const removeWishlistOperation = (key: string) => {
    const operations = new Set(get().wishlistOperations);
    operations.delete(key);
    set({ wishlistOperations: operations });
  };

  // Subscribe to auth state changes
  useAuthStore.subscribe((state, prevState) => {
    if (prevState.user && !state.user) {
      // User logged out - clear shopping data and debounce timers
      const debounceMap = get().wishlistDebounceMap;
      debounceMap.forEach(timeout => clearTimeout(timeout));
      
      set({ 
        cart: [], 
        wishlist: [], 
        cartOperations: new Set(), 
        wishlistOperations: new Set(),
        wishlistDebounceMap: new Map()
      });
    } else if (!prevState.user && state.user) {
      // User logged in - initialize shopping data
      get().initializeUserData();
    }
  });

  return {
    cart: [],
    wishlist: [],
    cartOperations: new Set(),
    wishlistOperations: new Set(),
    wishlistDebounceMap: new Map(),

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
      } catch (error: any) {
        console.error('Error fetching cart:', error);
        // For new users or server errors, just set empty cart silently
        set({ cart: [] });
      }
    },

    fetchWishlist: async (silent = false) => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) return;

      // Don't fetch if there are pending operations (prevents flickering)
      if (silent && get().wishlistOperations.size > 0) {
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const newWishlist = res.data.wishlist || [];
        
        if (!silent) {
          set({ wishlist: newWishlist });
        } else {
          // Silent update - only update if there are no pending operations and meaningful difference
          const currentWishlist = get().wishlist;
          
          if (get().wishlistOperations.size === 0) {
            const currentIds = new Set(currentWishlist.map(item => item._id));
            const newIds = new Set(newWishlist.map((item: Product) => item._id));
            
            const hasDifference = currentIds.size !== newIds.size || 
                                !Array.from(currentIds).every(id => newIds.has(id));
            
            if (hasDifference) {
              set({ wishlist: newWishlist });
            }
          }
        }
      } catch (error: any) {
        console.error('Error fetching wishlist:', error);
        // For new users or server errors, just set empty wishlist silently
        if (!silent) {
          set({ wishlist: [] });
        }
      }
    },

    addToCart: async (product, quantity, size, variant) => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) return console.error('User not authenticated');

      // Optimistic update - immediately add to cart in UI
      const newCartItem: CartItem = {
        productId: product,
        quantity: quantity || 1,
        size,
        variant,
        _id: `temp-${Date.now()}` // temporary ID
      };

      const currentCart = get().cart;
      
      // Check if item already exists
      const existingItemIndex = currentCart.findIndex(
        item => {
          const prod = item.productId as Product;
          return prod._id === product._id && item.size === size && item.variant === variant;
        }
      );

      let optimisticCart: CartItem[];
      if (existingItemIndex > -1) {
        // Update existing item quantity
        optimisticCart = [...currentCart];
        optimisticCart[existingItemIndex] = {
          ...optimisticCart[existingItemIndex],
          quantity: optimisticCart[existingItemIndex].quantity + (quantity || 1)
        };
      } else {
        // Add new item
        optimisticCart = [...currentCart, newCartItem];
      }

      set({ cart: optimisticCart });

      // Perform backend update in background
      try {
        const res = await axios.post(`${API_URL}/api/cart`, {
          productId: product._id,
          size,
          variant,
          quantity: quantity || 1,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Update with real data from backend
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
        // Revert optimistic update on error
        set({ cart: currentCart });
      }
    },

    removeFromCart: async (productId, size, variant) => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) return;

      const currentCart = get().cart;
      
      // Optimistic update - immediately remove from cart in UI
      const optimisticCart = currentCart.filter(item => {
        const product = item.productId as Product;
        return !(product._id === productId && item.size === size && item.variant === variant);
      });

      set({ cart: optimisticCart });

      // Perform backend update in background
      try {
        const res = await axios.delete(`${API_URL}/api/cart`, {
          data: { productId, size, variant },
          headers: { Authorization: `Bearer ${token}` },
        });

        // Update with real data from backend
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
        // Revert optimistic update on error
        set({ cart: currentCart });
      }
    },

    updateCartQuantity: async (productId, quantity, size, variant) => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) return;

      const currentCart = get().cart;

      if (quantity <= 0) {
        // Use optimistic remove for quantity 0
        await get().removeFromCart(productId, size, variant);
        return;
      }

      // Optimistic update - immediately update quantity in UI
      const optimisticCart = currentCart.map(item => {
        const product = item.productId as Product;
        if (product._id === productId && item.size === size && item.variant === variant) {
          return { ...item, quantity };
        }
        return item;
      });

      set({ cart: optimisticCart });

      // Perform backend update in background
      try {
        const res = await axios.patch(`${API_URL}/api/cart`, {
          productId,
          size,
          variant,
          quantity,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Update with real data from backend
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
        // Revert optimistic update on error
        set({ cart: currentCart });
      }
    },

    addToWishlist: async (product) => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) return console.error('User not authenticated');

      const productId = product._id;
      const currentWishlist = get().wishlist;
      const isCurrentlyInWishlist = currentWishlist.some(item => item._id === productId);
      
      // Clear any existing timeout for this product
      const debounceMap = get().wishlistDebounceMap;
      const existingTimeout = debounceMap.get(productId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Optimistic update - immediately toggle in UI
      let optimisticWishlist: Product[];
      if (isCurrentlyInWishlist) {
        // Remove from wishlist
        optimisticWishlist = currentWishlist.filter(item => item._id !== productId);
      } else {
        // Add to wishlist
        optimisticWishlist = [...currentWishlist, product];
      }

      set({ wishlist: optimisticWishlist });
      addWishlistOperation(productId);

      // Debounce the backend call to prevent rapid-fire requests
      const newTimeout = setTimeout(async () => {
        try {
          await axios.post(`${API_URL}/api/wishlist/toggle`, {
            productId: productId,
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Remove the operation tracking
          removeWishlistOperation(productId);
          
          // Clean up the timeout from the map
          const currentMap = get().wishlistDebounceMap;
          currentMap.delete(productId);
          set({ wishlistDebounceMap: new Map(currentMap) });

          // Only sync if no other operations are pending for this product
          if (!get().wishlistOperations.has(productId)) {
            // Silent fetch to ensure consistency without causing flickering
            const res = await axios.get(`${API_URL}/api/wishlist`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            const serverWishlist = res.data.wishlist || [];
            const currentState = get().wishlist;
            
            // Only update if there's a meaningful difference and no operations are pending
            if (get().wishlistOperations.size === 0) {
              const serverIds = new Set(serverWishlist.map((item: Product) => item._id));
              const currentIds = new Set(currentState.map(item => item._id));
              
              const hasDifference = serverIds.size !== currentIds.size || 
                                 !Array.from(serverIds).every((id) => currentIds.has(id as string));
              
              if (hasDifference) {
                set({ wishlist: serverWishlist });
              }
            }
          }
        } catch (error) {
          console.error('Error toggling wishlist:', error);
          // Revert optimistic update on error
          set({ wishlist: currentWishlist });
          removeWishlistOperation(productId);
          
          // Clean up the timeout from the map
          const currentMap = get().wishlistDebounceMap;
          currentMap.delete(productId);
          set({ wishlistDebounceMap: new Map(currentMap) });
        }
      }, 300); // 300ms debounce

      // Store the timeout
      const newMap = new Map(debounceMap);
      newMap.set(productId, newTimeout);
      set({ wishlistDebounceMap: newMap });
    },

    removeFromWishlist: async (productId) => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) return;

      const currentWishlist = get().wishlist;
      
      // Clear any existing timeout for this product
      const debounceMap = get().wishlistDebounceMap;
      const existingTimeout = debounceMap.get(productId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      // Optimistic update - immediately remove from wishlist in UI
      const optimisticWishlist = currentWishlist.filter(item => item._id !== productId);
      set({ wishlist: optimisticWishlist });
      addWishlistOperation(productId);

      // Debounce the backend call
      const newTimeout = setTimeout(async () => {
        try {
          await axios.delete(`${API_URL}/api/wishlist`, {
            data: { productId },
            headers: { Authorization: `Bearer ${token}` },
          });

          removeWishlistOperation(productId);
          
          // Clean up the timeout from the map
          const currentMap = get().wishlistDebounceMap;
          currentMap.delete(productId);
          set({ wishlistDebounceMap: new Map(currentMap) });

        } catch (error) {
          console.error('Error removing from wishlist:', error);
          // Revert optimistic update on error
          set({ wishlist: currentWishlist });
          removeWishlistOperation(productId);
          
          // Clean up the timeout from the map
          const currentMap = get().wishlistDebounceMap;
          currentMap.delete(productId);
          set({ wishlistDebounceMap: new Map(currentMap) });
        }
      }, 300);

      // Store the timeout
      const newMap = new Map(debounceMap);
      newMap.set(productId, newTimeout);
      set({ wishlistDebounceMap: newMap });
    },

    isInWishlist: (productId) => {
      return get().wishlist.some((item) => item._id === productId);
    },

    getCartTotal: () => {
      const cart = get().cart;
      return cart.reduce((total, item) => {
        const product = typeof item.productId === 'string' ? null : item.productId;
        if (!product) return total;
        
        // Calculate price with discount if applicable
        let itemPrice = product.price;
        if (product.discount && product.discount > 0) {
          itemPrice = product.price - (product.price * product.discount / 100);
        }
        
        return total + itemPrice * item.quantity;
      }, 0);
    },

    getCartItemCount: () => {
      return get().cart.reduce((total, item) => total + item.quantity, 0);
    },

    reset: () => {
      // Clear any pending debounced operations
      const debounceMap = get().wishlistDebounceMap;
      debounceMap.forEach(timeout => clearTimeout(timeout));
      
      set({
        cart: [],
        wishlist: [],
        cartOperations: new Set(),
        wishlistOperations: new Set(),
        wishlistDebounceMap: new Map(),
      });
    },

    initializeUserData: async () => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      
      if (!user || !token) {
        // Clear data if no user
        set({ cart: [], wishlist: [] });
        return;
      }

      // Only initialize shopping data for users who have completed onboarding
      if (!user.onboarding?.isComplete) {
        console.log('🔒 Skipping shopping data initialization - user onboarding not complete');
        set({ cart: [], wishlist: [] });
        return;
      }

      console.log('📦 Fetching cart and wishlist for user:', user._id);
      
      // Fetch both cart and wishlist in parallel
      try {
        await Promise.all([
          get().fetchCart(),
          get().fetchWishlist()
        ]);
      } catch (error) {
        console.error('Error initializing shopping data:', error);
        // Set empty arrays on error
        set({ cart: [], wishlist: [] });
      }
    },
  };
});
