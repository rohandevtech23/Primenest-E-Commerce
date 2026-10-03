
"use client";

import Navbar from "@/components/Navbar";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";

export default function WishlistPage() {
  const {
    wishlist,
    wishlistCount,
    removeFromWishlist,
    isLoaded,
  } = useWishlist();

  const formatPrice = (price) =>
    Number(price).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  return (
    <>
      <Navbar />

      <main className="wishlist-page">
        <div className="wishlist-header">
          <p className="wishlist-eyebrow">
            PRIMENEST / YOUR COLLECTION
          </p>
          <h1>My Wishlist<span>.</span></h1>
          <p className="wishlist-subtitle">
            Your favourite pieces, all in one place.
          </p>
          <div className="wishlist-divider" />
          <p className="wishlist-total">
            {wishlistCount} SAVED ITEMS
          </p>
        </div>

        {!isLoaded ? (
          <p className="wishlist-message">
            Loading your wishlist...
          </p>
        ) : wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">♡</div>
            <h2>Your wishlist is empty.</h2>
            <p>
              Discover something you love and save it here.
            </p>
            <Link href="/shop" className="wishlist-shop-button">
              EXPLORE COLLECTION ↗
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((product) => (
              <article
                className="wishlist-card"
                key={product.id}
              >
                <Link
                  href={`/product/${product.id}`}
                  className="wishlist-image-link"
                >
                  <div className="wishlist-image">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                      />
                    ) : (
                      <div className="wishlist-no-image">
                        No image available
                      </div>
                    )}
                  </div>
                </Link>

                <div className="wishlist-product-info">
                  <p className="wishlist-category">
                    {product.category || "COLLECTION"}
                  </p>

                  <h2>{product.name}</h2>

                  <p className="wishlist-price">
                    {formatPrice(product.price)}
                  </p>

                  <div className="wishlist-card-actions">
                    <Link
                      href={`/product/${product.id}`}
                      className="wishlist-view-button"
                    >
                      VIEW PRODUCT ↗
                    </Link>

                    <button
                      type="button"
                      className="wishlist-remove-button"
                      onClick={() =>
                        removeFromWishlist(product.id)
                      }
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      ♡ REMOVE
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}