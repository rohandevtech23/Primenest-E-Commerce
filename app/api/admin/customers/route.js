
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export async function GET() {
  try {
    // 1. Verify admin session
    const cookieStore = await cookies();
    const token = cookieStore.get("primenest-session")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(token);

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // 2. Fetch customers and their order statistics
    const result = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        COALESCE(order_stats.order_count, 0)::int AS order_count,
        COALESCE(order_stats.total_spent, 0)::numeric AS total_spent
      FROM users u
      LEFT JOIN (
        SELECT
          email,
          COUNT(*)::int AS order_count,
          SUM(total) AS total_spent
        FROM orders
        GROUP BY email
      ) AS order_stats
        ON LOWER(order_stats.email) = LOWER(u.email)
      WHERE u.role = 'user'
      ORDER BY u.id DESC
    `);

    // 3. Return customer data
    return NextResponse.json({
      success: true,
      customers: result.rows,
    });
  } catch (error) {
    console.error("Admin customers API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch customers",
      },
      { status: 500 }
    );
  }
}