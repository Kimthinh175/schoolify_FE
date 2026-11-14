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
  cancel_reason?: string | null;
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

export interface PayOSLinkData {
  isLivePayOS: boolean;
  orderCode: number;
  amount: number;
  description: string;
  accountNumber: string;
  accountName: string;
  bin: string;
  qrCode: string;
  checkoutUrl?: string | null;
  paymentLinkId?: string | null;
  status: string;
  error?: string | null;
}

export interface CreatePayosOrderResult {
  order: OrderItem;
  payos: PayOSLinkData;
}

export interface PayosOrderStatusResult {
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  orderCode: number;
  order?: OrderItem | null;
  bonusPointsAwarded?: number;
  message?: string;
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

  /** Hủy đơn hàng & lưu lý do hủy (`PATCH /api/v1/catalog/orders/:id/cancel`) */
  async cancelOrder(
    orderId: string,
    reason?: string
  ): Promise<{ order: OrderItem } | null> {
    try {
      const res = await fetch(`/api/v1/catalog/orders/${encodeURIComponent(orderId)}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    } catch (err) {
      console.warn('[catalogService.cancelOrder] Failed:', err);
      return null;
    }
  },

  /** Tạo link thanh toán PayOS VietQR (`POST /api/v1/catalog/payos/create-payment-link`) */
  async createPayosPaymentLink(payload: {
    userId?: string;
    email?: string;
    packageId?: string;
    packageName?: string;
    amount?: number;
    billingCycle?: string;
    cancelUrl?: string;
    returnUrl?: string;
  }): Promise<CreatePayosOrderResult | null> {
    try {
      const res = await fetch('/api/v1/catalog/payos/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    } catch (err) {
      console.warn('[catalogService.createPayosPaymentLink] Failed:', err);
      return null;
    }
  },

  /** Kiểm tra trạng thái thanh toán PayOS real-time (`GET /api/v1/catalog/payos/order-status/:orderCode`) */
  async getPayosOrderStatus(orderCode: number): Promise<PayosOrderStatusResult | null> {
    try {
      const res = await fetch(`/api/v1/catalog/payos/order-status/${encodeURIComponent(orderCode)}`, {
        method: 'GET',
        cache: 'no-store',
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    } catch (err) {
      console.warn('[catalogService.getPayosOrderStatus] Failed:', err);
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

  /** Ghi nhận lượt truy cập trang web vào PostgreSQL (`POST /api/v1/catalog/analytics/visit`) */
  async recordWebVisit(payload: {
    path: string;
    pageTitle?: string;
    userId?: string | null;
    userRole?: string;
    sessionId?: string;
    deviceType?: string;
    screenResolution?: string;
    timezone?: string;
    language?: string;
    platform?: string;
    referrer?: string;
    userAgent?: string;
  }): Promise<boolean> {
    try {
      const res = await fetch('/api/v1/catalog/analytics/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /** Lấy dữ liệu Thống kê Hành vi & Toàn diện Web từ PostgreSQL (`GET /api/v1/catalog/analytics/behavior`) */
  async getBehaviorAnalytics(): Promise<BehaviorAnalyticsData | null> {
    try {
      const res = await fetch('/api/v1/catalog/analytics/behavior', {
        method: 'GET',
        cache: 'no-store',
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    } catch (err) {
      console.warn('[catalogService.getBehaviorAnalytics] Failed:', err);
      return null;
    }
  },
};

export interface BehaviorAnalyticsData {
  generatedAt: string;
  trackingSince?: string;
  webTraffic: {
    totalVisits: number;
    todayVisits: number;
    last7DaysVisits: number;
    uniqueVisitors: number;
    loggedInVisits: number;
    guestVisits: number;
    deviceBreakdown: {
      desktop: number;
      mobile: number;
      tablet: number;
      bot?: number;
    };
    byDeviceType?: Array<{
      type: string;
      label: string;
      visits: number;
      uniqueVisitors: number;
      percentage: number;
    }>;
    byOs?: Array<{
      name: string;
      visits: number;
      uniqueVisitors: number;
      percentage: number;
    }>;
    byBrowser?: Array<{
      name: string;
      visits: number;
      uniqueVisitors: number;
      percentage: number;
    }>;
    byLocation?: Array<{
      locationKey: string;
      city: string;
      region: string | null;
      country: string;
      countryCode: string;
      visits: number;
      uniqueVisitors: number;
      percentage: number;
    }>;
    byCountry?: Array<{
      country: string;
      countryCode: string;
      visits: number;
      uniqueVisitors: number;
      percentage: number;
    }>;
    recentVisits?: Array<{
      id: string;
      path: string;
      pageTitle: string;
      sessionId: string;
      userRole: string;
      userName: string | null;
      deviceType: string;
      osName: string;
      browserName: string;
      deviceModel: string;
      screenResolution: string | null;
      ipAddress: string | null;
      locationLabel: string;
      cityName: string;
      countryName: string;
      countryCode: string;
      ispName: string | null;
      timezone: string | null;
      createdAt: string;
    }>;
    topPages: Array<{
      path: string;
      pageTitle: string;
      visits: number;
      uniqueVisitors: number;
      percentage: number;
    }>;
    dailyTrend: Array<{
      date: string;
      label: string;
      visits: number;
      uniqueVisitors: number;
      examsCreated: number;
    }>;
  };
  studentExams: {
    totalCreated: number;
    completedCount: number;
    abandonedOrBlankCount: number;
    abandonedBreakdown: {
      zeroAnswersCount: number;
      under3AnswersCount: number;
    };
    completionRate: number;
    abandonRate: number;
    avgCompletedScore: number;
    completedOverview: {
      aboveOrEqual5Count: number;
      under5Count: number;
    };
    scoreDistribution: {
      under5: { label: string; range: string; count: number; percentage: number };
      from5to6_5: { label: string; range: string; count: number; percentage: number };
      from6_5to8_5: { label: string; range: string; count: number; percentage: number };
      from8_5to10: { label: string; range: string; count: number; percentage: number };
    };
    recentAttempts: Array<{
      id: string;
      attemptToken: string | null;
      studentName: string;
      studentEmail: string;
      grade: number;
      examTitle: string;
      subjectSlug: string;
      subjectName: string;
      level: string;
      answeredCount: number;
      totalQuestions: number;
      completionStatus: 'COMPLETED' | 'BLANK_0' | 'UNDER_3';
      completionLabel: string;
      score: number;
      scoreBucket: string;
      timeSpentSeconds: number;
      createdAt: string;
    }>;
  };
  questionBank: {
    totalQuestions: number;
    totalQuestionBanks: number;
    totalSubjects: number;
    bySubject: Array<{
      slug: string;
      name: string;
      color: string;
      group: string;
      count: number;
      percentage: number;
      byBloom: Record<string, number>;
      byFormat: Record<string, number>;
    }>;
    byGrade: Array<{
      grade: number;
      count: number;
    }>;
  };
  packageSales: {
    totalSold: number;
    totalRevenue: number;
    totalPendingOrders: number;
    package1: {
      code: string;
      label: string;
      shortName: string;
      unitPrice: number;
      soldCount: number;
      paidOrdersCount: number;
      pendingOrdersCount: number;
      activeSubscribersCount: number;
      revenue: number;
      buyers: string[];
    };
    package2: {
      code: string;
      label: string;
      shortName: string;
      unitPrice: number;
      soldCount: number;
      paidOrdersCount: number;
      pendingOrdersCount: number;
      activeSubscribersCount: number;
      revenue: number;
      buyers: string[];
    };
    recentSubscriptionOrders: Array<{
      id: string;
      buyerName: string;
      buyerEmail: string;
      packageCode: string;
      packageLabel: string;
      amount: number;
      status: string;
      createdAt: string;
    }>;
  };
  platformEverything: {
    users: {
      totalUsers: number;
      studentsCount: number;
      grade12Count?: number;
      grade11Count?: number;
      grade10Count?: number;
      otherGradesCount?: number;
      incompleteProfileCount?: number;
      teachersCount: number;
      parentsCount: number;
      adminsCount: number;
    };
    contentAndCourses: {
      totalCourses: number;
      totalLessons: number;
      totalQuestionBanks: number;
      totalQuestions: number;
    };
    pointsAndEconomy: {
      totalTiaSangInCirculation: number;
      totalDiamondsInCirculation: number;
      totalExamStartsLogged: number;
      totalCheckins: number;
      totalRewardsGranted: number;
      totalPenalties: number;
      storeRedemptionsCount: number;
    };
    aiAndAdaptiveLearning: {
      totalAiChatSessions: number;
      totalAiChatMessages: number;
      totalDrill3Sessions: number;
      usedAiExampleCount: number;
      topicMasteriesCount: number;
      roadmapStepsCount: number;
      spiritBreakdown: {
        highGrit: number;
        moderateInitiative: number;
        lowPatience: number;
        avoidanceSkipped: number;
      };
      recentDrillBehaviors: Array<{
        id: string;
        studentName: string;
        subject: string;
        grade: number;
        topicTag: string;
        completedTurns: number;
        totalTurns: number;
        correctTurns: number;
        usedAiExample: boolean;
        spiritTag: string;
        spiritLabel: string;
        intelligenceLabel: string;
        timeSeconds: number;
        createdAt: string;
      }>;
    };
  };
}

