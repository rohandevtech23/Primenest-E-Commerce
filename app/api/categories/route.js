
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT * FROM categories ORDER BY id ASC"
    );

    return Response.json(result.rows);
  } catch (error) {
    console.error("Categories API error:", error);

    return Response.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}