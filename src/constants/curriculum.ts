export interface SubjectInfo {
  id: string;
  name: string;
  icon?: string;
}

export const AVAILABLE_SUBJECTS: string[] = [
  'Toán học',
  'Ngữ văn',
  'Tiếng Anh',
  'Vật lí',
  'Hóa học',
  'Sinh học',
  'Khoa học tự nhiên',
  'Lịch sử',
  'Địa lí',
  'Lịch sử và Địa lí',
  'Giáo dục công dân',
  'Tin học',
];

export const GRADE_LEVELS = [
  '1', '2', '3', '4', '5',
  '6', '7', '8', '9',
  '10', '11', '12'
] as const;

export type GradeLevel = typeof GRADE_LEVELS[number];

export const GRADE_GROUPS = [
  {
    name: 'THPT (Cấp 3)',
    grades: ['12', '11', '10'] as const,
    description: 'Chương trình trung học phổ thông & Luyện thi tốt nghiệp',
  },
  {
    name: 'THCS (Cấp 2)',
    grades: ['9', '8', '7', '6'] as const,
    description: 'Chương trình trung học cơ sở & Ôn thi vào lớp 10',
  },
  {
    name: 'Tiểu học (Cấp 1)',
    grades: ['5', '4', '3', '2', '1'] as const,
    description: 'Chương trình tiểu học & Phát triển tư duy',
  },
];

