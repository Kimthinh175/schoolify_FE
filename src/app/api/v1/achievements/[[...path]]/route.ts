import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/bff-proxy';

type Context = { params: Promise<{ path?: string[] }> };

export async function GET(req: NextRequest, ctx: Context) {
  return proxyToBackend(req, 'achievements', (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: Context) {
  return proxyToBackend(req, 'achievements', (await ctx.params).path);
}
export async function DELETE(req: NextRequest, ctx: Context) {
  return proxyToBackend(req, 'achievements', (await ctx.params).path);
}
