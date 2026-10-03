
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export async function GET() {
  try {
    // Read the login session cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("primenest-session")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 }
      );
    }

    // Verify the session
    const session = await verifySessionToken(token);

    if (!session || session.role !== "user") {
      return NextResponse.json(
        { success: false, message: "Invalid session." },
        { status: 401 }
      );
    }

    // Get the latest customer details from PostgreSQL
    
const result = await pool.query(
  `SELECT
     id,
     name,
     email,
     phone,
     TO_CHAR(date_of_birth, 'YYYY-MM-DD') AS date_of_birth,
     gender,
     avatar_url,
     created_at
   FROM users
   WHERE id = $1 AND role = 'user'
   LIMIT 1`,
  [session.id]
);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Account not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Profile API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load your account." },
      { status: 500 }
    );
  }
}