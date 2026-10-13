import { getChaptersForSubject } from '@/constants/curriculum';

export interface ChapterRatioItem {
  chapter: string;
  ratio: number; // percentage (0 - 100)
  selected: boolean;
}

export interface DifficultyRatio {
  recognition: number; // % Nhận biết (e.g. 40)
  understanding: number; // % Thông hiểu (e.g. 30)
  application: number; // % Vận dụng (e.g. 20)
  advanced_application: number; // % Vận dụng cao (e.g. 10)
}

export interface SubjectMatrixConfig {
  id: string;
  subject: string;
  grade_level: string;
  total_questions: number;
  duration_minutes: number;
  difficulty_ratio: DifficultyRatio;
  chapter_ratios: ChapterRatioItem[];
  updated_at: string;
}

// Hàm khởi tạo cấu hình ma trận mặc định cho một môn & khối lớp
export function createDefaultMatrixConfig(subject: string, gradeLevel: string): SubjectMatrixConfig {
  const chapters = getChaptersForSubject(subject, gradeLevel);
  const selectedCount = Math.min(chapters.length, 4);
  const evenRatio = Math.floor(100 / selectedCount);
  const rem = 100 - evenRatio * selectedCount;

  const chapter_ratios: ChapterRatioItem[] = chapters.map((ch, idx) => ({
    chapter: ch,
    ratio: idx < selectedCount ? evenRatio + (idx === 0 ? rem : 0) : 0,
    selected: idx < selectedCount,
  }));

  // Chuẩn số câu theo đặc thù môn học
  let total_questions = 40;
  let duration_minutes = 50;

  if (subject === 'Toán học') {
    total_questions = 40;
    duration_minutes = 50;
  } else if (subject === 'Tiếng Anh') {
    total_questions = 50;
    duration_minutes = 60;
  } else if (subject === 'Ngữ văn') {
    total_questions = 12;
    duration_minutes = 90;
  } else if (subject === 'Vật lí' || subject === 'Hóa học' || subject === 'Sinh học') {
    total_questions = 40;
    duration_minutes = 50;
  } else if (subject === 'Lịch sử' || subject === 'Địa lí' || subject === 'GDKT & Pháp Luật') {
    total_questions = 40;
    duration_minutes = 50;
  } else {
    total_questions = 30;
    duration_minutes = 45;
  }

  return {
    id: `${subject}_${gradeLevel}`,
    subject,
    grade_level: gradeLevel,
    total_questions,
    duration_minutes,
    difficulty_ratio: {
      recognition: 40,
      understanding: 30,
      application: 20,
      advanced_application: 10,
    },
    chapter_ratios,
    updated_at: '2026-03-20',
  };
}

