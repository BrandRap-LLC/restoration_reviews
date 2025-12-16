import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const cfLatitude = request.headers.get("cf-iplatitude");
    const cfLongitude = request.headers.get("cf-iplongitude");
    const cfCity = request.headers.get("cf-ipcity");
    const cfRegion = request.headers.get("cf-ipregion");

    if (cfLatitude && cfLongitude) {
      return NextResponse.json({
        lat: parseFloat(cfLatitude),
        lng: parseFloat(cfLongitude),
        city: cfCity || undefined,
        region: cfRegion || undefined,
        source: "ip",
      });
    }

    return NextResponse.json({
      lat: 37.7749,
      lng: -122.4194,
      city: "San Francisco",
      region: "CA",
      source: "ip",
    });
  } catch (error) {
    console.error("Geolocation error:", error);

    return NextResponse.json({
      lat: 37.7749,
      lng: -122.4194,
      city: "San Francisco",
      region: "CA",
      source: "ip",
    });
  }
}
