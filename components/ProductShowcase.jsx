"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Check, Sparkles } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import "./ProductShowcase.css";

// Real fallback products from our database so the section renders instantly without flicker
const FALLBACK_PRODUCTS = [
  {
    id: 330,
    name: "Leadcat 2.0 Slip-On Blue Palermo Sliders",
    slug: "leadcat-2-0-slip-on-blue-palermo-sliders",
    price: 3499,
    category: "Footwear",
    category_slug: "footwear",
    subcategory: "Flip Flops",
    badge: "NEW",
    image: "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/a/0/a0b60e240483802_1.jpg?rnd=20200526195200",
    hover_image: "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/a/0/a0b60e240483802_2.jpg?rnd=20200526195200",
  },
  {
    id: 329,
    name: "Men Grey BMW MMS Leadcat 2.0 Sliders",
    slug: "men-grey-bmw-mms-leadcat-2-0-sliders",
    price: 3499,
    category: "Footwear",
    category_slug: "footwear",
    subcategory: "Flip Flops",
    badge: "BESTSELLER",
    image: "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/d/a/da613ba30923702_1.jpg?rnd=20200526195200",
    hover_image: "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/d/a/da613ba30923702_2.jpg?rnd=20200526195200",
  },
  {
    id: 328,
    name: "Green Amf1 Softridepro Leadpuff Men Slides",
    slug: "green-amf1-softridepro-leadpuff-men-slides",
    price: 3499,
    category: "Footwear",
    category_slug: "footwear",
    subcategory: "Flip Flops",
    badge: "NEW",
    image: "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/1/1/114a94940792202Green_1.jpg?rnd=20200526195200",
    hover_image: "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/1/1/114a94940792202Green_2.jpg?rnd=20200526195200",
  },
  {
    id: 325,
    name: "Women's Calm 2.0 Prm Slides",
    slug: "women-s-calm-2-0-prm-slides",
    price: 4599,
    category: "Footwear",
    category_slug: "footwear",
    subcategory: "Flip Flops",
    badge: "LIMITED",
    image: "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/7/f/7f44022IB0188600Red_1.jpg?rnd=20200526195200",
    hover_image: "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/7/f/7f44022IB0188600Red_2.jpg?rnd=20200526195200",
  },
];

const CATEGORY_TABS = [
  { label: "All New", slug: "all" },
  { label: "Footwear", slug: "footwear" },
  { label: "Men", slug: "men" },
  { label: "Women", slug: "women" },
  { label: "Perfume", slug: "perfume" },
  { label: "Accessories", slug: "accessories" },
];

