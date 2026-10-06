
"use client";

import { useEffect, useState } from "react";

const categoryDetails = {
  men: {
    subtitle: "Modern Essentials",
    image: "/images/men-fashion-model.jpg",
  },
  women: {
    subtitle: "Effortless Elegance",
    image: "/images/women-fashion-model.jpg",
  },
  accessories: {
    subtitle: "The finishing touch",
    image:
      "https://images.pexels.com/photos/6011222/pexels-photo-6011222.jpeg?_gl=1*1hy1yaq*_ga*MjA5OTA2NDIyMy4xNzkwNzc2MzE2*_ga_8JE65Q40S6*czE3OTA3NzYzMTUkbzEkZzEkdDE3OTA3Nzc2NDIkajQ2JGwwJGgw",
  },
  perfume: {
    subtitle: "Artisanal Fragrance",
    image: "/images/perfume-showcase.jpg",
  },
  footwear: {
    subtitle: "Step into your style",
    image:
      "https://knickgasm.com/cdn/shop/files/A1FAC8EC-1E4A-4C4D-B50A-EDE72E22DEAA.jpg?v=1767388715&width=720",
  },
};

const fallbackImage =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85";

const DEFAULT_CATEGORIES = [
  { id: 1, name: "Men", slug: "men" },
  { id: 2, name: "Women", slug: "women" },
  { id: 3, name: "Accessories", slug: "accessories" },
  { id: 4, name: "Footwear", slug: "footwear" },
  { id: 5, name: "Perfume", slug: "perfume" },
];

export default function CategoryShowcase() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    let active = true;

    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to load categories");

        const data = await response.json();

        if (active && Array.isArray(data)) {
          const order = ["men", "women", "accessories", "footwear", "perfume"];
          const filtered = data
            .filter((c) =>
              order.includes(String(c.slug || "").toLowerCase().trim())
            )
            .sort(
              (a, b) =>
                order.indexOf(String(a.slug || "").toLowerCase().trim()) -
                order.indexOf(String(b.slug || "").toLowerCase().trim())
            );
          if (filtered.length > 0) {
            setCategories(filtered);
          }
        }
      } catch (error) {
        console.error("Category loading error:", error);
      }
    }

    fetchCategories();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="category-showcase">
      <div className="category-heading">
        <div className="category-heading-left">
          <p className="category-label">
            <span className="category-sparkle-dot">✦</span> CURATED FOR YOU
          </p>

          <h2>
            Explore
            <em> Collections</em>
          </h2>
        </div>
      </div>

      <div className="category-grid">
        {categories.map((category, index) => {
          const details = categoryDetails[category.slug] || {};

          return (
            <a
              href={`/shop?category=${encodeURIComponent(category.slug)}`}
              className={`category-card category-card-${index + 1}`}
              key={category.id || category.slug}
            >
              <div
                className="category-image"
                style={{
                  backgroundImage: `url("${details.image || fallbackImage}")`,
                }}
              />

              <div className="category-overlay" />
              <div className="category-card-shimmer" />

              <div className="category-content">
                <span className="category-card-tag">
                  {details.subtitle || "Exclusive Edit"}
                </span>

                <h3>{category.name}</h3>

                <div className="category-cta-pill">
                  <span>Explore Collection</span>
                  <span className="category-cta-arrow">↗</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}