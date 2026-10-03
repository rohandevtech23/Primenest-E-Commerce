import pool from "@/lib/db";
import { runSemanticSearch } from "@/lib/ai";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return Response.json({
        success: true,
        query: "",
        results: [],
      });
    }

    // Fetch active catalog from PostgreSQL
    const productsRes = await pool.query(`
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
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      ORDER BY p.id ASC
    `);

    const catalog = productsRes.rows;
    const rankedResults = await runSemanticSearch(query, catalog);

    return Response.json({
      success: true,
      query,
      count: rankedResults.length,
      results: rankedResults,
    });
  } catch (error) {
    console.error("GET /api/ai/search error:", error);
    return Response.json(
      { error: "AI search failed", details: error.message },
      { status: 500 }
    );
  }
}
