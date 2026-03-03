export async function POST(req) {
    try {
        const body = await req.json();
        // Minimal server-side stub: you can extend this to integrate with Twilio, FCM, or email services.
        console.log('Received emergency alert:', body);
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        console.error('Alert endpoint error', err);
        return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
