
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    
// 1. Verify the logged-in user's session
const cookieStore = await cookies();
const token = cookieStore.get("primenest-session")?.value;

if (!token) {
  return NextResponse.json(
    { success: false, message: "Please log in." },
    { status: 401 }
  );
}

const session = await verifySessionToken(token);

console.log("PrimeNest orders authentication:", {
  hasToken: Boolean(token),
  sessionValid: Boolean(session),
  userId: session?.id ?? null,
  role: session?.role ?? null,
});

if (!session) {
  return NextResponse.json(
    { success: false, message: "Session expired or invalid. Please log in again." },
    { status: 401 }
  );
}

if (session.role !== "user") {
  return NextResponse.json(
    { success: false, message: "Customer account required." },
    { status: 403 }
  );
}

    // 2. Get the user's email from PostgreSQL
    const userResult = await pool.query(
      `SELECT email
       FROM users
       WHERE id = $1 AND role = 'user'
       LIMIT 1`,
      [session.id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Account not found." },
        { status: 404 }
      );
    }

    const email = userResult.rows[0].email;

    // 3. Fetch this user's orders and their products
    
const result = await pool.query(
  `SELECT
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
       jsonb_agg(
         jsonb_build_object(
           'productId', oi.product_id,
           'productName', oi.product_name,
           'quantity', oi.quantity,
           'unitPrice', oi.unit_price,
           'imageUrl', img.image_url
         )
       ) FILTER (WHERE oi.order_id IS NOT NULL),
       '[]'::jsonb
     ) AS items
   FROM orders o
   LEFT JOIN order_items oi
     ON oi.order_id = o.id
   LEFT JOIN LATERAL (
     SELECT pi.image_url
     FROM product_images pi
     WHERE pi.product_id = oi.product_id
     ORDER BY pi.id ASC
     LIMIT 1
   ) img ON true
   WHERE (o.user_id = $1 OR LOWER(o.email) = LOWER($2))
   GROUP BY o.id
   ORDER BY o.created_at DESC`,
  [session.id, email]
);

    // 4. Return the orders
    return NextResponse.json({
      success: true,
      orders: result.rows,
    });
  } catch (error) {
    console.error("My orders API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load your orders.",
      },
      { status: 500 }
    );
  }
}