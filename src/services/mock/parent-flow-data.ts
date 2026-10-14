// Dữ liệu mô phỏng nghiệp vụ Quản lý Phụ huynh chuẩn GDPT 2018 (Thông tư 22/2021/TT-BGDĐT)

export interface GdptSubjectScore {
  id: string;
  subjectName: string;
  category: 'SCORE_EVALUATED' | 'COMMENT_EVALUATED'; // Đánh giá điểm số kết hợp nhận xét HOẶC chỉ nhận xét
  ddgTx: number[]; // Điểm đánh giá thường xuyên (miệng, 15 phút)
  ddgGk: number | null; // Điểm đánh giá giữa kỳ
  ddgCk: number | null; // Điểm đánh giá cuối kỳ
  dtbMhk: number | null; // Điểm trung bình môn học kỳ
  evaluationResult: 'TỐT' | 'KHÁ' | 'ĐẠT' | 'CHƯA ĐẠT' | 'ĐẠT (Đ)' | 'CHƯA ĐẠT (CĐ)';
  teacherName: string;
  teacherComment: string;
}

export interface GdptQualityAssessment {
  qualityName: string; // Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm
  level: 'TỐT' | 'KHÁ' | 'ĐẠT' | 'CẦN CỐ GẮNG';
  description: string;
}

export interface GdptCompetencyAssessment {
  competencyName: string; // Tự chủ và tự học, Giao tiếp và hợp tác, Giải quyết vấn đề và sáng tạo
  level: 'TỐT' | 'KHÁ' | 'ĐẠT';
  description: string;
}

export interface ChildAcademicReport {
  studentId: string;
  academicYear: string;
  semester: string;
  overallScore: number;
  learningResult: 'TỐT' | 'KHÁ' | 'ĐẠT' | 'CHƯA ĐẠT'; // Chuẩn GDPT 2018
  conductResult: 'TỐT' | 'KHÁ' | 'ĐẠT' | 'CHƯA ĐẠT'; // Rèn luyện
  awardTitle: string; // Học sinh Xuất sắc / Học sinh Giỏi
  rankInClass: number;
  totalStudents: number;
  attendanceRate: number;
  totalAbsences: number;
  homeroomTeacher: {
    name: string;
    phone: string;
    comment: string;
  };
  subjects: GdptSubjectScore[];
  qualities: GdptQualityAssessment[];
  competencies: GdptCompetencyAssessment[];
}

export interface TimetableSlot {
  id: string;
  dayOfWeek: number; // 2 -> 7 (Thứ 2 đến Thứ 7)
  period: number; // Tiết 1 -> 8 (1-5: Sáng, 6-8: Chiều)
  timeRange: string;
  subjectName: string;
  teacherName: string;
  room: string;
  isOnline?: boolean;
  meetingUrl?: string;
  attendanceStatus: 'PRESENT' | 'LATE' | 'EXCUSED_ABSENCE' | 'UPCOMING';
}

export interface TuitionItem {
  id: string;
  code: string;
  studentId: string;
  title: string;
  category: 'HỌC PHÍ' | 'BÁN TRÚ' | 'BHYT & CƠ SỞ VẬT CHẤT' | 'DỊCH VỤ' | 'KỸ NĂNG & NÂNG CAO';
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID';
  paidAt?: string;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  details: { label: string; amount: number }[];
}

