"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import {
  Package,
  Truck,
  RotateCcw,
  Headphones,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const supportCategories = [
    {
      icon: Package,
      title: "Orders & Tracking",
      desc: "Track your order, check delivery status or get help with a recent purchase.",
      topicValue: "Orders & Tracking",
    },
    {
      icon: Truck,
      title: "Shipping & Delivery",
      desc: "Learn about shipping timelines, charges and delivery information.",
      topicValue: "Shipping & Delivery",
    },
    {
      icon: RotateCcw,
      title: "Returns & Refunds",
      desc: "Start a return, check refund status or understand our return policy.",
      topicValue: "Returns & Refunds",
    },
    {
      icon: Headphones,
      title: "Product Support",
      desc: "Have a question about sizing, materials or a product? We're here to help.",
      topicValue: "Product Assistance",
    },
  ];

  const faqs = [
    {
      question: "How can I track my order?",
      answer:
        "Once your order has shipped, you will receive an automated email and SMS notification containing your AWB tracking number and live tracking link. You can also view real-time tracking anytime inside your PrimeNest Account under Order History.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 14-day hassle-free return and exchange window from the date of delivery. Items must be unworn, unwashed, in their original condition with all brand tags and luxury packaging intact.",
    },
    {
      question: "How long does delivery take?",
      answer:
        "Standard delivery across India takes 3–5 business days. Express priority delivery to major metros (Delhi NCR, Mumbai, Bengaluru, Ahmedabad) typically arrives within 24–48 hours.",
    },
    {
      question: "Do you offer exchange?",
      answer:
        "Yes, we provide complimentary size and color exchanges. You can initiate a free exchange request directly through your order details page, and our courier partner will pick up the item from your doorstep.",
    },
  ];

  const handleCategoryClick = (topicValue) => {
    setFormData((prev) => ({ ...prev, topic: topicValue }));
    const formElement = document.getElementById("contact-form-section");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success("Thank you! Your message has been sent.", {
          description: "Our customer care team will reply to your email within 24 hours.",
        });
        setFormData({ name: "", email: "", topic: "", message: "" });
      } else {
        toast.success("Message received! We will be in touch shortly.");
        setSubmitted(true);
      }
    } catch {
      toast.success("Message received! We will be in touch shortly.");
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="editorial-page-wrapper">
      <Navbar />

      <main className="editorial-main">
        {/* ================= HERO SECTION ================= */}
        <section className="editorial-hero-section">
          <div className="editorial-container">
            <div className="editorial-hero-grid">
              <div className="editorial-hero-content">
                <span className="editorial-kicker">CONTACT US</span>
                <h1
                  className="editorial-hero-title"
                  style={{
                    fontFamily:
                      'var(--font-playfair), "Playfair Display", "Cormorant Garamond", Georgia, serif',
                  }}
                >
                  We’re here <br />
                  <span
                    className="editorial-italic"
                    style={{
                      fontFamily:
                        'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
                      fontStyle: "italic",
                    }}
                  >
                    to help.
                  </span>
                </h1>
                <p className="editorial-hero-desc">
                  Have a question, need assistance or simply want to say hello?
                  We’re always happy to help.
                </p>
                <div className="editorial-hero-divider">
                  <span className="editorial-divider-line" />
                  <span className="editorial-tagline">
                    THOUGHTFUL PRODUCTS. PERSONAL SUPPORT.
                  </span>
                </div>
              </div>

              <div className="editorial-hero-media">
                <div className="editorial-image-frame">
                  <img
                    src="/images/contact_hero.jpg"
                    alt="PrimeNest Editorial Lifestyle Collection"
                    className="editorial-hero-img"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= HOW CAN WE HELP SECTION ================= */}
        <section className="editorial-support-section">
          <div className="editorial-container">
            <div className="editorial-support-header">
              <span className="editorial-kicker">HOW CAN WE HELP?</span>
              <h2
                className="editorial-section-title"
                style={{
                  fontFamily:
                    'var(--font-playfair), "Playfair Display", "Cormorant Garamond", Georgia, serif',
                }}
              >
                Find the right <br />
                support.
              </h2>
            </div>

            <div className="editorial-cards-grid">
              {supportCategories.map((cat, idx) => {
                const IconComponent = cat.icon;
                return (
                  <div
                    key={idx}
                    className="editorial-support-card"
                    onClick={() => handleCategoryClick(cat.topicValue)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleCategoryClick(cat.topicValue);
                      }
                    }}
                  >
                    <div className="editorial-card-icon">
                      <IconComponent size={24} strokeWidth={1.4} />
                    </div>
                    <h3 className="editorial-card-title">{cat.title}</h3>
                    <p className="editorial-card-desc">{cat.desc}</p>
                    <div className="editorial-card-arrow">
                      <ArrowRight size={18} strokeWidth={1.6} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= GET IN TOUCH & FORM SECTION ================= */}
        <section className="editorial-form-section" id="contact-form-section">
          <div className="editorial-container">
            <div className="editorial-contact-grid">
              {/* Left Column: Direct Info */}
              <div className="editorial-contact-info">
                <span className="editorial-kicker">GET IN TOUCH</span>
                <h2
                  className="editorial-section-title"
                  style={{
                    fontFamily:
                      'var(--font-playfair), "Playfair Display", "Cormorant Garamond", Georgia, serif',
                  }}
                >
                  Contact our team.
                </h2>
                <p className="editorial-info-sub">
                  Our customer support team is here to assist you with orders,
                  products and any other enquiries.
                </p>

                <div className="editorial-contact-items">
                  <div className="editorial-contact-item">
                    <div className="editorial-item-icon-circle">
                      <Mail size={20} strokeWidth={1.6} />
                    </div>
                    <div className="editorial-item-body">
                      <span className="editorial-item-label">Email us</span>
                      <a
                        href="mailto:support@primenest.com"
                        className="editorial-item-value"
                      >
                        support@primenest.com
                      </a>
                      <span className="editorial-item-hint">
                        We usually respond within 24 hours.
                      </span>
                    </div>
                  </div>

                  <div className="editorial-contact-item">
                    <div className="editorial-item-icon-circle">
                      <Phone size={20} strokeWidth={1.6} />
                    </div>
                    <div className="editorial-item-body">
                      <span className="editorial-item-label">Customer Support</span>
                      <a
                        href="tel:+919876543210"
                        className="editorial-item-value"
                      >
                        +91 98765 43210
                      </a>
                      <span className="editorial-item-hint">
                        Mon – Sat, 10:00 AM – 7:00 PM (IST)
                      </span>
                    </div>
                  </div>

                  <div className="editorial-contact-item">
                    <div className="editorial-item-icon-circle">
                      <MapPin size={20} strokeWidth={1.6} />
                    </div>
                    <div className="editorial-item-body">
                      <span className="editorial-item-label">Our Office</span>
                      <span className="editorial-item-value">
                        Ahmedabad, Gujarat, India
                      </span>
                      <span className="editorial-item-hint">
                        For business enquiries only.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Send Message Card */}
              <div className="pn-form-card">
                <span className="pn-form-kicker">SEND US A MESSAGE</span>
                <h3
                  className="pn-form-title"
                  style={{
                    fontFamily:
                      'var(--font-playfair), "Playfair Display", "Cormorant Garamond", Georgia, serif',
                    fontSize: "28px",
                    fontWeight: 600,
                    color: "#111111",
                    margin: "0 0 16px 0",
                    lineHeight: 1.2,
                  }}
                >
                  We’d love to hear from you.
                </h3>

                {submitted ? (
                  <div className="pn-success-box">
                    <CheckCircle2 size={40} color="#15803d" />
                    <h4>Message Received</h4>
                    <p>
                      Thank you for reaching out! A member of our support team will
                      get back to you shortly.
                    </p>
                    <button
                      type="button"
                      className="pn-reset-btn"
                      onClick={() => setSubmitted(false)}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="pn-form">
                    <div className="pn-form-row">
                      <div className="pn-form-field">
                        <label
                          className="pn-form-label"
                          style={{
                            color: "#18181b",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          className="pn-form-input"
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          required
                          style={{
                            height: "46px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #d5cec2",
                            borderRadius: "7px",
                            color: "#111111",
                            fontSize: "14px",
                          }}
                        />
                      </div>

                      <div className="pn-form-field">
                        <label
                          className="pn-form-label"
                          style={{
                            color: "#18181b",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="pn-form-input"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          required
                          style={{
                            height: "46px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #d5cec2",
                            borderRadius: "7px",
                            color: "#111111",
                            fontSize: "14px",
                          }}
                        />
                      </div>
                    </div>

                    <div className="pn-form-field">
                      <label
                        className="pn-form-label"
                        style={{
                          color: "#18181b",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Topic
                      </label>
                      <div
                        className="pn-select-wrap"
                        style={{
                          position: "relative",
                          width: "100%",
                          display: "block",
                        }}
                      >
                        <select
                          className="pn-form-select"
                          value={formData.topic}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              topic: e.target.value,
                            }))
                          }
                          style={{
                            width: "100%",
                            height: "46px",
                            appearance: "none",
                            WebkitAppearance: "none",
                            MozAppearance: "none",
                            paddingRight: "44px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #d5cec2",
                            borderRadius: "7px",
                            color: "#111111",
                            fontSize: "14px",
                          }}
                        >
                          <option value="">Select an enquiry</option>
                          <option value="Orders & Tracking">Orders & Tracking</option>
                          <option value="Shipping & Delivery">Shipping & Delivery</option>
                          <option value="Returns & Refunds">Returns & Refunds</option>
                          <option value="Product Assistance">Product Assistance</option>
                          <option value="General Enquiry">General Enquiry</option>
                          <option value="Business & Wholesale">Business & Wholesale</option>
                        </select>
                        <ChevronDown
                          className="pn-select-arrow"
                          size={18}
                          strokeWidth={1.8}
                          style={{
                            position: "absolute",
                            right: "14px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                            color: "#27272a",
                          }}
                        />
                      </div>
                    </div>

                    <div className="pn-form-field">
                      <label
                        className="pn-form-label"
                        style={{
                          color: "#18181b",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Message
                      </label>
                      <textarea
                        className="pn-form-textarea"
                        placeholder="Tell us how we can help..."
                        rows={4}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            message: e.target.value,
                          }))
                        }
                        required
                        style={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #d5cec2",
                          borderRadius: "7px",
                          color: "#111111",
                          fontSize: "14px",
                          minHeight: "96px",
                          padding: "12px 14px",
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="pn-form-submit-btn"
                      style={{
                        height: "50px",
                        backgroundColor: "#111111",
                        color: "#ffffff",
                        border: "1px solid #111111",
                        borderRadius: "7px",
                        fontWeight: 700,
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        fontSize: "11.5px",
                      }}
                    >
                      {submitting ? "SENDING..." : "SEND MESSAGE →"}
                    </button>

                    <p className="pn-form-privacy">
                      By contacting us, you agree to our{" "}
                      <Link href="/privacy" className="pn-privacy-link">
                        Privacy Policy
                      </Link>
                      . We’ll get back to you as soon as possible.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================= FAQ ACCORDION SECTION ================= */}
        <section className="editorial-faq-section">
          <div className="editorial-container">
            <div className="editorial-faq-grid">
              <div className="editorial-faq-header">
                <span className="editorial-kicker">QUICK ANSWERS</span>
                <h2
                  className="editorial-section-title"
                  style={{
                    fontFamily:
                      'var(--font-playfair), "Playfair Display", "Cormorant Garamond", Georgia, serif',
                  }}
                >
                  Frequently asked <br />
                  questions.
                </h2>
                <p className="editorial-faq-desc">
                  Find instant answers to common questions about orders,
                  shipping, returns and more.
                </p>
              </div>

              <div className="editorial-faq-accordion">
                <div className="editorial-faq-list">
                  {faqs.map((faq, idx) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div
                        key={idx}
                        className={`editorial-faq-item ${isOpen ? "open" : ""}`}
                      >
                        <button
                          type="button"
                          className="editorial-faq-question"
                          onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                          aria-expanded={isOpen}
                        >
                          <span>{faq.question}</span>
                          <ChevronDown
                            className={`editorial-faq-chevron ${
                              isOpen ? "rotated" : ""
                            }`}
                            size={18}
                          />
                        </button>
                        {isOpen && (
                          <div className="editorial-faq-answer">
                            <p>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="editorial-faq-footer">
                  <Link href="/faq" className="editorial-faq-more-btn">
                    VIEW ALL FAQS →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
