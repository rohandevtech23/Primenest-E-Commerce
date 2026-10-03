
"use client";

import { useEffect, useState } from "react";

const categoryDetails = {
  men: {
    subtitle: "Modern essentials",
    image:
      "https://i.pinimg.com/736x/49/17/5e/49175e45c3f7c4c53a31dc9734765bbd.jpg",
  },
  women: {
    subtitle: "Effortless elegance",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85",
  },
  accessories: {
    subtitle: "The finishing touch",
    image:
      "https://images.pexels.com/photos/6011222/pexels-photo-6011222.jpeg?_gl=1*1hy1yaq*_ga*MjA5OTA2NDIyMy4xNzkwNzc2MzE2*_ga_8JE65Q40S6*czE3OTA3NzYzMTUkbzEkZzEkdDE3OTA3Nzc2NDIkajQ2JGwwJGgw",
  },
  "home-essentials": {
    subtitle: "Designed to live with",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85",
  },
  perfume: {
    subtitle: "Leave an impression",
    image:
      "https://hips.hearstapps.com/hmg-prod/images/diorperfume-699dc6cca6b5d.jpg?crop=0.502xw:1.00xh;0.498xw,0&resize=640:*",
  },
  footwear: {
    subtitle: "Step into your style",
    image:
      "https://knickgasm.com/cdn/shop/files/A1FAC8EC-1E4A-4C4D-B50A-EDE72E22DEAA.jpg?v=1767388715&width=720",
  },
  kids: {
    subtitle: "Little styles, big moments",
    image:
      "https://images.unsplash.com/photo-1715285091754-c7241fe113fc?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  beauty: {
    subtitle: "Your everyday glow",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=85",
  },
};

const fallbackImage =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85";

export default function CategoryShowcase() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let active = true;

    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");

        if (!response.ok) {
          throw new Error("Failed to load categories");
        }

        const data = await response.json();

        if (active && Array.isArray(data)) {
          setCategories(data);
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
        <div>
          <p className="category-label">
            CURATED FOR YOU
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
              href={`/shop?category=${encodeURIComponent(
                category.slug
              )}`}
              className={`category-card category-card-${index + 1}`}
              key={category.id}
            >
              <div
                className="category-image"
                style={{
                  backgroundImage: `url("${
                    details.image || fallbackImage
                  }")`,
                }}
              />

              <div className="category-overlay" />

              <div className="category-content">
                <p>
                  {details.subtitle || "Explore our collection"}
                </p>

                <h3>{category.name}</h3>

                <span>
                  Explore <b>↗</b>
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}