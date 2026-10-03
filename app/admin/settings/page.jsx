import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth";

export const metadata = {
  title: "Settings | PrimeNest Admin",
};

export default async function AdminSettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("primenest-session")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  let session;

  try {
    session = await verifySessionToken(token);
  } catch {
    redirect("/admin/login");
  }

  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  const settings = [
    {
      title: "Store Name",
      value: "PrimeNest",
      description: "Your official e-commerce store brand name.",
    },
    {
      title: "Store Currency",
      value: "INR (₹)",
      description: "Base transaction currency used across all catalogs.",
    },
    {
      title: "Access Role",
      value: "Super Administrator",
      description: "Highest permission tier with full catalog & order controls.",
    },
    {
      title: "Security & Encryption",
      value: "HTTP-Only Secure Cookie",
      description: "JWT session protected against cross-site scripting (XSS).",
    },
  ];

  return (
    <main className="saas-settings-page">
      <div className="saas-settings-container">
        <header className="saas-header">
          <div>
            <div className="saas-eyebrow">SYSTEM CONFIGURATION</div>
            <h1 className="saas-title">Settings</h1>
            <p className="saas-subtitle">
              Manage your administrator credentials and platform preferences.
            </p>
          </div>

          <Link href="/admin" className="saas-btn-back">
            ← Back to Overview
          </Link>
        </header>

        {/* Administrator Profile Card */}
        <section className="saas-card">
          <div className="saas-admin-row">
            <div className="saas-admin-avatar">
              <span>AD</span>
            </div>

            <div className="saas-admin-info">
              <h2 className="saas-admin-name">Administrator Account</h2>
              <p className="saas-admin-status">
                <span className="saas-status-dot" />
                Active PrimeNest Session
              </p>
            </div>
          </div>

          <div className="saas-grid-tiles">
            <div className="saas-tile">
              <span className="saas-tile-label">Account Email</span>
              <span className="saas-tile-value">{session.email || "admin@primenest.com"}</span>
            </div>

            <div className="saas-tile">
              <span className="saas-tile-label">Privilege Level</span>
              <span className="saas-role-badge">{session.role || "admin"}</span>
            </div>
          </div>
        </section>

        {/* Platform Configuration Card */}
        <section className="saas-card">
          <div className="saas-card-header">
            <h2 className="saas-section-title">Store Configuration</h2>
            <p className="saas-section-sub">Active environment parameters</p>
          </div>

          <div className="saas-settings-list">
            {settings.map((item) => (
              <div key={item.title} className="saas-setting-row">
                <div className="saas-setting-info">
                  <h3 className="saas-setting-name">{item.title}</h3>
                  <p className="saas-setting-desc">{item.description}</p>
                </div>

                <span className="saas-setting-badge">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        <p className="saas-note">
          Platform configurations are managed via environment variables and static administrative policy.
        </p>
      </div>
    </main>
  );
}