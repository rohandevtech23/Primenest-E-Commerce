"use client";

import Link from "next/link"; 
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, Check, Search, Plus, Trash2, Image as ImageIcon, FileSpreadsheet, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import ProductImportModal from "@/components/admin/ProductImportModal";

const subcategoryOptions = {
  men: [
    "T-Shirts",
    "Polo T-Shirts",
    "Casual Shirts",
    "Sweatshirts",
    "Hoodies",
    "Jackets",
    "Blazers",
    "Jeans",
    "Casual Trousers",
    "Track Pants & Joggers",
    "Ethnic Wear",
    "Flip Flops",
  ],
  women: [
    "Dresses",
    "Tops",
    "T-Shirts",
    "Sweatshirts",
    "Shirts",
    "Jeans",
    "Trousers",
    "Sarees",
    "Jackets",
    "Hoodies",
    "Blazers",
  ],
  footwear: [
    "Flip Flops",
    "Men's Sneakers",
    "Men's Casual Shoes",
    "Men's Sports Shoes",
    "Men's Slippers",
    "Women's Sneakers",
    "Women's Casual Shoes",
    "Women's Sports Shoes",
    "Women's Heels",
    "Women's Flats",
    "Women's Slippers",
    "Boots",
  ],
  accessories: [
    "Bags",
    "Backpacks",
    "Watches",
    "Sunglasses",
    "Caps",
    "Hats",
    "Jewellery",
    "Scarves",
    "Ties",
  ],
  perfume: [
    "Men's Perfume",
    "Women's Perfume",
    "Unisex Perfume",
    "Body Mist",
    "Deodorant",
    "Perfume Oils",
    "Gift Sets",
  ],
};