// Báo cáo học tập GDPT 2018 cho 2 con
export const MOCK_GDPT_REPORTS: Record<string, ChildAcademicReport> = {
  'child-01': {
    studentId: 'child-01',
    academicYear: '2025 - 2026',
    semester: 'Học kỳ I',
    overallScore: 9.2,
    learningResult: 'TỐT',
    conductResult: 'TỐT',
    awardTitle: 'Học Sinh Xuất Sắc',
    rankInClass: 2,
    totalStudents: 38,
    attendanceRate: 98.5,
    totalAbsences: 1,
    homeroomTeacher: {
      name: 'ThS. Nguyễn Văn Hùng',
      phone: '0988.123.456',
      comment: 'Em Minh có tư duy logic và năng lực học toán, tin học rất xuất sắc. Luôn hăng hái phát biểu xây dựng bài, có tinh thần tương thân tương ái, giúp đỡ bạn bè cùng tiến bộ.',
    },
    subjects: [
      {
        id: 'sub-toan',
        subjectName: 'Toán học',
        category: 'SCORE_EVALUATED',
        ddgTx: [9.5, 10.0, 9.0],
        ddgGk: 9.5,
        ddgCk: 9.5,
        dtbMhk: 9.5,
        evaluationResult: 'TỐT',
        teacherName: 'ThS. Nguyễn Văn Hùng',
        teacherComment: 'Nắm rất vững bản chất bài toán phân loại và hình học không gian.',
      },
      {
        id: 'sub-tin',
        subjectName: 'Tin học (Chuyên đề lập trình C++)',
        category: 'SCORE_EVALUATED',
        ddgTx: [10.0, 10.0],
        ddgGk: 10.0,
        ddgCk: 10.0,
        dtbMhk: 10.0,
        evaluationResult: 'TỐT',
        teacherName: 'ThS. Trần Kim Thịnh',
        teacherComment: 'Tư duy thuật toán và lập trình giải thuật vượt trội cấp độ khối 11.',
      },
      {
        id: 'sub-ly',
        subjectName: 'Vật lí',
        category: 'SCORE_EVALUATED',
        ddgTx: [9.0, 9.5],
        ddgGk: 9.0,
        ddgCk: 9.5,
        dtbMhk: 9.3,
        evaluationResult: 'TỐT',
        teacherName: 'ThS. Lê Hoàng Long',
        teacherComment: 'Làm tốt bài thi thực hành và các câu hỏi vận dụng cao về dao động cơ.',
      },
      {
        id: 'sub-hoa',
        subjectName: 'Hóa học',
        category: 'SCORE_EVALUATED',
        ddgTx: [8.5, 9.0],
        ddgGk: 8.5,
        ddgCk: 9.0,
        dtbMhk: 8.8,
        evaluationResult: 'TỐT',
        teacherName: 'Cô Vũ Thị Hà',
        teacherComment: 'Hiểu rõ phản ứng hóa học hữu cơ và phương pháp cân bằng electron.',
      },
      {
        id: 'sub-van',
        subjectName: 'Ngữ văn',
        category: 'SCORE_EVALUATED',
        ddgTx: [8.0, 8.5],
        ddgGk: 8.0,
        ddgCk: 8.5,
        dtbMhk: 8.3,
        evaluationResult: 'KHÁ',
        teacherName: 'Cô Đỗ Thùy Trang',
        teacherComment: 'Bài viết có chiều sâu cảm xúc, lập luận nghị luận xã hội gãy gọn.',
      },
      {
        id: 'sub-anh',
        subjectName: 'Tiếng Anh (IELTS Academic)',
        category: 'SCORE_EVALUATED',
        ddgTx: [9.0, 9.5],
        ddgGk: 9.0,
        ddgCk: 9.0,
        dtbMhk: 9.1,
        evaluationResult: 'TỐT',
        teacherName: 'Thầy David Miller & Cô Mai Linh',
        teacherComment: 'Phát âm chuẩn xác, kỹ năng nghe và đọc hiểu đạt mức tương đương IELTS 6.5.',
      },
      {
        id: 'sub-lichsu',
        subjectName: 'Lịch sử',
        category: 'SCORE_EVALUATED',
        ddgTx: [9.0, 8.5],
        ddgGk: 9.0,
        ddgCk: 9.0,
        dtbMhk: 8.9,
        evaluationResult: 'TỐT',
        teacherName: 'Thầy Phạm Thanh Tuấn',
        teacherComment: 'Nắm chắc tiến trình lịch sử hiện đại và có khả năng phân tích sự kiện tốt.',
      },
      {
        id: 'sub-theduc',
        subjectName: 'Giáo dục thể chất (Bóng rổ)',
        category: 'COMMENT_EVALUATED',
        ddgTx: [],
        ddgGk: null,
        ddgCk: null,
        dtbMhk: null,
        evaluationResult: 'ĐẠT (Đ)',
        teacherName: 'Thầy Nguyễn Trọng Hoàng',
        teacherComment: 'Thể lực rất tốt, tinh thần đồng đội cao trong các trận thi đấu bóng rổ.',
      },
      {
        id: 'sub-gdqp',
        subjectName: 'Giáo dục Quốc phòng & An ninh',
        category: 'COMMENT_EVALUATED',
        ddgTx: [],
        ddgGk: null,
        ddgCk: null,
        dtbMhk: null,
        evaluationResult: 'ĐẠT (Đ)',
        teacherName: 'Thượng tá Lê Đình Vinh',
        teacherComment: 'Thực hiện động tác đội ngũ chuẩn xác, nắm chắc kiến thức phòng thủ dân sự.',
      },
      {
        id: 'sub-hdtn',
        subjectName: 'Hoạt động trải nghiệm, hướng nghiệp',
        category: 'COMMENT_EVALUATED',
        ddgTx: [],
        ddgGk: null,
        ddgCk: null,
        dtbMhk: null,
        evaluationResult: 'ĐẠT (Đ)',
        teacherName: 'ThS. Nguyễn Văn Hùng',
        teacherComment: 'Chủ động định hướng ngành Công nghệ thông tin, tích cực dẫn dắt nhóm dự án.',
      },
    ],
    qualities: [
      { qualityName: 'Yêu nước', level: 'TỐT', description: 'Tự hào về truyền thống dân tộc, tích cực tham gia các hoạt động hướng về cội nguồn.' },
      { qualityName: 'Nhân ái', level: 'TỐT', description: 'Biết chia sẻ, nhường nhịn và hỗ trợ các bạn học yếu hơn trong tổ học tập.' },
      { qualityName: 'Chăm chỉ', level: 'TỐT', description: 'Luôn chuẩn bị bài kỹ lưỡng trước khi đến lớp, có ý chí vượt khó vươn lên.' },
      { qualityName: 'Trung thực', level: 'TỐT', description: 'Thẳng thắn, trung thực trong kiểm tra, đánh giá và các mối quan hệ bạn bè.' },
      { qualityName: 'Trách nhiệm', level: 'TỐT', description: 'Hoàn thành tốt nhiệm vụ ban cán sự bộ môn Tin học, giữ gìn tài sản chung của lớp.' },
    ],
    competencies: [
      { competencyName: 'Tự chủ và tự học', level: 'TỐT', description: 'Tự giác lập kế hoạch học tập cá nhân, chủ động tìm tài liệu nghiên cứu chuyên sâu.' },
      { competencyName: 'Giao tiếp và hợp tác', level: 'TỐT', description: 'Lắng nghe tích cực, thuyết trình lưu loát và phối hợp nhóm hiệu quả cao.' },
      { competencyName: 'Giải quyết vấn đề và sáng tạo', level: 'TỐT', description: 'Thường xuyên đề xuất nhiều giải pháp thuật toán mới trong giờ Tin học.' },
    ],
  },

  'child-02': {
    studentId: 'child-02',
    academicYear: '2025 - 2026',
    semester: 'Học kỳ I',
    overallScore: 8.9,
    learningResult: 'TỐT',
    conductResult: 'TỐT',
    awardTitle: 'Học Sinh Giỏi',
    rankInClass: 4,
    totalStudents: 32,
    attendanceRate: 100,
    totalAbsences: 0,
    homeroomTeacher: {
      name: 'Cô Hoàng Minh Thư',
      phone: '0977.890.123',
      comment: 'Em Linh rất chăm ngoan, hòa đồng, năng động trong các hoạt động ngoại khóa. Kỹ năng tiếng Anh vượt trội so với chuẩn lứa tuổi THCS.',
    },
    subjects: [
      {
        id: 'sub-eng-8',
        subjectName: 'Tiếng Anh (Song ngữ Quốc tế)',
        category: 'SCORE_EVALUATED',
        ddgTx: [9.5, 10.0, 9.5],
        ddgGk: 9.8,
        ddgCk: 9.5,
        dtbMhk: 9.6,
        evaluationResult: 'TỐT',
        teacherName: 'Mr. James Wilson & Cô Hoàng Minh Thư',
        teacherComment: 'Giao tiếp phản xạ tiếng Anh tự nhiên, đoạt giải Nhì cuộc thi Hùng biện tiếng Anh cấp trường.',
      },
      {
        id: 'sub-toan-8',
        subjectName: 'Toán học',
        category: 'SCORE_EVALUATED',
        ddgTx: [8.5, 9.0],
        ddgGk: 8.5,
        ddgCk: 8.5,
        dtbMhk: 8.6,
        evaluationResult: 'TỐT',
        teacherName: 'Thầy Phan Bội Châu',
        teacherComment: 'Nắm chắc kiến thức hình học tam giác đồng dạng và hằng đẳng thức đáng nhớ.',
      },
      {
        id: 'sub-van-8',
        subjectName: 'Ngữ văn',
        category: 'SCORE_EVALUATED',
        ddgTx: [8.5, 9.0],
        ddgGk: 8.5,
        ddgCk: 9.0,
        dtbMhk: 8.8,
        evaluationResult: 'TỐT',
        teacherName: 'Cô Lê Thị Kim Dung',
        teacherComment: 'Văn phong trong sáng, giàu hình ảnh, cảm thụ thơ ca sâu sắc.',
      },
      {
        id: 'sub-khtn-8',
        subjectName: 'Khoa học tự nhiên (Lý - Hóa - Sinh)',
        category: 'SCORE_EVALUATED',
        ddgTx: [8.0, 8.5],
        ddgGk: 8.5,
        ddgCk: 8.5,
        dtbMhk: 8.4,
        evaluationResult: 'KHÁ',
        teacherName: 'Thầy Nguyễn Trọng Tấn',
        teacherComment: 'Hăng hái thực hiện các thí nghiệm đo áp suất và phản ứng bazơ.',
      },
      {
        id: 'sub-tin-8',
        subjectName: 'Tin học (Lập trình Scratch & Robotics)',
        category: 'SCORE_EVALUATED',
        ddgTx: [9.0, 9.5],
        ddgGk: 9.0,
        ddgCk: 9.0,
        dtbMhk: 9.1,
        evaluationResult: 'TỐT',
        teacherName: 'Cô Phan Bích Thủy',
        teacherComment: 'Sáng tạo trong lập trình mô phỏng trò chơi giáo dục.',
      },
      {
        id: 'sub-theduc-8',
        subjectName: 'Giáo dục thể chất (Cầu lông)',
        category: 'COMMENT_EVALUATED',
        ddgTx: [],
        ddgGk: null,
        ddgCk: null,
        dtbMhk: null,
        evaluationResult: 'ĐẠT (Đ)',
        teacherName: 'Thầy Trần Quốc Toản',
        teacherComment: 'Nhanh nhẹn, kỹ thuật giao cầu và đập cầu chuẩn xác.',
      },
      {
        id: 'sub-nghethuat-8',
        subjectName: 'Nghệ thuật (Mĩ thuật & Âm nhạc)',
        category: 'COMMENT_EVALUATED',
        ddgTx: [],
        ddgGk: null,
        ddgCk: null,
        dtbMhk: null,
        evaluationResult: 'ĐẠT (Đ)',
        teacherName: 'Cô Mai Quỳnh Anh',
        teacherComment: 'Có cảm thụ thẩm mỹ cao, tranh vẽ phối màu hài hòa và ấn tượng.',
      },
    ],
    qualities: [
      { qualityName: 'Yêu nước', level: 'TỐT', description: 'Yêu quý gia đình, bạn bè và trường lớp.' },
      { qualityName: 'Nhân ái', level: 'TỐT', description: 'Thân thiện, hay giúp đỡ các bạn trong lớp.' },
      { qualityName: 'Chăm chỉ', level: 'TỐT', description: 'Luôn hoàn thành bài tập về nhà đúng hạn.' },
      { qualityName: 'Trung thực', level: 'TỐT', description: 'Thật thà, dũng cảm nhận khuyết điểm.' },
      { qualityName: 'Trách nhiệm', level: 'TỐT', description: 'Là cán sự văn nghệ nhiệt huyết của lớp 8B.' },
    ],
    competencies: [
      { competencyName: 'Tự chủ và tự học', level: 'TỐT', description: 'Chủ động tự đọc sách và tra cứu từ vựng tiếng Anh.' },
      { competencyName: 'Giao tiếp và hợp tác', level: 'TỐT', description: 'Kỹ năng giao tiếp xuất sắc cả tiếng Việt và tiếng Anh.' },
      { competencyName: 'Giải quyết vấn đề và sáng tạo', level: 'TỐT', description: 'Nhiều ý tưởng độc đáo trong các tiết học dự án.' },
    ],
  },
};

