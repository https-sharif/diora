import { useShoppingStore } from '@/stores/shoppingStore';
import { ShoppingStore } from '@/types/Shopping';

export const useShopping = () => {
  const cart = useShoppingStore((state: ShoppingStore) => state.cart);
  const wishlist = useShoppingStore((state: ShoppingStore) => state.wishlist);
  const addToCart = useShoppingStore((state: ShoppingStore) => state.addToCart);
  const removeFromCart = useShoppingStore((state: ShoppingStore) => state.removeFromCart);
  const updateCartQuantity = useShoppingStore((state: ShoppingStore) => state.updateCartQuantity);
  const addToWishlist = useShoppingStore((state: ShoppingStore) => state.addToWishlist);
  const removeFromWishlist = useShoppingStore((state: ShoppingStore) => state.removeFromWishlist);
  const isInWishlist = useShoppingStore((state: ShoppingStore) => state.isInWishlist);
  const getCartTotal = useShoppingStore((state: ShoppingStore) => state.getCartTotal);
  const getCartItemCount = useShoppingStore((state: ShoppingStore) => state.getCartItemCount);
  const fetchCart = useShoppingStore((state: ShoppingStore) => state.fetchCart);
  const fetchWishlist = useShoppingStore((state: ShoppingStore) => state.fetchWishlist);
  const initializeUserData = useShoppingStore((state: ShoppingStore) => state.initializeUserData);

  return { 
    cart, 
    wishlist, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist, 
    getCartTotal, 
    getCartItemCount, 
    fetchCart, 
    fetchWishlist,
    initializeUserData
  };
};