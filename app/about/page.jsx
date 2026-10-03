"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Sparkles,
  ShieldCheck,
  Leaf,
  HeartHandshake,
  ArrowRight,
  Compass,
  Award,
  ChevronDown,
} from "lucide-react";

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState(0);

  const pillars = [
    {
      icon: Sparkles,
      title: "Timeless Design",
      desc: "Pieces created beyond fleeting trends, engineered to remain wardrobe staples season after season.",
    },
    {
      icon: ShieldCheck,
      title: "Honest Materials",
      desc: "From organic combed cotton to supple full-grain leathers, sourced with complete traceability.",
    },
    {
      icon: Leaf,
      title: "Sustainable Ethos",
      desc: "Minimal plastic, zero-waste packaging, and carbon-neutral distribution across all collections.",
    },
    {
      icon: HeartHandshake,
      title: "Crafted With Care",
      desc: "Small-batch artisanship, meticulous stitching, and rigorous testing before any item arrives at your door.",
    },
  ];

  const storyMilestones = [
    {
      icon: Sparkles,
      label: "2023 · The Beginning",
      title: "Founded with 12 essential menswear pieces",
      desc: "Started in Ahmedabad with a mission to bring quiet luxury and tailored ease to modern wardrobes.",
    },
    {
      icon: Compass,
      label: "2024 · Expansion",
      title: "Footwear & fine niche fragrances",
      desc: "Partnered with master perfumers and heritage cobblers to curate sensory daily essentials.",
    },
    {
      icon: Award,
      label: "2026 · Growing Community",
      title: "Over 50,000 discerning patrons nationwide",
      desc: "Continuing to champion sustainable manufacturing, intentional curation, and personal customer service.",
    },
  ];

  const aboutFaqs = [
    {
      question: "Where are PrimeNest products manufactured?",
      answer:
        "We collaborate with artisanal ateliers in Ahmedabad, Jaipur, and Tirupur for our apparel, and master perfumers in Grasse and Kannauj for our bespoke fragrance lines. Every workshop adheres strictly to fair labor standards and sustainable working conditions.",
    },
    {
      question: "How do you ensure sustainable and ethical sourcing?",
      answer:
        "All our cotton is GOTS-certified organic, our leather is vegetable-tanned using non-toxic natural tannins, and 100% of our transit packaging is recyclable FSC-certified paper and biodegradable cassava mailers.",
    },
    {
      question: "What makes PrimeNest craftsmanship unique?",
      answer:
        "Unlike fast fashion brands that cut corners on thread tension and seam density, we use high-density reinforced seams, custom-milled textiles, and rigorous wash-cycle tests ensuring your garments retain their shape and softness year after year.",
    },
    {
      question: "Do your products come with a quality guarantee?",
      answer:
        "Yes, every PrimeNest purchase is backed by our 1-year Craftsmanship Guarantee. If any item experiences manufacturing or material defects under normal wear, we will repair or replace it free of charge.",
    },
  ];

  return (
    <div className="editorial-page-wrapper">
      <Navbar />

      <main className="editorial-main">
        {/* ================= HERO SECTION ================= */}
        <section className="editorial-hero-section">
          <div className="editorial-container">
            <div className="editorial-hero-grid">
              <div className="editorial-hero-content">
                <span className="editorial-kicker">ABOUT PRIMENEST</span>
                <h1
                  className="editorial-hero-title"
                  style={{
                    fontFamily:
                      'var(--font-playfair), "Playfair Display", "Cormorant Garamond", Georgia, serif',
                  }}
                >
                  Designed with <br />
                  <span
                    className="editorial-italic"
                    style={{
                      fontFamily:
                        'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
                      fontStyle: "italic",
                    }}
                  >
                    purpose & care.
                  </span>
                </h1>
                <p className="editorial-hero-desc">
                  Born out of a desire for timeless aesthetics, uncompromising
                  quality, and everyday luxury made accessible.
                </p>
                <div className="editorial-hero-divider">
                  <span className="editorial-divider-line" />
                  <span className="editorial-tagline">
                    CURATED ESSENTIALS. SUSTAINABLE LUXURY.
                  </span>
                </div>
              </div>

              <div className="editorial-hero-media">
                <div className="editorial-image-frame">
                  <img
                    src="/images/about_hero.jpg"
                    alt="PrimeNest Atelier and Craftsmanship"
                    className="editorial-hero-img"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= OUR PHILOSOPHY SECTION ================= */}
        <section className="editorial-support-section">
          <div className="editorial-container">
            <div className="editorial-support-header">
              <span className="editorial-kicker">OUR PHILOSOPHY</span>
              <h2
                className="editorial-section-title"
                style={{
                  fontFamily:
                    'var(--font-playfair), "Playfair Display", "Cormorant Garamond", Georgia, serif',
                }}
              >
                Crafted for the <br />
                modern life.
              </h2>
            </div>

            <div className="editorial-cards-grid">
              {pillars.map((pillar, idx) => {
                const IconComponent = pillar.icon;
                return (
                  <div key={idx} className="editorial-support-card">
                    <div className="editorial-card-icon">
                      <IconComponent size={24} strokeWidth={1.4} />
                    </div>
                    <h3 className="editorial-card-title">{pillar.title}</h3>
                    <p className="editorial-card-desc">{pillar.desc}</p>
                    <div className="editorial-card-arrow">
                      <ArrowRight size={18} strokeWidth={1.6} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= THE JOURNEY & FOUNDER LETTER ================= */}
        <section className="editorial-form-section">
          <div className="editorial-container">
            <div className="editorial-contact-grid">
              {/* Left Column: The Journey */}
              <div className="editorial-contact-info">
                <span className="editorial-kicker">THE JOURNEY</span>
                <h2
                  className="editorial-section-title"
                  style={{
                    fontFamily:
                      'var(--font-playfair), "Playfair Display", "Cormorant Garamond", Georgia, serif',
                  }}
                >
                  The PrimeNest story.
                </h2>
                <p className="editorial-info-sub">
                  Founded in Ahmedabad, PrimeNest began with a simple question:
                  why should understated elegance and premium craftsmanship cost
                  a fortune?
                </p>

                <div className="editorial-contact-items">
                  {storyMilestones.map((milestone, idx) => {
                    const MilestoneIcon = milestone.icon;
                    return (
                      <div key={idx} className="editorial-contact-item">
                        <div className="editorial-item-icon-circle">
                          <MilestoneIcon size={20} strokeWidth={1.6} />
                        </div>
                        <div className="editorial-item-body">
                          <span className="editorial-item-label">
                            {milestone.label}
                          </span>
                          <span className="editorial-item-value">
                            {milestone.title}
                          </span>
                          <span className="editorial-item-hint">
                            {milestone.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Founder Letter Card */}
              <div className="pn-form-card">
                <span className="pn-form-kicker">A LETTER FROM OUR TEAM</span>
                <h3
                  className="pn-form-title"
                  style={{
                    fontFamily:
                      'var(--font-playfair), "Playfair Display", "Cormorant Garamond", Georgia, serif',
                    fontSize: "26px",
                    fontWeight: 600,
                    color: "#111111",
                    margin: "0 0 16px 0",
                    lineHeight: 1.25,
                  }}
                >
                  Simplicity is the ultimate sophistication.
                </h3>

                <div className="editorial-letter-body">
                  <p>
                    We believe true luxury isn’t about loud logos or fleeting
                    hype. It’s the softness of a tailored weave against your skin,
                    the subtle lingering scent of bergamot and cedarwood, and the
                    quiet confidence of knowing everything in your home was chosen
                    with intention.
                  </p>
                  <p>
                    Every piece we create undergoes months of prototyping,
                    material testing, and refinement before it ever reaches your
                    wardrobe. We partner directly with artisan mills to cut out
                    inflated markups, delivering honest luxury directly to you.
                  </p>
                </div>

                <div className="editorial-signature-wrap">
                  <div
                    className="editorial-sign-name"
                    style={{
                      fontFamily:
                        'var(--font-playfair), "Playfair Display", Georgia, serif',
                      fontSize: "18px",
                      fontWeight: 600,
                      fontStyle: "italic",
                      color: "#111111",
                    }}
                  >
                    The PrimeNest Team
                  </div>
                  <div className="editorial-sign-city">
                    Ahmedabad, Gujarat, India
                  </div>
                </div>

                <Link
                  href="/shop"
                  className="pn-form-submit-btn"
                  style={{
                    display: "inline-flex",
                    textAlign: "center",
                    textDecoration: "none",
                    marginTop: "20px",
                    height: "48px",
                    backgroundColor: "#111111",
                    color: "#ffffff",
                    borderRadius: "7px",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    fontSize: "11.5px",
                  }}
                >
                  EXPLORE THE COLLECTION →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================= VALUES FAQ SECTION ================= */}
        <section className="editorial-faq-section">
          <div className="editorial-container">
            <div className="editorial-faq-grid">
              <div className="editorial-faq-header">
                <span className="editorial-kicker">OUR COMMITMENT</span>
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
                  Learn more about our sustainable sourcing standards,
                  material integrity, and brand promise.
                </p>
              </div>

              <div className="editorial-faq-accordion">
                <div className="editorial-faq-list">
                  {aboutFaqs.map((faq, idx) => {
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
                  <Link href="/contact" className="editorial-faq-more-btn">
                    CONTACT OUR ATELIER →
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
