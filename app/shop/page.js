"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  Sparkles,
  SlidersHorizontal,
  Shirt,
  Crown,
  Footprints,
  Droplets,
  Watch,
  Home,
  Baby,
  Layers,
  Heart,
  ArrowUpRight,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  LayoutGrid,
  Grid2X2,
  ShoppingBag,
  Check,
} from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import "./shop-luxury.css";

// Predefined subcategory taxonomy matching mega-menu and database
const PREDEFINED_SUBCATEGORIES = {
  footwear: [
    "Men's Sneakers",
    "Men's Casual Shoes",
    "Men's Sports Shoes",
    "Men's Slippers",
    "Women's Heels",
    "Women's Sneakers",
    "Women's Casual Shoes",
    "Women's Sports Shoes",
    "Women's Slippers",
    "Flip Flops",
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
    "Sweatshirts",
    "Jackets",
    "Jeans",
    "Casual Trousers",
    "Track Pants & Joggers",
  ],
  women: [
    "Dresses",
    "Tops & T-Shirts",
    "Sweatshirts",
    "Jeans",
    "Sarees",
    "Jackets",
  ],
  accessories: [
    "Watches",
    "Sunglasses",
    "Backpacks",
    "Handbags",
    "Jewellery",
  ],
};

// Category Icon Mapping
const CATEGORY_ICON_MAP = {
  all: Sparkles,
  men: Shirt,
  women: Crown,
  footwear: Footprints,
  perfume: Droplets,
  accessories: Watch,
};

function getCategoryIcon(slug) {
  const normalized = String(slug || "").toLowerCase().trim();
  return CATEGORY_ICON_MAP[normalized] || Layers;
}

// Category Editorial Taglines & Luxury Badges
const CATEGORY_EDITORIAL_INFO = {
  perfume: {
    tagline: "Artisanal Eau de Parfum, Rare Botanical Extracts & Niche Masterpieces",
    badges: ["✨ 100% Authentic Niche & Designer", "🌿 Long-Lasting Sillage", "🎁 Luxury Packaging"],
  },
  men: {
    tagline: "Contemporary Streetwear, Pure Cotton Jersey & Tailored Wardrobe Classics",
    badges: ["✨ 100% Breathable Combed Cotton", "✂️ Modern Relaxed Cut", "⚡ Fast Dispatch"],
  },
  footwear: {
    tagline: "Iconic Street Silhouettes, Cushioned Court Soles & Everyday Rotation",
    badges: ["✨ Authentic Sneaker Matrix", "👟 Premium Leather & Suede", "🚚 Free Shipping"],
  },
  women: {
    tagline: "Graceful Silhouettes, Designer Ensembles & Haute Couture Craftsmanship",
    badges: ["✨ Exclusive Designer Cuts", "🌸 Breathable Luxury Fabrics", "💎 Curated Edit"],
  },
  accessories: {
    tagline: "Elevated Timepieces, Fine Leather Goods & Modern Lifestyle Accents",
    badges: ["✨ Precision Engineering", "💎 Handcrafted Finishes", "🛡️ Warranty Guaranteed"],
  },
};

function ShopContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlSubcategory = searchParams.get("subcategory");
  const initialCategory = urlCategory ? urlCategory.toLowerCase() : "All";

  const [products, setProducts] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [subcategory, setSubcategory] = useState(urlSubcategory || "");
  const [expandedCategory, setExpandedCategory] = useState(
    initialCategory !== "All" ? initialCategory : ""
  );
  const [sort, setSort] = useState("featured");
  const [priceRange, setPriceRange] = useState("all");
  const [gridColumns, setGridColumns] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { toggleWishlist, isWishlisted } = useWishlist();
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

  // Reset pagination to page 1 whenever any filter or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [category, subcategory, search, priceRange, sort, itemsPerPage]);

  // Keep state synchronized with URL search params
  useEffect(() => {
    const nextCat = searchParams.get("category");
    const nextSub = searchParams.get("subcategory");
    const resolvedCat = nextCat ? nextCat.toLowerCase() : "All";

    setCategory(resolvedCat);
    setSubcategory(nextSub || "");
    if (resolvedCat !== "All") {
      setExpandedCategory(resolvedCat);
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
      : categoryList.find((item) => item.slug === category)?.name || category;

  const toSlug = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

  // Normalize subcategory names (e.g. merge 'Flip Flop' and 'Flip Flops')
  const normalizeSubName = (name) => {
    const s = String(name || "").trim();
    if (/^flip\s*flops?$/i.test(s)) return "Flip Flops";
    return s;
  };

  // Helper: Extract & count subcategories based on category
  const getSubcategories = (categorySlug) => {
    const categoryProducts = products.filter(
      (product) => toSlug(product.category) === categorySlug
    );

    // 1. Gather all unique subcategories from products in this category
    const countMap = {};
    categoryProducts.forEach((p) => {
      const rawSub = (p.subcategory || "").trim();
      if (rawSub) {
        const canonical = normalizeSubName(rawSub);
        countMap[canonical] = (countMap[canonical] || 0) + 1;
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
        const targetClean = name.toLowerCase().replace(/s$/, "");
        const matchCount = categoryProducts.filter((p) => {
          const pSub = String(p.subcategory || "").toLowerCase();
          const pClean = pSub.replace(/s$/, "");
          return pSub === name.toLowerCase() || pClean === targetClean;
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

  // Normalize subcategory for robust matching (e.g. handle quotes, whitespace, plurals)
  const normalizeSubcategory = (str) =>
    String(str || "")
      .trim()
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/\bpants\b/g, "pant")
      .replace(/\s*&\s*/g, " & ")
      .replace(/\s+/g, " ");

  const isSubcategoryMatch = (productSub, filterSub, currentCategory) => {
    if (!filterSub) return true;
    if (!productSub) return false;

    const pNorm = normalizeSubcategory(productSub);
    const fNorm = normalizeSubcategory(filterSub);

    // Exact normalized match
    if (pNorm === fNorm) return true;

    // Singular / plural equality (e.g. "flip flop" vs "flip flops")
    const pSingular = pNorm.replace(/s$/, "");
    const fSingular = fNorm.replace(/s$/, "");
    if (pSingular === fSingular) return true;

    // Strict gender boundaries: "men" vs "women"
    // Using word boundary \bmen(s)?\b ensures "women" isn't misidentified as "men"
    const filterHasMen = /\bmen(s)?\b/i.test(fNorm);
    const filterHasWomen = /\bwomen(s)?\b/i.test(fNorm);
    const filterIsStrictlyMen = filterHasMen && !filterHasWomen;
    const filterIsStrictlyWomen = filterHasWomen;

    const prodHasMen = /\bmen(s)?\b/i.test(pNorm);
    const prodHasWomen = /\bwomen(s)?\b/i.test(pNorm);
    const prodIsStrictlyMen = prodHasMen && !prodHasWomen;
    const prodIsStrictlyWomen = prodHasWomen;

    // If filter is strictly for Men, NEVER match Women's items
    if (filterIsStrictlyMen && prodIsStrictlyWomen) return false;
    // If filter is strictly for Women, NEVER match Men's items
    if (filterIsStrictlyWomen && prodIsStrictlyMen) return false;

    // If user is currently browsing category "men", disallow women's products
    if (currentCategory === "men" && prodIsStrictlyWomen) return false;
    // If user is currently browsing category "women", disallow men's products
    if (currentCategory === "women" && prodIsStrictlyMen) return false;

    // If filter does not specify gender (e.g. "Casual Shoes", "Sneakers")
    if (!filterIsStrictlyMen && !filterIsStrictlyWomen) {
      if (pNorm.endsWith(fNorm) || pSingular.endsWith(fSingular)) {
        return true;
      }
    }

    return false;
  };

  // Filter, search, price-range, and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Main category filter
    if (category !== "All") {
      result = result.filter((product) => {
        const prodCatSlug = toSlug(product.category);
        if (prodCatSlug === category) return true;

        // When navigating from MEN mega-menu to a Footwear subcategory
        if (category === "men" && prodCatSlug === "footwear") {
          const prodSubLower = (product.subcategory || "").toLowerCase();
          const prodNameLower = (product.name || "").toLowerCase();
          if (prodSubLower.includes("women") || prodNameLower.includes("women")) {
            return false;
          }
          const subLower = (subcategory || "").toLowerCase();
          const isFootwearSub =
            subLower.includes("flip") ||
            subLower.includes("shoe") ||
            subLower.includes("sneaker") ||
            subLower.includes("slipper") ||
            subLower.includes("sandal") ||
            subLower.includes("loafer");

          if (isFootwearSub) {
            return (
              prodNameLower.includes("men") ||
              prodNameLower.includes("unisex") ||
              !prodNameLower.includes("women")
            );
          }
        }

        // When navigating from WOMEN mega-menu to a Footwear subcategory
        if (category === "women" && prodCatSlug === "footwear") {
          const prodSubLower = (product.subcategory || "").toLowerCase();
          const prodNameLower = (product.name || "").toLowerCase();
          if (
            (prodSubLower.includes("men") && !prodSubLower.includes("women")) ||
            (prodNameLower.includes("men") && !prodNameLower.includes("women"))
          ) {
            return false;
          }
          const subLower = (subcategory || "").toLowerCase();
          const isWomenFootwearSub =
            subLower.includes("heel") ||
            subLower.includes("flat") ||
            subLower.includes("women") ||
            subLower.includes("flip");

          if (isWomenFootwearSub) {
            return (
              prodNameLower.includes("women") ||
              prodNameLower.includes("unisex") ||
              !prodNameLower.includes("men")
            );
          }
        }

        return false;
      });
    }

    // Subcategory filter from mega menu / sidebar
    if (subcategory) {
      result = result.filter((product) =>
        isSubcategoryMatch(product.subcategory, subcategory, category)
      );
    }

    // Price range filter
    if (priceRange === "under-1500") {
      result = result.filter((p) => Number(p.price) < 1500);
    } else if (priceRange === "1500-3000") {
      result = result.filter(
        (p) => Number(p.price) >= 1500 && Number(p.price) <= 3000
      );
    } else if (priceRange === "above-3000") {
      result = result.filter((p) => Number(p.price) > 3000);
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
          .some((value) => String(value).toLowerCase().includes(term))
      );
    }

    // Sorting
    if (sort === "price-low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "price-high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === "name") {
      result.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    }

    return result;
  }, [products, category, subcategory, search, sort, priceRange]);

  // Format Indian rupee prices
  const formatPrice = (price) =>
    Number(price).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSubcategory("");
    setExpandedCategory("");
    setSort("featured");
    setPriceRange("all");
    setCurrentPage(1);

    window.history.replaceState({}, "", window.location.pathname);
  };

  // Deduplicate products
  const uniqueFilteredProducts = useMemo(() => {
    return [
      ...new Map(
        filteredProducts.map((product) => [String(product.id), product])
      ).values(),
    ];
  }, [filteredProducts]);

  const totalProducts = uniqueFilteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalProducts);
  const paginatedProducts = useMemo(() => {
    return uniqueFilteredProducts.slice(startIndex, endIndex);
  }, [uniqueFilteredProducts, startIndex, endIndex]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === safeCurrentPage) return;
    setCurrentPage(newPage);
    const targetEl =
      document.querySelector(".shop-results-bar") ||
      document.querySelector(".shop-catalog") ||
      document.querySelector(".shop-controls-dock");
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

      {/* Edge-to-edge Hero Banner for All & Footwear without subcategory */}
      {(category === "All" || category.toLowerCase() === "footwear" || category.toLowerCase() === "shoes") &&
        !subcategory && (
          <section className="shop-full-banner" aria-label="Footwear & Collection Banner">
            <h1 className="sr-only">
              {category.toLowerCase() === "footwear" ? "Footwear Collection" : "Discover the Collection"} - PrimeNest
            </h1>
            <img
              src="/images/shop-banner.png"
              alt="PrimeNest / The Collection - Discover the Footwear Collection. Thoughtfully selected essentials for everyday living."
              className="shop-full-banner-img"
              loading="eager"
            />
          </section>
        )}

      <main className="shop-page">
        {/* =========================================================================
            1. LUXURY EDITORIAL SHOWCASE HEADER
           ========================================================================= */}
        <section className="shop-luxury-header">
          <div className="shop-header-ambient-orb" />

          <div className="shop-eyebrow-badge">
            <Sparkles size={12} className="shop-eyebrow-sparkle" />
            <span>
              PRIMENEST ATELIER • {category === "All" ? "ALL ARCHIVE" : categoryLabel.toUpperCase()}
              {subcategory ? ` / ${subcategory.toUpperCase()}` : ""}
            </span>
          </div>

          <h1>
            <span className="shop-title-accent">
              {subcategory || (category === "All" ? "The Master Collection" : categoryLabel)}
            </span>
          </h1>

          <div className="shop-luxury-divider">
            <span className="shop-luxury-divider-line" />
            <span className="shop-luxury-divider-diamond">◆</span>
            <span className="shop-luxury-divider-line" />
          </div>

          <p className="shop-luxury-intro">
            {subcategory
              ? `Explore our ${subcategory.toLowerCase()} collection, thoughtfully selected for everyday style.`
              : CATEGORY_EDITORIAL_INFO[category]?.tagline ||
                (category === "All"
                  ? "Explore our complete curated catalog of luxury apparel, niche perfumes, premium footwear & designer living."
                  : `Discover the exclusive ${categoryLabel} archive at PrimeNest.`)}
          </p>

          {/* Curated Luxury Feature Badges */}
          <div className="shop-header-feature-pills">
            {(
              CATEGORY_EDITORIAL_INFO[category]?.badges || [
                "✨ 100% Certified Original",
                "💎 Curated Luxury Grade",
                "⚡ Express Delivery Available",
              ]
            ).map((badge, idx) => (
              <span key={idx} className="shop-feature-pill">
                {badge}
              </span>
            ))}
          </div>
        </section>

        {/* =========================================================================
            2. FLOATING GLASS CONTROLS DOCK (Search, Price Pills, Sort & Grid Toggle)
           ========================================================================= */}
        <section className="shop-controls-dock" aria-label="Search and Filters">
          {/* Modern Search Input */}
          <div className="shop-search-modern">
            <Search size={16} className="shop-search-icon" />
            <input
              type="search"
              placeholder={`Search in ${category !== "All" ? categoryLabel : "all products"}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
            />
            {search && (
              <button
                type="button"
                className="shop-search-clear-btn"
                onClick={() => setSearch("")}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Price Filter Pills */}
          <div className="shop-price-filter-row">
            {[
              { label: "All Prices", value: "all" },
              { label: "Under ₹1,500", value: "under-1500" },
              { label: "₹1,500 – ₹3,000", value: "1500-3000" },
              { label: "₹3,000+", value: "above-3000" },
            ].map((p) => (
              <button
                key={p.value}
                type="button"
                className={`shop-price-pill ${priceRange === p.value ? "active" : ""}`}
                onClick={() => setPriceRange(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Controls Right Group (Sort + Grid toggles) */}
          <div className="shop-controls-right">
            <div className="shop-sort-modern">
              <SlidersHorizontal size={13} className="shop-sort-icon" />
              <label htmlFor="shop-sort-select">SORT:</label>
              <select
                id="shop-sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            {/* Grid Density View Switcher */}
            <div className="shop-grid-toggle" title="Switch layout density">
              <button
                type="button"
                className={`shop-grid-toggle-btn ${gridColumns === 4 ? "active" : ""}`}
                onClick={() => setGridColumns(4)}
                aria-label="4 column grid"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                className={`shop-grid-toggle-btn ${gridColumns === 3 ? "active" : ""}`}
                onClick={() => setGridColumns(3)}
                aria-label="3 column grid"
              >
                <Grid2X2 size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. PRODUCT CATALOG: SIDEBAR & PRODUCT GRID
           ========================================================================= */}
        <section className="shop-catalog">
          {/* Bespoke Luxury Category Sidebar */}
          <aside className="shop-sidebar">
            <div className="shop-sidebar-card">
              {/* Sidebar Header */}
              <div className="shop-sidebar-header">
                <div className="shop-sidebar-title-group">
                  <Layers size={14} className="shop-sidebar-title-icon" />
                  <h3 className="shop-sidebar-title">CATEGORIES</h3>
                </div>
                <span className="shop-sidebar-total-badge">{products.length} Total</span>
              </div>

              {/* Category List */}
              <div className="shop-category-list-modern">
                {/* All products button */}
                <button
                  type="button"
                  className={`shop-category-btn-modern ${category === "All" && !subcategory ? "active" : ""}`}
                  onClick={() => {
                    setCategory("All");
                    setSubcategory("");
                    setExpandedCategory("");
                    window.history.replaceState({}, "", window.location.pathname);
                  }}
                >
                  <div className="shop-category-left">
                    <div className="shop-category-icon-wrap">
                      <Sparkles size={14} />
                    </div>
                    <span className="shop-category-name">All Collections</span>
                  </div>
                  <div className="shop-category-right">
                    <span className="shop-category-count-pill">{products.length}</span>
                  </div>
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
                  const CategoryIcon = getCategoryIcon(item.slug);

                  return (
                    <div key={item.slug} className="shop-category-group-modern">
                      <button
                        type="button"
                        className={`shop-category-btn-modern ${isSelected ? "active" : ""}`}
                        onClick={() => {
                          if (category === item.slug) {
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
                        <div className="shop-category-left">
                          <div className="shop-category-icon-wrap">
                            <CategoryIcon size={14} />
                          </div>
                          <span className="shop-category-name">{item.name}</span>
                        </div>
                        <div className="shop-category-right">
                          <span className="shop-category-count-pill">{count}</span>
                          {subcategories.length > 0 && (
                            <ChevronDown
                              size={13}
                              className={`shop-category-chevron-modern ${isExpanded ? "rotated" : ""}`}
                            />
                          )}
                        </div>
                      </button>

                      {/* Nested Subcategories Accordion */}
                      {isExpanded && subcategories.length > 0 && (
                        <div
                          className="shop-subcategory-box"
                          role="region"
                          aria-label={`${item.name} subcategories`}
                        >
                          {/* "All [Category]" option */}
                          <button
                            type="button"
                            className={`shop-sub-item-modern ${isSelected && !subcategory ? "active" : ""}`}
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
                            <div className="shop-sub-left">
                              <span className="shop-sub-dot" />
                              <span className="shop-sub-title">All {item.name}</span>
                            </div>
                            <span className="shop-sub-badge">{count}</span>
                          </button>

                          {/* Subcategory items */}
                          {subcategories.map((sub) => {
                            const isSubActive =
                              isSelected &&
                              normalizeSubcategory(subcategory) ===
                                normalizeSubcategory(sub.name);

                            return (
                              <button
                                key={sub.name}
                                type="button"
                                className={`shop-sub-item-modern ${isSubActive ? "active" : ""}`}
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
                                <div className="shop-sub-left">
                                  <span className="shop-sub-dot" />
                                  <span className="shop-sub-title">{sub.name}</span>
                                </div>
                                <span className="shop-sub-badge">{sub.count}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Sidebar Assurance Guarantee Card */}
              <div className="shop-sidebar-guarantee-card">
                <div className="shop-guarantee-item">
                  <ShieldCheck size={14} className="shop-guarantee-icon" />
                  <span>100% Authentic Originals</span>
                </div>
                <div className="shop-guarantee-item">
                  <Truck size={14} className="shop-guarantee-icon" />
                  <span>Free Express Delivery</span>
                </div>
                <div className="shop-guarantee-item">
                  <RotateCcw size={14} className="shop-guarantee-icon" />
                  <span>7-Day Easy Returns</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Results Main Area */}
          <div className="shop-results">
            {/* Results Title Bar */}
            <div className="shop-results-bar">
              <div className="shop-results-title-group">
                <h2 className="shop-results-category-title">
                  {subcategory
                    ? `${categoryLabel} / ${subcategory}`
                    : category === "All"
                    ? "ALL ARCHIVE CREATIONS"
                    : `${categoryLabel.toUpperCase()} COLLECTION`}
                </h2>
                <span className="shop-results-badge-count">
                  {totalProducts} {totalProducts === 1 ? "Piece" : "Pieces"}
                </span>
                {totalProducts > itemsPerPage && (
                  <span style={{ fontSize: "11.5px", color: "#8c713f", fontWeight: 600 }}>
                    • Page {safeCurrentPage} of {totalPages} ({startIndex + 1}–{endIndex})
                  </span>
                )}
              </div>
            </div>

            {/* Active Filter Chips */}
            {(category !== "All" || subcategory || search || priceRange !== "all") && (
              <div className="shop-active-filters-modern">
                <span className="shop-active-filters-label">Filters:</span>
                {category !== "All" && (
                  <button
                    type="button"
                    className="shop-filter-chip-modern"
                    onClick={() => {
                      setCategory("All");
                      setSubcategory("");
                      setExpandedCategory("");
                      window.history.replaceState({}, "", window.location.pathname);
                    }}
                  >
                    <span>Category: {categoryLabel}</span>
                    <X size={12} />
                  </button>
                )}
                {subcategory && (
                  <button
                    type="button"
                    className="shop-filter-chip-modern"
                    onClick={() => {
                      setSubcategory("");
                      window.history.replaceState(
                        {},
                        "",
                        `${window.location.pathname}?category=${encodeURIComponent(category)}`
                      );
                    }}
                  >
                    <span>Sub: {subcategory}</span>
                    <X size={12} />
                  </button>
                )}
                {priceRange !== "all" && (
                  <button
                    type="button"
                    className="shop-filter-chip-modern"
                    onClick={() => setPriceRange("all")}
                  >
                    <span>
                      Price:{" "}
                      {priceRange === "under-1500"
                        ? "Under ₹1,500"
                        : priceRange === "1500-3000"
                        ? "₹1,500 – ₹3,000"
                        : "₹3,000+"}
                    </span>
                    <X size={12} />
                  </button>
                )}
                {search && (
                  <button
                    type="button"
                    className="shop-filter-chip-modern"
                    onClick={() => setSearch("")}
                  >
                    <span>Keyword: "{search}"</span>
                    <X size={12} />
                  </button>
                )}
                <button
                  type="button"
                  className="shop-clear-all-modern"
                  onClick={clearFilters}
                >
                  <RotateCcw size={11} />
                  <span>Reset All</span>
                </button>
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="shop-message">
                <div className="dark-spinner-ring" style={{ width: "32px", height: "32px", margin: "0 auto 16px" }} />
                <p>Curating luxury collection...</p>
              </div>
            ) : error ? (
              <div className="shop-message shop-error">
                <h2>Unable to load the collection</h2>
                <p>{error}</p>
                <button type="button" onClick={() => window.location.reload()}>
                  Try Again
                </button>
              </div>
            ) : totalProducts === 0 ? (
              /* Empty state */
              <div className="shop-message" style={{ padding: "60px 20px" }}>
                <Sparkles size={36} color="#c5a059" style={{ margin: "0 auto 16px" }} />
                <h2>No pieces found</h2>
                <p>Try modifying your search or resetting active filters.</p>
                <button type="button" onClick={clearFilters} style={{ marginTop: "16px" }}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                {/* Modern Luxury Product Cards Grid */}
                <div
                  className={`shop-product-grid-modern ${gridColumns === 3 ? "grid-3-col" : ""}`}
                >
                  {paginatedProducts.map((product) => {
                    const wishlisted = isWishlisted(product.id);
                    return (
                      <div key={product.id} className="shop-card-luxury">
                        {/* Image Wrap */}
                        <Link
                          href={`/product/${product.id}`}
                          className="shop-card-img-wrap"
                        >
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

                          {/* Top-Left Category Tag */}
                          <span className="shop-card-tag">
                            {product.subcategory || product.category || "Atelier"}
                          </span>

                          {/* Hover Quick View Action */}
                          <span className="shop-card-hover-action">
                            <span>View Piece</span>
                            <ArrowUpRight size={13} />
                          </span>
                        </Link>

                        {/* Top-Right Wishlist Heart Button */}
                        <button
                          type="button"
                          className={`shop-card-wish-btn ${wishlisted ? "wishlisted" : ""}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(product);
                            if (wishlisted) {
                              toast.info(`Removed ${product.name.slice(0, 20)}... from Wishlist`);
                            } else {
                              toast.success(`Saved to Wishlist! ❤️`, {
                                description: product.name.slice(0, 32),
                              });
                            }
                          }}
                          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                          aria-label="Wishlist toggle"
                        >
                          <Heart
                            size={15}
                            fill={wishlisted ? "#e11d48" : "none"}
                          />
                        </button>

                        {/* Card Content Info */}
                        <div className="shop-card-body">
                          <Link
                            href={`/product/${product.id}`}
                            className="shop-card-info-link"
                          >
                            <div className="shop-card-eyebrow-row">
                              <span className="shop-card-category-text">
                                {product.category || "Atelier"}
                              </span>
                              <div className="shop-card-rating">
                                <Star size={11} fill="#f59e0b" color="#f59e0b" className="shop-card-star" />
                                <span>4.8</span>
                              </div>
                            </div>

                            <h3 className="shop-card-title" title={product.name}>
                              {product.name}
                            </h3>

                            <div className="shop-card-price-row">
                              <span className="shop-card-price">
                                {formatPrice(product.price)}
                              </span>
                              <span className="shop-card-free-tag">Free Express</span>
                            </div>
                          </Link>

                          {/* Add to Bag Action Button */}
                          <button
                            type="button"
                            className={`shop-card-add-btn ${addedItemIds[product.id] ? "is-added" : ""}`}
                            onClick={(e) => handleQuickAddToCart(e, product)}
                            aria-label={`Add ${product.name} to bag`}
                          >
                            {addedItemIds[product.id] ? (
                              <>
                                <Check size={14} className="shop-card-btn-icon" />
                                <span>Added to Bag</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag size={14} className="shop-card-btn-icon" />
                                <span>Add to Bag</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Luxury Catalog Pagination Controls */}
                {totalPages > 1 && (
                  <div className="shop-pagination-wrap">
                    <div className="shop-pagination-info">
                      Showing <strong>{startIndex + 1}–{endIndex}</strong> of <strong>{totalProducts}</strong> luxury creations
                    </div>

                    <div className="shop-pagination-controls">
                      <button
                        type="button"
                        className="shop-pagination-btn"
                        disabled={safeCurrentPage === 1}
                        onClick={() => handlePageChange(safeCurrentPage - 1)}
                        aria-label="Previous Page"
                      >
                        <ChevronLeft size={15} />
                        <span>Previous</span>
                      </button>

                      <div className="shop-pagination-pages">
                        {getPageNumbers().map((page, idx) =>
                          page === "..." ? (
                            <span key={`ellipsis-${idx}`} className="shop-pagination-ellipsis">
                              …
                            </span>
                          ) : (
                            <button
                              key={page}
                              type="button"
                              className={`shop-pagination-number ${safeCurrentPage === page ? "active" : ""}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          )
                        )}
                      </div>

                      <button
                        type="button"
                        className="shop-pagination-btn"
                        disabled={safeCurrentPage === totalPages}
                        onClick={() => handlePageChange(safeCurrentPage + 1)}
                        aria-label="Next Page"
                      >
                        <span>Next</span>
                        <ChevronRight size={15} />
                      </button>
                    </div>

                    <div className="shop-pagination-per-page">
                      <span>Show:</span>
                      <select
                        className="shop-pagination-select"
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        aria-label="Products per page"
                      >
                        <option value={8}>8 per page</option>
                        <option value={12}>12 per page</option>
                        <option value={16}>16 per page</option>
                        <option value={24}>24 per page</option>
                        <option value={32}>32 per page</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "80vh", display: "grid", placeItems: "center", color: "#111" }}>
          Loading PrimeNest Collections...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}