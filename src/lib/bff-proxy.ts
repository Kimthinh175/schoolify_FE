import { NextRequest, NextResponse } from 'next/server';

const BE_BASE_URL =
  process.env.NEXT_PUBLIC_BE_URL || process.env.BE_URL || 'http://localhost:3005';

function buildProxyHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const passthroughKeys = [
    'cookie',
    'authorization',
    'x-user-id',
    'x-school-id',
    'user-agent',
    'accept-language',
  ];
  for (const key of passthroughKeys) {
    const val = req.headers.get(key);
    if (val) headers[key] = val;
  }
  return headers;
}

export async function proxyToBackend(
  req: NextRequest,
  resourcePrefix: string,
  pathSegments?: string[],
) {
  try {
    const subPath =
      Array.isArray(pathSegments) && pathSegments.length > 0
        ? `/${pathSegments.join('/')}`
        : '';
    const search = req.nextUrl.search || '';
    const method = req.method.toUpperCase();
    const hasBody = method !== 'GET' && method !== 'HEAD' && method !== 'DELETE';
    const bodyText = hasBody ? await req.text().catch(() => '') : undefined;

    const beRes = await fetch(
      `${BE_BASE_URL}/${resourcePrefix}${subPath}${search}`,
      {
        method,
        headers: buildProxyHeaders(req),
        body: hasBody && bodyText ? bodyText : undefined,
        cache: 'no-store',
      },
    );

    const data = await beRes.json().catch(() => ({
      success: beRes.ok,
      statusCode: beRes.status,
    }));

    return NextResponse.json(data, { status: beRes.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || `Lỗi kết nối ${resourcePrefix} Backend`,
      },
      { status: 500 },
    );
  }
}
