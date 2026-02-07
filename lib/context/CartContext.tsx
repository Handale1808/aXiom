// lib/context/CartContext.tsx

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useUser } from "./UserContext";
import { useToast } from "./ToastContext";
import {
  addToCartAction,
  removeFromCartAction,
  getUserCartAction,
  getCartCountAction,
  checkoutCartAction,
} from "@/lib/services/cartActions";
import { getCatPriceAction } from "@/lib/services/settingsActions";

interface CartItem {
  catAlienId: string;
  name: string;
  svgImage: string;
  addedAt: string;
}

interface CartContextType {
  cartCount: number;
  isLoading: boolean;
  cartItems: CartItem[];
  price: number;
  addToCart: (catAlienId: string) => Promise<void>;
  removeFromCart: (catAlienId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  checkout: () => Promise<{ success: boolean; error?: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isAdmin } = useUser();
  const { showToast } = useToast();
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [price, setPrice] = useState(500);

  const refreshCart = async () => {
    if (!user?.id || isAdmin) {
      setCartCount(0);
      setCartItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [items, count, currentPrice] = await Promise.all([
        getUserCartAction(user.id),
        getCartCountAction(user.id),
        getCatPriceAction(),
      ]);

      setCartItems(items);
      setCartCount(count);
      setPrice(currentPrice);
    } catch (error) {
      console.error("Failed to refresh cart:", error);
      showToast("[FAILED_TO_LOAD_CART]", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      refreshCart();
    } else {
      setIsLoading(false);
    }
  }, [user?.id, isAdmin, isAuthenticated]);

  const addToCart = async (catAlienId: string) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await addToCartAction(user.id, catAlienId);

      if (result.success) {
        showToast("[CAT_ADDED_TO_CART]", "success");
        await refreshCart();
      } else {
        if (result.error === "Cat already in cart") {
          showToast("[CAT_ALREADY_IN_CART]", "error");
        } else if (result.error === "Cat not available") {
          showToast("[CAT_NO_LONGER_AVAILABLE]", "error");
        } else {
          showToast(`[ERROR: ${result.error}]`, "error");
        }
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      showToast("[FAILED_TO_ADD_TO_CART]", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (catAlienId: string) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await removeFromCartAction(user.id, catAlienId);

      if (result.success) {
        showToast("[CAT_REMOVED_FROM_CART]", "success");
        await refreshCart();
      } else {
        showToast(`[ERROR: ${result.error}]`, "error");
      }
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      showToast("[FAILED_TO_REMOVE_FROM_CART]", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const checkout = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    setIsLoading(true);
    try {
      const result = await checkoutCartAction(user.id);

      if (result.success) {
        showToast("[PURCHASE_COMPLETE]", "success");
        await refreshCart();
        return { success: true };
      } else {
        showToast(`[ERROR: ${result.error}]`, "error");
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Failed to checkout:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showToast("[CHECKOUT_FAILED]", "error");
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const value: CartContextType = {
    cartCount,
    isLoading,
    cartItems,
    price,
    addToCart,
    removeFromCart,
    refreshCart,
    checkout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}