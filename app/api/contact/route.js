import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { name, email, topic, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    console.log("Contact form submission received:", {
      name,
      email,
      topic: topic || "General Enquiry",
      message,
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! Your message has been received.",
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process message." },
      { status: 500 }
    );
  }
}
