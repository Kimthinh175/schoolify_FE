'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppNotification {
  id: string | number;
  title: string;
  date: string;
  content: string;
  type: string;
  isRead: boolean;
}

interface NotificationStore {
  notifications: AppNotification[];
  addNotification: (notification: AppNotification) => void;
  markAsRead: (id: string | number) => void;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    title: 'Thông báo nghỉ học ngày Giỗ tổ Hùng Vương',
    date: '10/04/2026',
    content: 'Kính gửi Quý phụ huynh, nhà trường xin thông báo lịch nghỉ Giỗ tổ Hùng Vương (10/3 âm lịch) vào thứ Sáu ngày 10/04/2026. Học sinh sẽ đi học lại bình thường vào thứ Hai tuần sau.',
    type: 'holiday',
    isRead: true
  },
  {
    id: 2,
    title: 'Nhắc nhở: Hạn chót đóng học phí học kỳ I',
    date: '05/04/2026',
    content: 'Quý phụ huynh vui lòng hoàn thành việc đóng học phí học kỳ I trước ngày 15/04/2026. Nếu có bất kỳ thắc mắc nào, xin vui lòng liên hệ phòng tài vụ.',
    type: 'fee',
    isRead: true
  },
  {
    id: 3,
    title: 'Kết quả thi giữa kỳ môn Toán',
    date: '01/04/2026',
    content: 'Kết quả bài thi giữa kỳ môn Toán đã được cập nhật. Phụ huynh có thể vào mục Sổ Liên Lạc Điện Tử để xem chi tiết điểm số và nhận xét của giáo viên.',
    type: 'academic',
    isRead: true
  },
  {
    id: 4,
    title: 'Mời họp phụ huynh đầu năm học',
    date: '25/03/2026',
    content: 'Nhà trường trân trọng kính mời Quý phụ huynh tham dự buổi họp phụ huynh đầu năm học 2026-2027 vào lúc 08:00 sáng Chủ Nhật, ngày 30/03/2026.',
    type: 'meeting',
    isRead: true
  },
];

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: INITIAL_NOTIFICATIONS,
      addNotification: (notification) => set((state) => ({ 
        notifications: [notification, ...state.notifications] 
      })),
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => 
          n.id === id ? { ...n, isRead: true } : n
        )
      })),
    }),
    {
      name: 'schoolify-notifications',
    }
  )
);
