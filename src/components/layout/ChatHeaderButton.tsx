'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { SchoolifyRobot } from '@/components/features/agent/SchoolifyRobot';
import { useChatDockStore } from '@/store/chat-dock.store';
import { cn } from '@/lib/utils';

/**
 * Icon Chatbox AI nằm trên Header.
 * - Bình thường (dock === 'docked'): hiển thị gọn trên Header; bấm vào để gọi con bot lớn nhảy xuống.
 * - Khi bot nhảy xuống / đang ở ngoài: ẩn hoàn toàn icon trên Header.
 * - Khi người dùng kéo con bot lại gần Header: tạm hiện vòng đích phát sáng để đón bot nhảy lên lại.
 */
export function ChatHeaderButton({ className }: { className?: string }) {
  const dock = useChatDockStore((s) => s.dock);
  const isDraggingOverHeader = useChatDockStore((s) => s.isDraggingOverHeader);
  const registerHeaderIcon = useChatDockStore((s) => s.registerHeaderIcon);
  const setAnchor = useChatDockStore((s) => s.setAnchor);
  const slotRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => registerHeaderIcon(), [registerHeaderIcon]);

  const showIcon = dock === 'docked';
  const showDropTarget = (dock === 'out' && isDraggingOverHeader) || dock === 'lifting';

  // Cập nhật tọa độ tâm của vị trí trên Header khi đang hiện (để bot luôn biết điểm xuất phát & điểm đáp)
  React.useEffect(() => {
    if (!showIcon && !showDropTarget) return;
    const syncAnchor = () => {
      const el = slotRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        setAnchor({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }
    };
    const raf = window.requestAnimationFrame(syncAnchor);
    window.addEventListener('resize', syncAnchor);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', syncAnchor);
    };
  }, [showIcon, showDropTarget, setAnchor]);

  if (showDropTarget) {
    return (
      <div
        ref={(node) => {
          slotRef.current = node;
        }}
        data-chat-header-icon
        aria-hidden="true"
        className={cn(
          'relative inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-[#00B8DD] bg-[#00B8DD]/15 ring-4 ring-[#00B8DD]/25 animate-pulse shrink-0 pointer-events-none',
          className
        )}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-[#00B8DD]" />
      </div>
    );
  }

  if (!showIcon) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const anchor =
      r.width > 0 && r.height > 0
        ? { x: r.left + r.width / 2, y: r.top + r.height / 2 }
        : null;
    useChatDockStore.getState().summon(anchor);
  };

  const title = 'Gọi trợ lý Schoolify AI (giải bài & tạo đề)';

  return (
    <motion.button
      ref={(node) => {
        slotRef.current = node;
      }}
      type="button"
      data-chat-header-icon
      onClick={handleClick}
      title={title}
      aria-label={title}
      initial={{ opacity: 0, scale: 0.55 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 460, damping: 24 }}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors cursor-pointer select-none shrink-0',
        'bg-white hover:bg-slate-50 border-slate-200 hover:border-[#00B8DD]/60',
        'dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-700',
        'active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD]',
        className
      )}
    >
      <span className="flex items-center justify-center">
        <SchoolifyRobot size="sm" emotion="default" isFloating={false} />
      </span>

      <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
        <span className="relative inline-flex h-full w-full rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-950" />
      </span>
    </motion.button>
  );
}
