"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  PackageCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Search,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import "../editorial.css";

export default function ShippingPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackResult, setTrackResult] = useState(null);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setTrackResult({
      code: trackingNumber.trim().toUpperCase(),
      status: "In Transit with Bluedart Air",
      eta: "Tomorrow by 2:00 PM",
      origin: "PrimeNest Central Fulfillment Atelier (Ahmedabad)",
      destination: "Client Address Delivery Hub",
    });
  };

  const steps = [
    {
      num: "01",
      title: "Initiate Return Online",
      desc: "Visit your Order History or message our Concierge team on WhatsApp with your Order ID. Takes under 60 seconds.",
    },
    {
      num: "02",
      title: "Pack in Original Box",
      desc: "Place unused items with original tags and fabric dust bag inside the sturdy FSC-certified shipping carton.",
    },
    {
      num: "03",
      title: "Complimentary Pickup",
      desc: "Our verified courier partner (Bluedart/Delhivery) will collect the parcel directly from your doorstep. No printing required.",
    },
    {
      num: "04",
      title: "Instant Reimbursement",
      desc: "Following a quick 24-hour atelier inspection, your refund is instantly dispatched to your original payment method or UPI.",
    },
  ];

  return (
    <div className="editorial-page-wrapper">
      <Navbar />

      <main className="editorial-main">
        {/* ================= HERO INTRO ================= */}
        <section className="editorial-journal-hero">
          <div className="editorial-container">
            <span className="editorial-kicker">CLIENT SERVICES · LOGISTICS & ASSURANCE</span>
            <h1 className="editorial-section-title" style={{ fontSize: "54px", margin: "10px 0 16px" }}>
              Shipping & <span className="editorial-italic">Returns.</span>
            </h1>
            <p className="editorial-hero-desc" style={{ maxWidth: "660px" }}>
              Transparent transit schedules, white-glove packaging, and our effortless 7-day doorstep
              return promise. Crafted to ensure absolute peace of mind.
            </p>
          </div>
        </section>

        <section style={{ paddingBottom: "80px" }}>
          <div className="editorial-container">
            {/* ================= 4 ASSURANCE METRICS ================= */}
            <div className="editorial-shipping-kpi-grid">
              <div className="editorial-kpi-card">
                <div className="editorial-kpi-icon">
                  <Truck size={22} />
                </div>
                <h3 className="editorial-kpi-title">Free Express Shipping</h3>
                <p className="editorial-kpi-desc">
                  Complimentary across all Indian pin codes on every order value exceeding ₹1,999.
                </p>
              </div>

              <div className="editorial-kpi-card">
                <div className="editorial-kpi-icon">
                  <Clock size={22} />
                </div>
                <h3 className="editorial-kpi-title">2–4 Days Metro Delivery</h3>
                <p className="editorial-kpi-desc">
                  Priority express air transit dispatched within 24 hours from our climate-controlled atelier.
                </p>
              </div>

              <div className="editorial-kpi-card">
                <div className="editorial-kpi-icon">
                  <RotateCcw size={22} />
                </div>
                <h3 className="editorial-kpi-title">7-Day Doorstep Pickup</h3>
                <p className="editorial-kpi-desc">
                  Zero hassle. Free courier pickup directly from your home or office with immediate tracking.
                </p>
              </div>

              <div className="editorial-kpi-card">
                <div className="editorial-kpi-icon">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="editorial-kpi-title">Tamper-Proof Vault Box</h3>
                <p className="editorial-kpi-desc">
                  Each package arrives secured with water-activated security tape and an authenticity seal.
                </p>
              </div>
            </div>

            {/* ================= TRACK ORDER WIDGET ================= */}
            <div
              style={{
                background: "var(--editorial-bg-alt)",
                border: "1px solid var(--editorial-border)",
                borderRadius: "18px",
                padding: "36px 34px",
                marginBottom: "60px",
                boxShadow: "0 6px 20px -6px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
                <span className="editorial-kicker">LIVE TRANSIT STATUS</span>
                <h2
                  style={{
                    fontFamily: "var(--editorial-font-serif)",
                    fontSize: "28px",
                    fontWeight: 600,
                    margin: "0 0 10px",
                  }}
                >
                  Track Your Dispatch
                </h2>
                <p style={{ fontSize: "14px", color: "var(--editorial-text-muted)", margin: "0 0 24px" }}>
                  Enter your PrimeNest Order ID (e.g. PN-84920) or Waybill tracking number.
                </p>

                <form onSubmit={handleTrack} style={{ display: "flex", gap: "10px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <Search
                      size={18}
                      style={{
                        position: "absolute",
                        left: "16px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#8c877d",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="e.g. PN-94021 or 2839401"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "14px 18px 14px 44px",
                        borderRadius: "8px",
                        border: "1px solid var(--editorial-border)",
                        background: "#ffffff",
                        fontSize: "14px",
                        color: "#111111",
                        outline: "none",
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="editorial-journal-btn"
                    style={{ padding: "0 24px", borderRadius: "8px" }}
                  >
                    Track
                  </button>
                </form>

                {trackResult && (
                  <div
                    style={{
                      marginTop: "24px",
                      padding: "20px 24px",
                      background: "#ffffff",
                      border: "1px solid var(--editorial-border)",
                      borderRadius: "12px",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontWeight: 700, fontSize: "14px" }}>{trackResult.code}</span>
                      <span className="editorial-table-pill">{trackResult.status}</span>
                    </div>
                    <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--editorial-text-muted)" }}>
                      <strong>Estimated Delivery:</strong> {trackResult.eta}
                    </p>
                    <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--editorial-text-muted)" }}>
                      <strong>Origin:</strong> {trackResult.origin}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ================= DELIVERY TIMELINES TABLE ================= */}
            <div style={{ marginBottom: "64px" }}>
              <span className="editorial-kicker">SCHEDULES & RATES</span>
              <h2
                className="editorial-section-title"
                style={{ fontSize: "32px", margin: "8px 0 20px" }}
              >
                Shipping Methods & <span className="editorial-italic">Delivery Timelines.</span>
              </h2>

              <div className="editorial-shipping-table-wrap">
                <table className="editorial-table">
                  <thead>
                    <tr>
                      <th>Shipping Tier</th>
                      <th>Transit Window</th>
                      <th>Applicable Regions</th>
                      <th>Delivery Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Standard Ground Priority</strong>
                        <div style={{ fontSize: "12px", color: "#78716c", marginTop: "2px" }}>
                          Carbon-neutral ground road logistics
                        </div>
                      </td>
                      <td>4 – 6 Business Days</td>
                      <td>All Pin Codes across India (20,000+ codes)</td>
                      <td>
                        <span className="editorial-table-pill">FREE above ₹1,999</span>
                        <span style={{ marginLeft: "8px", fontSize: "12px", color: "#666" }}>
                          (₹99 otherwise)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Express Air Courier</strong>
                        <div style={{ fontSize: "12px", color: "#78716c", marginTop: "2px" }}>
                          Direct air dispatch via Bluedart Apex
                        </div>
                      </td>
                      <td>2 – 3 Business Days</td>
                      <td>Tier 1 & Tier 2 Cities</td>
                      <td>₹199 flat</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Same-Day / Next-Day Metro VIP</strong>
                        <div style={{ fontSize: "12px", color: "#78716c", marginTop: "2px" }}>
                          Orders placed before 1:00 PM IST
                        </div>
                      </td>
                      <td>24 Hours</td>
                      <td>Mumbai, Delhi NCR, Bengaluru, Ahmedabad, Pune</td>
                      <td>₹299 flat</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>International Atelier Air</strong>
                        <div style={{ fontSize: "12px", color: "#78716c", marginTop: "2px" }}>
                          DHL Express with duties & clearance support
                        </div>
                      </td>
                      <td>5 – 8 Business Days</td>
                      <td>UAE, USA, UK, Singapore, Australia</td>
                      <td>₹1,800 ($22 USD)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ================= 4-STEP RETURN PROCESS ================= */}
            <div style={{ marginBottom: "64px" }}>
              <span className="editorial-kicker">EFFORTLESS 7-DAY RETURNS</span>
              <h2
                className="editorial-section-title"
                style={{ fontSize: "32px", margin: "8px 0 20px" }}
              >
                How to Return or <span className="editorial-italic">Exchange an Item.</span>
              </h2>
              <p
                style={{
                  fontFamily: "var(--editorial-font-sans)",
                  fontSize: "15px",
                  lineHeight: 1.65,
                  color: "var(--editorial-text-muted)",
                  maxWidth: "680px",
                  marginBottom: "36px",
                }}
              >
                We believe exceptional craftsmanship should be matched with frictionless service.
                If any piece fails to fit your expectations, our return process is designed to be effortless.
              </p>

              <div className="editorial-steps-grid">
                {steps.map((step) => (
                  <div key={step.num} className="editorial-step-card">
                    <div className="editorial-step-badge">{step.num}</div>
                    <h3 className="editorial-step-title">{step.title}</h3>
                    <p className="editorial-step-desc">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= RETURN POLICY GUIDELINES & EXCLUSIONS ================= */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "32px",
                marginBottom: "64px",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--editorial-border)",
                  borderRadius: "16px",
                  padding: "32px 28px",
                  boxShadow: "0 4px 16px -4px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <CheckCircle2 size={20} color="#15803d" />
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Eligible for Return & Exchange</h3>
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    fontSize: "13.5px",
                    lineHeight: 1.6,
                    color: "var(--editorial-text-muted)",
                  }}
                >
                  <li>Garments unworn, unwashed, with all original tags attached.</li>
                  <li>Footwear tested solely indoors on carpeted surfaces with zero outsole scuffs.</li>
                  <li>
                    Fragrance bottles where the outer security shrink-wrap remains sealed (every bottle
                    includes a complimentary 2ml test vial to experience the scent before breaking the seal).
                  </li>
                  <li>Home decor and tableware in original protective styrofoam and branded boxes.</li>
                </ul>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--editorial-border)",
                  borderRadius: "16px",
                  padding: "32px 28px",
                  boxShadow: "0 4px 16px -4px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <AlertCircle size={20} color="#b45309" />
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Non-Returnable Items</h3>
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    fontSize: "13.5px",
                    lineHeight: 1.6,
                    color: "var(--editorial-text-muted)",
                  }}
                >
                  <li>Intimate wear, boxers, and socks due to strict personal hygiene regulations.</li>
                  <li>Fragrance bottles where the primary packaging seal or bottle atomizer has been sprayed.</li>
                  <li>Items marked as "Final Archive Sale" or custom bespoke monogrammed pieces.</li>
                  <li>Returns initiated past 7 calendar days from the certified courier delivery timestamp.</li>
                </ul>
              </div>
            </div>

            {/* ================= CONCIERGE HELP CARD ================= */}
            <div
              style={{
                background: "linear-gradient(135deg, #fdfbf7 0%, #f6f0e4 100%)",
                border: "1px solid #ebd9c0",
                borderRadius: "16px",
                padding: "36px 32px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "24px",
              }}
            >
              <div>
                <span className="editorial-kicker">PERSONAL CONCIERGE</span>
                <h3 style={{ margin: "4px 0 8px", fontSize: "22px", fontFamily: "var(--editorial-font-serif)" }}>
                  Need Assistance with a Delivery or Return?
                </h3>
                <p style={{ margin: 0, fontSize: "14px", color: "var(--editorial-text-muted)", maxWidth: "560px" }}>
                  Our dedicated client advisors are on standby 7 days a week (9:00 AM – 8:00 PM IST)
                  to assist you with doorstep exchanges, pin code inquiries, or special delivery instructions.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <Link href="/contact" className="editorial-journal-btn">
                  <span>Contact Concierge</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/faq"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 20px",
                    border: "1px solid #111111",
                    background: "transparent",
                    color: "#111111",
                    borderRadius: "6px",
                    fontFamily: "var(--editorial-font-sans)",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    letterSpacing: "1.4px",
                    textTransform: "uppercase",
                    textDecoration: "none",
                  }}
                >
                  View FAQs
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
