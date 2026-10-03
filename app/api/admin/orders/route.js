
import pool from "@/lib/db";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("primenest-session")?.value;

  if (!token) return false;

  const user = await verifySessionToken(token);
  return user?.role === "admin";
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await pool.query(`
      SELECT
        o.id,
        o.customer_name,
        o.email,
        o.phone,
        o.address,
        o.total,
        o.status,
        o.payment_method,
        o.payment_status,
        o.created_at,
        COALESCE(
          (
            SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', oi.id,
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'line_total', (oi.quantity * oi.unit_price),
                'product_image', (
                  SELECT pi.image_url 
                  FROM product_images pi 
                  WHERE pi.product_id = oi.product_id 
                  ORDER BY pi.is_primary DESC, pi.id ASC 
                  LIMIT 1
                )
              )
              ORDER BY oi.id ASC
            )
            FROM order_items oi
            WHERE oi.order_id = o.id
          ),
          '[]'::json
        ) AS items,
        COALESCE(
          (SELECT SUM(quantity)::int FROM order_items WHERE order_id = o.id),
          0
        ) AS total_items,
        COALESCE(
          (SELECT COUNT(*)::int FROM order_items WHERE order_id = o.id),
          0
        ) AS unique_products
      FROM orders o
      ORDER BY o.created_at DESC, o.id DESC
    `);

    return Response.json({
      success: true,
      orders: result.rows,
    });
  } catch (error) {
    console.error("Admin orders API error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}