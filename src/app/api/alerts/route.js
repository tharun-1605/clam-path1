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

export async function GET() {
    try {
        const alerts = readAlerts();
        // return latest first
        const sorted = alerts.slice().sort((a, b) => b.timestamp - a.timestamp).slice(0, 200);
        return new Response(JSON.stringify({ ok: true, alerts: sorted }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        console.error('alerts GET error', err);
        return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
