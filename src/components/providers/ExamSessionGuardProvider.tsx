'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { examOfflineStorage, ActiveExamSession } from '@/services/exam-offline-storage.service';
import { toast } from 'sonner';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';

interface ExamSessionGuardContextType {
  activeSession: ActiveExamSession | null;
  isOnline: boolean;
  refreshSession: () => Promise<ActiveExamSession | null>;
}

export const ExamSessionGuardContext = React.createContext<ExamSessionGuardContextType>({
  activeSession: null,
  isOnline: true,
  refreshSession: async () => null,
});

export function ExamSessionGuardProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [activeSession, setActiveSession] = React.useState<ActiveExamSession | null>(null);
  const [isOnline, setIsOnline] = React.useState<boolean>(true);

  // Khởi tạo trạng thái online/offline
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
    }
  }, []);

  // Hàm tải lại phiên thi từ IndexedDB
  const refreshSession = React.useCallback(async () => {
    try {
      const session = await examOfflineStorage.getActiveExamSession();
      setActiveSession(session);
      return session;
    } catch {
      setActiveSession(null);
      return null;
    }
  }, []);

  // Lắng nghe sự kiện Online / Offline & Auto-sync bài thi
  React.useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      toast.success('Đã khôi phục kết nối Internet!', {
        description: 'Đang tự động đồng bộ bài thi offline lên máy chủ...',
      });

      try {
        const { syncedCount } = await examOfflineStorage.syncPendingSubmissions();
        if (syncedCount > 0) {
          toast.success(`Đồng bộ thành công!`, {
            description: `Đã tự động gửi ${syncedCount} bài thi đã lưu về hệ thống an toàn.`,
          });
        }
      } catch (err) {
        console.error('[ExamSessionGuard] Auto-sync failed on network restore:', err);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Mất kết nối Internet!', {
        description: 'Bạn cứ yên tâm tiếp tục làm bài, dữ liệu đang được lưu an toàn liên tục.',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Kiểm tra sync ngay khi khởi chạy nếu có bài tồn đọng
    if (typeof window !== 'undefined' && navigator.onLine) {
      examOfflineStorage.syncPendingSubmissions().then(({ syncedCount }) => {
        if (syncedCount > 0) {
          toast.success(`Đã tự động đồng bộ ${syncedCount} bài thi lưu từ phiên trước lên máy chủ.`);
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ── KIỂM TRA KHÓA PHÒNG THI (LOCKDOWN ROUTE GUARD) ──
  // Bắt buộc học sinh đang thi phải quay lại phòng thi, chuyển trang nào cũng bị redirect lại
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Kiểm tra nhanh qua LocalStorage Lock
    const fastLock = examOfflineStorage.getFastSyncActiveLock();
    const currentFullUrl = window.location.pathname + window.location.search;

    const checkAndEnforceLock = (sessionUrl: string, examTitle?: string) => {
      // Chuẩn hóa đường dẫn để so sánh
      const currentPath = window.location.pathname;
      const targetPath = sessionUrl.split('?')[0];

      // Nếu đang ở phòng thi hiện tại (hoặc trang con hợp lệ của phòng thi), cho phép tiếp tục
      if (currentPath === targetPath) {
        return;
      }

      // Nếu cố tình chuyển sang trang khác (như trang chủ /, /student/dashboard, /profile, v.v.):
      // Chặn ngay lập tức và đưa trở lại phòng thi đang làm dở
      toast.warning('Bài thi chưa hoàn thành!', {
        id: 'exam-lockdown-warning',
        description: `Bạn đang trong bài thi "${examTitle || 'Đang diễn ra'}". Hệ thống tự động chuyển bạn về phòng thi để tiếp tục làm bài.`,
        duration: 4000,
      });

      router.replace(sessionUrl);
    };

    if (fastLock && fastLock.isActive && fastLock.roomUrl) {
      checkAndEnforceLock(fastLock.roomUrl, fastLock.examTitle);
    }

    // 2. Kiểm tra sâu và chính xác qua IndexedDB
    examOfflineStorage.getActiveExamSession().then((session) => {
      setActiveSession(session);
      if (session && session.status === 'IN_PROGRESS') {
        checkAndEnforceLock(session.roomUrl, session.examTitle);
      }
    });
  }, [pathname, router]);

  // ── BẢO VỆ CHỐNG TẮT TAB HOẶC TẢI LẠI TRANG KHI ĐANG THI (BEFOREUNLOAD) ──
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const lock = examOfflineStorage.getFastSyncActiveLock();
      if (lock && lock.isActive) {
        e.preventDefault();
        e.returnValue = 'Bài thi của bạn đang diễn ra và thời gian vẫn đang được tính. Bạn có chắc chắn muốn rời đi?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <ExamSessionGuardContext.Provider value={{ activeSession, isOnline, refreshSession }}>
      {/* Banner thông báo trạng thái Offline nhẹ nhàng nếu mất mạng */}
      {!isOnline && (
        <div className="bg-amber-500/90 text-slate-950 px-3 py-1.5 text-xs font-bold flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md">
          <WifiOff className="w-3.5 h-3.5 shrink-0 animate-pulse" />
          <span>Mất kết nối mạng. Dữ liệu bài làm đang được lưu an toàn liên tục.</span>
        </div>
      )}
      {children}
    </ExamSessionGuardContext.Provider>
  );
}

export function useExamSessionGuard() {
  return React.useContext(ExamSessionGuardContext);
}
