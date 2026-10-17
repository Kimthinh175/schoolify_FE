import { promises as fs } from 'fs';
import path from 'path';

/**
 * Demo JSON database (json-server style) - đọc/ghi file `data/db.json`.
 * Chỉ dùng cho môi trường demo; khi có Backend thật chỉ cần đổi các service phía client.
 */
export const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

/** Danh sách collection được phép truy cập qua API (whitelist). */
export const DB_COLLECTIONS = [
  'examSnapshots',
  'practiceHistory',
  'assignments',
  'gradedSubmissions',
  'offlineSubmissions',
  'generatedQuestions',
] as const;

export type DbCollection = (typeof DB_COLLECTIONS)[number];
export type DbRecord = { id: string; [key: string]: unknown };
export type DbData = Record<string, DbRecord[]>;

/** Giới hạn số bản ghi tối đa cho mỗi collection (tránh file phình to). */
const COLLECTION_LIMITS: Partial<Record<DbCollection, number>> = {
  examSnapshots: 50,
};

export function isDbCollection(name: string): name is DbCollection {
  return (DB_COLLECTIONS as readonly string[]).includes(name);
}

async function readDb(): Promise<DbData> {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(raw) as DbData;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return {};
    throw err;
  }
}

async function writeDb(data: DbData): Promise<void> {
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, DB_FILE); // ghi nguyên tử, tránh hỏng file khi ghi dở
}

// Hàng đợi ghi tuần tự để tránh race condition giữa các request đồng thời
let writeQueue: Promise<unknown> = Promise.resolve();
function mutate<T>(fn: (data: DbData) => T | Promise<T>): Promise<T> {
  const run = writeQueue.then(async () => {
    const data = await readDb();
    const result = await fn(data);
    await writeDb(data);
    return result;
  });
  writeQueue = run.catch(() => undefined);
  return run;
}

export async function listRecords(collection: DbCollection): Promise<DbRecord[]> {
  const data = await readDb();
  return data[collection] ?? [];
}

export async function getRecord(collection: DbCollection, id: string): Promise<DbRecord | null> {
  const list = await listRecords(collection);
  return list.find((r) => r.id === id) ?? null;
}

/** Thêm mới (hoặc ghi đè nếu trùng id) - bản ghi mới nhất nằm đầu danh sách. */
export function upsertRecord(collection: DbCollection, record: DbRecord): Promise<DbRecord> {
  return mutate((data) => {
    const list = (data[collection] ?? []).filter((r) => r.id !== record.id);
    const updated = [record, ...list];
    const limit = COLLECTION_LIMITS[collection];
    data[collection] = limit ? updated.slice(0, limit) : updated;
    return record;
  });
}

export function patchRecord(
  collection: DbCollection,
  id: string,
  patch: Record<string, unknown>
): Promise<DbRecord | null> {
  return mutate((data) => {
    const list = data[collection] ?? [];
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch, id };
    data[collection] = list;
    return list[idx];
  });
}

export function deleteRecord(collection: DbCollection, id: string): Promise<boolean> {
  return mutate((data) => {
    const list = data[collection] ?? [];
    const next = list.filter((r) => r.id !== id);
    data[collection] = next;
    return next.length !== list.length;
  });
}
