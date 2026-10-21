import { SubscriptionPackage } from '@/types';

export interface OrderItem {
  id: string;
  code: string;
  user_id: string;
  buyer_name: string;
  buyer_email?: string;
  reference_type: 'SUBSCRIPTION' | 'COURSE';
  subscription_id?: string;
  item_name_snapshot: string;
  item_price_snapshot: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  payment_method: 'BANK' | 'COD';
  created_at: string;
}

export interface CreateOrderResult {
  order: OrderItem;
  vietQrPayload: {
    bankId: string;
    accountNo: string;
    accountName: string;
    amount: number;
    transferContent: string;
  };
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  userId: string;
  fullname: string;
  email: string;
  avatarUrl?: string | null;
  schoolName?: string;
  gradeLevel: string;
  grade?: number;
  points: number;
  examPoints?: number;
  totalExams: number;
  avgScore: number;
  streakDays: number;
}

export interface MonthlyRevenueStat {
  month: string;
  monthLabel: string;
  monthNumber: number;
  practiceRevenue: number;
  courseRevenue: number;
  totalRevenue: number;
  ordersCount: number;
  submissionsCount: number;
  growthPct: number;
}

export interface SystemStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalQuestions: number;
  totalQuestionBanks?: number;
  totalCourses?: number;
  totalLessons?: number;
  totalSubmissions: number;
  totalPackages: number;
  totalOrders: number;
  paidOrdersCount?: number;
  pendingOrdersCount?: number;
  totalRevenue: number;
  practiceRevenue: number;
  courseRevenue: number;
  monthlyRevenueStats?: MonthlyRevenueStat[];
  recentOrders: OrderItem[];
  aiMetrics: {
    semanticCacheEntries: number;
    semanticCheckpointsGraded: number;
  };
  bloomDistribution: Record<string, number>;
  subjectDistribution?: Record<string, number>;
  formatDistribution?: Record<string, number>;
  levelDistribution?: {
    primary: number;
    middle: number;
    high: number;
  };
  submissionMetrics?: {
    avgScore: number;
    passRate: number;
    under5: number;
    from5to6_9: number;
    from7to8_4: number;
    from8_5to10: number;
  };
  recentSubmissions: any[];
  recentUsers?: {
    id: string;
    fullname: string;
    email: string;
    role: string;
    status: boolean;
    gradeLevel?: string | null;
    examPoints?: number | null;
    created_at: string;
  }[];
  topStudents?: LeaderboardEntry[];
  recentPointLogs?: any[];
}

export const catalogService = {
  /** Lấy danh sách gói cước từ PostgreSQL (`GET /api/v1/catalog/packages`) */
  async getPackages(): Promise<SubscriptionPackage[]> {
    try {
      const res = await fetch('/api/v1/catalog/packages', {
        method: 'GET',
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json?.data) ? json.data : [];
    } catch (err) {
      console.warn('[catalogService.getPackages] Failed:', err);
      return [];
    }
  },

  /** Tạo gói đăng ký mới trên PostgreSQL (`POST /api/v1/catalog/packages`) */
  async createPackage(payload: Partial<SubscriptionPackage>): Promise<SubscriptionPackage | null> {
    try {
      const res = await fetch('/api/v1/catalog/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    } catch (err) {
      console.warn('[catalogService.createPackage] Failed:', err);
      return null;
    }
  },

  /** Cập nhật gói đăng ký trên PostgreSQL (`PATCH /api/v1/catalog/packages/:id`) */
  async updatePackage(
    id: string,
    payload: Partial<SubscriptionPackage>
  ): Promise<SubscriptionPackage | null> {
    try {
      const res = await fetch(`/api/v1/catalog/packages/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    } catch (err) {
      console.warn('[catalogService.updatePackage] Failed:', err);
      return null;
    }
  },

  /** Xóa gói đăng ký trên PostgreSQL (`DELETE /api/v1/catalog/packages/:id`) */
  async deletePackage(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/v1/catalog/packages/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.warn('[catalogService.deletePackage] Failed:', err);
      return false;
    }
  },

  /** Tạo đơn hàng mua gói & sinh mã VietQR (`POST /api/v1/catalog/orders`) */
  async createOrder(payload: {
    userId?: string;
    email?: string;
    packageId?: string;
    packageName?: string;
    amount?: number;
    billingCycle?: string;
  }): Promise<CreateOrderResult | null> {
    try {
      const res = await fetch('/api/v1/catalog/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    } catch (err) {
      console.warn('[catalogService.createOrder] Failed:', err);
      return null;
    }
  },

  /** Xác nhận thanh toán VietQR & kích hoạt gói (`PATCH /api/v1/catalog/orders/:id/pay`) */
  async confirmOrderPayment(orderId: string): Promise<{
    order: OrderItem;
    bonusPointsAwarded: number;
  } | null> {
    try {
      const res = await fetch(`/api/v1/catalog/orders/${encodeURIComponent(orderId)}/pay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    } catch (err) {
      console.warn('[catalogService.confirmOrderPayment] Failed:', err);
      return null;
    }
  },

  /** Lấy danh sách đơn hàng từ PostgreSQL (`GET /api/v1/catalog/orders`) */
  async getOrders(): Promise<OrderItem[]> {
    try {
      const res = await fetch('/api/v1/catalog/orders', {
        method: 'GET',
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json?.data) ? json.data : [];
    } catch (err) {
      console.warn('[catalogService.getOrders] Failed:', err);
      return [];
    }
  },

  /** Lấy bảng xếp hạng học sinh từ PostgreSQL (`GET /api/v1/catalog/leaderboard`) */
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const res = await fetch('/api/v1/catalog/leaderboard', {
        method: 'GET',
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json?.data) ? json.data : [];
    } catch (err) {
      console.warn('[catalogService.getLeaderboard] Failed:', err);
      return [];
    }
  },

  /** Lấy thống kê toàn hệ thống từ PostgreSQL (`GET /api/v1/catalog/stats`) */
  async getSystemStats(): Promise<SystemStats | null> {
    try {
      const res = await fetch('/api/v1/catalog/stats', {
        method: 'GET',
        cache: 'no-store',
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    } catch (err) {
      console.warn('[catalogService.getSystemStats] Failed:', err);
      return null;
    }
  },

  /** Lấy danh sách vật phẩm Cửa hàng Đổi quà từ PostgreSQL (`GET /api/v1/catalog/store-items`) */
  async getStoreItems(): Promise<any[]> {
    try {
      const res = await fetch('/api/v1/catalog/store-items', {
        method: 'GET',
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json?.data) ? json.data : [];
    } catch (err) {
      console.warn('[catalogService.getStoreItems] Failed:', err);
      return [];
    }
  },

  /** Đổi quà bằng Điểm Năng Lượng (`POST /api/v1/catalog/store-items/:id/redeem`) */
  async redeemStoreItem(itemId: string, userId?: string): Promise<any> {
    const res = await fetch(`/api/v1/catalog/store-items/${encodeURIComponent(itemId)}/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const json = await res.json();
    return { ok: res.ok, status: res.status, ...json };
  },

  /** Lấy danh sách quà trong Túi đồ học sinh từ PostgreSQL (`GET /api/v1/catalog/inventory`) */
  async getInventory(userId?: string): Promise<any[]> {
    try {
      const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
      const res = await fetch(`/api/v1/catalog/inventory${q}`, {
        method: 'GET',
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json?.data) ? json.data : [];
    } catch (err) {
      console.warn('[catalogService.getInventory] Failed:', err);
      return [];
    }
  },
};
