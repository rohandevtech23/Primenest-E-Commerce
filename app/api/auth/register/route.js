
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    // Validate registration details
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email and password are required." },
        { status: 400 }
      );
    }

    if (name.length > 150) {
      return NextResponse.json(
        { message: "Name must be 150 characters or fewer." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        email.length > 255) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 8 ||
        Buffer.byteLength(password, "utf8") > 72) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters and no more than 72 bytes." },
        { status: 400 }
      );
    }

    // Check whether the email is already registered
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rowCount > 0) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash the password before storing it
    const passwordHash = await bcrypt.hash(password, 12);

    // Public registration always creates a regular user
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, name, email, role, created_at`,
      [name, email, passwordHash]
    );

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle concurrent duplicate registrations
    if (error.code === "23505") {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    console.error("Registration error:", error);

    return NextResponse.json(
      { message: "Unable to create account. Please try again." },
      { status: 500 }
    );
  }
}