import { LessonFullContent } from '@/types/lesson-content';

// ============================================================================
// BỘ DỮ LIỆU MẪU ĐẦY ĐỦ 4 PHẦN CHO 6 BÀI HỌC (BÀI 1 ĐẾN BÀI 6 - TOÁN 11 LƯỢNG GIÁC)
// ============================================================================

export const MOCK_LESSON_CONTENTS: Record<string, LessonFullContent> = {
  // --------------------------------------------------------------------------
  // BÀI 1: Góc lượng giác & Giá trị lượng giác của góc lượng giác
  // --------------------------------------------------------------------------
  'ls-01': {
    lessonId: 'ls-01',
    lessonTitle: 'Bài 1: Giá trị lượng giác của góc lượng giác & Công thức cốt lõi',
    theory: {
      definitions: [
        {
          id: 'def-1-1',
          title: 'Định nghĩa Giá trị lượng giác của góc lượng giác',
          summary:
            'Trên đường tròn lượng giác tâm $O$, cho điểm $M(x; y)$ tương ứng với góc lượng giác $\\alpha$. Ta định nghĩa $\\cos(\\alpha) = x$, $\\sin(\\alpha) = y$, $\\tan(\\alpha) = \\frac{y}{x}$ ($x \\neq 0$) và $\\cot(\\alpha) = \\frac{x}{y}$ ($y \\neq 0$).',
          highlightedKeywords: ['Đường tròn lượng giác', 'Hoành độ cos', 'Tung độ sin', 'Điều kiện xác định'],
          keyNotes: [
            'Góc phần tư I: $\\sin, \\cos, \\tan, \\cot$ đều mang dấu Dương (> 0).',
            'Góc phần tư II: $\\sin \\alpha > 0$, các giá trị còn lại Âm (< 0).',
            'Góc phần tư III: $\\tan \\alpha, \\cot \\alpha > 0$, các giá trị còn lại Âm (< 0).',
            'Góc phần tư IV: $\\cos \\alpha > 0$, các giá trị còn lại Âm (< 0).',
          ],
        },
      ],
      formulas: [
        {
          id: 'f-1-1',
          category: 'Công thức cơ bản',
          name: 'Hằng đẳng thức lượng giác cốt lõi',
          expressionLatex: '\\sin^2(\\alpha) + \\cos^2(\\alpha) = 1',
          condition: 'Mọi góc $\\alpha \\in \\mathbb{R}$',
          explanation: 'Xuất phát trực tiếp từ phương trình đường tròn đơn vị $x^2 + y^2 = 1$.',
        },
        {
          id: 'f-1-2',
          category: 'Công thức cơ bản',
          name: 'Mối liên hệ giữa Tan và Cot',
          expressionLatex: '\\tan(\\alpha) \\cdot \\cot(\\alpha) = 1',
          condition: '$\\alpha \\neq k\\frac{\\pi}{2} \\quad (k \\in \\mathbb{Z})$',
          explanation: 'Tích của hai số nghịch đảo $\\frac{y}{x} \\cdot \\frac{x}{y} = 1$.',
        },
        {
          id: 'f-1-3',
          category: 'Công thức liên kết',
          name: 'Công thức biến đổi 1 + tan²',
          expressionLatex: '1 + \\tan^2(\\alpha) = \\frac{1}{\\cos^2(\\alpha)}',
          condition: '$\\cos\\alpha \\neq 0 \\iff \\alpha \\neq \\frac{\\pi}{2} + k\\pi$',
          explanation: 'Chia cả 2 vế của $\\sin^2\\alpha + \\cos^2\\alpha = 1$ cho $\\cos^2\\alpha$.',
        },
      ],
      examples: [
        {
          id: 'ex-1-1',
          title: 'Ví dụ 1: Tính giá trị lượng giác khi biết $\\sin(\\alpha)$',
          difficulty: 'Cơ bản',
          problemStatement:
            'Cho $\\sin(\\alpha) = \\frac{3}{5}$ với $\\frac{\\pi}{2} < \\alpha < \\pi$ (Góc phần tư thứ II). Hãy tính giá trị của $\\cos(\\alpha)$, $\\tan(\\alpha)$ và $\\cot(\\alpha)$.',
          steps: [
            {
              stepNumber: 1,
              title: 'Áp dụng hằng đẳng thức cốt lõi',
              content:
                'Ta có: $\\sin^2(\\alpha) + \\cos^2(\\alpha) = 1 \\implies \\cos^2(\\alpha) = 1 - \\sin^2(\\alpha) = 1 - \\left(\\frac{3}{5}\\right)^2 = \\frac{16}{25}$.',
              formulaUsed: '\\sin^2(\\alpha) + \\cos^2(\\alpha) = 1',
            },
            {
              stepNumber: 2,
              title: 'Xét dấu theo góc phần tư II',
              content: 'Vì $\\frac{\\pi}{2} < \\alpha < \\pi$ nên góc $\\alpha$ thuộc góc phần tư II $\\implies \\cos(\\alpha) < 0$.\nSuy ra: $\\cos(\\alpha) = -\\sqrt{\\frac{16}{25}} = -\\frac{4}{5}$.',
            },
            {
              stepNumber: 3,
              title: 'Tính Tan và Cot theo định nghĩa',
              content: '• $\\tan(\\alpha) = \\frac{\\sin(\\alpha)}{\\cos(\\alpha)} = \\frac{3}{5} : \\left(-\\frac{4}{5}\\right) = -\\frac{3}{4}$.\n• $\\cot(\\alpha) = \\frac{1}{\\tan(\\alpha)} = -\\frac{4}{3}$.',
            },
          ],
          finalAnswer: 'Kết quả: $\\cos(\\alpha) = -\\frac{4}{5}$, $\\tan(\\alpha) = -\\frac{3}{4}$, $\\cot(\\alpha) = -\\frac{4}{3}$.',
        },
      ],
    },
    quiz: {
      title: 'Phần 2: Trắc Nghiệm Bài 1',
      description: 'Kiểm tra mức độ hiểu bài về khái niệm & giá trị lượng giác cơ bản.',
      totalQuestions: 4,
      passingScorePct: 75,
      questions: [
        {
          id: 'q-1-1',
          number: 1,
          type: 'SINGLE_CHOICE',
          points: 2.5,
          content: 'Giá trị của $\\sin\\left(\\frac{\\pi}{6}\\right)$ bằng:',
          options: [
            { id: 'o-1-1a', content: 'A. $\\frac{1}{2}$', isCorrect: true },
            { id: 'o-1-1b', content: 'B. $\\frac{\\sqrt{2}}{2}$' },
            { id: 'o-1-1c', content: 'C. $\\frac{\\sqrt{3}}{2}$' },
            { id: 'o-1-1d', content: 'D. $1$' },
          ],
          explain: 'Theo bảng giá trị lượng giác đặc biệt, $\\sin(30^\\circ) = \\sin(\\pi/6) = 1/2$.',
        },
        {
          id: 'q-1-2',
          number: 2,
          type: 'SINGLE_CHOICE',
          points: 2.5,
          content: 'Trong góc phần tư thứ III, giá trị của $\\tan(\\alpha)$ luôn:',
          options: [
            { id: 'o-1-2a', content: 'A. Dương (> 0)', isCorrect: true },
            { id: 'o-1-2b', content: 'B. Âm (< 0)' },
            { id: 'o-1-2c', content: 'C. Bằng 0' },
            { id: 'o-1-2d', content: 'D. Không xác định' },
          ],
          explain: 'Ở góc phần tư III, cả sin và cos đều âm nên tan = sin/cos > 0 (Dương).',
        },
        {
          id: 'q-1-3',
          number: 3,
          type: 'SINGLE_CHOICE',
          points: 2.5,
          content: 'Cho điểm $M\\left(\\frac{1}{2}; \\frac{\\sqrt{3}}{2}\\right)$ trên đường tròn lượng giác. Khẳng định nào đúng?',
          options: [
            { id: 'o-1-3a', content: 'A. $\\cos(\\alpha) = \\frac{1}{2}, \\sin(\\alpha) = \\frac{\\sqrt{3}}{2}$', isCorrect: true },
            { id: 'o-1-3b', content: 'B. $\\cos(\\alpha) = \\frac{\\sqrt{3}}{2}, \\sin(\\alpha) = \\frac{1}{2}$' },
            { id: 'o-1-3c', content: 'C. $\\tan(\\alpha) = \\frac{1}{\\sqrt{3}}$' },
            { id: 'o-1-3d', content: 'D. $\\sin(\\alpha) = -\\frac{\\sqrt{3}}{2}$' },
          ],
          explain: 'Hoành độ điểm M là $\\cos(\\alpha) = 1/2$ và tung độ là $\\sin(\\alpha) = \\sqrt{3}/2$.',
        },
        {
          id: 'q-1-4',
          number: 4,
          type: 'SINGLE_CHOICE',
          points: 2.5,
          content: 'Đơn giản biểu thức $P = \\sin^2(\\alpha) + \\cos^2(\\alpha) + \\tan^2(\\alpha)$:',
          options: [
            { id: 'o-1-4a', content: 'A. $\\frac{1}{\\cos^2(\\alpha)}$', isCorrect: true },
            { id: 'o-1-4b', content: 'B. $\\frac{1}{\\sin^2(\\alpha)}$' },
            { id: 'o-1-4c', content: 'C. $1$' },
            { id: 'o-1-4d', content: 'D. $1 + \\cot^2(\\alpha)$' },
          ],
          explain: 'Vì $\\sin^2\\alpha + \\cos^2\\alpha = 1$ nên $P = 1 + \\tan^2\\alpha = \\frac{1}{\\cos^2\\alpha}$.',
        },
      ],
    },
    essay: {
      title: 'Phần 3: Bài Tập Tự Luận Bài 1',
      description: 'Luyện tập kỹ năng trình bày lập luận biến đổi lượng giác.',
      problems: [
        {
          id: 'ess-1-1',
          number: 1,
          title: 'Bài tập 1: Tính giá trị biểu thức khi biết $\\cos(\\alpha)$',
          difficulty: 'Trung bình',
          problemStatement: 'Cho $\\cos(\\alpha) = -\\frac{5}{13}$ với $\\pi < \\alpha < \\frac{3\\pi}{2}$. Tính giá trị của biểu thức $P = \\sin(\\alpha) + \\tan(\\alpha)$.',
          hints: ['Góc thuộc góc phần tư III nên sin(α) < 0', 'Áp dụng sin²(α) = 1 - cos²(α)'],
          sampleSolution: 'Ta có: $\\sin^2(\\alpha) = 1 - \\cos^2(\\alpha) = 1 - \\left(-\\frac{5}{13}\\right)^2 = \\frac{144}{169}$.\nVì $\\pi < \\alpha < \\frac{3\\pi}{2}$ nên $\\sin(\\alpha) < 0 \\implies \\sin(\\alpha) = -\\frac{12}{13}$.\nDo đó $\\tan(\\alpha) = \\frac{-12/13}{-5/13} = \\frac{12}{5}$.\nSuy ra: $P = -\\frac{12}{13} + \\frac{12}{5} = \\frac{96}{65}$.',
          maxPoints: 5,
        },
      ],
    },
    exam: {
      title: 'Phần 4: Kiểm Tra Tổng Hợp Bài 1',
      description: 'Bài kiểm tra ngắn 10 phút đánh giá kiến thức Bài 1.',
      examConfig: {
        examId: 'ex-ls-01',
        title: 'Kiểm tra 10 phút Bài 1 — Giá trị lượng giác',
        durationMins: 10,
        totalQuestions: 2,
        maxScore: 10,
        passingScore: 5,
        questions: [
          {
            id: 'ex-q-1-1',
            number: 1,
            type: 'SINGLE_CHOICE',
            points: 5,
            content: 'Đơn giản biểu thức $A = 1 - \\sin^2(\\alpha)$:',
            options: [
              { id: 'ex-o-1', content: 'A. $\\cos^2(\\alpha)$', isCorrect: true },
              { id: 'ex-o-2', content: 'B. $\\sin^2(\\alpha)$' },
              { id: 'ex-o-3', content: 'C. $-\\cos^2(\\alpha)$' },
              { id: 'ex-o-4', content: 'D. $1$' },
            ],
            explain: 'Theo hằng đẳng thức cơ bản $\\sin^2(\\alpha) + \\cos^2(\\alpha) = 1$.',
          },
          {
            id: 'ex-q-1-2',
            number: 2,
            type: 'SINGLE_CHOICE',
            points: 5,
            content: 'Cho $\\tan(\\alpha) = 3$. Tính giá trị của $\\cot(\\alpha)$:',
            options: [
              { id: 'ex-o-1-2a', content: 'A. $\\frac{1}{3}$', isCorrect: true },
              { id: 'ex-o-1-2b', content: 'B. $-3$' },
              { id: 'ex-o-1-2c', content: 'C. $-\\frac{1}{3}$' },
              { id: 'ex-o-1-2d', content: 'D. $3$' },
            ],
            explain: 'Vì $\\tan(\\alpha) \\cdot \\cot(\\alpha) = 1 \\implies \\cot(\\alpha) = \\frac{1}{\\tan(\\alpha)} = \\frac{1}{3}$.',
          },
        ],
      },
    },
  },

  // --------------------------------------------------------------------------
  // BÀI 2: Các công thức lượng giác cốt lõi & Công thức cộng, nhân đôi
  // --------------------------------------------------------------------------
  'ls-02': {
    lessonId: 'ls-02',
    lessonTitle: 'Bài 2: Các Công Thức Lượng Giác Nâng Cao (Cộng, Nhân Đôi, Biến Đổi)',
    theory: {
      definitions: [
        {
          id: 'def-2-1',
          title: 'Khái niệm Công thức cộng lượng giác',
          summary: 'Công thức cộng cho phép biểu diễn các giá trị lượng giác của tổng hoặc hiệu hai góc $(a + b)$ hoặc $(a - b)$ theo các giá trị lượng giác của từng góc $a$ và $b$.',
          highlightedKeywords: ['Công thức cộng', 'Công thức nhân đôi', 'Biến đổi tích thành tổng'],
        },
      ],
      formulas: [
        {
          id: 'f-2-1',
          category: 'Công thức cộng',
          name: 'Công thức cộng Sin và Cos',
          expressionLatex: '\\sin(a + b) = \\sin(a)\\cos(b) + \\cos(a)\\sin(b)',
          explanation: 'Nhớ theo vần: Sin thì sin cos cos sin, cos thì cos cos sin sin dấu trừ.',
        },
        {
          id: 'f-2-2',
          category: 'Công thức nhân đôi',
          name: 'Công thức nhân đôi Sin(2a)',
          expressionLatex: '\\sin(2a) = 2\\sin(a)\\cos(a)',
          explanation: 'Suy ra từ công thức cộng khi thay b = a.',
        },
        {
          id: 'f-2-3',
          category: 'Công thức nhân đôi',
          name: 'Công thức nhân đôi Cos(2a)',
          expressionLatex: '\\cos(2a) = \\cos^2(a) - \\sin^2(a) = 2\\cos^2(a) - 1 = 1 - 2\\sin^2(a)',
          explanation: 'Ba dạng biến đổi linh hoạt tùy theo bài toán.',
        },
      ],
      examples: [
        {
          id: 'ex-2-1',
          title: 'Ví dụ 1: Tính giá trị $\\cos(75^\\circ)$ không dùng máy tính',
          difficulty: 'Cơ bản',
          problemStatement: 'Tính chính xác giá trị của $\\cos(75^\\circ)$ bằng công thức cộng.',
          steps: [
            {
              stepNumber: 1,
              title: 'Phân tích $75^\\circ$ thành tổng góc đặc biệt',
              content: 'Ta viết $75^\\circ = 45^\\circ + 30^\\circ$.',
            },
            {
              stepNumber: 2,
              title: 'Áp dụng công thức cộng Cos',
              content: '$\\cos(75^\\circ) = \\cos(45^\\circ + 30^\\circ) = \\cos(45^\\circ)\\cos(30^\\circ) - \\sin(45^\\circ)\\sin(30^\\circ)$.',
              formulaUsed: '\\cos(a + b) = \\cos(a)\\cos(b) - \\sin(a)\\sin(b)',
            },
            {
              stepNumber: 3,
              title: 'Thay giá trị lượng giác đặc biệt',
              content: '$\\cos(75^\\circ) = \\left(\\frac{\\sqrt{2}}{2}\\right)\\left(\\frac{\\sqrt{3}}{2}\\right) - \\left(\\frac{\\sqrt{2}}{2}\\right)\\left(\\frac{1}{2}\\right) = \\frac{\\sqrt{6} - \\sqrt{2}}{4}$.',
            },
          ],
          finalAnswer: 'Kết quả: $\\cos(75^\\circ) = \\frac{\\sqrt{6} - \\sqrt{2}}{4}$.',
        },
      ],
    },
    quiz: {
      title: 'Phần 2: Trắc Nghiệm Bài 2',
      description: 'Luyện tập áp dụng các công thức cộng và nhân đôi.',
      totalQuestions: 2,
      passingScorePct: 50,
      questions: [
        {
          id: 'q-2-1',
          number: 1,
          type: 'SINGLE_CHOICE',
          points: 5,
          content: 'Công thức $\\sin(2a)$ đúng là:',
          options: [
            { id: 'o-2-1a', content: 'A. $2\\sin(a)\\cos(a)$', isCorrect: true },
            { id: 'o-2-1b', content: 'B. $\\sin^2(a) - \\cos^2(a)$' },
            { id: 'o-2-1c', content: 'C. $2\\sin(a)$' },
            { id: 'o-2-1d', content: 'D. $\\sin(a)\\cos(a)$' },
          ],
          explain: 'Theo công thức nhân đôi: $\\sin(2a) = 2\\sin(a)\\cos(a)$.',
        },
        {
          id: 'q-2-2',
          number: 2,
          type: 'SINGLE_CHOICE',
          points: 5,
          content: 'Khẳng định nào sau đây SAI đối với $\\cos(2a)$?',
          options: [
            { id: 'o-2-2a', content: 'A. $\\cos(2a) = \\cos^2(a) - \\sin^2(a)$' },
            { id: 'o-2-2b', content: 'B. $\\cos(2a) = 2\\cos^2(a) - 1$' },
            { id: 'o-2-2c', content: 'C. $\\cos(2a) = 1 - 2\\sin^2(a)$' },
            { id: 'o-2-2d', content: 'D. $\\cos(2a) = 2\\sin^2(a) - 1$', isCorrect: true },
          ],
          explain: 'Phương án D sai vì công thức đúng là $\\cos(2a) = 1 - 2\\sin^2(a)$.',
        },
      ],
    },
    essay: {
      title: 'Phần 3: Bài Tập Tự Luận Bài 2',
      description: 'Rút gọn biểu thức lượng giác sử dụng công thức biến đổi.',
      problems: [
        {
          id: 'ess-2-1',
          number: 1,
          title: 'Bài tập 1: Rút gọn biểu thức',
          difficulty: 'Trung bình',
          problemStatement: 'Rút gọn biểu thức $A = \\frac{\\sin(2x)}{1 + \\cos(2x)}$.',
          hints: ['Sử dụng sin(2x) = 2sin(x)cos(x)', 'Sử dụng 1 + cos(2x) = 2cos²(x)'],
          sampleSolution: 'Ta có $\\sin(2x) = 2\\sin(x)\\cos(x)$ và $1 + \\cos(2x) = 2\\cos^2(x)$.\nDo đó $A = \\frac{2\\sin(x)\\cos(x)}{2\\cos^2(x)} = \\frac{\\sin(x)}{\\cos(x)} = \\tan(x)$.',
          maxPoints: 5,
        },
      ],
    },
    exam: {
      title: 'Phần 4: Kiểm Tra Bài 2',
      description: 'Đánh giá kỹ năng vận dụng công thức nhân đôi.',
      examConfig: {
        examId: 'ex-ls-02',
        title: 'Kiểm tra 10 phút Bài 2',
        durationMins: 10,
        totalQuestions: 2,
        maxScore: 10,
        passingScore: 5,
        questions: [
          {
            id: 'ex-q-2-1',
            number: 1,
            type: 'SINGLE_CHOICE',
            points: 5,
            content: 'Tính $\\sin(2a)$ biết $\\sin(a) = \\frac{3}{5}$ và $\\cos(a) = \\frac{4}{5}$:',
            options: [
              { id: 'ex-o-2-1a', content: 'A. $\\frac{24}{25}$', isCorrect: true },
              { id: 'ex-o-2-1b', content: 'B. $\\frac{12}{25}$' },
              { id: 'ex-o-2-1c', content: 'C. $\\frac{7}{25}$' },
              { id: 'ex-o-2-1d', content: 'D. $1$' },
            ],
            explain: '$\\sin(2a) = 2\\sin(a)\\cos(a) = 2 \\cdot \\left(\\frac{3}{5}\\right) \\cdot \\left(\\frac{4}{5}\\right) = \\frac{24}{25}$.',
          },
          {
            id: 'ex-q-2-2',
            number: 2,
            type: 'SINGLE_CHOICE',
            points: 5,
            content: 'Giá trị của biểu thức $\\cos(45^\\circ + 15^\\circ)$ bằng:',
            options: [
              { id: 'ex-o-2-2a', content: 'A. $\\frac{1}{2}$', isCorrect: true },
              { id: 'ex-o-2-2b', content: 'B. $\\frac{\\sqrt{3}}{2}$' },
              { id: 'ex-o-2-2c', content: 'C. $\\frac{\\sqrt{2}}{2}$' },
              { id: 'ex-o-2-2d', content: 'D. $0$' },
            ],
            explain: '$\\cos(45^\\circ + 15^\\circ) = \\cos(60^\\circ) = \\frac{1}{2}$.',
          },
        ],
      },
    },
  },

  // --------------------------------------------------------------------------
  // BÀI 3: Hàm số lượng giác & Đồ thị hàm số
  // --------------------------------------------------------------------------
  'ls-03': {
    lessonId: 'ls-03',
    lessonTitle: 'Bài 3: Hàm Số Lượng Giác & Khảo Sát Đồ Thị',
    theory: {
      definitions: [
        {
          id: 'def-3-1',
          title: 'Định nghĩa Hàm số lượng giác',
          summary: 'Quy tắc đặt tương ứng mỗi số thực $x$ với giá trị $\\sin(x)$ (hoặc $\\cos(x), \\tan(x), \\cot(x)$) được gọi là hàm số lượng giác.',
          highlightedKeywords: ['Hàm số Sin', 'Hàm số Cos', 'Tập xác định', 'Tính tuần hoàn'],
          keyNotes: [
            'Hàm số $y = \\sin x$ và $y = \\cos x$ có tập xác định $D = \\mathbb{R}$ và tập giá trị $T = [-1; 1]$.',
            'Hàm số $y = \\tan x$ tuần hoàn với chu kỳ $T = \\pi$.',
            'Hàm số $y = \\sin x$ tuần hoàn với chu kỳ $T = 2\\pi$.',
          ],
        },
      ],
      formulas: [
        {
          id: 'f-3-1',
          category: 'Tính chất hàm số',
          name: 'Tính chẵn lẻ của các hàm số lượng giác',
          expressionLatex: '\\sin(-x) = -\\sin(x), \\quad \\cos(-x) = \\cos(x)',
          explanation: 'Hàm số sin(x) là hàm số lẻ (đồ thị đối xứng qua Gốc tọa độ), hàm số cos(x) là hàm số chẵn (đồ thị đối xứng qua trục Tung).',
        },
      ],
      examples: [
        {
          id: 'ex-3-1',
          title: 'Ví dụ 1: Tìm tập xác định của hàm số $y = \\frac{1}{\\cos x - 1}$',
          difficulty: 'Cơ bản',
          problemStatement: 'Tìm tập xác định $D$ của hàm số $y = \\frac{1}{\\cos x - 1}$.',
          steps: [
            {
              stepNumber: 1,
              title: 'Đặt điều kiện mẫu số khác 0',
              content: 'Hàm số xác định $\\iff \\cos x - 1 \\neq 0 \\iff \\cos x \\neq 1$.',
            },
            {
              stepNumber: 2,
              title: 'Giải điều kiện tìm x',
              content: '$\\cos x \\neq 1 \\iff x \\neq k2\\pi \\quad (k \\in \\mathbb{Z})$.',
            },
          ],
          finalAnswer: 'Tập xác định: $D = \\mathbb{R} \\setminus \\{k2\\pi \\mid k \\in \\mathbb{Z}\\}$.',
        },
      ],
    },
    quiz: {
      title: 'Phần 2: Trắc Nghiệm Bài 3',
      description: 'Trắc nghiệm tính chẵn lẻ và tập xác định hàm số lượng giác.',
      totalQuestions: 2,
      passingScorePct: 100,
      questions: [
        {
          id: 'q-3-1',
          number: 1,
          type: 'SINGLE_CHOICE',
          points: 5,
          content: 'Tập xác định của hàm số $y = \\tan(x)$ là:',
          options: [
            { id: 'o-3-1a', content: 'A. $\\mathbb{R} \\setminus \\{\\frac{\\pi}{2} + k\\pi\\}$', isCorrect: true },
            { id: 'o-3-1b', content: 'B. $\\mathbb{R} \\setminus \\{k\\pi\\}$' },
            { id: 'o-3-1c', content: 'C. $\\mathbb{R}$' },
            { id: 'o-3-1d', content: 'D. $[-1; 1]$' },
          ],
          explain: 'Hàm số $y = \\tan(x) = \\frac{\\sin x}{\\cos x}$ xác định khi $\\cos x \\neq 0 \\iff x \\neq \\frac{\\pi}{2} + k\\pi$.',
        },
        {
          id: 'q-3-2',
          number: 2,
          type: 'SINGLE_CHOICE',
          points: 5,
          content: 'Hàm số nào sau đây là hàm số CHẴN?',
          options: [
            { id: 'o-3-2a', content: 'A. $y = \\cos(x)$', isCorrect: true },
            { id: 'o-3-2b', content: 'B. $y = \\sin(x)$' },
            { id: 'o-3-2c', content: 'C. $y = \\tan(x)$' },
            { id: 'o-3-2d', content: 'D. $y = \\cot(x)$' },
          ],
          explain: 'Vì $\\cos(-x) = \\cos(x)$ với mọi $x \\in \\mathbb{R}$ nên $y = \\cos(x)$ là hàm số chẵn.',
        },
      ],
    },
    essay: {
      title: 'Phần 3: Tự Luận Bài 3',
      description: 'Xét tính chẵn lẻ và tìm giá trị lớn nhất, nhỏ nhất.',
      problems: [
        {
          id: 'ess-3-1',
          number: 1,
          title: 'Bài tập 1: Tìm giá trị lớn nhất và nhỏ nhất',
          difficulty: 'Cơ bản',
          problemStatement: 'Tìm giá trị lớn nhất $M$ và nhỏ nhất $m$ của hàm số $y = 3\\sin(x) - 2$.',
          hints: ['Tập giá trị của sin(x) là [-1; 1]', 'Nhân cả 3 vế với 3 rồi trừ cho 2'],
          sampleSolution: 'Ta có $-1 \\le \\sin(x) \\le 1 \\implies -3 \\le 3\\sin(x) \\le 3 \\implies -5 \\le 3\\sin(x) - 2 \\le 1$.\nDo đó giá trị lớn nhất $M = 1$ và nhỏ nhất $m = -5$.',
          maxPoints: 10,
        },
      ],
    },
    exam: {
      title: 'Phần 4: Kiểm Tra Bài 3',
      description: 'Đánh giá kiến thức về khảo sát hàm số lượng giác.',
      examConfig: {
        examId: 'ex-ls-03',
        title: 'Kiểm tra Bài 3',
        durationMins: 10,
        totalQuestions: 2,
        maxScore: 10,
        passingScore: 5,
        questions: [
          {
            id: 'ex-q-3-1',
            number: 1,
            type: 'SINGLE_CHOICE',
            points: 5,
            content: 'Chu kỳ của hàm số $y = \\cos(x)$ là:',
            options: [
              { id: 'ex-o-3-1a', content: 'A. $2\\pi$', isCorrect: true },
              { id: 'ex-o-3-1b', content: 'B. $\\pi$' },
              { id: 'ex-o-3-1c', content: 'C. $\\frac{\\pi}{2}$' },
              { id: 'ex-o-3-1d', content: 'D. $4\\pi$' },
            ],
            explain: 'Hàm số $y = \\cos(x)$ tuần hoàn với chu kỳ cơ sở $T = 2\\pi$.',
          },
          {
            id: 'ex-q-3-2',
            number: 2,
            type: 'SINGLE_CHOICE',
            points: 5,
            content: 'Tập giá trị của hàm số $y = 2\\sin(x) + 1$ là:',
            options: [
              { id: 'ex-o-3-2a', content: 'A. $[-1; 3]$', isCorrect: true },
              { id: 'ex-o-3-2b', content: 'B. $[-2; 2]$' },
              { id: 'ex-o-3-2c', content: 'C. $[0; 3]$' },
              { id: 'ex-o-3-2d', content: 'D. $[-1; 1]$' },
            ],
            explain: 'Vì $-1 \\le \\sin x \\le 1 \\implies -2 \\le 2\\sin x \\le 2 \\implies -1 \\le 2\\sin x + 1 \\le 3$.',
          },
        ],
      },
    },
  },

  // --------------------------------------------------------------------------
  // BÀI 4: Phương trình lượng giác cơ bản
  // --------------------------------------------------------------------------
  'ls-04': {
    lessonId: 'ls-04',
    lessonTitle: 'Bài 4: Phương Trình Lượng Giác Cơ Bản (Sin, Cos, Tan, Cot)',
    theory: {
      definitions: [
        {
          id: 'def-4-1',
          title: 'Định nghĩa Phương trình lượng giác cơ bản',
          summary: 'Phương trình lượng giác cơ bản có dạng $\\sin x = m$, $\\cos x = m$, $\\tan x = m$, $\\cot x = m$ với $m$ là số thực cho trước.',
          highlightedKeywords: ['Phương trình Sin', 'Phương trình Cos', 'Họ nghiệm k2π'],
        },
      ],
      formulas: [
        {
          id: 'f-4-1',
          category: 'Công thức nghiệm',
          name: 'Nghiệm phương trình Sin(x) = Sin(a)',
          expressionLatex: '\\sin x = \\sin a \\iff \\begin{cases} x = a + k2\\pi \\\\ x = \\pi - a + k2\\pi \\end{cases} \\quad (k \\in \\mathbb{Z})',
          explanation: 'Hai góc bù nhau có sin bằng nhau.',
        },
        {
          id: 'f-4-2',
          category: 'Công thức nghiệm',
          name: 'Nghiệm phương trình Cos(x) = Cos(a)',
          expressionLatex: '\\cos x = \\cos a \\iff x = \\pm a + k2\\pi \\quad (k \\in \\mathbb{Z})',
          explanation: 'Hai góc đối nhau có cos bằng nhau.',
        },
      ],
      examples: [
        {
          id: 'ex-4-1',
          title: 'Ví dụ 1: Giải phương trình $\\sin x = \\frac{1}{2}$',
          difficulty: 'Cơ bản',
          problemStatement: 'Giải phương trình lượng giác $\\sin x = \\frac{1}{2}$.',
          steps: [
            {
              stepNumber: 1,
              title: 'Đổi giá trị m sang góc lượng giác',
              content: 'Nhận thấy $\\frac{1}{2} = \\sin\\left(\\frac{\\pi}{6}\\right)$. Phương trình trở thành $\\sin x = \\sin\\left(\\frac{\\pi}{6}\\right)$.',
            },
            {
              stepNumber: 2,
              title: 'Áp dụng công thức nghiệm',
              content: '$\\begin{cases} x = \\frac{\\pi}{6} + k2\\pi \\\\ x = \\pi - \\frac{\\pi}{6} + k2\\pi = \\frac{5\\pi}{6} + k2\\pi \\end{cases} \\quad (k \\in \\mathbb{Z})$.',
            },
          ],
          finalAnswer: 'Nghiệm: $x = \\frac{\\pi}{6} + k2\\pi$ hoặc $x = \\frac{5\\pi}{6} + k2\\pi \\quad (k \\in \\mathbb{Z})$.',
        },
      ],
    },
    quiz: {
      title: 'Phần 2: Trắc Nghiệm Bài 4',
      description: 'Luyện tập tìm họ nghiệm phương trình cơ bản.',
      totalQuestions: 2,
      passingScorePct: 100,
      questions: [
        {
          id: 'q-4-1',
          number: 1,
          type: 'SINGLE_CHOICE',
          points: 5,
          content: 'Nghiệm của phương trình $\\cos(x) = 1$ là:',
          options: [
            { id: 'o-4-1a', content: 'A. $x = k2\\pi$', isCorrect: true },
            { id: 'o-4-1b', content: 'B. $x = \\pi + k2\\pi$' },
            { id: 'o-4-1c', content: 'C. $x = \\frac{\\pi}{2} + k\\pi$' },
            { id: 'o-4-1d', content: 'D. $x = k\\pi$' },
          ],
          explain: 'Điểm biểu diễn góc có $\\cos = 1$ là gốc điểm $A(1;0)$ ứng với góc $k2\\pi$.',
        },
        {
          id: 'q-4-2',
          number: 2,
          type: 'SINGLE_CHOICE',
          points: 5,
          content: 'Nghiệm của phương trình $\\tan(x) = \\sqrt{3}$ là:',
          options: [
            { id: 'o-4-2a', content: 'A. $x = \\frac{\\pi}{3} + k\\pi$', isCorrect: true },
            { id: 'o-4-2b', content: 'B. $x = \\frac{\\pi}{6} + k\\pi$' },
            { id: 'o-4-2c', content: 'C. $x = \\frac{\\pi}{3} + k2\\pi$' },
            { id: 'o-4-2d', content: 'D. $x = -\\frac{\\pi}{3} + k\\pi$' },
          ],
          explain: 'Vì $\\sqrt{3} = \\tan(\\pi/3)$ nên nghiệm là $x = \\frac{\\pi}{3} + k\\pi$.',
        },
      ],
    },
    essay: {
      title: 'Phần 3: Tự Luận Bài 4',
      description: 'Giải phương trình lượng giác chứa góc phức hợp.',
      problems: [
        {
          id: 'ess-4-1',
          number: 1,
          title: 'Bài tập 1: Giải phương trình $\\cos(2x + \\pi/3) = 1/2$',
          difficulty: 'Trung bình',
          problemStatement: 'Giải phương trình $\\cos\\left(2x + \\frac{\\pi}{3}\\right) = \\frac{1}{2}$.',
          hints: ['1/2 = cos(π/3)', 'Áp dụng công thức cos u = cos v ⇔ u = ±v + k2π'],
          sampleSolution: '$\\cos\\left(2x + \\frac{\\pi}{3}\\right) = \\cos\\left(\\frac{\\pi}{3}\\right) \\iff 2x + \\frac{\\pi}{3} = \\pm \\frac{\\pi}{3} + k2\\pi$.\n• TH1: $2x + \\frac{\\pi}{3} = \\frac{\\pi}{3} + k2\\pi \\iff x = k\\pi$.\n• TH2: $2x + \\frac{\\pi}{3} = -\\frac{\\pi}{3} + k2\\pi \\iff x = -\\frac{\\pi}{3} + k\\pi$.',
          maxPoints: 10,
        },
      ],
    },
    exam: {
      title: 'Phần 4: Kiểm Tra Bài 4',
      description: 'Đánh giá kỹ năng giải phương trình cơ bản.',
      examConfig: {
        examId: 'ex-ls-04',
        title: 'Kiểm tra Bài 4',
        durationMins: 10,
        totalQuestions: 2,
        maxScore: 10,
        passingScore: 5,
        questions: [
          {
            id: 'ex-q-4-1',
            number: 1,
            type: 'SINGLE_CHOICE',
            points: 5,
            content: 'Giải phương trình $\\tan(x) = 1$:',
            options: [
              { id: 'ex-o-4-1a', content: 'A. $x = \\frac{\\pi}{4} + k\\pi$', isCorrect: true },
              { id: 'ex-o-4-1b', content: 'B. $x = \\frac{\\pi}{4} + k2\\pi$' },
              { id: 'ex-o-4-1c', content: 'C. $x = -\\frac{\\pi}{4} + k\\pi$' },
              { id: 'ex-o-4-1d', content: 'D. $x = k\\pi$' },
            ],
            explain: '$\\tan(x) = 1 = \\tan(\\pi/4) \\iff x = \\frac{\\pi}{4} + k\\pi$.',
          },
          {
            id: 'ex-q-4-2',
            number: 2,
            type: 'SINGLE_CHOICE',
            points: 5,
            content: 'Phương trình $\\sin(x) = m$ VÔ NGHIỆM khi nào?',
            options: [
              { id: 'ex-o-4-2a', content: 'A. $|m| > 1$', isCorrect: true },
              { id: 'ex-o-4-2b', content: 'B. $-1 \\le m \\le 1$' },
              { id: 'ex-o-4-2c', content: 'C. $m > 0$' },
              { id: 'ex-o-4-2d', content: 'D. $m = 0$' },
            ],
            explain: 'Vì tập giá trị của $\\sin(x)$ là $[-1; 1]$ nên $|m| > 1$ phương trình vô nghiệm.',
          },
        ],
      },
    },
  },

  // --------------------------------------------------------------------------
  // BÀI 5: Phương trình lượng giác thường gặp
  // --------------------------------------------------------------------------
  'ls-05': {
    lessonId: 'ls-05',
    lessonTitle: 'Bài 5: Các Dạng Phương Trình Lượng Giác Thường Gặp',
    theory: {
      definitions: [
        {
          id: 'def-5-1',
          title: 'Phương trình bậc hai đối với một hàm số lượng giác',
          summary: 'Dạng tổng quát $a\\cdot f^2(x) + b\\cdot f(x) + c = 0$ với $f(x)$ là một trong các hàm số $\\sin x, \\cos x, \\tan x, \\cot x$. Đặt ẩn phụ $t = f(x)$ để đưa về phương trình bậc hai đại số.',
          highlightedKeywords: ['Phương trình bậc hai', 'Đặt ẩn phụ', 'Điều kiện nghiệm t'],
        },
      ],
      formulas: [
        {
          id: 'f-5-1',
          category: 'Phương trình cổ điển',
          name: 'Điều kiện có nghiệm của a*sin(x) + b*cos(x) = c',
          expressionLatex: 'a^2 + b^2 \\ge c^2',
          explanation: 'Chia cả hai vế cho $\\sqrt{a^2 + b^2}$ để đưa về dạng phương trình cơ bản.',
        },
      ],
      examples: [
        {
          id: 'ex-5-1',
          title: 'Ví dụ 1: Giải phương trình $2\\sin^2 x - 3\\sin x + 1 = 0$',
          difficulty: 'Trung bình',
          problemStatement: 'Giải phương trình $2\\sin^2 x - 3\\sin x + 1 = 0$.',
          steps: [
            {
              stepNumber: 1,
              title: 'Đặt ẩn phụ t = sin x',
              content: 'Đặt $t = \\sin x$ (Điều kiện $-1 \\le t \\le 1$). Phương trình trở thành $2t^2 - 3t + 1 = 0$.',
            },
            {
              stepNumber: 2,
              title: 'Giải phương trình đại số tìm t',
              content: 'Ta có nghiệm $t = 1$ (Thỏa mãn) và $t = \\frac{1}{2}$ (Thỏa mãn).',
            },
            {
              stepNumber: 3,
              title: 'Trả ẩn x và áp dụng phương trình cơ bản',
              content: '• Với $t = 1 \\implies \\sin x = 1 \\iff x = \\frac{\\pi}{2} + k2\\pi$.\n• Với $t = 1/2 \\implies \\sin x = 1/2 \\iff x = \\frac{\\pi}{6} + k2\\pi$ hoặc $x = \\frac{5\\pi}{6} + k2\\pi$.',
            },
          ],
          finalAnswer: 'Nghiệm phương trình: $x = \\frac{\\pi}{2} + k2\\pi, x = \\frac{\\pi}{6} + k2\\pi, x = \\frac{5\\pi}{6} + k2\\pi \\quad (k \\in \\mathbb{Z})$.',
        },
      ],
    },
    quiz: {
      title: 'Phần 2: Trắc Nghiệm Bài 5',
      description: 'Luyện tập nhận dạng điều kiện có nghiệm của phương trình.',
      totalQuestions: 2,
      passingScorePct: 100,
      questions: [
        {
          id: 'q-5-1',
          number: 1,
          type: 'SINGLE_CHOICE',
          points: 5,
          content: 'Điều kiện để phương trình $\\sin x + \\cos x = m$ có nghiệm là:',
          options: [
            { id: 'o-5-1a', content: 'A. $-\\sqrt{2} \\le m \\le \\sqrt{2}$', isCorrect: true },
            { id: 'o-5-1b', content: 'B. $-1 \\le m \\le 1$' },
            { id: 'o-5-1c', content: 'C. $m \\ge \\sqrt{2}$' },
            { id: 'o-5-1d', content: 'D. $m \\le 2$' },
          ],
          explain: 'Áp dụng $a^2 + b^2 \\ge c^2$ cho $1^2 + 1^2 \\ge m^2 \\iff m^2 \\le 2 \\iff -\\sqrt{2} \\le m \\le \\sqrt{2}$.',
        },
        {
          id: 'q-5-2',
          number: 2,
          type: 'SINGLE_CHOICE',
          points: 5,
          content: 'Nghiệm của phương trình $2\\cos^2(x) - \\cos(x) = 0$ là:',
          options: [
            { id: 'o-5-2a', content: 'A. $x = \\frac{\\pi}{2} + k\\pi$ hoặc $x = \\pm \\frac{\\pi}{3} + k2\\pi$', isCorrect: true },
            { id: 'o-5-2b', content: 'B. $x = k\\pi$' },
            { id: 'o-5-2c', content: 'C. $x = \\frac{\\pi}{3} + k2\\pi$' },
            { id: 'o-5-2d', content: 'D. Vô nghiệm' },
          ],
          explain: '$\\cos x(2\\cos x - 1) = 0 \\iff \\cos x = 0$ hoặc $\\cos x = 1/2$.',
        },
      ],
    },
    essay: {
      title: 'Phần 3: Tự Luận Bài 5',
      description: 'Giải phương trình cổ điển a*sin(x) + b*cos(x) = c.',
      problems: [
        {
          id: 'ess-5-1',
          number: 1,
          title: 'Bài tập 1: Giải phương trình $\\sqrt{3}\\sin x + \\cos x = \\sqrt{2}$',
          difficulty: 'Nâng cao',
          problemStatement: 'Giải phương trình $\\sqrt{3}\\sin x + \\cos x = \\sqrt{2}$.',
          hints: ['Chia cả 2 vế cho √(a² + b²) = 2', 'Đưa vế trái về dạng sin(x + π/6)'],
          sampleSolution: 'Chia cả hai vế cho $\\sqrt{(\\sqrt{3})^2 + 1^2} = 2$:\n$\\frac{\\sqrt{3}}{2}\\sin x + \\frac{1}{2}\\cos x = \\frac{\\sqrt{2}}{2} \\iff \\sin x \\cos\\left(\\frac{\\pi}{6}\\right) + \\cos x \\sin\\left(\\frac{\\pi}{6}\\right) = \\frac{\\sqrt{2}}{2}$\n$\\iff \\sin\\left(x + \\frac{\\pi}{6}\\right) = \\sin\\left(\\frac{\\pi}{4}\\right)$.\n• $x + \\frac{\\pi}{6} = \\frac{\\pi}{4} + k2\\pi \\iff x = \\frac{\\pi}{12} + k2\\pi$.\n• $x + \\frac{\\pi}{6} = \\pi - \\frac{\\pi}{4} + k2\\pi \\iff x = \\frac{7\\pi}{12} + k2\\pi$.',
          maxPoints: 10,
        },
      ],
    },
    exam: {
      title: 'Phần 4: Kiểm Tra Bài 5',
      description: 'Đánh giá khả năng giải phương trình bậc hai lượng giác.',
      examConfig: {
        examId: 'ex-ls-05',
        title: 'Kiểm tra Bài 5',
        durationMins: 10,
        totalQuestions: 2,
        maxScore: 10,
        passingScore: 5,
        questions: [
          {
            id: 'ex-q-5-1',
            number: 1,
            type: 'SINGLE_CHOICE',
            points: 5,
            content: 'Nghiệm của $\\cos^2 x - 1 = 0$ là:',
            options: [
              { id: 'ex-o-5-1a', content: 'A. $x = k\\pi$', isCorrect: true },
              { id: 'ex-o-5-1b', content: 'B. $x = k2\\pi$' },
              { id: 'ex-o-5-1c', content: 'C. $x = \\frac{\\pi}{2} + k\\pi$' },
              { id: 'ex-o-5-1d', content: 'D. $x = \\frac{\\pi}{4} + k\\pi$' },
            ],
            explain: '$\\cos^2 x = 1 \\iff \\sin^2 x = 0 \\iff \\sin x = 0 \\iff x = k\\pi$.',
          },
          {
            id: 'ex-q-5-2',
            number: 2,
            type: 'SINGLE_CHOICE',
            points: 5,
            content: 'Giải phương trình $\\tan^2(x) - 3 = 0$:',
            options: [
              { id: 'ex-o-5-2a', content: 'A. $x = \\pm \\frac{\\pi}{3} + k\\pi$', isCorrect: true },
              { id: 'ex-o-5-2b', content: 'B. $x = \\frac{\\pi}{6} + k\\pi$' },
              { id: 'ex-o-5-2c', content: 'C. $x = \\pm \\frac{\\pi}{6} + k\\pi$' },
              { id: 'ex-o-5-2d', content: 'D. Vô nghiệm' },
            ],
            explain: '$\\tan^2 x = 3 \\iff \\tan x = \\pm \\sqrt{3} \\iff x = \\pm \\frac{\\pi}{3} + k\\pi$.',
          },
        ],
      },
    },
  },

  // --------------------------------------------------------------------------
  // BÀI 6: Ôn tập tổng hợp & Ứng dụng lượng giác thực tế
  // --------------------------------------------------------------------------
  'ls-06': {
    lessonId: 'ls-06',
    lessonTitle: 'Bài 6: Ôn Tập Chương 1 & Ứng Dụng Thực Tế Lượng Giác',
    theory: {
      definitions: [
        {
          id: 'def-6-1',
          title: 'Tổng quan Lượng giác trong Đời sống & Kỹ thuật',
          summary: 'Các hàm số lượng giác được ứng dụng rộng rãi trong mô hình hóa hiện tượng tuần hoàn như chu kỳ thủy triều, dao động điều hòa của con lắc, âm thanh, ánh sáng và thiết kế sóng vô tuyến.',
          highlightedKeywords: ['Dao động điều hòa', 'Thủy triều', 'Sóng vô tuyến', 'Ứng dụng thực tế'],
        },
      ],
      formulas: [
        {
          id: 'f-6-1',
          category: 'Mô hình vật lý',
          name: 'Phương trình dao động điều hòa',
          expressionLatex: 'x(t) = A \\cdot \\cos(\\omega t + \\varphi)',
          explanation: 'A là biên độ dao động, ω là tần số góc, φ là pha ban đầu.',
        },
      ],
      examples: [
        {
          id: 'ex-6-1',
          title: 'Ví dụ 1: Mô hình mực nước biển theo giờ',
          difficulty: 'Trung bình',
          problemStatement: 'Mực nước h (mét) tại một cảng biển được mô hình hóa bởi $h(t) = 3\\cos\\left(\\frac{\\pi t}{6}\\right) + 8$ (với $t$ là số giờ tính từ 0h). Tìm độ cao mực nước biển lớn nhất.',
          steps: [
            {
              stepNumber: 1,
              title: 'Khảo sát tập giá trị hàm Cos',
              content: 'Ta có $-1 \\le \\cos\\left(\\frac{\\pi t}{6}\\right) \\le 1$.',
            },
            {
              stepNumber: 2,
              title: 'Tính độ cao lớn nhất',
              content: '$h(t) \\le 3(1) + 8 = 11$ mét.',
            },
          ],
          finalAnswer: 'Độ cao mực nước lớn nhất là $11$ mét khi $t = 0$ hoặc $t = 12$ giờ.',
        },
      ],
    },
    quiz: {
      title: 'Phần 2: Trắc Nghiệm Ôn Tập Bài 6',
      description: 'Bộ câu hỏi ôn tập tổng hợp toàn chương.',
      totalQuestions: 2,
      passingScorePct: 100,
      questions: [
        {
          id: 'q-6-1',
          number: 1,
          type: 'SINGLE_CHOICE',
          points: 5,
          content: 'Biên độ của dao động $x(t) = 5\\cos(2t)$ bằng:',
          options: [
            { id: 'o-6-1a', content: 'A. 5', isCorrect: true },
            { id: 'o-6-1b', content: 'B. 2' },
            { id: 'o-6-1c', content: 'C. 10' },
            { id: 'o-6-1d', content: 'D. 2.5' },
          ],
          explain: 'Trong phương trình dao động $x(t) = A\\cos(\\omega t + \\varphi)$, biên độ dao động chính là $A = 5$.',
        },
        {
          id: 'q-6-2',
          number: 2,
          type: 'SINGLE_CHOICE',
          points: 5,
          content: 'Thời gian để con lắc hoàn thành 1 chu kỳ dao động ứng với:',
          options: [
            { id: 'o-6-2a', content: 'A. $T = \\frac{2\\pi}{\\omega}$', isCorrect: true },
            { id: 'o-6-2b', content: 'B. $T = \\pi \\omega$' },
            { id: 'o-6-2c', content: 'C. $T = \\omega^2$' },
            { id: 'o-6-2d', content: 'D. $T = \\frac{\\omega}{2\\pi}$' },
          ],
          explain: 'Chu kỳ dao động điều hòa được xác định theo công thức $T = \\frac{2\\pi}{\\omega}$.',
        },
      ],
    },
    essay: {
      title: 'Phần 3: Bài Tập Tự Luận Tổng Hợp Bài 6',
      description: 'Giải bài toán ứng dụng thực tế theo thời gian.',
      problems: [
        {
          id: 'ess-6-1',
          number: 1,
          title: 'Bài tập 1: Xác định thời điểm mực nước đạt 9.5 mét',
          difficulty: 'Nâng cao',
          problemStatement: 'Cho $h(t) = 3\\cos\\left(\\frac{\\pi t}{6}\\right) + 8$. Tìm thời điểm $t$ ($0 \\le t \\le 24$) để mực nước $h = 9.5$m.',
          hints: ['Giải phương trình 3cos(πt/6) + 8 = 9.5', 'Suy ra cos(πt/6) = 0.5 = cos(π/3)'],
          sampleSolution: '$3\\cos\\left(\\frac{\\pi t}{6}\\right) + 8 = 9.5 \\iff \\cos\\left(\\frac{\\pi t}{6}\\right) = 0.5 = \\cos\\left(\\frac{\\pi}{3}\\right)$.\n$\\iff \\frac{\\pi t}{6} = \\pm \\frac{\\pi}{3} + k2\\pi \\iff t = \\pm 2 + 12k$.\nTrong khoảng $0 \\le t \\le 24$, ta có $t = 2$h, $t = 10$h, $t = 14$h, $t = 22$h.',
          maxPoints: 10,
        },
      ],
    },
    exam: {
      title: 'Phần 4: Bài Kiểm Tra Tổng Hợp Chương 1',
      description: 'Đề kiểm tra đánh giá toàn bộ Chương 1.',
      examConfig: {
        examId: 'ex-ls-06',
        title: 'Đề kiểm tra Tổng hợp Chương 1',
        durationMins: 15,
        totalQuestions: 2,
        maxScore: 10,
        passingScore: 5,
        questions: [
          {
            id: 'ex-q-6-1',
            number: 1,
            type: 'SINGLE_CHOICE',
            points: 5,
            content: 'Nghiệm tổng quát của phương trình $\\sin x = 0$ là:',
            options: [
              { id: 'ex-o-6-1a', content: 'A. $x = k\\pi$', isCorrect: true },
              { id: 'ex-o-6-1b', content: 'B. $x = k2\\pi$' },
              { id: 'ex-o-6-1c', content: 'C. $x = \\frac{\\pi}{2} + k\\pi$' },
              { id: 'ex-o-6-1d', content: 'D. $x = \\frac{\\pi}{2} + k2\\pi$' },
            ],
            explain: '$\\sin x = 0 \\iff x = k\\pi \\quad (k \\in \\mathbb{Z})$.',
          },
          {
            id: 'ex-q-6-2',
            number: 2,
            type: 'SINGLE_CHOICE',
            points: 5,
            content: 'Giá trị nhỏ nhất của mực nước $h(t) = 3\\cos\\left(\\frac{\\pi t}{6}\\right) + 8$ là:',
            options: [
              { id: 'ex-o-6-2a', content: 'A. 5 mét', isCorrect: true },
              { id: 'ex-o-6-2b', content: 'B. 8 mét' },
              { id: 'ex-o-6-2c', content: 'C. 3 mét' },
              { id: 'ex-o-6-2d', content: 'D. 11 mét' },
            ],
            explain: 'Mực nước nhỏ nhất khi $\\cos\\left(\\frac{\\pi t}{6}\\right) = -1 \\implies h = 3(-1) + 8 = 5$ mét.',
          },
        ],
      },
    },
  },
};
