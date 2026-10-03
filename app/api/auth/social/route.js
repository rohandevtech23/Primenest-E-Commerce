import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import pool from "@/lib/db";
import { createSessionToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const provider = body.provider?.toLowerCase()?.trim();
    const customEmail = body.email?.trim()?.toLowerCase();
    const customName = body.name?.trim();

    const allowedProviders = ["google", "apple", "linkedin"];
    if (!allowedProviders.includes(provider)) {
      return NextResponse.json(
        { message: "Unsupported login provider." },
        { status: 400 }
      );
    }

    // Default profiles per provider if custom ones aren't supplied
    let email = customEmail;
    let name = customName;

    if (!email) {
      if (provider === "google") {
        email = "rohan.google@gmail.com";
        name = name || "Rohan Sharma";
      } else if (provider === "apple") {
        email = "rohan.apple@icloud.com";
        name = name || "Rohan Sharma";
      } else if (provider === "linkedin") {
        email = "rohan.linkedin@pro.com";
        name = name || "Rohan Sharma";
      }
    }

    if (!name) {
      name = email.split("@")[0].replace(/[\._]/g, " ");
      name = name.charAt(0).toUpperCase() + name.slice(1);
    }

    // Check if user exists in the database
    let result = await pool.query(
      `SELECT id, name, email, role
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email]
    );

    let user = result.rows[0];

    // If user does not exist yet, auto-register customer account
    if (!user) {
      const generatedPassword = crypto.randomBytes(24).toString("hex");
      const passwordHash = await bcrypt.hash(generatedPassword, 10);

      const insertResult = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'user')
         RETURNING id, name, email, role`,
        [name, email, passwordHash]
      );
      user = insertResult.rows[0];
    }

    // Ensure customer role
    if (user.role !== "user") {
      return NextResponse.json(
        { message: "This account cannot be accessed via customer social login." },
        { status: 403 }
      );
    }

    // Create signed JWT session token
    const token = await createSessionToken(user);

    const providerNames = {
      google: "Google",
      apple: "Apple",
      linkedin: "LinkedIn",
    };

    const response = NextResponse.json({
      success: true,
      message: `Signed in successfully with ${providerNames[provider] || provider}.`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Set HTTP-only secure cookie for 7 days
    response.cookies.set("primenest-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Social login route error:", error);
    return NextResponse.json(
      { message: "Unable to complete social sign-in. Please try again." },
      { status: 500 }
    );
  }
}