// Thời khóa biểu chuẩn GDPT 2018 theo tuần (Thứ 2 đến Thứ 7, Tiết 1-5 Sáng, Tiết 6-8 Chiều)
export const MOCK_GDPT_TIMETABLE: Record<string, TimetableSlot[]> = {
  'child-01': [
    // Thứ 2
    { id: '11a1-t2-1', dayOfWeek: 2, period: 1, timeRange: '07:15 - 08:00', subjectName: 'Chào cờ & Sinh hoạt dưới cờ', teacherName: 'BGH & Đoàn trường', room: 'Sân trường chính', attendanceStatus: 'PRESENT' },
    { id: '11a1-t2-2', dayOfWeek: 2, period: 2, timeRange: '08:05 - 08:50', subjectName: 'Toán học (Giải tích 11)', teacherName: 'ThS. Nguyễn Văn Hùng', room: 'Phòng A302', attendanceStatus: 'PRESENT' },
    { id: '11a1-t2-3', dayOfWeek: 2, period: 3, timeRange: '09:05 - 09:50', subjectName: 'Toán học (Giải tích 11)', teacherName: 'ThS. Nguyễn Văn Hùng', room: 'Phòng A302', attendanceStatus: 'PRESENT' },
    { id: '11a1-t2-4', dayOfWeek: 2, period: 4, timeRange: '09:55 - 10:40', subjectName: 'Vật lí (Dao động điều hòa)', teacherName: 'ThS. Lê Hoàng Long', room: 'Phòng Lab Vật lí 1', attendanceStatus: 'PRESENT' },
    { id: '11a1-t2-5', dayOfWeek: 2, period: 5, timeRange: '10:45 - 11:30', subjectName: 'Ngữ văn (Văn học hiện đại)', teacherName: 'Cô Đỗ Thùy Trang', room: 'Phòng A302', attendanceStatus: 'PRESENT' },
    { id: '11a1-t2-6', dayOfWeek: 2, period: 6, timeRange: '13:30 - 14:15', subjectName: 'Tin học (Chuyên đề thuật toán)', teacherName: 'ThS. Trần Kim Thịnh', room: 'Phòng Máy Tính 3', attendanceStatus: 'PRESENT' },
    { id: '11a1-t2-7', dayOfWeek: 2, period: 7, timeRange: '14:25 - 15:10', subjectName: 'Tin học (Lập trình thực hành)', teacherName: 'ThS. Trần Kim Thịnh', room: 'Phòng Máy Tính 3', attendanceStatus: 'PRESENT' },
    
    // Thứ 3
    { id: '11a1-t3-1', dayOfWeek: 3, period: 1, timeRange: '07:15 - 08:00', subjectName: 'Tiếng Anh (Reading & Writing)', teacherName: 'Cô Mai Linh', room: 'Phòng A302', attendanceStatus: 'PRESENT' },
    { id: '11a1-t3-2', dayOfWeek: 3, period: 2, timeRange: '08:05 - 08:50', subjectName: 'Tiếng Anh (Speaking with Native)', teacherName: 'Mr. David Miller', room: 'Phòng Lab Ngoại ngữ', attendanceStatus: 'PRESENT' },
    { id: '11a1-t3-3', dayOfWeek: 3, period: 3, timeRange: '09:05 - 09:50', subjectName: 'Hóa học (Hóa học hữu cơ)', teacherName: 'Cô Vũ Thị Hà', room: 'Phòng Lab Hóa học', attendanceStatus: 'PRESENT' },
    { id: '11a1-t3-4', dayOfWeek: 3, period: 4, timeRange: '09:55 - 10:40', subjectName: 'Toán học (Hình học không gian)', teacherName: 'ThS. Nguyễn Văn Hùng', room: 'Phòng A302', attendanceStatus: 'PRESENT' },
    { id: '11a1-t3-5', dayOfWeek: 3, period: 5, timeRange: '10:45 - 11:30', subjectName: 'Lịch sử (Kháng chiến chống Pháp)', teacherName: 'Thầy Phạm Thanh Tuấn', room: 'Phòng A302', attendanceStatus: 'PRESENT' },
    { id: '11a1-t3-6', dayOfWeek: 3, period: 6, timeRange: '13:30 - 14:15', subjectName: 'Giáo dục Quốc phòng & An ninh', teacherName: 'Thượng tá Lê Đình Vinh', room: 'Sân huấn luyện QP', attendanceStatus: 'PRESENT' },
    { id: '11a1-t3-7', dayOfWeek: 3, period: 7, timeRange: '14:25 - 15:10', subjectName: 'Giáo dục thể chất (Bóng rổ)', teacherName: 'Thầy Nguyễn Trọng Hoàng', room: 'Nhà thi đấu đa năng', attendanceStatus: 'PRESENT' },

    // Thứ 4
    { id: '11a1-t4-1', dayOfWeek: 4, period: 1, timeRange: '07:15 - 08:00', subjectName: 'Sinh học (Di truyền học)', teacherName: 'Cô Bùi Thị Mai', room: 'Phòng Lab Sinh học', attendanceStatus: 'PRESENT' },
    { id: '11a1-t4-2', dayOfWeek: 4, period: 2, timeRange: '08:05 - 08:50', subjectName: 'Toán học (Luyện đề nâng cao)', teacherName: 'ThS. Nguyễn Văn Hùng', room: 'Phòng A302', attendanceStatus: 'PRESENT' },
    { id: '11a1-t4-3', dayOfWeek: 4, period: 3, timeRange: '09:05 - 09:50', subjectName: 'Ngữ văn (Nghị luận xã hội)', teacherName: 'Cô Đỗ Thùy Trang', room: 'Phòng A302', attendanceStatus: 'PRESENT' },
    { id: '11a1-t4-4', dayOfWeek: 4, period: 4, timeRange: '09:55 - 10:40', subjectName: 'Vật lí (Sóng cơ & Âm học)', teacherName: 'ThS. Lê Hoàng Long', room: 'Phòng Lab Vật lí 1', attendanceStatus: 'PRESENT' },
    { id: '11a1-t4-5', dayOfWeek: 4, period: 5, timeRange: '10:45 - 11:30', subjectName: 'GDKT & Pháp luật', teacherName: 'Cô Trần Thanh Thủy', room: 'Phòng A302', attendanceStatus: 'PRESENT' },

    // Thứ 5
    { id: '11a1-t5-1', dayOfWeek: 5, period: 1, timeRange: '07:15 - 08:00', subjectName: 'Tiếng Anh (IELTS Grammar & Vocab)', teacherName: 'Cô Mai Linh', room: 'Phòng A302', attendanceStatus: 'PRESENT' },
    { id: '11a1-t5-2', dayOfWeek: 5, period: 2, timeRange: '08:05 - 08:50', subjectName: 'Hóa học (Thí nghiệm phản ứng)', teacherName: 'Cô Vũ Thị Hà', room: 'Phòng Lab Hóa học', attendanceStatus: 'EXCUSED_ABSENCE' },
    { id: '11a1-t5-3', dayOfWeek: 5, period: 3, timeRange: '09:05 - 09:50', subjectName: 'Tin học (Cấu trúc dữ liệu)', teacherName: 'ThS. Trần Kim Thịnh', room: 'Phòng Máy Tính 3', attendanceStatus: 'PRESENT' },
    { id: '11a1-t5-4', dayOfWeek: 5, period: 4, timeRange: '09:55 - 10:40', subjectName: 'Hoạt động trải nghiệm hướng nghiệp', teacherName: 'ThS. Nguyễn Văn Hùng', room: 'Hội trường B', attendanceStatus: 'PRESENT' },
    { id: '11a1-t5-5', dayOfWeek: 5, period: 5, timeRange: '10:45 - 11:30', subjectName: 'Địa lí (Địa lí kinh tế thế giới)', teacherName: 'Thầy Đoàn Văn Hậu', room: 'Phòng A302', attendanceStatus: 'PRESENT' },

    // Thứ 6
    { id: '11a1-t6-1', dayOfWeek: 6, period: 1, timeRange: '07:15 - 08:00', subjectName: 'Toán học (Kiểm tra định kỳ 1 tiết)', teacherName: 'ThS. Nguyễn Văn Hùng', room: 'Phòng A302', attendanceStatus: 'UPCOMING' },
    { id: '11a1-t6-2', dayOfWeek: 6, period: 2, timeRange: '08:05 - 08:50', subjectName: 'Ngữ văn (Thực hành làm văn)', teacherName: 'Cô Đỗ Thùy Trang', room: 'Phòng A302', attendanceStatus: 'UPCOMING' },
    { id: '11a1-t6-3', dayOfWeek: 6, period: 3, timeRange: '09:05 - 09:50', subjectName: 'Vật lí (Ôn tập định luật bảo toàn)', teacherName: 'ThS. Lê Hoàng Long', room: 'Phòng A302', attendanceStatus: 'UPCOMING' },
    { id: '11a1-t6-4', dayOfWeek: 6, period: 4, timeRange: '09:55 - 10:40', subjectName: 'Công nghệ (Trí tuệ nhân tạo)', teacherName: 'ThS. Vũ Đức Nam', room: 'Phòng Lab AI & IoT', attendanceStatus: 'UPCOMING' },
    { id: '11a1-t6-5', dayOfWeek: 6, period: 5, timeRange: '10:45 - 11:30', subjectName: 'Sinh hoạt lớp & Đánh giá thi đua', teacherName: 'ThS. Nguyễn Văn Hùng', room: 'Phòng A302', attendanceStatus: 'UPCOMING' },

    // Thứ 7 (Học chuyên đề trực tuyến Schoolify Live)
    { id: '11a1-t7-1', dayOfWeek: 7, period: 1, timeRange: '08:00 - 09:30', subjectName: 'Bồi dưỡng HSG: Số học & Đồ thị (Zoom)', teacherName: 'GS. Lê Tuấn Khang', room: 'Phòng Học Trực Tuyến', isOnline: true, meetingUrl: 'https://schoolify.edu.vn/live/hsg-toan-11', attendanceStatus: 'UPCOMING' },
    { id: '11a1-t7-2', dayOfWeek: 7, period: 2, timeRange: '09:45 - 11:15', subjectName: 'Olympic Tin học: Quy hoạch động (Online)', teacherName: 'ThS. Trần Kim Thịnh', room: 'Phòng Học Trực Tuyến', isOnline: true, meetingUrl: 'https://schoolify.edu.vn/live/olympic-tin-11', attendanceStatus: 'UPCOMING' },
  ],

  'child-02': [
    // Lớp 8B THCS
    { id: '8b-t2-1', dayOfWeek: 2, period: 1, timeRange: '07:30 - 08:15', subjectName: 'Chào cờ đầu tuần', teacherName: 'BGH THCS Archimedes', room: 'Sân cờ Archimedes', attendanceStatus: 'PRESENT' },
    { id: '8b-t2-2', dayOfWeek: 2, period: 2, timeRange: '08:20 - 09:05', subjectName: 'Tiếng Anh Quốc tế (Grammar & Skills)', teacherName: 'Cô Hoàng Minh Thư', room: 'Phòng B201', attendanceStatus: 'PRESENT' },
    { id: '8b-t2-3', dayOfWeek: 2, period: 3, timeRange: '09:20 - 10:05', subjectName: 'Toán học (Đại số 8)', teacherName: 'Thầy Phan Bội Châu', room: 'Phòng B201', attendanceStatus: 'PRESENT' },
    { id: '8b-t2-4', dayOfWeek: 2, period: 4, timeRange: '10:15 - 11:00', subjectName: 'Ngữ văn (Văn bản nhật dụng)', teacherName: 'Cô Lê Thị Kim Dung', room: 'Phòng B201', attendanceStatus: 'PRESENT' },
    { id: '8b-t2-5', dayOfWeek: 2, period: 5, timeRange: '13:30 - 14:15', subjectName: 'Khoa học tự nhiên (Vật lí 8)', teacherName: 'Thầy Nguyễn Trọng Tấn', room: 'Phòng Thực hành KHTN', attendanceStatus: 'PRESENT' },
    { id: '8b-t2-6', dayOfWeek: 2, period: 6, timeRange: '14:25 - 15:10', subjectName: 'Tin học (Robotics VEX IQ)', teacherName: 'Cô Phan Bích Thủy', room: 'Phòng STEM & Robotics', attendanceStatus: 'PRESENT' },

    // Thứ 3
    { id: '8b-t3-1', dayOfWeek: 3, period: 1, timeRange: '07:30 - 08:15', subjectName: 'Toán học (Hình học 8)', teacherName: 'Thầy Phan Bội Châu', room: 'Phòng B201', attendanceStatus: 'PRESENT' },
    { id: '8b-t3-2', dayOfWeek: 3, period: 2, timeRange: '08:20 - 09:05', subjectName: 'Tiếng Anh bản ngữ (ESL Speaking)', teacherName: 'Mr. James Wilson', room: 'Phòng Ngoại ngữ Language Hub', attendanceStatus: 'PRESENT' },
    { id: '8b-t3-3', dayOfWeek: 3, period: 3, timeRange: '09:20 - 10:05', subjectName: 'Lịch sử & Địa lí', teacherName: 'Thầy Ngô Tất Tố', room: 'Phòng B201', attendanceStatus: 'PRESENT' },
    { id: '8b-t3-4', dayOfWeek: 3, period: 4, timeRange: '10:15 - 11:00', subjectName: 'Giáo dục thể chất (Cầu lông)', teacherName: 'Thầy Trần Quốc Toản', room: 'Nhà tập đa năng', attendanceStatus: 'PRESENT' },

    // Thứ 4
    { id: '8b-t4-1', dayOfWeek: 4, period: 1, timeRange: '07:30 - 08:15', subjectName: 'Khoa học tự nhiên (Hóa học 8)', teacherName: 'Thầy Nguyễn Trọng Tấn', room: 'Phòng Thực hành KHTN', attendanceStatus: 'PRESENT' },
    { id: '8b-t4-2', dayOfWeek: 4, period: 2, timeRange: '08:20 - 09:05', subjectName: 'Ngữ văn (Rèn kỹ năng viết)', teacherName: 'Cô Lê Thị Kim Dung', room: 'Phòng B201', attendanceStatus: 'PRESENT' },
    { id: '8b-t4-3', dayOfWeek: 4, period: 3, timeRange: '09:20 - 10:05', subjectName: 'Nghệ thuật (Mĩ thuật sáng tạo)', teacherName: 'Cô Mai Quỳnh Anh', room: 'Phòng Mỹ thuật Art Space', attendanceStatus: 'PRESENT' },
    { id: '8b-t4-4', dayOfWeek: 4, period: 4, timeRange: '10:15 - 11:00', subjectName: 'Giáo dục công dân', teacherName: 'Cô Hoàng Minh Thư', room: 'Phòng B201', attendanceStatus: 'PRESENT' },

    // Thứ 5
    { id: '8b-t5-1', dayOfWeek: 5, period: 1, timeRange: '07:30 - 08:15', subjectName: 'Tiếng Anh (Project Presentation)', teacherName: 'Mr. James Wilson & Cô Thư', room: 'Phòng B201', attendanceStatus: 'PRESENT' },
    { id: '8b-t5-2', dayOfWeek: 5, period: 2, timeRange: '08:20 - 09:05', subjectName: 'Toán học (Luyện tập hằng đẳng thức)', teacherName: 'Thầy Phan Bội Châu', room: 'Phòng B201', attendanceStatus: 'PRESENT' },
    { id: '8b-t5-3', dayOfWeek: 3, period: 3, timeRange: '09:20 - 10:05', subjectName: 'Hoạt động trải nghiệm sáng tạo', teacherName: 'Cô Hoàng Minh Thư', room: 'Thư viện mở Archimedes', attendanceStatus: 'PRESENT' },

    // Thứ 6
    { id: '8b-t6-1', dayOfWeek: 6, period: 1, timeRange: '07:30 - 08:15', subjectName: 'Khoa học tự nhiên (Sinh học 8)', teacherName: 'Thầy Nguyễn Trọng Tấn', room: 'Phòng B201', attendanceStatus: 'UPCOMING' },
    { id: '8b-t6-2', dayOfWeek: 6, period: 2, timeRange: '08:20 - 09:05', subjectName: 'Tiếng Anh (Cambridge Checkpoint Practice)', teacherName: 'Cô Hoàng Minh Thư', room: 'Phòng B201', attendanceStatus: 'UPCOMING' },
    { id: '8b-t6-3', dayOfWeek: 6, period: 3, timeRange: '09:20 - 10:05', subjectName: 'Sinh hoạt lớp & Bình bầu thi đua', teacherName: 'Cô Hoàng Minh Thư', room: 'Phòng B201', attendanceStatus: 'UPCOMING' },
  ],
};

