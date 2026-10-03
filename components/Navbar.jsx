
"use client";

import { useState, useEffect } from "react";
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
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [activeMenu, setActiveMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [authUser, setAuthUser] = useState(null);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Navigation categories
  const categories = {
    MEN: {
      columns: [
        {
          heading: "Topwear",
          items: [
            "T-Shirts",
            "Casual Shirts",
            "Formal Shirts",
            "Sweatshirts",
            "Sweaters",
            "Jackets",
          ],
        },
        {
          heading: "Bottomwear",
          items: [
            "Jeans",
            "Casual Trousers",
            "Formal Trousers",
            "Shorts",
            "Track Pants & Joggers",
          ],
        },
      ],
    },

    WOMEN: {
      columns: [
        {
          heading: "Indian & Fusion Wear",
          items: [
            "Kurtas",
            "Kurtis",
            "suits",
            "Tops",
            "Leggings",
            "Skirts & Palazzos",
            "Dress Materials",
            "Lehenga Cholis",
            "Dupattas & Shawls",
            "Jackets",
          ],
        },
        {
          heading: "Western Wear",
          items: [
            "Dresses",
            "Tops",
            "T-Shirts",
            "Jeans",
            "Trousers & Capris",
            "Shorts & Skirts",
            "Co-ords",
            "Playsuits",
            "Jumpsuits",
            "Shrugs",
            "Sweaters & Sweatshirts",
          ],
        },
      ],
    },

    ACCESSORIES: {
  columns: [
    {
      heading: "Accessories",
      items: [
        "Backpacks",
        "Handbags",
        "Wallets",
        "Belts",
        "Sunglasses",
        "Caps",
      ],
    },
    {
      heading: "Watches",
      items: [
        "Watches",
        "Smart Watches",
        "Bracelets",
      ],
    },
  ],
},
    HOME: {
  columns: [
    {
      heading: "Home Decor",
      items: [
        "Wall Decor",
        "Wall Art",
        "Clocks",
        "Mirrors",
        "Vases",
        "Showpieces",
        "Photo Frames",
      ],
    },
    {
      heading: "Home Essentials",
      items: [
        "Bedding",
        "Bedsheets",
        "Cushion Covers",
        "Curtains",
        "Lighting",
        "Table Decor",
        "Storage & Organizers",
      ],
    },
  ],
},

    PERFUME: {
      columns: [
        {
          heading: "Fragrances",
          items: [
            "Men's Perfume",
            "Women's Perfume",
          ],
        },
      ],
    },

    
FOOTWEAR: {
  columns: [
    {
      heading: "Men's Footwear",
      items: [
        "Casual Shoes",
        "Sports Shoes",
        "Sneakers",
        "Formal Shoes",
        "Loafers",
        "Sandals & Floaters",
        "Flip Flops",
      ],
    },
    {
      heading: "Women's & Kids' Footwear",
      items: [
        "Women's Heels",
        "Flats",
        "Women's Sneakers",
        "Women's Sandals",
        "Kids' Shoes",
        "Kids' Sandals",
        "Slippers",
      ],
    },
  ],
},

KIDS: {
  columns: [
    {
      heading: "Boys Clothing",
      items: [
        "T-Shirts",
        "Shirts",
        "Jeans",
        "Shorts",
        "Trousers",
        "Ethnic Wear",
        "Jackets",
      ],
    },
    {
      heading: "Girls Clothing",
      items: [
        "Dresses",
        "Tops",
        "T-Shirts",
        "Jeans",
        "Skirts",
        "Ethnic Wear",
        "Jumpsuits",
      ],
    },
  ],
},

BEAUTY: {
  columns: [
    {
      heading: "Makeup & Cosmetics",
      items: [
        "Lipstick",
        "Foundation",
        "Face Makeup",
        "Eye Makeup",
        "Nail Polish",
        "Makeup Kits",
      ],
    },
    {
      heading: "Beauty & Personal Care",
      items: [
        "Skincare",
        "Face Wash",
        "Moisturizers",
        "Sunscreen",
        "Hair Care",
        "Body Care",
        "Beauty Accessories",
      ],
    },
  ],
},


  };

  // Load products for live search
  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const data = await response.json();

        setProducts(
          Array.isArray(data) ? data : data.products || []
        );
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
      onMouseLeave={() => {
        setActiveMenu(null);
        setProfileOpen(false);
      }}
    >
      <div className="nav-links">

        {/* Website logo */}
        <a href="/" className="navbar-brand" aria-label="PrimeNest Home">
          <img
            src="/images/primenest-logo.png"
            alt="PrimeNest"
            className="navbar-logo"
          />
        </a>

        {/* Home */}
        {/* <a href="/" className="nav-home">
          HOME
        </a> */}

        {/* Navigation categories */}
        {Object.entries(categories).map(
          ([category, data]) => (
            <div
              className="nav-item"
              key={category}
              onMouseEnter={() => {
                setActiveMenu(category);
                setSearchResultsOpen(false);
              }}
            >
              <button
                type="button"
                className={`nav-button ${
                  activeMenu === category ? "active" : ""
                }`}
                aria-expanded={activeMenu === category}
                onClick={() =>
                  setActiveMenu(
                    activeMenu === category ? null : category
                  )
                }
                onFocus={() => setActiveMenu(category)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setActiveMenu(null);
                  }
                }}
              >
                {category}
              </button>

              {/* Category dropdown */}
              {activeMenu === category && (
                <div
                 className={`dropdown ${
                  [
                    "MEN",
                    "WOMEN",
                    "ACCESSORIES",
                    "HOME",
                    "FOOTWEAR",
                    "KIDS",
                    "BEAUTY",
                  ].includes(category)
                    ? "men-dropdown"
                    : ""
                }`}
                >
                  <div className="men-dropdown-grid">
                    {data.columns.map((column) => (
                      <div
                        className="dropdown-column"
                        key={column.heading}
                      >
                        <h4 className="dropdown-heading">
                          {column.heading}
                        </h4>

                        {column.items.map((subcategory) => (
                          <a
                            href={`/shop?category=${encodeURIComponent(
                              category
                            )}&subcategory=${encodeURIComponent(
                              subcategory
                            )}`}
                            className="dropdown-link"
                            key={subcategory}
                            onClick={(e) => {
                              e.preventDefault();
                              openSubcategory(
                                category,
                                subcategory
                              );
                            }}
                          >
                            {subcategory}
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {/* Right-side search and action icons */}
        <div className="navbar-actions">

          {/* Inline search with live suggestions */}
          <div className="navbar-search-wrapper">
            <form
              className="navbar-search-bar"
              onSubmit={handleSearch}
            >
              <button
                type="submit"
                className="search-submit"
                aria-label="Search products"
              >
                <Search size={18} strokeWidth={1.8} />
              </button>

              <input
                type="search"
                placeholder="Search for products, brands and more"
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

            {/* Live search results */}
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
                      product.name ||
                      product.title ||
                      "Product";

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
                            {[
                              product.brand,
                              product.category,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </small>

                          {product.price != null && (
                            <b>
                              ₹
                              {Number(
                                product.price
                              ).toLocaleString("en-IN")}
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

          {/* Shopping bag */}
          <a
            href="/cart"
            className="bag-icon"
            aria-label={`Shopping bag, ${cartCount} items`}
            title="Shopping Bag"
          >
            <ShoppingBag
              size={19}
              strokeWidth={1.6}
            />

            {cartCount > 0 && (
              <span className="cart-count">
                {cartCount}
              </span>
            )}
          </a>

          {/* Wishlist */}
          <a
            href="/wishlist"
            className="wishlist-icon"
            aria-label={`Wishlist, ${wishlistCount} items`}
            title="Wishlist"
          >
            <Heart
              size={19}
              strokeWidth={1.6}
            />

            {wishlistCount > 0 && (
              <span className="wishlist-count">
                {wishlistCount}
              </span>
            )}
          </a>

          {/* Profile dropdown
          <div
            className="profile-dropdown-wrapper"
            onMouseEnter={() => setProfileOpen(true)}
          >
            <button
              type="button"
              className={`nav-icon profile-trigger ${
                profileOpen ? "profile-active" : ""
              }`}
              aria-label="My account"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              title="My Account"
              onClick={() => setProfileOpen((prev) => !prev)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setProfileOpen(false);
                }
              }}
            >
              <UserRound size={19} strokeWidth={1.6} />
              <ChevronDown
                size={12}
                className={`profile-chevron ${
                  profileOpen ? "profile-chevron-open" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                <a
                  href="/profile"
                  className="profile-dropdown-link"
                  onClick={() => setProfileOpen(false)}
                >
                  <UserRound size={17} strokeWidth={1.7} />
                  <span>MY PROFILE</span>
                </a>

                <button
                  type="button"
                  className="profile-dropdown-link profile-logout"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <LogOut size={17} strokeWidth={1.7} />
                  <span>{loggingOut ? "LOGGING OUT..." : "LOG OUT"}</span>
                </button>
              </div>
            )}
        </div> */}

        
{/* Profile Dropdown */}
<div className="profile-dropdown-wrapper">
  <button
    type="button"
    className="nav-icon profile-trigger"
    aria-label="My Account"
    aria-expanded={profileOpen}
    onClick={() => setProfileOpen(!profileOpen)}
    style={{ color: "#ffffff" }}
  >
    <UserRound size={19} strokeWidth={1.6} color="#ffffff" />
  </button>

  {profileOpen && (
    <div className="profile-dropdown">
      {authUser ? (
        <>
          <div className="profile-dropdown-user">
            <span className="profile-dropdown-user-label">Signed in as</span>
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
            <span>CREATE ACCOUNT</span>
          </a>
        </>
      )}
    </div>
  )}
</div>

        </div>
      </div>
    </nav>
  );
}