'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { SchoolifyRobot } from '@/components/features/agent/SchoolifyRobot';
import { useChatDockStore } from '@/store/chat-dock.store';
import { cn } from '@/lib/utils';

/**
 * Icon Chatbox AI nằm trên Header.
 * - Bình thường: bot "ngủ" gọn trong icon này.
 * - Bấm vào: bot nhảy xuống góc màn hình (AgenticChatWidget lo phần animation).
 * - Khi bot đang ở ngoài: icon mờ đi (tổ trống); bấm vào sẽ mở khung chat.
 */
export function ChatHeaderButton({ className }: { className?: string }) {
  const dock = useChatDockStore((s) => s.dock);
  const registerHeaderIcon = useChatDockStore((s) => s.registerHeaderIcon);

  React.useEffect(() => registerHeaderIcon(), [registerHeaderIcon]);

  const isBotAway = dock !== 'docked';

  const handleClick = () => {
    const { dock: current, summon, requestOpenChat } = useChatDockStore.getState();
    if (current === 'docked') {
      summon();
    } else if (current === 'out') {
      requestOpenChat();
    }
  };

  const title = isBotAway
    ? 'Mở khung chat Schoolify AI'
    : 'Gọi trợ lý Schoolify AI (giải bài & tạo đề)';

  return (
    <button
      type="button"
      data-chat-header-icon
      onClick={handleClick}
      title={title}
      aria-label={title}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors cursor-pointer select-none shrink-0',
        'bg-white hover:bg-slate-50 border-slate-200',
        'dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-700',
        'active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD]',
        isBotAway
          ? 'border-[#00B8DD]/60 ring-2 ring-[#00B8DD]/15'
          : 'hover:border-[#00B8DD]/60',
        className
      )}
    >
      <motion.span
        initial={false}
        animate={
          isBotAway
            ? { opacity: 0.35, scale: 0.9 }
            : { opacity: 1, scale: [0.85, 1.22, 1] }
        }
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="flex items-center justify-center"
      >
        <SchoolifyRobot size="sm" emotion="default" isFloating={false} />
      </motion.span>

      {!isBotAway && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="relative inline-flex h-full w-full rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-950" />
        </span>
      )}
    </button>
  );
}
