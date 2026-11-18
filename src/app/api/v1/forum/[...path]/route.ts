import { NextRequest, NextResponse } from 'next/server';

const BE_BASE_URL =
  process.env.NEXT_PUBLIC_BE_URL || process.env.BE_URL || 'http://localhost:3005';

function buildHeaders(req: NextRequest, includeContentType = true): Record<string, string> {
  const headers: Record<string, string> = {};
  if (includeContentType) {
    const incomingContentType = req.headers.get('content-type');
    headers['Content-Type'] = incomingContentType || 'application/json';
  }
  const passthroughKeys = [
    'cookie',
    'authorization',
    'x-user-id',
    'user-agent',
    'accept-language',
    'x-real-ip',
    'x-forwarded-for',
  ];
  for (const key of passthroughKeys) {
    const val = req.headers.get(key);
    if (val) headers[key] = val;
  }
  return headers;
}

async function forward(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
) {
  try {
    const { path } = await context.params;
    const subPath = path.join('/');
    const search = req.nextUrl.search || '';
    const hasBody = method === 'POST' || method === 'PATCH' || method === 'PUT';
    const contentType = req.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');

    // Chuyển tiếp multipart/form-data (upload ảnh <= 5MB lên Cloudinary tại BE)
    if (hasBody && isMultipart) {
      const formData = await req.formData();
      const beUploadRes = await fetch(`${BE_BASE_URL}/api/v1/forum/${subPath}${search}`, {
        method,
        headers: buildHeaders(req, false),
        body: formData,
        cache: 'no-store',
      });
      const uploadData = await beUploadRes.json().catch(() => ({
        success: beUploadRes.ok,
        message: beUploadRes.statusText,
      }));
      return NextResponse.json(uploadData, { status: beUploadRes.status });
    }

    const rawBody = hasBody ? await req.text() : undefined;

    const beRes = await fetch(`${BE_BASE_URL}/api/v1/forum/${subPath}${search}`, {
      method,
      headers: buildHeaders(req, true),
      ...(hasBody && rawBody ? { body: rawBody } : {}),
      cache: 'no-store',
    });

    const data = await beRes.json().catch(() => ({
      success: beRes.ok,
      message: beRes.statusText,
    }));
    return NextResponse.json(data, { status: beRes.status });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Lỗi kết nối Forum Backend';
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return forward(req, context, 'GET');
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return forward(req, context, 'POST');
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return forward(req, context, 'PATCH');
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return forward(req, context, 'PUT');
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return forward(req, context, 'DELETE');
}
