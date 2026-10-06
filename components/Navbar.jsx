"use client";

import { useState, useEffect, useRef } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingBag,
  UserRound,
  X,
  LogOut,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./NavbarLuxury.css";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [activeMenu, setActiveMenu] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [authUser, setAuthUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuLeft, setMenuLeft] = useState(null);
  const navItemRefs = useRef({});

  const closeTimerRef = useRef(null);

  // Recalculate menu left alignment so the dropdown appears directly under the hovered button
  useEffect(() => {
    if (!activeMenu || !navItemRefs.current[activeMenu]) return;
    const updatePosition = () => {
      const el = navItemRefs.current[activeMenu];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const panelWidth = 720;
      const padding = 20;
      const maxLeft = Math.max(padding, window.innerWidth - panelWidth - padding);
      // Align directly with the active category button's left boundary
      const targetLeft = Math.max(padding, Math.min(rect.left - 16, maxLeft));
      setMenuLeft(targetLeft);
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [activeMenu]);

  // Debounced menu opening & closing to eliminate hover gap disappearances
  const handleOpenMenu = (cat) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setActiveMenu(cat);
    setSearchResultsOpen(false);
  };

  const handleCloseMenu = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setActiveMenu(null);
      setProfileOpen(false);
    }, 220); // 220ms grace window ensures smooth transition without premature disappearance
  };

  const handleKeepMenuOpen = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleCategoryHover = (cat) => {
    if (activeMenu !== cat) {
      setSlideIndex(0);
    }
    if (navItemRefs.current[cat]) {
      const rect = navItemRefs.current[cat].getBoundingClientRect();
      const panelWidth = 720;
      const padding = 20;
      const maxLeft = Math.max(padding, window.innerWidth - panelWidth - padding);
      const targetLeft = Math.max(padding, Math.min(rect.left - 16, maxLeft));
      setMenuLeft(targetLeft);
    }
    handleOpenMenu(cat);
  };

  // Scroll detection for navbar blur depth
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Authentication status
  useEffect(() => {
    let active = true;
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          if (active && data.success && data.user) {
            setAuthUser(data.user);
          }
        } else {
          if (active) setAuthUser(null);
        }
      } catch {
        if (active) setAuthUser(null);
      }
    }
    checkAuth();
    return () => {
      active = false;
    };
  }, [pathname]);

  // Luxury Navigation categories for the 5 catalog collections with 3-image sliders
  const categories = {
    MEN: {
      slides: [
        {
          tag: "AUTUMN / WINTER '26",
          title: "The Modern Sartorialist",
          subtitle: "Handcrafted blazers, relaxed tailoring & premium streetwear.",
          image: "/images/slider/slide-opt-1.webp",
          link: "/shop?category=Men",
          cta: "Discover Men",
        },
        {
          tag: "URBAN ESSENTIALS",
          title: "Relaxed Graphic Tees",
          subtitle: "Heavyweight 240 GSM organic cotton with refined prints.",
          image: "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/3/d/3dd0cc51344928012_1.jpg?rnd=20200526195200",
          link: "/shop?category=Men&subcategory=T-Shirts",
          cta: "Shop Topwear",
        },
        {
          tag: "CLEAN MINIMALISM",
          title: "Luxury Basics Edit",
          subtitle: "Signature understated essentials crafted for daily distinction.",
          image: "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/b/8/b86c4e8685816001_1.jpg?rnd=20200526195200",
          link: "/shop?category=Men",
          cta: "View Essentials",
        },
      ],
      columns: [
        {
          heading: "Topwear",
          items: [
            "T-Shirts",
            "Casual Shirts",
            "Sweatshirts",
            "Jackets",
          ],
        },
        {
          heading: "Bottomwear",
          items: [
            "Jeans",
            "Casual Trousers",
            "Track Pants & Joggers",
          ],
        },
      ],
    },

    WOMEN: {
      slides: [
        {
          tag: "HAUTE ATELIER",
          title: "Grace & Modern Form",
          subtitle: "Ethereal silks, artisanal silhouettes & elevated eveningwear.",
          image: "/images/slider/slide-opt-2.webp",
          link: "/shop?category=Women",
          cta: "Explore Atelier",
        },
        {
          tag: "ROMANTIC SILHOUETTES",
          title: "Floral Lace Knotted Cami",
          subtitle: "Intricate lacework, delicate ruching and sculpted drape.",
          image: "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/f/b/fb5755bCD20250221598486SBPink_3.jpg?rnd=20200526195200",
          link: "/shop?category=Women&subcategory=Tops",
          cta: "Shop Tops & Dresses",
        },
        {
          tag: "CONTEMPORARY CHIC",
          title: "Cape Sleeve Tops",
          subtitle: "Architectural capes and structured necklines for evening poise.",
          image: "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/2/6/2649b8dCD20260306680992SLB-OliveGreen_1.jpg?rnd=20200526195200",
          link: "/shop?category=Women",
          cta: "Discover Collection",
        },
      ],
      columns: [
        {
          heading: "Indian & Fusion",
          items: [
            "Tops",
            "Lehenga Cholis",
          ],
        },
        {
          heading: "Western Wear",
          items: [
            "Dresses",
            "Tops",
            "T-Shirts",
            "Sweatshirts",
            "Jeans",
          ],
        },
      ],
    },

    ACCESSORIES: {
      slides: [
        {
          tag: "FINE CRAFTSMANSHIP",
          title: "Tactical Armour Backpack",
          subtitle: "Water-resistant ballistic nylon with ergonomic carry harness.",
          image: "https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1773818212_5017226.jpg?w=480&dpr=2",
          link: "/shop?category=Accessories",
          cta: "Shop Backpacks",
        },
        {
          tag: "URBAN UTILITY",
          title: "Tactical Gear Crossbody",
          subtitle: "Modular pouches, heavy-duty hardware & sleek matte accents.",
          image: "https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1774526349_8429375.jpg?w=480&dpr=2",
          link: "/shop?category=Accessories",
          cta: "Explore Gear",
        },
        {
          tag: "TIMEPIECES & ACCENTS",
          title: "Chronograph Master",
          subtitle: "Precision quartz movement, sapphire glass & interchangeable straps.",
          image: "/images/slider/slide-opt-1.webp",
          link: "/shop?category=Accessories",
          cta: "View Watches",
        },
      ],
      columns: [
        {
          heading: "Bags & Accents",
          items: [
            "Backpacks",
            "Handbags",
            "Caps",
            "Sunglasses",
          ],
        },
        {
          heading: "Timepieces & Jewelry",
          items: [
            "Watches",
            "Bracelets",
          ],
        },
      ],
    },

    PERFUME: {
      slides: [
        {
          tag: "HAUTE PARFUMERIE",
          title: "House Of The Dragon",
          subtitle: "Rare Fire & Blood extrait with smoky ember and spiced amber accords.",
          image: "https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1786622368_6340322.jpg?w=480&dpr=2",
          link: "/shop?category=Perfume",
          cta: "Shop Fragrance",
        },
        {
          tag: "COASTAL NOIR",
          title: "Sea & Cedar Edition",
          subtitle: "Crisp ocean air layered with Tuscan cedar, sage and bergamot.",
          image: "https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1783685701_3358167.png?w=480&dpr=2",
          link: "/shop?category=Perfume",
          cta: "Explore Scent",
        },
        {
          tag: "GIFT COLLECTION",
          title: "Cosmic Trilogy Set",
          subtitle: "Three signature luxury flacons presented in a velvet collector case.",
          image: "https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/product/1781096495_5517867.jpg?w=480&dpr=2",
          link: "/shop?category=Perfume",
          cta: "View Gift Set",
        },
      ],
      columns: [
        {
          heading: "Fragrances",
          items: [
            "Men's Perfume",
            "Women's Perfume",
            "Unisex Perfume",
            "Gift Sets",
          ],
        },
      ],
    },

    FOOTWEAR: {
      slides: [
        {
          tag: "ICONIC ARCHIVES",
          title: "Air Jordan 1 High OG",
          subtitle: "The timeless heritage high-top in premium tumbled grain leather.",
          image: "https://i.pinimg.com/1200x/39/0e/d7/390ed756a6c663cd8f55457165cc7bf5.jpg",
          link: "/shop?category=Footwear",
          cta: "Shop Sneakers",
        },
        {
          tag: "COLLABORATION",
          title: "Black Phantom Low",
          subtitle: "Dark velvety suede with contrast signature tonal white stitching.",
          image: "https://sneakernews.com/wp-content/uploads/2022/09/travis-scott-jordan-1-low-og-black-phantom-DM7866-001-2.jpg?w=1200",
          link: "/shop?category=Footwear",
          cta: "Discover Kicks",
        },
        {
          tag: "RETRO HERITAGE",
          title: "Air Jordan 3 Retro",
          subtitle: "Iconic elephant print overlays with visible Air cushioning comfort.",
          image: "https://i.pinimg.com/736x/ac/dd/4a/acdd4adacb1d82d89ead17aaf03020e9.jpg",
          link: "/shop?category=Footwear",
          cta: "Explore Footwear",
        },
      ],
      columns: [
        {
          heading: "Men's Footwear",
          items: [
            "Men's Sneakers",
            "Men's Casual Shoes",
            "Men's Sports Shoes",
            "Men's Slippers",
            "Flip Flops",
          ],
        },
        {
          heading: "Women's Footwear",
          items: [
            "Women's Heels",
            "Women's Sneakers",
            "Women's Casual Shoes",
            "Women's Sports Shoes",
            "Women's Slippers",
          ],
        },
      ],
    },
  };

  // Auto-advance editorial slide every 3.5 seconds
  useEffect(() => {
    if (!activeMenu || isSlidePaused) return;
    const currentCategoryData = categories[activeMenu];
    const totalSlides = currentCategoryData?.slides?.length || 0;
    if (totalSlides <= 1) return;

    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % totalSlides);
    }, 3500);

    return () => clearInterval(timer);
  }, [activeMenu, isSlidePaused]);

  // Load products for live search
  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to load products");
        }
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch (error) {
        console.error("Search products error:", error);
      }
    }
    loadProducts();
  }, []);

  // Filter products as the user types
  const filteredProducts = products
    .filter((product) => {
      const term = searchQuery.trim().toLowerCase();
      if (!term) return false;
      const searchable = [
        product.name,
        product.title,
        product.brand,
        product.category,
        product.subcategory,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(term);
    })
    .slice(0, 6);

  // Submit search
  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setSearchResultsOpen(false);
    setActiveMenu(null);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  // Navigate to a product
  const openProduct = (product) => {
    setSearchResultsOpen(false);
    if (product.id != null) {
      router.push(`/product/${product.id}`);
    }
  };

  // Navigate to a category
  const openSubcategory = (category, subcategory) => {
    setActiveMenu(null);
    setSearchResultsOpen(false);
    router.push(
      `/shop?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`
    );
  };

  const handlePrevSlide = (e, total) => {
    e.preventDefault();
    e.stopPropagation();
    setSlideIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNextSlide = (e, total) => {
    e.preventDefault();
    e.stopPropagation();
    setSlideIndex((prev) => (prev + 1) % total);
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Unable to log out. Please try again.");
      }
      setProfileOpen(false);
      setAuthUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      alert(error.message || "Logout failed.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav
      className={`navbar ${
        isHome ? "navbar-home" : "navbar-inner"
      } ${scrolled ? "navbar-scrolled" : "navbar-transparent"}`}
      onMouseEnter={handleKeepMenuOpen}
      onMouseLeave={handleCloseMenu}
    >
      {/* 1. Website Luxury Brand Logo */}
      <a href="/" className="navbar-brand" aria-label="PrimeNest Home">
        <img
          src="/images/primenest-logo.png"
          alt="PrimeNest"
          className="navbar-logo"
        />
      </a>

      {/* 2. Navigation Categories Bar */}
      <div className="nav-links">
        {Object.entries(categories).map(([category]) => (
          <div
            className="nav-item"
            key={category}
            onMouseEnter={() => handleCategoryHover(category)}
          >
            <button
              type="button"
              ref={(el) => {
                navItemRefs.current[category] = el;
              }}
              className={`nav-button ${activeMenu === category ? "active" : ""}`}
              aria-expanded={activeMenu === category}
              onClick={() => {
                if (activeMenu === category) {
                  setActiveMenu(null);
                } else {
                  handleCategoryHover(category);
                }
              }}
              onFocus={() => handleCategoryHover(category)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setActiveMenu(null);
                }
              }}
            >
              {category}
            </button>
          </div>
        ))}
      </div>

      {/* 3. Right-side Search and Action Icons */}
      <div className="navbar-actions">
        {/* Inline luxury search with live suggestions */}
        <div className="navbar-search-wrapper">
          <form className="navbar-search-bar" onSubmit={handleSearch}>
            <button
              type="submit"
              className="search-submit"
              aria-label="Search products"
            >
              <Search size={18} strokeWidth={1.8} />
            </button>

            <input
              type="search"
              placeholder="Search products, brands, styles..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchResultsOpen(true);
                setActiveMenu(null);
              }}
              onFocus={() => {
                if (searchQuery.trim()) {
                  setSearchResultsOpen(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchResultsOpen(false);
                }
              }}
              aria-label="Search products"
              aria-expanded={searchResultsOpen}
            />

            {searchQuery && (
              <button
                type="button"
                className="search-clear"
                aria-label="Clear search"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResultsOpen(false);
                }}
              >
                <X size={16} />
              </button>
            )}
          </form>

          {/* Live search results popover */}
          {searchResultsOpen && searchQuery.trim() && (
            <div className="navbar-search-results">
              <div className="search-results-heading">
                {filteredProducts.length > 0
                  ? "MATCHING PRODUCTS"
                  : "SEARCH RESULTS"}
              </div>

              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => {
                  const name =
                    product.name || product.title || "Product";
                  const image =
                    product.image_url ||
                    product.image ||
                    product.image_url_1;

                  return (
                    <button
                      type="button"
                      className="search-result-item"
                      key={product.id ?? index}
                      onClick={() => openProduct(product)}
                    >
                      {image ? (
                        <img src={image} alt={name} />
                      ) : (
                        <div className="search-result-placeholder">
                          <Search size={20} />
                        </div>
                      )}

                      <span className="search-result-info">
                        <strong>{name}</strong>
                        <small>
                          {[product.brand, product.category]
                            .filter(Boolean)
                            .join(" · ")}
                        </small>
                        {product.price != null && (
                          <b>
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </b>
                        )}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="search-no-results">
                  No matching products found.
                </div>
              )}

              <button
                type="button"
                className="search-dismiss"
                onClick={() => setSearchResultsOpen(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Wishlist */}
        <a
          href="/wishlist"
          className="wishlist-icon"
          aria-label={`Wishlist, ${wishlistCount} items`}
          title="Wishlist"
        >
          <Heart size={19} strokeWidth={1.6} />
          {wishlistCount > 0 && (
            <span className="wishlist-count">{wishlistCount}</span>
          )}
        </a>

        {/* Shopping bag */}
        <a
          href="/cart"
          className="bag-icon"
          aria-label={`Shopping bag, ${cartCount} items`}
          title="Shopping Bag"
        >
          <ShoppingBag size={19} strokeWidth={1.6} />
          {cartCount > 0 && (
            <span className="cart-count">{cartCount}</span>
          )}
        </a>

        {/* Profile Dropdown */}
        <div className="profile-dropdown-wrapper">
          <button
            type="button"
            className="nav-icon profile-trigger"
            aria-label="My Account"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <UserRound size={19} strokeWidth={1.6} />
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              {authUser ? (
                <>
                  <div className="profile-dropdown-user">
                    <span className="profile-dropdown-user-label">
                      Signed in as
                    </span>
                    <strong className="profile-dropdown-user-name">
                      {authUser.name}
                    </strong>
                  </div>

                  <a
                    href="/profile"
                    className="profile-dropdown-link"
                    onClick={() => setProfileOpen(false)}
                  >
                    <UserRound size={16} />
                    <span>MY PROFILE</span>
                  </a>

                  <button
                    type="button"
                    className="profile-dropdown-link profile-logout"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    <LogOut size={16} />
                    <span>
                      {loggingOut ? "LOGGING OUT..." : "LOG OUT"}
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/login"
                    className="profile-dropdown-link"
                    onClick={() => setProfileOpen(false)}
                  >
                    <UserRound size={16} />
                    <span>SIGN IN</span>
                  </a>
                  <a
                    href="/register"
                    className="profile-dropdown-link"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Sparkles size={16} />
                    <span>CREATE ACCOUNT</span>
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Luxury Floating Mega-Menu Panel with Multi-Image Slider Card */}
      {activeMenu && categories[activeMenu] && (
        <div
          className="luxury-megamenu-panel"
          style={menuLeft != null ? { left: `${menuLeft}px`, transform: "none" } : {}}
          onMouseEnter={handleKeepMenuOpen}
          onMouseLeave={handleCloseMenu}
          role="region"
          aria-label={`${activeMenu} Navigation Menu`}
        >
          <div className="megamenu-inner-grid">
            {/* Columns of subcategories */}
            <div className="megamenu-columns-wrap">
              {categories[activeMenu].columns.map((column) => (
                <div className="megamenu-col" key={column.heading}>
                  <h4 className="megamenu-heading">{column.heading}</h4>
                  <ul className="megamenu-list">
                    {column.items.map((subcategory) => (
                      <li key={subcategory}>
                        <a
                          href={`/shop?category=${encodeURIComponent(
                            activeMenu
                          )}&subcategory=${encodeURIComponent(subcategory)}`}
                          className="megamenu-item-link"
                          onClick={(e) => {
                            e.preventDefault();
                            openSubcategory(activeMenu, subcategory);
                          }}
                        >
                          <span className="megamenu-sublink-title">
                            {subcategory}
                          </span>
                          <span className="megamenu-item-arrow">→</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Curated Editorial Multi-Image Slider Card */}
            {categories[activeMenu].slides &&
              categories[activeMenu].slides.length > 0 && (
                <div
                  className="megamenu-featured-card"
                  onMouseEnter={() => setIsSlidePaused(true)}
                  onMouseLeave={() => setIsSlidePaused(false)}
                >
                  {/* Slider Progress / Navigation Dots */}
                  <div className="featured-slider-dots">
                    {categories[activeMenu].slides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`slider-dot ${
                          idx === slideIndex ? "active" : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSlideIndex(idx);
                        }}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Manual Arrow Controls */}
                  <button
                    type="button"
                    className="slider-arrow-btn prev"
                    onClick={(e) =>
                      handlePrevSlide(
                        e,
                        categories[activeMenu].slides.length
                      )
                    }
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    className="slider-arrow-btn next"
                    onClick={(e) =>
                      handleNextSlide(
                        e,
                        categories[activeMenu].slides.length
                      )
                    }
                    aria-label="Next slide"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {/* Slides Container */}
                  <div className="featured-slides-container">
                    {categories[activeMenu].slides.map((slide, idx) => (
                      <div
                        key={idx}
                        className={`featured-slide ${
                          idx === slideIndex ? "active" : ""
                        }`}
                      >
                        <div
                          className="featured-card-bg"
                          style={{
                            backgroundImage: `url(${slide.image})`,
                          }}
                        />
                        <div className="featured-card-overlay" />
                        <div className="featured-card-content">
                          <span className="featured-card-tag">
                            <Sparkles
                              size={11}
                              style={{
                                display: "inline-block",
                                marginRight: 4,
                              }}
                            />
                            {slide.tag}
                          </span>
                          <h3 className="featured-card-title">
                            {slide.title}
                          </h3>
                          <p className="featured-card-sub">
                            {slide.subtitle}
                          </p>
                          <a
                            href={slide.link}
                            className="featured-card-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveMenu(null);
                              router.push(slide.link);
                            }}
                          >
                            <span>{slide.cta}</span>
                            <ArrowRight size={13} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Bottom Bar: Clean Luxury View All CTA without perks banner */}
          <div className="megamenu-bottom-bar">
            <a
              href={`/shop?category=${encodeURIComponent(activeMenu)}`}
              className="megamenu-view-all-link"
              onClick={(e) => {
                e.preventDefault();
                setActiveMenu(null);
                router.push(
                  `/shop?category=${encodeURIComponent(activeMenu)}`
                );
              }}
            >
              <span>Explore Entire {activeMenu} Collection</span>
              <ArrowRight size={13} />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}