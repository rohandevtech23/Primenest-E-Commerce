import pool from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");

    let query = `
      SELECT s.id, s.category_id, s.name, s.slug, c.name AS category_name
      FROM subcategories s
      JOIN categories c ON s.category_id = c.id
    `;
    const params = [];

    if (categoryId) {
      query += ` WHERE s.category_id = $1`;
      params.push(categoryId);
    }

    query += ` ORDER BY s.name ASC`;

    const result = await pool.query(query, params);

    return Response.json({
      success: true,
      subcategories: result.rows,
    });
  } catch (error) {
    console.error("Subcategories GET error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to fetch subcategories",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const categoryId = Number(body.category_id);
    const name = String(body.name || "").trim();

    if (!categoryId || !name) {
      return Response.json(
        {
          success: false,
          message: "Category and subcategory name are required",
        },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const result = await pool.query(
      `INSERT INTO subcategories (category_id, name, slug)
       VALUES ($1, $2, $3)
       ON CONFLICT (category_id, name) DO UPDATE
       SET updated_at = CURRENT_TIMESTAMP
       RETURNING id, category_id, name, slug`,
      [categoryId, name, slug]
    );

    return Response.json({
      success: true,
      message: "Subcategory saved successfully",
      subcategory: result.rows[0],
    });
  } catch (error) {
    console.error("Subcategories POST error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to save subcategory",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
