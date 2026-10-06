"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search,
  X,
  ChevronDown,
  HelpCircle,
  Package,
  Truck,
  RotateCcw,
  Sparkles,
  Ruler,
  CreditCard,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import "../editorial.css";

const FAQ_DATA = [
  {
    category: "Orders & Tracking",
    question: "How do I track the delivery status of my PrimeNest order?",
    answer:
      "As soon as your parcel is dispatched from our central fulfillment atelier, you will receive an automated email and SMS notification containing your AWB tracking number and a direct live-tracking link. You can also monitor real-time courier checkpoints anytime on our Shipping & Returns tracking portal or under your PrimeNest Account dashboard.",
  },
  {
    category: "Orders & Tracking",
    question: "Can I modify or cancel an order after it has been placed?",
    answer:
      "We prepare orders swiftly to guarantee express transit. If you need to update a delivery address, alter item sizing, or cancel an order, please contact our Client Concierge via WhatsApp or email within 60 minutes of placing the order. Once an order reaches the transit dispatch stage, it cannot be canceled, but you may take advantage of our complimentary 7-day return policy upon arrival.",
  },
  {
    category: "Orders & Tracking",
    question: "Do you offer gift wrapping and personalized handwritten notes?",
    answer:
      "Yes. Every PrimeNest order arrives in our signature unbleached gift box tied with natural cotton twill ribbon. During checkout, you can select 'Complimentary Gift Note' to include a custom personalized message, which our atelier team handsomely pens on heavy cardstock.",
  },
  {
    category: "Shipping & Delivery",
    question: "What are your shipping rates and estimated delivery timelines?",
    answer:
      "We provide Free Express Delivery across India on all orders over ₹1,999. Orders below ₹1,999 incur a standard nominal ₹99 shipping fee. Delivery across major metro corridors (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Ahmedabad, Pune) takes 2 to 4 business days. Regional and non-metro pin codes take 4 to 6 business days.",
  },
  {
    category: "Shipping & Delivery",
    question: "Do you ship internationally?",
    answer:
      "Yes, PrimeNest ships to over 40 countries, including the United States, United Kingdom, UAE, Singapore, Canada, and Australia via DHL Express. International transit typically takes 5 to 8 business days. Customs duties, local taxes, and import tariffs are calculated at checkout where supported.",
  },
  {
    category: "Shipping & Delivery",
    question: "What should I do if my parcel shows delivered but I haven't received it?",
    answer:
      "Occasionally couriers mark shipments delivered prior to final handover or leave parcels with building reception/security desks. First check with household members or building concierge. If your parcel is not located within 4 hours, notify our support team immediately; we will initiate an urgent courier trace and dispatch a priority replacement if needed.",
  },
  {
    category: "Returns & Refunds",
    question: "What is PrimeNest's return and exchange policy?",
    answer:
      "We offer a 7-day hassle-free return and exchange policy starting from the certified courier delivery date. Items must be unworn, unwashed, and in their original packaging with all tags attached. We provide free doorstep courier pickup—you never have to print shipping labels or drop parcels off at a depot.",
  },
  {
    category: "Returns & Refunds",
    question: "How long does it take to receive my refund?",
    answer:
      "Once our atelier inspects the returned parcel (typically within 24 hours of receipt), refunds are processed immediately. Credit/debit card and net banking refunds reflect in your bank account within 3 to 5 business days. UPI refunds are credited instantly.",
  },
  {
    category: "Returns & Refunds",
    question: "Can I return fragrances or personal care products?",
    answer:
      "To guarantee hygiene and product integrity, fragrance bottles are only returnable if the external tamper-proof seal and cellophane shrink-wrap remain completely unopened. Every PrimeNest fragrance bottle includes a complimentary 2ml sample vial in the shipping box so you can trial the aroma on your skin before unsealing the full-size bottle.",
  },
  {
    category: "Authenticity & Materials",
    question: "How do I know my PrimeNest purchase is genuine and authentic?",
    answer:
      "PrimeNest is the creator and direct atelier for all our collections. We do not work through third-party liquidators or unauthorized brokers. Every garment, accessory, and fragrance bottle comes with an authenticated batch certificate and numbered security seal guaranteeing pure origin and ethical sourcing.",
  },
  {
    category: "Authenticity & Materials",
    question: "Where are your textiles and materials sourced?",
    answer:
      "Our cotton is GOTS-certified extra-long staple Supima cotton spun in Gujarat and Tirupur. Our leathers are exclusively full-grain hides vegetable-tanned in traditional oak bark pits in Ranipet. Our fragrance oils are distilled in Grasse, France and Kannauj, India using slow steam extraction.",
  },
  {
    category: "Authenticity & Materials",
    question: "Do your products come with a warranty?",
    answer:
      "Yes. All PrimeNest apparel, leather footwear, and home decor items are protected by our 1-Year Craftsmanship Guarantee. If any seam, zipper, hardware, or sole exhibits a manufacturing defect under normal everyday wear, our atelier will repair or replace the item free of charge.",
  },
  {
    category: "Sizing & Fit",
    question: "How do PrimeNest garments and footwear fit?",
    answer:
      "Our apparel is tailored with relaxed contemporary proportions inspired by modern European tailoring. Footwear runs true to European sizing (EU 40–45). We provide precise measurement charts (chest, shoulder, sleeve, inseam) in both inches and centimeters on every product page. If you are between sizes, we recommend sizing down for a tailored look or sizing up for a relaxed drape.",
  },
  {
    category: "Sizing & Fit",
    question: "Can I exchange an item for a different size?",
    answer:
      "Absolutely. Size exchanges are 100% complimentary. When requesting an exchange, select 'Exchange for Size'. Our courier will arrive at your door with the replacement size while simultaneously retrieving the original item.",
  },
  {
    category: "Payments & Security",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards (Visa, MasterCard, American Express, RuPay), UPI (Google Pay, PhonePe, Paytm), Net Banking across 50+ Indian banks, and flexible interest-free EMI plans. Cash on Delivery (COD) is available on orders up to ₹10,000.",
  },
  {
    category: "Payments & Security",
    question: "Is my payment information and credit card data secure?",
    answer:
      "Yes. All transactions are processed through bank-grade 256-bit SSL encrypted PCI-DSS Level 1 compliant payment gateways (Razorpay and Stripe). PrimeNest never stores, views, or logs your credit card number, CVV, or banking credentials.",
  },
];

