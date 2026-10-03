import pool from "@/lib/db";

// GET reviews for a product: /api/reviews?productId=123
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

    const result = await pool.query(
      `SELECT id, product_id, author_name, rating, title, comment, fit_feedback, verified_purchase, created_at
       FROM reviews
       WHERE product_id = $1
       ORDER BY created_at DESC`,
      [productId]
    );

    return Response.json({
      success: true,
      reviews: result.rows,
    });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return Response.json(
      { error: "Failed to fetch reviews", details: error.message },
      { status: 500 }
    );
  }
}

// POST a new review: { productId, authorName, rating, title, comment, fitFeedback }
export async function POST(request) {
  try {
    const body = await request.json();
    const { productId, authorName, rating, title, comment, fitFeedback } = body;

    if (!productId || !authorName || !rating || !comment) {
      return Response.json(
        { error: "Missing required fields (productId, authorName, rating, comment)" },
        { status: 400 }
      );
    }

    const parsedRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
    const cleanFit = ["runs_small", "true_to_size", "runs_large"].includes(fitFeedback)
      ? fitFeedback
      : "true_to_size";

    const insertResult = await pool.query(
      `INSERT INTO reviews (product_id, author_name, rating, title, comment, fit_feedback, verified_purchase)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)
       RETURNING id, product_id, author_name, rating, title, comment, fit_feedback, verified_purchase, created_at`,
      [productId, authorName.trim(), parsedRating, title ? title.trim() : null, comment.trim(), cleanFit]
    );

    return Response.json({
      success: true,
      review: insertResult.rows[0],
    });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return Response.json(
      { error: "Failed to submit review", details: error.message },
      { status: 500 }
    );
  }
}
