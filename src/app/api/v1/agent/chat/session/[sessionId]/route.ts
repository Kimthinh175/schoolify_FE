import { NextRequest, NextResponse } from 'next/server';

const BE_BASE_URL = process.env.NEXT_PUBLIC_BE_URL || process.env.BE_URL || 'http://localhost:3005';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    if (!sessionId) {
      return NextResponse.json({ success: false, message: 'Thiếu sessionId' }, { status: 400 });
    }

    const beRes = await fetch(`${BE_BASE_URL}/agent/chat/session/${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(6000),
    });

    if (beRes.ok) {
      const data = await beRes.json();
      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json({ success: true, data: { sessionId, messages: [] } }, { status: 200 });
  } catch {
    return NextResponse.json({ success: true, data: { messages: [] } }, { status: 200 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    if (!sessionId) {
      return NextResponse.json({ success: false, message: 'Thiếu sessionId' }, { status: 400 });
    }

    const beRes = await fetch(`${BE_BASE_URL}/agent/chat/session/${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(6000),
    });

    if (beRes.ok) {
      const data = await beRes.json();
      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa session' }, { status: 200 });
  } catch {
    return NextResponse.json({ success: true, message: 'Đã xóa session' }, { status: 200 });
  }
}
