"use client";

import { useWishlist } from "@/context/WishlistContext";
import { use, useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
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
} from "lucide-react";
import { toast } from "sonner";
import VirtualTryOnModal from "@/components/VirtualTryOnModal";
import AIReviewSummarizer from "@/components/AIReviewSummarizer";

export default function ProductPage({ params }) {
  const { id } = use(params);
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

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : [];

  const currentImage = images[selectedImageIndex] || images[0] || "";

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

  return (
    <>
      <Navbar />

      <main className="product-page">
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

        {/* Product Details Section */}
        <section className="product-detail">
          {/* Gallery: Thumbnails + Main Stage */}
          <div className="product-gallery">
            {/* Thumbnails (multi-angle views) */}
            {images.length > 1 && (
              <div
                className="product-thumbnails"
                role="tablist"
                aria-label="Product thumbnails"
              >
                {images.map((imgUrl, index) => {
                  const isActive = selectedImageIndex === index;
                  return (
                    <button
                      key={index}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`product-thumbnail-btn ${
                        isActive ? "active" : ""
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={`View angle ${index + 1}`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} perspective ${index + 1}`}
                        loading="lazy"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main Image Frame */}
            <div className="product-main-stage">
              <div className="product-stage-inner">
                {currentImage ? (
                  <img
                    key={currentImage}
                    src={currentImage}
                    alt={product.name}
                    className="product-stage-image"
                  />
                ) : (
                  <div className="product-image-fallback">
                    <span>PRIMENEST</span>
                  </div>
                )}

                {/* Navigation arrows for fast browsing */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="stage-nav-btn stage-nav-prev"
                      onClick={prevImage}
                      aria-label="Previous view"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="stage-nav-btn stage-nav-next"
                      onClick={nextImage}
                      aria-label="Next view"
                    >
                      ›
                    </button>

                    <div className="stage-counter">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Product Purchase & Information */}
          <div className="product-detail-info">
            <p className="product-detail-category">
              {product.subcategory
                ? `${product.category} / ${product.subcategory}`
                : product.category}
            </p>

            <h1>{product.name}</h1>

            <p className="product-detail-price">
              {formatPrice(product.price)}
            </p>

            <div className="product-detail-line" />

            <p className="product-detail-description">
              {product.description}
            </p>

            {/* OPTIONAL PRODUCT VARIANTS */}
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

                <div
                  className={`product-variant-options ${
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
                        className={`product-variant-button ${
                          isSelected ? "active" : ""
                        } ${
                          variantOutOfStock ? "unavailable" : ""
                        } ${isPerfume ? "perfume-pill" : ""}`}
                        onClick={() => {
                          if (variantOutOfStock) return;
                          setSelectedVariant(variant.label);
                          setQuantity(1);
                        }}
                        disabled={variantOutOfStock}
                        aria-pressed={isSelected}
                        title={
                          variantOutOfStock
                            ? "Out of stock"
                            : `${variant.label} (${variant.stock ?? availableStock} available)`
                        }
                      >
                        {isPerfume && <Droplets size={12} className="btn-drop-icon" />}
                        <span>{variant.label}</span>
                        {isSelected && <Check size={11} className="active-check-icon" />}
                      </button>
                    );
                  })}
                </div>

                {isPerfume && (
                  <p className="perfume-size-tip">
                    ✦ <strong>100ml</strong> offers ~1,000 sprays (4–6 months). <strong>150ml</strong> offers ~1,500 sprays with best value.
                  </p>
                )}
                {isFootwear && (
                  <p className="shoe-size-tip">
                    ✦ Standard UK sizing. Fits true to size. If you are between sizes, we recommend ordering half size up.
                  </p>
                )}
              </div>
            )}

            {/* QUANTITY */}
            <div className="product-quantity">
              <span>QUANTITY</span>

              <div className="quantity-selector">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(availableStock, current + 1)
                    )
                  }
                  disabled={
                    isOutOfStock ||
                    quantity >= availableStock
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* STOCK */}
            <p className="product-stock">
              {isOutOfStock
                ? "Out of stock"
                : `${availableStock} available`}
            </p>

            {/* ACTIONS */}
            <div className="product-actions">
              <button
                type="button"
                className={`add-to-bag ${addedRecently ? "added-success" : ""}`}
                disabled={
                  isOutOfStock ||
                  quantity > availableStock ||
                  (hasVariants && !activeVariant)
                }
                onClick={handleAddToCart}
              >
                <span className="btn-shine" />
                <span className="btn-content">
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
                      <span>Select an Option</span>
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

              <button
                type="button"
                className={`product-favorite ${isWishlisted ? "active" : ""}`}
                aria-label={
                  isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                onClick={() => toggleWishlist(product)}
              >
                <Heart
                  size={22}
                  strokeWidth={isWishlisted ? 2.5 : 1.8}
                  fill={isWishlisted ? "#e11d48" : "none"}
                  color={isWishlisted ? "#e11d48" : "#1a1a1a"}
                />
              </button>
            </div>

            {/* AI VIRTUAL TRY-ON BUTTON (Available for Footwear & Apparel) */}
            {product.category?.toLowerCase() !== "perfume" && (
              <button
                type="button"
                className="product-tryon-btn"
                onClick={() => setIsTryOnOpen(true)}
              >
                <Sparkles size={16} className="tryon-sparkle" />
                <span>
                  {product.category?.toLowerCase() === "footwear"
                    ? "Virtual On-Foot Try-On"
                    : "Virtual Try-On"}
                </span>
                <span className="tryon-ai-pill">✦ AI Neural Fit</span>
              </button>
            )}

            {/* PERKS / TRUST PILLS */}
            <div className="product-perks">
              <div className="product-perk-item">
                <span className="perk-icon">✦</span>
                <span>Complimentary express delivery on orders over ₹1,999</span>
              </div>
              <div className="product-perk-item">
                <span className="perk-icon">⟲</span>
                <span>30-day effortless returns & exchanges</span>
              </div>
              <div className="product-perk-item">
                <span className="perk-icon">✓</span>
                <span>100% Authentic verified luxury craftsmanship</span>
              </div>
            </div>
          </div>
        </section>

        {/* RELATED PRODUCTS / YOU MAY ALSO LIKE */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="product-related-section">
            <div className="product-related-header">
              <span className="product-related-eyebrow">
                CURATED RECOMMENDATIONS
              </span>
              <h2>You May Also Like</h2>
              <p>
                Thoughtfully selected pieces to complement your personal wardrobe.
              </p>
            </div>

            <div className="product-related-grid">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/product/${rel.id}`}
                  className="related-product-card"
                >
                  <div className="related-product-image">
                    {rel.image ? (
                      <img
                        src={rel.image}
                        alt={rel.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="related-product-placeholder">
                        PRIMENEST
                      </div>
                    )}
                    <span className="related-product-view">
                      VIEW PRODUCT ↗
                    </span>
                  </div>

                  <div className="related-product-info">
                    <p className="related-product-category">
                      {rel.subcategory || rel.category}
                    </p>
                    <h3>{rel.name}</h3>
                    <p className="related-product-price">
                      {formatPrice(rel.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* AI REVIEW SUMMARIZER */}
        <AIReviewSummarizer productId={product.id} productName={product.name} />

        {/* AI VIRTUAL TRY-ON MODAL */}
        <VirtualTryOnModal
          isOpen={isTryOnOpen}
          onClose={() => setIsTryOnOpen(false)}
          product={product}
          onAddToCart={handleAddToCart}
        />

        {/* FOOTWEAR SIZE GUIDE MODAL */}
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
                    Universal conversion guide for Indian (UK), US & European sizing
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
      </main>
    </>
  );
}