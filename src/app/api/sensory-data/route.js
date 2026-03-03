import { NextResponse } from 'next/server';

export async function GET(request) {
    // Simulate fetching rows from Google Sheets
    return NextResponse.json({
        data: [
            { street: "5th Ave", decibel: 85, light: "High", crowd: "Dense" },
            { street: "Park Lane", decibel: 40, light: "Low", crowd: "Sparse" }
        ]
    });
}

export async function POST(request) {
    const body = await request.json();
    // Simulate updating sheet
    return NextResponse.json({ success: true, message: "Sheet updated" });
}