// Danh sách cấu hình mẫu cho tất cả các môn trọng tâm THPT (Lớp 12 & 11)
export const INITIAL_SUBJECT_MATRICES: SubjectMatrixConfig[] = [
  {
    id: 'Toán học_12',
    subject: 'Toán học',
    grade_level: '12',
    total_questions: 40,
    duration_minutes: 50,
    difficulty_ratio: {
      recognition: 40,
      understanding: 30,
      application: 20,
      advanced_application: 10,
    },
    chapter_ratios: [
      { chapter: 'Chương 1: Khảo sát hàm số & Ứng dụng đạo hàm', ratio: 35, selected: true },
      { chapter: 'Chương 2: Hàm số Mũ và Logarit', ratio: 25, selected: true },
      { chapter: 'Chương 3: Nguyên hàm và Tích phân', ratio: 25, selected: true },
      { chapter: 'Chương 7: Phương pháp tọa độ trong không gian (Oxyz)', ratio: 15, selected: true },
      { chapter: 'Chương 4: Số phức', ratio: 0, selected: false },
      { chapter: 'Chương 5: Khối đa diện và Thể tích', ratio: 0, selected: false },
      { chapter: 'Chương 6: Mặt nón, mặt trụ, mặt cầu', ratio: 0, selected: false },
    ],
    updated_at: '2026-03-25',
  },
  {
    id: 'Vật lí_12',
    subject: 'Vật lí',
    grade_level: '12',
    total_questions: 40,
    duration_minutes: 50,
    difficulty_ratio: {
      recognition: 35,
      understanding: 35,
      application: 20,
      advanced_application: 10,
    },
    chapter_ratios: [
      { chapter: 'Chương 1: Vật lí nhiệt & Nhiệt động lực học', ratio: 40, selected: true },
      { chapter: 'Chương 2: Khí lý tưởng & Thuyết động học chất khí', ratio: 30, selected: true },
      { chapter: 'Chương 3: Từ trường & Cảm ứng điện từ', ratio: 30, selected: true },
      { chapter: 'Chương 4: Hạt nhân nguyên tử & Năng lượng hạt nhân', ratio: 0, selected: false },
    ],
    updated_at: '2026-03-24',
  },
  {
    id: 'Hóa học_12',
    subject: 'Hóa học',
    grade_level: '12',
    total_questions: 40,
    duration_minutes: 50,
    difficulty_ratio: {
      recognition: 35,
      understanding: 35,
      application: 20,
      advanced_application: 10,
    },
    chapter_ratios: [
      { chapter: 'Chương 1: Ester - Lipid & Chất béo', ratio: 35, selected: true },
      { chapter: 'Chương 2: Carbohydrate & Ứng dụng', ratio: 35, selected: true },
      { chapter: 'Chương 3: Hợp chất chứa Nitrogen (Amine, Amino acid)', ratio: 30, selected: true },
      { chapter: 'Chương 4: Polymer & Vật liệu polymer', ratio: 0, selected: false },
    ],
    updated_at: '2026-03-23',
  },
  {
    id: 'Sinh học_12',
    subject: 'Sinh học',
    grade_level: '12',
    total_questions: 40,
    duration_minutes: 50,
    difficulty_ratio: {
      recognition: 40,
      understanding: 30,
      application: 20,
      advanced_application: 10,
    },
    chapter_ratios: [
      { chapter: 'Chương 1: Di truyền phân tử & Cơ chế di truyền', ratio: 35, selected: true },
      { chapter: 'Chương 2: Di truyền nhiễm sắc thể & Quy luật Menđen', ratio: 35, selected: true },
      { chapter: 'Chương 3: Di truyền quần thể & Ứng dụng di truyền', ratio: 30, selected: true },
      { chapter: 'Chương 4: Tiến hóa & Sinh thái học', ratio: 0, selected: false },
    ],
    updated_at: '2026-03-22',
  },
  {
    id: 'Tiếng Anh_12',
    subject: 'Tiếng Anh',
    grade_level: '12',
    total_questions: 50,
    duration_minutes: 60,
    difficulty_ratio: {
      recognition: 40,
      understanding: 30,
      application: 20,
      advanced_application: 10,
    },
    chapter_ratios: [
      { chapter: 'Unit 1: Life Stories & High School Memories', ratio: 25, selected: true },
      { chapter: 'Unit 2: Urbanisation & Future Cities', ratio: 25, selected: true },
      { chapter: 'Unit 3: The Green Movement & Ecology', ratio: 25, selected: true },
      { chapter: 'Unit 4: The Mass Media & Technology', ratio: 25, selected: true },
    ],
    updated_at: '2026-03-21',
  },
  {
    id: 'Lịch sử_12',
    subject: 'Lịch sử',
    grade_level: '12',
    total_questions: 40,
    duration_minutes: 50,
    difficulty_ratio: {
      recognition: 40,
      understanding: 30,
      application: 20,
      advanced_application: 10,
    },
    chapter_ratios: [
      { chapter: 'Chương 1: Thế giới trong và sau Chiến tranh lạnh', ratio: 30, selected: true },
      { chapter: 'Chương 2: ASEAN: Những chặng đường lịch sử', ratio: 30, selected: true },
      { chapter: 'Chương 3: Cách mạng tháng Tám 1945 & Kháng chiến', ratio: 40, selected: true },
    ],
    updated_at: '2026-03-20',
  },
  {
    id: 'Địa lí_12',
    subject: 'Địa lí',
    grade_level: '12',
    total_questions: 40,
    duration_minutes: 50,
    difficulty_ratio: {
      recognition: 40,
      understanding: 35,
      application: 15,
      advanced_application: 10,
    },
    chapter_ratios: [
      { chapter: 'Chương 1: Địa lý tự nhiên Việt Nam', ratio: 35, selected: true },
      { chapter: 'Chương 2: Địa lý dân cư & Đô thị hóa', ratio: 35, selected: true },
      { chapter: 'Chương 3: Địa lý các ngành kinh tế trọng điểm', ratio: 30, selected: true },
    ],
    updated_at: '2026-03-19',
  },
  {
    id: 'GDKT & Pháp Luật_12',
    subject: 'GDKT & Pháp Luật',
    grade_level: '12',
    total_questions: 40,
    duration_minutes: 50,
    difficulty_ratio: {
      recognition: 45,
      understanding: 35,
      application: 15,
      advanced_application: 5,
    },
    chapter_ratios: [
      { chapter: 'Chương 1: Tăng trưởng & Phát triển kinh tế', ratio: 35, selected: true },
      { chapter: 'Chương 2: Hội nhập kinh tế quốc tế', ratio: 35, selected: true },
      { chapter: 'Chương 3: Quyền và nghĩa vụ của công dân về kinh tế', ratio: 30, selected: true },
    ],
    updated_at: '2026-03-18',
  },
  {
    id: 'Tin học_12',
    subject: 'Tin học',
    grade_level: '12',
    total_questions: 40,
    duration_minutes: 45,
    difficulty_ratio: {
      recognition: 35,
      understanding: 35,
      application: 20,
      advanced_application: 10,
    },
    chapter_ratios: [
      { chapter: 'Chương 1: Lập trình Python & Giải thuật nâng cao', ratio: 35, selected: true },
      { chapter: 'Chương 2: Cơ sở dữ liệu quan hệ & Truy vấn SQL', ratio: 35, selected: true },
      { chapter: 'Chương 3: Trí tuệ nhân tạo (AI) ứng dụng', ratio: 30, selected: true },
    ],
    updated_at: '2026-03-17',
  },
  {
    id: 'Công nghệ_12',
    subject: 'Công nghệ',
    grade_level: '12',
    total_questions: 40,
    duration_minutes: 45,
    difficulty_ratio: {
      recognition: 40,
      understanding: 35,
      application: 15,
      advanced_application: 10,
    },
    chapter_ratios: [
      { chapter: 'Chương 1: Vẽ kỹ thuật & Bản vẽ cơ khí CAD', ratio: 35, selected: true },
      { chapter: 'Chương 2: Điện tử ứng dụng & Vi điều khiển', ratio: 35, selected: true },
      { chapter: 'Chương 3: Tự động hóa & Hệ thống Robotics', ratio: 30, selected: true },
    ],
    updated_at: '2026-03-16',
  },
];
