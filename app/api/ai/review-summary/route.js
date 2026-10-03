import pool from "@/lib/db";
import { summarizeReviews } from "@/lib/ai";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return Response.json(
        { error: "productId parameter is required" },
        { status: 400 }
      );
    }

    // 1. Fetch product
    const productRes = await pool.query(
      `SELECT id, name, category_id, subcategory, description FROM products WHERE id = $1`,
      [productId]
    );

    if (productRes.rows.length === 0) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const product = productRes.rows[0];

    // 2. Fetch reviews
    const reviewsRes = await pool.query(
      `SELECT id, author_name, rating, title, comment, fit_feedback, verified_purchase, created_at
       FROM reviews
       WHERE product_id = $1
       ORDER BY created_at DESC`,
      [productId]
    );

    const reviews = reviewsRes.rows;

    // 3. Generate AI summary
    const summary = await summarizeReviews(product, reviews);

    return Response.json({
      success: true,
      productId: product.id,
      productName: product.name,
      summary,
    });
  } catch (error) {
    console.error("GET /api/ai/review-summary error:", error);
    return Response.json(
      { error: "Failed to generate review summary", details: error.message },
      { status: 500 }
    );
  }
}
