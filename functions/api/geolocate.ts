export async function onRequest(context: any) {
    const { request } = context;
    try {
        const cfLatitude = request.headers.get("cf-iplatitude");
        const cfLongitude = request.headers.get("cf-iplongitude");
        const cfCity = request.headers.get("cf-ipcity");
        const cfRegion = request.headers.get("cf-ipregion");

        if (cfLatitude && cfLongitude) {
            return new Response(JSON.stringify({
                lat: parseFloat(cfLatitude),
                lng: parseFloat(cfLongitude),
                city: cfCity || undefined,
                region: cfRegion || undefined,
                source: "ip",
            }), {
                headers: { "content-type": "application/json" }
            });
        }

        return new Response(JSON.stringify({
            lat: 37.7749,
            lng: -122.4194,
            city: "San Francisco",
            region: "",
            source: "ip",
        }), {
            headers: { "content-type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            lat: 37.7749,
            lng: -122.4194,
            city: "San Francisco",
            region: "",
            source: "ip",
        }), {
            headers: { "content-type": "application/json" }
        });
    }
}
