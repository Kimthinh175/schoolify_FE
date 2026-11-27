export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';
export type PaymentMethod = 'BANK' | 'COD' | 'MOMO' | 'VNPAY';
export type OrderReferenceType = 'SUBSCRIPTION';

export type BillingCycle = 'MONTHLY' | 'YEARLY' | 'LIFETIME';
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'UPGRADED';

export interface SubscriptionPackage {
  id: string;
  creator_id?: string | null;
  name: string;
  description?: string | null;
  price: number;
  billing_cycle: BillingCycle;
  duration_days?: number | null;
  max_students_total: number;
  storage_limit_gb: number;
  is_active: boolean;
  features?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  code: string;
  buyer_id: string;
  seller_id?: string | null;
  reference_type: OrderReferenceType;
  reference_id: string;
  item_name_snapshot: string;
  item_price_snapshot: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  qr_code_url?: string;
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  created_at: string;
  paid_at?: string | null;
}
