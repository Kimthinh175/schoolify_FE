export interface LessonItem {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  views?: number;
  hasTheory: boolean;
  hasQuiz: boolean;
  hasEssay: boolean;
  hasExam: boolean;
}

export interface ChapterItem {
  id: string;
  chapterNumber: number;
  title: string;
  lessons: LessonItem[];
}

export interface SubjectCurriculum {
  subjectSlug: string;
  subjectName: string;
  levelSlug: string;
  levelName: string;
  teacher: {
    name: string;
    title: string;
    avatar: string;
    rating: number;
    studentsCount: number;
  };
  chapters: ChapterItem[];
}

export const MOCK_CURRICULUM_DATA: Record<string, SubjectCurriculum> = {
  'toan-hoc-lop-11': {
    subjectSlug: 'toan-hoc',
    subjectName: 'Toán Học',
    levelSlug: 'lop-11',
    levelName: 'Lớp 11',
    teacher: {
      name: 'Thầy Nguyễn Quốc Tuấn',
      title: 'Thạc sĩ Toán Học - THPT Chuyên Chuyên Công Nghệ',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      rating: 4.9,
      studentsCount: 15420,
    },
    chapters: [
      {
        id: 'ch-01',
        chapterNumber: 1,
        title: 'Chương 1: Hàm Số Lượng Giác & Phương Trình Lượng Giác',
        lessons: [
          {
            id: 'lesson-01',
            title: 'Bài 1: Giá trị lượng giác của góc lượng giác & Công thức cốt lõi',
            duration: '25 phút',
            views: 12450,
            hasTheory: true,
            hasQuiz: true,
            hasEssay: true,
            hasExam: true,
          },
          {
            id: 'lesson-02',
            title: 'Bài 2: Các phép biến đổi lượng giác (Công thức cộng, nhân đôi, biến đổi tích thành tổng)',
            duration: '32 phút',
            views: 9820,
            hasTheory: true,
            hasQuiz: true,
            hasEssay: true,
            hasExam: false,
          },
          {
            id: 'lesson-03',
            title: 'Bài 3: Hàm số lượng giác (Tập xác định, tính tuần hoàn, đồ thị y = sin x, cos x)',
            duration: '28 phút',
            views: 8540,
            hasTheory: true,
            hasQuiz: true,
            hasEssay: true,
            hasExam: false,
          },
          {
            id: 'lesson-04',
            title: 'Bài 4: Phương trình lượng giác cơ bản & phương trình bậc hai đối với một hàm số lượng giác',
            duration: '35 phút',
            views: 11200,
            hasTheory: true,
            hasQuiz: true,
            hasEssay: true,
            hasExam: true,
          },
          {
            id: 'lesson-05',
            title: 'Bài 5: Ôn tập Chương 1 & Đề thi thử tổng hợp',
            duration: '45 phút',
            views: 14500,
            hasTheory: true,
            hasQuiz: true,
            hasEssay: true,
            hasExam: true,
          },
        ],
      },
      {
        id: 'ch-02',
        chapterNumber: 2,
        title: 'Chương 2: Dãy Số - Cấp Số Cộng & Cấp Số Nhân',
        lessons: [
          {
            id: 'lesson-06',
            title: 'Bài 1: Dãy số (Dãy số tăng, dãy số giảm, dãy số bị chặn)',
            duration: '22 phút',
            views: 7400,
            hasTheory: true,
            hasQuiz: true,
            hasEssay: false,
            hasExam: false,
          },
          {
            id: 'lesson-07',
            title: 'Bài 2: Cấp số cộng (Công thức số hạng tổng quát & Tổng n số hạng đầu)',
            duration: '30 phút',
            views: 9100,
            hasTheory: true,
            hasQuiz: true,
            hasEssay: true,
            hasExam: true,
          },
          {
            id: 'lesson-08',
            title: 'Bài 3: Cấp số nhân (Tính chất & Ứng dụng giải bài tập thực tế)',
            duration: '27 phút',
            views: 8300,
            hasTheory: true,
            hasQuiz: true,
            hasEssay: true,
            hasExam: true,
          },
        ],
      },
      {
        id: 'ch-03',
        chapterNumber: 3,
        title: 'Chương 3: Giới Hạn & Hàm Số Liên Tục',
        lessons: [
          {
            id: 'lesson-09',
            title: 'Bài 1: Giới hạn của dãy số & Các dạng vô định (∞ - ∞, 0/0)',
            duration: '34 phút',
            views: 10200,
            hasTheory: true,
            hasQuiz: true,
            hasEssay: true,
            hasExam: true,
          },
          {
            id: 'lesson-10',
            title: 'Bài 2: Giới hạn của hàm số tại một điểm và tại vô cực',
            duration: '38 phút',
            views: 9500,
            hasTheory: true,
            hasQuiz: true,
            hasEssay: true,
            hasExam: true,
          },
          {
            id: 'lesson-11',
            title: 'Bài 3: Hàm số liên tục trên một khoảng & Chứng minh phương trình có nghiệm',
            duration: '26 phút',
            views: 6800,
            hasTheory: true,
            hasQuiz: true,
            hasEssay: true,
            hasExam: false,
          },
        ],
      },
    ],
  },
  'vat-ly-lop-11': {
    subjectSlug: 'vat-ly',
    subjectName: 'Vật Lý',
    levelSlug: 'lop-11',
    levelName: 'Lớp 11',
    teacher: {
      name: 'Cô Lê Khánh Hà',
      title: 'Chuyên Gia Vật Lý - Viện Khoa Học Giáo Dục',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      rating: 4.8,
      studentsCount: 11200,
    },
    chapters: [
      {
        id: 'ch-vl-01',
        chapterNumber: 1,
        title: 'Chương 1: Dao Động Điều Hòa & Đồ Thị Dao Động',
        lessons: [
          {
            id: 'lesson-vl-01',
            title: 'Bài 1: Phương trình dao động điều hòa x = A.cos(ωt + φ)',
            duration: '26 phút',
            views: 8900,
            hasTheory: true,
            hasQuiz: true,
            hasEssay: true,
            hasExam: true,
          },
          {
            id: 'lesson-vl-02',
            title: 'Bài 2: Vận tốc, gia tốc và năng lượng trong dao động điều hòa',
            duration: '30 phút',
            views: 7800,
            hasTheory: true,
            hasQuiz: true,
            hasEssay: true,
            hasExam: true,
          },
        ],
      },
      {
        id: 'ch-vl-02',
        chapterNumber: 2,
        title: 'Chương 2: Sóng Cơ & Sự Truyền Sóng Cơ',
        lessons: [
          {
            id: 'lesson-vl-03',
            title: 'Bài 1: Các đặc trưng của sóng cơ (Bước sóng, Tần số, Tốc độ truyền sóng)',
            duration: '24 phút',
            views: 6500,
            hasTheory: true,
            hasQuiz: true,
            hasEssay: true,
            hasExam: false,
          },
        ],
      },
    ],
  },
  'hoa-hoc-lop-11': {
    subjectSlug: 'hoa-hoc',
    subjectName: 'Hóa Học',
    levelSlug: 'lop-11',
    levelName: 'Lớp 11',
    teacher: {
      name: 'Thầy Phạm Văn Đức',
      title: 'Giảng Viên Hóa Học Thực Nghiệm',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      rating: 4.9,
      studentsCount: 9400,
    },
    chapters: [
      {
        id: 'ch-hh-01',
        chapterNumber: 1,
        title: 'Chương 1: Cân Bằng Hóa Học & Phản Ứng Thuận Nghịch',
        lessons: [
          {
            id: 'lesson-hh-01',
            title: 'Bài 1: Khái niệm cân bằng hóa học & Hằng số cân bằng Kc',
            duration: '28 phút',
            views: 7100,
            hasTheory: true,
            hasQuiz: true,
            hasEssay: true,
            hasExam: true,
          },
        ],
      },
    ],
  },
  'tieng-anh-lop-11': {
    subjectSlug: 'tieng-anh',
    subjectName: 'Tiếng Anh',
    levelSlug: 'lop-11',
    levelName: 'Lớp 11',
    teacher: {
      name: 'Ms. Emily Watson',
      title: 'IELTS Master Trainer & English Academic Lead',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      rating: 4.95,
      studentsCount: 18900,
    },
    chapters: [
      {
        id: 'ch-ta-01',
        chapterNumber: 1,
        title: 'Unit 1: A Long and Healthy Life',
        lessons: [
          {
            id: 'lesson-ta-01',
            title: 'Lesson 1: Getting Started & Vocabulary (Health and Fitness)',
            duration: '25 phút',
            views: 11500,
            hasTheory: true,
            hasQuiz: true,
            hasEssay: true,
            hasExam: true,
          },
          {
            id: 'lesson-ta-02',
            title: 'Lesson 2: Language & Grammar (Past Simple vs Present Perfect)',
            duration: '31 phút',
            views: 9200,
            hasTheory: true,
            hasQuiz: true,
            hasEssay: true,
            hasExam: true,
          },
        ],
      },
    ],
  },
  'ngu-van-lop-11': {
    subjectSlug: 'ngu-van',
    subjectName: 'Ngữ Văn',
    levelSlug: 'lop-11',
    levelName: 'Lớp 11',
    teacher: {
      name: 'Cô Trần Thị Thu Hà',
      title: 'Tác Giả NXB Giáo Dục - Chuyên Gia Văn Học',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      rating: 4.85,
      studentsCount: 8600,
    },
    chapters: [
      {
        id: 'ch-nv-01',
        chapterNumber: 1,
        title: 'Chương 1: Thông Điệp Từ Quá Khứ (Văn Học Trung Đại)',
        lessons: [
          {
            id: 'lesson-nv-01',
            title: 'Bài 1: Đọc - Hiểu Văn Bản Truyện Thơ Nam Âm (Chuyện Người Con Gái Nam Xương)',
            duration: '35 phút',
            views: 6400,
            hasTheory: true,
            hasQuiz: true,
            hasEssay: true,
            hasExam: true,
          },
        ],
      },
    ],
  },
};

export function getCurriculum(subjectSlug: string, levelSlug: string): SubjectCurriculum {
  const key = `${subjectSlug}-${levelSlug}`;
  return (
    MOCK_CURRICULUM_DATA[key] ||
    MOCK_CURRICULUM_DATA['toan-hoc-lop-11']
  );
}
