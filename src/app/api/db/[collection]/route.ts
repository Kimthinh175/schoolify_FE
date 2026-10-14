import { NextResponse } from 'next/server';
import { isDbCollection, listRecords, upsertRecord, DbRecord } from '@/lib/server/json-db';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ collection: string }> };

/** GET /api/db/:collection - lấy toàn bộ bản ghi (hỗ trợ lọc ?field=value) */
export async function GET(request: Request, { params }: Ctx) {
  const { collection } = await params;
  if (!isDbCollection(collection)) {
    return NextResponse.json({ success: false, message: 'Collection không tồn tại' }, { status: 404 });
  }
  const { searchParams } = new URL(request.url);
  let records = await listRecords(collection);
  searchParams.forEach((value, key) => {
    records = records.filter((r) => String(r[key]) === value);
  });
  return NextResponse.json({ success: true, data: records });
}

/** POST /api/db/:collection - thêm mới (ghi đè nếu trùng id) */
export async function POST(request: Request, { params }: Ctx) {
  const { collection } = await params;
  if (!isDbCollection(collection)) {
    return NextResponse.json({ success: false, message: 'Collection không tồn tại' }, { status: 404 });
  }
  let body: Partial<DbRecord>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Body JSON không hợp lệ' }, { status: 400 });
  }
  const record: DbRecord = { ...body, id: body.id ? String(body.id) : `${collection}-${Date.now()}` };
  const saved = await upsertRecord(collection, record);
  return NextResponse.json({ success: true, data: saved }, { status: 201 });
}
