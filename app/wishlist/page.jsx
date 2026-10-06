
"use client";
 
import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function WishlistPage() {
  const {
    wishlist,
    wishlistCount,
    removeFromWishlist,
    isLoaded,
  } = useWishlist();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalItems = wishlist.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedWishlist = useMemo(() => {
    return wishlist.slice(startIndex, endIndex);
  }, [wishlist, startIndex, endIndex]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === safeCurrentPage) return;
    setCurrentPage(newPage);
  };

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
          <>
            <div className="wishlist-grid">
              {paginatedWishlist.map((product) => (
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

            {totalPages > 1 && (
              <div className="search-pagination-wrap" style={{ marginTop: "40px", maxWidth: "1280px", marginInline: "auto" }}>
                <div className="search-pagination-info">
                  Showing <strong>{startIndex + 1}–{endIndex}</strong> of <strong>{totalItems}</strong> saved items
                </div>

                <div className="search-pagination-controls">
                  <button
                    type="button"
                    className="search-pagination-btn"
                    disabled={safeCurrentPage === 1}
                    onClick={() => handlePageChange(safeCurrentPage - 1)}
                    aria-label="Previous Page"
                  >
                    <ChevronLeft size={15} />
                    <span>Previous</span>
                  </button>

                  <div className="search-pagination-pages">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        className={`search-pagination-number ${safeCurrentPage === page ? "active" : ""}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="search-pagination-btn"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => handlePageChange(safeCurrentPage + 1)}
                    aria-label="Next Page"
                  >
                    <span>Next</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}