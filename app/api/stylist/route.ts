import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, productName } = await req.json();

    // Gemini removed — return a styled fallback response
    const fallbacks = [
      `Our earth-tone collection is designed for versatile layering. The ${productName || 'piece'} pairs beautifully with wide-leg cargos or raw denim for a balanced luxury silhouette.`,
      'Pair our terracotta and oatmeal tops with wide-leg cargos or dark denim for a balanced luxury earth-tone silhouette.',
      'Welcome to Above Apprl. Our collection features 380–500GSM organic heavyweight cottons, French flax linen, and mineral garment washes.',
    ];

    const reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { reply: 'Our apprl earth-tone collection is designed for versatile layering.' },
      { status: 200 }
    );
  }
}