const CATEGORIES = [
  "All Topics",
  "Orders & Tracking",
  "Shipping & Delivery",
  "Returns & Refunds",
  "Authenticity & Materials",
  "Sizing & Fit",
  "Payments & Security",
];

export default function FaqPage() {
  const [selectedCat, setSelectedCat] = useState("All Topics");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(0);

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory =
        selectedCat === "All Topics" || item.category === selectedCat;

      if (!searchQuery.trim()) return matchesCategory;

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCat, searchQuery]);

  return (
    <div className="editorial-page-wrapper">
      <Navbar />

      <main className="editorial-main">
        {/* ================= HERO INTRO ================= */}
        <section className="editorial-journal-hero" style={{ paddingBottom: "36px" }}>
          <div className="editorial-container" style={{ textAlign: "center" }}>
            <span className="editorial-kicker">CLIENT CONCIERGE · KNOWLEDGE BASE</span>
            <h1 className="editorial-section-title" style={{ fontSize: "52px", margin: "10px 0 16px" }}>
              Frequently Asked <span className="editorial-italic">Questions.</span>
            </h1>
            <p
              className="editorial-hero-desc"
              style={{ maxWidth: "620px", margin: "0 auto 36px" }}
            >
              Clear, transparent answers regarding orders, craftsmanship, sizing, doorstep returns,
              and secure transactions.
            </p>

            {/* ================= LIVE SEARCH BAR ================= */}
            <div className="editorial-faq-search-box">
              <Search size={18} className="editorial-faq-search-icon" />
              <input
                type="text"
                placeholder="Search any question (e.g. shipping time, sizing, refunds, Supima cotton)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="editorial-faq-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="editorial-faq-search-clear"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* ================= CATEGORY PILLS ================= */}
            <div className="editorial-faq-nav-pills">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`editorial-faq-nav-pill ${selectedCat === cat ? "active" : ""}`}
                  onClick={() => setSelectedCat(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FAQ LIST ACCORDION ================= */}
        <section style={{ paddingBottom: "80px" }}>
          <div className="editorial-container" style={{ maxWidth: "860px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <span style={{ fontSize: "12px", color: "var(--editorial-kicker)", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
                Showing {filteredFaqs.length} {filteredFaqs.length === 1 ? "Result" : "Results"}
              </span>
              {(selectedCat !== "All Topics" || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCat("All Topics");
                    setSearchQuery("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#926f34",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Reset Filters
                </button>
              )}
            </div>

            {filteredFaqs.length === 0 ? (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--editorial-border)",
                  borderRadius: "14px",
                  padding: "48px 24px",
                  textAlign: "center",
                }}
              >
                <HelpCircle size={36} color="#8c877d" style={{ marginBottom: "12px" }} />
                <h3 style={{ fontSize: "20px", margin: "0 0 8px" }}>No matching answers found</h3>
                <p style={{ fontSize: "14px", color: "var(--editorial-text-muted)", margin: "0 0 20px" }}>
                  We could not find an answer matching "{searchQuery}". Our concierge is readily available to assist you.
                </p>
                <Link href="/contact" className="editorial-journal-btn" style={{ alignSelf: "auto" }}>
                  Ask Our Concierge
                </Link>
              </div>
            ) : (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--editorial-border)",
                  borderRadius: "18px",
                  overflow: "hidden",
                  boxShadow: "0 6px 24px -6px rgba(0, 0, 0, 0.04)",
                  padding: "8px 28px",
                }}
              >
                {filteredFaqs.map((faq, idx) => {
                  const isOpen = openIndex === idx;
                  return (
                    <div
                      key={idx}
                      style={{
                        borderBottom: idx === filteredFaqs.length - 1 ? "none" : "1px solid #f0ebe2",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? null : idx)}
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "22px 0",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          gap: "16px",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span
                            style={{
                              fontSize: "10.5px",
                              fontWeight: 700,
                              letterSpacing: "1.2px",
                              textTransform: "uppercase",
                              color: "#8c713f",
                            }}
                          >
                            {faq.category}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--editorial-font-sans)",
                              fontSize: "16px",
                              fontWeight: 600,
                              color: "var(--editorial-text)",
                              lineHeight: 1.4,
                            }}
                          >
                            {faq.question}
                          </span>
                        </div>

                        <ChevronDown
                          size={18}
                          color="#78716c"
                          style={{
                            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                            flexShrink: 0,
                          }}
                        />
                      </button>

                      {isOpen && (
                        <div style={{ paddingBottom: "22px", animation: "subcatSlideDown 0.2s ease" }}>
                          <p
                            style={{
                              fontFamily: "var(--editorial-font-sans)",
                              fontSize: "14.5px",
                              lineHeight: 1.75,
                              color: "var(--editorial-text-muted)",
                              margin: 0,
                            }}
                          >
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= STILL HAVE QUESTIONS CARD ================= */}
            <div
              style={{
                marginTop: "48px",
                background: "var(--editorial-bg-alt)",
                border: "1px solid var(--editorial-border)",
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
                <span className="editorial-kicker">STILL HAVE QUESTIONS?</span>
                <h3
                  style={{
                    fontFamily: "var(--editorial-font-serif)",
                    fontSize: "24px",
                    fontWeight: 600,
                    margin: "4px 0 8px",
                  }}
                >
                  Speak with our Atelier Concierge
                </h3>
                <p style={{ fontSize: "14px", color: "var(--editorial-text-muted)", margin: 0, maxWidth: "480px" }}>
                  Can't find the answer you need? Our personal styling advisors and client service
                  specialists are available 7 days a week.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <Link href="/contact" className="editorial-journal-btn">
                  <span>Send a Message</span>
                  <ArrowRight size={14} />
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
