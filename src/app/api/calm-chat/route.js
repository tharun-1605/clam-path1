import { NextResponse } from 'next/server';

function crisisCheck(text) {
    const t = (text || '').toLowerCase();
    const patterns = [
        'suicide',
        'kill myself',
        'end my life',
        'self harm',
        'hurt myself'
    ];
    return patterns.some((p) => t.includes(p));
}

function extractJson(text) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    try {
        return JSON.parse(text.slice(start, end + 1));
    } catch {
        return null;
    }
}

function normalizeModelName(name) {
    if (!name) return '';
    return name.replace(/^models\//, '').trim();
}

async function discoverModels(apiKey) {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!res.ok) return [];
        const data = await res.json();
        const models = data?.models || [];
        return models
            .filter((m) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
            .map((m) => normalizeModelName(m.name))
            .filter(Boolean);
    } catch {
        return [];
    }
}

export async function POST(req) {
    try {
        const { message, location, calmScore } = await req.json();
        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
        }

        if (crisisCheck(message)) {
            return NextResponse.json({
                reply: 'I am really glad you reached out. You deserve immediate support from a human professional. If you are in immediate danger, call your local emergency number now. If you are in the U.S. or Canada, call or text 988.',
                audioSuggestions: [
                    'Brown noise at low volume (10 minutes)',
                    'Slow ocean wave ambience (8 minutes)'
                ]
            });
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Chat API key is missing on server.' }, { status: 500 });
        }

        const prompt = `
You are a calm-support assistant for a sensory-safe navigation app.
User context:
- Location: ${location || 'Unknown'}
- Calm score: ${Number(calmScore || 0).toFixed(1)}

Task:
1) Reply with short supportive guidance (not clinical diagnosis).
2) Suggest 2 to 4 calming audio ideas that are practical.
3) Suggest one quick breathing or grounding exercise.

Return strict JSON only with this shape:
{
  "reply": "string",
  "audioSuggestions": ["string", "string"],
  "exercise": "string"
}

User message:
${message}
`;

        const preferredModel = normalizeModelName(process.env.GEMINI_MODEL || 'gemini-3-flash-preview');
        const discovered = await discoverModels(apiKey);

        const rankedDiscovered = [...discovered].sort((a, b) => {
            const score = (n) => {
                let s = 0;
                if (n.includes('flash')) s += 4;
                if (n.includes('2.5')) s += 3;
                if (n.includes('2.0')) s += 2;
                if (n.includes('1.5')) s += 1;
                if (n.includes('preview')) s += 0.5;
                return s;
            };
            return score(b) - score(a);
        });

        const candidateModels = Array.from(new Set([
            preferredModel,
            ...rankedDiscovered,
            'gemini-2.0-flash',
            'gemini-1.5-flash-latest'
        ].filter(Boolean)));

        let data = null;
        const errors = [];

        for (const model of candidateModels) {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.6,
                            maxOutputTokens: 500
                        }
                    })
                }
            );

            if (response.ok) {
                data = await response.json();
                break;
            }

            const errText = await response.text();
            errors.push(`model=${model} -> ${errText}`);
        }

        if (!data) {
            return NextResponse.json({ error: `AI request failed: ${errors.join(' | ')}` }, { status: 502 });
        }

        const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('\n') || '';
        const parsed = extractJson(text);

        if (!parsed) {
            return NextResponse.json({
                reply: text || 'Try 4-4-6 breathing for 2 minutes and reduce nearby sensory load.',
                audioSuggestions: ['Soft rain ambience (10 minutes)', 'Brown noise with low volume'],
                exercise: 'Inhale 4s, hold 4s, exhale 6s for 8 cycles.'
            });
        }

        return NextResponse.json({
            reply: parsed.reply || 'Take a short pause and focus on your breathing.',
            audioSuggestions: Array.isArray(parsed.audioSuggestions) ? parsed.audioSuggestions.slice(0, 4) : [],
            exercise: parsed.exercise || 'Inhale 4s, exhale 6s for 2 minutes.'
        });
    } catch (error) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
