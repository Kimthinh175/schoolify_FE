import { NextRequest, NextResponse } from 'next/server';
import { MOCK_NEWS_ARTICLES, MOCK_NEWS_CATEGORIES } from '@/services/mock/news-data';

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
  const subPath =
    Array.isArray(pathSegments) && pathSegments.length > 0
      ? `/${pathSegments.join('/')}`
      : '';
  const search = req.nextUrl.search || '';
  const method = req.method.toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD' && method !== 'DELETE';
  const bodyText = hasBody ? await req.text().catch(() => '') : undefined;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const beRes = await fetch(
      `${BE_BASE_URL}/${resourcePrefix}${subPath}${search}`,
      {
        method,
        headers: buildProxyHeaders(req),
        body: hasBody && bodyText ? bodyText : undefined,
        cache: 'no-store',
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);

    const data = await beRes.json().catch(() => ({
      success: beRes.ok,
      statusCode: beRes.status,
    }));
    return NextResponse.json(data, { status: beRes.status });
  } catch {
    // Backend offline / network error -> graceful fallback below
  }

  // Graceful Fallback cho News CMS khi backend offline
  if (resourcePrefix === 'news' && method === 'GET') {
    if (subPath === '/categories') {
      return NextResponse.json({ success: true, source: 'fallback', data: MOCK_NEWS_CATEGORIES }, { status: 200 });
    }
    if (subPath === '/articles' || subPath === '') {
      const categoryId = req.nextUrl.searchParams.get('categoryId');
      let articles = [...MOCK_NEWS_ARTICLES];
      if (categoryId) {
        articles = articles.filter(a => a.category_id === categoryId);
      }
      return NextResponse.json({ success: true, source: 'fallback', data: articles }, { status: 200 });
    }
    if (subPath.startsWith('/articles/')) {
      const slug = subPath.replace('/articles/', '');
      const article = MOCK_NEWS_ARTICLES.find(a => a.slug === slug || a.id === slug);
      if (article) {
        return NextResponse.json({ success: true, source: 'fallback', data: article }, { status: 200 });
      }
    }
  }

  return NextResponse.json(
    {
      success: false,
      message: `Lỗi kết nối ${resourcePrefix} Backend (dịch vụ tạm thời offline)`,
    },
    { status: 503 },
  );
}
