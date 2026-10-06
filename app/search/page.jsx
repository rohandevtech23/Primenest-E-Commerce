"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, X, Sparkles, SlidersHorizontal, ArrowRight, RefreshCw, ChevronLeft, ChevronRight, ShoppingBag, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

const AI_SAMPLE_PROMPTS = [
  "Minimalist linen outfits for summer",
  "Tailored Oxford shirts for office",
  "Comfortable sneakers for daily commute",
  "Evening dinner dress and fragrances",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState("ai"); // "ai" or "keyword"
  const [products, setProducts] = useState([]);
  const [aiResults, setAiResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSearching, setAiSearching] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const { addToCart } = useCart();
  const [addedItemIds, setAddedItemIds] = useState({});

  const handleQuickAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultSize = product.sizes
      ? (Array.isArray(product.sizes)
          ? product.sizes[0]
          : String(product.sizes).split(",")[0].trim())
      : (product.variantLabel || null);

    addToCart(
      {
        ...product,
        variantLabel: defaultSize,
      },
      1
    );

    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  // Initialize query from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get("q") || "";
    setQuery(searchTerm);
  }, []);

  // Load all products for keyword fallback
  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Unable to load products");
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

  // Run AI Semantic Search whenever query changes in AI mode
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || searchMode !== "ai") {
      setAiResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setAiSearching(true);
        const res = await fetch(`/api/ai/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setAiResults(data.results || []);
        }
      } catch (err) {
        console.error("AI Search failed:", err);
      } finally {
        setAiSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, searchMode]);

  // Standard keyword matching fallback
  const keywordFiltered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return products.filter((product) => {
      const corpus = [
        product.name,
        product.title,
        product.category,
        product.subcategory,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return corpus.includes(term);
    });
  }, [query, products]);

  const activeResults = searchMode === "ai" ? aiResults : keywordFiltered;

  // Reset pagination when query or search mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query, searchMode]);

  const totalResults = activeResults.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalResults);
  const paginatedResults = useMemo(() => {
    return activeResults.slice(startIndex, endIndex);
  }, [activeResults, startIndex, endIndex]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === safeCurrentPage) return;
    setCurrentPage(newPage);
    const targetEl = document.querySelector(".search-results");
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (safeCurrentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages];
  };

  return (
    <>
      <Navbar />

      <main className="search-page">
        <div className="search-container">
          <span className="search-badge-ai">
            <Sparkles size={13} /> PRIMENEST SEARCH INTELLIGENCE
          </span>
          <h1>Find your perfect piece.</h1>
          <p className="search-subtitle">
            Powered by semantic understanding: search by occasion, aesthetic, fabric, or feeling.
          </p>

          {/* Search Mode Segmented Switch */}
          <div className="search-mode-bar">
            <button
              type="button"
              className={`search-mode-pill ${searchMode === "ai" ? "active" : ""}`}
              onClick={() => setSearchMode("ai")}
            >
              <Sparkles size={14} /> AI Semantic Search
            </button>
            <button
              type="button"
              className={`search-mode-pill ${searchMode === "keyword" ? "active" : ""}`}
              onClick={() => setSearchMode("keyword")}
            >
              Standard Keyword
            </button>
          </div>

          {/* Search Input Box */}
          <div className="search-box">
            {aiSearching ? (
              <RefreshCw size={21} className="search-spin-icon text-amber-600" />
            ) : (
              <Search size={21} />
            )}
            <input
              type="search"
              placeholder={
                searchMode === "ai"
                  ? "Describe what you need (e.g. 'linen outfit for summer beach party')..."
                  : "Search by product name, category..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="search-clear-btn"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Prompt Suggestions */}
          {!query.trim() && (
            <div className="search-suggestions-wrap">
              <span className="suggestions-label">Try asking the AI:</span>
              <div className="suggestions-chips">
                {AI_SAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="suggestion-chip"
                    onClick={() => {
                      setSearchMode("ai");
                      setQuery(prompt);
                    }}
                  >
                    <span>{prompt}</span>
                    <ArrowRight size={12} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && <p className="search-status-text">Loading catalog collections...</p>}
          {error && <p className="search-error-text">{error}</p>}

          {/* Results Grid */}
          {query.trim() && !loading && (
            <section className="search-results">
              <div className="search-results-meta">
                <h2>
                  {activeResults.length} {searchMode === "ai" ? "Semantic Matches" : "Results"} for "{query}"
                </h2>
                {searchMode === "ai" && (
                  <span className="ai-intent-pill">
                    <Sparkles size={12} /> Ranked by style & material relevance
                  </span>
                )}
              </div>

              {activeResults.length > 0 ? (
                <>
                  <div className="search-grid">
                    {paginatedResults.map((product, index) => {
                      const name = product.name || product.title || "Product";
                      const image =
                        product.image ||
                        product.image_url ||
                        product.images?.[0] ||
                        "/images/shop-banner.png";

                      return (
                        <div
                          className="search-product-card"
                          key={product.id ?? index}
                        >
                          <Link
                            href={`/product/${product.id}`}
                            className="search-image-wrap"
                          >
                            <img src={image} alt={name} loading="lazy" />

                            {searchMode === "ai" && product.matchScore && (
                              <span className="ai-match-score-badge">
                                {product.matchScore}% Match
                              </span>
                            )}
                          </Link>

                          <div className="search-product-info">
                            <Link href={`/product/${product.id}`} className="search-info-link">
                              <span className="search-card-category">
                                {product.category} {product.subcategory ? `• ${product.subcategory}` : ""}
                              </span>
                              <h3>{name}</h3>

                              {searchMode === "ai" && product.matchReason && (
                                <div className="ai-match-reason-tag">
                                  ✦ {product.matchReason}
                                </div>
                              )}

                              {product.price != null && (
                                <strong className="search-product-price">
                                  ₹{Number(product.price).toLocaleString("en-IN")}
                                </strong>
                              )}
                            </Link>

                            <button
                              type="button"
                              className={`search-card-add-btn ${addedItemIds[product.id] ? "is-added" : ""}`}
                              onClick={(e) => handleQuickAddToCart(e, product)}
                              aria-label={`Add ${name} to bag`}
                            >
                              {addedItemIds[product.id] ? (
                                <>
                                  <Check size={13} />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag size={13} />
                                  <span>Add to Bag</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Search Pagination Controls (when more than 8 results) */}
                  {totalPages > 1 && (
                    <div className="search-pagination-wrap">
                      <div className="search-pagination-info">
                        Showing <strong>{startIndex + 1}–{endIndex}</strong> of <strong>{totalResults}</strong> matches
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
                          {getPageNumbers().map((page, idx) =>
                            page === "..." ? (
                              <span key={`ellipsis-${idx}`} className="search-pagination-ellipsis">
                                …
                              </span>
                            ) : (
                              <button
                                key={page}
                                type="button"
                                className={`search-pagination-number ${safeCurrentPage === page ? "active" : ""}`}
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </button>
                            )
                          )}
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
              ) : (
                <div className="search-empty">
                  <Search size={36} />
                  <h3>No matches found</h3>
                  <p>
                    {searchMode === "ai"
                      ? "Try describing an aesthetic, season, or wardrobe essential."
                      : "Try using different keywords or checking for spelling."}
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}