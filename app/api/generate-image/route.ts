import { NextRequest, NextResponse } from 'next/server';

const DIMENSIONS: Record<string, { w: number; h: number }> = {
  '9:16': { w: 1080, h: 1920 },
  '16:9': { w: 1920, h: 1080 },
  '4:1':  { w: 2000, h: 500  },
  '3:4':  { w: 1200, h: 1600 },
  '1:1':  { w: 1200, h: 1200 },
  '1:4':  { w: 500,  h: 2000 },
};

export async function POST(req: NextRequest) {
  try {
    const { prompt, aspectRatio = '9:16' } = await req.json();
    const dim = DIMENSIONS[aspectRatio] ?? DIMENSIONS['9:16'];
    const seed = Math.floor(Math.random() * 100000);

    return NextResponse.json({
      imageUrl: `https://picsum.photos/seed/${seed}/${dim.w}/${dim.h}`,
      aspectRatio,
      prompt,
      isFallback: true,
      message: 'Generated high-resolution aspect-fit image template.',
    });
  } catch {
    return NextResponse.json({ imageUrl: '', isFallback: true }, { status: 200 });
  }
}
