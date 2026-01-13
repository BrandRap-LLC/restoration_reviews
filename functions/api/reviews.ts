export async function onRequest(context: any) {
    const { request, env } = context;

    if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    try {
        const body: any = await request.json();
        const { storeId, rating, feedback, name, phone, email, source, submittedAt } = body;

        if (!storeId || !rating || !feedback || !name || !phone || !email || !source || !submittedAt) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), {
                status: 400,
                headers: { "content-type": "application/json" }
            });
        }

        const webhookUrl = env.WEBHOOK_ENDPOINT_URL;

        if (!webhookUrl) {
            console.error("WEBHOOK_ENDPOINT_URL environment variable is not set in Cloudflare dashboard");
            return new Response(JSON.stringify({ error: "Webhook endpoint not configured" }), {
                status: 500,
                headers: { "content-type": "application/json" }
            });
        }

        const reviewData = {
            storeId,
            rating,
            feedback,
            name,
            phone,
            email,
            submittedAt,
        };

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
            return new Response(JSON.stringify({ error: "Failed to submit review to webhook" }), {
                status: 500,
                headers: { "content-type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "content-type": "application/json" }
        });
    } catch (error) {
        console.error("Review submission error:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "content-type": "application/json" }
        });
    }
}
