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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || req.headers.get('x-user-id') || 'usr-student-01';
    const q = searchParams.get('q') || '';

    const params = new URLSearchParams({ userId });
    if (q) params.set('q', q);

    const beRes = await fetch(`${BE_BASE_URL}/agent/sessions?${params.toString()}`, {
      method: 'GET',
      headers: buildAuthHeaders(req),
      signal: AbortSignal.timeout(6000),
    });

    if (beRes.ok) {
      const data = await beRes.json();
      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          sessions: [],
          grouped: { pinned: [], today: [], previous7Days: [], older: [] },
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        success: true,
        data: {
          sessions: [],
          grouped: { pinned: [], today: [], previous7Days: [], older: [] },
        },
      },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const beRes = await fetch(`${BE_BASE_URL}/agent/sessions`, {
      method: 'POST',
      headers: buildAuthHeaders(req),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(6000),
    });

    if (beRes.ok) {
      const data = await beRes.json();
      return NextResponse.json(data, { status: 200 });
    }

    const fallbackKey = `sess-scl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    return NextResponse.json(
      {
        success: true,
        data: {
          session: {
            id: fallbackKey,
            sessionKey: fallbackKey,
            userId: body?.userId || 'usr-student-01',
            title: body?.title || 'Cuộc trò chuyện mới',
            isPinned: false,
            messageCount: 0,
            lastMessagePreview: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      },
      { status: 200 }
    );
  } catch {
    const fallbackKey = `sess-scl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    return NextResponse.json(
      {
        success: true,
        data: {
          session: {
            id: fallbackKey,
            sessionKey: fallbackKey,
            userId: 'usr-student-01',
            title: 'Cuộc trò chuyện mới',
            isPinned: false,
            messageCount: 0,
            lastMessagePreview: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      },
      { status: 200 }
    );
  }
}