function getSubcategoryOptions(category) {
  if (!category) return [];

  const key = String(category.name || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  const aliases = {
    men: "men",
    mens: "men",
    "men s": "men",
    women: "women",
    womens: "women",
    "women s": "women",
    accessories: "accessories",
    perfume: "perfume",
    perfumes: "perfume",
    footwear: "footwear",
    shoes: "footwear",
  };

  return subcategoryOptions[aliases[key] || key] || [];
}

function GlossySilverSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  onAddNew = null,
  addNewLabel = "+ Add New Subcategory...",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase().trim();
    return options.filter((opt) =>
      String(opt.label || "").toLowerCase().includes(q)
    );
  }, [options, search]);

  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value)
  );

  return (
    <div
      className={`glossy-select-container ${open ? "is-open" : ""}`}
      ref={dropdownRef}
      style={{
        position: "relative",
        width: "100%",
        zIndex: open ? 999 : 5,
      }}
    >
      <button
        type="button"
        className={`glossy-select-trigger ${open ? "open" : ""} ${
          disabled ? "disabled" : ""
        }`}
        onClick={() => {
          if (!disabled) {
            setOpen(!open);
            setSearch("");
          }
        }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: "100%",
          height: "44px",
          minHeight: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          background: disabled
            ? "#f1f5f9"
            : open
            ? "linear-gradient(180deg, #ffffff 0%, #edf2f8 50%, #dce4ef 100%)"
            : "linear-gradient(180deg, #ffffff 0%, #f4f7fb 45%, #e2e8f0 100%)",
          border: disabled
            ? "1px solid #e2e8f0"
            : open
            ? "1.5px solid #64748b"
            : "1.5px solid #cbd5e1",
          borderRadius: "11px",
          boxShadow: disabled
            ? "none"
            : open
            ? "0 0 0 3px rgba(148, 163, 184, 0.3), inset 0 1px 1px #ffffff"
            : "0 2px 4px rgba(15, 23, 42, 0.05), inset 0 1px 1px #ffffff",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          outline: "none",
          transition: "all 0.18s ease",
          textAlign: "left",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: selectedOption ? 600 : 400,
            color: selectedOption ? "#0f172a" : "#64748b",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: "#64748b",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
            marginLeft: "8px",
          }}
        />
      </button>

      {open && !disabled && (
        <div
          className="glossy-dropdown-menu"
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 99999,
            background: "#ffffff",
            border: "1.5px solid #cbd5e1",
            borderRadius: "12px",
            boxShadow:
              "0 18px 40px -4px rgba(15, 23, 42, 0.22), 0 4px 12px rgba(15, 23, 42, 0.08)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
          }}
        >
          {options.length > 5 && (
            <div
              className="glossy-dropdown-search"
              style={{
                padding: "8px 10px",
                background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Search size={14} style={{ color: "#94a3b8", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  fontSize: "12px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "7px",
                  outline: "none",
                  color: "#0f172a",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          <div
            className="glossy-options-list"
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              padding: "4px",
            }}
          >
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: "16px 12px",
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#94a3b8",
                }}
              >
                No matches found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    className={`glossy-option-item ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      fontSize: "13px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: isSelected
                        ? "linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%)"
                        : "transparent",
                      color: "#0f172a",
                      fontWeight: isSelected ? 600 : 400,
                      transition: "background 0.12s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "#f1f5f9";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <Check
                        size={14}
                        style={{ color: "#334155", strokeWidth: 2.5 }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {onAddNew && (
            <div
              className="glossy-add-new-btn"
              onClick={() => {
                setOpen(false);
                onAddNew();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 12px",
                background: "linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)",
                borderTop: "1px solid #e2e8f0",
                fontSize: "12px",
                fontWeight: 600,
                color: "#334155",
                cursor: "pointer",
                transition: "background 0.12s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)";
              }}
            >
              <span>{addNewLabel}</span>
              <Plus size={14} style={{ color: "#475569" }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isAddingNewSubcategory, setIsAddingNewSubcategory] = useState(false);
  const [newSubcategoryInput, setNewSubcategoryInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage]);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    subcategory: "",
    images: ["", "", "", "", ""],
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/products", {
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load products.");
      }

      setProducts(data.products || []);
      setCategories(data.categories || []);
      setSubcategories(data.subcategories || []);
    } catch (error) {
      toast.error(error.message || "Could not load products.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const availableSubcategories = useMemo(() => {
    if (!form.category_id) return [];
    const dbSubs = subcategories.filter(
      (sub) => String(sub.category_id) === String(form.category_id)
    );
    if (dbSubs.length > 0) return dbSubs;

    const selectedCat = categories.find(
      (category) => String(category.id) === String(form.category_id)
    );
    return getSubcategoryOptions(selectedCat).map((name, idx) => ({
      id: `fallback-${idx}`,
      category_id: Number(form.category_id),
      name,
    }));
  }, [subcategories, form.category_id, categories]);

  const money = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  function startCreating() {
    setSelectedProduct({ id: null });
    setIsAddingNewSubcategory(false);
    setNewSubcategoryInput("");
    setForm({
      name: "",
      slug: "",
      description: "",
      price: "",
      stock: "",
      category_id: "",
      subcategory: "",
      images: ["", "", "", "", ""],
    });
  }

  const openEdit = (product) => {
    setSelectedProduct(product);
    setIsAddingNewSubcategory(false);
    setNewSubcategoryInput("");

    let initialImages = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      initialImages = [...product.images];
    } else if (product.image) {
      initialImages = [product.image];
    }
    // Ensure at least 5 slots ready for user convenience
    while (initialImages.length < 5) {
      initialImages.push("");
    }

    setForm({
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      category_id: String(product.category_id ?? ""),
      subcategory: product.subcategory || "",
      images: initialImages,
    });
  };

  const closeEdit = () => {
    if (saving) return;
    setSelectedProduct(null);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "category_id" ? { subcategory: "" } : {}),
    }));
  };

  const handleImageChange = (index, value) => {
    setForm((prev) => {
      const nextImages = [...(prev.images || ["", "", "", "", ""])];
      nextImages[index] = value;
      return { ...prev, images: nextImages };
    });
  };

  const addImageSlot = () => {
    setForm((prev) => ({
      ...prev,
      images: [...(prev.images || []), ""],
    }));
  };

  const removeImageSlot = (index) => {
    setForm((prev) => {
      const current = prev.images || [];
      if (current.length <= 1) {
        return { ...prev, images: [""] };
      }
      const nextImages = current.filter((_, i) => i !== index);
      return { ...prev, images: nextImages };
    });
  };

  
const saveProduct = async (event) => {
  event.preventDefault();

  if (!selectedProduct) return;

  const isNewProduct = selectedProduct.id === null;

  if (!form.name.trim()) {
    toast.error("Product name is required.");
    return;
  }

  if (!isNewProduct && !form.slug.trim()) {
    toast.error("Product slug is required.");
    return;
  }

  if (
    !Number.isFinite(Number(form.price)) ||
    Number(form.price) <= 0
  ) {
    toast.error("Enter a valid product price.");
    return;
  }

  if (
    form.stock === "" ||
    !Number.isInteger(Number(form.stock)) ||
    Number(form.stock) < 0
  ) {
    toast.error("Enter a valid stock quantity.");
    return;
  }

  if (!form.category_id) {
    toast.error("Please select a category.");
    return;
  }

  setSaving(true);

  try {
        const cleanedImages = (form.images || [])
          .map((url) => String(url || "").trim())
          .filter(Boolean);

        const response = await fetch(
          isNewProduct
            ? "/api/admin/products"
            : `/api/admin/products/${selectedProduct.id}`,
          {
            method: isNewProduct ? "POST" : "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              name: form.name.trim(),
              ...(isNewProduct ? {} : { slug: form.slug.trim() }),
              description: form.description.trim(),
              price: Number(form.price),
              stock: Number(form.stock),
              category_id: Number(form.category_id),
              subcategory: form.subcategory,
              image_url: cleanedImages[0] || "",
              images: cleanedImages,
            }),
          }
        );

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      router.replace("/admin/login");
      return;
    }

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
          (isNewProduct
            ? "Could not add product."
            : "Could not update product.")
      );
    }

    toast.success(
      isNewProduct
        ? "Product added successfully."
        : "Product updated successfully."
    );

    setSelectedProduct(null);
    await loadProducts();
  } catch (error) {
    toast.error(
      error.message || "Failed to save product."
    );
  } finally {
    setSaving(false);
  }
};

  const deleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    setDeletingId(product.id);

    try {
      const response = await fetch(
        `/api/admin/products/${product.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        router.replace("/admin/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete product.");
      }

      toast.success("Product deleted successfully.");
      await loadProducts();
    } catch (error) {
      toast.error(error.message || "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    const term = search.trim().toLowerCase();

    return (
      !term ||
      String(product.name || "").toLowerCase().includes(term) ||
      String(product.slug || "").toLowerCase().includes(term) ||
      String(product.category || "").toLowerCase().includes(term) ||
      String(product.id || "").toLowerCase().includes(term)
    );
  });

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock || 0),
    0
  );

  const totalFiltered = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFiltered);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const getAdminPageNumbers = () => {
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

  const handleAdminPageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === safeCurrentPage) return;
    setCurrentPage(newPage);
  };

  return (
    <main className="saas-products-page">
      <div className="saas-products-container">
        {/* Top Header */}
        <header className="saas-page-header">
          <div>
            <div className="saas-eyebrow">CATALOG INVENTORY</div>
            <h1 className="saas-page-title">Products</h1>
            <p className="saas-page-subtitle">
              Manage your store merchandise, pricing, and live inventory levels.
            </p>
          </div>

          <div className="saas-header-actions">
            <button
              type="button"
              className="saas-btn-import"
              onClick={() => setIsImportModalOpen(true)}
              title="Import products in bulk from CSV or Excel file"
            >
              <FileSpreadsheet size={15} />
              <span>Import CSV / Excel</span>
            </button>
            <button
              type="button"
              className="saas-btn-add"
              onClick={startCreating}
            >
              <span>+ Add Product</span>
            </button>
          </div>
        </header>

        {/* 3 Metric Cards */}
        <section className="saas-stats-grid">
          <div className="saas-stat-card">
            <div className="saas-stat-top">
              <span className="saas-stat-label">Total Products</span>
              <span className="saas-trend-badge">↗ Active</span>
            </div>
            <div className="saas-stat-value">{products.length}</div>
            <div className="saas-stat-sub">Across all merchandise categories</div>
          </div>

          <div className="saas-stat-card">
            <div className="saas-stat-top">
              <span className="saas-stat-label">Total Stock Units</span>
              <span className="saas-trend-badge">📦 In Warehouse</span>
            </div>
            <div className="saas-stat-value">{totalStock.toLocaleString("en-IN")}</div>
            <div className="saas-stat-sub">Units ready for immediate fulfillment</div>
          </div>

          <div className="saas-stat-card">
            <div className="saas-stat-top">
              <span className="saas-stat-label">Low Stock Alerts</span>
              <span className="saas-alert-badge">
                {products.filter((p) => Number(p.stock || 0) <= 5).length > 0 ? "⚠ Needs restock" : "✓ Optimal"}
              </span>
            </div>
            <div className="saas-stat-value">
              {products.filter((p) => Number(p.stock || 0) <= 5).length}
            </div>
            <div className="saas-stat-sub">Products with 5 or fewer items remaining</div>
          </div>
        </section>

        {/* Main Products Table Card */}
        <section className="saas-table-card">
          <div className="saas-toolbar">
            <div className="saas-toolbar-title-wrap">
              <h2 className="saas-card-heading">Product Catalog</h2>
              <span className="saas-count-pill">{filteredProducts.length} items</span>
            </div>

            <div className="saas-search-wrap">
              <input
                className="saas-search-input"
                type="search"
                placeholder="Search products by title, category, or slug..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search products"
              />
            </div>
          </div>

          {loading ? (
            <div className="saas-loading-state">
              <div className="saas-spinner" />
              <span>Loading products catalog...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="saas-empty-state">
              <p className="saas-empty-title">
                {search ? "No matching products found" : "Your catalog is empty"}
              </p>
              <p className="saas-empty-desc">
                {search
                  ? `No items match "${search}". Try adjusting your search query.`
                  : "Click '+ Add Product' above to create your first catalog item."}
              </p>
            </div>
          ) : (
            <div className="saas-table-wrapper">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedProducts.map((product) => {
                    const isLow = Number(product.stock || 0) <= 5;
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="saas-product-cell">
                            <div className="saas-product-thumb">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name || "Product"}
                                  loading="lazy"
                                />
                              ) : (
                                <span className="saas-thumb-placeholder">P</span>
                              )}
                            </div>
                            <div className="saas-product-meta">
                              <span className="saas-product-name">{product.name}</span>
                              <span className="saas-product-slug">
                                {product.slug || `SKU #${product.id}`}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="saas-category-badge">
                            {product.category || "Uncategorized"}
                          </span>
                        </td>

                        <td>
                          <span className="saas-price-text">{money(product.price)}</span>
                        </td>

                        <td>
                          <span className={`saas-stock-pill ${isLow ? "low" : "ok"}`}>
                            <span className="saas-stock-dot" />
                            {isLow ? `Low (${product.stock} left)` : `${product.stock} in stock`}
                          </span>
                        </td>

                        <td>
                          <div className="saas-actions-group">
                            <button
                              className="saas-btn-edit"
                              type="button"
                              onClick={() => openEdit(product)}
                            >
                              Edit
                            </button>
                            <button
                              className="saas-btn-delete"
                              type="button"
                              disabled={deletingId === product.id}
                              onClick={() => deleteProduct(product)}
                            >
                              {deletingId === product.id ? "..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Admin SaaS Pagination Bar */}
          {totalPages > 1 && (
            <div className="saas-pagination-bar">
              <div className="saas-pagination-info">
                Showing <strong>{startIndex + 1}–{endIndex}</strong> of <strong>{totalFiltered}</strong> items
              </div>

              <div className="saas-pagination-actions">
                <div className="saas-pagination-controls">
                  <button
                    type="button"
                    className="saas-page-btn"
                    disabled={safeCurrentPage === 1}
                    onClick={() => handleAdminPageChange(safeCurrentPage - 1)}
                    aria-label="Previous Page"
                  >
                    <ChevronLeft size={14} />
                    <span>Prev</span>
                  </button>

                  {getAdminPageNumbers().map((p, idx) =>
                    p === "..." ? (
                      <span key={`admin-dots-${idx}`} style={{ padding: "0 6px", color: "#94a3b8" }}>…</span>
                    ) : (
                      <button
                        key={`admin-page-${p}`}
                        type="button"
                        className={`saas-page-num ${safeCurrentPage === p ? "active" : ""}`}
                        onClick={() => handleAdminPageChange(p)}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    className="saas-page-btn"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => handleAdminPageChange(safeCurrentPage + 1)}
                    aria-label="Next Page"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <select
                  className="saas-per-page-select"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  aria-label="Items per page"
                >
                  <option value={8}>8 per page</option>
                  <option value={16}>16 per page</option>
                  <option value={24}>24 per page</option>
                  <option value={48}>48 per page</option>
                </select>
              </div>
            </div>
          )}

          <div className="saas-card-footer">
            <span>Showing {totalFiltered > 0 ? `${startIndex + 1}–${endIndex}` : 0} of {totalFiltered} filtered ({products.length} total) products</span>
          </div>
        </section>
      </div>

      {/* Edit / Create Modal */}
      {selectedProduct && (
        <div
          className="saas-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEdit();
          }}
        >
          <section
            className="saas-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="saas-modal-title"
          >
            <div className="saas-modal-header">
              <div>
                <h2 className="saas-modal-title" id="saas-modal-title">
                  {selectedProduct.id === null ? "Add New Product" : "Edit Product"}
                </h2>
                <p className="saas-modal-sub">
                  Fill in the details below to update your inventory catalog.
                </p>
              </div>
              <button
                className="saas-modal-close"
                type="button"
                onClick={closeEdit}
                disabled={saving}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {selectedProduct.id === null && (
              <div className="saas-modal-import-callout">
                <div className="saas-modal-import-callout-text">
                  <FileSpreadsheet size={16} style={{ color: "#2563eb", flexShrink: 0 }} />
                  <div>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>Need to add multiple products? </span>
                    <span style={{ color: "#475569" }}>Bulk import your catalog & image links directly with CSV or Excel.</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="saas-modal-callout-btn"
                  onClick={() => {
                    closeEdit();
                    setIsImportModalOpen(true);
                  }}
                >
                  Import File →
                </button>
              </div>
            )}

            <form onSubmit={saveProduct}>
              <div className="saas-form-grid">
                <div className="saas-field saas-field-full">
                  <label className="saas-label" htmlFor="pn-name">
                    Product Title *
                  </label>
                  <input
                    id="pn-name"
                    className="saas-input"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Classic Oxford Button-Down Shirt"
                    required
                  />
                </div>

                <div className="saas-field saas-field-full">
                  <label className="saas-label" htmlFor="pn-slug">
                    Product Slug *
                  </label>
                  <input
                    id="pn-slug"
                    className="saas-input"
                    name="slug"
                    value={form.slug}
                    onChange={handleFormChange}
                    placeholder="e.g. classic-oxford-button-down-shirt"
                    required
                  />
                </div>

                <div className="saas-field saas-field-full">
                  <label className="saas-label" htmlFor="pn-description">
                    Description
                  </label>
                  <textarea
                    id="pn-description"
                    className="saas-textarea"
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Detailed merchandise specifications and description..."
                    rows={3}
                  />
                </div>

                <div className="saas-field">
                  <label className="saas-label" htmlFor="pn-price">
                    Price (₹ INR) *
                  </label>
                  <input
                    id="pn-price"
                    className="saas-input"
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleFormChange}
                    placeholder="1299"
                    required
                  />
                </div>

                <div className="saas-field">
                  <label className="saas-label" htmlFor="pn-stock">
                    Stock Units *
                  </label>
                  <input
                    id="pn-stock"
                    className="saas-input"
                    type="number"
                    name="stock"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleFormChange}
                    placeholder="25"
                    required
                  />
                </div>

                <div className="saas-field saas-field-full">
                  <label className="saas-label">
                    Category *
                  </label>
                  <GlossySilverSelect
                    value={form.category_id}
                    onChange={(val) => {
                      setForm((prev) => ({
                        ...prev,
                        category_id: val,
                        subcategory: "",
                      }));
                    }}
                    options={categories.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    placeholder="Select a category"
                  />
                </div>

                <div className="saas-field saas-field-full">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label className="saas-label" style={{ margin: 0 }}>
                      Subcategory
                    </label>
                    {form.category_id && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewSubcategory(!isAddingNewSubcategory);
                          setNewSubcategoryInput("");
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#475569",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {isAddingNewSubcategory ? "← Choose existing" : "＋ Add new subcategory"}
                      </button>
                    )}
                  </div>

                  {isAddingNewSubcategory ? (
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        id="pn-new-subcategory"
                        className="saas-input"
                        placeholder="Type new subcategory name..."
                        value={newSubcategoryInput}
                        onChange={(e) => {
                          setNewSubcategoryInput(e.target.value);
                          setForm((prev) => ({ ...prev, subcategory: e.target.value }));
                        }}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="saas-silver-action-btn"
                        onClick={async () => {
                          const trimmed = newSubcategoryInput.trim();
                          if (!trimmed) {
                            toast.error("Please enter a subcategory name.");
                            return;
                          }
                          try {
                            const res = await fetch("/api/subcategories", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                category_id: Number(form.category_id),
                                name: trimmed,
                              }),
                            });
                            const data = await res.json();
                            if (res.ok && data.success) {
                              toast.success(`Subcategory "${trimmed}" added to database!`);
                              setSubcategories((prev) => {
                                if (prev.some((s) => s.id === data.subcategory.id)) return prev;
                                return [...prev, data.subcategory];
                              });
                              setForm((prev) => ({ ...prev, subcategory: trimmed }));
                              setIsAddingNewSubcategory(false);
                            } else {
                              toast.error(data.message || "Failed to save subcategory.");
                            }
                          } catch {
                            toast.error("Error connecting to subcategory service.");
                          }
                        }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <GlossySilverSelect
                      value={form.subcategory}
                      onChange={(val) => {
                        setForm((prev) => ({ ...prev, subcategory: val }));
                      }}
                      options={availableSubcategories.map((sub) => ({
                        value: sub.name,
                        label: sub.name,
                      }))}
                      placeholder={
                        !form.category_id
                          ? "Select a parent category first"
                          : "Select subcategory"
                      }
                      disabled={!form.category_id}
                      onAddNew={
                        form.category_id
                          ? () => {
                              setIsAddingNewSubcategory(true);
                              setNewSubcategoryInput("");
                            }
                          : null
                      }
                      addNewLabel="+ Add New Subcategory..."
                    />
                  )}
                  {!form.category_id ? (
                    <span className="saas-field-hint">
                      Select a parent category first.
                    </span>
                  ) : (
                    <span className="saas-field-hint">
                      {availableSubcategories.length} subcategories available in database
                    </span>
                  )}
                </div>

                <div className="saas-field saas-field-full" style={{ marginTop: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <label className="saas-label" style={{ margin: 0 }}>
                          Product Image & Gallery URLs
                        </label>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "6px",
                            background: "linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)",
                            color: "#334155",
                            border: "1px solid #cbd5e1",
                          }}
                        >
                          4–5 Images Supported
                        </span>
                      </div>
                      <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#64748b" }}>
                        Slot 1 is your primary cover photo. Slots 2–5 will display in the product gallery carousel.
                      </p>
                    </div>

                    {(form.images || []).length < 8 && (
                      <button
                        type="button"
                        onClick={addImageSlot}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)",
                          border: "1px solid #cbd5e1",
                          padding: "5px 10px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#0f172a",
                          cursor: "pointer",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Plus size={13} /> Add Another URL
                      </button>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {(form.images || ["", "", "", "", ""]).map((imgUrl, index) => {
                      const isPrimary = index === 0;
                      const hasValidPreview = imgUrl && /^https?:\/\//i.test(imgUrl.trim());

                      return (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            background: isPrimary
                              ? "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(241,245,249,0.85) 100%)"
                              : "rgba(255,255,255,0.65)",
                            padding: "8px 12px",
                            borderRadius: "12px",
                            border: isPrimary ? "1.5px solid #cbd5e1" : "1px solid #e2e8f0",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                          }}
                        >
                          {/* Live Thumbnail Preview */}
                          <div
                            style={{
                              width: "42px",
                              height: "42px",
                              borderRadius: "8px",
                              border: "1px solid #cbd5e1",
                              background: "#ffffff",
                              overflow: "hidden",
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
                            }}
                          >
                            {hasValidPreview ? (
                              <img
                                src={imgUrl.trim()}
                                alt={`Angle ${index + 1}`}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <ImageIcon size={18} style={{ color: "#94a3b8" }} />
                            )}
                          </div>

                          {/* URL Input with label */}
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "11px", fontWeight: 700, color: isPrimary ? "#0f172a" : "#475569" }}>
                                {isPrimary ? "★ Primary Cover Image (Front View) *" : `Gallery Angle Image ${index + 1}`}
                              </span>
                              {isPrimary && (
                                <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>Default Cover</span>
                              )}
                            </div>
                            <input
                              className="saas-input"
                              type="url"
                              value={imgUrl}
                              onChange={(e) => handleImageChange(index, e.target.value)}
                              placeholder={
                                isPrimary
                                  ? "https://images.unsplash.com/... (Primary front angle URL)"
                                  : `https://images.unsplash.com/... (Side, back, or detail angle ${index + 1} URL)`
                              }
                              style={{ padding: "8px 12px", fontSize: "12px", height: "38px", minHeight: "38px" }}
                              required={isPrimary}
                            />
                          </div>

                          {/* Delete Slot Button for extra slots */}
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => removeImageSlot(index)}
                              title="Remove this image slot"
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                background: "#ffffff",
                                color: "#94a3b8",
                                display: "grid",
                                placeItems: "center",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                flexShrink: 0,
                                marginTop: "14px",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = "#ef4444";
                                e.currentTarget.style.borderColor = "#fca5a5";
                                e.currentTarget.style.background = "#fef2f2";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = "#94a3b8";
                                e.currentTarget.style.borderColor = "#e2e8f0";
                                e.currentTarget.style.background = "#ffffff";
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="saas-modal-footer">
                <button
                  className="saas-btn-ghost"
                  type="button"
                  onClick={closeEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="saas-btn-primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : selectedProduct.id === null
                    ? "Create Product"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Bulk Product Import Modal (CSV & Excel) */}
      {isImportModalOpen && (
        <ProductImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          categories={categories}
          onImportSuccess={loadProducts}
        />
      )}

      <style jsx>{`
        .saas-products-page {
          min-height: 100vh;
          padding: 28px 32px 64px;
          background: #f8f9fb;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .saas-products-container {
          max-width: 1360px;
          margin: 0 auto;
        }

        .saas-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
        }

        .saas-eyebrow {
          font-size: 11px;
          font-weight: 700;
          color: #2563eb;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }

        .saas-page-title {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
          margin: 0 0 4px;
        }

        .saas-page-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        .saas-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .saas-btn-import {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 45%, #e2e8f0 100%);
          color: #0f172a;
          padding: 9px 18px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 700;
          border: 1px solid rgba(175, 190, 210, 0.9);
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06), inset 0 1px 0 #ffffff;
        }

        .saas-btn-import:hover {
          background: linear-gradient(180deg, #ffffff 0%, #edf2f7 45%, #dce4ee 100%);
          border-color: #94a3b8;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.1), inset 0 1px 0 #ffffff;
        }

        .saas-btn-add {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #0f172a;
          color: #ffffff;
          padding: 10px 20px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);
        }

        .saas-btn-add:hover {
          background: #1e293b;
          transform: translateY(-1px);
        }

        .saas-modal-import-callout {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          margin-bottom: 20px;
          background: linear-gradient(135deg, rgba(239, 246, 255, 0.8) 0%, rgba(241, 245, 249, 0.85) 100%);
          border: 1.5px dashed #93c5fd;
          border-radius: 14px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .saas-modal-import-callout-text {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: #334155;
          line-height: 1.4;
        }

        .saas-modal-callout-btn {
          padding: 6px 14px;
          background: #ffffff;
          border: 1px solid #93c5fd;
          color: #2563eb;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
          box-shadow: 0 1px 2px rgba(37, 99, 235, 0.08);
        }

        .saas-modal-callout-btn:hover {
          background: #2563eb;
          color: #ffffff;
          border-color: #2563eb;
        }

        /* 3 Stat Cards */
        .saas-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }

        .saas-stat-card {
          background: #ffffff;
          border: 1px solid #eef1f6;
          border-radius: 16px;
          padding: 20px 22px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .saas-stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .saas-stat-label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
        }

        .saas-trend-badge {
          font-size: 11px;
          font-weight: 600;
          color: #059669;
          background: #ecfdf5;
          padding: 2px 8px;
          border-radius: 9999px;
          border: 1px solid #d1fae5;
        }

        .saas-alert-badge {
          font-size: 11px;
          font-weight: 600;
          color: #d97706;
          background: #fffbeb;
          padding: 2px 8px;
          border-radius: 9999px;
          border: 1px solid #fef3c7;
        }

        .saas-stat-value {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .saas-stat-sub {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 4px;
        }

        /* Table Card */
        .saas-table-card {
          background: #ffffff;
          border: 1px solid #eef1f6;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .saas-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .saas-toolbar-title-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .saas-card-heading {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.2px;
        }

        .saas-count-pill {
          font-size: 11px;
          font-weight: 600;
          color: #2563eb;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          padding: 2px 8px;
          border-radius: 9999px;
        }

        .saas-search-input {
          width: 320px;
          max-width: 100%;
          height: 38px;
          padding: 0 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 13px;
          color: #0f172a;
          background: #ffffff;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .saas-search-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .saas-table-wrapper {
          overflow-x: auto;
        }

        .saas-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .saas-table th {
          background: #f8fafc;
          padding: 12px 24px;
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #f1f5f9;
          white-space: nowrap;
        }

        .saas-table td {
          padding: 14px 24px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 13px;
          vertical-align: middle;
        }

        .saas-table tbody tr:hover {
          background: #fcfdfe;
        }

        .saas-product-cell {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 240px;
        }

        .saas-product-thumb {
          width: 44px;
          height: 48px;
          border-radius: 8px;
          overflow: hidden;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .saas-product-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .saas-thumb-placeholder {
          font-size: 12px;
          font-weight: 700;
          color: #94a3b8;
        }

        .saas-product-meta {
          display: flex;
          flex-direction: column;
        }

        .saas-product-name {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.3;
        }

        .saas-product-slug {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 2px;
        }

        .saas-category-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          background: #f1f5f9;
          padding: 3px 9px;
          border-radius: 6px;
        }

        .saas-price-text {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
        }

        .saas-stock-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 9999px;
        }

        .saas-stock-pill.ok {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #d1fae5;
        }

        .saas-stock-pill.low {
          background: #fff1f2;
          color: #e11d48;
          border: 1px solid #ffe4e6;
        }

        .saas-stock-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .saas-actions-group {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .saas-btn-edit {
          padding: 6px 12px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #0f172a;
          cursor: pointer;
          transition: background 0.1s ease;
        }

        .saas-btn-edit:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .saas-btn-delete {
          padding: 6px 12px;
          background: #ffffff;
          border: 1px solid #fee2e2;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #e11d48;
          cursor: pointer;
          transition: background 0.1s ease;
        }

        .saas-btn-delete:hover {
          background: #fff1f2;
          border-color: #fecdd3;
        }

        .saas-card-footer {
          padding: 14px 24px;
          font-size: 12px;
          color: #94a3b8;
          border-top: 1px solid #f1f5f9;
        }

        .saas-loading-state,
        .saas-empty-state {
          padding: 60px 24px;
          text-align: center;
          color: #64748b;
        }

        .saas-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e2e8f0;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 12px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .saas-empty-title {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .saas-empty-desc {
          font-size: 13px;
          color: #64748b;
        }

        /* Modal - Glossy Silver Metallic Glassmorphic Theme */
        .saas-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(8px);
        }

        .saas-modal-card {
          width: 100%;
          max-width: 620px;
          max-height: 90vh;
          overflow-y: auto;
          background: linear-gradient(145deg, #ffffff 0%, #f6f8fb 30%, #e9eef5 65%, #dfe6f0 100%);
          border: 1px solid rgba(195, 208, 225, 0.85);
          border-radius: 24px;
          padding: 30px;
          box-shadow: 
            0 30px 70px -15px rgba(15, 23, 42, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.95) inset,
            0 2px 6px rgba(255, 255, 255, 0.9) inset,
            0 12px 28px -6px rgba(148, 163, 184, 0.25);
          position: relative;
        }

        .saas-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 22px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(203, 213, 225, 0.6);
        }

        .saas-modal-title {
          font-size: 22px;
          font-weight: 800;
          background: linear-gradient(135deg, #0f172a 0%, #334155 50%, #1e293b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 4px;
          letter-spacing: -0.4px;
        }

        .saas-modal-sub {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          margin: 0;
        }

        .saas-modal-close {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(203, 213, 225, 0.9);
          background: linear-gradient(180deg, #ffffff 0%, #edf2f7 50%, #e2e8f0 100%);
          display: grid;
          place-items: center;
          cursor: pointer;
          color: #475569;
          font-size: 13px;
          box-shadow: 0 2px 5px rgba(15, 23, 42, 0.08), inset 0 1px 0 #ffffff;
          transition: all 0.15s ease;
        }

        .saas-modal-close:hover {
          background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 50%, #cbd5e1 100%);
          color: #0f172a;
          border-color: #94a3b8;
          transform: scale(1.05);
        }

        .saas-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .saas-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
        }

        .saas-field-full {
          grid-column: 1 / -1;
        }

        .saas-label {
          font-size: 12px;
          font-weight: 700;
          color: #334155;
          letter-spacing: 0.2px;
        }

        .saas-input,
        .saas-select,
        .saas-textarea {
          width: 100%;
          border: 1.5px solid #cbd5e1;
          border-radius: 11px;
          background: linear-gradient(180deg, #ffffff 0%, #f6f8fb 45%, #ecf1f7 100%);
          padding: 11px 14px;
          font-size: 13px;
          color: #0f172a;
          outline: none;
          font-family: inherit;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05), inset 0 1px 1px #ffffff;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
        }

        .saas-input:hover,
        .saas-textarea:hover {
          border-color: #94a3b8;
          background: linear-gradient(180deg, #ffffff 0%, #edf2f8 45%, #dce5f0 100%);
        }

        .saas-input:focus,
        .saas-select:focus,
        .saas-textarea:focus {
          border-color: #64748b;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.3), inset 0 1px 1px #ffffff;
        }

        .saas-field-hint {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
        }

        /* Glossy Silver Select Dropdown */
        .glossy-select-container {
          position: relative;
          width: 100%;
          z-index: 5;
        }

        .glossy-select-container.is-open {
          z-index: 60;
        }

        .glossy-select-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 14px;
          background: linear-gradient(180deg, #ffffff 0%, #f2f5f9 45%, #e3eaf3 100%);
          border: 1px solid rgba(175, 190, 210, 0.9);
          border-radius: 11px;
          box-shadow: 
            0 2px 5px rgba(15, 23, 42, 0.05),
            0 1px 0 rgba(255, 255, 255, 0.9) inset;
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
          cursor: pointer;
          outline: none;
          text-align: left;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .glossy-select-trigger:hover:not(.disabled) {
          background: linear-gradient(180deg, #ffffff 0%, #ecf1f7 45%, #d9e2ed 100%);
          border-color: #94a3b8;
          box-shadow: 
            0 3px 8px rgba(15, 23, 42, 0.08),
            0 1px 0 rgba(255, 255, 255, 0.9) inset;
        }

        .glossy-select-trigger.open {
          border-color: #475569;
          background: linear-gradient(180deg, #ffffff 0%, #edf2f8 45%, #dde5f0 100%);
          box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.35), 0 3px 8px rgba(15, 23, 42, 0.08);
        }

        .glossy-select-trigger.disabled {
          opacity: 0.55;
          cursor: not-allowed;
          background: #eef2f6;
          border-color: #cbd5e1;
        }

        .glossy-val {
          color: #0f172a;
          font-weight: 600;
        }

        .glossy-placeholder {
          color: #64748b;
          font-weight: 400;
        }

        .glossy-chevron {
          font-size: 11px;
          color: #64748b;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-block;
          margin-left: 8px;
        }

        .glossy-chevron.open {
          transform: rotate(180deg);
          color: #0f172a;
        }

        .glossy-dropdown-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          z-index: 999;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 247, 252, 0.98) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(180, 195, 215, 0.95);
          border-radius: 13px;
          box-shadow: 
            0 20px 45px -8px rgba(15, 23, 42, 0.22),
            0 4px 14px rgba(15, 23, 42, 0.08),
            inset 0 1px 1px #ffffff;
          overflow: hidden;
          animation: glossyDropdownPop 0.16s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes glossyDropdownPop {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .glossy-dropdown-search {
          padding: 8px 10px;
          background: linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%);
          border-bottom: 1px solid rgba(226, 232, 240, 0.9);
        }

        .glossy-dropdown-search input {
          width: 100%;
          padding: 7px 11px;
          font-size: 12px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          color: #0f172a;
          transition: border-color 0.15s ease;
          font-family: inherit;
        }

        .glossy-dropdown-search input:focus {
          border-color: #64748b;
          box-shadow: 0 0 0 2px rgba(148, 163, 184, 0.25);
        }

        .glossy-options-list {
          max-height: 220px;
          overflow-y: auto;
          padding: 5px;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .glossy-options-list::-webkit-scrollbar {
          width: 5px;
        }

        .glossy-options-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .glossy-option-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          font-size: 13px;
          color: #1e293b;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.12s ease;
          user-select: none;
        }

        .glossy-option-item:hover {
          background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%);
          color: #0f172a;
          font-weight: 500;
          padding-left: 15px;
        }

        .glossy-option-item.selected {
          background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%);
          color: #0f172a;
          font-weight: 700;
        }

        .glossy-check {
          font-size: 12px;
          font-weight: bold;
          color: #334155;
        }

        .glossy-empty-opt {
          padding: 16px 12px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
        }

        .glossy-add-new-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%);
          border-top: 1px solid rgba(226, 232, 240, 0.9);
          font-size: 12px;
          font-weight: 700;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .glossy-add-new-btn:hover {
          background: linear-gradient(180deg, #edf2f7 0%, #e2e8f0 100%);
          color: #0f172a;
        }

        .glossy-plus {
          font-size: 13px;
          font-weight: bold;
          color: #475569;
        }

        .saas-silver-action-btn {
          padding: 10px 16px;
          background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 45%, #e2e8f0 100%);
          border: 1px solid rgba(175, 190, 210, 0.9);
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), inset 0 1px 0 #ffffff;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .saas-silver-action-btn:hover {
          background: linear-gradient(180deg, #ffffff 0%, #edf2f7 45%, #dce4ee 100%);
          border-color: #94a3b8;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.1), inset 0 1px 0 #ffffff;
        }

        /* Modal Footer & Glossy Buttons */
        .saas-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 26px;
          padding-top: 20px;
          border-top: 1px solid rgba(203, 213, 225, 0.7);
        }

        .saas-btn-ghost {
          padding: 11px 20px;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #cbd5e1;
          border-radius: 11px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), inset 0 1px 0 #ffffff;
          transition: all 0.15s ease;
        }

        .saas-btn-ghost:hover {
          background: linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%);
          color: #0f172a;
          border-color: #94a3b8;
        }

        .saas-btn-primary {
          padding: 11px 24px;
          background: linear-gradient(180deg, #ffffff 0%, #f1f4f9 30%, #d8e1ec 70%, #cbd5e1 100%);
          border: 1px solid rgba(148, 163, 184, 0.95);
          border-radius: 11px;
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
          cursor: pointer;
          box-shadow: 
            0 4px 12px rgba(15, 23, 42, 0.12),
            0 1px 2px rgba(15, 23, 42, 0.06),
            inset 0 1px 1px #ffffff;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          letter-spacing: 0.2px;
        }

        .saas-btn-primary:hover {
          background: linear-gradient(180deg, #ffffff 0%, #e2eaf4 30%, #cad7e7 70%, #b2c2d4 100%);
          border-color: #64748b;
          box-shadow: 
            0 6px 16px rgba(15, 23, 42, 0.16),
            inset 0 1px 1px #ffffff;
          transform: translateY(-1px);
        }

        @media (max-width: 800px) {
          .saas-stats-grid {
            grid-template-columns: 1fr;
          }

          .saas-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .saas-search-input {
            width: 100%;
          }

          .saas-form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}