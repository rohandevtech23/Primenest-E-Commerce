"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    theme: "Welcome Collection",
    eyebrow: "WELCOME TO PRIMENEST",
    title: "Everything For Everyone",
    subtitle: "Best Quality, Best Prices!",
    description: "Discover a wide range of clothing, shoes and accessories handpicked just for you.",
    badge: "New Arrivals",
    image: "/images/slider/slide-opt-1.webp",
    fallbackImage: "/images/slider/slide-opt-1.jpg",
    link: "/shop",
    category: "Featured Catalog",
    accentColor: "#b45309",
  },
  {
    id: 2,
    theme: "Women's Collection",
    eyebrow: "LIVE BEAUTIFULLY",
    title: "Women's Fashion Collection",
    subtitle: "Trendy styles for every occasion",
    description: "Trendy styles for every occasion. Because every woman's style is unique.",
    badge: "Women's Fashion",
    image: "/images/slider/slide-opt-3.webp",
    fallbackImage: "/images/slider/slide-opt-3.jpg",
    link: "/shop?category=women",
    category: "Women's Fashion",
    accentColor: "#c2410c",
  },
  {
    id: 3,
    theme: "Men's Collection",
    eyebrow: "MODERN MENSWEAR",
    title: "Style for Every Journey",
    subtitle: "Timeless fashion for the modern man",
    description: "Handcrafted tailoring and timeless essentials designed for every occasion.",
    badge: "Men's Fashion",
    image: "/images/slider/slide-opt-4.webp",
    fallbackImage: "/images/slider/slide-opt-4.jpg",
    link: "/shop?category=men",
    category: "Men's Fashion",
    accentColor: "#9a3412",
  },
  {
    id: 4,
    theme: "Accessories Collection",
    eyebrow: "COMPLETE YOUR LOOK",
    title: "Accessories Collection",
    subtitle: "Bags, Watches, Sunglasses & Scents",
    description: "From bags to watches, sunglasses to more. The perfect details make the perfect style.",
    badge: "Accessories",
    image: "/images/slider/slide-opt-5.webp",
    fallbackImage: "/images/slider/slide-opt-5.jpg",
    link: "/shop?category=accessories",
    category: "Accessories",
    accentColor: "#d97706",
  },
  {
    id: 5,
    theme: "Season Sale",
    eyebrow: "SEASON SALE",
    title: "Up To 50% Off",
    subtitle: "Limited Time Offers",
    description: "Your favorite styles. Now at irresistible prices.",
    badge: "Up to 50% OFF",
    image: "/images/slider/slide-opt-6.webp",
    fallbackImage: "/images/slider/slide-opt-6.jpg",
    link: "/shop?sale=true",
    category: "Season Deals",
    accentColor: "#dc2626",
  },
];

