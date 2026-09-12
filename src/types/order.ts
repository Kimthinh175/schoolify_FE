export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';
export type PaymentMethod = 'BANK' | 'COD' | 'MOMO' | 'VNPAY';
export type OrderReferenceType = 'SUBSCRIPTION' | 'COURSE' | 'TUITION';
export type TransactionType = 'PAYMENT_TO_ADMIN' | 'COMMISSION_FEE' | 'TEACHER_INCOME' | 'TUITION_FEE';

export interface Transaction {
  id: string;
  order_id: string;
  transaction_type?: TransactionType;
  type?: TransactionType; // Alias for backward compatibility
  amount: number;
  recipient_id?: string;
  description?: string;
  payment_method?: PaymentMethod;
  reference_code?: string;
  created_at: string;
}

export interface Order {
  id: string;
  code: string;
  user_id?: string;
  buyer_id?: string; // Alias for backward compatibility
  seller_id?: number | string | null;
  
  reference_type: OrderReferenceType;
  reference_id?: string;
  subscription_id?: number | string | null;
  course_id?: number | string | null;
  
  // ERD Snapshots & Legacy Attributes
  item_name_snapshot?: string | { name?: string; title?: string; [key: string]: any };
  item_price_snapshot?: number;
  item_title: string; // Legacy / Display title
  total_amount: number; // Legacy total amount
  
  payment_method: PaymentMethod;
  status: OrderStatus;
  qr_code_url?: string;
  
  // Buyer / Student Info
  buyer_name?: string;
  student_name?: string;
  student_code?: string;
  student_class?: string;
  buyer_email?: string;
  buyer_phone?: string;
  
  // Relations (ERD)
  user?: {
    id: string;
    fullname: string;
    email: string;
    phone?: string;
    role?: string;
    avatar_url?: string;
    code?: string;
    class_name?: string;
  };
  transactions?: Transaction[];
  
  created_at: string;
  paid_at?: string | null;
}



