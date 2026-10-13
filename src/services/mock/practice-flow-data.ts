import { PracticeLevel } from '@/types/subject';

export type ExamFormat = 'QUIZ' | 'ESSAY' | 'MIXED';

export interface GradeItem {
  id: number;
  label: string;
  levelGroup: 'PRIMARY' | 'SECONDARY' | 'HIGH';
  isDemoReady?: boolean;
}

export const K12_GRADES: GradeItem[] = [
  { id: 1, label: 'Lớp 1', levelGroup: 'PRIMARY' },
  { id: 2, label: 'Lớp 2', levelGroup: 'PRIMARY' },
  { id: 3, label: 'Lớp 3', levelGroup: 'PRIMARY' },
  { id: 4, label: 'Lớp 4', levelGroup: 'PRIMARY' },
  { id: 5, label: 'Lớp 5', levelGroup: 'PRIMARY' },
  { id: 6, label: 'Lớp 6', levelGroup: 'SECONDARY' },
  { id: 7, label: 'Lớp 7', levelGroup: 'SECONDARY' },
  { id: 8, label: 'Lớp 8', levelGroup: 'SECONDARY' },
  { id: 9, label: 'Lớp 9', levelGroup: 'SECONDARY' },
  { id: 10, label: 'Lớp 10', levelGroup: 'HIGH' },
  { id: 11, label: 'Lớp 11', levelGroup: 'HIGH' },
  { id: 12, label: 'Lớp 12', levelGroup: 'HIGH', isDemoReady: true },
];

export interface ChapterItem {
  id: number;
  slug: string;
  name: string;
  description: string;
  lessonCount: number;
  examCount: number;
  isDemoReady?: boolean;
}

// 6 Chương Toán 12 theo Chương trình GDPT 2018 (Kết Nối Tri Thức / Cánh Diều)
export const MATH_GRADE_12_CHAPTERS: ChapterItem[] = [
  {
    id: 1,
    slug: 'ung-dung-dao-ham-khao-sat-do-thi',
    name: 'Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
    description: 'Tính đơn điệu, cực trị, GTLN-GTNN, đường tiệm cận (đứng, ngang, xiên), đồ thị hàm số và bài toán thực tế.',
    lessonCount: 5,
    examCount: 24,
    isDemoReady: true,
  },
  {
    id: 2,
    slug: 'vecto-va-he-toa-do-trong-khong-gian',
    name: 'Chương 2: Tọa độ của vectơ trong không gian',
    description: 'Vectơ trong không gian, các phép toán vectơ, hệ trục tọa độ Oxyz và ứng dụng hình học.',
    lessonCount: 4,
    examCount: 18,
  },
  {
    id: 3,
    slug: 'cac-so-dac-trung-do-phan-tan-mau-so-lieu',
    name: 'Chương 3: Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm',
    description: 'Khoảng biến thiên, khoảng tứ vị phân, phương sai và độ lệch chuẩn của mẫu số liệu ghép nhóm.',
    lessonCount: 3,
    examCount: 12,
  },
  {
    id: 4,
    slug: 'nguyen-ham-va-tich-phan',
    name: 'Chương 4: Nguyên hàm và tích phân',
    description: 'Định nghĩa nguyên hàm, bảng nguyên hàm cơ bản, phương pháp tính tích phân và tính diện tích, thể tích.',
    lessonCount: 4,
    examCount: 20,
  },
  {
    id: 5,
    slug: 'phuong-phap-toa-do-trong-khong-gian',
    name: 'Chương 5: Phương pháp tọa độ trong không gian',
    description: 'Phương trình mặt phẳng, phương trình đường thẳng và phương trình mặt cầu trong không gian Oxyz.',
    lessonCount: 4,
    examCount: 22,
  },
  {
    id: 6,
    slug: 'xac-suat-co-dieu-kien',
    name: 'Chương 6: Xác suất có điều kiện',
    description: 'Khái niệm xác suất có điều kiện, công thức xác suất toàn phần và công thức Bayes.',
    lessonCount: 3,
    examCount: 15,
  },
];

export interface QuestionChoice {
  key: 'A' | 'B' | 'C' | 'D';
  content: string;
}

export interface TrueFalseStatement {
  subId: 'a' | 'b' | 'c' | 'd';
  statement: string;
  isCorrect: boolean;
  explanation: string;
}