const AUTOPLAY_INTERVAL = 4500; // 4.5 seconds per slide

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const timerRef = useRef(null);

  const totalSlides = SLIDES.length;

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index) => {
    setCurrent(index);
  };

  // Continuous Autoplay
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, AUTOPLAY_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevSlide, nextSlide]);

  // Touch Swipe handlers for mobile
  function handleTouchStart(e) {
    setTouchStart(e.touches[0].clientX);
  }

  function handleTouchEnd(e) {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    setTouchStart(null);
  }

  const activeSlide = SLIDES[current];

  return (
    <section
      className="hero-slider-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="PrimeNest Featured Collections Slider"
    >
      {/* Full-width Carousel Track */}
      <div className="slider-viewport">
        <div
          className="slider-track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`slide-item ${idx === current ? "active" : ""}`}
              aria-hidden={idx !== current}
            >
              <Link href={slide.link} className="slide-link" tabIndex={idx === current ? 0 : -1}>
                {/* Full-bleed banner image */}
                <picture className="slide-picture">
                  <source srcSet={slide.image} type="image/webp" />
                  <img
                    src={slide.fallbackImage}
                    alt={slide.title}
                    className="slide-image"
                    loading={idx === 0 ? "eager" : "lazy"}
                    draggable={false}
                  />
                </picture>

                {/* Ambient vignette overlay for top readability and bottom depth */}
                <div className="slide-ambient-vignette" />
              </Link>
            </div>
          ))}
        </div>

        {/* Previous Navigation Arrow */}
        <button
          type="button"
          className="slider-arrow arrow-prev"
          onClick={prevSlide}
          aria-label="Previous Slide"
        >
          <ChevronLeft size={24} strokeWidth={2.4} />
        </button>

        {/* Next Navigation Arrow */}
        <button
          type="button"
          className="slider-arrow arrow-next"
          onClick={nextSlide}
          aria-label="Next Slide"
        >
          <ChevronRight size={24} strokeWidth={2.4} />
        </button>

        {/* Bottom Controls (Progress Dots & Quick CTA) */}
        <div className="slider-bottom-controls">
          {/* Interactive Pagination Indicator Dots */}
          <div className="slider-dots-group">
            {SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                className={`slider-dot-btn ${idx === current ? "active" : ""}`}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}: ${slide.theme}`}
              >
                <span className="dot-inner">
                  {idx === current && !isPaused && (
                    <span
                      key={current}
                      className="dot-progress-fill"
                      style={{ animationDuration: `${AUTOPLAY_INTERVAL}ms` }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Click-to-Shop CTA Pill */}
          <Link href={activeSlide.link} className="slider-cta-pill">
            <span>Explore Collection</span>
            <ArrowRight size={15} className="cta-arrow" />
          </Link>
        </div>
      </div>

      <style jsx>{`
        /* Hero Slider Section - Full Width, Full Bleed, Grand Height */
        .hero-slider-section {
          position: relative;
          width: 100vw;
          max-width: 100%;
          height: 88vh;
          min-height: 640px;
          max-height: 900px;
          margin: 0;
          padding: 0;
          overflow: hidden;
          box-sizing: border-box;
          user-select: none;
          background: #0b0f17;
        }

        /* Viewport Container fills full height and width */
        .slider-viewport {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        /* Smooth translating track */
        .slider-track {
          display: flex;
          width: 100%;
          height: 100%;
          transition: transform 0.75s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }

        /* Individual Slide Item */
        .slide-item {
          flex: 0 0 100%;
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .slide-link {
          display: block;
          width: 100%;
          height: 100%;
          position: relative;
          text-decoration: none;
          cursor: pointer;
        }

        .slide-picture {
          display: block;
          width: 100%;
          height: 100%;
        }

        /* Banner Image - Grand, immersive, tall presentation */
        .slide-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          display: block;
          transition: transform 7s cubic-bezier(0.16, 1, 0.3, 1);
          transform: scale(1);
        }

        .slide-item.active .slide-image {
          transform: scale(1.025);
        }

        /* Ambient vignette overlay for seamless blend with transparent navbar and bottom content */
        .slide-ambient-vignette {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.42) 0%,
            rgba(0, 0, 0, 0.08) 22%,
            transparent 45%,
            transparent 70%,
            rgba(0, 0, 0, 0.38) 100%
          );
          pointer-events: none;
        }

        /* Top Theme Bar - Positioned comfortably below 90px transparent navbar */
        .slider-top-bar {
          position: absolute;
          top: 108px;
          left: 40px;
          right: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 20;
          pointer-events: none;
        }

        .theme-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 7px 16px;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 9999px;
          color: #ffffff;
          font-size: 12.5px;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
          pointer-events: auto;
          transition: all 0.3s ease;
        }

        .theme-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          box-shadow: 0 0 10px currentColor;
        }

        .theme-index {
          color: #94a3b8;
          font-size: 11.5px;
          font-family: monospace;
          letter-spacing: 0.5px;
        }

        .theme-sep {
          color: rgba(255, 255, 255, 0.35);
        }

        .theme-title {
          letter-spacing: 0.3px;
        }

        .pause-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 9999px;
          color: #f1f5f9;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          pointer-events: auto;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
        }

        .pause-toggle-btn:hover {
          background: rgba(30, 41, 59, 0.9);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-1px);
        }

        /* Glassmorphic Navigation Arrows */
        .slider-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.95);
          color: #0f172a;
          display: grid;
          place-items: center;
          cursor: pointer;
          z-index: 20;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .slider-arrow:hover {
          background: #ffffff;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
          color: #b45309;
        }

        .slider-arrow:active {
          transform: translateY(-50%) scale(0.95);
        }

        .arrow-prev {
          left: 28px;
        }

        .arrow-next {
          right: 28px;
        }

        /* Bottom Controls (Progress Dots & CTA) */
        .slider-bottom-controls {
          position: absolute;
          bottom: 34px;
          left: 40px;
          right: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 20;
          pointer-events: none;
        }

        /* Interactive Indicator Dots */
        .slider-dots-group {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 9999px;
          pointer-events: auto;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
        }

        .slider-dot-btn {
          background: transparent;
          border: none;
          padding: 4px 2px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .dot-inner {
          position: relative;
          display: block;
          height: 6px;
          width: 7px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.4);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .slider-dot-btn:hover .dot-inner {
          background: rgba(255, 255, 255, 0.8);
        }

        .slider-dot-btn.active .dot-inner {
          width: 32px;
          background: rgba(255, 255, 255, 0.4);
        }

        /* Animated Progress Fill */
        .dot-progress-fill {
          position: absolute;
          inset: 0;
          background: #ffffff;
          border-radius: 9999px;
          animation: dotFill linear forwards;
        }

        @keyframes dotFill {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        /* Floating CTA Button */
        .slider-cta-pill {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 10px 22px;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid #ffffff;
          border-radius: 9999px;
          color: #0f172a;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32);
          pointer-events: auto;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .slider-cta-pill:hover {
          background: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
          color: #b45309;
        }

        .cta-arrow {
          transition: transform 0.2s ease;
        }

        .slider-cta-pill:hover .cta-arrow {
          transform: translateX(4px);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .hero-slider-section {
            height: 78vh;
            min-height: 520px;
          }

          .slider-top-bar {
            top: 100px;
            left: 24px;
            right: 24px;
          }

          .slider-bottom-controls {
            bottom: 24px;
            left: 24px;
            right: 24px;
          }

          .slider-arrow {
            width: 42px;
            height: 42px;
          }

          .arrow-prev {
            left: 16px;
          }

          .arrow-next {
            right: 16px;
          }
        }

        @media (max-width: 768px) {
          .hero-slider-section {
            height: 68vh;
            min-height: 440px;
          }

          .slider-top-bar {
            top: 96px;
            left: 16px;
            right: 16px;
          }

          .slider-bottom-controls {
            bottom: 20px;
            left: 16px;
            right: 16px;
          }

          .theme-title {
            display: none;
          }

          .theme-sep {
            display: none;
          }

          .slider-cta-pill span {
            display: none;
          }

          .slider-cta-pill {
            padding: 9px 14px;
          }

          .slider-arrow {
            width: 36px;
            height: 36px;
          }

          .slider-dot-btn.active .dot-inner {
            width: 20px;
          }
        }
      `}</style>
    </section>
  );
}