
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved wishlist
  useEffect(() => {
    try {
      const saved = localStorage.getItem("primenest-wishlist");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setWishlist(parsed);
        }
      }
    } catch (error) {
      console.error("Unable to load wishlist:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save wishlist
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(
        "primenest-wishlist",
        JSON.stringify(wishlist)
      );
    } catch (error) {
      console.error("Unable to save wishlist:", error);
    }
  }, [wishlist, isLoaded]);

  // Add product
  const addToWishlist = (product) => {
    setWishlist((current) => {
      const exists = current.some(
        (item) => String(item.id) === String(product.id)
      );

      if (exists) return current;
      return [...current, product];
    });
  };

  // Remove product
  const removeFromWishlist = (id) => {
    setWishlist((current) =>
      current.filter(
        (item) => String(item.id) !== String(id)
      )
    );
  };

  // Toggle product
  const toggleWishlist = (product) => {
    setWishlist((current) => {
      const exists = current.some(
        (item) => String(item.id) === String(product.id)
      );

      if (exists) {
        return current.filter(
          (item) => String(item.id) !== String(product.id)
        );
      }

      return [...current, product];
    });
  };

  const isWishlisted = (id) =>
    wishlist.some((item) => String(item.id) === String(id));

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,
        isLoaded,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider"
    );
  }

  return context;
}