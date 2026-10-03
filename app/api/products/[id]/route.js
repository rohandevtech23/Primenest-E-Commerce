
import pool from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.stock,
        p.subcategory,
        p.category_id,
        p.variants,
        p.variant_label,
        c.name AS category,
        c.slug AS category_slug,
        pi.image_url AS image
      FROM products p
      JOIN categories c
        ON p.category_id = c.id
      LEFT JOIN product_images pi
        ON p.id = pi.product_id
        AND pi.is_primary = TRUE
      WHERE p.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    const product = result.rows[0];

    // Fetch all gallery images for this product
    const imagesResult = await pool.query(
      `
      SELECT image_url, is_primary
      FROM product_images
      WHERE product_id = $1
      ORDER BY is_primary DESC, id ASC
      `,
      [id]
    );

    let images = imagesResult.rows.map((row) => row.image_url);
    if (images.length === 0 && product.image) {
      images = [product.image];
    }

    // Fetch related products (same category or subcategory, excluding this product)
    const relatedResult = await pool.query(
      `
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
        pi.image_url AS image
      FROM products p
      JOIN categories c
        ON p.category_id = c.id
      LEFT JOIN product_images pi
        ON p.id = pi.product_id
        AND pi.is_primary = TRUE
      WHERE p.id != $1
        AND (p.subcategory = $2 OR p.category_id = $3)
      ORDER BY (p.subcategory = $2) DESC, p.id ASC
      LIMIT 4
      `,
      [id, product.subcategory || "", product.category_id]
    );

    return Response.json({
      success: true,
      product: {
        ...product,
        images,
      },
      relatedProducts: relatedResult.rows,
    });
  } catch (error) {
    console.error("Product API error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch product",
      },
      { status: 500 }
    );
  }
}