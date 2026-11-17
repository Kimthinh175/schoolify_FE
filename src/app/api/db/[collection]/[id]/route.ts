import { NextResponse } from 'next/server';
import { isDbCollection, getRecord, patchRecord, deleteRecord } from '@/lib/server/json-db';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ collection: string; id: string }> };

const notFound = (message: string) => NextResponse.json({ success: false, message }, { status: 404 });

/** GET /api/db/:collection/:id */
export async function GET(_request: Request, { params }: Ctx) {
  const { collection, id } = await params;
  if (!isDbCollection(collection)) return notFound('Collection không tồn tại');
  const record = await getRecord(collection, id);
  if (!record) return notFound('Không tìm thấy bản ghi');
  return NextResponse.json({ success: true, data: record });
}

/** PATCH /api/db/:collection/:id - cập nhật một phần */
export async function PATCH(request: Request, { params }: Ctx) {
  const { collection, id } = await params;
  if (!isDbCollection(collection)) return notFound('Collection không tồn tại');
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Body JSON không hợp lệ' }, { status: 400 });
  }
  const updated = await patchRecord(collection, id, body);
  if (!updated) return notFound('Không tìm thấy bản ghi');
  return NextResponse.json({ success: true, data: updated });
}

/** DELETE /api/db/:collection/:id */
export async function DELETE(_request: Request, { params }: Ctx) {
  const { collection, id } = await params;
  if (!isDbCollection(collection)) return notFound('Collection không tồn tại');
  const ok = await deleteRecord(collection, id);
  if (!ok) return notFound('Không tìm thấy bản ghi');
  return NextResponse.json({ success: true });
}
