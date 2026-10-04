
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  // Load saved cart before enabling cart updates to storage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("primenest-cart");

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.error("Unable to load saved cart:", error);
    } finally {
      setIsCartLoaded(true);
    }
  }, []);

  // Save cart only after the initial load is complete
  useEffect(() => {
    if (!isCartLoaded) return;

    try {
      localStorage.setItem(
        "primenest-cart",
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error("Unable to save cart:", error);
    }
  }, [cart, isCartLoaded]);

  // Helper to generate a unique key for cart items based on id and variant/size
  const getItemKey = (item) =>
    String(
      item.cartItemId ||
        (item.variantLabel ? `${item.id}-${item.variantLabel}` : item.id)
    );

  // Add product to cart with size/variant awareness
  const addToCart = (product, quantity = 1, options = {}) => {
    const amount = Math.max(1, Number(quantity) || 1);
    const itemKey = getItemKey(product);

    setCart((currentCart) => {
      const existing = currentCart.find((item) => getItemKey(item) === itemKey);

      if (existing) {
        return currentCart.map((item) =>
          getItemKey(item) === itemKey
            ? {
                ...item,
                quantity: Number(item.quantity || 0) + amount,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          cartItemId: itemKey,
          quantity: amount,
        },
      ];
    });

    // Notify user with sonner toast unless explicitly silent
    if (!options?.silent) {
      const itemName = product?.name || "Item";
      const variantTag = product?.variantLabel ? ` (${product.variantLabel})` : "";
      toast.success("Added to bag! 🛍️", {
        description: `${itemName}${variantTag} (×${amount}) has been added to your shopping bag.`,
        duration: 3500,
      });
    }
  };

  // Remove product by id or cart item key
  const removeFromCart = (idOrKey) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          getItemKey(item) !== String(idOrKey) && String(item.id) !== String(idOrKey)
      )
    );
  };

  // Update quantity by id or cart item key
  const updateQuantity = (idOrKey, quantity) => {
    const amount = Number(quantity);

    if (amount < 1) {
      removeFromCart(idOrKey);
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        getItemKey(item) === String(idOrKey) || String(item.id) === String(idOrKey)
          ? { ...item, quantity: amount }
          : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Total item count
  const cartCount = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  // Total price
  const cartTotal = cart.reduce((total, item) => {
    const price = Number(
      String(item.price ?? "").replace(/[₹,\s]/g, "")
    );

    return total + (Number.isFinite(price) ? price : 0) *
      Number(item.quantity || 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartLoaded,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}