// Khoản thu học phí chi tiết có mã VietQR động chuẩn Napas247 cho từng con
export const MOCK_GDPT_TUITIONS: Record<string, TuitionItem[]> = {
  'child-01': [
    {
      id: 'tui-11a1-01',
      code: 'TUITION-11A1-HK1',
      studentId: 'child-01',
      title: 'Học Phí Chính Khóa Học Kỳ I (Năm học 2025 - 2026)',
      category: 'HỌC PHÍ',
      amount: 3500000,
      dueDate: '15/09/2026',
      status: 'PAID',
      paidAt: '2026-08-15T09:05:30Z',
      bankAccount: {
        bankName: 'VietinBank - Ngân hàng TMCP Công Thương Việt Nam',
        accountNumber: '113000889999',
        accountHolder: 'THPT CHUYEN CONG NGHE SCHOOLIFY',
      },
      details: [
        { label: 'Học phí 5 tháng HK1 (700.000 ₫/tháng)', amount: 3500000 },
      ],
    },
    {
      id: 'tui-11a1-02',
      code: 'TUITION-11A1-CSVC',
      studentId: 'child-01',
      title: 'Quỹ Cơ Sở Vật Chất, Thư Viện Số & Bảo Hiểm Y Tế Bắt Buộc 2026',
      category: 'BHYT & CƠ SỞ VẬT CHẤT',
      amount: 850000,
      dueDate: '25/10/2026',
      status: 'PENDING',
      bankAccount: {
        bankName: 'VietinBank - Ngân hàng TMCP Công Thương Việt Nam',
        accountNumber: '113000889999',
        accountHolder: 'THPT CHUYEN CONG NGHE SCHOOLIFY',
      },
      details: [
        { label: 'Bảo hiểm Y tế học sinh (12 tháng theo quy định)', amount: 680000 },
        { label: 'Quỹ bản quyền thư viện học liệu số Schoolify', amount: 170000 },
      ],
    },
    {
      id: 'tui-11a1-03',
      code: 'TUITION-11A1-OLYMPIC',
      studentId: 'child-01',
      title: 'Khóa Bồi Dưỡng Chuyên Đề Olympic Tin Học & Toán Nâng Cao',
      category: 'KỸ NĂNG & NÂNG CAO',
      amount: 1200000,
      dueDate: '01/11/2026',
      status: 'PENDING',
      bankAccount: {
        bankName: 'VietinBank - Ngân hàng TMCP Công Thương Việt Nam',
        accountNumber: '113000889999',
        accountHolder: 'THPT CHUYEN CONG NGHE SCHOOLIFY',
      },
      details: [
        { label: 'Học liệu chuyên đề C++ nâng cao và tài khoản chấm tự động', amount: 600000 },
        { label: 'Học phí 16 buổi bồi dưỡng chuyên gia', amount: 600000 },
      ],
    },
    {
      id: 'tui-11a1-04',
      code: 'TUITION-11A1-TRAINGHIEM',
      studentId: 'child-01',
      title: 'Hoạt Động Trải Nghiệm Hướng Nghiệp: Chuyến Khảo Sát Doanh Nghiệp Công Nghệ',
      category: 'DỊCH VỤ',
      amount: 650000,
      dueDate: '10/11/2026',
      status: 'PENDING',
      bankAccount: {
        bankName: 'VietinBank - Ngân hàng TMCP Công Thương Việt Nam',
        accountNumber: '113000889999',
        accountHolder: 'THPT CHUYEN CONG NGHE SCHOOLIFY',
      },
      details: [
        { label: 'Xe đưa đón chất lượng cao 2 chiều', amount: 250000 },
        { label: 'Bảo hiểm du lịch và bữa ăn trưa tiêu chuẩn', amount: 250000 },
        { label: 'Tài liệu hướng nghiệp thực tế', amount: 150000 },
      ],
    },
  ],

  'child-02': [
    {
      id: 'tui-8b-01',
      code: 'TUITION-8B-BANTROU',
      studentId: 'child-02',
      title: 'Tiền Ăn Bán Trú & Chăm Sóc Bán Trú Tháng 10/2026',
      category: 'BÁN TRÚ',
      amount: 1450000,
      dueDate: '10/10/2026',
      status: 'PAID',
      paidAt: '2026-10-05T08:20:10Z',
      bankAccount: {
        bankName: 'MBBank - Ngân hàng Quân Đội',
        accountNumber: '0888999666',
        accountHolder: 'THCS ARCHIMEDES SCHOOLIFY',
      },
      details: [
        { label: 'Bữa ăn trưa dinh dưỡng bán trú (22 ngày x 45.000 ₫)', amount: 990000 },
        { label: 'Bữa phụ xế chiều & hoa quả (22 ngày x 15.000 ₫)', amount: 330000 },
        { label: 'Chăm sóc bán trú và điều hòa phòng ngủ', amount: 130000 },
      ],
    },
    {
      id: 'tui-8b-02',
      code: 'TUITION-8B-CAMBRIDGE',
      studentId: 'child-02',
      title: 'Học Phí Chương Trình Song Ngữ Cambridge Học Kỳ I',
      category: 'HỌC PHÍ',
      amount: 6800000,
      dueDate: '20/10/2026',
      status: 'PENDING',
      bankAccount: {
        bankName: 'MBBank - Ngân hàng Quân Đội',
        accountNumber: '0888999666',
        accountHolder: 'THCS ARCHIMEDES SCHOOLIFY',
      },
      details: [
        { label: 'Chương trình giảng dạy giáo viên bản ngữ chuẩn Cambridge', amount: 4800000 },
        { label: 'Bản quyền giáo trình điện tử và tài khoản kiểm tra trực tuyến', amount: 1200000 },
        { label: 'Các hoạt động ngoại khóa Speaking Club & Debate', amount: 800000 },
      ],
    },
    {
      id: 'tui-8b-03',
      code: 'TUITION-8B-BUS',
      studentId: 'child-02',
      title: 'Dịch Vụ Xe Buýt Đưa Đón Học Sinh Tháng 10/2026 (Tuyến 04)',
      category: 'DỊCH VỤ',
      amount: 1200000,
      dueDate: '25/10/2026',
      status: 'PENDING',
      bankAccount: {
        bankName: 'MBBank - Ngân hàng Quân Đội',
        accountNumber: '0888999666',
        accountHolder: 'THCS ARCHIMEDES SCHOOLIFY',
      },
      details: [
        { label: 'Đưa đón 2 chiều tại điểm đón Cầu Giấy (22 ngày)', amount: 1200000 },
      ],
    },
  ],
};
