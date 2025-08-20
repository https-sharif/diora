import { create } from 'zustand';
import { Product } from '@/types/Product';
import { CartItem } from '@/types/Cart';
import { ShoppingStore } from '@/types/Shopping';
import { useAuthStore } from '@/stores/authStore';
import { cartService, wishlistService } from '@/services';

export const useShoppingStore = create<ShoppingStore>((set, get) => {
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

  useAuthStore.subscribe((state, prevState) => {
    if (prevState.user && !state.user) {
      const debounceMap = get().wishlistDebounceMap;
      debounceMap.forEach((timeout) => clearTimeout(timeout));

      set({
        cart: [],
        wishlist: [],
        cartOperations: new Set(),
        wishlistOperations: new Set(),
        wishlistDebounceMap: new Map(),
      });
    } else if (!prevState.user && state.user) {
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
        const res = await cartService.getCart(token);

        const cartItems: CartItem[] =
          res.cart?.products?.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            variant: item.variant,
            _id: item._id,
          })) || [];

        set({ cart: cartItems });
      } catch {
        set({ cart: [] });
      }
    },

    fetchWishlist: async (silent = false) => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) return;

      if (silent && get().wishlistOperations.size > 0) {
        return;
      }

      try {
        const res = await wishlistService.getWishlist(token);

        const newWishlist = res.wishlist || [];

        if (!silent) {
          set({ wishlist: newWishlist });
        } else {
          const currentWishlist = get().wishlist;

          if (get().wishlistOperations.size === 0) {
            const currentIds = new Set(currentWishlist.map((item) => item._id));
            const newIds = new Set(
              newWishlist.map((item: Product) => item._id)
            );

            const hasDifference =
              currentIds.size !== newIds.size ||
              !Array.from(currentIds).every((id) => newIds.has(id));

            if (hasDifference) {
              set({ wishlist: newWishlist });
            }
          }
        }
      } catch {
        if (!silent) {
          set({ wishlist: [] });
        }
      }
    },

    addToCart: async (product, quantity, size, variant) => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) return;

      const newCartItem: CartItem = {
        productId: product,
        quantity: quantity || 1,
        size,
        variant,
        _id: `temp-${Date.now()}`,
      };

      const currentCart = get().cart;

      const existingItemIndex = currentCart.findIndex((item) => {
        const prod = item.productId as Product;
        return (
          prod._id === product._id &&
          item.size === size &&
          item.variant === variant
        );
      });

      let optimisticCart: CartItem[];
      if (existingItemIndex > -1) {
        optimisticCart = [...currentCart];
        optimisticCart[existingItemIndex] = {
          ...optimisticCart[existingItemIndex],
          quantity:
            optimisticCart[existingItemIndex].quantity + (quantity || 1),
        };
      } else {
        optimisticCart = [...currentCart, newCartItem];
      }

      set({ cart: optimisticCart });

      try {
        const res = await cartService.addToCart(
          {
            productId: product._id,
            quantity: quantity || 1,
            size,
            color: variant,
          },
          token
        );

        const cartItems: CartItem[] =
          res.cart?.products?.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            variant: item.variant,
            _id: item._id,
          })) || [];

        set({ cart: cartItems });
      } catch {
        set({ cart: currentCart });
      }
    },

    removeFromCart: async (productId, size, variant) => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) return;

      const currentCart = get().cart;

      const optimisticCart = currentCart.filter((item) => {
        const product = item.productId as Product;
        return !(
          product._id === productId &&
          item.size === size &&
          item.variant === variant
        );
      });

      set({ cart: optimisticCart });

      try {
        const res = await cartService.removeFromCart(productId, token);

        const cartItems: CartItem[] =
          res.cart?.products?.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            variant: item.variant,
            _id: item._id,
          })) || [];

        set({ cart: cartItems });
      } catch {
        set({ cart: currentCart });
      }
    },

    updateCartQuantity: async (productId, quantity, size, variant) => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) return;

      const currentCart = get().cart;

      if (quantity <= 0) {
        await get().removeFromCart(productId, size, variant);
        return;
      }

      const optimisticCart = currentCart.map((item) => {
        const product = item.productId as Product;
        if (
          product._id === productId &&
          item.size === size &&
          item.variant === variant
        ) {
          return { ...item, quantity };
        }
        return item;
      });

      set({ cart: optimisticCart });

      try {
        const res = await cartService.updateCartQuantity(
          productId,
          quantity,
          token
        );

        const cartItems: CartItem[] =
          res.cart?.products?.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            variant: item.variant,
            _id: item._id,
          })) || [];

        set({ cart: cartItems });
      } catch {
        set({ cart: currentCart });
      }
    },

    addToWishlist: async (product) => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) return;

      const productId = product._id;
      const currentWishlist = get().wishlist;
      const isCurrentlyInWishlist = currentWishlist.some(
        (item) => item._id === productId
      );

      const debounceMap = get().wishlistDebounceMap;
      const existingTimeout = debounceMap.get(productId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      let optimisticWishlist: Product[];
      if (isCurrentlyInWishlist) {
        optimisticWishlist = currentWishlist.filter(
          (item) => item._id !== productId
        );
      } else {
        optimisticWishlist = [...currentWishlist, product];
      }

      set({ wishlist: optimisticWishlist });
      addWishlistOperation(productId);

      const newTimeout = setTimeout(async () => {
        try {
          await wishlistService.toggleWishlist(productId, token);

          removeWishlistOperation(productId);

          const currentMap = get().wishlistDebounceMap;
          currentMap.delete(productId);
          set({ wishlistDebounceMap: new Map(currentMap) });

          if (!get().wishlistOperations.has(productId)) {
            const res = await wishlistService.getWishlist(token);

            const serverWishlist = res.wishlist || [];
            const currentState = get().wishlist;

            if (get().wishlistOperations.size === 0) {
              const serverIds = new Set(
                serverWishlist.map((item: Product) => item._id)
              );
              const currentIds = new Set(currentState.map((item) => item._id));

              const hasDifference =
                serverIds.size !== currentIds.size ||
                !Array.from(serverIds).every((id) =>
                  currentIds.has(id as string)
                );

              if (hasDifference) {
                set({ wishlist: serverWishlist });
              }
            }
          }
        } catch {
          set({ wishlist: currentWishlist });
          removeWishlistOperation(productId);

          const currentMap = get().wishlistDebounceMap;
          currentMap.delete(productId);
          set({ wishlistDebounceMap: new Map(currentMap) });
        }
      }, 300);

      const newMap = new Map(debounceMap);
      newMap.set(productId, newTimeout);
      set({ wishlistDebounceMap: newMap });
    },

    removeFromWishlist: async (productId) => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) return;

      const currentWishlist = get().wishlist;

      const debounceMap = get().wishlistDebounceMap;
      const existingTimeout = debounceMap.get(productId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const optimisticWishlist = currentWishlist.filter(
        (item) => item._id !== productId
      );
      set({ wishlist: optimisticWishlist });
      addWishlistOperation(productId);

      const newTimeout = setTimeout(async () => {
        try {
          await wishlistService.removeFromWishlist(productId, token);

          removeWishlistOperation(productId);

          const currentMap = get().wishlistDebounceMap;
          currentMap.delete(productId);
          set({ wishlistDebounceMap: new Map(currentMap) });
        } catch {
          set({ wishlist: currentWishlist });
          removeWishlistOperation(productId);

          const currentMap = get().wishlistDebounceMap;
          currentMap.delete(productId);
          set({ wishlistDebounceMap: new Map(currentMap) });
        }
      }, 300);

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
        const product =
          typeof item.productId === 'string' ? null : item.productId;
        if (!product) return total;

        let itemPrice = product.price;
        if (product.discount && product.discount > 0) {
          itemPrice = product.price - (product.price * product.discount) / 100;
        }

        return total + itemPrice * item.quantity;
      }, 0);
    },

    getCartItemCount: () => {
      return get().cart.reduce((total, item) => total + item.quantity, 0);
    },

    reset: () => {
      const debounceMap = get().wishlistDebounceMap;
      debounceMap.forEach((timeout) => clearTimeout(timeout));

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
        set({ cart: [], wishlist: [] });
        return;
      }

      if (!user.onboarding?.isComplete) {
        set({ cart: [], wishlist: [] });
        return;
      }

      try {
        await Promise.all([get().fetchCart(), get().fetchWishlist()]);
      } catch {
        set({ cart: [], wishlist: [] });
      }
    },
  };
});
