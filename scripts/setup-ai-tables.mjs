import pool from "../lib/db.js";

async function setupAITables() {
  try {
    console.log("Checking and creating 'reviews' table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        author_name VARCHAR(150) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        comment TEXT NOT NULL,
        fit_feedback VARCHAR(50) DEFAULT 'true_to_size',
        verified_purchase BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
    `);
    console.log("✅ 'reviews' table ready.");

    // Check if we need to seed initial reviews for products
    const reviewCountRes = await pool.query("SELECT COUNT(*) FROM reviews");
    const count = parseInt(reviewCountRes.rows[0].count, 10);

    if (count === 0) {
      console.log("Seeding rich sample reviews for AI Summarizer...");
      const productsRes = await pool.query("SELECT id, name, category_id FROM products LIMIT 12");
      const products = productsRes.rows;

      const sampleReviewPool = [
        {
          author: "Aarav Sharma",
          rating: 5,
          title: "Exceptional quality and cut",
          comment: "The material feels incredibly premium and breathable. Drapes perfectly on shoulders and doesn't wrinkle easily throughout a workday. Definitely buying another color.",
          fit: "true_to_size"
        },
        {
          author: "Priya Nair",
          rating: 5,
          title: "Stunning aesthetic, worth every rupee",
          comment: "The stitching and tactile finish are pure luxury. I wore this to an evening dinner and received multiple compliments. Elegant and comfortable.",
          fit: "true_to_size"
        },
        {
          author: "Rohan Bhesara",
          rating: 4,
          title: "Great styling, snug fit",
          comment: "Overall top-tier craftsmanship and color fidelity matches the photos. It runs slightly slim around the chest, so if you prefer a relaxed fit, order one size up.",
          fit: "runs_small"
        },
        {
          author: "Ananya Iyer",
          rating: 5,
          title: "My favorite purchase this season",
          comment: "Unmatched fabric feel. Soft on skin, zero irritation, and washes cleanly without fading or shrinkage. The packaging was also very luxurious.",
          fit: "true_to_size"
        },
        {
          author: "Vikram Malhotra",
          rating: 4,
          title: "Solid construction, premium details",
          comment: "Subtle, understated branding and high attention to detail. Fast shipping within 2 days. The buttons and seams are reinforced well.",
          fit: "true_to_size"
        }
      ];

      for (const product of products) {
        for (const rev of sampleReviewPool) {
          await pool.query(
            `INSERT INTO reviews (product_id, author_name, rating, title, comment, fit_feedback, verified_purchase)
             VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
            [product.id, rev.author, rev.rating, rev.title, rev.comment, rev.fit]
          );
        }
      }
      console.log(`✅ Seeded sample reviews across ${products.length} products.`);
    }

    await pool.end();
    console.log("Database AI setup complete.");
  } catch (err) {
    console.error("Database AI setup failed:", err);
    process.exit(1);
  }
}

setupAITables();
