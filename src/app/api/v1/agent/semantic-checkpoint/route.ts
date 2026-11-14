import { NextRequest, NextResponse } from 'next/server';

const BE_BASE_URL = process.env.NEXT_PUBLIC_BE_URL || process.env.BE_URL || 'http://localhost:3005';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const beRes = await fetch(`${BE_BASE_URL}/agent/semantic-checkpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: req.headers.get('cookie') || '',
        authorization: req.headers.get('authorization') || '',
      },
      body: JSON.stringify(body),
    });

    const data = await beRes.json();
    return NextResponse.json(data, { status: beRes.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Không thể kết nối đến Semantic Checkpoint Engine',
      },
      { status: 500 }
    );
  }
}
