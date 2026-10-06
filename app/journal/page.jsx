"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Clock,
  Calendar,
  X,
  Share2,
  Bookmark,
  Check,
} from "lucide-react";
import "../editorial.css";

const ARTICLES = [
  {
    id: "supima-cotton-craft",
    title: "The Architecture of Pure Organic Supima Cotton",
    tag: "Craftsmanship",
    date: "October 2026",
    readTime: "6 min read",
    author: "Elena Vance · Master Weaver & Textile Historian",
    image: "/images/slider/slide-opt-1.webp",
    snippet:
      "Why thread count is an incomplete metric, and how our partner mill in Gujarat spins extra-long staple fibers into whisper-weight garments built to endure decades of gentle washing.",
    content: [
      "In modern mass fashion, 'thread count' has been commodified into a deceptive marketing shortcut. Mass manufacturers frequently twist multiple low-grade, short-staple threads together to artificially inflate yarn counts, resulting in heavy, stiff fabrics that pill and unravel after merely five laundry cycles.",
      "At PrimeNest, we source exclusively from certified non-GMO extra-long staple (ELS) Supima cotton harvested along the fertile delta soils of Western India. Supima fibers measure an extraordinary 37% longer than standard upland cotton. When spun by master spinners with balanced tension, each yarn possesses twice the tensile strength, natural moisture permeability, and an unmatched cashmere-soft hand feel.",
      "Every single garment is pre-washed using rainwater recycling systems and finished with vegetable-based softening rinses. The result is a piece of quiet architectural luxury that contours gracefully to your silhouette and develops a richer, softer character over the years.",
    ],
  },
  {
    id: "olfactory-architecture",
    title: "Olfactory Architecture: The Anatomy of Niche Extrait de Parfum",
    tag: "Fragrance",
    date: "September 2026",
    readTime: "5 min read",
    author: "Henri Laurent · Grasse Trained Nose",
    image: "/images/slider/slide-opt-2.webp",
    snippet:
      "Deconstructing the 30% concentration formula, cold-maceration periods, and the sensory harmony between Indian sandalwood and Moroccan neroli.",
    content: [
      "Commercial eau de parfum formulas typically hover between 12% and 15% aromatic essence, heavily diluted with synthetic fixatives and commercial alcohol that flash off the skin within three hours.",
      "PrimeNest's fragrance collection is formulated as genuine Extrait de Parfum at a concentrated 28% to 32% dosage. Each batch undergoes a strict 90-day cold dark maceration period, allowing volatile top notes—such as Calabrian bergamot and hand-plucked neroli—to chemically marry with heavy resinous bases of sustainable Mysore sandalwood, aged labdanum, and ambergris.",
      "The result is an intimate sillage that does not overwhelm an enclosed room, but rather lingers gracefully on the wearer's collarbone and cuffs from morning dawn until well past twilight.",
    ],
  },
  {
    id: "vegetable-tanned-leather",
    title: "The Quiet Art of Heritage Vegetable Tanning",
    tag: "Craftsmanship",
    date: "September 2026",
    readTime: "7 min read",
    author: "Vikram Singhania · Leather Artisan",
    image: "/images/slider/slide-opt-3.webp",
    snippet:
      "Why chrome-tanning damages our river systems, and why we insist on 40-day tree-bark pits that yield full-grain patinas unique to every patron.",
    content: [
      "Over 90% of global leather goods are chrome-tanned in mere hours using harsh toxic chromium salts that severely pollute waterways. The leather feels uniform and plasticky, resisting aging until it eventually cracks and peels.",
      "In contrast, our footwear and small leather accessories rely on traditional vegetable tanning pits in Ranipet. Hides are soaked in slow, progressively concentrated baths of oak bark, chestnut extract, and mimosa tannins for over 40 uninterrupted days.",
      "This gentle, organic process preserves the hide's full-grain pore architecture. The leather breathes, absorbs the oils of your hands, and gradually develops a rich golden caramel patina that chronicles your personal voyages.",
    ],
  },
  {
    id: "capsule-wardrobe-philosophy",
    title: "A Capsule Wardrobe: Curating 12 Timeless Pieces",
    tag: "Style Notes",
    date: "August 2026",
    readTime: "4 min read",
    author: "Aarav Kapoor · Editorial Stylist",
    image: "/images/slider/slide-opt-4.webp",
    snippet:
      "Eliminate decision fatigue without sacrificing refinement. A disciplined guide to modular silhouettes that transition effortlessly from boardroom to seaside veranda.",
    content: [
      "True sartorial freedom does not come from an overflowing walk-in closet; it arises from intentional restraint. When every garment possesses harmonious proportions and a curated tonal palette, dressing becomes an act of effortless meditation.",
      "Our 12-piece essential capsule revolves around three principles: tonal cohesion (sand, espresso, ivory, slate), modular layering weights (200gsm cotton to 450gsm double-knit twill), and neutral structural tailoring that rejects fleeting micro-trends.",
    ],
  },
  {
    id: "sustainable-cellulose-packaging",
    title: "Zero Microplastics: Our Sustainable Cellulose Journey",
    tag: "Sustainability",
    date: "August 2026",
    readTime: "6 min read",
    author: "Maya Chen · Head of Sustainable Impact",
    image: "/images/slider/slide-opt-5.webp",
    snippet:
      "How we replaced petroleum polybags with 100% home-compostable cassava starch mailers and FSC-certified unbleached Japanese kraft paper.",
    content: [
      "E-commerce packaging is historically responsible for millions of tons of single-use polyethylene waste that persists in landfills for 500 years. We rejected this reality from our founding charter.",
      "Every PrimeNest order arrives enveloped in unbleached FSC-certified kraft cardboard secured with water-activated starch paper tape. Inside, garments are protected not by plastic, but by water-soluble cassava film that breaks down naturally in soil within 90 days without releasing toxic microplastics.",
    ],
  },
  {
    id: "tactile-living-ceramics",
    title: "The Tactile Home: Handwoven Linen & Raw Ceramics",
    tag: "Living",
    date: "July 2026",
    readTime: "5 min read",
    author: "Zoya Merchant · Interior Architect",
    image: "/images/slider/slide-opt-6.webp",
    snippet:
      "Curating everyday sanctuaries through natural slub linen, unglazed terracotta, and artisanal ambient lighting.",
    content: [
      "Our personal living spaces should serve as serene counterweights to the relentless digital hum of modern life. Incorporating raw, unglazed terracotta, wabi-sabi ceramic vessels, and hand-loomed slub linen creates sensory tactile grounding.",
      "These materials celebrate honest imperfections—the irregular knot in raw linen, the subtle firing blush on stoneware—reminding us of the human hands that shaped them.",
    ],
  },
];

