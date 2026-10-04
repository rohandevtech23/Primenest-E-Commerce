import pool from "@/lib/db";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

// Helper to get authenticated user session if available
async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("primenest-session")?.value;
    if (!token) return null;
    const session = await verifySessionToken(token);
    return session || null;
  } catch (err) {
    return null;
  }
}

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

    const authUser = await getAuthUser();

    const result = await pool.query(
      `SELECT id, product_id, user_id, author_name, rating, title, comment, fit_feedback, verified_purchase, created_at
       FROM reviews
       WHERE product_id = $1
       ORDER BY created_at DESC`,
      [productId]
    );

    let hasReviewed = false;
    if (authUser?.id) {
      hasReviewed = result.rows.some(
        (r) => Number(r.user_id) === Number(authUser.id)
      );
    }

    return Response.json({
      success: true,
      reviews: result.rows,
      hasReviewed,
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
// ENFORCE: 1 user = 1 review per product
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

    const authUser = await getAuthUser();
    const userId = authUser?.id || null;
    const cleanAuthor = authorName.trim();

    // 1 USER = 1 REVIEW RULE:
    // Check if a review already exists for this product by user_id OR author_name
    let duplicateCheck;
    if (userId) {
      duplicateCheck = await pool.query(
        `SELECT id FROM reviews 
         WHERE product_id = $1 AND (user_id = $2 OR LOWER(TRIM(author_name)) = LOWER(TRIM($3)))
         LIMIT 1`,
        [productId, userId, cleanAuthor]
      );
    } else {
      duplicateCheck = await pool.query(
        `SELECT id FROM reviews 
         WHERE product_id = $1 AND LOWER(TRIM(author_name)) = LOWER(TRIM($2))
         LIMIT 1`,
        [productId, cleanAuthor]
      );
    }

    if (duplicateCheck.rows.length > 0) {
      return Response.json(
        {
          error: "You have already submitted a review for this product. (Limit: 1 review per product).",
          alreadyReviewed: true,
        },
        { status: 400 }
      );
    }

    const parsedRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
    const cleanFit = ["runs_small", "true_to_size", "runs_large"].includes(fitFeedback)
      ? fitFeedback
      : "true_to_size";

    const insertResult = await pool.query(
      `INSERT INTO reviews (product_id, user_id, author_name, rating, title, comment, fit_feedback, verified_purchase)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
       RETURNING id, product_id, user_id, author_name, rating, title, comment, fit_feedback, verified_purchase, created_at`,
      [productId, userId, cleanAuthor, parsedRating, title ? title.trim() : null, comment.trim(), cleanFit]
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
