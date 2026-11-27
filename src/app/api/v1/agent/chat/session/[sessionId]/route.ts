import { NextRequest, NextResponse } from 'next/server';

const BE_BASE_URL = process.env.NEXT_PUBLIC_BE_URL || process.env.BE_URL || 'http://localhost:3005';

function buildAuthHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const cookie = req.headers.get('cookie');
  if (cookie) headers['cookie'] = cookie;
  const auth = req.headers.get('authorization');
  if (auth) headers['authorization'] = auth;
  return headers;
}

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
      headers: buildAuthHeaders(req),
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

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    if (!sessionId) {
      return NextResponse.json({ success: false, message: 'Thiếu sessionId' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const beRes = await fetch(`${BE_BASE_URL}/agent/chat/session/${encodeURIComponent(sessionId)}`, {
      method: 'PATCH',
      headers: buildAuthHeaders(req),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(6000),
    });

    if (beRes.ok) {
      const data = await beRes.json();
      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json({ success: false, message: 'Không thể cập nhật phiên' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, message: 'Không thể cập nhật phiên' }, { status: 500 });
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
      headers: buildAuthHeaders(req),
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
