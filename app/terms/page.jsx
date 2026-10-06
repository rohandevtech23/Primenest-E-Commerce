"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Scale,
  ShieldAlert,
  Award,
  FileCheck,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import "../editorial.css";

const TERMS_SECTIONS = [
  { id: "acceptance", label: "1. Agreement to Terms" },
  { id: "accounts", label: "2. Account Registration & Security" },
  { id: "catalog-pricing", label: "3. Product Catalog & Pricing" },
  { id: "orders-payments", label: "4. Orders, Payments & Taxes" },
  { id: "shipping-risk", label: "5. Shipping & Title Transfer" },
  { id: "returns-guarantee", label: "6. Returns & Craftsmanship Guarantee" },
  { id: "intellectual-property", label: "7. Intellectual Property" },
  { id: "liability", label: "8. Limitation of Liability" },
  { id: "governing-law", label: "9. Governing Law & Jurisdiction" },
  { id: "contact", label: "10. Contact Information" },
];

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState("acceptance");

  const scrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="editorial-page-wrapper">
      <Navbar />

      <main className="editorial-main">
        {/* ================= HERO INTRO ================= */}
        <section className="editorial-journal-hero" style={{ paddingBottom: "24px" }}>
          <div className="editorial-container">
            <span className="editorial-kicker">LEGAL ATELIER · TERMS OF SERVICE</span>
            <h1 className="editorial-section-title" style={{ fontSize: "52px", margin: "10px 0 16px" }}>
              Terms & <span className="editorial-italic">Conditions.</span>
            </h1>
            <p className="editorial-hero-desc" style={{ maxWidth: "680px" }}>
              The legal agreement governing your access to the PrimeNest digital platform, atelier acquisitions,
              and craftsmanship commitments.
            </p>
          </div>
        </section>

        {/* ================= LEGAL TWO-COLUMN GRID ================= */}
        <section>
          <div className="editorial-container">
            <div className="editorial-legal-grid">
              {/* Sticky TOC Sidebar */}
              <aside className="editorial-legal-sidebar">
                <h4 className="editorial-legal-toc-title">Terms Navigation</h4>
                <nav className="editorial-legal-toc-links">
                  {TERMS_SECTIONS.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollTo(sec.id)}
                      className={`editorial-legal-toc-link ${activeSection === sec.id ? "active" : ""}`}
                      style={{ background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}
                    >
                      {sec.label}
                    </button>
                  ))}
                </nav>

                <div
                  style={{
                    marginTop: "24px",
                    paddingTop: "16px",
                    borderTop: "1px solid #f0ebe2",
                    fontSize: "11px",
                    color: "var(--editorial-kicker)",
                  }}
                >
                  <p style={{ margin: "0 0 6px", fontWeight: 700 }}>LEGAL INQUIRIES?</p>
                  <p style={{ margin: "0 0 10px", color: "var(--editorial-text-muted)" }}>
                    Reach our legal and compliance counsel.
                  </p>
                  <a
                    href="mailto:legal@primenest.com"
                    style={{ color: "#926f34", fontWeight: 700, textDecoration: "none" }}
                  >
                    legal@primenest.com ↗
                  </a>
                </div>
              </aside>

              {/* Main Terms Body */}
              <article className="editorial-legal-content">
                <div className="editorial-legal-header-meta">
                  <span className="editorial-legal-badge">Binding Agreement</span>
                  <span className="editorial-legal-effective">Last Updated: October 5, 2026</span>
                  <span className="editorial-legal-effective">Revision 3.8</span>
                </div>

                {/* Section 1 */}
                <div id="acceptance" className="editorial-legal-section">
                  <h2 className="editorial-legal-section-h2">
                    <span className="editorial-legal-section-num">1</span>
                    Agreement to Terms
                  </h2>
                  <p className="editorial-legal-p">
                    Welcome to PrimeNest. These Terms and Conditions ("Terms") constitute a legally binding
                    contract between you ("Patron," "Customer," or "User") and PrimeNest E-Commerce Private
                    Limited ("PrimeNest," "we," "us," or "our").
                  </p>
                  <p className="editorial-legal-p">
                    By browsing, accessing, registering an account, or placing an order on our platform, you
                    expressly acknowledge and agree to be bound by these Terms and our Privacy Policy. If you do
                    not agree with any portion of these terms, please discontinue platform use immediately.
                  </p>
                </div>

                {/* Section 2 */}
                <div id="accounts" className="editorial-legal-section">
                  <h2 className="editorial-legal-section-h2">
                    <span className="editorial-legal-section-num">2</span>
                    Account Registration & Security
                  </h2>
                  <p className="editorial-legal-p">
                    To access tailored styling recommendations, wishlist curation, and expedited checkout, you
                    may create a PrimeNest client account.
                  </p>
                  <ul className="editorial-legal-list">
                    <li>You must provide accurate, current, and truthful personal information.</li>
                    <li>
                      You are solely responsible for maintaining the confidentiality of your account credentials
                      and passwords.
                    </li>
                    <li>
                      You must notify PrimeNest immediately at support@primenest.com upon discovering any
                      unauthorized access to your profile.
                    </li>
                  </ul>
                </div>

                {/* Section 3 */}
                <div id="catalog-pricing" className="editorial-legal-section">
                  <h2 className="editorial-legal-section-h2">
                    <span className="editorial-legal-section-num">3</span>
                    Product Catalog & Pricing Accuracy
                  </h2>
                  <p className="editorial-legal-p">
                    We make every effort to display the texture, color, cut, and olfactory profiles of our
                    curations with utmost fidelity. However, because display monitors render hues differently,
                    minor optical variations may occur.
                  </p>
                  <div className="editorial-legal-callout">
                    <strong>Currency & Pricing:</strong> All prices listed on PrimeNest are expressed in Indian
                    Rupees (₹ INR) inclusive of applicable Goods and Services Tax (GST), unless explicitly
                    stated otherwise. We reserve the right to revise catalog pricing without prior notification.
                  </div>
                </div>

                {/* Section 4 */}
                <div id="orders-payments" className="editorial-legal-section">
                  <h2 className="editorial-legal-section-h2">
                    <span className="editorial-legal-section-num">4</span>
                    Orders, Payments & Taxes
                  </h2>
                  <p className="editorial-legal-p">
                    An order placed on our website constitutes an offer to purchase. PrimeNest reserves the right
                    to decline or cancel any order for reasons including inventory stock limitations, pricing
                    typographical errors, or suspected fraudulent activity.
                  </p>
                  <p className="editorial-legal-p">
                    Payment must be received in full prior to dispatch, unless Cash on Delivery (COD) has been
                    selected. In the event of an authorized cancellation, any settled funds will be reimbursed
                    immediately to the original payment source.
                  </p>
                </div>

                {/* Section 5 */}
                <div id="shipping-risk" className="editorial-legal-section">
                  <h2 className="editorial-legal-section-h2">
                    <span className="editorial-legal-section-num">5</span>
                    Shipping, Delivery & Title Transfer
                  </h2>
                  <p className="editorial-legal-p">
                    Title and risk of loss for items purchased pass to you upon physical delivery and handover
                    by our authorized courier partner.
                  </p>
                  <p className="editorial-legal-p">
                    Estimated transit times (2–4 business days metro, 4–6 business days non-metro) are provided
                    in good faith. PrimeNest is not liable for unavoidable delays resulting from natural
                    disasters, weather disruptions, or government holiday embargoes.
                  </p>
                </div>

                {/* Section 6 */}
                <div id="returns-guarantee" className="editorial-legal-section">
                  <h2 className="editorial-legal-section-h2">
                    <span className="editorial-legal-section-num">6</span>
                    7-Day Returns & 1-Year Craftsmanship Guarantee
                  </h2>
                  <p className="editorial-legal-p">
                    We stand resolutely behind the integrity of our creations:
                  </p>
                  <ul className="editorial-legal-list">
                    <li>
                      <strong>7-Day Doorstep Returns:</strong> You may return eligible, unworn items with tags
                      attached within 7 calendar days of delivery for a full refund or complimentary size
                      exchange.
                    </li>
                    <li>
                      <strong>1-Year Craftsmanship Guarantee:</strong> If any garment, footwear, or leather
                      good experiences material failure, stitching unraveling, or hardware defects under normal
                      everyday wear within 365 days of purchase, we will repair or replace it free of charge.
                    </li>
                  </ul>
                </div>

                {/* Section 7 */}
                <div id="intellectual-property" className="editorial-legal-section">
                  <h2 className="editorial-legal-section-h2">
                    <span className="editorial-legal-section-num">7</span>
                    Intellectual Property Rights
                  </h2>
                  <p className="editorial-legal-p">
                    All website designs, editorial essays, photographic lookbooks, brand marks, logos, typography,
                    and proprietary software code are the exclusive intellectual property of PrimeNest E-Commerce
                    Private Limited and are protected by Indian and international copyright and trademark laws.
                  </p>
                </div>

                {/* Section 8 */}
                <div id="liability" className="editorial-legal-section">
                  <h2 className="editorial-legal-section-h2">
                    <span className="editorial-legal-section-num">8</span>
                    Limitation of Liability
                  </h2>
                  <p className="editorial-legal-p">
                    To the maximum extent permitted by applicable Indian law, PrimeNest shall not be liable for
                    any indirect, incidental, punitive, or consequential damages resulting from your use of or
                    inability to use our service. Our total aggregate liability for any proven claim shall not
                    exceed the amount paid by you for the specific item in question.
                  </p>
                </div>

                {/* Section 9 */}
                <div id="governing-law" className="editorial-legal-section">
                  <h2 className="editorial-legal-section-h2">
                    <span className="editorial-legal-section-num">9</span>
                    Governing Law & Jurisdiction
                  </h2>
                  <p className="editorial-legal-p">
                    These Terms and any disputes arising out of or related to your transactions with PrimeNest
                    shall be governed by and construed in accordance with the substantive laws of India.
                  </p>
                  <p className="editorial-legal-p">
                    The competent courts located in Ahmedabad, Gujarat, India shall possess exclusive jurisdiction
                    over any legal proceedings arising hereunder.
                  </p>
                </div>

                {/* Section 10 */}
                <div id="contact" className="editorial-legal-section">
                  <h2 className="editorial-legal-section-h2">
                    <span className="editorial-legal-section-num">10</span>
                    Contact Information
                  </h2>
                  <p className="editorial-legal-p">
                    For inquiries regarding these Terms & Conditions, please contact:
                  </p>
                  <div
                    style={{
                      background: "#faf8f5",
                      border: "1px solid var(--editorial-border)",
                      borderRadius: "12px",
                      padding: "22px 20px",
                      fontSize: "13.5px",
                      lineHeight: "1.7",
                      color: "var(--editorial-text-muted)",
                    }}
                  >
                    <p style={{ margin: "0 0 4px", fontWeight: 700, color: "var(--editorial-text)" }}>
                      PrimeNest Legal & Compliance Council
                    </p>
                    <p style={{ margin: "0 0 4px" }}>
                      Atelier House, S.G. Highway, Bodakdev, Ahmedabad, Gujarat 380054, India
                    </p>
                    <p style={{ margin: 0 }}>
                      Email:{" "}
                      <a href="mailto:legal@primenest.com" style={{ color: "#926f34", fontWeight: 600 }}>
                        legal@primenest.com
                      </a>
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
