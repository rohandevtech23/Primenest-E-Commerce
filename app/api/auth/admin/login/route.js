
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSessionToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@primenest.com").trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return NextResponse.json(
        { message: "Please enter a valid email and password." },
        { status: 400 }
      );
    }

    const emailMatches = email.trim().toLowerCase() === adminEmail;

    let passwordMatches = false;
    if (adminPasswordHash) {
      passwordMatches = await bcrypt.compare(password, adminPasswordHash);
    }
    if (!passwordMatches && adminPassword) {
      passwordMatches = password === adminPassword;
    }

    if (!emailMatches || !passwordMatches) {
      return NextResponse.json(
        { message: "Invalid admin email or password." },
        { status: 401 }
      );
    }

    const admin = {
      id: "static-admin",
      name: "Admin",
      email: adminEmail,
      role: "admin",
    };

    const token = await createSessionToken(admin);

    const response = NextResponse.json({
      message: "Admin login successful.",
      user: {
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    response.cookies.set("primenest-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { message: "Unable to log in. Please try again." },
      { status: 500 }
    );
  }
}