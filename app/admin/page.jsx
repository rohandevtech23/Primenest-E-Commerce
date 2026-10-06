"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Calendar,
  Bell,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Filter,
  Check,
  RotateCcw,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
} from "lucide-react";

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const defaultDaysOfWeek = [
  { day: "Monday", short: "Mon", revenue: 0, orderCount: 0, isPeak: false, pct: "0%" },
  { day: "Tuesday", short: "Tue", revenue: 0, orderCount: 0, isPeak: false, pct: "0%" },
  { day: "Wednesday", short: "Wed", revenue: 0, orderCount: 0, isPeak: false, pct: "0%" },
  { day: "Thursday", short: "Thu", revenue: 0, orderCount: 0, isPeak: false, pct: "0%" },
  { day: "Friday", short: "Fri", revenue: 0, orderCount: 0, isPeak: false, pct: "0%" },
  { day: "Saturday", short: "Sat", revenue: 0, orderCount: 0, isPeak: false, pct: "0%" },
  { day: "Sunday", short: "Sun", revenue: 0, orderCount: 0, isPeak: false, pct: "0%" },
];

function generateBezierCurve(pts) {
  if (!pts || pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

  let path = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i > 0 ? pts[i - 1] : pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return path;
}

export default function AdminPage() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("orders");
  const [selectedDay, setSelectedDay] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);

  // Custom Chart Date Range States
  const [period, setPeriod] = useState("week"); // "week", "last7", "thisMonth", "last30", "custom"
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const dateDropdownRef = useRef(null);

  // Close date dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target)) {
        setShowDateDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchStats(selectedPeriod = period, start = customStartDate, end = customEndDate) {
    setChartLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedPeriod === "custom" && start && end) {
        params.set("startDate", start);
        params.set("endDate", end);
      } else {
        params.set("period", selectedPeriod);
      }

      const response = await fetch(`/api/admin/stats?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch stats.");
      }

      setDashboard(data.stats ? data : { ...data, stats: data });
      setSelectedDay(null);
      setError("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setChartLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function initialLoad() {
      try {
        const response = await fetch("/api/admin/stats", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (response.status === 401 || response.status === 403) {
          router.replace("/admin/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load dashboard.");
        }

        if (active) {
          setDashboard(data.stats ? data : { ...data, stats: data });
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      active = false;
    };
  }, [router]);

  function handlePeriodSelect(newPeriod) {
    setPeriod(newPeriod);
    setShowDateDropdown(false);
    fetchStats(newPeriod);
  }

  function handleApplyCustomDate() {
    if (!customStartDate || !customEndDate) return;
    setPeriod("custom");
    setShowDateDropdown(false);
    fetchStats("custom", customStartDate, customEndDate);
  }

  const totalSales = Number(dashboard?.stats?.totalSales ?? 0);
  const userCount = Number(dashboard?.stats?.userCount ?? 0);
  const productCount = Number(dashboard?.stats?.productCount ?? 0);
  const orderCount = Number(dashboard?.stats?.orderCount ?? 0);
  const latestOrders = dashboard?.stats?.latestOrders ?? [];

  const chartData =
    dashboard?.stats?.chartData ||
    dashboard?.chartData ||
    dashboard?.stats?.weeklySales ||
    dashboard?.weeklySales ||
    defaultDaysOfWeek;

  const chartMeta = dashboard?.stats?.chartMeta || dashboard?.chartMeta || null;

  const revenueGrowth = dashboard?.stats?.revenueGrowth || dashboard?.revenueGrowth || {
    value: "+100%",
    percentage: 100,
    isPositive: true,
  };
  const customerGrowth = dashboard?.stats?.customerGrowth || dashboard?.customerGrowth || {
    value: "+100%",
    percentage: 100,
    isPositive: true,
  };
  const catalogRate = dashboard?.stats?.catalogRate || dashboard?.catalogRate || {
    value: "100%",
    percentage: 100,
    isPositive: true,
    inStockCount: productCount,
  };

  const periodLabel =
    period === "week"
      ? "This week"
      : period === "last7"
      ? "Last 7 days"
      : period === "thisMonth"
      ? "This month"
      : period === "last30"
      ? "Last 30 days"
      : period === "custom" && customStartDate && customEndDate
      ? `${customStartDate.slice(5)} to ${customEndDate.slice(5)}`
      : "Custom Range";

  const activeDay =
    hoveredDay ||
    selectedDay ||
    chartData.find((d) => d.isPeak) ||
    chartData[chartData.length - 1] ||
    defaultDaysOfWeek[0];

  const maxRevenue = Math.max(...chartData.map((d) => Number(d.revenue) || 0), 1000);
  const gridCeiling = Math.ceil((maxRevenue * 1.25) / 1000) * 1000;

  const numPoints = chartData.length;
  const chartPoints = chartData.map((item, index) => {
    const x = 55 + index * (630 / (numPoints - 1 || 1));
    const ratio = gridCeiling > 0 ? (Number(item.revenue) || 0) / gridCeiling : 0;
    const y = 160 - ratio * 135;
    return { ...item, index, x, y };
  });

  const activePoint =
    chartPoints.find((p) => (p.date && activeDay?.date ? p.date === activeDay.date : p.day === activeDay?.day)) ||
    chartPoints[chartPoints.length - 1];

  const curveD = generateBezierCurve(chartPoints);
  const areaD =
    chartPoints.length > 0
      ? `${curveD} L ${chartPoints[chartPoints.length - 1].x} 160 L ${chartPoints[0].x} 160 Z`
      : "";

  return (
    <main className="saas-admin-container">
      {/* Top Navbar / Header Bar */}
      <header className="saas-overview-header">
        {/* Top category navigation breadcrumb row */}
        <div className="saas-nav-tabs-row">
          <div className="saas-nav-tabs">
            <span className="saas-tab active">
              <LayoutDashboard size={14} className="saas-tab-icon" />
              <span>Overview</span>
            </span>
            <Link href="/admin/products" className="saas-tab">
              <Package size={14} className="saas-tab-icon" />
              <span>Products</span>
            </Link>
            <Link href="/admin/orders" className="saas-tab">
              <ShoppingBag size={14} className="saas-tab-icon" />
              <span>Orders</span>
            </Link>
            <Link href="/admin/customers" className="saas-tab">
              <Users size={14} className="saas-tab-icon" />
              <span>Customers</span>
            </Link>
            <Link href="/admin/analytics" className="saas-tab">
              <BarChart3 size={14} className="saas-tab-icon" />
              <span>Analytics</span>
            </Link>
          </div>

          <div className="saas-header-right">
            {/* Search or ask AI */}
            <div className="saas-search-box">
              <Search size={14} className="saas-search-icon" />
              <input
                type="text"
                placeholder="Search or ask AI..."
                className="saas-search-input"
              />
              <span className="saas-shortcut-badge">⌘K</span>
            </div>

            {/* Actions */}
            <Link href="/api/admin/reports/export" className="saas-btn-outline">
              Export
            </Link>

            <button type="button" className="saas-btn-icon" title="Notifications">
              <Bell size={16} />
              <span className="saas-notification-dot" />
            </button>

            <div className="saas-user-avatar" title="Admin">
              <span>AD</span>
            </div>
          </div>
        </div>

        {/* Title row */}
        <div className="saas-title-row">
          <div className="saas-title-left">
            <h1 className="saas-page-title">Overview</h1>
          </div>

          <div className="saas-title-actions">
            <button type="button" className="saas-btn-action">
              <SlidersHorizontal size={14} />
              <span>Customize</span>
            </button>

            <button
              type="button"
              className="saas-btn-action"
              onClick={() => setShowDateDropdown((prev) => !prev)}
            >
              <Calendar size={14} />
              <span>{periodLabel}</span>
              <ChevronDown size={13} className={showDateDropdown ? "saas-rotate-180" : ""} />
            </button>

            <button
              type="button"
              className="saas-btn-icon-square"
              title="Reset to This Week"
              onClick={() => handlePeriodSelect("week")}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="saas-grid-body">
        {/* LEFT COLUMN: Metric Cards + Dynamic Chart */}
        <section className="saas-main-col">
          {/* 3 Metric Cards */}
          <div className="saas-metrics-row">
            {/* Total Revenue */}
            <div className="saas-metric-card">
              <span className="saas-metric-label">Total Revenue</span>
              <div className="saas-metric-val-row">
                <span className="saas-metric-value">{currency(totalSales)}</span>
                <span className={revenueGrowth.isPositive ? "saas-badge-green" : "saas-badge-red"}>
                  {revenueGrowth.isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {revenueGrowth.value}
                </span>
              </div>
              <span className="saas-metric-sub">
                {orderCount > 0 ? `${orderCount} orders processed` : "All-time revenue"}
              </span>
            </div>

            {/* Customers */}
            <div className="saas-metric-card">
              <span className="saas-metric-label">Customers</span>
              <div className="saas-metric-val-row">
                <span className="saas-metric-value">{userCount}</span>
                <span className={customerGrowth.isPositive ? "saas-badge-green" : "saas-badge-red"}>
                  {customerGrowth.isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {customerGrowth.value}
                </span>
              </div>
              <span className="saas-metric-sub">Registered buyers</span>
            </div>

            {/* Live Catalog */}
            <div className="saas-metric-card">
              <span className="saas-metric-label">Live Catalog</span>
              <div className="saas-metric-val-row">
                <span className="saas-metric-value">{productCount}</span>
                <span className={catalogRate.isPositive ? "saas-badge-green" : "saas-badge-amber"}>
                  <TrendingUp size={11} />
                  {catalogRate.value}
                </span>
              </div>
              <span className="saas-metric-sub">
                {catalogRate.inStockCount ?? productCount} in stock &bull; items ready for sale
              </span>
            </div>
          </div>

          {/* SaaS Graph Chart Card with Custom Date Controls */}
          <div className="saas-chart-card">
            <div className="saas-chart-header">
              <div className="saas-chart-header-left">
                <h3 className="saas-card-title">
                  {period === "week"
                    ? "Weekly Sales Performance"
                    : period === "last7"
                    ? "Last 7 Days Sales Performance"
                    : period === "thisMonth"
                    ? "Monthly Sales Performance"
                    : period === "last30"
                    ? "Last 30 Days Sales Performance"
                    : `Sales Performance (${chartMeta?.startDate || customStartDate} – ${chartMeta?.endDate || customEndDate})`}
                </h3>
                <span className="saas-card-subtitle">
                  {chartMeta?.totalPeriodSales !== undefined
                    ? `${currency(chartMeta.totalPeriodSales)} revenue across ${chartMeta.totalPeriodOrders} ${
                        chartMeta.totalPeriodOrders === 1 ? "order" : "orders"
                      } • ${chartMeta?.dayCount || numPoints} days`
                    : "Revenue trend across selected dates"}
                </span>
              </div>

              <div className="saas-chart-header-right">
                {/* Date Range Selector Dropdown */}
                <div className="saas-date-filter-wrapper" ref={dateDropdownRef}>
                  <button
                    type="button"
                    className={`saas-date-filter-btn ${showDateDropdown ? "active" : ""}`}
                    onClick={() => setShowDateDropdown((prev) => !prev)}
                  >
                    <Calendar size={13} className="saas-icon-calendar" />
                    <span>{periodLabel}</span>
                    <ChevronDown
                      size={12}
                      className={`saas-chevron ${showDateDropdown ? "open" : ""}`}
                    />
                  </button>

                  {showDateDropdown && (
                    <div className="saas-date-dropdown-menu">
                      <div className="saas-dropdown-header">Select Date Range</div>
                      <div className="saas-dropdown-presets">
                        <button
                          type="button"
                          className={`saas-preset-item ${period === "week" ? "active" : ""}`}
                          onClick={() => handlePeriodSelect("week")}
                        >
                          <span>This week (Mon – Sun)</span>
                          {period === "week" && <Check size={13} />}
                        </button>
                        <button
                          type="button"
                          className={`saas-preset-item ${period === "last7" ? "active" : ""}`}
                          onClick={() => handlePeriodSelect("last7")}
                        >
                          <span>Last 7 days</span>
                          {period === "last7" && <Check size={13} />}
                        </button>
                        <button
                          type="button"
                          className={`saas-preset-item ${period === "thisMonth" ? "active" : ""}`}
                          onClick={() => handlePeriodSelect("thisMonth")}
                        >
                          <span>This month</span>
                          {period === "thisMonth" && <Check size={13} />}
                        </button>
                        <button
                          type="button"
                          className={`saas-preset-item ${period === "last30" ? "active" : ""}`}
                          onClick={() => handlePeriodSelect("last30")}
                        >
                          <span>Last 30 days</span>
                          {period === "last30" && <Check size={13} />}
                        </button>
                      </div>

                      <div className="saas-dropdown-divider" />

                      {/* Custom Date Inputs */}
                      <div className="saas-dropdown-custom-section">
                        <span className="saas-custom-title">Custom Specific Dates</span>
                        <div className="saas-custom-inputs-row">
                          <div className="saas-custom-input-group">
                            <label>Start Date</label>
                            <input
                              type="date"
                              value={customStartDate}
                              onChange={(e) => setCustomStartDate(e.target.value)}
                              className="saas-date-input"
                            />
                          </div>
                          <div className="saas-custom-input-group">
                            <label>End Date</label>
                            <input
                              type="date"
                              value={customEndDate}
                              onChange={(e) => setCustomEndDate(e.target.value)}
                              className="saas-date-input"
                            />
                          </div>
                        </div>

                        <div className="saas-custom-actions">
                          <button
                            type="button"
                            className="saas-btn-apply"
                            disabled={!customStartDate || !customEndDate}
                            onClick={handleApplyCustomDate}
                          >
                            Apply Custom Dates
                          </button>
                          <button
                            type="button"
                            className="saas-btn-cancel"
                            onClick={() => setShowDateDropdown(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="saas-chart-legend">
                  <span className="saas-legend-dot blue" />
                  <span className="saas-legend-text">Peak Volume</span>
                  <span className="saas-legend-dot light" />
                  <span className="saas-legend-text">Standard Activity</span>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div
              className={`saas-chart-container ${chartLoading ? "loading" : ""}`}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {/* Floating Tooltip Card */}
              {activePoint && (
                <div
                  className="saas-floating-tooltip"
                  style={{
                    left: `${(activePoint.x / 740) * 100}%`,
                  }}
                >
                  <div className="saas-tooltip-top">
                    <span className="saas-tooltip-num">
                      {currency(activePoint.revenue)}
                    </span>
                    <span className="saas-tooltip-pct">
                      {activePoint.pct}
                    </span>
                    {activePoint.isPeak ? (
                      <span className="saas-tooltip-tag peak">Peak</span>
                    ) : (
                      <span className="saas-tooltip-tag">👥 {activePoint.orderCount}</span>
                    )}
                  </div>
                  <span className="saas-tooltip-sub">
                    {activePoint.formattedDate ? `${activePoint.day}, ${activePoint.formattedDate}` : activePoint.day} performance &bull; {activePoint.orderCount} {activePoint.orderCount === 1 ? "order" : "orders"}
                  </span>
                  <div className="saas-tooltip-arrow" />
                </div>
              )}

              {/* SVG Area & Line Curve Graph */}
              <div className="saas-graph-wrapper">
                <svg
                  viewBox="0 0 740 195"
                  className="saas-svg-chart"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient id="salesAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                      <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="salesStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="60%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                    <filter id="salesGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#2563eb" floodOpacity="0.25" />
                    </filter>
                  </defs>

                  {/* Horizontal Grid lines and Y labels */}
                  <g className="saas-grid-lines">
                    {/* Top Line */}
                    <line x1="55" y1="25" x2="685" y2="25" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
                    <text x="45" y="29" textAnchor="end" className="saas-graph-axis-label">
                      ₹{gridCeiling >= 1000 ? `${(gridCeiling / 1000).toFixed(0)}k` : gridCeiling}
                    </text>

                    {/* Mid Line */}
                    <line x1="55" y1="92" x2="685" y2="92" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
                    <text x="45" y="96" textAnchor="end" className="saas-graph-axis-label">
                      ₹{gridCeiling >= 2000 ? `${(gridCeiling / 2000).toFixed(0)}k` : Math.round(gridCeiling / 2)}
                    </text>

                    {/* Baseline */}
                    <line x1="55" y1="160" x2="685" y2="160" stroke="#e2e8f0" strokeWidth="1" />
                    <text x="45" y="164" textAnchor="end" className="saas-graph-axis-label">₹0</text>
                  </g>

                  {/* Vertical cursor guide line */}
                  {activePoint && (
                    <line
                      x1={activePoint.x}
                      y1="20"
                      x2={activePoint.x}
                      y2="160"
                      stroke="#2563eb"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      opacity="0.45"
                    />
                  )}

                  {/* Area fill */}
                  {areaD && (
                    <path
                      d={areaD}
                      fill="url(#salesAreaGradient)"
                      className="saas-area-fill"
                    />
                  )}

                  {/* Line curve */}
                  {curveD && (
                    <path
                      d={curveD}
                      fill="none"
                      stroke="url(#salesStrokeGradient)"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#salesGlow)"
                      className="saas-line-stroke"
                    />
                  )}

                  {/* Data points & X axis labels & hover capture */}
                  {chartPoints.map((pt) => {
                    const isSelected = activePoint?.date
                      ? activePoint.date === pt.date
                      : activePoint?.day === pt.day;

                    const showText =
                      numPoints <= 8 ||
                      (numPoints <= 15 ? pt.index % 2 === 0 : pt.index % Math.ceil(numPoints / 7) === 0) ||
                      pt.index === numPoints - 1;

                    const labelDisplay =
                      numPoints <= 7
                        ? pt.day
                        : pt.formattedDate || pt.short || pt.day;

                    const hitWidth = Math.max(20, Math.min(80, 630 / numPoints));

                    return (
                      <g key={pt.date || pt.day} className="saas-graph-point-group">
                        {/* Invisible interactive column hit rect */}
                        <rect
                          x={pt.x - hitWidth / 2}
                          y="10"
                          width={hitWidth}
                          height="180"
                          fill="transparent"
                          style={{ cursor: "pointer" }}
                          onMouseEnter={() => setHoveredDay(pt)}
                          onClick={() => setSelectedDay(pt)}
                        />

                        {/* Data Circle */}
                        {isSelected ? (
                          <>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="12"
                              fill="rgba(37, 99, 235, 0.16)"
                              className="saas-pulse-ring"
                            />
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="6"
                              fill="#2563eb"
                              stroke="#ffffff"
                              strokeWidth="2.5"
                            />
                          </>
                        ) : pt.isPeak ? (
                          <>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="8"
                              fill="rgba(37, 99, 235, 0.14)"
                            />
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="5"
                              fill="#2563eb"
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                          </>
                        ) : (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="4"
                            fill="#ffffff"
                            stroke="#93c5fd"
                            strokeWidth="2"
                          />
                        )}

                        {/* X-axis Day/Date Label */}
                        {showText && (
                          <text
                            x={pt.x}
                            y="185"
                            textAnchor="middle"
                            className={`saas-graph-day-label ${isSelected ? "active" : ""}`}
                            onClick={() => setSelectedDay(pt)}
                          >
                            {labelDisplay}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom Tabs & Recent Table */}
          <div className="saas-table-card">
            <div className="saas-table-header">
              <div className="saas-table-segmented-tabs">
                <button
                  type="button"
                  className={`saas-seg-tab ${activeTab === "orders" ? "active" : ""}`}
                  onClick={() => setActiveTab("orders")}
                >
                  Orders
                </button>
                <button
                  type="button"
                  className={`saas-seg-tab ${activeTab === "products" ? "active" : ""}`}
                  onClick={() => setActiveTab("products")}
                >
                  Top Categories
                </button>
              </div>

              <Link
                href={activeTab === "orders" ? "/admin/orders" : "/admin/products"}
                className="saas-link-viewall"
              >
                <span>View all</span>
                <ArrowUpRight size={13} className="saas-link-viewall-arrow" />
              </Link>
            </div>

            {activeTab === "orders" ? (
              <div className="saas-table-wrap">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="saas-empty-row">
                          No orders placed yet. Orders will automatically appear here.
                        </td>
                      </tr>
                    ) : (
                      latestOrders.slice(0, 4).map((order) => (
                        <tr key={order.id}>
                          <td className="saas-cell-id">#{order.id}</td>
                          <td className="saas-cell-name">{order.customer_name}</td>
                          <td className="saas-cell-email">{order.email}</td>
                          <td className="saas-cell-amount">
                            ₹{Number(order.total || 0).toLocaleString("en-IN")}
                          </td>
                          <td>
                            <span
                              className={`saas-status-pill ${
                                order.status === "delivered"
                                  ? "delivered"
                                  : "pending"
                              }`}
                            >
                              {order.status || "pending"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="saas-category-pills-list">
                {[
                  { name: "Men's Apparel", count: "10 products", share: "18.5%" },
                  { name: "Women's Collection", count: "10 products", share: "18.5%" },
                  { name: "Accessories & Bags", count: "27 products", share: "12.2%" },
                  { name: "Footwear & Kicks", count: "58 products", share: "26.2%" },
                ].map((cat) => (
                  <div key={cat.name} className="saas-cat-row">
                    <div className="saas-cat-info">
                      <strong>{cat.name}</strong>
                      <small>{cat.count}</small>
                    </div>
                    <span className="saas-cat-share">{cat.share}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        /* Container */
        .saas-admin-container {
          padding: 24px 32px 48px;
          min-height: 100vh;
          background: #f8f9fb;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        /* Top Header */
        .saas-overview-header,
        .saas-header {
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          width: 100% !important;
          gap: 16px !important;
          margin-bottom: 24px !important;
        }

        .saas-nav-tabs-row {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          width: 100% !important;
          gap: 16px !important;
        }

        .saas-nav-tabs {
          display: inline-flex !important;
          flex-direction: row !important;
          align-items: center !important;
          flex-wrap: nowrap !important;
          gap: 4px !important;
          background: #f1f5f9 !important;
          padding: 4px !important;
          border-radius: 12px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03) !important;
        }

        .saas-nav-tabs :global(.saas-tab),
        .saas-nav-tabs :global(a.saas-tab),
        .saas-nav-tabs :global(span.saas-tab),
        .saas-tab {
          display: inline-flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 7px !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          color: #64748b !important;
          text-decoration: none !important;
          padding: 6px 14px !important;
          border-radius: 8px !important;
          line-height: 1 !important;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
          cursor: pointer !important;
          position: relative !important;
          user-select: none !important;
          border: 1px solid transparent !important;
          background: transparent !important;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
          box-sizing: border-box !important;
        }

        .saas-nav-tabs :global(.saas-tab-icon),
        :global(.saas-tab-icon) {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
          width: 14px !important;
          height: 14px !important;
          color: #94a3b8 !important;
          transition: color 0.15s ease, transform 0.2s ease !important;
        }

        .saas-nav-tabs :global(.saas-tab:hover),
        .saas-tab:hover {
          color: #0f172a !important;
          background: rgba(255, 255, 255, 0.85) !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
        }

        .saas-nav-tabs :global(.saas-tab:hover .saas-tab-icon),
        .saas-tab:hover :global(.saas-tab-icon) {
          color: #2563eb !important;
          transform: translateY(-1px) !important;
        }

        .saas-nav-tabs :global(.saas-tab.active),
        .saas-tab.active {
          color: #0f172a !important;
          font-weight: 700 !important;
          background: #ffffff !important;
          box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04) !important;
          border: 1px solid rgba(226, 232, 240, 0.9) !important;
        }

        .saas-nav-tabs :global(.saas-tab.active .saas-tab-icon),
        .saas-tab.active :global(.saas-tab-icon) {
          color: #2563eb !important;
        }

        .saas-nav-tabs :global(.saas-tab span) {
          display: inline-block !important;
          white-space: nowrap !important;
          line-height: 1 !important;
        }

        .saas-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Search bar */
        .saas-search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 36px;
          padding: 0 10px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          width: 220px;
          transition: border-color 0.15s ease;
        }

        .saas-search-box:focus-within {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .saas-search-icon {
          color: #94a3b8;
          flex-shrink: 0;
        }

        .saas-search-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 12px;
          color: #0f172a;
          width: 100%;
        }

        .saas-shortcut-badge {
          font-size: 10px;
          font-weight: 600;
          color: #94a3b8;
          background: #f1f5f9;
          padding: 2px 5px;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }

        .saas-btn-outline {
          display: inline-flex;
          align-items: center;
          height: 36px;
          padding: 0 14px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 500;
          color: #1e293b;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .saas-btn-outline:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .saas-btn-icon {
          position: relative;
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #64748b;
          cursor: pointer;
        }

        .saas-btn-icon:hover {
          background: #f8fafc;
          color: #0f172a;
        }

        .saas-notification-dot {
          position: absolute;
          top: 8px;
          right: 9px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2563eb;
        }

        .saas-user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: #ffffff;
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        /* Title Row */
        .saas-title-row {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          width: 100% !important;
          padding-top: 4px !important;
        }

        .saas-title-left {
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important;
          text-align: left !important;
        }

        .saas-page-title {
          font-size: 26px !important;
          font-weight: 700 !important;
          color: #0f172a !important;
          letter-spacing: -0.4px !important;
          margin: 0 !important;
          text-align: left !important;
        }

        .saas-title-actions {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          margin-left: auto !important;
        }

        .saas-btn-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 34px;
          padding: 0 12px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 500;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .saas-btn-action:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .saas-btn-icon-square {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          color: #64748b;
          cursor: pointer;
        }

        .saas-btn-icon-square:hover {
          background: #f8fafc;
          color: #0f172a;
        }

        /* Main Grid - Full Width */
        .saas-grid-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
          max-width: 1360px;
        }

        .saas-main-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
          min-width: 0;
        }

        /* Metric Cards */
        .saas-metrics-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .saas-metric-card {
          background: #ffffff;
          border: 1px solid #eef1f6;
          border-radius: 14px;
          padding: 18px 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
        }

        .saas-metric-label {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          margin-bottom: 6px;
        }

        .saas-metric-val-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 4px;
        }

        .saas-metric-value {
          font-size: 26px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.5px;
        }

        .saas-badge-green {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 600;
          color: #10b981;
          background: #ecfdf5;
          padding: 2px 7px;
          border-radius: 9999px;
        }

        .saas-badge-red {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 600;
          color: #ef4444;
          background: #fef2f2;
          padding: 2px 7px;
          border-radius: 9999px;
        }

        .saas-badge-amber {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 600;
          color: #f59e0b;
          background: #fffbeb;
          padding: 2px 7px;
          border-radius: 9999px;
        }

        .saas-metric-sub {
          font-size: 11px;
          color: #94a3b8;
        }

        /* Chart Card */
        .saas-chart-card {
          background: #ffffff;
          border: 1px solid #eef1f6;
          border-radius: 16px;
          padding: 22px 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        }

        .saas-chart-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .saas-chart-header-left {
          display: flex;
          flex-direction: column;
        }

        .saas-chart-header-right {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        /* Date Range Selector Dropdown */
        .saas-date-filter-wrapper {
          position: relative;
        }

        .saas-date-filter-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          height: 32px;
          padding: 0 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .saas-date-filter-btn:hover,
        .saas-date-filter-btn.active {
          background: #f1f5f9;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .saas-icon-calendar {
          color: #2563eb;
        }

        .saas-chevron {
          color: #64748b;
          transition: transform 0.2s ease;
        }

        .saas-chevron.open,
        .saas-rotate-180 {
          transform: rotate(180deg);
        }

        /* Dropdown Menu Popover */
        .saas-date-dropdown-menu {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          width: 270px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          padding: 12px;
          z-index: 50;
        }

        .saas-dropdown-header {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #94a3b8;
          margin-bottom: 8px;
          padding: 0 4px;
        }

        .saas-dropdown-presets {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .saas-preset-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 7px 10px;
          background: transparent;
          border: none;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 500;
          color: #334155;
          text-align: left;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .saas-preset-item:hover {
          background: #f8fafc;
          color: #0f172a;
        }

        .saas-preset-item.active {
          background: #eff6ff;
          color: #2563eb;
          font-weight: 600;
        }

        .saas-dropdown-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 10px 0;
        }

        .saas-dropdown-custom-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .saas-custom-title {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          padding: 0 4px;
        }

        .saas-custom-inputs-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .saas-custom-input-group {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .saas-custom-input-group label {
          font-size: 10px;
          font-weight: 600;
          color: #64748b;
        }

        .saas-date-input {
          height: 30px;
          padding: 2px 6px;
          font-size: 11px;
          color: #0f172a;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
        }

        .saas-date-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
        }

        .saas-custom-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }

        .saas-btn-apply {
          flex: 1;
          height: 30px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .saas-btn-apply:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .saas-btn-apply:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .saas-btn-cancel {
          height: 30px;
          padding: 0 10px;
          background: #f1f5f9;
          color: #64748b;
          border: none;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .saas-btn-cancel:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .saas-card-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 3px;
        }

        .saas-card-subtitle {
          font-size: 12px;
          color: #94a3b8;
        }

        .saas-chart-legend {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .saas-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .saas-legend-dot.blue {
          background: #2563eb;
        }

        .saas-legend-dot.light {
          background: #dbeafe;
        }

        .saas-legend-text {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
        }

        /* Chart Layout */
        .saas-chart-container {
          position: relative;
          min-height: 230px;
          padding-top: 36px;
          transition: opacity 0.2s ease;
        }

        .saas-chart-container.loading {
          opacity: 0.5;
          pointer-events: none;
        }

        /* Floating Tooltip */
        .saas-floating-tooltip {
          position: absolute;
          top: -6px;
          transform: translateX(-50%);
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 6px 12px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
          z-index: 10;
          white-space: nowrap;
          pointer-events: none;
          transition: left 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .saas-tooltip-top {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
        }

        .saas-tooltip-pct {
          color: #10b981;
          font-size: 11px;
          font-weight: 600;
        }

        .saas-tooltip-tag {
          font-size: 10px;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 4px;
          background: #f1f5f9;
          color: #64748b;
        }

        .saas-tooltip-tag.peak {
          background: #eff6ff;
          color: #2563eb;
        }

        .saas-tooltip-sub {
          font-size: 10px;
          color: #64748b;
          display: block;
          margin-top: 1px;
        }

        .saas-tooltip-arrow {
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
        }

        /* SVG Graph Styles */
        .saas-graph-wrapper {
          position: relative;
          width: 100%;
          height: 195px;
        }

        .saas-svg-chart {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .saas-area-fill {
          transition: d 0.3s ease;
        }

        .saas-line-stroke {
          transition: d 0.3s ease;
        }

        .saas-graph-axis-label {
          font-size: 10px;
          fill: #94a3b8;
          font-weight: 500;
          font-family: inherit;
        }

        .saas-graph-day-label {
          font-size: 11px;
          fill: #94a3b8;
          font-weight: 500;
          font-family: inherit;
          transition: all 0.15s ease;
          cursor: pointer;
          user-select: none;
        }

        .saas-graph-day-label:hover {
          fill: #2563eb;
        }

        .saas-graph-day-label.active {
          fill: #0f172a;
          font-weight: 600;
          font-size: 12px;
        }

        .saas-pulse-ring {
          animation: saas-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          transform-origin: center;
        }

        @keyframes saas-pulse {
          0%, 100% {
            opacity: 0.7;
            r: 12;
          }
          50% {
            opacity: 0.25;
            r: 16;
          }
        }

        /* Table Card */
        .saas-table-card {
          background: #ffffff;
          border: 1px solid #eef1f6;
          border-radius: 16px;
          padding: 20px 22px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        }

        .saas-table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .saas-table-segmented-tabs {
          display: flex;
          background: #f1f5f9;
          padding: 3px;
          border-radius: 8px;
          gap: 2px;
        }

        .saas-seg-tab {
          border: none;
          background: transparent;
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          padding: 4px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .saas-seg-tab.active {
          background: #ffffff;
          color: #0f172a;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        }

        .saas-link-viewall {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 12px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 500;
          color: #334155;
          text-decoration: none;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .saas-link-viewall:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
          text-decoration: none;
        }

        .saas-link-viewall :global(.saas-link-viewall-arrow),
        .saas-link-viewall :global(svg) {
          color: #64748b;
          transition: transform 0.18s ease, color 0.18s ease;
          flex-shrink: 0;
        }

        .saas-link-viewall:hover :global(.saas-link-viewall-arrow),
        .saas-link-viewall:hover :global(svg) {
          color: #2563eb;
          transform: translate(1px, -1px);
        }

        .saas-table-wrap {
          overflow-x: auto;
        }

        .saas-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .saas-table th {
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 8px 10px;
          border-bottom: 1px solid #f1f5f9;
        }

        .saas-table td {
          padding: 12px 10px;
          border-bottom: 1px solid #f8fafc;
          color: #334155;
        }

        .saas-cell-id {
          font-weight: 600;
          color: #0f172a;
        }

        .saas-cell-name {
          font-weight: 500;
        }

        .saas-cell-email {
          color: #64748b;
          font-size: 12px;
        }

        .saas-cell-amount {
          font-weight: 600;
          color: #0f172a;
        }

        .saas-status-pill {
          display: inline-block;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 9999px;
          letter-spacing: 0.3px;
        }

        .saas-status-pill.delivered {
          background: #ecfdf5;
          color: #059669;
        }

        .saas-status-pill.pending {
          background: #fffbeb;
          color: #d97706;
        }

        .saas-empty-row {
          text-align: center;
          padding: 30px 10px;
          color: #94a3b8;
          font-style: italic;
        }

        .saas-category-pills-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .saas-cat-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .saas-cat-info strong {
          display: block;
          font-size: 13px;
          color: #0f172a;
        }

        .saas-cat-info small {
          font-size: 11px;
          color: #94a3b8;
        }

        .saas-cat-share {
          font-size: 12px;
          font-weight: 600;
          color: #2563eb;
        }

        @media (max-width: 1024px) {
          .saas-grid-body {
            grid-template-columns: 1fr;
          }
          .saas-admin-container {
            padding: 16px;
          }
          .saas-metrics-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}