const CATEGORIES = ["All", "Craftsmanship", "Fragrance", "Style Notes", "Sustainability", "Living"];

export default function JournalPage() {
  const [selectedTag, setSelectedTag] = useState("All");
  const [activeArticle, setActiveArticle] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const filteredArticles =
    selectedTag === "All"
      ? ARTICLES.slice(1)
      : ARTICLES.filter((a) => a.tag === selectedTag);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail("");
  };

  return (
    <div className="editorial-page-wrapper">
      <Navbar />

      <main className="editorial-main">
        {/* ================= HERO INTRO ================= */}
        <section className="editorial-journal-hero">
          <div className="editorial-container">
            <span className="editorial-kicker">PRIMENEST ATELIER · CHRONICLES</span>
            <h1 className="editorial-section-title" style={{ fontSize: "56px", margin: "10px 0 16px" }}>
              The PrimeNest <span className="editorial-italic">Journal.</span>
            </h1>
            <p className="editorial-hero-desc" style={{ maxWidth: "640px" }}>
              A curated anthology of essays exploring sartorial architecture, artisanal ateliers,
              olfactory craftsmanship, and the quiet beauty of deliberate living.
            </p>
          </div>
        </section>

        <section style={{ paddingBottom: "80px" }}>
          <div className="editorial-container">
            {/* ================= FEATURED LEAD STORY ================= */}
            <article className="editorial-journal-featured">
              <div className="editorial-journal-featured-media">
                <img
                  src={ARTICLES[0].image}
                  alt={ARTICLES[0].title}
                  className="editorial-journal-featured-img"
                />
              </div>

              <div className="editorial-journal-featured-content">
                <div className="editorial-journal-meta">
                  <span className="editorial-journal-tag">{ARTICLES[0].tag}</span>
                  <span>•</span>
                  <span>{ARTICLES[0].readTime}</span>
                  <span>•</span>
                  <span>{ARTICLES[0].date}</span>
                </div>

                <h2 className="editorial-journal-featured-title">
                  {ARTICLES[0].title}
                </h2>

                <p className="editorial-journal-featured-snippet">
                  {ARTICLES[0].snippet}
                </p>

                <button
                  type="button"
                  className="editorial-journal-btn"
                  onClick={() => setActiveArticle(ARTICLES[0])}
                >
                  <span>Read Full Essay</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </article>

            {/* ================= CATEGORY FILTER BAR ================= */}
            <div className="editorial-journal-filter-bar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`editorial-journal-filter-chip ${selectedTag === cat ? "active" : ""}`}
                  onClick={() => setSelectedTag(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* ================= ARTICLES GRID ================= */}
            <div className="editorial-journal-grid">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="editorial-journal-card"
                  onClick={() => setActiveArticle(article)}
                >
                  <div className="editorial-journal-card-media">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="editorial-journal-card-img"
                      loading="lazy"
                    />
                  </div>

                  <div className="editorial-journal-card-body">
                    <div className="editorial-journal-meta" style={{ marginBottom: "10px" }}>
                      <span className="editorial-journal-tag">{article.tag}</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                    </div>

                    <h3 className="editorial-journal-card-title">{article.title}</h3>
                    <p className="editorial-journal-card-snippet">{article.snippet}</p>

                    <div className="editorial-journal-card-footer">
                      <span>{article.date}</span>
                      <span className="editorial-journal-read-link">
                        Read Story <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* ================= GAZETTE NEWSLETTER BANNER ================= */}
            <div
              style={{
                background: "linear-gradient(135deg, #181512 0%, #2b251e 100%)",
                borderRadius: "20px",
                padding: "54px 44px",
                color: "#ffffff",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "40px",
                alignItems: "center",
                boxShadow: "0 20px 48px -12px rgba(24, 21, 18, 0.35)",
              }}
            >
              <div>
                <span
                  style={{
                    display: "inline-block",
                    fontFamily: "var(--font-jakarta), sans-serif",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "2.4px",
                    textTransform: "uppercase",
                    color: "#c5a059",
                    marginBottom: "12px",
                  }}
                >
                  THE SUNDAY GAZETTE
                </span>
                <h3
                  style={{
                    fontFamily: "var(--font-playfair), serif",
                    fontSize: "32px",
                    fontWeight: 600,
                    margin: "0 0 12px",
                    letterSpacing: "-0.4px",
                    lineHeight: 1.2,
                  }}
                >
                  Deliberate Thoughts, <span style={{ fontStyle: "italic", fontFamily: "var(--font-cormorant)" }}>Delivered Quietly.</span>
                </h3>
                <p
                  style={{
                    fontSize: "14.5px",
                    lineHeight: 1.65,
                    color: "#c8beaf",
                    margin: 0,
                  }}
                >
                  Receive private invitations to capsule unveilings, deep-dive artisan profiles, and
                  olfactory releases twice each month. No spam, ever.
                </p>
              </div>

              <div>
                {newsletterSubscribed ? (
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(197, 160, 89, 0.4)",
                      padding: "20px 24px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Check size={20} color="#c5a059" />
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#f7f2ea" }}>
                        Welcome to the Inner Circle.
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#c8beaf" }}>
                        Our next Sunday Gazette edition will arrive in your inbox.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="email"
                      placeholder="Enter your personal email..."
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      required
                      style={{
                        flex: 1,
                        background: "#ffffff",
                        border: "1px solid #d5cec2",
                        borderRadius: "8px",
                        padding: "14px 18px",
                        fontSize: "14px",
                        color: "#111111",
                        outline: "none",
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        background: "#c5a059",
                        color: "#181512",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0 24px",
                        fontFamily: "var(--font-jakarta), sans-serif",
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "1.4px",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.2s ease",
                      }}
                    >
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================= MODAL FULL ESSAY READER ================= */}
        {activeArticle && (
          <div
            className="editorial-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveArticle(null);
            }}
          >
            <div className="editorial-modal-container">
              <button
                type="button"
                className="editorial-modal-close"
                onClick={() => setActiveArticle(null)}
                aria-label="Close article modal"
              >
                <X size={18} />
              </button>

              <div className="editorial-journal-meta" style={{ marginBottom: "14px" }}>
                <span className="editorial-journal-tag">{activeArticle.tag}</span>
                <span>•</span>
                <span>{activeArticle.readTime}</span>
                <span>•</span>
                <span>{activeArticle.date}</span>
              </div>

              <h2
                style={{
                  fontFamily: "var(--editorial-font-serif)",
                  fontSize: "36px",
                  lineHeight: 1.15,
                  color: "var(--editorial-text)",
                  margin: "0 0 14px",
                  letterSpacing: "-0.5px",
                }}
              >
                {activeArticle.title}
              </h2>

              <p
                style={{
                  fontFamily: "var(--editorial-font-sans)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--editorial-kicker)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "24px",
                }}
              >
                Words by {activeArticle.author}
              </p>

              <div
                style={{
                  borderRadius: "14px",
                  overflow: "hidden",
                  marginBottom: "32px",
                  aspectRatio: "16 / 9",
                  background: "#eee6d9",
                }}
              >
                <img
                  src={activeArticle.image}
                  alt={activeArticle.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {activeArticle.content.map((paragraph, idx) => (
                  <p
                    key={idx}
                    style={{
                      fontFamily: "var(--editorial-font-sans)",
                      fontSize: "16px",
                      lineHeight: 1.8,
                      color: "#37342f",
                      margin: 0,
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div
                style={{
                  borderTop: "1px solid var(--editorial-border)",
                  marginTop: "36px",
                  paddingTop: "24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "12px", color: "var(--editorial-kicker)", fontWeight: 600 }}>
                  PRIME NEST EDITORIAL ATELIER
                </span>
                <Link
                  href="/shop"
                  className="editorial-journal-btn"
                  style={{ alignSelf: "auto" }}
                  onClick={() => setActiveArticle(null)}
                >
                  Explore Collection
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
