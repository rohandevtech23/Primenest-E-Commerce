
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

async function getUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("primenest-session")?.value;

  if (!token) return null;

  const session = await verifySessionToken(token);

  if (!session || session.role !== "user") {
    return null;
  }

  return session;
}

// GET: Fetch the logged-in user's addresses
export async function GET() {
  try {
    const session = await getUserSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `SELECT
         id, full_name, phone, address_line,
         city, state, postal_code, country,
         is_default, created_at
       FROM user_addresses
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [session.id]
    );

    return NextResponse.json({
      success: true,
      addresses: result.rows,
    });
  } catch (error) {
    console.error("Fetch addresses error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load addresses." },
      { status: 500 }
    );
  }
}

// POST: Add a new delivery address
export async function POST(request) {
  let client;

  try {
    const session = await getUserSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      postalCode,
      country = "India",
      isDefault = false,
    } = body;

    if (
      typeof fullName !== "string" ||
      !fullName.trim() ||
      fullName.trim().length > 150 ||
      typeof phone !== "string" ||
      !/^[+0-9() -]{7,20}$/.test(phone.trim()) ||
      typeof addressLine !== "string" ||
      !addressLine.trim() ||
      addressLine.trim().length > 2000 ||
      typeof city !== "string" ||
      !city.trim() ||
      city.trim().length > 100 ||
      typeof state !== "string" ||
      !state.trim() ||
      state.trim().length > 100 ||
      typeof postalCode !== "string" ||
      !/^[a-zA-Z0-9 -]{3,20}$/.test(postalCode.trim()) ||
      typeof country !== "string" ||
      !country.trim() ||
      country.trim().length > 100 ||
      typeof isDefault !== "boolean"
    ) {
      return NextResponse.json(
        { success: false, message: "Please enter valid address details." },
        { status: 400 }
      );
    }

    client = await pool.connect();
    await client.query("BEGIN");

    // Make the first address default automatically.
    const existing = await client.query(
      `SELECT id FROM user_addresses
       WHERE user_id = $1
       LIMIT 1`,
      [session.id]
    );

    const makeDefault = isDefault || existing.rows.length === 0;

    // Only one address should be the default.
    if (makeDefault) {
      await client.query(
        `UPDATE user_addresses
         SET is_default = FALSE
         WHERE user_id = $1`,
        [session.id]
      );
    }

    const result = await client.query(
      `INSERT INTO user_addresses (
         user_id, full_name, phone, address_line,
         city, state, postal_code, country, is_default
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING
         id, full_name, phone, address_line,
         city, state, postal_code, country,
         is_default, created_at`,
      [
        session.id,
        fullName.trim(),
        phone.trim(),
        addressLine.trim(),
        city.trim(),
        state.trim(),
        postalCode.trim(),
        country.trim(),
        makeDefault,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Address saved successfully.",
        address: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }

    console.error("Save address error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to save address." },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}


// PATCH: Edit an existing delivery address
export async function PATCH(request) {
  let client;

  try {
    const session = await getUserSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      id,
      fullName,
      phone,
      addressLine,
      city,
      state,
      postalCode,
      country = "India",
      isDefault = false,
    } = body;

    if (
      !Number.isSafeInteger(Number(id)) ||
      Number(id) <= 0 ||
      typeof fullName !== "string" ||
      !fullName.trim() ||
      fullName.trim().length > 150 ||
      typeof phone !== "string" ||
      !/^[+0-9() -]{7,20}$/.test(phone.trim()) ||
      typeof addressLine !== "string" ||
      !addressLine.trim() ||
      addressLine.trim().length > 2000 ||
      typeof city !== "string" ||
      !city.trim() ||
      city.trim().length > 100 ||
      typeof state !== "string" ||
      !state.trim() ||
      state.trim().length > 100 ||
      typeof postalCode !== "string" ||
      !/^[a-zA-Z0-9 -]{3,20}$/.test(postalCode.trim()) ||
      typeof country !== "string" ||
      !country.trim() ||
      country.trim().length > 100 ||
      typeof isDefault !== "boolean"
    ) {
      return NextResponse.json(
        { success: false, message: "Please enter valid address details." },
        { status: 400 }
      );
    }

    client = await pool.connect();
    await client.query("BEGIN");

    // Confirm the address belongs to this logged-in user.
    const existing = await client.query(
      `SELECT id
       FROM user_addresses
       WHERE id = $1 AND user_id = $2
       FOR UPDATE`,
      [Number(id), session.id]
    );

    if (existing.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { success: false, message: "Address not found." },
        { status: 404 }
      );
    }

    // If selected as default, clear the previous default.
    if (isDefault) {
      await client.query(
        `UPDATE user_addresses
         SET is_default = FALSE
         WHERE user_id = $1`,
        [session.id]
      );
    }

    const result = await client.query(
      `UPDATE user_addresses
       SET
         full_name = $1,
         phone = $2,
         address_line = $3,
         city = $4,
         state = $5,
         postal_code = $6,
         country = $7,
         is_default = $8
       WHERE id = $9 AND user_id = $10
       RETURNING
         id, full_name, phone, address_line,
         city, state, postal_code, country,
         is_default, created_at`,
      [
        fullName.trim(),
        phone.trim(),
        addressLine.trim(),
        city.trim(),
        state.trim(),
        postalCode.trim(),
        country.trim(),
        isDefault,
        Number(id),
        session.id,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Address updated successfully.",
      address: result.rows[0],
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }

    console.error("Update address error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update address." },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}