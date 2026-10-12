'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

interface CartContextType {
  cart: any[];
  addToCart: (product: any) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper to generate a unique key for cart items based on specs
  const getCartItemId = (item: any) => {
    return `${item.id}__${item.selectedSize || ''}__${item.selectedColor || ''}`;
  };

  // Initialize from sessionStorage on mount
  useEffect(() => {
    const savedCart = sessionStorage.getItem('toda_bela_cart');
    if (savedCart) {
      try {
        let items = JSON.parse(savedCart);
        // Migration: Add cartItemId to legacy items
        items = items.map((it: any) => ({
          ...it,
          cartItemId: it.cartItemId || getCartItemId(it)
        }));
        setCart(items);
      } catch (e) {
        console.error('Failed to load cart from session storage', e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Persist to sessionStorage on changes
  useEffect(() => {
    if (isInitialized) {
      sessionStorage.setItem('toda_bela_cart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addToCart = useCallback((prod: any) => {
    setCart(prev => {
      const cartItemId = getCartItemId(prod);
      const existing = prev.find(item => item.cartItemId === cartItemId);
      
      if (existing) {
        return prev.map(item => 
          item.cartItemId === cartItemId 
            ? { ...item, quantity: (item.quantity || 0) + (prod.quantity || 1) } 
            : item
        );
      }
      
      return [...prev, { ...prod, cartItemId, quantity: prod.quantity || 1 }];
    });
  }, []);

  const updateQuantity = useCallback((cartItemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + (item.quantity || 0), 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 0)), 0), [cart]);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