export interface ExamQuestion {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  title: string;
  content: string;
  score: number;
  // Cho trắc nghiệm 4 lựa chọn
  choices?: QuestionChoice[];
  correctChoice?: 'A' | 'B' | 'C' | 'D';
  // Cho trắc nghiệm Đúng/Sai 4 ý
  statements?: TrueFalseStatement[];
  // Cho trắc nghiệm trả lời ngắn (điền số)
  shortAnswerCorrect?: string;
  // Lời giải chi tiết
  explanation: string;
  // Barem điểm tự luận
  gradingRubric?: { step: string; point: number; detail: string }[];
}

export interface PracticeExamPackage {
  id: string;
  subjectSlug: string;
  subjectName: string;
  level: PracticeLevel;
  grade: number;
  chapterId: number;
  chapterName: string;
  format: ExamFormat;
  title: string;
  durationMinutes: number;
  totalPoints: number;
  questions: ExamQuestion[];
}

// Ngân hàng câu hỏi mẫu Chuẩn SGK Mới GDPT 2018 (Toán 12 - Chương 1)
export const MOCK_EXAM_QUESTIONS_CH1: ExamQuestion[] = [
  // 1. Trắc nghiệm 4 lựa chọn - Đơn điệu
  {
    id: 'q-01',
    type: 'MULTIPLE_CHOICE',
    title: 'Câu 1 (Nhận biết): Tính đơn điệu của hàm số bậc ba',
    content: 'Cho hàm số $y = x^3 - 3x^2 + 2$. Khoảng đồng biến của hàm số đã cho là:',
    score: 0.5,
    choices: [
      { key: 'A', content: '$(0; 2)$' },
      { key: 'B', content: '$(-\\infty; 0)$ và $(2; +\\infty)$' },
      { key: 'C', content: '$(-\\infty; 2)$' },
      { key: 'D', content: '$(0; +\\infty)$' },
    ],
    correctChoice: 'B',
    explanation:
      'Ta có đạo hàm $y\' = 3x^2 - 6x = 3x(x - 2)$.\\nCho $y\' = 0 \\Leftrightarrow x = 0$ hoặc $x = 2$.\\nXét dấu của $y\':\\n• $y\' > 0$ trên $(-\\infty; 0)$ và $(2; +\\infty)$ ⇒ hàm số đồng biến trên các khoảng $(-\\infty; 0)$ và $(2; +\\infty)$.\\n• $y\' < 0$ trên $(0; 2)$ ⇒ hàm số nghịch biến trên $(0; 2)$.\\nVậy đáp án đúng là B.',
  },

  // 2. Trắc nghiệm 4 lựa chọn - Cực trị
  {
    id: 'q-02',
    type: 'MULTIPLE_CHOICE',
    title: 'Câu 2 (Thông hiểu): Tìm điểm cực đại của đồ thị hàm số',
    content: 'Cho hàm số $y = -x^4 + 2x^2 + 3$. Tọa độ điểm cực đại của đồ thị hàm số là:',
    score: 0.5,
    choices: [
      { key: 'A', content: '$(0; 3)$' },
      { key: 'B', content: '$(-1; 4)$ và $(1; 4)$' },
      { key: 'C', content: '$(1; 4)$' },
      { key: 'D', content: '$(1; 0)$' },
    ],
    correctChoice: 'B',
    explanation:
      'Đạo hàm $y\' = -4x^3 + 4x = -4x(x^2 - 1)$.\\nCho $y\' = 0 \\Leftrightarrow x = 0$ hoặc $x = \\pm 1$.\\nBảng biến thiên cho thấy $y\'$ đổi dấu từ dương sang âm khi qua $x = -1$ và $x = 1$.\\nVới $x = \\pm 1 \\Rightarrow y = -1 + 2 + 3 = 4$.\\nVậy đồ thị có hai điểm cực đại là $(-1; 4)$ và $(1; 4)$. Chọn B.',
  },

  // 3. Trắc nghiệm 4 lựa chọn - GTLN, GTNN
  {
    id: 'q-03',
    type: 'MULTIPLE_CHOICE',
    title: 'Câu 3 (Thông hiểu): Giá trị lớn nhất trên đoạn',
    content: 'Giá trị lớn nhất của hàm số $f(x) = x + \\frac{4}{x}$ trên đoạn $[1; 3]$ bằng:',
    score: 0.5,
    choices: [
      { key: 'A', content: '$5$' },
      { key: 'B', content: '$4$' },
      { key: 'C', content: '$\\frac{13}{3}$' },
      { key: 'D', content: '$6$' },
    ],
    correctChoice: 'A',
    explanation:
      'Hàm số liên tục trên $[1; 3]$.\\nĐạo hàm $f\'(x) = 1 - \\frac{4}{x^2} = \\frac{x^2 - 4}{x^2}$.\\nCho $f\'(x) = 0 \\Leftrightarrow x = 2$ (vì $x \\in [1; 3]$).\\nTính các giá trị:\\n• $f(1) = 1 + 4 = 5$\\n• $f(2) = 2 + 2 = 4$\\n• $f(3) = 3 + \\frac{4}{3} = \\frac{13}{3} \\approx 4.33$\\nSo sánh suy ra $\\max_{[1; 3]} f(x) = f(1) = 5$. Chọn A.',
  },

  // 4. Trắc nghiệm 4 lựa chọn - Tiệm cận xiên (Điểm mới SGK 2018)
  {
    id: 'q-04',
    type: 'MULTIPLE_CHOICE',
    title: 'Câu 4 (Vận dụng): Đường tiệm cận xiên của đồ thị hàm số',
    content: 'Đường tiệm cận xiên của đồ thị hàm số $y = \\frac{x^2 + 2x - 1}{x - 1}$ có phương trình là:',
    score: 0.5,
    choices: [
      { key: 'A', content: '$y = x + 3$' },
      { key: 'B', content: '$y = x - 3$' },
      { key: 'C', content: '$y = x + 1$' },
      { key: 'D', content: '$y = 2x + 1$' },
    ],
    correctChoice: 'A',
    explanation:
      'Chia đa thức tử cho mẫu:\\n$y = \\frac{x^2 + 2x - 1}{x - 1} = (x + 3) + \\frac{2}{x - 1}$.\\nKhi $x \\to \\pm\\infty$, $\\lim_{x \\to \\pm\\infty} [y - (x + 3)] = \\lim_{x \\to \\pm\\infty} \\frac{2}{x - 1} = 0$.\\nVậy đường thẳng $y = x + 3$ là tiệm cận xiên của đồ thị. Chọn A.',
  },

  // 5. Trắc nghiệm Đúng/Sai (Định dạng đề thi Bộ GD&ĐT 2025)
  {
    id: 'q-05',
    type: 'TRUE_FALSE',
    title: 'Câu 5 (Định dạng Đúng/Sai 2025): Khảo sát hàm phân thức hữu tỉ bậc nhất trên bậc nhất',
    content: 'Cho hàm số $y = f(x) = \\frac{2x - 1}{x + 1}$. Xét tính đúng hoặc sai của các khẳng định sau:',
    score: 1.0,
    explanation:
      'Lời giải chi tiết:\\n• a) Tập xác định là $D = \\mathbb{R} \\setminus \\{-1\\} \\Rightarrow$ Đúng.\\n• b) Đạo hàm $f\'(x) = \\frac{2(1) - (-1)(1)}{(x+1)^2} = \\frac{3}{(x+1)^2} > 0, \\forall x \\neq -1 \\Rightarrow$ Đúng.\\n• c) $\\lim_{x \\to -1^+} y = -\\infty$, $\\lim_{x \\to -1^-} y = +\\infty \\Rightarrow x = -1$ là TC đứng. $\\lim_{x \\to \\pm\\infty} y = 2 \\Rightarrow y = 2$ là TC ngang $\\Rightarrow$ Đúng.\\n• d) Sai, vì hàm số chỉ đồng biến trên từng khoảng xác định $(-\\infty; -1)$ và $(-1; +\\infty)$, không được dùng từ "trên $\\mathbb{R}$" hay "trên tập xác định".',
    statements: [
      {
        subId: 'a',
        statement: 'Tập xác định của hàm số là $D = \\mathbb{R} \\setminus \\{-1\\}$.',
        isCorrect: true,
        explanation: 'Mẫu số $x + 1 \\neq 0 \\Leftrightarrow x \\neq -1$.',
      },
      {
        subId: 'b',
        statement: 'Đạo hàm của hàm số là $f\'(x) = \\frac{3}{(x + 1)^2} > 0, \\forall x \\neq -1$.',
        isCorrect: true,
        explanation: 'Quy tắc đạo hàm $(ad - bc)/(cx + d)^2 = (2 - (-1))/(x + 1)^2 = 3/(x + 1)^2 > 0$.',
      },
      {
        subId: 'c',
        statement: 'Đồ thị hàm số có tiệm cận đứng là đường thẳng $x = -1$ và tiệm cận ngang là $y = 2$.',
        isCorrect: true,
        explanation: 'Tiệm cận đứng tại nghiệm của mẫu $x = -1$, tiệm cận ngang $y = a/c = 2/1 = 2$.',
      },
      {
        subId: 'd',
        statement: 'Hàm số đồng biến trên toàn trục số thực $\\mathbb{R}$.',
        isCorrect: false,
        explanation: 'Sai về mặt định nghĩa toán học: Hàm số chỉ đồng biến trên từng khoảng $(-\\infty; -1)$ và $(-1; +\\infty)$.',
      },
    ],
  },

  // 6. Trắc nghiệm Trả lời ngắn (Điền số - Định dạng 2025)
  {
    id: 'q-06',
    type: 'SHORT_ANSWER',
    title: 'Câu 6 (Điền đáp số): Số điểm cực trị của hàm số',
    content:
      'Biết đồ thị hàm số $y = x^3 - 6x^2 + 9x + 1$ có hai điểm cực trị là $A(x_1; y_1)$ và $B(x_2; y_2)$. Tính tổng giá trị tung độ $y_1 + y_2$ của hai điểm cực trị này.',
    score: 1.0,
    shortAnswerCorrect: '6',
    explanation:
      'Đạo hàm $y\' = 3x^2 - 12x + 9 = 3(x^2 - 4x + 3)$.\\n$y\' = 0 \\Leftrightarrow x = 1$ hoặc $x = 3$.\\n• Với $x_1 = 1 \\Rightarrow y_1 = 1 - 6 + 9 + 1 = 5 \\Rightarrow A(1; 5)$.\\n• Với $x_2 = 3 \\Rightarrow y_2 = 27 - 54 + 27 + 1 = 1 \\Rightarrow B(3; 1)$.\\nTổng giá trị tung độ cực trị: $y_1 + y_2 = 5 + 1 = 6$.\\nĐáp số điền: 6.',
  },

  // 7. Bài toán Tự Luận - Khảo sát và tìm tham số m (Có barem điểm chi tiết)
  {
    id: 'q-07',
    type: 'ESSAY',
    title: 'Câu 7 (Tự luận): Tìm tham số m để hàm số đạt cực tiểu tại điểm cho trước',
    content:
      'Cho hàm số $y = f(x) = \\frac{1}{3}x^3 - mx^2 + (m^2 - m + 1)x + 1$ (với $m$ là tham số thực).\\n\\na) Khi $m = 2$, hãy lập bảng biến thiên và tìm các khoảng đơn điệu của hàm số.\\nb) Tìm tất cả các giá trị của tham số $m$ để hàm số đạt cực tiểu tại điểm $x = 1$.',
    score: 6.0,
    explanation:
      'Lời giải mẫu tự luận:\\n\\n' +
      'a) Với $m = 2$, hàm số trở thành: $y = \\frac{1}{3}x^3 - 2x^2 + 3x + 1$.\\n' +
      '• TXĐ: $D = \\mathbb{R}$.\\n' +
      '• Đạo hàm: $y\' = x^2 - 4x + 3$.\\n' +
      '• $y\' = 0 \\Leftrightarrow x = 1$ hoặc $x = 3$.\\n' +
      '• Bảng biến thiên: $y\' > 0$ trên $(-\\infty; 1) \\cup (3; +\\infty)$, $y\' < 0$ trên $(1; 3)$.\\n' +
      '• Kết luận: Hàm số đồng biến trên $(-\\infty; 1)$ và $(3; +\\infty)$; nghịch biến trên $(1; 3)$.\\n\\n' +
      'b) Tìm $m$ để hàm số đạt cực tiểu tại $x = 1$:\\n' +
      '• Ta có: $y\' = x^2 - 2mx + (m^2 - m + 1)$.\\n' +
      '• Đạo hàm cấp hai: $y\'\' = 2x - 2m$.\\n' +
      '• Điều kiện cần để hàm số đạt cực trị tại $x = 1$ là $y\'(1) = 0$:\\n' +
      '  $1^2 - 2m(1) + m^2 - m + 1 = 0 \\Leftrightarrow m^2 - 3m + 2 = 0 \\Leftrightarrow m = 1$ hoặc $m = 2$.\\n' +
      '• Thử lại với điều kiện đủ:\\n' +
      '  - Với $m = 1$: $y\' = x^2 - 2x + 1 = (x - 1)^2 \\geq 0, \\forall x$. Do $y\'$ không đổi dấu qua $x = 1$ nên $x = 1$ không phải là cực trị (loại $m = 1$).\\n' +
      '  - Với $m = 2$: $y\' = x^2 - 4x + 3 = (x - 1)(x - 3)$. Qua $x = 1$, $y\'$ đổi dấu từ dương sang âm nên $x = 1$ là điểm cực đại (loại $m = 2$).\\n' +
      '  (Hoặc kiểm tra $y\'\'(1) = 2 - 2m$):\\n' +
      '  + Với $m = 2 \\Rightarrow y\'\'(1) = -2 < 0 \\Rightarrow$ cực đại.\\n' +
      '• Kết luận: Không tồn tại giá trị $m$ nào để hàm số đạt cực tiểu tại $x = 1$.',
    gradingRubric: [
      {
        step: 'Bước 1 (1.5 điểm)',
        point: 1.5,
        detail: 'Thay đúng $m = 2$, tính đúng $y\' = x^2 - 4x + 3$, tìm đúng nghiệm $x = 1, x = 3$.',
      },
      {
        step: 'Bước 2 (1.5 điểm)',
        point: 1.5,
        detail: 'Lập đúng bảng xét dấu/bảng biến thiên và kết luận chính xác các khoảng đồng biến, nghịch biến.',
      },
      {
        step: 'Bước 3 (1.5 điểm)',
        point: 1.5,
        detail: 'Tính $y\'(1) = m^2 - 3m + 2 = 0$, giải ra $m = 1$ hoặc $m = 2$.',
      },
      {
        step: 'Bước 4 (1.5 điểm)',
        point: 1.5,
        detail: 'Thử lại bằng dấu $y\'$ hoặc $y\'\'(1)$ chỉ ra $m = 1$ không là cực trị, $m = 2$ là cực đại và kết luận không có $m$ thỏa mãn.',
      },
    ],
  },
];

