import pool from "@/lib/db";
import { getStylistResponse } from "@/lib/ai";

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message || !message.trim()) {
      return Response.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Load available products for accurate catalog recommendations
    const productsRes = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.price,
        p.description,
        p.subcategory,
        c.name AS category,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1),
          (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1)
        ) AS image
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.stock > 0
      ORDER BY p.id ASC
    `);

    const catalog = productsRes.rows;
    const response = await getStylistResponse({
      message: message.trim(),
      history: history || [],
      catalog,
    });

    return Response.json({
      success: true,
      reply: response.reply,
      products: response.products,
    });
  } catch (error) {
    console.error("POST /api/ai/chat error:", error);
    return Response.json(
      { error: "Stylist assistant failed", details: error.message },
      { status: 500 }
    );
  }
}
