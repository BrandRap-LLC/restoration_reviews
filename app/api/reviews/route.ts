import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { storeId, rating, title, review, name, email, source, submittedAt } =
      body;

    if (!storeId || !rating || !review || !source || !submittedAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (!["ip", "gps", "manual"].includes(source)) {
      return NextResponse.json(
        { error: "Invalid location source" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        store_id: storeId,
        rating,
        title: title || "",
        review,
        customer_name: name || "",
        customer_email: email || "",
        location_source: source,
        submitted_at: submittedAt,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to save review" },
        { status: 500 }
      );
    }

    console.log("Review submitted successfully:", {
      id: data.id,
      storeId: data.store_id,
      rating: data.rating,
      source: data.location_source,
    });

    return NextResponse.json({ success: true, reviewId: data.id });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