export const CURRICULUM_CHAPTERS: Record<string, Record<string, string[]>> = {
  'Toán học': {
    '12': [
      'Chương 1: Khảo sát hàm số & Ứng dụng đạo hàm',
      'Chương 2: Hàm số Mũ và Logarit',
      'Chương 3: Nguyên hàm và Tích phân',
      'Chương 4: Số phức',
      'Chương 5: Khối đa diện và Thể tích',
      'Chương 6: Mặt nón, mặt trụ, mặt cầu',
      'Chương 7: Phương pháp tọa độ trong không gian (Oxyz)',
    ],
    '11': [
      'Chương 1: Hàm số lượng giác và Phương trình lượng giác',
      'Chương 2: Tổ hợp và Xác suất',
      'Chương 3: Dãy số, Cấp số cộng và Cấp số nhân',
      'Chương 4: Giới hạn và Hàm số liên tục',
      'Chương 5: Đạo hàm',
      'Chương 6: Quan hệ song song trong không gian',
      'Chương 7: Quan hệ vuông góc trong không gian',
    ],
    '10': [
      'Chương 1: Mệnh đề và Tập hợp',
      'Chương 2: Bất phương trình và Hệ bất phương trình bậc nhất hai ẩn',
      'Chương 3: Hàm số và Đồ thị',
      'Chương 4: Hệ thức lượng trong tam giác và Vectơ',
      'Chương 5: Phương pháp tọa độ trong mặt phẳng',
    ],
    '9': [
      'Chương 1: Căn bậc hai và Căn bậc ba',
      'Chương 2: Hàm số bậc nhất y = ax + b',
      'Chương 3: Hệ hai phương trình bậc nhất hai ẩn',
      'Chương 4: Hàm số y = ax² và Phương trình bậc hai một ẩn',
      'Chương 5: Hệ thức lượng trong tam giác vuông',
      'Chương 6: Đường tròn và Góc với đường tròn',
    ],
    '8': [
      'Chương 1: Đa thức nhiều biến',
      'Chương 2: Hằng đẳng thức đáng nhớ và Ứng dụng',
      'Chương 3: Phân thức đại số',
      'Chương 4: Phương trình bậc nhất một ẩn',
      'Chương 5: Tam giác đồng dạng và Định lí Thalès',
      'Chương 6: Một số hình khối trong thực tiễn',
    ],
    '7': [
      'Chương 1: Số hữu tỉ',
      'Chương 2: Số thực',
      'Chương 3: Góc và Đường thẳng song song',
      'Chương 4: Tam giác bằng nhau',
      'Chương 5: Biểu thức đại số và Đa thức một biến',
      'Chương 6: Một số yếu tố thống kê và xác suất',
    ],
    '6': [
      'Chương 1: Tập hợp các số tự nhiên',
      'Chương 2: Tính chia hết trong tập hợp các số tự nhiên',
      'Chương 3: Số nguyên',
      'Chương 4: Một số hình phẳng trong thực tiễn',
      'Chương 5: Phân số và Số thập phân',
      'Chương 6: Điểm, đường thẳng và đoạn thẳng',
    ],
    '5': [
      'Chương 1: Ôn tập phân số và Bảng đơn vị đo diện tích',
      'Chương 2: Số thập phân và Các phép tính với số thập phân',
      'Chương 3: Hình tam giác, hình thang, hình tròn',
      'Chương 4: Hình hộp chữ nhật, hình lập phương và Thể tích',
      'Chương 5: Số đo thời gian và Toán chuyển động đều',
    ],
    '4': [
      'Chương 1: Số tự nhiên và Bảng lớp triệu',
      'Chương 2: Bốn phép tính với số tự nhiên',
      'Chương 3: Phân số và Các phép tính với phân số',
      'Chương 4: Hình bình hành và Hình thoi',
      'Chương 5: Dãy số và Bài toán trung bình cộng',
    ],
    '3': [
      'Chương 1: Ôn tập và Bổ sung phép nhân chia (Bảng 6, 7, 8, 9)',
      'Chương 2: Các số trong phạm vi 10.000',
      'Chương 3: Các số trong phạm vi 100.000',
      'Chương 4: Chu vi và Diện tích hình vuông, chữ nhật',
    ],
    '2': [
      'Chương 1: Phép cộng và trừ có nhớ trong phạm vi 20, 100',
      'Chương 2: Bảng nhân và Bảng chia (2 và 5)',
      'Chương 3: Các số trong phạm vi 1.000',
      'Chương 4: Độ dài (dm, m, km) và Khối lượng (kg)',
    ],
    '1': [
      'Chương 1: Các số từ 0 đến 10 và So sánh số',
      'Chương 2: Phép cộng và Phép trừ trong phạm vi 10',
      'Chương 3: Các số trong phạm vi 100',
      'Chương 4: Độ dài và Thời gian đơn giản',
    ],
  },
  'Ngữ văn': {
    '12': [
      'Chương 1: Văn học hiện thực và Văn học cách mạng Việt Nam',
      'Chương 2: Nghị luận văn học (Tác phẩm thơ hiện đại)',
      'Chương 3: Nghị luận văn học (Truyện ngắn và Kí hiện đại)',
      'Chương 4: Nghị luận xã hội (Tư tưởng đạo lí & Hiện tượng đời sống)',
    ],
    '9': [
      'Chương 1: Thơ hiện đại Việt Nam',
      'Chương 2: Truyện hiện đại Việt Nam',
      'Chương 3: Văn bản nhật dụng và Văn bản nghị luận',
      'Chương 4: Tiếng Việt: Các thành phần biệt lập và Khởi ngữ',
    ],
    '5': [
      'Chương 1: Tập đọc và Tìm hiểu đại ý',
      'Chương 2: Luyện từ và câu: Từ đồng nghĩa, trái nghĩa',
      'Chương 3: Tập làm văn: Tả cảnh',
      'Chương 4: Tập làm văn: Tả người',
    ],
  },
  'Vật lí': {
    '12': [
      'Chương 1: Dao động cơ',
      'Chương 2: Sóng cơ và Sóng âm',
      'Chương 3: Dòng điện xoay chiều',
      'Chương 4: Dao động và Sóng điện từ',
      'Chương 5: Sóng ánh sáng',
      'Chương 6: Lượng tử ánh sáng',
      'Chương 7: Hạt nhân nguyên tử',
    ],
    '11': [
      'Chương 1: Dao động điều hòa',
      'Chương 2: Sóng và Giao thoa sóng',
      'Chương 3: Điện trường và Định luật Coulomb',
      'Chương 4: Dòng điện không đổi và Mạch điện',
    ],
    '10': [
      'Chương 1: Mô tả chuyển động và Động học',
      'Chương 2: Động lực học và Các định luật Newton',
      'Chương 3: Năng lượng, Công và Công suất',
    ],
  },
  'Hóa học': {
    '12': [
      'Chương 1: Este - Lipit',
      'Chương 2: Cacbohiđrat',
      'Chương 3: Amin - Amino axit và Protein',
      'Chương 4: Polime và Vật liệu polime',
      'Chương 5: Đại cương về kim loại',
      'Chương 6: Kim loại kiềm, kiềm thổ, nhôm',
      'Chương 7: Sắt và một số kim loại quan trọng',
    ],
    '11': [
      'Chương 1: Cân bằng hóa học',
      'Chương 2: Nitrogen và Sulfur',
      'Chương 3: Đại cương hóa học hữu cơ',
      'Chương 4: Hydrocarbon',
    ],
    '10': [
      'Chương 1: Cấu tạo nguyên tử',
      'Chương 2: Bảng tuần hoàn các nguyên tố hóa học',
      'Chương 3: Liên kết hóa học',
    ],
  },
  'Tiếng Anh': {
    '12': [
      'Unit 1: Life stories & Achievements',
      'Unit 2: Cultural diversity',
      'Unit 3: Ways of socializing',
      'Unit 4: School education system',
      'Unit 5: Higher education',
      'Grammar: Tenses, Passive Voice & Conditionals',
      'Phonetics: Stress & Intonation',
    ],
    '11': [
      'Unit 1: The Generation Gap',
      'Unit 2: Relationships',
      'Unit 3: Becoming Independent',
    ],
    '10': [
      'Unit 1: Family Life',
      'Unit 2: Your Body and You',
      'Unit 3: Music and Arts',
    ],
    '9': [
      'Unit 1: Local Environment',
      'Unit 2: City Life',
      'Unit 3: Teen Stress and Pressure',
    ],
    '5': [
      'Unit 1: What\'s your address?',
      'Unit 2: I always get up early',
      'Unit 3: Where did you go on holiday?',
    ],
  },
  'Sinh học': {
    '12': [
      'Chương 1: Cơ chế di truyền và Biến dị',
      'Chương 2: Tính quy luật của hiện tượng di truyền',
      'Chương 3: Di truyền học quần thể',
      'Chương 4: Ứng dụng di truyền học',
      'Chương 5: Tiến hóa',
      'Chương 6: Sinh thái học và Môi trường',
    ],
    '11': [
      'Chương 1: Trao đổi chất và Chuyển hóa năng lượng',
      'Chương 2: Cảm ứng ở sinh vật',
      'Chương 3: Sinh trưởng và Phát triển',
    ],
    '10': [
      'Chương 1: Giới thiệu thế giới sống',
      'Chương 2: Sinh học tế bào',
      'Chương 3: Vi sinh vật và Virus',
    ],
  },
  'Lịch sử': {
    '12': [
      'Chương 1: Trật tự thế giới mới sau CTTG II (1945 - 2000)',
      'Chương 2: Liên Xô và các nước Đông Âu',
      'Chương 3: Các nước Á, Phi, Mĩ Latinh',
      'Chương 4: Mĩ, Tây Âu, Nhật Bản',
      'Chương 5: Quan hệ quốc tế trong Chiến tranh lạnh',
      'Chương 6: Lịch sử Việt Nam (1919 - 2000)',
    ],
    '11': [
      'Chương 1: Cách mạng tư sản',
      'Chương 2: Chủ nghĩa xã hội từ 1917 đến nay',
    ],
    '10': [
      'Chương 1: Lịch sử và Sử học',
      'Chương 2: Các nền văn minh cổ - trung đại',
    ],
  },
};

export function getChaptersForSubject(subject: string, grade: string): string[] {
  if (CURRICULUM_CHAPTERS[subject]?.[grade]) {
    return CURRICULUM_CHAPTERS[subject][grade];
  }

  // Dự phòng thông minh cho môn học hoặc khối lớp chưa có bảng map chi tiết
  return [
    `Chương 1: Tổng quan kiến thức Lớp ${grade} - Học kỳ 1`,
    `Chương 2: Chuyên đề chuyên sâu Lớp ${grade} - Học kỳ 1`,
    `Chương 3: Trọng tâm kiến thức Lớp ${grade} - Học kỳ 2`,
    `Chương 4: Ôn tập và Luyện giải đề kiểm tra Lớp ${grade}`,
  ];
}
