
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const searchTerm = params.get("q") || "";
  setQuery(searchTerm);
    }, []);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Unable to load products");
        }

        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return [];

    return products.filter((product) => {
      const searchable = [
        product.name,
        product.title,
        product.brand,
        product.category,
        product.subcategory,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(term);
    });
  }, [query, products]);

  return (
    <main className="search-page">
      <div className="search-container">
        <p className="search-eyebrow">PRIMENEST</p>
        <h1>Find your perfect style.</h1>
        <p className="search-subtitle">
          Search clothing, accessories, home essentials
          and fragrances.
        </p>

        <div className="search-box">
          <Search size={21} />
          <input
            type="search"
            placeholder="Search products, brands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {!query.trim() && (
          <p className="search-hint">
            Start typing to discover products.
          </p>
        )}

        {loading && <p>Loading products...</p>}
        {error && <p role="alert">{error}</p>}

        {query.trim() && !loading && !error && (
          <section className="search-results">
            <h2>
              {filteredProducts.length} results for "{query}"
            </h2>

            {filteredProducts.length > 0 ? (
              <div className="search-grid">
                {filteredProducts.map((product, index) => {
                  const name = product.name || product.title || "Product";
                  const image =
                    product.image_url ||
                    product.image ||
                    product.image_url_1;

                  return (
                    <Link
                      href={`/product/${product.id}`}
                      className="search-product"
                      key={product.id ?? index}
                    >
                      {image ? (
                        <img src={image} alt={name} />
                      ) : (
                        <div className="search-placeholder">
                          <Search size={28} />
                        </div>
                      )}

                      <div className="search-product-info">
                        <h3>{name}</h3>
                        {product.brand && <p>{product.brand}</p>}
                        {product.price != null && (
                          <strong>
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </strong>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="search-empty">
                <Search size={32} />
                <h3>No products found</h3>
                <p>Try another product name or category.</p>
              </div>
            )}
          </section>
        )}
      </div>

      <style jsx>{`
        .search-page {
          min-height: 75vh;
          padding: 70px 24px;
          background: #fff;
          color: #171717;
        }

        .search-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .search-eyebrow {
          font-size: 12px;
          letter-spacing: 4px;
          font-weight: 700;
          color: #a1844e;
        }

        h1 {
          font-size: clamp(30px, 5vw, 48px);
          margin: 12px 0;
          font-weight: 600;
        }

        .search-subtitle {
          color: #777;
          margin-bottom: 32px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 14px;
          max-width: 760px;
          padding: 16px 18px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 14px;
        }

        .search-box:focus-within {
          border-color: #a1844e;
        }

        .search-box input {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 16px;
          color: #171717;
        }

        .search-box button {
          border: 0;
          background: transparent;
          cursor: pointer;
          display: flex;
        }

        .search-hint {
          color: #888;
          font-size: 13px;
        }

        .search-results {
          margin-top: 45px;
        }

        .search-results h2 {
          font-size: 17px;
          font-weight: 500;
          margin-bottom: 22px;
        }

        .search-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
        }

        .search-product {
          text-decoration: none;
          color: inherit;
          min-width: 0;
        }

        .search-product img,
        .search-placeholder {
          width: 100%;
          aspect-ratio: 3 / 4;
          object-fit: cover;
          background: #f5f4f1;
        }

        .search-placeholder {
          display: grid;
          place-items: center;
          color: #aaa;
        }

        .search-product-info {
          padding-top: 12px;
        }

        .search-product-info h3 {
          font-size: 14px;
          font-weight: 500;
          margin: 0 0 6px;
        }

        .search-product-info p {
          font-size: 12px;
          color: #777;
          margin: 0 0 8px;
        }

        .search-product-info strong {
          font-size: 14px;
        }

        .search-empty {
          text-align: center;
          padding: 65px 20px;
          color: #777;
        }

        .search-empty h3 {
          color: #222;
          margin: 15px 0 8px;
        }

        @media (max-width: 768px) {
          .search-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }

          .search-page {
            padding: 45px 16px;
          }
        }
      `}</style>
    </main>
  );
}