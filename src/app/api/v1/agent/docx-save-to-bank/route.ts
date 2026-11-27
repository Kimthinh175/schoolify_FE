import { NextResponse } from 'next/server';

const BE_BASE_URL = process.env.NEXT_PUBLIC_BE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookie = request.headers.get('cookie') || '';
    const authorization = request.headers.get('authorization') || '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (cookie) headers['cookie'] = cookie;
    if (authorization) headers['authorization'] = authorization;

    // Gửi thẳng sang Backend PostgreSQL (`POST /agent/docx-save-to-bank`)
    const res = await fetch(`${BE_BASE_URL}/agent/docx-save-to-bank`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('[API Proxy docx-save-to-bank Error]:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi khi lưu câu hỏi vào Ngân hàng: ' + (error?.message || 'Unknown error'),
      },
      { status: 500 },
    );
  }
}
