'use client';

import * as React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { isAuthPopup, isWindowLarge, initAuthPopupSession } from '@/lib/auth-popup';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [isPopup, setIsPopup] = React.useState(false);
  const [isLarge, setIsLarge] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    initAuthPopupSession();
    setIsMounted(true);

    const checkDimensions = () => {
      const popup = isAuthPopup();
      const large = isWindowLarge();
      setIsPopup(popup);
      setIsLarge(large);

      if (popup && !large) {
        document.documentElement.classList.add('compact-subtab');
      } else {
        document.documentElement.classList.remove('compact-subtab');
      }
    };

    checkDimensions();
    window.addEventListener('resize', checkDimensions);
    return () => {
      window.removeEventListener('resize', checkDimensions);
      document.documentElement.classList.remove('compact-subtab');
    };
  }, []);

  // Ở trạng thái subtab thu nhỏ: chỉ hiện duy nhất form đăng nhập, không hiện header hay footer.
  // Khi người dùng phóng to ra (maximize hoặc kéo rộng cửa sổ): tự động hiện lại header & footer.
  const isCompactSubtab = isMounted && isPopup && !isLarge;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header: Chỉ hiển thị khi KHÔNG phải subtab thu nhỏ */}
      {!isCompactSubtab && <Navbar />}

      {/* Main Content:
          - Khi là subtab thu nhỏ: bỏ pt-28/pt-36 để form login nằm trọn vẹn, căn giữa màn hình không bị scroll.
          - Khi phóng to ra: giữ nguyên khoảng cách đệm chuẩn để tách biệt với Navbar cố định.
      */}
      <main
        className={
          isCompactSubtab
            ? 'flex-1 flex items-center justify-center p-4 w-full'
            : 'flex-1 pt-28 pb-20 sm:pt-36 sm:pb-28 flex items-center justify-center px-4 sm:px-6 lg:px-8'
        }
      >
        {children}
      </main>

      {/* Footer: Chỉ hiển thị khi KHÔNG phải subtab thu nhỏ */}
      {!isCompactSubtab && <Footer />}
    </div>
  );
}
