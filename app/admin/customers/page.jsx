"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export default function AdminCustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    let active = true;

    async function fetchCustomers() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/customers", {
          method: "GET",
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          router.replace("/admin/login");
          return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load customers.");
        }

        if (active) {
          setCustomers(Array.isArray(data.customers) ? data.customers : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchCustomers();

    return () => {
      active = false;
    };
  }, [router]);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return customers;

    return customers.filter((customer) =>
      [customer.name, customer.email, String(customer.id)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [customers, search]);

  const totalFiltered = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFiltered);
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

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

  const totalOrders = customers.reduce(
    (sum, customer) => sum + Number(customer.order_count || 0),
    0
  );

  const totalRevenue = customers.reduce(
    (sum, customer) => sum + Number(customer.total_spent || 0),
    0
  );

  const averageSpend =
    customers.length > 0 ? totalRevenue / customers.length : 0;

  return (
    <main className="saas-customers-page">
      <div className="saas-customers-container">
        {/* Header */}
        <header className="saas-page-header">
          <div>
            <div className="saas-eyebrow">AUDIENCE MANAGEMENT</div>
            <h1 className="saas-page-title">Customers</h1>
            <p className="saas-page-subtitle">
              View your registered buyer accounts, purchase histories, and total lifetime spend.
            </p>
          </div>
        </header>

        {/* 4 Statistics Cards */}
        <section className="saas-stats-grid">
          <div className="saas-stat-card">
            <div className="saas-stat-top">
              <span className="saas-stat-label">Total Customers</span>
              <span className="saas-trend-badge">↗ Active</span>
            </div>
            <div className="saas-stat-value">
              {customers.length.toLocaleString("en-IN")}
            </div>
            <div className="saas-stat-sub">Registered store user accounts</div>
          </div>

          <div className="saas-stat-card">
            <div className="saas-stat-top">
              <span className="saas-stat-label">Total Orders</span>
              <span className="saas-trend-badge">📦 Orders</span>
            </div>
            <div className="saas-stat-value">
              {totalOrders.toLocaleString("en-IN")}
            </div>
            <div className="saas-stat-sub">Cumulative checkouts placed</div>
          </div>

          <div className="saas-stat-card">
            <div className="saas-stat-top">
              <span className="saas-stat-label">Gross Order Value</span>
              <span className="saas-trend-badge">₹ Spend</span>
            </div>
            <div className="saas-stat-value">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="saas-stat-sub">Total revenue from all customers</div>
          </div>

          <div className="saas-stat-card">
            <div className="saas-stat-top">
              <span className="saas-stat-label">Average Spend</span>
              <span className="saas-alert-badge">Avg / User</span>
            </div>
            <div className="saas-stat-value">
              {formatCurrency(averageSpend)}
            </div>
            <div className="saas-stat-sub">Per registered customer account</div>
          </div>
        </section>

        {/* Customer Directory Table Card */}
        <section className="saas-table-card">
          <div className="saas-toolbar">
            <div className="saas-toolbar-title-wrap">
              <h2 className="saas-card-heading">Customer Directory</h2>
              <span className="saas-count-pill">{filteredCustomers.length} registered</span>
            </div>

            <div className="saas-search-wrap">
              <input
                className="saas-search-input"
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search customers by name, email, or user ID..."
                aria-label="Search customers"
              />
            </div>
          </div>

          {error && (
            <div className="saas-error-box">
              <p className="saas-error-title">Could not load customers</p>
              <p className="saas-error-desc">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="saas-btn-retry"
              >
                Try Again
              </button>
            </div>
          )}

          {loading ? (
            <div className="saas-loading-state">
              <div className="saas-spinner" />
              <span>Loading customer records...</span>
            </div>
          ) : !error && filteredCustomers.length === 0 ? (
            <div className="saas-empty-state">
              <p className="saas-empty-title">
                {search ? "No matching customers found" : "No customers registered yet"}
              </p>
              <p className="saas-empty-desc">
                {search
                  ? "Try searching with a different name or email address."
                  : "Customer accounts will automatically populate here when users register."}
              </p>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="saas-btn-clear"
                >
                  Clear search query
                </button>
              )}
            </div>
          ) : !error ? (
            <div className="saas-table-wrapper">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>User ID</th>
                    <th>Total Orders</th>
                    <th>Total Spend</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedCustomers.map((customer) => {
                    const initial = (customer.name || customer.email || "C")
                      .trim()
                      .charAt(0)
                      .toUpperCase();

                    return (
                      <tr key={customer.id}>
                        <td>
                          <div className="saas-customer-cell">
                            <div className="saas-customer-avatar">
                              <span>{initial}</span>
                            </div>
                            <div className="saas-customer-meta">
                              <span className="saas-customer-name">
                                {customer.name || "Customer"}
                              </span>
                              <span className="saas-customer-email">
                                {customer.email || "No email on record"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="saas-id-badge">#{customer.id}</span>
                        </td>

                        <td>
                          <span className="saas-order-pill">
                            {Number(customer.order_count || 0)} orders
                          </span>
                        </td>

                        <td>
                          <span className="saas-price-text">
                            {formatCurrency(customer.total_spent)}
                          </span>
                        </td>

                        <td>
                          <div className="saas-actions-group">
                            <button
                              type="button"
                              onClick={() => setSelectedCustomer(customer)}
                              className="saas-btn-view"
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
          ) : null}

          {/* Admin SaaS Pagination Bar */}
          {totalPages > 1 && (
            <div className="saas-pagination-bar">
              <div className="saas-pagination-info">
                Showing <strong>{startIndex + 1}–{endIndex}</strong> of <strong>{totalFiltered}</strong> customers
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
                  aria-label="Customers per page"
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
            <span>Customer database records from PrimeNest PostgreSQL</span>
            <span>Showing {totalFiltered > 0 ? `${startIndex + 1}–${endIndex}` : 0} of {totalFiltered} filtered ({customers.length} total)</span>
          </div>
        </section>
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div
          className="saas-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedCustomer(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-modal-title"
            className="saas-modal-card"
          >
            <div className="saas-modal-header">
              <div>
                <h2 className="saas-modal-title" id="customer-modal-title">
                  Customer Profile
                </h2>
                <p className="saas-modal-sub">
                  Account overview and linked order statistics
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                aria-label="Close dialog"
                className="saas-modal-close"
              >
                ✕
              </button>
            </div>

            <div className="saas-profile-top">
              <div className="saas-profile-avatar">
                {(selectedCustomer.name || selectedCustomer.email || "C")
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="saas-profile-info">
                <h3 className="saas-profile-name">
                  {selectedCustomer.name || "Customer"}
                </h3>
                <p className="saas-profile-email">
                  {selectedCustomer.email || "No email on record"}
                </p>
              </div>
            </div>

            <div className="saas-profile-grid">
              <div className="saas-detail-tile">
                <span className="saas-tile-label">Account ID</span>
                <span className="saas-tile-value">#{selectedCustomer.id}</span>
              </div>
              <div className="saas-detail-tile">
                <span className="saas-tile-label">Linked Orders</span>
                <span className="saas-tile-value">
                  {Number(selectedCustomer.order_count || 0)}
                </span>
              </div>
              <div className="saas-detail-tile full">
                <span className="saas-tile-label">Lifetime Order Value</span>
                <span className="saas-tile-value highlight">
                  {formatCurrency(selectedCustomer.total_spent)}
                </span>
              </div>
            </div>

            <div className="saas-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="saas-btn-primary"
              >
                Done
              </button>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .saas-customers-page {
          min-height: 100vh;
          padding: 28px 32px 64px;
          background: #f8f9fb;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .saas-customers-container {
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

        /* 4 Stat Cards */
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

        .saas-customer-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .saas-customer-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #dbeafe;
          display: grid;
          place-items: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }

        .saas-customer-meta {
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

        .saas-id-badge {
          font-family: monospace;
          font-size: 12px;
          color: #64748b;
          background: #f1f5f9;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .saas-order-pill {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          color: #2563eb;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          padding: 3px 9px;
          border-radius: 9999px;
        }

        .saas-price-text {
          font-weight: 700;
          color: #0f172a;
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
          display: flex;
          justify-content: space-between;
          align-items: center;
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

        .saas-btn-clear {
          margin-top: 12px;
          background: none;
          border: none;
          color: #2563eb;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }

        .saas-error-box {
          margin: 20px 24px;
          padding: 16px;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 12px;
        }

        .saas-error-title {
          font-size: 13px;
          font-weight: 700;
          color: #b91c1c;
        }

        .saas-error-desc {
          font-size: 12px;
          color: #dc2626;
          margin: 4px 0 10px;
        }

        .saas-btn-retry {
          padding: 6px 14px;
          background: #dc2626;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
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

        .saas-modal-card {
          width: 100%;
          max-width: 480px;
          background: #ffffff;
          border: 1px solid #eef1f6;
          border-radius: 20px;
          padding: 26px;
          box-shadow: 0 20px 50px -10px rgba(15, 23, 42, 0.2);
        }

        .saas-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .saas-modal-title {
          font-size: 19px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px;
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
          transition: background 0.1s ease;
        }

        .saas-modal-close:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .saas-profile-top {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-bottom: 18px;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 16px;
        }

        .saas-profile-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #eff6ff;
          color: #2563eb;
          border: 2px solid #dbeafe;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 20px;
        }

        .saas-profile-name {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 2px;
        }

        .saas-profile-email {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }

        .saas-profile-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .saas-detail-tile {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .saas-detail-tile.full {
          grid-column: 1 / -1;
        }

        .saas-tile-label {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
        }

        .saas-tile-value {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }

        .saas-tile-value.highlight {
          font-size: 18px;
          color: #2563eb;
        }

        .saas-modal-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 22px;
        }

        .saas-btn-primary {
          padding: 9px 22px;
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

          .saas-search-input {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}