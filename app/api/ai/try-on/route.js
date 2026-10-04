import { processVirtualTryOn } from "@/lib/ai";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userImage, garmentImage, garmentName, category, productId, engine } = body;

    if (!userImage) {
      return Response.json(
        { error: "User photo is required for Virtual Try-On" },
        { status: 400 }
      );
    }

    if (!garmentImage) {
      return Response.json(
        { error: "Garment image is required for Virtual Try-On" },
        { status: 400 }
      );
    }

    // Execute Virtual Try-On pipeline with selected AI model
    const tryOnResult = await processVirtualTryOn({
      userImage,
      garmentImage,
      garmentName: garmentName || "PrimeNest Apparel",
      category: category || "Apparel",
      productId,
      engine: engine || "gemini-3",
    });

    return Response.json({
      success: true,
      data: tryOnResult,
    });
  } catch (error) {
    console.error("POST /api/ai/try-on error:", error);
    return Response.json(
      { error: "Virtual Try-On engine encountered an error", details: error.message },
      { status: 500 }
    );
  }
}
