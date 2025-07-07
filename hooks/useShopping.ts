import { useShoppingStore } from '@/stores/useShoppingStore';

export const useShopping = () => {
  const cart = useShoppingStore(state => state.cart);
  const wishlist = useShoppingStore(state => state.wishlist);
  const addToCart = useShoppingStore(state => state.addToCart);
  const removeFromCart = useShoppingStore(state => state.removeFromCart);
  const updateCartQuantity = useShoppingStore(state => state.updateCartQuantity);
  const addToWishlist = useShoppingStore(state => state.addToWishlist);
  const removeFromWishlist = useShoppingStore(state => state.removeFromWishlist);
  const isInWishlist = useShoppingStore(state => state.isInWishlist);
  const getCartTotal = useShoppingStore(state => state.getCartTotal);
  const getCartItemCount = useShoppingStore(state => state.getCartItemCount);

  return { cart, wishlist, addToCart, removeFromCart, updateCartQuantity, addToWishlist, removeFromWishlist, isInWishlist, getCartTotal, getCartItemCount };
};