// Helper lấy đề thi theo cấu hình
export interface PracticeExamOptions {
  requestedCount?: number;
  quizCount?: number;
  essayCount?: number;
  durationMinutes?: number;
}

export function getPracticeExam(
  subjectSlug: string,
  level: PracticeLevel,
  grade: number,
  chapterId: number,
  format: ExamFormat,
  options?: PracticeExamOptions | number
): PracticeExamPackage {
  const opts: PracticeExamOptions =
    typeof options === 'number' ? { requestedCount: options } : options || {};

  let questions: ExamQuestion[] = [];
  let duration = opts.durationMinutes || 45;
  let title = '';

  const chapter = MATH_GRADE_12_CHAPTERS.find((c) => c.id === chapterId) || MATH_GRADE_12_CHAPTERS[0];
  const baseQuiz = MOCK_EXAM_QUESTIONS_CH1.filter((q) => q.type !== 'ESSAY');
  const baseEssay = MOCK_EXAM_QUESTIONS_CH1.filter((q) => q.type === 'ESSAY');

  if (format === 'QUIZ') {
    const targetCount =
      opts.quizCount && opts.quizCount >= 10 && opts.quizCount <= 30
        ? opts.quizCount
        : opts.requestedCount && opts.requestedCount >= 10 && opts.requestedCount <= 30
        ? opts.requestedCount
        : 10;

    const generated: ExamQuestion[] = [];
    for (let i = 0; i < targetCount; i++) {
      const baseQ = baseQuiz[i % baseQuiz.length];
      const repIdx = Math.floor(i / baseQuiz.length);
      generated.push({
        ...baseQ,
        id: repIdx > 0 ? `${baseQ.id}_v${repIdx + 1}` : baseQ.id,
        title: `Câu ${i + 1}: ${baseQ.title.replace(/^Câu \d+(\s*\([^)]*\))?:\s*/, '')}`,
        score: Math.round((10 / targetCount) * 100) / 100,
      });
    }

    questions = generated;
    duration = opts.durationMinutes || Math.max(15, Math.round(targetCount * 1.5));
    title = `Đề Luyện Trắc Nghiệm (${targetCount} Câu) - ${chapter.name}`;
  } else if (format === 'ESSAY') {
    const targetCount =
      opts.essayCount && opts.essayCount >= 5 && opts.essayCount <= 10
        ? opts.essayCount
        : opts.requestedCount && opts.requestedCount >= 5 && opts.requestedCount <= 10
        ? opts.requestedCount
        : 5;

    const generated: ExamQuestion[] = [];
    for (let i = 0; i < targetCount; i++) {
      const baseQ = baseEssay[i % baseEssay.length];
      const repIdx = Math.floor(i / baseEssay.length);
      generated.push({
        ...baseQ,
        id: repIdx > 0 ? `${baseQ.id}_v${repIdx + 1}` : baseQ.id,
        title: `Câu ${i + 1} (Tự luận): ${baseQ.title.replace(/^Câu \d+(\s*\([^)]*\))?:\s*/, '')}`,
        score: Math.round((10 / targetCount) * 100) / 100,
      });
    }

    questions = generated;
    duration = opts.durationMinutes || 45;
    title = `Đề Luyện Tự Luận (${targetCount} Câu) - ${chapter.name}`;
  } else {
    // MIXED: Cả Trắc Nghiệm & Tự Luận
    const targetQuizCount =
      opts.quizCount && opts.quizCount >= 5 && opts.quizCount <= 30 ? opts.quizCount : 10;
    const targetEssayCount =
      opts.essayCount && opts.essayCount >= 1 && opts.essayCount <= 10 ? opts.essayCount : 2;

    const generated: ExamQuestion[] = [];
    const quizScorePerQ = Math.round((7 / targetQuizCount) * 100) / 100;
    for (let i = 0; i < targetQuizCount; i++) {
      const baseQ = baseQuiz[i % baseQuiz.length];
      const repIdx = Math.floor(i / baseQuiz.length);
      generated.push({
        ...baseQ,
        id: repIdx > 0 ? `${baseQ.id}_tn_v${repIdx + 1}` : `${baseQ.id}_tn`,
        title: `Câu ${i + 1} (Trắc nghiệm): ${baseQ.title.replace(/^Câu \d+(\s*\([^)]*\))?:\s*/, '')}`,
        score: quizScorePerQ,
      });
    }

    const essayScorePerQ = Math.round((3 / targetEssayCount) * 100) / 100;
    for (let j = 0; j < targetEssayCount; j++) {
      const baseQ = baseEssay[j % baseEssay.length];
      const repIdx = Math.floor(j / baseEssay.length);
      generated.push({
        ...baseQ,
        id: repIdx > 0 ? `${baseQ.id}_tl_v${repIdx + 1}` : `${baseQ.id}_tl`,
        title: `Câu ${targetQuizCount + j + 1} (Tự luận): ${baseQ.title.replace(/^Câu \d+(\s*\([^)]*\))?:\s*/, '')}`,
        score: essayScorePerQ,
      });
    }

    questions = generated;
    duration = opts.durationMinutes || 45;
    title = `Đề Luyện Tổng Hợp (${targetQuizCount} TN + ${targetEssayCount} TL) - ${chapter.name}`;
  }

  const totalPoints = questions.reduce((sum, q) => sum + q.score, 0);

  return {
    id: `exam-${subjectSlug}-${level.toLowerCase()}-g${grade}-ch${chapterId}-${format.toLowerCase()}`,
    subjectSlug,
    subjectName: subjectSlug === 'toan-hoc' ? 'Toán Học' : 'Môn Học K-12',
    level,
    grade,
    chapterId,
    chapterName: chapter.name,
    format,
    title,
    durationMinutes: duration,
    totalPoints: Math.round(totalPoints * 10) / 10,
    questions,
  };
}
