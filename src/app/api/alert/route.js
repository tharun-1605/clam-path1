import fs from 'fs';
import path from 'path';

const ALERTS_FILE = path.join(process.cwd(), 'alerts.json');

function readAlerts() {
    try {
        if (!fs.existsSync(ALERTS_FILE)) return [];
        const raw = fs.readFileSync(ALERTS_FILE, 'utf8');
        return JSON.parse(raw || '[]');
    } catch (e) {
        console.error('readAlerts error', e);
        return [];
    }
}

function writeAlerts(list) {
    try {
        fs.writeFileSync(ALERTS_FILE, JSON.stringify(list.slice(-200)), 'utf8');
    } catch (e) {
        console.error('writeAlerts error', e);
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const id = body.id || `alert_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const entry = {
            id,
            message: body.message || 'Emergency alert',
            lat: Number(body.lat) || null,
            lon: Number(body.lon) || null,
            userId: body.userId || null,
            timestamp: body.timestamp || Date.now()
        };

        const alerts = readAlerts();
        alerts.push(entry);
        writeAlerts(alerts);

        console.log('Stored alert', entry.id);
        return new Response(JSON.stringify({ ok: true, id: entry.id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        console.error('Alert endpoint error', err);
        return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
