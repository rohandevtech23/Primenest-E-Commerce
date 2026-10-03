
"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ChevronDown, X } from "lucide-react";

// Predefined subcategory taxonomy matching mega-menu and database
const PREDEFINED_SUBCATEGORIES = {
  footwear: [
    "Men's Casual Shoes",
    "Men's Slippers",
    "Women's Sneakers",
    "Men's Sneakers",
    "Women's Casual Shoes",
    "Men's Sports Shoes",
    "Women's Sports Shoes",
    "Men's Formal Shoes",
    "Women's Formal Shoes",
    "Women's Slippers",
    "Casual Shoes",
    "Sports Shoes",
    "Sneakers",
    "Formal Shoes",
    "Loafers",
    "Sandals & Floaters",
    "Flip Flops",
    "Women's Heels",
    "Flats",
    "Slippers",
  ],
  perfume: [
    "Women's Perfume",
    "Men's Perfume",
    "Unisex Perfume",
    "Gift Sets",
    "Luxury Fragrances",
  ],
  men: [
    "T-Shirts",
    "Casual Shirts",
    "Formal Shirts",
    "Sweatshirts",
    "Sweaters",
    "Jackets",
    "Jeans",
    "Casual Trousers",
    "Formal Trousers",
    "Shorts",
    "Track Pants & Joggers",
  ],
  women: [
    "Kurtas & Suits",
    "Dresses",
    "Tops & T-Shirts",
    "Jeans & Trousers",
    "Skirts & Palazzos",
    "Sarees",
    "Jackets & Shrugs",
    "Sweaters",
  ],
  accessories: [
    "Watches",
    "Smart Watches",
    "Sunglasses",
    "Wallets",
    "Belts",
    "Backpacks",
    "Handbags",
    "Jewellery",
  ],
  "home-essentials": [
    "Bedding & Bedsheets",
    "Cushion Covers",
    "Curtains",
    "Lighting & Lamps",
    "Wall Decor & Art",
    "Vases & Showpieces",
    "Clocks",
    "Table Decor",
  ],
  kids: [
    "Boys Clothing",
    "Girls Clothing",
    "Infants & Toddlers",
    "Kids Footwear",
    "Toys & Games",
  ],
  beauty: [
    "Skincare",
    "Haircare",
    "Makeup",
    "Bath & Body",
    "Fragrances",
    "Grooming Essentials",
  ],
};

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [subcategory, setSubcategory] = useState("");
  const [expandedCategory, setExpandedCategory] = useState("");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();

  // Read category and subcategory from navbar URL
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    const urlSubcategory = searchParams.get("subcategory");

    const resolvedCategory = urlCategory ? urlCategory.toLowerCase() : "All";
    setCategory(resolvedCategory);
    setSubcategory(urlSubcategory || "");
    if (resolvedCategory !== "All") {
      setExpandedCategory(resolvedCategory);
    }
  }, [searchParams]);

      // Load products from PostgreSQL API
      useEffect(() => {
        async function loadProducts() {
          try {
            setLoading(true);
            setError("");

        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.products)) {
          throw new Error("Invalid product data received.");
        }

        setProducts(data.products);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  
// Load categories from PostgreSQL API
useEffect(() => {
  async function loadCategories() {
    try {
      const response = await fetch("/api/categories");

      if (!response.ok) {
        throw new Error("Unable to load categories");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setCategoryList(data);
      }
    } catch (error) {
      console.error("Category loading error:", error);
    }
  }

  loadCategories();
}, []);

  // Available main categories from database
  
    const categories = useMemo(() => {
      return categoryList.map((item) => ({
        name: item.name,
        slug: item.slug,
      }));
    }, [categoryList]);

  const categoryLabel =
  category === "All"
    ? "All"
    : categoryList.find(
        (item) => item.slug === category
      )?.name || category;

const toSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  // Helper: Extract & count subcategories based on category
  const getSubcategories = (categorySlug) => {
    const categoryProducts = products.filter(
      (product) => toSlug(product.category) === categorySlug
    );

    // 1. Gather all unique subcategories from products in this category
    const countMap = {};
    categoryProducts.forEach((p) => {
      const sub = (p.subcategory || "").trim();
      if (sub) {
        countMap[sub] = (countMap[sub] || 0) + 1;
      }
    });

    const activeList = Object.keys(countMap).map((name) => ({
      name,
      count: countMap[name],
    }));

    // 2. Predefined list for this category
    const predefined = PREDEFINED_SUBCATEGORIES[categorySlug] || [];
    const activeNamesLower = new Set(
      activeList.map((item) => item.name.toLowerCase())
    );

    const additionalList = [];
    predefined.forEach((name) => {
      if (!activeNamesLower.has(name.toLowerCase())) {
        const matchCount = categoryProducts.filter((p) => {
          const pSub = String(p.subcategory || "").toLowerCase();
          return pSub === name.toLowerCase();
        }).length;

        // If category has no products in DB yet, show predefined subcategories so users can see catalog taxonomy
        if (categoryProducts.length === 0 || matchCount > 0) {
          additionalList.push({
            name,
            count: matchCount,
          });
        }
      }
    });

    const combined = [...activeList, ...additionalList];

    return combined.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    });
  };

  // Filter, search and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Main category filter
    if (category !== "All") {
      result = result.filter(
        (product) => toSlug(product.category) === category
      );
    }

    // Subcategory filter from mega menu / sidebar
    if (subcategory) {
      const subLower = subcategory.trim().toLowerCase();
      result = result.filter((product) => {
        const prodSub = String(product.subcategory || "").trim().toLowerCase();
        return (
          prodSub === subLower ||
          prodSub.includes(subLower) ||
          subLower.includes(prodSub)
        );
      });
    }

    // Product search
    if (search.trim()) {
      const term = search.trim().toLowerCase();

      result = result.filter((product) =>
        [
          product.name,
          product.category,
          product.subcategory,
          product.description,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(term)
          )
      );
    }

    // Sorting
    if (sort === "price-low") {
      result.sort(
        (a, b) => Number(a.price) - Number(b.price)
      );
    } else if (sort === "price-high") {
      result.sort(
        (a, b) => Number(b.price) - Number(a.price)
      );
    } else if (sort === "name") {
      result.sort((a, b) =>
        String(a.name).localeCompare(String(b.name))
      );
    }

    return result;
  }, [products, category, subcategory, search, sort]);

  // Format Indian rupee prices
  const formatPrice = (price) =>
    Number(price).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  // Clear category and subcategory filters
  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSubcategory("");
    setExpandedCategory("");
    setSort("featured");

    window.history.replaceState(
      {},
      "",
      window.location.pathname
    );
  };

  return (
    <>
      <Navbar />

      {/* Edge-to-edge full bleed Hero Banner (Zero white margins) */}
      {(category === "All" || category.toLowerCase() === "footwear" || category.toLowerCase() === "shoes") && !subcategory && (
        <section className="shop-full-banner" aria-label="Footwear & Collection Banner">
          <h1 className="sr-only">
            {category.toLowerCase() === "footwear" ? "Footwear Collection" : "Discover the Collection"} - PrimeNest
          </h1>
          <img
            src="/images/shop-banner.png"
            alt="PrimeNest / The Collection - Discover the Footwear Collection. Thoughtfully selected essentials for everyday living, designed with simplicity and style."
            className="shop-full-banner-img"
            loading="eager"
          />
        </section>
      )}

      <main className="shop-page">
        {/* Category heading when filtered (except when full banner is shown) */}
        {((category !== "All" && category.toLowerCase() !== "footwear" && category.toLowerCase() !== "shoes") || subcategory) && (
          <section className="shop-heading shop-category-heading">
            <p className="shop-eyebrow">
              PRIMENEST / {categoryLabel.toUpperCase()}{subcategory ? ` / ${subcategory.toUpperCase()}` : ""}
            </p>

            <h1>
              {subcategory || categoryLabel}
            </h1>

            <p className="shop-intro">
              {subcategory
                ? `Explore our ${subcategory.toLowerCase()} collection, thoughtfully selected for everyday style.`
                : `Discover the ${categoryLabel} collection at PrimeNest.`}
            </p>
          </section>
        )}

        {/* Search and sorting */}
        <section className="shop-controls">
          <div className="shop-search">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              aria-label="Search products"
            />
          </div>

          <div className="shop-sort">
            <label htmlFor="shop-sort-select">
              SORT BY
            </label>

            <select
              id="shop-sort-select"
              value={sort}
              onChange={(event) =>
                setSort(event.target.value)
              }
            >
              <option value="featured">Featured</option>
              <option value="price-low">
                Price: Low to High
              </option>
              <option value="price-high">
                Price: High to Low
              </option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </section>

        {/* Product catalog */}
        <section className="shop-catalog">
          <aside className="shop-sidebar">
            <p className="shop-filter-title">
              CATEGORIES
            </p>

            
          <div className="shop-category-list">
            {/* All products */}
            <button
              type="button"
              className={
                category === "All" && !subcategory
                  ? "shop-category active"
                  : "shop-category"
              }
              onClick={() => {
                setCategory("All");
                setSubcategory("");
                setExpandedCategory("");
                window.history.replaceState(
                  {},
                  "",
                  window.location.pathname
                );
              }}
            >
              <span>All</span>
              <span className="shop-category-count">{products.length}</span>
            </button>

            {/* Categories with Subcategories */}
            {categories.map((item) => {
              const count =
                item.slug === "All"
                  ? products.length
                  : products.filter(
                      (product) => toSlug(product.category) === item.slug
                    ).length;

              const subcategories = getSubcategories(item.slug);
              const isSelected = category === item.slug;
              const isExpanded = expandedCategory === item.slug;

              return (
                <div key={item.slug} className="shop-category-group">
                  <button
                    type="button"
                    className={`shop-category ${isSelected ? "active" : ""}`}
                    onClick={() => {
                      if (category === item.slug) {
                        // Toggle accordion
                        setExpandedCategory(isExpanded ? "" : item.slug);
                        if (subcategory) {
                          setSubcategory("");
                          window.history.replaceState(
                            {},
                            "",
                            `${window.location.pathname}?category=${encodeURIComponent(item.slug)}`
                          );
                        }
                      } else {
                        setCategory(item.slug);
                        setSubcategory("");
                        setExpandedCategory(item.slug);
                        window.history.replaceState(
                          {},
                          "",
                          `${window.location.pathname}?category=${encodeURIComponent(item.slug)}`
                        );
                      }
                    }}
                  >
                    <span>{item.name}</span>
                    <span className="shop-category-meta">
                      <span className="shop-category-count">{count}</span>
                      {subcategories.length > 0 && (
                        <ChevronDown
                          size={13}
                          className={`shop-category-chevron ${isExpanded ? "rotated" : ""}`}
                        />
                      )}
                    </span>
                  </button>

                  {/* Nested Subcategories Accordion based on category */}
                  {isExpanded && subcategories.length > 0 && (
                    <div
                      className="shop-subcategory-list"
                      role="region"
                      aria-label={`${item.name} subcategories`}
                    >
                      {/* "All [Category]" option */}
                      <button
                        type="button"
                        className={`shop-subcategory-item ${isSelected && !subcategory ? "active" : ""}`}
                        onClick={() => {
                          setCategory(item.slug);
                          setSubcategory("");
                          window.history.replaceState(
                            {},
                            "",
                            `${window.location.pathname}?category=${encodeURIComponent(item.slug)}`
                          );
                        }}
                      >
                        <span className="shop-sub-info">
                          <span className="shop-sub-bullet" />
                          <span className="shop-sub-name">All {item.name}</span>
                        </span>
                        <span className="shop-sub-count">{count}</span>
                      </button>

                      {/* Subcategory items */}
                      {subcategories.map((sub) => {
                        const isSubActive =
                          isSelected &&
                          subcategory.trim().toLowerCase() ===
                            sub.name.trim().toLowerCase();

                        return (
                          <button
                            key={sub.name}
                            type="button"
                            className={`shop-subcategory-item ${isSubActive ? "active" : ""}`}
                            onClick={() => {
                              setCategory(item.slug);
                              setSubcategory(sub.name);
                              window.history.replaceState(
                                {},
                                "",
                                `${window.location.pathname}?category=${encodeURIComponent(item.slug)}&subcategory=${encodeURIComponent(sub.name)}`
                              );
                            }}
                          >
                            <span className="shop-sub-info">
                              <span className="shop-sub-bullet" />
                              <span className="shop-sub-name">{sub.name}</span>
                            </span>
                            <span className="shop-sub-count">{sub.count}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div> 
        </aside>

          <div className="shop-results">
            {/* Results heading */}
            <div className="shop-results-heading">
              <p>
                {subcategory
                  ? `${category} / ${subcategory}`.toUpperCase()
                  : category === "All"
                    ? "ALL PRODUCTS"
                    : category.toUpperCase()}
              </p>

              <span>
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "ITEM"
                  : "ITEMS"}
              </span>
            </div>

            {/* Active Filter Chips */}
            {(category !== "All" || subcategory || search) && (
              <div className="shop-active-filters-bar">
                <span className="active-filters-label">Filters:</span>
                {category !== "All" && (
                  <button
                    type="button"
                    className="active-filter-chip"
                    onClick={() => {
                      setCategory("All");
                      setSubcategory("");
                      setExpandedCategory("");
                      window.history.replaceState({}, "", window.location.pathname);
                    }}
                  >
                    <span>{categoryLabel}</span>
                    <X size={12} />
                  </button>
                )}
                {subcategory && (
                  <button
                    type="button"
                    className="active-filter-chip"
                    onClick={() => {
                      setSubcategory("");
                      window.history.replaceState(
                        {},
                        "",
                        `${window.location.pathname}?category=${encodeURIComponent(category)}`
                      );
                    }}
                  >
                    <span>{subcategory}</span>
                    <X size={12} />
                  </button>
                )}
                {search && (
                  <button
                    type="button"
                    className="active-filter-chip"
                    onClick={() => setSearch("")}
                  >
                    <span>"{search}"</span>
                    <X size={12} />
                  </button>
                )}
                <button
                  type="button"
                  className="clear-all-filters-btn"
                  onClick={clearFilters}
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="shop-message">
                Loading collection...
              </div>
            ) : error ? (
              <div className="shop-message shop-error">
                <h2>
                  Unable to load the collection
                </h2>
                <p>{error}</p>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty state */
              <div className="shop-message">
                <h2>No products found</h2>
                <p>
                  Try another search or category.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              /* Product cards */
              <div className="shop-product-grid">
                {[
            ...new Map(
              filteredProducts.map((product) => [
                String(product.id),
                product,
              ])
            ).values(),
          ].map((product) => (
              <Link
                href={`/product/${product.id}`}
                className="shop-product-card"
                key={product.id}
              >
                    <div className="shop-product-image">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                        />
                      ) : (
                        <div className="shop-image-placeholder">
                          PRIMENEST
                        </div>
                      )}

                      <span className="shop-view-product">
                        VIEW PRODUCT ↗
                      </span>
                    </div>

                    <div className="shop-product-info">
                      <h2 className="shop-product-name" title={product.name}>
                        {product.name}
                      </h2>

                      <span className="shop-product-price">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}