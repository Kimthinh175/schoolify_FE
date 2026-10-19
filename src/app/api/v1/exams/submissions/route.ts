import { NextRequest, NextResponse } from 'next/server';

const BE_BASE_URL = process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:3001';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const beRes = await fetch(`${BE_BASE_URL}/api/v1/exams/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: req.headers.get('cookie') || '',
        authorization: req.headers.get('authorization') || '',
        'x-user-id': req.headers.get('x-user-id') || '',
        'x-user-role': req.headers.get('x-user-role') || '',
      },
      body: JSON.stringify(body),
    });

    const data = await beRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: beRes.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Lỗi kết nối đến cổng nộp bài thi Backend',
      },
      { status: 500 },
    );
  }
}
