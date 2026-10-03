
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export async function PATCH(request) {
  try {
    // Verify the logged-in customer
    const cookieStore = await cookies();
    const token = cookieStore.get("primenest-session")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(token);

    if (!session || session.role !== "user") {
      return NextResponse.json(
        { success: false, message: "Invalid session." },
        { status: 401 }
      );
    }

    // Read submitted profile information
    const body = await request.json();
    const { name, phone, date_of_birth, gender } = body;

    // Validate name when supplied
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { success: false, message: "Please enter your name." },
          { status: 400 }
        );
      }

      if (name.trim().length > 100) {
        return NextResponse.json(
          { success: false, message: "Name must be 100 characters or fewer." },
          { status: 400 }
        );
      }
    }

    // Validate phone when supplied
    if (phone !== undefined && phone !== null) {
      if (typeof phone !== "string" || phone.length > 20) {
        return NextResponse.json(
          { success: false, message: "Please enter a valid phone number." },
          { status: 400 }
        );
      }
    }

    
// Validate date of birth when supplied
if (
  date_of_birth !== undefined &&
  date_of_birth !== null &&
  date_of_birth !== ""
) {
  if (
    typeof date_of_birth !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date_of_birth)
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Please enter a valid date of birth.",
      },
      { status: 400 }
    );
  }

  // Validate the calendar date without timezone conversion
  const [year, month, day] = date_of_birth.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Please enter a valid date of birth.",
      },
      { status: 400 }
    );
  }

  // Compare date strings to prevent future dates
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  if (date_of_birth > today) {
    return NextResponse.json(
      {
        success: false,
        message: "Date of birth cannot be in the future.",
      },
      { status: 400 }
    );
  }
}
    // Validate gender when supplied
    if (
      gender !== undefined &&
      gender !== null &&
      (typeof gender !== "string" || gender.length > 30)
    ) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid gender." },
        { status: 400 }
      );
    }

    // Preserve existing values when fields are not submitted.
    
const result = await pool.query(
  "UPDATE users " +
  "SET " +
  "name = COALESCE($1, name), " +
  "phone = CASE WHEN $2 THEN $3 ELSE phone END, " +
  "date_of_birth = CASE WHEN $4 THEN $5::date ELSE date_of_birth END, " +
  "gender = CASE WHEN $6 THEN $7 ELSE gender END " +
  "WHERE id = $8 AND role = 'user' " +
  "RETURNING id, name, email, phone, " +
  "TO_CHAR(date_of_birth, 'YYYY-MM-DD') AS date_of_birth, " +
  "gender, avatar_url, created_at",
  [
    name === undefined ? null : name.trim(),
    phone !== undefined,
    phone?.trim() || null,
    date_of_birth !== undefined,
    date_of_birth || null,
    gender !== undefined,
    gender?.trim() || null,
    session.id,
  ]
);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Account not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Profile update API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update your profile." },
      { status: 500 }
    );
  }
}