
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.stock,
        p.subcategory,
        c.name AS category,
        c.slug AS category_slug,
        pi.image_url AS image,
        (
          SELECT image_url
          FROM product_images
          WHERE product_id = p.id AND is_primary = FALSE
          ORDER BY id ASC
          LIMIT 1
        ) AS hover_image
      FROM products p
      JOIN categories c
        ON p.category_id = c.id
      LEFT JOIN product_images pi
        ON p.id = pi.product_id
        AND pi.is_primary = TRUE
      ORDER BY p.id ASC
    `);

    return Response.json({
      success: true,
      products: result.rows,
    });
  } catch (error) {
    console.error("Products API error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch products",
        error: error.message,
      },
      { status: 500 }
    );
  }
}