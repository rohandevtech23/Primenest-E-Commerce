"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  ExternalLink,
  LogOut,
  Sparkles,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  // Keep admin login page free of sidebar
  if (pathname === "/admin/login") {
    return children;
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/admin/login";
    } catch {
      window.location.href = "/admin/login";
    }
  }

  return (
    <div className="admin-layout">
      {/* Sleek Minimalist Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand-card">
          <Link href="/admin" className="admin-brand-link">
            <div className="admin-logo-wrap">
              <div className="admin-logo-aura" />
              <div className="admin-logo-badge">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="admin-logo-svg"
                >
                  <defs>
                    <linearGradient id="pnGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                    <linearGradient id="pnGradAccent" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                    <linearGradient id="pnCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#c7d2fe" />
                    </linearGradient>
                  </defs>

                  {/* Outer Nest Hexagon */}
                  <path
                    d="M16 3L28 9.5V22.5L16 29L4 22.5V9.5L16 3Z"
                    stroke="url(#pnGradPrimary)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="admin-svg-ring"
                  />

                  {/* Middle Nested Facet */}
                  <path
                    d="M16 7L24 11.5V20.5L16 25L8 20.5V11.5L16 7Z"
                    fill="url(#pnGradAccent)"
                    fillOpacity="0.22"
                    stroke="url(#pnGradPrimary)"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    className="admin-svg-mid"
                  />

                  {/* Core Prime Diamond */}
                  <polygon
                    points="16,11 21,16 16,21 11,16"
                    fill="url(#pnCoreGrad)"
                    className="admin-svg-diamond"
                  />

                  <circle cx="16" cy="16" r="1.8" fill="#4f46e5" />
                </svg>

                {/* Glass Light Sheen Sweep */}
                <div className="admin-logo-sheen" />
              </div>
            </div>

            <div className="admin-brand-info">
              <span className="admin-brand-name">
                Prime<span className="admin-brand-accent">Nest</span>
              </span>
              <span className="admin-welcome-text">
                Welcome back, Admin <span className="admin-wave-emoji">👋</span>
              </span>
            </div>
          </Link>
        </div>

        <div className="admin-nav-section-label">MAIN MENU</div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="admin-nav-icon">
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                </span>
                <span className="admin-nav-text">{item.label}</span>
                {active && <span className="admin-nav-pill" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-footer-store-link"
          >
            <div className="admin-footer-store-icon">
              <Sparkles size={15} />
            </div>
            <div className="admin-footer-store-info">
              <span className="admin-footer-store-title">View Live Store</span>
              <span className="admin-footer-store-sub">primenest.shop</span>
            </div>
            <ExternalLink size={13} className="admin-footer-ext" />
          </a>

          <button
            type="button"
            className="admin-sidebar-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-content">{children}</div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        /* Modern SaaS Layout Base */
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #f8f9fb;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* Clean White Sidebar */
        .admin-sidebar {
          width: 250px;
          min-width: 250px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 22px 14px 18px;
          background: #ffffff;
          border-right: 1px solid #eef1f6;
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 20;
        }

        /* Radiant Brand Mark */
        .admin-brand-card {
          padding: 2px 2px 18px;
          border-bottom: 1px solid #f1f4f8;
        }

        .admin-brand-link {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          padding: 7px 8px;
          border-radius: 14px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .admin-brand-link:hover {
          background: #f8fafc;
        }

        .admin-logo-wrap {
          position: relative;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-logo-aura {
          position: absolute;
          inset: -4px;
          border-radius: 16px;
          background: conic-gradient(from 0deg, #38bdf8, #6366f1, #a855f7, #ec4899, #38bdf8);
          filter: blur(8px);
          opacity: 0.55;
          animation: adminAuraSpin 7s linear infinite;
        }

        .admin-logo-badge {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          background: linear-gradient(145deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .admin-brand-link:hover .admin-logo-badge {
          transform: translateY(-2px) scale(1.06);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.45);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .admin-logo-svg {
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
          animation: adminMarkFloat 3.6s ease-in-out infinite;
        }

        .admin-svg-ring {
          animation: adminRingPulse 4s ease-in-out infinite;
        }

        .admin-svg-diamond {
          transform-origin: 16px 16px;
          animation: adminDiamondGlow 2.5s ease-in-out infinite;
        }

        .admin-logo-sheen {
          position: absolute;
          top: -50%;
          left: -150%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            60deg,
            transparent 30%,
            rgba(255, 255, 255, 0.28) 50%,
            transparent 70%
          );
          transform: rotate(25deg);
          animation: adminSheenSweep 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          pointer-events: none;
          z-index: 3;
        }

        .admin-brand-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .admin-brand-name {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.4px;
          line-height: 1.2;
        }

        .admin-brand-accent {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .admin-welcome-text {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          line-height: 1.2;
          white-space: nowrap;
        }

        .admin-wave-emoji {
          display: inline-block;
          font-size: 13px;
          transform-origin: 70% 70%;
          animation: adminWaveHand 2.4s ease-in-out infinite;
        }

        @keyframes adminAuraSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes adminSheenSweep {
          0% {
            transform: translateX(-120%) rotate(25deg);
          }
          25%, 100% {
            transform: translateX(180%) rotate(25deg);
          }
        }

        @keyframes adminMarkFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-1.5px);
          }
        }

        @keyframes adminDiamondGlow {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.9));
          }
          50% {
            transform: scale(1.18);
            filter: drop-shadow(0 0 8px #38bdf8);
          }
        }

        @keyframes adminRingPulse {
          0%, 100% {
            stroke-opacity: 0.9;
          }
          50% {
            stroke-opacity: 1;
            filter: drop-shadow(0 0 4px #818cf8);
          }
        }

        @keyframes adminWaveHand {
          0%, 100% {
            transform: rotate(0deg);
          }
          15%, 45% {
            transform: rotate(14deg);
          }
          30%, 60% {
            transform: rotate(-10deg);
          }
          75% {
            transform: rotate(0deg);
          }
        }

        .admin-nav-section-label {
          padding: 20px 10px 8px;
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 1px;
        }

        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          height: 42px;
          padding: 0 12px;
          border-radius: 10px;
          color: #64748b;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          position: relative;
          transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
        }

        .admin-nav-link:hover {
          background: #f8fafc;
          color: #0f172a;
        }

        .admin-nav-link.active {
          background: #eff6ff;
          color: #2563eb;
          font-weight: 600;
        }

        .admin-nav-icon {
          display: grid;
          place-items: center;
          width: 20px;
          flex-shrink: 0;
        }

        .admin-nav-text {
          flex: 1;
        }

        .admin-nav-pill {
          width: 5px;
          height: 16px;
          border-radius: 9999px;
          background: #2563eb;
          margin-left: auto;
        }

        /* Sidebar Footer Cards */
        .admin-sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-top: 16px;
          border-top: 1px solid #f1f4f8;
        }

        .admin-footer-store-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: #f8fafc;
          border: 1px solid #eef1f6;
          border-radius: 10px;
          text-decoration: none;
          color: #334155;
          transition: all 0.18s ease;
        }

        .admin-footer-store-link:hover {
          background: #f1f5f9;
          border-color: #e2e8f0;
        }

        .admin-footer-store-icon {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: #eff6ff;
          color: #2563eb;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .admin-footer-store-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;
        }

        .admin-footer-store-title {
          font-size: 11px;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.2;
        }

        .admin-footer-store-sub {
          font-size: 10px;
          color: #94a3b8;
          line-height: 1.2;
        }

        .admin-footer-ext {
          color: #94a3b8;
          flex-shrink: 0;
        }

        .admin-sidebar-logout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          height: 38px;
          padding: 0 12px;
          border: 1px solid transparent;
          border-radius: 9px;
          background: transparent;
          color: #dc2626;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .admin-sidebar-logout-btn:hover {
          background: #fef2f2;
          border-color: #fee2e2;
        }

        /* Content Container */
        .admin-content {
          flex: 1;
          min-width: 0;
          background: #f8f9fb;
        }

        @media (max-width: 860px) {
          .admin-layout {
            flex-direction: column;
          }

          .admin-sidebar {
            width: 100%;
            min-width: 0;
            min-height: auto;
            height: auto;
            position: relative;
            padding: 14px 16px;
          }

          .admin-nav {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 6px;
          }

          .admin-nav-link {
            height: 36px;
            padding: 0 10px;
            font-size: 12px;
          }

          .admin-nav-section-label,
          .admin-sidebar-footer {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
