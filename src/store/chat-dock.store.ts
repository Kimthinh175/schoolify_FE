'use client';

import { create } from 'zustand';

/**
 * Trạng thái "đậu" của Chatbox AI so với icon trên Header:
 * - docked   : bot đang nằm gọn trong icon trên Header (mặc định)
 * - dropping : bot đang nhảy từ Header xuống góc màn hình
 * - out      : bot đang đứng ở góc màn hình (hoặc đang mở khung chat)
 * - lifting  : bot đang nhảy ngược lên Header (sau 5 phút không dùng)
 */
export type ChatDockState = 'docked' | 'dropping' | 'out' | 'lifting';

interface ChatDockStore {
  dock: ChatDockState;
  /** Số icon Header đang được mount (desktop + mobile). > 0 thì mới bật cơ chế thu gọn. */
  headerIconCount: number;
  /** Tăng mỗi lần icon Header yêu cầu mở khung chat khi bot đã ở ngoài. */
  openNonce: number;
  setDock: (dock: ChatDockState) => void;
  registerHeaderIcon: () => () => void;
  summon: () => void;
  requestOpenChat: () => void;
}

export const useChatDockStore = create<ChatDockStore>((set, get) => ({
  dock: 'docked',
  headerIconCount: 0,
  openNonce: 0,

  setDock: (dock) => set({ dock }),

  registerHeaderIcon: () => {
    set((state) => ({ headerIconCount: state.headerIconCount + 1 }));
    return () =>
      set((state) => ({ headerIconCount: Math.max(0, state.headerIconCount - 1) }));
  },

  summon: () => {
    if (get().dock === 'docked') {
      set({ dock: 'dropping' });
    }
  },

  requestOpenChat: () => set((state) => ({ openNonce: state.openNonce + 1 })),
}));
