'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { catalogService } from '@/services/catalog.service';

export function WebVisitTracker() {
  const pathname = usePathname();
  const { user, currentRole, isAuthenticated } = useAuthStore();
  const lastTrackedPathRef = React.useRef<string>('');

  React.useEffect(() => {
    if (!pathname) return;

    // Chỉ tính lượt truy cập ở trang Client của học sinh/khách, tuyệt đối không tính trang Admin hoặc tài khoản Admin
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/login/admin') ||
      pathname.startsWith('/403')
    ) {
      return;
    }

    const activeRole = String(
      currentRole || user?.role || (user as any)?.appRole || 'GUEST',
    ).toUpperCase();
    if (activeRole === 'SUPER_ADMIN' || activeRole === 'ADMIN') {
      return;
    }

    if (lastTrackedPathRef.current === pathname) return;
    lastTrackedPathRef.current = pathname;

    try {
      let sessionId = sessionStorage.getItem('schoolify_visit_session_id');
      if (!sessionId) {
        sessionId = `ses-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        sessionStorage.setItem('schoolify_visit_session_id', sessionId);
      }

      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const isIpadDesktopMode =
        typeof navigator !== 'undefined' &&
        navigator.platform === 'MacIntel' &&
        navigator.maxTouchPoints > 1;

      let deviceType = 'DESKTOP';
      if (isIpadDesktopMode || /tablet|ipad|playbook|silk/i.test(ua)) {
        deviceType = 'TABLET';
      } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) {
        deviceType = 'MOBILE';
      }

      const screenResolution =
        typeof window !== 'undefined' && window.screen?.width && window.screen?.height
          ? `${window.screen.width}x${window.screen.height}`
          : undefined;
      const timezone =
        typeof Intl !== 'undefined'
          ? Intl.DateTimeFormat().resolvedOptions().timeZone || undefined
          : undefined;
      const language = typeof navigator !== 'undefined' ? navigator.language || undefined : undefined;
      const platform =
        typeof navigator !== 'undefined'
          ? (navigator as any).userAgentData?.platform || navigator.platform || undefined
          : undefined;

      catalogService.recordWebVisit({
        path: pathname,
        pageTitle: typeof document !== 'undefined' ? document.title : pathname,
        userId: isAuthenticated && user?.id ? user.id : null,
        userRole: isAuthenticated ? activeRole : 'GUEST',
        sessionId,
        deviceType,
        screenResolution,
        timezone,
        language,
        platform,
        referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
        userAgent: ua,
      });
    } catch {
      // Bỏ qua lỗi mạng khi ghi log analytics nền
    }
  }, [pathname, user, currentRole, isAuthenticated]);

  return null;
}
