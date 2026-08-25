import { Order, StoreItem, StudentInventory } from '@/types';
import { MOCK_ORDERS, MOCK_STORE_ITEMS } from './mock/data';

export const orderService = {
  async getOrders(): Promise<Order[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_ORDERS;
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_ORDERS.find((o) => o.id === id);
  },
};

export const storeService = {
  async getStoreItems(): Promise<StoreItem[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_STORE_ITEMS;
  },

  async getInventory(studentId?: string): Promise<StudentInventory[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [
      {
        id: 'inv-01',
        student_id: studentId || 'child-01',
        item_id: 'item-01',
        item: MOCK_STORE_ITEMS[0],
        code: 'IELTS50-DISCOUNT-9921',
        is_used: false,
        acquired_at: '2026-08-20T10:00:00Z',
      },
      {
        id: 'inv-02',
        student_id: studentId || 'child-01',
        item_id: 'item-02',
        item: MOCK_STORE_ITEMS[1],
        is_used: true,
        acquired_at: '2026-08-15T15:00:00Z',
        used_at: '2026-08-15T15:05:00Z',
      },
    ];
  },
};
