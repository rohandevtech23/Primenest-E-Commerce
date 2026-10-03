
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

// PATCH: Update an order's status
export async function PATCH(request, { params }) {
  if (!(await isAdmin())) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id: rawId } = await params;
  const id = Number(rawId);
  const altId =
    String(rawId).startsWith("78645") && String(rawId).length > 5
      ? Number(String(rawId).slice(5))
      : Number(`78645${rawId}`);

  if (!Number.isInteger(id) || id <= 0) {
    return Response.json(
      { success: false, message: "Invalid order ID" },
      { status: 400 }
    );
  }

  const allowedStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  try {
    const body = await request.json();
    const status = String(body.status || "").trim().toLowerCase();

    if (!allowedStatuses.includes(status)) {
      return Response.json(
        { success: false, message: "Invalid order status" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE orders
       SET status = $1
       WHERE id = $2 OR (id = $3 AND $3 IS NOT NULL)
       RETURNING id, customer_name, email, total, status, created_at`,
      [status, id, Number.isInteger(altId) ? altId : null]
    );

    if (result.rowCount === 0) {
      return Response.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Order status updated successfully",
      order: result.rows[0],
    });
  } catch (error) {
    console.error("Admin order status update error:", error);

    return Response.json(
      { success: false, message: "Failed to update order status" },
      { status: 500 }
    );
  }
}   