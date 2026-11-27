'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { getGuestOnboarding, parseHighSchoolGrade } from '@/lib/semester-utils';
import { chapterRoadmapService } from '@/services/chapter-roadmap.service';
import { GradeOnboardingModal } from '@/components/features/student/practice/GradeOnboardingModal';

const IGNORED_PATH_PREFIXES = [
  '/admin',
  '/teacher',
  '/parent',
  '/login',
  '/register',
  '/auth',
];

export function StudentOnboardingGuard() {
  const pathname = usePathname() || '/';
  const { isAuthenticated, user, currentRole, fetchMe } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);
  const [showFirstLoginModal, setShowFirstLoginModal] = React.useState(false);
  const syncingRef = React.useRef(false);
  const checkedUserIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isIgnoredRoute = React.useMemo(
    () => IGNORED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix)),
    [pathname],
  );

  React.useEffect(() => {
    if (!mounted || !isAuthenticated || !user?.id || isIgnoredRoute) {
      setShowFirstLoginModal(false);
      return;
    }

    const isStudentRole =
      user.role !== 'SUPER_ADMIN' &&
      (currentRole as string) !== 'ADMIN' &&
      currentRole !== 'SUPER_ADMIN' &&
      currentRole !== 'TEACHER' &&
      currentRole !== 'PARENT' &&
      !(user as any).teacher_profile &&
      !(user as any).parent_profile;

    if (!isStudentRole) {
      setShowFirstLoginModal(false);
      return;
    }

    let cancelled = false;

    const runSyncAndCheck = async () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      try {
        // 1. Nếu khách vừa làm bài thử / chọn lớp xong rồi đăng nhập -> tự động đồng bộ vào PostgreSQL!
        const guest = getGuestOnboarding();
        if (guest) {
          const synced = await chapterRoadmapService.syncGuestOnboarding();
          if (synced) {
            const refreshed = await fetchMe();
            if (!cancelled && parseHighSchoolGrade(refreshed?.student_profile?.grade_level)) {
              setShowFirstLoginModal(false);
              checkedUserIdRef.current = user.id;
              return;
            }
          }
        }

        // 2. Kiểm tra thông tin khối lớp trong student_profile
        const existingGrade = parseHighSchoolGrade(
          user.student_profile?.grade_level || (user as any).gradeLevel,
        );
        if (existingGrade) {
          if (!cancelled) setShowFirstLoginModal(false);
          checkedUserIdRef.current = user.id;
          return;
        }

        // Làm mới hồ sơ từ server 1 lần để chắc chắn dữ liệu mới nhất
        if (checkedUserIdRef.current !== user.id) {
          checkedUserIdRef.current = user.id;
          const freshUser = await fetchMe();
          const freshGrade = parseHighSchoolGrade(
            freshUser?.student_profile?.grade_level || (freshUser as any)?.gradeLevel,
          );
          if (!cancelled) {
            setShowFirstLoginModal(!freshGrade);
          }
        } else if (!cancelled) {
          setShowFirstLoginModal(true);
        }
      } finally {
        syncingRef.current = false;
      }
    };

    void runSyncAndCheck();

    return () => {
      cancelled = true;
    };
  }, [mounted, isAuthenticated, user, currentRole, isIgnoredRoute, fetchMe]);

  if (!mounted || !showFirstLoginModal) return null;

  return (
    <GradeOnboardingModal
      isOpen={showFirstLoginModal}
      mode="FIRST_LOGIN"
      onCompleted={() => setShowFirstLoginModal(false)}
    />
  );
}
