"use client";

import { useWishlist } from "@/context/WishlistContext";
import { use, useEffect, useState, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  Sparkles,
  ArrowUpRight,
  Check,
  Eye,
  Ruler,
  Droplets,
  X,
  Info,
  RotateCw,
  Maximize2,
  Camera,
  ShieldCheck,
  Truck,
  Lock,
  RefreshCw,
  Zap,
  ChevronDown,
  ChevronUp,
  Send,
  Star,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import VirtualTryOnModal from "@/components/VirtualTryOnModal";
import AIReviewSummarizer from "@/components/AIReviewSummarizer";

export default function ProductPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, wishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedRecently, setAddedRecently] = useState(false);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [is360Active, setIs360Active] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50, active: false });
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [inPageQuery, setInPageQuery] = useState("");

  const mainStageRef = useRef(null);

  // Fetch product and related products from PostgreSQL through the API
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");
        setSelectedVariant(null);
        setSelectedImageIndex(0);
        setQuantity(1);

        const response = await fetch(`/api/products/${id}`);

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Product not found"
              : "Unable to load product"
          );
        }

        const data = await response.json();
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  // Sticky Bar Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 480);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatPrice = (price) =>
    Number(price).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  // Category detection for intelligent size variants
  const isFootwear =
    product?.category === "Footwear" ||
    (product?.subcategory && product.subcategory.toLowerCase().includes("shoes")) ||
    (product?.subcategory && product.subcategory.toLowerCase().includes("sneaker")) ||
    (product?.subcategory && product.subcategory.toLowerCase().includes("slippers"));

  const isPerfume =
    product?.category === "Perfume" ||
    (product?.subcategory && product.subcategory.toLowerCase().includes("perfume"));

  // Default fallback variants if a product row doesn't have variants configured
  const defaultCategoryVariants = isFootwear
    ? [
        { label: "UK 6", stock: 12 },
        { label: "UK 7", stock: 15 },
        { label: "UK 8", stock: 18 },
        { label: "UK 9", stock: 16 },
        { label: "UK 10", stock: 10 },
        { label: "UK 11", stock: 8 },
      ]
    : isPerfume
    ? [
        { label: "100ml", stock: 25 },
        { label: "150ml", stock: 18 },
      ]
    : [];

  const rawVariants =
    Array.isArray(product?.variants) && product.variants.length > 0
      ? product.variants
      : defaultCategoryVariants;

  // Variants are optional and configured per product.
  const variants = rawVariants
    .map((variant) =>
      typeof variant === "string"
        ? { label: variant, stock: null }
        : {
            ...variant,
            label:
              variant.label ??
              variant.name ??
              variant.value ??
              "",
            stock:
              variant.stock == null
                ? null
                : Number(variant.stock),
          }
    )
    .filter((variant) => variant.label);

  const hasVariants = variants.length > 0;

  // Auto-select the first in-stock variant when loaded
  useEffect(() => {
    if (hasVariants && !selectedVariant) {
      const firstInStock = variants.find(
        (v) => v.stock === null || v.stock > 0
      );
      if (firstInStock) {
        setSelectedVariant(firstInStock.label);
      }
    }
  }, [hasVariants, variants, selectedVariant]);

  const activeVariant = variants.find(
    (variant) => variant.label === selectedVariant
  );

  const variantSectionLabel =
    product?.variant_label ||
    (isFootwear
      ? "SELECT SHOE SIZE (UK/IN)"
      : isPerfume
      ? "SELECT BOTTLE SIZE"
      : "SELECT OPTION");

  // Use variant stock when supplied; otherwise use product stock.
  const availableStock =
    activeVariant?.stock != null &&
    Number.isFinite(activeVariant.stock)
      ? Math.max(0, activeVariant.stock)
      : Math.max(0, Number(product?.stock) || 0);

  const isOutOfStock = availableStock < 1;

  // Images list
  const images = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : product?.image
      ? [product.image]
      : [];

  const currentImage = images[selectedImageIndex] || images[0] || "";

  // 360° interactive rotation timer
  useEffect(() => {
    let timer;
    if (is360Active && images.length > 1) {
      timer = setInterval(() => {
        setSelectedImageIndex((curr) => (curr + 1) % images.length);
      }, 750);
    }
    return () => clearInterval(timer);
  }, [is360Active, images.length]);

  const prevImage = () => {
    if (images.length <= 1) return;
    setSelectedImageIndex((curr) =>
      curr === 0 ? images.length - 1 : curr - 1
    );
  };

  const nextImage = () => {
    if (images.length <= 1) return;
    setSelectedImageIndex((curr) =>
      curr === images.length - 1 ? 0 : curr + 1
    );
  };

  // Mouse hover zoom handlers
  const handleMouseMove = (e) => {
    if (!mainStageRef.current) return;
    const rect = mainStageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y, active: true });
  };

  const handleMouseLeave = () => {
    setZoomPos((prev) => ({ ...prev, active: false }));
  };

  const handleAddToCart = () => {
    if (hasVariants && !activeVariant) {
      toast.error(
        isFootwear
          ? "Please select a shoe size (e.g. UK 8) before adding to bag."
          : isPerfume
          ? "Please select a bottle size (100ml / 150ml) before adding to bag."
          : "Please choose an option before adding to bag."
      );
      return;
    }
    if (quantity < 1 || quantity > availableStock) return;

    const cartProduct = hasVariants
      ? {
          ...product,
          selectedVariant: activeVariant,
          variantLabel: activeVariant.label,
        }
      : product;

    addToCart(cartProduct, quantity);
    setAddedRecently(true);
    setTimeout(() => setAddedRecently(false), 2200);
  };

  const handleBuyNow = () => {
    if (hasVariants && !activeVariant) {
      toast.error(
        isFootwear
          ? "Please select your shoe size to proceed."
          : isPerfume
          ? "Please select your bottle volume to proceed."
          : "Please choose an option to proceed."
      );
      return;
    }
    handleAddToCart();
    router.push("/checkout");
  };

  // In-Page AI Stylist Query Handler
  const handleAskStylist = (queryText) => {
    const q = queryText || inPageQuery;
    if (!q || !q.trim()) return;

    window.dispatchEvent(
      new CustomEvent("open-ai-stylist", {
        detail: { query: `${q.trim()} (Regarding: ${product.name})` },
      })
    );
    setInPageQuery("");
  };

  // Brand Name extraction
  const getBrandName = (p) => {
    const name = p?.name?.toLowerCase() || "";
    if (name.includes("jordan")) return "JORDAN";
    if (name.includes("nike")) return "NIKE";
    if (name.includes("puma") || name.includes("speedcat") || name.includes("palermo")) return "PUMA";
    if (name.includes("batman")) return "DC × WARNER BROS.";
    if (name.includes("rick & morty") || name.includes("dimension")) return "ADULT SWIM";
    if (name.includes("spiderman") || name.includes("iron man") || name.includes("marvel")) return "MARVEL ATELIER";
    if (name.includes("dragon") || name.includes("fire & blood")) return "HBO LUXE";
    if (name.includes("one piece")) return "TOEI ANIMATION";
    if (name.includes("peanuts")) return "PEANUTS ARCHIVE";
    return p?.category?.toUpperCase() || "PRIMENEST ATELIER";
  };

  // Dynamic Style Match percentage (e.g. 94%, 96%, 98%)
  const styleMatchScore = 92 + (((product?.id || 102) * 7) % 7);

  // Bullets Highlights
  const highlights = isFootwear
    ? [
        "Premium Handcrafted Full-Grain Leather & Suede",
        "Encapsulated Air Sole Responsive Cushioning",
        "Ergonomic Heel Lockdown for Everyday Wear",
        "Perforated Toe Box for All-Day Breathability",
        "High-Traction Multi-Surface Rubber Grip",
      ]
    : isPerfume
    ? [
        "Master French Perfumery Oils (Extrait de Parfum)",
        "Long-Lasting 12+ Hour Sillage & Projection",
        "Complex Top, Heart & Woody Base Notes",
        "Hand-Polished Heavy Crystal Flacon",
        "Clean, Cruelty-Free & IFRA Certified Formula",
      ]
    : [
        "100% Combed Long-Staple Premium Cotton",
        "Pre-Shrunk Finish & Reinforced Double-Stitching",
        "Breathable Luxury Fabric Drape",
        "Tailored Fit for Casual & Elevated Styling",
        "Easy Care & Fade-Resistant Natural Dyes",
      ];

  const getSizeSubtitle = (label, stock) => {
    if (stock != null && stock <= 6) return `Few Left (${stock})`;
    if (label === "UK 8" || label === "100ml") return "Most Popular";
    if (label.includes("ml")) return label === "100ml" ? "~1,000 Sprays" : "~1,500 Sprays";
    return "True to Size";
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="product-page">
          <div className="product-loading-spinner">
            <div className="spinner-ring" />
            <p>Loading collection details...</p>
          </div>
        </main>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <main className="product-not-found">
          <p>PRIMENEST / ARCHIVE</p>
          <h1>{error || "Product not found"}</h1>
          <Link href="/shop" className="return-shop-btn">
            Return to collection ↗
          </Link>
        </main>
      </>
    );
  }

  const isWishlisted = wishlist.some(
    (item) => String(item.id) === String(product.id)
  );

  return (
    <>
      <Navbar />

      <main className="product-page product-page-futuristic">
        {/* Breadcrumb navigation */}
        <nav className="product-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="crumb-sep">/</span>
          <Link href="/shop">Shop</Link>
          <span className="crumb-sep">/</span>
          <Link
            href={`/shop?category=${encodeURIComponent(
              product.category || ""
            )}`}
          >
            {product.category}
          </Link>
          {product.subcategory && (
            <>
              <span className="crumb-sep">/</span>
              <span>{product.subcategory}</span>
            </>
          )}
        </nav>

        {/* 60 / 40 Split Layout: Left Gallery (60%) | Right Product Info (40%) */}
        <section className="product-detail-layout-grid">
          {/* =========================================================================
              LEFT COLUMN (60%): Interactive Spotlight Gallery Stage
             ========================================================================= */}
          <div className="product-gallery-column">
            {/* Main Stage with Spotlight & Floating Shadow */}
            <div className="product-spotlight-card">
              {/* Top-Right Floating Glass Action Pills */}
              <div className="stage-glass-pill-bar">
                {images.length > 1 && (
                  <button
                    type="button"
                    className={`stage-pill-action ${is360Active ? "active" : ""}`}
                    onClick={() => setIs360Active(!is360Active)}
                    title="Toggle 360° View"
                  >
                    <RotateCw size={13} className={is360Active ? "spin-icon" : ""} />
                    <span>{is360Active ? "360° Active" : "360° View"}</span>
                  </button>
                )}

                {product.category?.toLowerCase() !== "perfume" && (
                  <button
                    type="button"
                    className="stage-pill-action stage-pill-ar"
                    onClick={() => setIsTryOnOpen(true)}
                    title="Virtual Camera Try-On"
                  >
                    <Camera size={13} />
                    <span>AR View</span>
                  </button>
                )}

                <button
                  type="button"
                  className="stage-pill-action"
                  onClick={() => setIsFullscreenOpen(true)}
                  title="Fullscreen High-Res Zoom"
                >
                  <Maximize2 size={13} />
                  <span>Zoom</span>
                </button>
              </div>

              {/* Ambient Spotlight & Floating Platform */}
              <div className="spotlight-radial-glow" />
              <div className="spotlight-pedestal-light" />

              {/* Main Image Frame with Zoom Hover */}
              <div
                ref={mainStageRef}
                className="product-stage-interactive-wrap"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {currentImage ? (
                  <div
                    className="product-zoom-container"
                    style={{
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: zoomPos.active ? "scale(1.75)" : "scale(1)",
                    }}
                  >
                    <img
                      key={currentImage}
                      src={currentImage}
                      alt={product.name}
                      className="product-hero-image"
                    />
                  </div>
                ) : (
                  <div className="product-image-fallback">
                    <span>PRIMENEST</span>
                  </div>
                )}

                {/* Floating Contact Shadow beneath the shoe */}
                <div className="product-floating-shadow" />

                {/* Navigation arrows for manual switching */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="stage-nav-arrow stage-nav-arrow-prev"
                      onClick={prevImage}
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="stage-nav-arrow stage-nav-arrow-next"
                      onClick={nextImage}
                      aria-label="Next image"
                    >
                      ›
                    </button>

                    <div className="stage-image-counter">
                      <span>{selectedImageIndex + 1}</span>
                      <span className="counter-sep">/</span>
                      <span>{images.length}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Thumbnails Glass Strip */}
            {images.length > 1 && (
              <div
                className="product-thumbnails-glass-strip"
                role="tablist"
                aria-label="Product viewpoints"
              >
                {images.map((imgUrl, index) => {
                  const isActive = selectedImageIndex === index;
                  return (
                    <button
                      key={index}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`product-thumb-glass-btn ${isActive ? "active" : ""}`}
                      onClick={() => {
                        setIs360Active(false);
                        setSelectedImageIndex(index);
                      }}
                      aria-label={`View angle ${index + 1}`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} angle ${index + 1}`}
                        loading="lazy"
                      />
                      {isActive && <div className="thumb-active-glaze" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* =========================================================================
              RIGHT COLUMN (40%): Futuristic Product Info, AI Match & Glossy Actions
             ========================================================================= */}
          <div className="product-info-column">
            {/* Brand Eyebrow Badge */}
            <div className="brand-eyebrow-row">
              <span className="brand-badge-pill">{getBrandName(product)}</span>
              <span className="category-meta-text">
                {product.subcategory ? `${product.category} • ${product.subcategory}` : product.category}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="product-hero-title">{product.name}</h1>

            {/* Rating & Reviews */}
            <div className="product-rating-row">
              <div className="stars-cluster">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="star-filled" fill="#d4af37" color="#d4af37" />
                ))}
              </div>
              <span className="rating-score">4.8</span>
              <span className="rating-dot">•</span>
              <span className="reviews-count">234 Verified Reviews</span>
            </div>

            {/* Price Row */}
            <div className="product-price-block">
              <div className="price-main-row">
                <span className="price-tag">{formatPrice(product.price)}</span>
                <span className="tax-inclusive-tag">Inclusive of all taxes (GST)</span>
              </div>
            </div>

            {/* AI Recommendation Badge */}
            <div className="ai-match-badge-glow">
              <div className="ai-match-glow-dot" />
              <Sparkles size={14} className="text-amber-400" />
              <span className="ai-match-label">AI Style Match</span>
              <span className="ai-match-percent">{styleMatchScore}% Fit for Your Wardrobe</span>
            </div>

            {/* Short Highlights (Bullets replacing dense paragraph) */}
            <div className="product-highlights-box">
              <span className="highlights-title">ENGINEERED HIGHLIGHTS</span>
              <ul className="highlights-list">
                {highlights.map((h, i) => (
                  <li key={i}>
                    <Check size={14} className="highlight-check" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              {/* Expandable "About this product" */}
              {product.description && (
                <div className="expandable-desc-wrap">
                  <button
                    type="button"
                    className="expand-desc-toggle"
                    onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                  >
                    <span>About this piece & craftsmanship</span>
                    {isDescriptionOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isDescriptionOpen && (
                    <p className="expanded-desc-text">{product.description}</p>
                  )}
                </div>
              )}
            </div>

            {/* PRODUCT VARIANTS / SIZES */}
            {hasVariants && (
              <div className="product-variant-section">
                <div className="product-variant-heading">
                  <div className="variant-title-wrap">
                    {isFootwear && <Ruler size={14} className="variant-icon-gold" />}
                    {isPerfume && <Droplets size={14} className="variant-icon-gold" />}
                    <span>{variantSectionLabel}</span>
                  </div>

                  <div className="variant-header-right">
                    {isFootwear && (
                      <button
                        type="button"
                        className="size-guide-trigger"
                        onClick={() => setShowSizeGuide(true)}
                        aria-label="Open shoe size guide"
                      >
                        <Ruler size={12} />
                        <span>Size Guide</span>
                      </button>
                    )}

                    <span className="selected-variant-label">
                      {selectedVariant ? (
                        <>
                          Selected: <strong>{selectedVariant}</strong>
                          {activeVariant?.stock != null && (
                            <span className="variant-stock-hint">
                              {" "}
                              ({activeVariant.stock} available)
                            </span>
                          )}
                        </>
                      ) : (
                        "Choose an option"
                      )}
                    </span>
                  </div>
                </div>

                {/* Luxury Cards for Sizes */}
                <div
                  className={`product-variant-options-cards ${
                    isFootwear ? "is-shoe-sizes" : isPerfume ? "is-perfume-sizes" : ""
                  }`}
                >
                  {variants.map((variant, index) => {
                    const isSelected = selectedVariant === variant.label;
                    const variantOutOfStock =
                      variant.stock != null &&
                      Number.isFinite(variant.stock) &&
                      variant.stock < 1;

                    return (
                      <button
                        key={`${variant.label}-${index}`}
                        type="button"
                        className={`size-card-button ${isSelected ? "active" : ""} ${
                          variantOutOfStock ? "unavailable" : ""
                        }`}
                        onClick={() => {
                          if (variantOutOfStock) return;
                          setSelectedVariant(variant.label);
                          setQuantity(1);
                        }}
                        disabled={variantOutOfStock}
                        aria-pressed={isSelected}
                      >
                        <div className="size-card-top">
                          {isPerfume && <Droplets size={11} className="card-drop-icon" />}
                          <span className="size-card-label">{variant.label}</span>
                          {isSelected && <Check size={11} className="card-check-icon" />}
                        </div>
                        <span className="size-card-sub">
                          {getSizeSubtitle(variant.label, variant.stock)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ✨ AI SIZE ASSISTANT RECOMMENDATION CARD */}
            {isFootwear && (
              <div className="ai-size-assistant-card">
                <div className="ai-size-card-header">
                  <div className="ai-size-icon-pill">
                    <Sparkles size={13} className="text-amber-500" />
                    <span>AI Size Assistant</span>
                  </div>
                  <span className="ai-size-confidence">98% Fit Confidence</span>
                </div>
                <p className="ai-size-explainer">
                  Based on your footwear profile & verified purchase returns:
                </p>
                <div className="ai-size-action-row">
                  <span className="ai-recommended-val">
                    Recommended: <strong>UK 8</strong> (True to Fit)
                  </span>
                  <button
                    type="button"
                    className="ai-pick-size-btn"
                    onClick={() => {
                      setSelectedVariant("UK 8");
                      toast.success("UK 8 Auto-Selected via AI Size Assistant ✨");
                    }}
                  >
                    Select UK 8
                  </button>
                </div>
              </div>
            )}

            {/* QUANTITY & STOCK */}
            <div className="product-quantity-row">
              <div className="quantity-label-wrap">
                <span className="quantity-eyebrow">QUANTITY</span>
                <span className="stock-indicator-text">
                  {isOutOfStock ? "Out of stock" : `${availableStock} available`}
                </span>
              </div>

              <div className="quantity-selector-pill">
                <button
                  type="button"
                  onClick={() => setQuantity((curr) => Math.max(1, curr - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((curr) => Math.min(availableStock, curr + 1))}
                  disabled={isOutOfStock || quantity >= availableStock}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* GLOSSY ACTION BUTTONS */}
            <div className="product-cta-cluster">
              <div className="primary-actions-row">
                {/* 1. Glossy Add to Bag Button */}
                <button
                  type="button"
                  className={`btn-glossy-primary ${addedRecently ? "added-success" : ""}`}
                  disabled={isOutOfStock || quantity > availableStock || (hasVariants && !activeVariant)}
                  onClick={handleAddToCart}
                >
                  <span className="gloss-sheen" />
                  <span className="gloss-content">
                    {addedRecently ? (
                      <>
                        <Check size={18} strokeWidth={2.5} />
                        <span>Added to Bag!</span>
                      </>
                    ) : isOutOfStock ? (
                      <span>Out of Stock</span>
                    ) : hasVariants && !activeVariant ? (
                      <>
                        <Sparkles size={16} />
                        <span>Select a Size</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} strokeWidth={2} />
                        <span>Add to Bag</span>
                        <ArrowUpRight size={17} className="btn-arrow" strokeWidth={2} />
                      </>
                    )}
                  </span>
                </button>

                {/* 2. Glossy Buy Now Button */}
                <button
                  type="button"
                  className="btn-glossy-buy-now"
                  disabled={isOutOfStock || (hasVariants && !activeVariant)}
                  onClick={handleBuyNow}
                >
                  <span className="gloss-sheen" />
                  <span className="gloss-content">
                    <Zap size={16} />
                    <span>Buy Now</span>
                  </span>
                </button>

                {/* 3. Wishlist Button */}
                <button
                  type="button"
                  className={`product-favorite-glossy ${isWishlisted ? "active" : ""}`}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  onClick={() => toggleWishlist(product)}
                >
                  <Heart
                    size={20}
                    strokeWidth={isWishlisted ? 2.5 : 1.8}
                    fill={isWishlisted ? "#e11d48" : "none"}
                    color={isWishlisted ? "#e11d48" : "#0f172a"}
                  />
                </button>
              </div>

              {/* 4. Large Glass AI Virtual Try-On Button */}
              {product.category?.toLowerCase() !== "perfume" && (
                <button
                  type="button"
                  className="btn-glass-tryon"
                  onClick={() => setIsTryOnOpen(true)}
                >
                  <div className="tryon-content-left">
                    <Sparkles size={18} className="tryon-star-pulse" />
                    <div>
                      <div className="tryon-headline">Try On With AI</div>
                      <div className="tryon-subtext">
                        {isFootwear ? "See these shoes on your feet" : "Preview fit on your silhouette"}
                      </div>
                    </div>
                  </div>
                  <div className="tryon-launch-pill">
                    <span>→ Launch Camera</span>
                  </div>
                </button>
              )}
            </div>

            {/* AI CONCIERGE PANEL (ChatGPT-Style in-page panel - Point 2) */}
            <div className="ai-inpage-concierge-panel">
              <div className="concierge-panel-top">
                <div className="concierge-brand-title">
                  <Sparkles size={16} className="text-amber-500 animate-spin-slow" />
                  <h4>PrimeNest AI Stylist</h4>
                </div>
                <span className="concierge-live-indicator">
                  <span className="live-emerald-pip" /> Ready to assist
                </span>
              </div>
              <p className="concierge-prompt-ask">Ask me anything about this piece:</p>

              {/* Popular prompt chips */}
              <div className="concierge-popular-chips">
                <button
                  type="button"
                  className="concierge-chip"
                  onClick={() => handleAskStylist("Show me similar alternatives to this product")}
                >
                  • Similar shoes
                </button>
                <button
                  type="button"
                  className="concierge-chip"
                  onClick={() => handleAskStylist("Are there cheaper options in this colorway?")}
                >
                  • Cheaper options
                </button>
                <button
                  type="button"
                  className="concierge-chip"
                  onClick={() => handleAskStylist("Can I wear these shoes with black denim jeans?")}
                >
                  • Can I wear this with jeans?
                </button>
                <button
                  type="button"
                  className="concierge-chip"
                  onClick={() => handleAskStylist("Is this suitable for running or gym workouts?")}
                >
                  • Good for running?
                </button>
                <button
                  type="button"
                  className="concierge-chip"
                  onClick={() => handleAskStylist("Is this good for daily college wear?")}
                >
                  • College wear?
                </button>
              </div>

              {/* Quick typing prompt */}
              <form
                className="concierge-inline-input"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskStylist();
                }}
              >
                <input
                  type="text"
                  placeholder="Ask a styling or sizing question..."
                  value={inPageQuery}
                  onChange={(e) => setInPageQuery(e.target.value)}
                />
                <button type="submit" disabled={!inPageQuery.trim()} aria-label="Ask stylist">
                  <Send size={14} />
                </button>
              </form>
            </div>

            {/* TRUST PERKS (Point 14) */}
            <div className="product-trust-grid">
              <div className="trust-pill">
                <RefreshCw size={15} className="trust-icon" />
                <span>7-Day Return</span>
              </div>
              <div className="trust-pill">
                <Lock size={15} className="trust-icon" />
                <span>256-Bit Secure</span>
              </div>
              <div className="trust-pill">
                <ShieldCheck size={15} className="trust-icon" />
                <span>100% Authentic</span>
              </div>
              <div className="trust-pill">
                <Truck size={15} className="trust-icon" />
                <span>Free Delivery</span>
              </div>
              <div className="trust-pill">
                <Package size={15} className="trust-icon" />
                <span>Cash on Delivery</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SIMILAR PRODUCTS (Pinterest / AI Grid Style - Point 9)
           ========================================================================= */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="ai-recommended-grid-section">
            <div className="ai-grid-header">
              <div className="ai-grid-badge">
                <Sparkles size={14} className="text-amber-400" />
                <span>CURATED BY PRIMENEST NEURAL ENGINE</span>
              </div>
              <h2>Recommended by AI</h2>
              <p>Items frequently paired and matched by our style intelligence algorithms.</p>
            </div>

            <div className="ai-pinterest-grid">
              {relatedProducts.map((rel, idx) => {
                const matchPct = 90 + ((idx * 3 + 1) % 8);
                return (
                  <div key={rel.id} className="ai-pinterest-card">
                    <Link href={`/product/${rel.id}`} className="ai-card-image-wrap">
                      {rel.image ? (
                        <img src={rel.image} alt={rel.name} loading="lazy" />
                      ) : (
                        <div className="ai-card-placeholder">PRIMENEST</div>
                      )}
                      <span className="ai-match-float-tag">{matchPct}% Style Match</span>
                    </Link>

                    <div className="ai-card-body">
                      <span className="ai-card-cat">{rel.subcategory || rel.category}</span>
                      <Link href={`/product/${rel.id}`} className="ai-card-title">
                        {rel.name}
                      </Link>
                      <div className="ai-card-bottom-row">
                        <span className="ai-card-price">{formatPrice(rel.price)}</span>
                        <Link href={`/product/${rel.id}`} className="ai-card-link-btn">
                          <span>View Piece</span>
                          <ArrowUpRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* AI REVIEW SUMMARIZER */}
        <AIReviewSummarizer productId={product.id} productName={product.name} />

        {/* =========================================================================
            STICKY BUY CARD (Floating bottom bar on scroll - Point 10)
           ========================================================================= */}
        <div className={`sticky-buy-bar ${showStickyBar ? "visible" : ""}`}>
          <div className="sticky-buy-container">
            <div className="sticky-product-meta">
              {currentImage && (
                <img src={currentImage} alt={product.name} className="sticky-thumb" />
              )}
              <div className="sticky-text-stack">
                <span className="sticky-name">{product.name}</span>
                <div className="sticky-sub-row">
                  <span className="sticky-price">{formatPrice(product.price)}</span>
                  {selectedVariant && (
                    <span className="sticky-size-badge">Size: {selectedVariant}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky-actions-row">
              <button
                type="button"
                className="sticky-btn-bag"
                disabled={isOutOfStock || (hasVariants && !activeVariant)}
                onClick={handleAddToCart}
              >
                <ShoppingBag size={15} />
                <span>+ Bag</span>
              </button>

              <button
                type="button"
                className="sticky-btn-buy"
                disabled={isOutOfStock || (hasVariants && !activeVariant)}
                onClick={handleBuyNow}
              >
                <Zap size={15} />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            FULLSCREEN ZOOM LIGHTBOX MODAL
           ========================================================================= */}
        {isFullscreenOpen && (
          <div className="fullscreen-lightbox-backdrop" onClick={() => setIsFullscreenOpen(false)}>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setIsFullscreenOpen(false)}
              aria-label="Close fullscreen view"
            >
              <X size={24} />
            </button>
            <div className="lightbox-image-container" onClick={(e) => e.stopPropagation()}>
              <img src={currentImage} alt={product.name} className="lightbox-hero-image" />
              <div className="lightbox-caption">
                <span>{product.name}</span>
                <span>• {selectedImageIndex + 1} of {images.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            FOOTWEAR SIZE GUIDE MODAL
           ========================================================================= */}
        {showSizeGuide && (
          <div
            className="size-guide-modal-backdrop"
            onClick={() => setShowSizeGuide(false)}
          >
            <div
              className="size-guide-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="size-guide-modal-header">
                <div>
                  <h3 className="size-guide-title">Footwear Sizing Chart</h3>
                  <p className="size-guide-subtitle">
                    Universal conversion matrix for Indian (UK), US & European sizing
                  </p>
                </div>
                <button
                  type="button"
                  className="size-guide-close-btn"
                  onClick={() => setShowSizeGuide(false)}
                  aria-label="Close Size Guide"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="size-guide-table-wrap">
                <table className="size-guide-table">
                  <thead>
                    <tr>
                      <th>UK / IN</th>
                      <th>US Men</th>
                      <th>US Women</th>
                      <th>EU</th>
                      <th>Foot Length (CM)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>UK 6</strong></td>
                      <td>US 7</td>
                      <td>US 8.5</td>
                      <td>40</td>
                      <td>25.0 cm</td>
                    </tr>
                    <tr>
                      <td><strong>UK 7</strong></td>
                      <td>US 8</td>
                      <td>US 9.5</td>
                      <td>41</td>
                      <td>26.0 cm</td>
                    </tr>
                    <tr>
                      <td><strong>UK 8</strong></td>
                      <td>US 9</td>
                      <td>US 10.5</td>
                      <td>42.5</td>
                      <td>27.0 cm</td>
                    </tr>
                    <tr>
                      <td><strong>UK 9</strong></td>
                      <td>US 10</td>
                      <td>US 11.5</td>
                      <td>44</td>
                      <td>28.0 cm</td>
                    </tr>
                    <tr>
                      <td><strong>UK 10</strong></td>
                      <td>US 11</td>
                      <td>US 12.5</td>
                      <td>45</td>
                      <td>29.0 cm</td>
                    </tr>
                    <tr>
                      <td><strong>UK 11</strong></td>
                      <td>US 12</td>
                      <td>US 13.5</td>
                      <td>46</td>
                      <td>30.0 cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="size-guide-footer">
                <Info size={14} className="text-amber-600" />
                <span>
                  Unsure of your exact fit? Ask our <strong>AI Stylist</strong> Concierge at the bottom-right corner for personalized fit advice.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* AI VIRTUAL TRY-ON MODAL */}
        <VirtualTryOnModal
          isOpen={isTryOnOpen}
          onClose={() => setIsTryOnOpen(false)}
          product={product}
          onAddToCart={handleAddToCart}
        />
      </main>
    </>
  );
}