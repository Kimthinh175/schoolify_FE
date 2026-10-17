import { NextResponse } from 'next/server';

const BE_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Nếu client gửi multipart/form-data (upload file .docx trực tiếp)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const res = await fetch(`${BE_BASE_URL}/agent/docx-scan-generate`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    // Nếu client gửi JSON payload (chứa rawText, seedQuestions, targetCount, bloomRatio...)
    const body = await request.json();
    const res = await fetch(`${BE_BASE_URL}/agent/docx-scan-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('[API Proxy docx-scan-generate Error]:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi kết nối AI Backend khi quét đề .docx: ' + (error?.message || 'Unknown error'),
      },
      { status: 500 },
    );
  }
}
