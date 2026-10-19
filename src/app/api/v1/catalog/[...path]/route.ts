import { NextRequest, NextResponse } from 'next/server';

const BE_BASE_URL = process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:3001';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subPath = path.join('/');
    const search = req.nextUrl.search || '';

    const beRes = await fetch(`${BE_BASE_URL}/catalog/${subPath}${search}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await beRes.json();
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await beRes.json();
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await beRes.json();
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
