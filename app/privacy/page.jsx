"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Database,
  FileText,
  Mail,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import "../editorial.css";

const TOC_SECTIONS = [
  { id: "overview", label: "1. Overview & Commitment" },
  { id: "information-collected", label: "2. Information We Collect" },
  { id: "how-we-use-data", label: "3. How We Use Your Information" },
  { id: "payment-security", label: "4. Payment Security & Encryption" },
  { id: "cookies-tracking", label: "5. Cookies & Tracking" },
  { id: "third-party-sharing", label: "6. Logistics & Third Parties" },
  { id: "data-retention", label: "7. Data Retention & Archival" },
  { id: "your-rights", label: "8. Your Rights & Choices" },
  { id: "grievance-contact", label: "9. Grievance Officer & Inquiries" },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("overview");

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
            <span className="editorial-kicker">LEGAL ATELIER · DATA PROTECTION</span>
            <h1 className="editorial-section-title" style={{ fontSize: "52px", margin: "10px 0 16px" }}>
              Privacy <span className="editorial-italic">Policy.</span>
            </h1>
            <p className="editorial-hero-desc" style={{ maxWidth: "680px" }}>
              Our transparent commitment to safeguarding your personal data, transaction security, and
              digital privacy in compliance with Indian DPDP Act 2023 and GDPR guidelines.
            </p>
          </div>
        </section>

        {/* ================= LEGAL TWO-COLUMN GRID ================= */}
        <section>
          <div className="editorial-container">
            <div className="editorial-legal-grid">
              {/* Sticky TOC Sidebar */}
              <aside className="editorial-legal-sidebar">
                <h4 className="editorial-legal-toc-title">Table of Contents</h4>
                <nav className="editorial-legal-toc-links">
                  {TOC_SECTIONS.map((sec) => (
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
                  <p style={{ margin: "0 0 6px", fontWeight: 700 }}>NEED CLARIFICATION?</p>
                  <p style={{ margin: "0 0 10px", color: "var(--editorial-text-muted)" }}>
                    Contact our Data Privacy Officer directly for inquiries.
                  </p>
                  <a
                    href="mailto:privacy@primenest.com"
                    style={{ color: "#926f34", fontWeight: 700, textDecoration: "none" }}
                  >
                    privacy@primenest.com ↗
                  </a>
                </div>
              </aside>

              {/* Main Policy Content Body */}
              <article className="editorial-legal-content">
                <div className="editorial-legal-header-meta">
                  <span className="editorial-legal-badge">Official Policy</span>
                  <span className="editorial-legal-effective">Last Revised: October 5, 2026</span>
                  <span className="editorial-legal-effective">Version 4.2</span>
                </div>

                {/* Section 1 */}
                <div id="overview" className="editorial-legal-section">
                  <h2 className="editorial-legal-section-h2">
                    <span className="editorial-legal-section-num">1</span>
                    Overview & Zero-Data-Selling Pledge
                  </h2>
                  <p className="editorial-legal-p">
                    At PrimeNest ("PrimeNest," "we," "our," or "us"), we hold your privacy in the same
                    reverence as our craftsmanship. We are firmly committed to maintaining the confidentiality,
                    integrity, and security of all personal information entrusted to us by our patrons.
                  </p>
                  <div className="editorial-legal-callout">
                    <strong>Our Core Guarantee:</strong> PrimeNest has never sold, rented, leased, or
                    monetized our patrons' personal records or browsing behavior to third-party data brokers,
                    advertisers, or external marketers. We will never do so.
                  </div>
                  <p className="editorial-legal-p">
                    This Privacy Policy details how we collect, process, store, and safeguard your
                    information when you visit our website, communicate with our concierge, or acquire goods
                    from our digital catalog.
                  </p>
                </div>

                {/* Section 2 */}
                <div id="information-collected" className="editorial-legal-section">
                  <h2 className="editorial-legal-section-h2">
                    <span className="editorial-legal-section-num">2</span>
                    Information We Collect
                  </h2>
                  <p className="editorial-legal-p">
                    We collect only the essential information necessary to deliver seamless white-glove
                    order fulfillment, customer care, and personalized catalog recommendations:
                  </p>
                  <ul className="editorial-legal-list">
                    <li>
                      <strong>Patron Identification Data:</strong> Full legal name, billing and physical
                      shipping address, email address, and mobile phone number for delivery coordination.
                    </li>
                    <li>
                      <strong>Transaction & Fulfillment Records:</strong> Historical orders, items purchased,
                      invoice references, returns or exchange requests, and payment settlement confirmations.
                    </li>
                    <li>
                      <strong>Device & Technical Telemetry:</strong> Anonymized IP address, browser type,
                      operating system, session duration, and device screen dimensions to ensure proper page
                      rendering.
                    </li>
                    <li>
                      <strong>Client Concierge Inquiries:</strong> Communications with our styling advisors,
                      size consultation transcripts, and feedback responses.
                    </li>
                  </ul>
                </div>

                {/* Section 3 */}
                <div id="how-we-use-data" className="editorial-legal-section">
                  <h2 className="editorial-legal-section-h2">
                    <span className="editorial-legal-section-num">3</span>
                    How We Use Your Information
                  </h2>
                  <p className="editorial-legal-p">
                    Your personal information is utilized strictly for legitimate business operations:
                  </p>
                  <ul className="editorial-legal-list">
                    <li>
                      Processing, assembling, packing, and dispatching your orders through authenticated
                      courier networks.
                    </li>
                    <li>
                      Dispatching automated order confirmations, AWB shipment tracking updates, and delivery alerts.
                    </li>
                    <li>
                      Facilitating effortless 7-day doorstep returns, size exchanges, and rapid reimbursements.
                    </li>
                    <li>
                      Operating our optional Sunday Gazette newsletter for patrons who have explicitly opted in
                      (you may unsubscribe at any time via a single click).
                    </li>
                    <li>Complying with statutory taxation, GST reporting, and invoice record-keeping laws.</li>
                  </ul>
                </div>

                {/* Section 4 */}
                <div id="payment-security" className="editorial-legal-section">
                  <h2 className="editorial-legal-section-h2">
                    <span className="editorial-legal-section-num">4</span>
                    Payment Security & Bank-Grade Encryption
                  </h2>
                  <p className="editorial-legal-p">
                    Financial security is paramount. PrimeNest operates in strict accordance with the Payment
                    Card Industry Data Security Standard (PCI-DSS Level 1):
                  </p>
                  <div className="editorial-legal-callout">
                    <strong>Zero Financial Storage:</strong> PrimeNest does not store, process, or view your
                    credit/debit card numbers, CVVs, expiration dates, or bank PINs on our servers. All
                    financial handshakes are directly encrypted via 256-bit SSL tunnels to RBI-licensed
                    payment gateways (Razorpay and Stripe).
                  </div>
                </div>

                {/* Section 5 */}
                <div id="cookies-tracking" className="editorial-legal-section">
                  <h2 className="editorial-legal-section-h2">
                    <span className="editorial-legal-section-num">5</span>
                    Cookies & Tracking Technologies
                  </h2>
                  <p className="editorial-legal-p">
                    We employ minimal first-party cookies necessary for core website functions:
                  </p>
                  <ul className="editorial-legal-list">
                    <li>
                      <strong>Essential Session Cookies:</strong> Retaining your shopping cart items,
                      wishlist, and secure authentication token during your visit.
                    </li>
                    <li>
                      <strong>Preference Cookies:</strong> Remembering your selected grid density view
                      (3-column vs 4-column) and preferred category filters.
                    </li>
                    <li>
                      <strong>Anonymized Performance Metrics:</strong> Analyzing aggregate page speeds to
                      diagnose server latency and optimize mobile loading times.
                    </li>
                  </ul>
                  <p className="editorial-legal-p">
                    You can configure your browser to decline all non-essential cookies at any time without
                    losing access to catalog browsing.
                  </p>
                </div>

                {/* Section 6 */}
                <div id="third-party-sharing" className="editorial-legal-section">
                  <h2 className="editorial-legal-section-h2">
                    <span className="editorial-legal-section-num">6</span>
                    Logistics & Third-Party Service Partners
                  </h2>
                  <p className="editorial-legal-p">
                    We only share strictly necessary information with trusted third-party operational partners
                    bound by non-disclosure agreements:
                  </p>
                  <ul className="editorial-legal-list">
                    <li>
                      <strong>Courier & Logistics Providers (Bluedart, Delhivery, DHL Express):</strong> Only
                      your shipping name, address, and delivery phone number to ensure doorstep handover.
                    </li>
                    <li>
                      <strong>Transactional Communications:</strong> SMS and email dispatch providers
                      solely for sending tracking links and receipts.
                    </li>
                  </ul>
                </div>

                {/* Section 7 */}
                <div id="data-retention" className="editorial-legal-section">
                  <h2 className="editorial-legal-section-h2">
                    <span className="editorial-legal-section-num">7</span>
                    Data Retention & Archival
                  </h2>
                  <p className="editorial-legal-p">
                    We retain your personal information only as long as necessary to fulfill the purposes
                    outlined in this policy or as required by Indian commercial law (such as retaining
                    taxation invoices for mandatory statutory audit periods).
                  </p>
                </div>

                {/* Section 8 */}
                <div id="your-rights" className="editorial-legal-section">
                  <h2 className="editorial-legal-section-h2">
                    <span className="editorial-legal-section-num">8</span>
                    Your Rights & Choices
                  </h2>
                  <p className="editorial-legal-p">
                    Under applicable data protection laws, you retain full sovereignty over your data:
                  </p>
                  <ul className="editorial-legal-list">
                    <li>
                      <strong>Right to Access:</strong> Request a complete machine-readable copy of your
                      personal data stored with us.
                    </li>
                    <li>
                      <strong>Right to Correction:</strong> Update or rectify incomplete or inaccurate
                      profile details anytime.
                    </li>
                    <li>
                      <strong>Right to Erasure ("Right to be Forgotten"):</strong> Request complete deletion
                      of your account and personal history, subject to statutory taxation retention rules.
                    </li>
                    <li>
                      <strong>Marketing Opt-Out:</strong> Instantly unsubscribe from newsletters or SMS
                      updates via the unsubscribe link provided in every message.
                    </li>
                  </ul>
                </div>

                {/* Section 9 */}
                <div id="grievance-contact" className="editorial-legal-section">
                  <h2 className="editorial-legal-section-h2">
                    <span className="editorial-legal-section-num">9</span>
                    Grievance Officer & Inquiries
                  </h2>
                  <p className="editorial-legal-p">
                    In accordance with the Information Technology Act 2000 and DPDP Act 2023, the details of
                    our appointed Grievance Officer are provided below:
                  </p>
                  <div
                    style={{
                      background: "#faf8f5",
                      border: "1px solid var(--editorial-border)",
                      borderRadius: "12px",
                      padding: "24px 22px",
                      fontSize: "13.5px",
                      lineHeight: "1.7",
                      color: "var(--editorial-text-muted)",
                    }}
                  >
                    <p style={{ margin: "0 0 6px", fontWeight: 700, color: "var(--editorial-text)" }}>
                      Nitin Joshi · Chief Privacy & Compliance Officer
                    </p>
                    <p style={{ margin: "0 0 4px" }}>
                      PrimeNest E-Commerce Private Limited
                    </p>
                    <p style={{ margin: "0 0 4px" }}>
                      Atelier House, S.G. Highway, Bodakdev, Ahmedabad, Gujarat 380054, India
                    </p>
                    <p style={{ margin: "0 0 4px" }}>
                      Email:{" "}
                      <a href="mailto:grievance@primenest.com" style={{ color: "#926f34", fontWeight: 600 }}>
                        grievance@primenest.com
                      </a>
                    </p>
                    <p style={{ margin: 0 }}>
                      Response Window: Within 48 working hours.
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
