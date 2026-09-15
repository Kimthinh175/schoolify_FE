export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';
export type PaymentMethod = 'BANK' | 'COD' | 'MOMO' | 'VNPAY';
export type OrderReferenceType = 'SUBSCRIPTION' | 'COURSE' | 'TUITION';
export type TransactionType = 'PAYMENT_TO_ADMIN' | 'COMMISSION_FEE' | 'TEACHER_INCOME' | 'TUITION_FEE';

export interface Order {
  id: string;
  code: string;
  buyer_id: string;
  seller_id?: string | null;
  reference_type: OrderReferenceType;
  reference_id: string;
  item_title: string;
  total_amount: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  qr_code_url?: string;
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  created_at: string;
  paid_at?: string | null;
}

export interface Transaction {
  id: string;
  order_id: string;
  /** Giáo viên thụ hưởng giao dịch (ERD: TEACHER_INCOME / COMMISSION_FEE thuộc về 1 TeacherProfile) */
  teacher_id?: string | null;
  amount: number;
  type: TransactionType;
  description: string;
  created_at: string;
}
