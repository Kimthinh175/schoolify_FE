/**
 * Client helper gọi Demo JSON DB (`data/db.json`) qua Next API `/api/db/*`.
 * Quy ước: MỌI dữ liệu demo đều phải đi qua helper này thay vì localStorage / mock inline.
 */
const BASE = '/api/db';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    cache: 'no-store',
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || `Demo DB request failed (${res.status})`);
  }
  return json.data as T;
}

export const demoDb = {
  list<T>(collection: string, filter?: Record<string, string>): Promise<T[]> {
    const qs = filter ? `?${new URLSearchParams(filter).toString()}` : '';
    return request<T[]>(`${BASE}/${collection}${qs}`);
  },
  get<T>(collection: string, id: string): Promise<T> {
    return request<T>(`${BASE}/${collection}/${encodeURIComponent(id)}`);
  },
  create<T>(collection: string, record: T): Promise<T> {
    return request<T>(`${BASE}/${collection}`, { method: 'POST', body: JSON.stringify(record) });
  },
  patch<T>(collection: string, id: string, patch: Partial<T>): Promise<T> {
    return request<T>(`${BASE}/${collection}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  },
  remove(collection: string, id: string): Promise<void> {
    return request<void>(`${BASE}/${collection}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};
