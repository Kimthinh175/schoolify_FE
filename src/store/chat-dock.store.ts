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

export interface ChatDockAnchor {
  x: number;
  y: number;
}

interface ChatDockStore {
  dock: ChatDockState;
  /** Số icon Header đang được mount (desktop + mobile). > 0 thì mới bật cơ chế thu gọn. */
  headerIconCount: number;
  /** Tăng mỗi lần icon Header yêu cầu mở khung chat khi bot đã ở ngoài. */
  openNonce: number;
  /** Tọa độ tâm của icon trên Header (lưu lại trước khi icon ẩn đi để bot biết chỗ nhảy xuống/nhảy lên). */
  anchor: ChatDockAnchor | null;
  /** Đang kéo con bot lại gần vùng Header -> hiện vòng đích hút trên Header. */
  isDraggingOverHeader: boolean;
  /** Nhảy lên nhanh khi người dùng tự kéo bot lên Header (thay vì chờ 5 phút). */
  liftFast: boolean;
  setDock: (dock: ChatDockState) => void;
  setAnchor: (anchor: ChatDockAnchor | null) => void;
  setDraggingOverHeader: (over: boolean) => void;
  registerHeaderIcon: () => () => void;
  summon: (anchor?: ChatDockAnchor | null) => void;
  dockBack: (fast?: boolean, anchor?: ChatDockAnchor | null) => void;
  requestOpenChat: () => void;
}

export const useChatDockStore = create<ChatDockStore>((set, get) => ({
  dock: 'docked',
  headerIconCount: 0,
  openNonce: 0,
  anchor: null,
  isDraggingOverHeader: false,
  liftFast: false,

  setDock: (dock) =>
    set((state) => ({
      dock,
      isDraggingOverHeader: dock === 'out' ? state.isDraggingOverHeader : false,
      liftFast: dock === 'lifting' ? state.liftFast : false,
    })),

  setAnchor: (anchor) => set({ anchor }),

  setDraggingOverHeader: (isDraggingOverHeader) => set({ isDraggingOverHeader }),

  registerHeaderIcon: () => {
    set((state) => ({ headerIconCount: state.headerIconCount + 1 }));
    return () =>
      set((state) => ({ headerIconCount: Math.max(0, state.headerIconCount - 1) }));
  },

  summon: (anchor) => {
    if (get().dock === 'docked') {
      set((state) => ({
        dock: 'dropping',
        anchor: anchor ?? state.anchor,
        isDraggingOverHeader: false,
        liftFast: false,
      }));
    }
  },

  dockBack: (fast = false, anchor) => {
    if (get().dock === 'out') {
      set((state) => ({
        dock: 'lifting',
        liftFast: fast,
        isDraggingOverHeader: false,
        anchor: anchor ?? state.anchor,
      }));
    }
  },

  requestOpenChat: () => set((state) => ({ openNonce: state.openNonce + 1 })),
}));
