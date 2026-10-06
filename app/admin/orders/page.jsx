"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Package,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  CreditCard,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const statuses = [
  "pending",
  "delivered",
];

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatOrderId = (id) => {
  if (!id) return "";
  const str = String(id);
  return str.startsWith("78645") ? str : `78645${str}`;
};

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const loadOrders = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/orders", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load orders.");
      }

      setOrders(data.orders || []);
    } catch (error) {
      toast.error(error.message || "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateStatus = async (order, newStatus) => {
    const previousStatus = String(order.status || "pending").toLowerCase();

    if (newStatus === previousStatus) return;

    setUpdatingId(order.id);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update order.");
      }

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id
            ? { ...item, status: data.order.status }
            : item
        )
      );

      setSelectedOrder((current) =>
        current?.id === order.id
          ? { ...current, status: data.order.status }
          : current
      );

      toast.success(`Order #${formatOrderId(order.id)} status updated.`);
    } catch (error) {
      toast.error(error.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const term = search.trim().toLowerCase();
    const termClean = term.replace(/^#/, "").trim();
    const status = String(order.status || "pending").toLowerCase();
    const formattedId = formatOrderId(order.id);

    const matchesSearch =
      !term ||
      String(order.id).toLowerCase().includes(termClean) ||
      formattedId.toLowerCase().includes(termClean) ||
      String(order.customer_name || "").toLowerCase().includes(term) ||
      String(order.email || "").toLowerCase().includes(term) ||
      String(order.phone || "").toLowerCase().includes(term) ||
      (Array.isArray(order.items) &&
        order.items.some((item) =>
          String(item.product_name || "").toLowerCase().includes(term)
        ));

    const matchesStatus = filter === "all" || status === filter;

    return matchesSearch && matchesStatus;
  });

  const totalFiltered = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFiltered);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

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

  const totalValue = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const pendingCount = orders.filter(
    (order) => String(order.status || "pending").toLowerCase() === "pending"
  ).length;

  const completedCount = orders.filter(
    (order) => String(order.status || "").toLowerCase() === "delivered"
  ).length;

  return (
    <main className="saas-orders-page">
      <div className="saas-orders-container">
        {/* Top Header */}
        <header className="saas-page-header">
          <div>
            <div className="saas-eyebrow">ORDER FULFILLMENT</div>
            <h1 className="saas-page-title">Orders</h1>
            <p className="saas-page-subtitle">
              Monitor customer purchases, delivery statuses, and transaction values.
            </p>
          </div>

          <div className="saas-header-actions">
            <button
              type="button"
              className="saas-btn-refresh"
              onClick={loadOrders}
              disabled={loading}
            >
              <span>{loading ? "Refreshing..." : "↻ Refresh Orders"}</span>
            </button>
          </div>
        </header>

        {/* 4 Metric Cards */}
        <section className="saas-stats-grid">
          <div className="saas-stat-card">
            <div className="saas-stat-top">
              <span className="saas-stat-label">Total Orders</span>
              <span className="saas-trend-badge">↗ All-time</span>
            </div>
            <div className="saas-stat-value">{orders.length}</div>
            <div className="saas-stat-sub">Total customer checkouts placed</div>
          </div>

          <div className="saas-stat-card">
            <div className="saas-stat-top">
              <span className="saas-stat-label">Total Order Value</span>
              <span className="saas-trend-badge">₹ Revenue</span>
            </div>
            <div className="saas-stat-value">{currency(totalValue)}</div>
            <div className="saas-stat-sub">Gross revenue across all orders</div>
          </div>

          <div className="saas-stat-card">
            <div className="saas-stat-top">
              <span className="saas-stat-label">Pending Processing</span>
              <span className="saas-alert-badge">
                {pendingCount > 0 ? "To Dispatch" : "All Clear"}
              </span>
            </div>
            <div className="saas-stat-value">{pendingCount}</div>
            <div className="saas-stat-sub">Awaiting delivery fulfillment</div>
          </div>

          <div className="saas-stat-card">
            <div className="saas-stat-top">
              <span className="saas-stat-label">Delivered Orders</span>
              <span className="saas-trend-badge">✓ Completed</span>
            </div>
            <div className="saas-stat-value">{completedCount}</div>
            <div className="saas-stat-sub">Successfully fulfilled orders</div>
          </div>
        </section>

        {/* Orders Table Card */}
        <section className="saas-table-card">
          <div className="saas-toolbar">
            <div className="saas-toolbar-title-wrap">
              <h2 className="saas-card-heading">All Orders</h2>
              <span className="saas-count-pill">{filteredOrders.length} orders</span>
            </div>

            <div className="saas-tools-group">
              <input
                className="saas-search-input"
                type="search"
                placeholder="Search by order ID, customer name, or email..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Search orders"
              />

              <select
                className="saas-select-filter"
                value={filter}
                onChange={(event) => {
                  setFilter(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter orders by status"
              >
                <option value="all">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="saas-loading-state">
              <div className="saas-spinner" />
              <span>Loading store orders...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="saas-empty-state">
              <p className="saas-empty-title">
                {search || filter !== "all"
                  ? "No matching orders found"
                  : "No orders placed yet"}
              </p>
              <p className="saas-empty-desc">
                {search || filter !== "all"
                  ? "Try resetting your search query or status filter."
                  : "When customers complete purchases, their orders will appear here automatically."}
              </p>
            </div>
          ) : (
            <div className="saas-table-wrapper">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date Placed</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedOrders.map((order) => {
                    const statusStr = String(order.status || "pending").toLowerCase();
                    const isDelivered = statusStr === "delivered";

                    return (
                      <tr key={order.id}>
                        <td>
                          <span className="saas-order-id-badge">#{formatOrderId(order.id)}</span>
                        </td>

                        <td>
                          <div className="saas-customer-cell">
                            <span className="saas-customer-name">
                              {order.customer_name || "Customer"}
                            </span>
                            <span className="saas-customer-email">
                              {order.email || "No email"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="saas-date-text">
                            {formatDate(order.created_at)}
                          </span>
                        </td>

                        <td>
                          <span className="saas-price-text">
                            {currency(order.total)}
                          </span>
                          <div style={{ marginTop: "4px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                fontSize: "10px",
                                fontWeight: "700",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                padding: "2px 7px",
                                borderRadius: "6px",
                                background:
                                  order.payment_method === "upi"
                                    ? "rgba(16, 185, 129, 0.15)"
                                    : order.payment_method === "card"
                                    ? "rgba(59, 130, 246, 0.15)"
                                    : "rgba(245, 158, 11, 0.15)",
                                color:
                                  order.payment_method === "upi"
                                    ? "#10b981"
                                    : order.payment_method === "card"
                                    ? "#60a5fa"
                                    : "#f59e0b",
                                border: `1px solid ${
                                  order.payment_method === "upi"
                                    ? "rgba(16, 185, 129, 0.3)"
                                    : order.payment_method === "card"
                                    ? "rgba(59, 130, 246, 0.3)"
                                    : "rgba(245, 158, 11, 0.3)"
                                }`,
                              }}
                            >
                              {order.payment_method ? order.payment_method.toUpperCase() : "COD"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="saas-status-container">
                            <select
                              className={`saas-status-select ${isDelivered ? "delivered" : "pending"}`}
                              value={statusStr}
                              disabled={updatingId === order.id}
                              onChange={(event) =>
                                updateStatus(order, event.target.value)
                              }
                              aria-label={`Change status for order ${order.id}`}
                            >
                              {statuses.map((status) => (
                                <option key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                              ))}
                            </select>
                            {updatingId === order.id && (
                              <span className="saas-updating-hint">Updating...</span>
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="saas-actions-group">
                            <button
                              className="saas-btn-view"
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                            >
                              View Details
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
                Showing <strong>{startIndex + 1}–{endIndex}</strong> of <strong>{totalFiltered}</strong> orders
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
                  aria-label="Orders per page"
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
            <span>Showing {totalFiltered > 0 ? `${startIndex + 1}–${endIndex}` : 0} of {totalFiltered} filtered ({orders.length} total) orders</span>
          </div>
        </section>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="saas-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOrder(null);
            }
          }}
        >
          <section
            className="saas-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="saas-order-title"
          >
            {/* Modal Header */}
            <div className="saas-modal-header">
              <div>
                <div className="saas-modal-header-badges">
                  <span className="saas-modal-id-badge">Order #{formatOrderId(selectedOrder.id)}</span>
                  <span
                    className={`saas-modal-status-badge ${
                      String(selectedOrder.status || "pending").toLowerCase() ===
                      "delivered"
                        ? "delivered"
                        : "pending"
                    }`}
                  >
                    {String(selectedOrder.status || "pending").toUpperCase()}
                  </span>
                </div>
                <h2 className="saas-modal-title" id="saas-order-title">
                  Order Details #{formatOrderId(selectedOrder.id)}
                </h2>
                <p className="saas-modal-sub">
                  Placed on {formatDate(selectedOrder.created_at)}
                </p>
              </div>
              <button
                className="saas-modal-close"
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="saas-modal-body">
              {/* SECTION 1: Products Ordered (Primary Request) */}
              <div className="saas-modal-section">
                <div className="saas-section-header">
                  <div className="saas-section-title-wrap">
                    <ShoppingBag size={16} className="saas-section-icon" />
                    <h3 className="saas-section-title">Products Ordered</h3>
                  </div>
                  <div className="saas-section-stats-wrap">
                    <span className="saas-items-total-pill">
                      <Package size={12} />
                      <strong>
                        {selectedOrder.total_items ||
                          (selectedOrder.items && selectedOrder.items.length > 0
                            ? selectedOrder.items.reduce((s, i) => s + (Number(i.quantity) || 1), 0)
                            : 1)}
                      </strong>{" "}
                      items purchased
                    </span>
                    {selectedOrder.items && selectedOrder.items.length > 0 && (
                      <span className="saas-unique-pill">
                        {selectedOrder.items.length} {selectedOrder.items.length === 1 ? "product" : "products"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="saas-ordered-products-list">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={item.id || idx} className="saas-product-row">
                        <div className="saas-product-thumb-container">
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="saas-product-thumb-img"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.parentElement?.classList.add("fallback-shown");
                              }}
                            />
                          ) : null}
                          <div className="saas-product-thumb-fallback">
                            <Package size={18} />
                          </div>
                          <span className="saas-product-qty-overlay">
                            {item.quantity}×
                          </span>
                        </div>

                        <div className="saas-product-details">
                          <div className="saas-product-name" title={item.product_name}>
                            {item.product_name}
                          </div>
                          <div className="saas-product-meta-row">
                            <span className="saas-product-unit-price">
                              Price: {currency(item.unit_price)}
                            </span>
                            <span className="saas-product-meta-divider">•</span>
                            <span className="saas-product-qty-tag">
                              Qty: <strong>{item.quantity}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="saas-product-line-total">
                          <span className="saas-line-total-label">Subtotal</span>
                          <span className="saas-line-total-amount">
                            {currency(item.line_total || item.quantity * item.unit_price)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="saas-items-empty">
                      <p>Standard order item details</p>
                      <span>Total Value: {currency(selectedOrder.total)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: Customer & Delivery Info */}
              <div className="saas-modal-section">
                <div className="saas-section-header">
                  <div className="saas-section-title-wrap">
                    <User size={16} className="saas-section-icon" />
                    <h3 className="saas-section-title">Customer & Delivery Info</h3>
                  </div>
                </div>

                <div className="saas-info-grid">
                  <div className="saas-info-item">
                    <span className="saas-info-label">Customer Name</span>
                    <span className="saas-info-val">
                      {selectedOrder.customer_name || "—"}
                    </span>
                  </div>

                  <div className="saas-info-item">
                    <span className="saas-info-label">Email Address</span>
                    <span className="saas-info-val">
                      {selectedOrder.email || "—"}
                    </span>
                  </div>

                  <div className="saas-info-item">
                    <span className="saas-info-label">Contact Phone</span>
                    <span className="saas-info-val">
                      {selectedOrder.phone ? (
                        <span className="saas-val-with-icon">
                          <Phone size={13} style={{ color: "#2563eb" }} />
                          {selectedOrder.phone}
                        </span>
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>

                  <div className="saas-info-item full">
                    <span className="saas-info-label">Delivery Address</span>
                    <span className="saas-info-val address">
                      {selectedOrder.address ? (
                        <span className="saas-address-content">
                          <MapPin size={15} className="saas-map-pin" />
                          <span>{selectedOrder.address}</span>
                        </span>
                      ) : (
                        "No delivery address recorded."
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Payment & Financial Summary */}
              <div className="saas-modal-section">
                <div className="saas-section-header">
                  <div className="saas-section-title-wrap">
                    <CreditCard size={16} className="saas-section-icon" />
                    <h3 className="saas-section-title">Payment & Summary</h3>
                  </div>
                </div>

                <div className="saas-summary-box">
                  <div className="saas-summary-row">
                    <span className="saas-summary-label">Payment Method</span>
                    <span className="saas-summary-val">
                      <span
                        className="saas-payment-badge"
                        style={{
                          background:
                            selectedOrder.payment_method === "upi"
                              ? "rgba(16, 185, 129, 0.15)"
                              : selectedOrder.payment_method === "card"
                              ? "rgba(59, 130, 246, 0.15)"
                              : "rgba(245, 158, 11, 0.15)",
                          color:
                            selectedOrder.payment_method === "upi"
                              ? "#10b981"
                              : selectedOrder.payment_method === "card"
                              ? "#60a5fa"
                              : "#f59e0b",
                          border: `1px solid ${
                            selectedOrder.payment_method === "upi"
                              ? "rgba(16, 185, 129, 0.3)"
                              : selectedOrder.payment_method === "card"
                              ? "rgba(59, 130, 246, 0.3)"
                              : "rgba(245, 158, 11, 0.3)"
                          }`,
                        }}
                      >
                        {selectedOrder.payment_method ? selectedOrder.payment_method.toUpperCase() : "COD"}
                      </span>
                      <span className="saas-payment-subtext">
                        ({selectedOrder.payment_status === "completed" ? "Paid" : "Pay on Delivery"})
                      </span>
                    </span>
                  </div>

                  <div className="saas-summary-row">
                    <span className="saas-summary-label">Fulfillment Status</span>
                    <span className="saas-summary-val">
                      <select
                        className={`saas-status-select ${
                          String(selectedOrder.status || "pending").toLowerCase() === "delivered"
                            ? "delivered"
                            : "pending"
                        }`}
                        value={String(selectedOrder.status || "pending").toLowerCase()}
                        disabled={updatingId === selectedOrder.id}
                        onChange={(e) => updateStatus(selectedOrder, e.target.value)}
                        aria-label="Update fulfillment status"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </span>
                  </div>

                  <div className="saas-summary-divider" />

                  <div className="saas-summary-row">
                    <span className="saas-summary-label">
                      Items Subtotal (
                      {selectedOrder.total_items ||
                        (selectedOrder.items && selectedOrder.items.length > 0
                          ? selectedOrder.items.reduce((s, i) => s + (Number(i.quantity) || 1), 0)
                          : 1)}{" "}
                      items)
                    </span>
                    <span className="saas-summary-val">
                      {currency(selectedOrder.total)}
                    </span>
                  </div>

                  <div className="saas-summary-row">
                    <span className="saas-summary-label">Standard Shipping</span>
                    <span className="saas-summary-val green-text">FREE</span>
                  </div>

                  <div className="saas-summary-row total-highlight-row">
                    <span className="saas-summary-label total-label">Order Total</span>
                    <span className="saas-summary-val total-amount">
                      {currency(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="saas-modal-footer">
              <button
                className="saas-btn-primary"
                type="button"
                onClick={() => setSelectedOrder(null)}
              >
                Done
              </button>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .saas-orders-page {
          min-height: 100vh;
          padding: 28px 32px 64px;
          background: #f8f9fb;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .saas-orders-container {
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

        .saas-btn-refresh {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          color: #0f172a;
          padding: 9px 18px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .saas-btn-refresh:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        /* 4 Stat Cards Grid */
        .saas-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
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
          color: #2563eb;
          background: #eff6ff;
          padding: 2px 8px;
          border-radius: 9999px;
          border: 1px solid #dbeafe;
        }

        .saas-stat-value {
          font-size: 26px;
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

        .saas-tools-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .saas-search-input {
          width: 290px;
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

        .saas-select-filter {
          height: 38px;
          padding: 0 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 13px;
          color: #0f172a;
          background: #ffffff;
          outline: none;
          cursor: pointer;
        }

        .saas-select-filter:focus {
          border-color: #2563eb;
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

        .saas-order-id-badge {
          font-family: monospace;
          font-size: 12px;
          font-weight: 700;
          color: #2563eb;
          background: #eff6ff;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .saas-customer-cell {
          display: flex;
          flex-direction: column;
        }

        .saas-customer-name {
          font-weight: 600;
          color: #0f172a;
        }

        .saas-customer-email {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 1px;
        }

        .saas-date-text {
          font-size: 12px;
          color: #64748b;
        }

        .saas-price-text {
          font-weight: 700;
          color: #0f172a;
        }

        .saas-status-container {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .saas-status-select {
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          border: 1px solid transparent;
        }

        .saas-status-select.pending {
          background: #eff6ff;
          color: #2563eb;
          border-color: #dbeafe;
        }

        .saas-status-select.delivered {
          background: #ecfdf5;
          color: #059669;
          border-color: #d1fae5;
        }

        .saas-updating-hint {
          font-size: 10px;
          color: #94a3b8;
        }

        .saas-actions-group {
          display: flex;
          justify-content: flex-end;
        }

        .saas-btn-view {
          padding: 6px 14px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #0f172a;
          cursor: pointer;
          transition: background 0.1s ease;
        }

        .saas-btn-view:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
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

        /* Modal */
        .saas-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
        }

        /* Modal Container */
        .saas-modal-card {
          width: 100%;
          max-width: 620px;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid #eef1f6;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.25);
          overflow: hidden;
        }

        .saas-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 16px;
          border-bottom: 1px solid #f1f5f9;
        }

        .saas-modal-header-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .saas-modal-id-badge {
          font-family: monospace;
          font-size: 12px;
          font-weight: 700;
          color: #2563eb;
          background: #eff6ff;
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid #dbeafe;
        }

        .saas-modal-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 3px;
          letter-spacing: -0.3px;
        }

        .saas-modal-sub {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }

        .saas-modal-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          display: grid;
          place-items: center;
          cursor: pointer;
          color: #64748b;
          font-size: 13px;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .saas-modal-close:hover {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
        }

        .saas-modal-body {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px 2px 4px 0;
          margin-top: 4px;
        }

        /* Custom Scrollbar for modal body */
        .saas-modal-body::-webkit-scrollbar {
          width: 6px;
        }
        .saas-modal-body::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 6px;
        }
        .saas-modal-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 6px;
        }
        .saas-modal-body::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Modal Sections */
        .saas-modal-section {
          background: #ffffff;
          border: 1px solid #eef2f6;
          border-radius: 14px;
          padding: 16px;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
        }

        .saas-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .saas-section-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        :global(.saas-section-icon) {
          color: #2563eb;
        }

        .saas-section-title {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .saas-section-stats-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .saas-items-total-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #1d4ed8;
          background: #eff6ff;
          padding: 2px 8px;
          border-radius: 9999px;
          border: 1px solid #dbeafe;
        }

        .saas-unique-pill {
          font-size: 11px;
          font-weight: 500;
          color: #64748b;
          background: #f8fafc;
          padding: 2px 8px;
          border-radius: 9999px;
          border: 1px solid #e2e8f0;
        }

        /* Products List */
        .saas-ordered-products-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .saas-product-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: #f8fafc;
          border: 1px solid #edf2f7;
          border-radius: 10px;
          transition: background 0.12s ease;
        }

        .saas-product-row:hover {
          background: #f1f5f9;
        }

        .saas-product-thumb-container {
          position: relative;
          width: 52px;
          height: 52px;
          min-width: 52px;
          border-radius: 8px;
          overflow: hidden;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
        }

        .saas-product-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .saas-product-thumb-fallback {
          display: none;
          color: #94a3b8;
        }

        .saas-product-thumb-container.fallback-shown .saas-product-thumb-fallback,
        .saas-product-thumb-container:not(:has(.saas-product-thumb-img)) .saas-product-thumb-fallback {
          display: flex;
        }

        .saas-product-qty-overlay {
          position: absolute;
          bottom: 2px;
          right: 2px;
          background: rgba(15, 23, 42, 0.85);
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 4px;
          backdrop-filter: blur(2px);
        }

        .saas-product-details {
          flex: 1;
          min-width: 0;
        }

        .saas-product-name {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }

        .saas-product-meta-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #64748b;
        }

        .saas-product-unit-price {
          color: #475569;
          font-weight: 500;
        }

        .saas-product-meta-divider {
          color: #cbd5e1;
        }

        .saas-product-qty-tag {
          color: #1e293b;
          background: #e2e8f0;
          padding: 1px 7px;
          border-radius: 4px;
          font-size: 11px;
        }

        .saas-product-line-total {
          text-align: right;
          min-width: 80px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .saas-line-total-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 0.5px;
        }

        .saas-line-total-amount {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }

        .saas-items-empty {
          padding: 24px;
          text-align: center;
          background: #f8fafc;
          border-radius: 10px;
          color: #64748b;
          font-size: 13px;
        }

        /* Customer & Delivery Grid */
        .saas-info-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .saas-info-item {
          background: #f8fafc;
          border: 1px solid #edf2f7;
          border-radius: 8px;
          padding: 9px 12px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .saas-info-item.full {
          grid-column: span 2;
        }

        .saas-info-label {
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .saas-info-val {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          word-break: break-word;
        }

        .saas-val-with-icon {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .saas-address-content {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          line-height: 1.4;
          color: #1e293b;
        }

        :global(.saas-map-pin) {
          color: #ef4444;
          min-width: 15px;
          margin-top: 2px;
          flex-shrink: 0;
        }

        /* Financial & Summary Box */
        .saas-summary-box {
          background: #f8fafc;
          border: 1px solid #edf2f7;
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .saas-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .saas-summary-label {
          color: #64748b;
          font-weight: 500;
        }

        .saas-summary-val {
          font-weight: 600;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .saas-payment-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 5px;
          letter-spacing: 0.5px;
        }

        .saas-payment-subtext {
          font-size: 12px;
          color: #94a3b8;
        }

        .saas-summary-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 3px 0;
        }

        .green-text {
          color: #059669;
          font-weight: 700;
        }

        .total-highlight-row {
          padding-top: 4px;
        }

        .total-label {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }

        .total-amount {
          font-size: 17px;
          font-weight: 800;
          color: #2563eb;
        }

        /* Status & Badges */
        .saas-modal-status-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 9999px;
          letter-spacing: 0.5px;
        }

        .saas-modal-status-badge.delivered {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #d1fae5;
        }

        .saas-modal-status-badge.pending {
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #dbeafe;
        }

        .saas-modal-footer {
          display: flex;
          justify-content: flex-end;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .saas-btn-primary {
          padding: 9px 24px;
          background: #0f172a;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .saas-btn-primary:hover {
          background: #1e293b;
        }

        @media (max-width: 900px) {
          .saas-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .saas-stats-grid {
            grid-template-columns: 1fr;
          }

          .saas-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .saas-tools-group {
            flex-direction: column;
          }

          .saas-search-input,
          .saas-select-filter {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}