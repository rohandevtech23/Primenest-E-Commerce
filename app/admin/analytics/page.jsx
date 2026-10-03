"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const number = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredBar, setHoveredBar] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/stats", {
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          router.replace("/admin/login");
          return;
        }

        const data = await response.json();

        if (!response.ok || data.success === false) {
          throw new Error(data.message || "Unable to load analytics.");
        }

        if (active) setStats(data);
      } catch (err) {
        if (active) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAnalytics();

    return () => {
      active = false;
    };
  }, [router]);

  const monthlyRevenue = useMemo(() => {
    const source = stats?.monthlyRevenue;
    if (!Array.isArray(source)) return [];

    return source.map((item) => ({
      month: item.month,
      revenue: Number(item.revenue) || 0,
    }));
  }, [stats]);

  const maxRevenue = Math.max(
    ...monthlyRevenue.map((item) => item.revenue),
    1
  );

  const totalMonthlyRevenue = monthlyRevenue.reduce(
    (sum, item) => sum + item.revenue,
    0
  );

  const orders = Array.isArray(stats?.latestOrders)
    ? stats.latestOrders
    : [];

  const orderStatuses = useMemo(() => {
    const counts = {};

    orders.forEach((order) => {
      const status = String(order.status || "pending").toLowerCase();
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
    }));
  }, [orders]);

  if (loading) {
    return (
      <main className="saas-analytics-page flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="saas-spinner mx-auto" />
          <p className="mt-4 text-sm text-[#64748b]">Loading analytics metrics...</p>
        </div>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className="saas-analytics-page flex items-center justify-center min-h-screen p-5">
        <div className="w-full max-w-md rounded-2xl border border-[#eef1f6] bg-white p-7 text-center shadow-sm">
          <h1 className="text-xl font-bold text-[#0f172a]">
            Analytics unavailable
          </h1>
          <p className="mt-2 text-sm text-[#64748b]">
            {error || "No analytics data was returned."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1e293b]"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="saas-analytics-page">
      <div className="saas-analytics-container">
        {/* Header */}
        <header className="saas-page-header">
          <div>
            <div className="saas-eyebrow">PERFORMANCE REPORTING</div>
            <h1 className="saas-page-title">Analytics</h1>
            <p className="saas-page-subtitle">
              Monitor store sales velocity, volume trends, and fulfillment efficiency.
            </p>
          </div>

          <div className="saas-header-actions">
            <a
              href="/api/admin/reports/export"
              className="saas-btn-export"
            >
              ↓ Export Orders CSV
            </a>
          </div>
        </header>

        {/* 4 Key Metric Cards */}
        <section className="saas-stats-grid">
          <div className="saas-stat-card">
            <div className="saas-stat-top">
              <span className="saas-stat-label">Total Sales</span>
              <span
                className={`saas-trend-badge ${
                  stats.revenueGrowth?.isPositive === false
                    ? "negative"
                    : stats.revenueGrowth?.percentage === 0
                    ? "neutral"
                    : ""
                }`}
              >
                {stats.revenueGrowth?.isPositive === false
                  ? "↘ "
                  : stats.revenueGrowth?.percentage === 0
                  ? "→ "
                  : "↗ "}
                {stats.revenueGrowth?.value || "+0%"}
              </span>
            </div>
            <div className="saas-stat-value">{currency(stats.totalSales)}</div>
            <div className="saas-stat-sub">Recorded store order revenue</div>
          </div>

          <div className="saas-stat-card">
            <div className="saas-stat-top">
              <span className="saas-stat-label">Total Orders</span>
              <span
                className={`saas-trend-badge ${
                  stats.orderGrowth?.isPositive === false
                    ? "negative"
                    : stats.orderGrowth?.percentage === 0
                    ? "neutral"
                    : ""
                }`}
              >
                {stats.orderGrowth?.isPositive === false
                  ? "↘ "
                  : stats.orderGrowth?.percentage === 0
                  ? "→ "
                  : "↗ "}
                {stats.orderGrowth?.value || "+0%"}
              </span>
            </div>
            <div className="saas-stat-value">{number(stats.orderCount)}</div>
            <div className="saas-stat-sub">All-time customer checkouts</div>
          </div>

          <div className="saas-stat-card">
            <div className="saas-stat-top">
              <span className="saas-stat-label">Registered Customers</span>
              <span
                className={`saas-trend-badge ${
                  stats.customerGrowth?.isPositive === false
                    ? "negative"
                    : stats.customerGrowth?.percentage === 0
                    ? "neutral"
                    : ""
                }`}
              >
                {stats.customerGrowth?.isPositive === false
                  ? "↘ "
                  : stats.customerGrowth?.percentage === 0
                  ? "→ "
                  : "↗ "}
                {stats.customerGrowth?.value || "+0%"}
              </span>
            </div>
            <div className="saas-stat-value">{number(stats.userCount)}</div>
            <div className="saas-stat-sub">Verified shopping accounts</div>
          </div>

          <div className="saas-stat-card">
            <div className="saas-stat-top">
              <span className="saas-stat-label">Live Catalog</span>
              <span
                className={`saas-trend-badge ${
                  stats.catalogRate?.isPositive === false ? "negative" : ""
                }`}
              >
                {stats.catalogRate?.inStockCount === stats.catalogRate?.totalCount
                  ? "✓ "
                  : "↗ "}
                {stats.catalogRate?.value
                  ? `${stats.catalogRate.value} in stock`
                  : `${stats.catalogRate?.percentage || 100}% in stock`}
              </span>
            </div>
            <div className="saas-stat-value">{number(stats.productCount)}</div>
            <div className="saas-stat-sub">
              {stats.catalogRate?.inStockCount != null
                ? `${stats.catalogRate.inStockCount} of ${stats.productCount} in stock`
                : "Active merchandise products"}
            </div>
          </div>
        </section>

        {/* Monthly Revenue Chart Card matching the uploaded SaaS image */}
        <section className="saas-chart-card">
          <div className="saas-chart-header">
            <div>
              <div className="saas-eyebrow">REVENUE OVERVIEW</div>
              <h2 className="saas-card-heading">Monthly Revenue</h2>
              <p className="saas-card-sub">Revenue trend for the current calendar cycle</p>
            </div>

            <div className="saas-chart-total-pill">
              <span className="saas-pill-label">Total Revenue</span>
              <strong className="saas-pill-value">{currency(totalMonthlyRevenue || stats.totalSales)}</strong>
            </div>
          </div>

          {monthlyRevenue.length > 0 ? (
            <div className="saas-chart-body">
              <div className="saas-bars-container">
                {monthlyRevenue.map((item, index) => {
                  const isPeak = item.revenue === maxRevenue && item.revenue > 0;
                  const height =
                    item.revenue > 0
                      ? Math.max((item.revenue / maxRevenue) * 100, 8)
                      : 4;

                  return (
                    <div
                      key={`${item.month}-${index}`}
                      className="saas-bar-col"
                      onMouseEnter={() => setHoveredBar(item)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Bar Track */}
                      <div className="saas-bar-track">
                        <div
                          className={`saas-bar-fill ${isPeak ? "peak" : ""}`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="saas-bar-label">{item.month}</span>
                    </div>
                  );
                })}
              </div>

              {/* Chart Legend */}
              <div className="saas-chart-legend">
                <div className="saas-legend-item">
                  <span className="saas-legend-dot blue" />
                  <span>Peak Month</span>
                </div>
                <div className="saas-legend-item">
                  <span className="saas-legend-dot ice" />
                  <span>Standard Month</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="saas-empty-chart">
              No monthly sales data recorded yet.
            </div>
          )}
        </section>

        {/* Bottom Split: Order Activity & Recent Orders Table */}
        <section className="saas-split-grid">
          {/* Status Breakdown */}
          <div className="saas-card saas-activity-card">
            <div className="saas-card-header">
              <h3 className="saas-card-heading">Order Statuses</h3>
              <span className="saas-count-pill">{orders.length} latest</span>
            </div>

            {orderStatuses.length > 0 ? (
              <div className="saas-status-list">
                {orderStatuses.map(({ status, count }) => {
                  const isDelivered = status === "delivered";
                  const pct = Math.round((count / orders.length) * 100);

                  return (
                    <div key={status} className="saas-status-item">
                      <div className="saas-status-meta">
                        <span className="saas-status-name">{status}</span>
                        <span className="saas-status-count">{count} orders ({pct}%)</span>
                      </div>
                      <div className="saas-progress-track">
                        <div
                          className={`saas-progress-fill ${isDelivered ? "delivered" : "pending"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="saas-empty-sub">No recent order data available.</div>
            )}
          </div>

          {/* Recent Orders List */}
          <div className="saas-card saas-orders-preview-card">
            <div className="saas-card-header">
              <div>
                <h3 className="saas-card-heading">Recent Transactions</h3>
                <span className="saas-card-sub">Latest customer order entries</span>
              </div>
              <Link href="/admin/orders" className="saas-link-all">
                All Orders →
              </Link>
            </div>

            {orders.length > 0 ? (
              <div className="saas-table-wrapper">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td>
                          <span className="saas-order-id-badge">#{order.id}</span>
                        </td>
                        <td>
                          <span className="saas-cust-name">{order.customer_name || "Customer"}</span>
                        </td>
                        <td>
                          <span className="saas-price-text">{currency(order.total)}</span>
                        </td>
                        <td>
                          <span
                            className={`saas-status-pill ${
                              String(order.status || "pending").toLowerCase() === "delivered"
                                ? "delivered"
                                : "pending"
                            }`}
                          >
                            {order.status || "pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="saas-empty-sub">No recent orders to display.</div>
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        .saas-analytics-page {
          min-height: 100vh;
          padding: 28px 32px 64px;
          background: #f8f9fb;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .saas-analytics-container {
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

        .saas-btn-export {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #0f172a;
          color: #ffffff;
          padding: 10px 20px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s ease;
        }

        .saas-btn-export:hover {
          background: #1e293b;
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
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 700;
          color: #059669;
          background: #ecfdf5;
          padding: 2px 8px;
          border-radius: 9999px;
          border: 1px solid #d1fae5;
          letter-spacing: 0.2px;
          transition: all 0.15s ease;
        }

        .saas-trend-badge.negative {
          color: #dc2626;
          background: #fef2f2;
          border-color: #fee2e2;
        }

        .saas-trend-badge.neutral {
          color: #475569;
          background: #f1f5f9;
          border-color: #e2e8f0;
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

        /* Chart Card */
        .saas-chart-card {
          background: #ffffff;
          border: 1px solid #eef1f6;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .saas-chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
        }

        .saas-card-heading {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .saas-card-sub {
          font-size: 12px;
          color: #64748b;
          margin: 2px 0 0;
        }

        .saas-chart-total-pill {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          padding: 8px 16px;
          border-radius: 12px;
        }

        .saas-pill-label {
          font-size: 11px;
          font-weight: 600;
          color: #2563eb;
        }

        .saas-pill-value {
          font-size: 18px;
          font-weight: 800;
          color: #1e40af;
        }

        .saas-chart-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .saas-bars-container {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          height: 220px;
          padding: 20px 10px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .saas-bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;
          gap: 8px;
        }

        .saas-bar-track {
          width: 100%;
          max-width: 52px;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .saas-bar-fill {
          width: 100%;
          border-radius: 8px 8px 0 0;
          background: #dbeafe;
          transition: height 0.3s ease, background 0.15s ease;
        }

        .saas-bar-fill:hover {
          background: #bfdbfe;
        }

        .saas-bar-fill.peak {
          background: #2563eb;
        }

        .saas-bar-label {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          white-space: nowrap;
        }

        .saas-chart-legend {
          display: flex;
          align-items: center;
          gap: 18px;
          padding-top: 8px;
        }

        .saas-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #64748b;
        }

        .saas-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .saas-legend-dot.blue {
          background: #2563eb;
        }

        .saas-legend-dot.ice {
          background: #dbeafe;
        }

        .saas-empty-chart {
          padding: 40px;
          text-align: center;
          color: #94a3b8;
          font-size: 13px;
        }

        /* Split Grid */
        .saas-split-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 18px;
        }

        .saas-card {
          background: #ffffff;
          border: 1px solid #eef1f6;
          border-radius: 16px;
          padding: 22px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .saas-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
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

        .saas-link-all {
          font-size: 12px;
          font-weight: 600;
          color: #2563eb;
          text-decoration: none;
        }

        .saas-status-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .saas-status-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .saas-status-meta {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        .saas-status-name {
          font-weight: 600;
          color: #0f172a;
          text-transform: capitalize;
        }

        .saas-status-count {
          color: #64748b;
          font-size: 12px;
        }

        .saas-progress-track {
          height: 8px;
          background: #f1f5f9;
          border-radius: 9999px;
          overflow: hidden;
        }

        .saas-progress-fill {
          height: 100%;
          border-radius: 9999px;
        }

        .saas-progress-fill.delivered {
          background: #10b981;
        }

        .saas-progress-fill.pending {
          background: #2563eb;
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
          padding: 10px 14px;
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #f1f5f9;
        }

        .saas-table td {
          padding: 12px 14px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 13px;
        }

        .saas-order-id-badge {
          font-family: monospace;
          font-size: 11px;
          font-weight: 700;
          color: #2563eb;
          background: #eff6ff;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .saas-cust-name {
          font-weight: 600;
          color: #0f172a;
        }

        .saas-price-text {
          font-weight: 700;
          color: #0f172a;
        }

        .saas-status-pill {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 9999px;
        }

        .saas-status-pill.delivered {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #d1fae5;
        }

        .saas-status-pill.pending {
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #dbeafe;
        }

        .saas-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e2e8f0;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .saas-empty-sub {
          padding: 20px;
          text-align: center;
          color: #94a3b8;
          font-size: 12px;
        }

        @media (max-width: 900px) {
          .saas-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .saas-split-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .saas-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}