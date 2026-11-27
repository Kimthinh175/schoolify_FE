'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { useExamSessionGuard } from '@/components/providers/ExamSessionGuardProvider';

function PersistentGlobalNavbarInner() {
  const pathname = usePathname() || '/';
  const searchParams = useSearchParams();
  const { examNavbarVisible } = useExamSessionGuard();
  const [isCompactSubtab, setIsCompactSubtab] = React.useState(false);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const syncCompact = () => {
      setIsCompactSubtab(document.documentElement.classList.contains('compact-subtab'));
    };
    syncCompact();
    const observer = new MutationObserver(syncCompact);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  if (isCompactSubtab) {
    return null;
  }

  const isIsolatedPortal =
    pathname.startsWith('/admin') ||
    pathname === '/403' ||
    pathname.startsWith('/student/practice/remediation') ||
    pathname.startsWith('/student/exam/');

  if (isIsolatedPortal) {
    return null;
  }

  const isExamRoom = pathname.startsWith('/student/practice/exam-room');
  const hasAttemptToken = Boolean(searchParams?.get('attemptToken'));
  if (isExamRoom && !examNavbarVisible && !hasAttemptToken) {
    return null;
  }

  const isStudentWithSidebar =
    pathname.startsWith('/student') &&
    !pathname.startsWith('/student/practice/exam-room') &&
    !pathname.startsWith('/student/practice/remediation') &&
    !pathname.startsWith('/student/exam/');

  const handleOpenMobileSidebar = isStudentWithSidebar
    ? () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('schoolify:open-student-sidebar'));
        }
      }
    : undefined;

  return <Navbar onOpenMobileSidebar={handleOpenMobileSidebar} />;
}

export function PersistentGlobalNavbar() {
  return (
    <React.Suspense fallback={<Navbar />}>
      <PersistentGlobalNavbarInner />
    </React.Suspense>
  );
}
