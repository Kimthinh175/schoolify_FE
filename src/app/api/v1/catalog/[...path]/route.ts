import { NextRequest, NextResponse } from 'next/server';
import { MOCK_LEADERBOARD_USERS, MOCK_SEASONS } from '@/services/mock/leaderboard-data';

const BE_BASE_URL = process.env.NEXT_PUBLIC_BE_URL || process.env.BE_URL || 'http://localhost:3005';

function buildHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const passthroughKeys = [
    'cookie',
    'authorization',
    'x-user-id',
    'user-agent',
    'accept-language',
    'cf-connecting-ip',
    'true-client-ip',
    'cf-ipcountry',
    'cf-ipcity',
    'cf-region',
    'cf-timezone',
    'x-real-ip',
    'x-forwarded-for',
  ];
  for (const key of passthroughKeys) {
    const val = req.headers.get(key);
    if (val) headers[key] = val;
  }
  return headers;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const subPath = path.join('/');
  const search = req.nextUrl.search || '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const beRes = await fetch(`${BE_BASE_URL}/catalog/${subPath}${search}`, {
      method: 'GET',
      headers: buildHeaders(req),
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await beRes.json().catch(() => ({ success: beRes.ok }));
    return NextResponse.json(data, { status: beRes.status });
  } catch {
    // Backend offline / connection refused -> handle graceful fallback
  }

  // Graceful Fallback khi Backend offline
  if (subPath === 'leaderboard') {
    const subject = req.nextUrl.searchParams.get('subject')?.toLowerCase();
    let list = [...MOCK_LEADERBOARD_USERS];
    if (subject === 'math') {
      const mathUsers = list.filter((u) => u.primarySubject === 'MATH');
      list = mathUsers.length >= 10 ? mathUsers : list;
    } else if (subject === 'cs') {
      const csUsers = list.filter((u) => u.primarySubject === 'INFORMATICS' || u.primarySubject === 'PHYSICS');
      list = csUsers.length >= 10 ? csUsers : list;
    }

    const formatted = list.slice(0, 15).map((u, i) => ({
      rank: i + 1,
      studentId: u.id,
      userId: u.id,
      fullname: u.name,
      email: `${u.id}@schoolify.edu.vn`,
      avatarUrl: u.avatar,
      schoolName: u.schoolName,
      gradeLevel: u.grade || 'GRADE_12',
      points: u.points,
      examPoints: u.points,
      totalExams: u.quizzesCompleted || Math.max(5, 14 - i),
      avgScore: Number(((u.correctRate || 95) / 10).toFixed(2)),
      streakDays: u.streakDays || 7,
      gems: u.gems || Math.max(50, 240 - i * 15),
      scale: Math.min(1.0, Math.max(0.85, Number(((u.correctRate || 95) / 100).toFixed(3)))),
    }));

    return NextResponse.json({ success: true, source: 'fallback', data: formatted }, { status: 200 });
  }

  if (subPath === 'seasons') {
    return NextResponse.json({ success: true, source: 'fallback', data: MOCK_SEASONS }, { status: 200 });
  }

  return NextResponse.json(
    {
      success: false,
      message: 'Catalog Backend hiện không phản hồi và chưa có dữ liệu fallback',
    },
    { status: 503 }
  );
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subPath = path.join('/');
    const body = await req.json().catch(() => ({}));

    const beRes = await fetch(`${BE_BASE_URL}/catalog/${subPath}`, {
      method: 'POST',
      headers: buildHeaders(req),
      body: JSON.stringify(body),
    });

    const data = await beRes.json().catch(() => ({ success: beRes.ok }));
    return NextResponse.json(data, { status: beRes.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Lỗi kết nối Catalog Backend',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subPath = path.join('/');
    const body = await req.json().catch(() => ({}));

    const beRes = await fetch(`${BE_BASE_URL}/catalog/${subPath}`, {
      method: 'PATCH',
      headers: buildHeaders(req),
      body: JSON.stringify(body),
    });

    const data = await beRes.json().catch(() => ({ success: beRes.ok }));
    return NextResponse.json(data, { status: beRes.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Lỗi kết nối Catalog Backend',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subPath = path.join('/');

    const beRes = await fetch(`${BE_BASE_URL}/catalog/${subPath}`, {
      method: 'DELETE',
      headers: buildHeaders(req),
    });

    const data = await beRes.json().catch(() => ({ success: beRes.ok }));
    return NextResponse.json(data, { status: beRes.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Lỗi kết nối Catalog Backend',
      },
      { status: 500 }
    );
  }
}
