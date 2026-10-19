import { NextRequest, NextResponse } from 'next/server';

const BE_BASE_URL = process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:3001';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subPath = path.join('/');
    const body = await req.json().catch(() => ({}));

    const beRes = await fetch(`${BE_BASE_URL}/auth/${subPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: req.headers.get('cookie') || '',
      },
      body: JSON.stringify(body),
    });

    const data = await beRes.json();
    const res = NextResponse.json(data, { status: beRes.status });

    const setCookie = beRes.headers.get('set-cookie');
    if (setCookie) {
      res.headers.set('set-cookie', setCookie);
    }

    return res;
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Lỗi kết nối đến cổng xác thực Backend',
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subPath = path.join('/');

    const beRes = await fetch(`${BE_BASE_URL}/auth/${subPath}`, {
      method: 'GET',
      headers: {
        cookie: req.headers.get('cookie') || '',
        authorization: req.headers.get('authorization') || '',
      },
    });

    const data = await beRes.json();
    return NextResponse.json(data, { status: beRes.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Lỗi kết nối đến cổng xác thực Backend',
      },
      { status: 500 }
    );
  }
}
