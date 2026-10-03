
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

function escapeCSV(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET() {
  try {
    // Verify that the requester is an authenticated admin.
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

    // Fetch order records from PostgreSQL.
    const result = await pool.query(`
      SELECT
        id,
        customer_name,
        email,
        total,
        status,
        created_at
      FROM orders
      ORDER BY created_at DESC
    `);

    // Create a CSV header and rows.
    const headers = [
      "Order ID",
      "Customer Name",
      "Email",
      "Total",
      "Status",
      "Order Date",
    ];

    const rows = result.rows.map((order) => [
      order.id,
      order.customer_name,
      order.email,
      order.total,
      order.status,
      order.created_at
        ? new Date(order.created_at).toISOString()
        : "",
    ]);

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\r\n");

    // Add a UTF-8 BOM for better Excel compatibility.
    const csvWithBOM = "\uFEFF" + csv;

    return new NextResponse(csvWithBOM, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="primenest-orders-report.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to export orders report",
      },
      { status: 500 }
    );
  }
}