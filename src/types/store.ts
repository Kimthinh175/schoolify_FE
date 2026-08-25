export type StoreItemType = 'VOUCHER' | 'BADGE' | 'THEME' | 'OTHER';
export type ItemStatus = 'ACTIVE' | 'SOLDOUT';

export interface StoreItem {
  id: string;
  creator_id?: string | null;
  name: string;
  description: string;
  points_required: number;
  type: StoreItemType;
  image_url?: string;
  quantity_available: number;
  status: ItemStatus;
  discount_value_pct?: number;
  created_at: string;
}

export interface StudentInventory {
  id: string;
  student_id: string;
  item_id: string;
  item: StoreItem;
  code?: string;
  is_used: boolean;
  acquired_at: string;
  used_at?: string | null;
}
