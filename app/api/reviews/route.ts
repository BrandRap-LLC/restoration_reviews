import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { storeId, rating, feedback, name, phone, email, source, submittedAt } =
      body;

    if (!storeId || !rating || !feedback || !name || !phone || !email || !source || !submittedAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Only accept 1-4 star reviews (5 stars are handled client-side)
    if (rating < 1 || rating > 4) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 4 for webhook submission" },
        { status: 400 }
      );
    }

    if (!["ip", "gps", "manual"].includes(source)) {
      return NextResponse.json(
        { error: "Invalid location source" },
        { status: 400 }
      );
    }

    // Get webhook endpoint from environment variable
    const webhookUrl = process.env.WEBHOOK_ENDPOINT_URL;

    if (!webhookUrl) {
      console.error("WEBHOOK_ENDPOINT_URL environment variable is not set");
      return NextResponse.json(
        { error: "Webhook endpoint not configured" },
        { status: 500 }
      );
    }

    // Prepare review data for webhook
    const reviewData = {
      storeId,
      rating,
      feedback,
      name,
      phone,
      email,
      submittedAt,
    };

    // Send to webhook endpoint
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error("Webhook error:", errorText);
      return NextResponse.json(
        { error: "Failed to submit review to webhook" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
