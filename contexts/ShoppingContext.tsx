import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types/Product';
import { CartItem } from '@/types/CartItem';
import { WishlistItem } from '@/types/WishlistItem';

interface ShoppingContextType {
  cart: CartItem[];
  wishlist: WishlistItem[];
  addToCart: (product: Product, size?: string, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getCartTotal: (products: Product[]) => number;
  getCartItemCount: () => number;
}

const ShoppingContext = createContext<ShoppingContextType | undefined>(undefined);

export function ShoppingProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const { user } = useAuth();

  const addToCart = (product: Product, size?: string, color?: string) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    const userId = user.id;
    setCart(prev => {
      const existingItem = prev.find(item => 
        item.productId === product.id && 
        item.selectedSize === size && 
        item.selectedColor === color
      );
      
      if (existingItem) {
        return prev.map(item =>
          item.productId === product.id && 
          item.selectedSize === size && 
          item.selectedColor === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: (cart.length + 1).toString(),
          userId,
          productId: product.id,
          quantity: 1,
          selectedSize: size,
          selectedColor: color,
        }
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const addToWishlist = (product: Product) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    setWishlist(prev => [...prev, { 
      id: (wishlist.length + 1).toString(), 
      userId: user.id, 
      productId: product.id 
    }]);
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(item => item.productId !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.productId === productId);
  };

  const getCartTotal = (products: Product[]) => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return total;
      return total + product.price * item.quantity;
    }, 0);
  };


  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <ShoppingContext.Provider value={{
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
    }}>
      {children}
    </ShoppingContext.Provider>
  );
}

export function useShopping() {
  const context = useContext(ShoppingContext);
  if (context === undefined) {
    throw new Error('useShopping must be used within a ShoppingProvider');
  }
  return context;
}