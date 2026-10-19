import { NextResponse } from 'next/server';
import { upsertRecord } from '@/lib/server/json-db';

const BE_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const questions = Array.isArray(body?.questions) ? body.questions : [];

    // 1. Lưu đồng thời vào Demo JSON DB (`data/db.json` -> `generatedQuestions`)
    for (const q of questions) {
      if (q && q.id) {
        await upsertRecord('generatedQuestions', q);
      }
    }

    // 2. Gửi sang Backend PostgreSQL (`POST /agent/docx-save-to-bank`)
    const res = await fetch(`${BE_BASE_URL}/agent/docx-save-to-bank`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