export default function ProductShowcase() {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [addedId, setAddedId] = useState(null);

  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addToCart } = useCart();

  // Load live latest products from database
  useEffect(() => {
    let isMounted = true;

    async function loadLatestProducts() {
      try {
        setLoading(true);
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();

        if (isMounted && data.success && Array.isArray(data.products) && data.products.length > 0) {
          // Sort by newest added (highest id first)
          const sorted = [...data.products].sort((a, b) => Number(b.id) - Number(a.id));
          setProducts(sorted);
        }
      } catch (err) {
        console.error("Latest arrivals fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLatestProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter latest products by selected tab
  const displayedProducts = useMemo(() => {
    let list = products;
    if (activeTab !== "all") {
      list = list.filter((p) => {
        const catSlug = String(p.category_slug || p.category || "").toLowerCase().replace(/\s+/g, "-");
        return catSlug === activeTab;
      });
    }

    // Show strictly the 4 latest arrival products
    return list.slice(0, 4);
  }, [products, activeTab]);

  // Handle Quick Add to Bag
  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart(product, 1);
    setAddedId(product.id);

    setTimeout(() => {
      setAddedId(null);
    }, 2000);
  };

  // Handle Wishlist Toggle
  const handleWishlistToggle = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist(product);
    const wishState = isWishlisted(product.id);
    if (!wishState) {
      toast.success(`"${product.name}" added to your wishlist.`);
    } else {
      toast.info(`"${product.name}" removed from wishlist.`);
    }
  };

  // Helper for badges
  const getBadgeText = (index, product) => {
    if (product.badge) return product.badge;
    const badges = ["NEW", "BESTSELLER", "LIMITED", "TRENDING"];
    return badges[index % badges.length];
  };

  return (
    <section className="product-showcase" id="latest-arrivals">
      {/* Editorial Header */}
      <div className="product-showcase-header">
        <div>
          <p className="product-showcase-eyebrow">
            <Sparkles size={13} className="sparkle-icon" />
            NEW SEASON
          </p>

          <h2 className="product-showcase-title">
            Latest
            <em>Arrivals</em>
          </h2>
        </div>

        <div className="product-showcase-nav-wrap">
          <Link href="/shop" className="showcase-view-all">
            View all products
            <span className="arrow">↗</span>
          </Link>
        </div>
      </div>

      {/* Interactive Category Filter Pills */}
      <div className="showcase-tabs-bar" role="tablist">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.slug}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.slug}
            className={`showcase-tab-btn ${activeTab === tab.slug ? "active" : ""}`}
            onClick={() => setActiveTab(tab.slug)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product Showcase Grid */}
      <div className="product-showcase-grid">
        {displayedProducts.map((product, idx) => {
          const wishlisted = isWishlisted(product.id);
          const isAdded = addedId === product.id;
          const badgeText = getBadgeText(idx, product);
          const isGoldBadge = badgeText === "BESTSELLER";

          const categoryDisplay = [
            product.category || "Collection",
            product.subcategory || null,
          ]
            .filter(Boolean)
            .join(" / ");

          const formattedPrice = Number(product.price || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          });

          return (
            <article
              className="showcase-card"
              key={product.id || idx}
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              {/* Product Image & Dual-Angle Media Container */}
              <Link
                href={`/product/${product.id}`}
                className="showcase-img-wrap"
                aria-label={`View ${product.name}`}
              >
                {product.image ? (
                  <>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="showcase-img-primary"
                      loading="lazy"
                    />
                    {product.hover_image && (
                      <img
                        src={product.hover_image}
                        alt={`${product.name} alternate view`}
                        className="showcase-img-secondary"
                        loading="lazy"
                      />
                    )}
                  </>
                ) : (
                  <div className="showcase-img-placeholder">
                    <span>PrimeNest Luxury</span>
                  </div>
                )}

                {/* Shimmering Badge */}
                <span className={`showcase-badge ${isGoldBadge ? "badge-gold" : ""}`}>
                  {badgeText}
                </span>

                {/* Wishlist Button */}
                <button
                  type="button"
                  className={`showcase-wishlist-btn ${wishlisted ? "wishlisted" : ""}`}
                  aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  onClick={(e) => handleWishlistToggle(e, product)}
                >
                  <Heart
                    size={17}
                    fill={wishlisted ? "#e11d48" : "none"}
                    stroke={wishlisted ? "#e11d48" : "currentColor"}
                    strokeWidth={1.8}
                  />
                </button>

                {/* Slide-Up Add To Bag Button */}
                <button
                  type="button"
                  className={`showcase-cart-btn ${isAdded ? "added" : ""}`}
                  onClick={(e) => handleAddToCart(e, product)}
                  disabled={isAdded}
                >
                  {isAdded ? (
                    <>
                      <Check size={15} />
                      Added to Bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={14} />
                      Add to Bag +
                    </>
                  )}
                </button>
              </Link>

              {/* Product Info & Editorial Typography */}
              <div className="showcase-info">
                <div className="showcase-text-wrap">
                  <p className="showcase-category-sub">{categoryDisplay}</p>

                  <Link href={`/product/${product.id}`} className="showcase-title-link">
                    <h3 className="showcase-title">{product.name}</h3>
                  </Link>
                </div>

                <p className="showcase-price">{formattedPrice}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}