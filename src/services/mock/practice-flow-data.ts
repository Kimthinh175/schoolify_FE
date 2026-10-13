import { PracticeLevel } from '@/types/subject';
import { generateQuestionsByMatrix } from './question-matrix-engine';
import questionsDb from '@/data/questions-db.json';

export type ExamFormat = 'QUIZ' | 'ESSAY' | 'MIXED';
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';

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

// Bản đồ chương học chuẩn GDPT 2018 cho 12 môn K-12
export const CHAPTERS_BY_SUBJECT: Record<string, ChapterItem[]> = {
  'toan-hoc': MATH_GRADE_12_CHAPTERS,
  'vat-ly': [
    {
      id: 1,
      slug: 'vat-ly-nhiet',
      name: 'Chương 1: Vật lý nhiệt',
      description: 'Nhiệt độ, thang nhiệt độ Kelvin - Celsius, nhiệt dung riêng, nhiệt nóng chảy và nhiệt hóa hơi riêng.',
      lessonCount: 5,
      examCount: 22,
      isDemoReady: true,
    },
    {
      id: 2,
      slug: 'khi-ly-tuong',
      name: 'Chương 2: Khí lý tưởng',
      description: 'Mô hình động học phân tử chất khí, định luật Boyle, định luật Charles và phương trình Clapeyron.',
      lessonCount: 4,
      examCount: 18,
    },
    {
      id: 3,
      slug: 'tu-truong-va-cam-ung-dien-tu',
      name: 'Chương 3: Từ trường & Cảm ứng điện từ',
      description: 'Từ trường, lực từ, từ thông, hiện tượng cảm ứng điện từ và năng lượng từ trường.',
      lessonCount: 5,
      examCount: 25,
    },
    {
      id: 4,
      slug: 'vat-ly-hat-nhan',
      name: 'Chương 4: Vật lý hạt nhân',
      description: 'Cấu trúc hạt nhân, độ hụt khối, năng lượng liên kết, hiện tượng phóng xạ và phản ứng phân hạch.',
      lessonCount: 4,
      examCount: 20,
    },
    {
      id: 5,
      slug: 'dao-dong-dieu-hoa-va-song-co',
      name: 'Chương 5: Dao động điều hòa & Sóng cơ',
      description: 'Phương trình dao động, con lắc đơn, con lắc lò xo, sự truyền sóng và hiện tượng giao thoa sóng.',
      lessonCount: 4,
      examCount: 20,
    },
    {
      id: 6,
      slug: 'dong-dien-xoay-chieu',
      name: 'Chương 6: Dòng điện xoay chiều',
      description: 'Mạch RLC mắc nối tiếp, hiện tượng cộng hưởng điện, công suất và máy biến áp.',
      lessonCount: 4,
      examCount: 16,
    },
  ],
  'hoa-hoc': [
    {
      id: 1,
      slug: 'este-lipit-chat-giat-rua',
      name: 'Chương 1: Este - Lipit & Chất giặt rửa',
      description: 'Khái niệm, cấu trúc este, phản ứng xà phòng hóa chất béo và cơ chế tẩy rửa tổng hợp.',
      lessonCount: 4,
      examCount: 24,
      isDemoReady: true,
    },
    {
      id: 2,
      slug: 'carbohydrate',
      name: 'Chương 2: Carbohydrate',
      description: 'Glucose, Fructose, Saccharose, Maltose, Tinh bột và Cellulose trong đời sống.',
      lessonCount: 4,
      examCount: 20,
    },
    {
      id: 3,
      slug: 'hop-chat-chua-nitrogen',
      name: 'Chương 3: Hợp chất chứa Nitrogen',
      description: 'Amine, Amino acid, Peptide, Protein và cấu trúc enzyme sinh học.',
      lessonCount: 5,
      examCount: 22,
    },
    {
      id: 4,
      slug: 'polymer-va-vat-lieu-polymer',
      name: 'Chương 4: Polymer & Vật liệu polymer',
      description: 'Phản ứng trùng hợp, trùng ngưng, chất dẻo, tơ sợi nhân tạo và cao su tổng hợp.',
      lessonCount: 3,
      examCount: 16,
    },
    {
      id: 5,
      slug: 'pin-dien-va-dien-phan',
      name: 'Chương 5: Pin điện & Điện phân',
      description: 'Thế điện cực chuẩn, cấu tạo pin Galvani, sự ăn mòn kim loại và ứng dụng điện phân công nghiệp.',
      lessonCount: 4,
      examCount: 18,
    },
    {
      id: 6,
      slug: 'kim-loai-chuyen-tiep',
      name: 'Chương 6: Kim loại chuyển tiếp',
      description: 'Cấu hình electron phân lớp d, số oxi hóa và ứng dụng của phức chất.',
      lessonCount: 3,
      examCount: 14,
    },
  ],
  'sinh-hoc': [
    {
      id: 1,
      slug: 'di-truyen-phan-tu-va-te-bao',
      name: 'Chương 1: Di truyền phân tử & Di truyền tế bào',
      description: 'Nhân đôi DNA, phiên mã, dịch mã, điều hòa hoạt động của operon Lac và đột biến gen.',
      lessonCount: 5,
      examCount: 26,
      isDemoReady: true,
    },
    {
      id: 2,
      slug: 'tinh-quy-luat-hien-tuong-di-truyen',
      name: 'Chương 2: Tính quy luật của hiện tượng di truyền',
      description: 'Quy luật phân ly Mendel, tương tác gen, liên kết gen hoàn toàn và hoán vị gen.',
      lessonCount: 5,
      examCount: 22,
    },
    {
      id: 3,
      slug: 'di-truyen-quan-the-va-nguoi',
      name: 'Chương 3: Di truyền quần thể & Di truyền người',
      description: 'Cấu trúc di truyền quần thể, định luật Hardy - Weinberg và nghiên cứu phả hệ di truyền.',
      lessonCount: 4,
      examCount: 18,
    },
    {
      id: 4,
      slug: 'bang-chung-va-co-che-tien-hoa',
      name: 'Chương 4: Bằng chứng & Cơ chế tiến hóa',
      description: 'Học thuyết Darwin, thuyết tiến hóa hiện đại, các nhân tố tiến hóa và quá trình hình thành loài.',
      lessonCount: 4,
      examCount: 16,
    },
    {
      id: 5,
      slug: 'sinh-thai-hoc',
      name: 'Chương 5: Sinh thái học & Môi trường',
      description: 'Quần thể sinh vật, quần xã sinh vật, hệ sinh thái và chu trình tuần hoàn vật chất sinh địa hóa.',
      lessonCount: 4,
      examCount: 18,
    },
    {
      id: 6,
      slug: 'vi-sinh-vat-va-cong-nghe-sinh-hoc',
      name: 'Chương 6: Vi sinh vật & Công nghệ sinh học',
      description: 'Chuyển hóa vật chất vi sinh vật, sinh trưởng và ứng dụng trong nông nghiệp, y học.',
      lessonCount: 3,
      examCount: 14,
    },
  ],
  'tieng-anh': [
    {
      id: 1,
      slug: 'unit-1-life-stories',
      name: 'Unit 1: Life Stories',
      description: 'Past Simple vs Past Continuous, vocabulary about inspirational historical figures and achievers.',
      lessonCount: 5,
      examCount: 24,
      isDemoReady: true,
    },
    {
      id: 2,
      slug: 'unit-2-a-multicultural-world',
      name: 'Unit 2: A Multicultural World',
      description: 'Cultural diversity, traditions, international festivals, comparative structures and idioms.',
      lessonCount: 4,
      examCount: 20,
    },
    {
      id: 3,
      slug: 'unit-3-green-living',
      name: 'Unit 3: Green Living',
      description: 'Environmental protection, passive voice forms, carbon footprint and sustainable lifestyles.',
      lessonCount: 4,
      examCount: 22,
    },
    {
      id: 4,
      slug: 'unit-4-urbanisation',
      name: 'Unit 4: Urbanisation',
      description: 'Relative clauses, rapid urban growth, challenges and development in modern megacities.',
      lessonCount: 4,
      examCount: 18,
    },
    {
      id: 5,
      slug: 'unit-5-the-world-of-work',
      name: 'Unit 5: The World of Work',
      description: 'Reported speech, future career choices, resume preparation and mock interview dialogues.',
      lessonCount: 4,
      examCount: 20,
    },
    {
      id: 6,
      slug: 'unit-6-lifelong-learning',
      name: 'Unit 6: Lifelong Learning',
      description: 'Conditional sentences, self-directed learning skills, digital education and future competencies.',
      lessonCount: 3,
      examCount: 16,
    },
  ],
  'lich-su': [
    {
      id: 1,
      slug: 'the-gioi-sau-chien-tranh-lanh',
      name: 'Chuyên đề 1: Thế giới trong và sau Chiến tranh Lạnh',
      description: 'Trật tự hai cực Ianta, xu thế đa cực, hợp tác quốc tế và toàn cầu hóa.',
      lessonCount: 4,
      examCount: 20,
      isDemoReady: true,
    },
    {
      id: 2,
      slug: 'asean-nhung-chang-duong-lich-su',
      name: 'Chuyên đề 2: ASEAN: Những chặng đường lịch sử',
      description: 'Quá trình hình thành, phát triển từ ASEAN 5 đến ASEAN 10 và vai trò trung tâm khu vực.',
      lessonCount: 3,
      examCount: 16,
    },
    {
      id: 3,
      slug: 'cach-mang-thang-tam-dien-bien-phu',
      name: 'Chuyên đề 3: Cách mạng tháng Tám 1945 & Chiến thắng Điện Biên Phủ',
      description: 'Nghệ thuật chớp thời cơ, xây dựng căn cứ địa và cuộc kháng chiến chống thực dân Pháp.',
      lessonCount: 5,
      examCount: 24,
    },
    {
      id: 4,
      slug: 'khang-chien-chong-my-cuu-nuoc',
      name: 'Chuyên đề 4: Cuộc kháng chiến chống Mỹ cứu nước (1954 - 1975)',
      description: 'Các chiến lược chiến tranh của Mỹ, Hiệp định Paris 1973 và Đại thắng mùa Xuân 1975.',
      lessonCount: 5,
      examCount: 25,
    },
  ],
  'dia-ly': [
    {
      id: 1,
      slug: 'dia-ly-tu-nhien-viet-nam',
      name: 'Chuyên đề 1: Địa lý tự nhiên Việt Nam',
      description: 'Vị trí địa lý, phạm vi lãnh thổ biển đảo, đặc điểm địa hình, khí hậu nhiệt đới ẩm gió mùa.',
      lessonCount: 4,
      examCount: 22,
      isDemoReady: true,
    },
    {
      id: 2,
      slug: 'dan-cu-va-do-thi-hoa',
      name: 'Chuyên đề 2: Địa lý dân cư & Đô thị hóa',
      description: 'Cơ cấu dân số vàng, phân bố dân cư, nguồn lao động và quá trình đô thị hóa tại Việt Nam.',
      lessonCount: 3,
      examCount: 18,
    },
    {
      id: 3,
      slug: 'cac-nganh-kinh-te-trong-diem',
      name: 'Chuyên đề 3: Địa lý các ngành kinh tế trọng điểm',
      description: 'Nông nghiệp công nghệ cao, các ngành công nghiệp chủ chốt và giao thông vận tải, du lịch.',
      lessonCount: 5,
      examCount: 24,
    },
    {
      id: 4,
      slug: 'cac-vung-kinh-te-trong-diem',
      name: 'Chuyên đề 4: Địa lý các vùng kinh tế trọng điểm',
      description: 'Đồng bằng sông Hồng, Đông Nam Bộ, Đồng bằng sông Cửu Long và vấn đề biển đảo.',
      lessonCount: 4,
      examCount: 20,
    },
  ],
  'gdcd': [
    {
      id: 1,
      slug: 'kinh-te-va-chu-the-kinh-te',
      name: 'Chuyên đề 1: Nền kinh tế và các chủ thể kinh tế',
      description: 'Cơ chế thị trường, quy luật cung cầu, giá cả và trách nhiệm xã hội của doanh nghiệp.',
      lessonCount: 3,
      examCount: 18,
      isDemoReady: true,
    },
    {
      id: 2,
      slug: 'thi-truong-lao-dong-viec-lam',
      name: 'Chuyên đề 2: Thị trường lao động và khởi nghiệp',
      description: 'Cung cầu lao động, chính sách hỗ trợ việc làm, kỹ năng định hướng nghề nghiệp thời đại số.',
      lessonCount: 3,
      examCount: 16,
    },
    {
      id: 3,
      slug: 'quyen-binh-dang-cua-cong-dan',
      name: 'Chuyên đề 3: Quyền bình đẳng của công dân trước pháp luật',
      description: 'Bình đẳng về quyền, nghĩa vụ và trách nhiệm pháp lý trong gia đình, lao động và kinh doanh.',
      lessonCount: 4,
      examCount: 20,
    },
    {
      id: 4,
      slug: 'phap-luat-voi-phat-trien-ben-vung',
      name: 'Chuyên đề 4: Pháp luật với phát triển bền vững đất nước',
      description: 'Pháp luật về bảo vệ môi trường, quốc phòng an ninh và hội nhập quốc tế.',
      lessonCount: 3,
      examCount: 16,
    },
  ],
  'tin-hoc': [
    {
      id: 1,
      slug: 'lap-trinh-python-nang-cao',
      name: 'Chuyên đề 1: Lập trình Python & Giải thuật nâng cao',
      description: 'Kỹ thuật đệ quy, sắp xếp, tìm kiếm nhị phân, xử lý xâu ký tự và lập trình hướng đối tượng OOP.',
      lessonCount: 5,
      examCount: 25,
      isDemoReady: true,
    },
    {
      id: 2,
      slug: 'co-so-du-lieu-quan-he-sql',
      name: 'Chuyên đề 2: Cơ sở dữ liệu quan hệ & Truy vấn SQL',
      description: 'Mô hình quan hệ, khóa chính, khóa ngoại, chuẩn hóa dữ liệu và câu lệnh SELECT, JOIN, GROUP BY.',
      lessonCount: 4,
      examCount: 22,
    },
    {
      id: 3,
      slug: 'tri-tue-nhan-tao-ai-ung-dung',
      name: 'Chuyên đề 3: Trí tuệ nhân tạo (AI) ứng dụng',
      description: 'Khái niệm học máy Machine Learning, xử lý ngôn ngữ tự nhiên NLP và ứng dụng thực tiễn.',
      lessonCount: 4,
      examCount: 20,
    },
    {
      id: 4,
      slug: 'mang-may-tinh-an-toan-thong-tin',
      name: 'Chuyên đề 4: Mạng máy tính & An toàn an ninh mạng',
      description: 'Địa chỉ IP, giao thức TCP/IP, chữ ký điện tử, mã hóa RSA và phòng chống tấn công mạng.',
      lessonCount: 4,
      examCount: 18,
    },
  ],
  'cong-nghe': [
    {
      id: 1,
      slug: 've-ky-thuat-cad',
      name: 'Chuyên đề 1: Vẽ kỹ thuật & Bản vẽ cơ khí CAD',
      description: 'Các phép chiếu vuông góc, hình cắt, mặt cắt và đọc bản vẽ lắp ráp chi tiết cơ khí.',
      lessonCount: 3,
      examCount: 16,
      isDemoReady: true,
    },
    {
      id: 2,
      slug: 'dien-tu-ung-dung-vi-dieu-khien',
      name: 'Chuyên đề 2: Điện tử ứng dụng & Vi điều khiển',
      description: 'Linh kiện bán dẫn Diode, Transistor, IC khuếch đại thuật toán và vi điều khiển nhúng.',
      lessonCount: 4,
      examCount: 18,
    },
    {
      id: 3,
      slug: 'tu-dong-hoa-robotics',
      name: 'Chuyên đề 3: Tự động hóa & Hệ thống Robotics',
      description: 'Cơ cấu chấp hành khí nén, động cơ bước, cảm biến công nghiệp và lập trình điều khiển tự động.',
      lessonCount: 3,
      examCount: 16,
    },
    {
      id: 4,
      slug: 'nang-luong-tai-tao',
      name: 'Chuyên đề 4: Công nghệ năng lượng tái tạo',
      description: 'Công nghệ điện mặt trời quang điện, tuabin điện gió và bảo tồn năng lượng trong công nghiệp.',
      lessonCount: 3,
      examCount: 14,
    },
  ],
  'ngu-van': [
    {
      id: 1,
      slug: 'doc-hieu-truyen-va-ky-hien-dai',
      name: 'Chuyên đề 1: Đọc hiểu văn bản truyện & ký hiện đại',
      description: 'Nghệ thuật xây dựng điểm nhìn trần thuật, tình huống truyện độc đáo và diễn biến tâm lý nhân vật.',
      lessonCount: 4,
      examCount: 20,
      isDemoReady: true,
    },
    {
      id: 2,
      slug: 'tho-tru-tinh-va-tho-tuong-trung',
      name: 'Chuyên đề 2: Thơ trữ tình & Thơ tượng trưng',
      description: 'Cấu tứ bài thơ, hình ảnh tượng trưng, nhịp điệu và phong cách nghệ thuật của các nhà thơ lớn.',
      lessonCount: 4,
      examCount: 18,
    },
    {
      id: 3,
      slug: 'nghi-luan-xa-hoi',
      name: 'Chuyên đề 3: Kỹ năng viết bài Nghị luận xã hội',
      description: 'Kỹ năng giải thích tư tưởng, chứng minh dẫn chứng thực tế và bình luận bài học hành động trong kỷ nguyên số.',
      lessonCount: 4,
      examCount: 22,
    },
    {
      id: 4,
      slug: 'nghi-luan-van-hoc-so-sanh',
      name: 'Chuyên đề 4: Nghị luận văn học so sánh & Bình diện thi pháp',
      description: 'So sánh hai đoạn trích, liên hệ phong cách sáng tác và chiều sâu giá trị nhân đạo tác phẩm.',
      lessonCount: 4,
      examCount: 24,
    },
  ],
  'khoa-hoc-tu-nhien': [
    {
      id: 1,
      slug: 'chat-va-su-bien-doi-chat',
      name: 'Chủ đề 1: Chất và sự biến đổi của chất',
      description: 'Cấu tạo nguyên tử, bảng tuần hoàn, liên kết ion, liên kết cộng hóa trị và các loại phản ứng hóa học.',
      lessonCount: 4,
      examCount: 20,
      isDemoReady: true,
    },
    {
      id: 2,
      slug: 'nang-luong-va-bien-doi-nang-luong',
      name: 'Chủ đề 2: Năng lượng và các dạng năng lượng',
      description: 'Động năng, thế năng, nhiệt năng, công và công suất cơ học, định luật bảo toàn năng lượng.',
      lessonCount: 4,
      examCount: 20,
    },
    {
      id: 3,
      slug: 'trai-dat-va-bau-troi',
      name: 'Chủ đề 3: Trái Đất và bầu trời',
      description: 'Hệ Mặt Trời, chuyển động tự quay và quanh Mặt Trời của Trái Đất, các hiện tượng khí tượng.',
      lessonCount: 3,
      examCount: 16,
    },
    {
      id: 4,
      slug: 'su-song-va-moi-truong-sinh-thai',
      name: 'Chủ đề 4: Sự sống & Môi trường sinh thái',
      description: 'Cấu trúc tế bào, trao đổi chất ở cơ thể thực vật, động vật và cân bằng sinh thái tự nhiên.',
      lessonCount: 4,
      examCount: 18,
    },
  ],
};

export function getChaptersBySubject(subjectSlug: string, _grade = 12): ChapterItem[] {
  const slug = (subjectSlug || '').toLowerCase().trim();
  if (slug === 'gdkt' || slug === 'gdkt-phap-luat' || slug === 'giao-duc-kinh-te-va-phap-luat') {
    return CHAPTERS_BY_SUBJECT['gdcd'] || [];
  }
  return CHAPTERS_BY_SUBJECT[slug] || MATH_GRADE_12_CHAPTERS;
}

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
  difficulty: QuestionDifficulty;
  grade: number;
  chapterId: number;
  subjectSlug?: string;
  subjectName?: string;
  topic?: string;
  relatedChapterIds?: number[];
  isPreviousChapterReview?: boolean;
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

// Ngân hàng câu hỏi mẫu Chuẩn SGK Mới GDPT 2018 (Toán 12 - Chương 1: Ứng dụng đạo hàm)
export const MOCK_EXAM_QUESTIONS_CH1: ExamQuestion[] = [
  // 1. Trắc nghiệm 4 lựa chọn - Đơn điệu (Nhận biết)
  {
    id: 'q-01',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    grade: 12,
    chapterId: 1,
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

  // 2. Trắc nghiệm 4 lựa chọn - Cực trị (Thông hiểu)
  {
    id: 'q-02',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM',
    grade: 12,
    chapterId: 1,
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

  // 3. Trắc nghiệm 4 lựa chọn - GTLN, GTNN (Thông hiểu)
  {
    id: 'q-03',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM',
    grade: 12,
    chapterId: 1,
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

  // 4. Trắc nghiệm 4 lựa chọn - Tiệm cận xiên (Vận dụng)
  {
    id: 'q-04',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'HARD',
    grade: 12,
    chapterId: 1,
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

  // 5. Trắc nghiệm Đúng/Sai (Định dạng đề thi Bộ GD&ĐT 2025 - Thông hiểu)
  {
    id: 'q-05',
    type: 'TRUE_FALSE',
    difficulty: 'MEDIUM',
    grade: 12,
    chapterId: 1,
    title: 'Câu 5 (Định dạng Đúng/Sai 2025): Khảo sát hàm phân thức hữu tỉ',
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

  // 6. Trắc nghiệm Trả lời ngắn (Điền số - Vận dụng)
  {
    id: 'q-06',
    type: 'SHORT_ANSWER',
    difficulty: 'HARD',
    grade: 12,
    chapterId: 1,
    title: 'Câu 6 (Điền đáp số): Số điểm cực trị của hàm số',
    content:
      'Biết đồ thị hàm số $y = x^3 - 6x^2 + 9x + 1$ có hai điểm cực trị là $A(x_1; y_1)$ và $B(x_2; y_2)$. Tính tổng giá trị tung độ $y_1 + y_2$ của hai điểm cực trị này.',
    score: 1.0,
    shortAnswerCorrect: '6',
    explanation:
      'Đạo hàm $y\' = 3x^2 - 12x + 9 = 3(x^2 - 4x + 3)$.\\n$y\' = 0 \\Leftrightarrow x = 1$ hoặc $x = 3$.\\n• Với $x_1 = 1 \\Rightarrow y_1 = 1 - 6 + 9 + 1 = 5 \\Rightarrow A(1; 5)$.\\n• Với $x_2 = 3 \\Rightarrow y_2 = 27 - 54 + 27 + 1 = 1 \\Rightarrow B(3; 1)$.\\nTổng giá trị tung độ cực trị: $y_1 + y_2 = 5 + 1 = 6$.\\nĐáp số điền: 6.',
  },

  // 7. Bài toán Tự Luận - Khảo sát và tìm tham số m (Vận dụng)
  {
    id: 'q-07',
    type: 'ESSAY',
    difficulty: 'HARD',
    grade: 12,
    chapterId: 1,
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
      '• Thử lại:\\n' +
      '  - Với $m = 1$: $y\' = (x - 1)^2 \\geq 0 \\Rightarrow$ không đổi dấu qua $x = 1$ (loại).\\n' +
      '  - Với $m = 2$: $y\' = (x - 1)(x - 3) \\Rightarrow$ qua $x = 1$, $y\'$ đổi dấu từ $+$ sang $-$ nên $x = 1$ là cực đại (loại).\\n' +
      '• Kết luận: Không tồn tại $m$ thỏa mãn.',
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
        detail: 'Kiểm tra điều kiện đủ loại cả hai nghiệm và kết luận không có $m$ thỏa mãn.',
      },
    ],
  },

  // 8. Trắc nghiệm 4 lựa chọn - Liên môn Vật lý (Vận dụng)
  {
    id: 'q-08',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'HARD',
    grade: 12,
    chapterId: 1,
    title: 'Câu 8 (Vận dụng liên môn Vật lý): Vận tốc tức thời từ đạo hàm quãng đường',
    content:
      'Một chất điểm chuyển động theo phương trình $s(t) = (1)/(3)t^[3] - 2t^[2] + 3t + 10$ (với $t \\geq 0$, $s$ tính bằng mét, $t$ tính bằng giây). Vận tốc tức thời $v(t) = s\'(t)$ đạt giá trị nhỏ nhất tại thời điểm nào và bằng bao nhiêu?',
    score: 0.5,
    choices: [
      { key: 'A', content: '$t = 2$ s và $v_{min} = -1$ m/s' },
      { key: 'B', content: '$t = 1$ s và $v_{min} = 0$ m/s' },
      { key: 'C', content: '$t = 3$ s và $v_{min} = 0$ m/s' },
      { key: 'D', content: '$t = 2$ s và $v_{min} = 3$ m/s' },
    ],
    correctChoice: 'A',
    explanation:
      'Vận tốc tức thời là đạo hàm của quãng đường: $v(t) = s\'(t) = t^[2] - 4t + 3 = (t - 2)^[2] - 1 \\geq -1$. Dấu "=" khi $t = 2$ s. Chọn A.',
  },

  // 9. Tự luận Vật lý - Cơ học (Vận dụng cao)
  {
    id: 'q-09',
    type: 'ESSAY',
    difficulty: 'VERY_HARD',
    grade: 12,
    chapterId: 1,
    title: 'Câu 9 (Tự luận Vật lý - Toán học): Khảo sát động năng và chuyển động biến đổi đều',
    content:
      'Một vật có khối lượng $m = 2$ kg chuyển động với phương trình vận tốc $v = v_[0] + a.t$ trong đó vận tốc ban đầu $v_[0] = 5$ m/s và gia tốc $a = 2$ m/s^[2]. Lực tác dụng tuân theo định luật II Newton $\\vec{F} = m.\\vec{a}$.\\n\\na) Tính độ lớn lực tác dụng $F$ lên vật và vận tốc của vật tại thời điểm $t = 3$ s.\\nb) Biểu thức động năng của vật là $W = (1)/(2)m.v^[2]$. Hãy tính động năng của vật tại thời điểm $t = 3$ s.',
    score: 4.0,
    explanation:
      'a) $F = m.a = 2 \\times 2 = 4$ N. $v(3) = 5 + 2 \\times 3 = 11$ m/s.\\nb) $W = (1)/(2) \\times 2 \\times 11^[2] = 121$ J.',
    gradingRubric: [
      {
        step: 'Bước 1 (1.0 điểm)',
        point: 1.0,
        detail: 'Áp dụng định luật II Newton $\\vec{F} = m.\\vec{a}$, tính được độ lớn $F = 4$ N.',
      },
      {
        step: 'Bước 2 (1.0 điểm)',
        point: 1.0,
        detail: 'Sử dụng công thức vận tốc $v = v_[0] + a.t$, tính đúng $v(3) = 11$ m/s.',
      },
      {
        step: 'Bước 3 (2.0 điểm)',
        point: 2.0,
        detail: 'Áp dụng công thức động năng $W = (1)/(2)m.v^[2]$, tính chính xác $W = 121$ J.',
      },
    ],
  },

  // 10. Trắc nghiệm 4 lựa chọn - Nhận biết tiệm cận ngang
  {
    id: 'q-10',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    grade: 12,
    chapterId: 1,
    title: 'Câu 10 (Nhận biết): Tìm đường tiệm cận ngang',
    content: 'Đường tiệm cận ngang của đồ thị hàm số $y = \\frac{3x - 1}{x + 2}$ có phương trình là:',
    score: 0.5,
    choices: [
      { key: 'A', content: '$y = 3$' },
      { key: 'B', content: '$x = -2$' },
      { key: 'C', content: '$y = -\\frac{1}{2}$' },
      { key: 'D', content: '$x = 3$' },
    ],
    correctChoice: 'A',
    explanation: 'Ta có $\\lim_{x \\to \\pm\\infty} \\frac{3x - 1}{x + 2} = 3$. Vậy đường tiệm cận ngang là $y = 3$. Chọn A.',
  },

  // 11. Trắc nghiệm 4 lựa chọn - Nhận biết cực tiểu từ đạo hàm
  {
    id: 'q-11',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    grade: 12,
    chapterId: 1,
    title: 'Câu 11 (Nhận biết): Điểm cực tiểu của hàm số',
    content: 'Cho hàm số $y = f(x)$ có đạo hàm $f\'(x) = (x - 1)(x + 2)$. Điểm cực tiểu của hàm số đã cho là:',
    score: 0.5,
    choices: [
      { key: 'A', content: '$x = 1$' },
      { key: 'B', content: '$x = -2$' },
      { key: 'C', content: '$x = 0$' },
      { key: 'D', content: '$x = 2$' },
    ],
    correctChoice: 'A',
    explanation: 'Ta có $f\'(x) = 0 \\Leftrightarrow x = 1$ hoặc $x = -2$. Qua $x = 1$, $f\'(x)$ đổi dấu từ âm sang dương nên $x = 1$ là điểm cực tiểu. Chọn A.',
  },

  // 12. Trắc nghiệm 4 lựa chọn - Vận dụng cao tối ưu hóa
  {
    id: 'q-12',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'VERY_HARD',
    grade: 12,
    chapterId: 1,
    title: 'Câu 12 (Vận dụng cao): Tối ưu hóa chi phí sản xuất thùng chứa',
    content:
      'Một công ty cần sản xuất một thùng chứa dạng hình hộp chữ nhật không nắp có thể tích $V = 500$ m$^3$, đáy là hình vuông cạnh $x$ mét. Chi phí làm vật liệu mặt đáy là $100.000$ đ/m$^2$, chi phí làm các mặt bên là $50.000$ đ/m$^2$. Để tổng chi phí vật liệu là nhỏ nhất thì cạnh đáy $x$ bằng bao nhiêu mét?',
    score: 0.5,
    choices: [
      { key: 'A', content: '$x = 10$ m' },
      { key: 'B', content: '$x = 5$ m' },
      { key: 'C', content: '$x = 15$ m' },
      { key: 'D', content: '$x = 20$ m' },
    ],
    correctChoice: 'A',
    explanation:
      'Chiều cao $h = \\frac{500}{x^2}$. Diện tích đáy $x^2$, diện tích 4 mặt bên $4xh = \\frac{2000}{x}$.\\nTổng chi phí $C(x) = 100(x^2 + \\frac{1000}{x})$ nghìn đồng.\\nĐạo hàm $C\'(x) = 100(2x - \\frac{1000}{x^2}) = 0 \\Leftrightarrow 2x^3 = 1000 \\Leftrightarrow x = 10$ m. Chọn A.',
  },
];

// =========================================================================
// Ngân hàng câu hỏi mẫu Chuẩn SGK Mới GDPT 2018 (Toán 12 - Chương 2: Vectơ & Tọa độ Oxyz)
// =========================================================================
export const MOCK_EXAM_QUESTIONS_CH2: ExamQuestion[] = [
  // 1. Nhận biết (Dễ)
  {
    id: 'q2-01',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    grade: 12,
    chapterId: 2,
    title: 'Tọa độ của vectơ trong không gian Oxyz',
    content: 'Trong không gian $Oxyz$, cho vectơ $\\vec{u} = 2\\vec{i} - 3\\vec{j} + 5\\vec{k}$. Tọa độ của vectơ $\\vec{u}$ là:',
    score: 0.5,
    choices: [
      { key: 'A', content: '$(2; -3; 5)$' },
      { key: 'B', content: '$(2; 3; 5)$' },
      { key: 'C', content: '$(-3; 2; 5)$' },
      { key: 'D', content: '$(2; -3; -5)$' },
    ],
    correctChoice: 'A',
    explanation: 'Theo định nghĩa hệ trục $Oxyz$, $\\vec{u} = x\\vec{i} + y\\vec{j} + z\\vec{k} \\Rightarrow \\vec{u} = (2; -3; 5)$. Chọn A.',
  },

  // 2. Nhận biết (Dễ)
  {
    id: 'q2-02',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    grade: 12,
    chapterId: 2,
    title: 'Độ dài của vectơ trong không gian',
    content: 'Trong không gian $Oxyz$, cho vectơ $\\vec{a} = (1; -2; 2)$. Độ dài của vectơ $\\vec{a}$ bằng:',
    score: 0.5,
    choices: [
      { key: 'A', content: '$3$' },
      { key: 'B', content: '$9$' },
      { key: 'C', content: '$\\sqrt{5}$' },
      { key: 'D', content: '$5$' },
    ],
    correctChoice: 'A',
    explanation: 'Độ dài $|\vec{a}| = \\sqrt{1^2 + (-2)^2 + 2^2} = \\sqrt{1 + 4 + 4} = 3$. Chọn A.',
  },

  // 3. Thông hiểu (Trung bình)
  {
    id: 'q2-03',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM',
    grade: 12,
    chapterId: 2,
    title: 'Tích vô hướng của hai vectơ trong không gian',
    content: 'Trong không gian $Oxyz$, cho hai vectơ $\\vec{a} = (1; 2; -1)$ và $\\vec{b} = (2; -1; 3)$. Giá trị của tích vô hướng $\\vec{a}.\\vec{b}$ là:',
    score: 0.5,
    choices: [
      { key: 'A', content: '$-3$' },
      { key: 'B', content: '$3$' },
      { key: 'C', content: '$7$' },
      { key: 'D', content: '$-1$' },
    ],
    correctChoice: 'A',
    explanation: 'Ta có $\\vec{a}.\\vec{b} = 1(2) + 2(-1) + (-1)(3) = 2 - 2 - 3 = -3$. Chọn A.',
  },

  // 4. Thông hiểu (Trung bình)
  {
    id: 'q2-04',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM',
    grade: 12,
    chapterId: 2,
    title: 'Tìm tọa độ trung điểm của đoạn thẳng',
    content: 'Trong không gian $Oxyz$, cho hai điểm $A(1; 3; -2)$ và $B(3; -1; 4)$. Tọa độ trung điểm $M$ của đoạn thẳng $AB$ là:',
    score: 0.5,
    choices: [
      { key: 'A', content: '$M(2; 1; 1)$' },
      { key: 'B', content: '$M(4; 2; 2)$' },
      { key: 'C', content: '$M(1; -2; 3)$' },
      { key: 'D', content: '$M(2; -2; 1)$' },
    ],
    correctChoice: 'A',
    explanation: 'Tọa độ trung điểm $M = (\\frac{1+3}{2}; \\frac{3-1}{2}; \\frac{-2+4}{2}) = (2; 1; 1)$. Chọn A.',
  },

  // 5. Vận dụng (Khó) - TÍCH HỢP ÔN TẬP CHƯƠNG 1 (Cực trị khoảng cách dùng đạo hàm)
  {
    id: 'q2-05',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'HARD',
    grade: 12,
    chapterId: 2,
    isPreviousChapterReview: true,
    relatedChapterIds: [1],
    title: 'Cực trị khoảng cách điểm di động trên trục tọa độ (Ứng dụng Đạo hàm Chương 1)',
    content: 'Trong không gian $Oxyz$, cho hai điểm $A(1; 2; 3)$ và $B(3; 4; 1)$. Điểm $M(x; 0; 0)$ nằm trên trục $Ox$ sao cho biểu thức $P = MA^[2] + MB^[2]$ đạt giá trị nhỏ nhất khi hoành độ $x$ bằng:',
    score: 0.5,
    choices: [
      { key: 'A', content: '$x = 2$' },
      { key: 'B', content: '$x = 1$' },
      { key: 'C', content: '$x = 3$' },
      { key: 'D', content: '$x = 4$' },
    ],
    correctChoice: 'A',
    explanation:
      'Ta có $P(x) = (x-1)^2 + 2^2 + 3^2 + (x-3)^2 + 4^2 + 1^2 = 2x^2 - 8x + 40$.\\nXét hàm số $P(x) = 2x^2 - 8x + 40$ có đạo hàm $P\'(x) = 4x - 8$.\\nCho $P\'(x) = 0 \\Leftrightarrow x = 2$.\\nVì hệ số bậc hai dương nên hàm số đạt GTNN tại $x = 2$. Chọn A.',
  },

  // 6. Vận dụng (Khó)
  {
    id: 'q2-06',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'HARD',
    grade: 12,
    chapterId: 2,
    title: 'Tích có hướng và tính diện tích tam giác',
    content: 'Trong không gian $Oxyz$, cho ba điểm $A(1; 0; 0)$, $B(0; 2; 0)$, $C(0; 0; 3)$. Diện tích của tam giác $ABC$ bằng:',
    score: 0.5,
    choices: [
      { key: 'A', content: '$\\frac{7}{2}$' },
      { key: 'B', content: '$\\frac{\\sqrt{61}}{2}$' },
      { key: 'C', content: '$7$' },
      { key: 'D', content: '$\\sqrt{61}$' },
    ],
    correctChoice: 'A',
    explanation:
      'Ta có $\\vec{AB} = (-1; 2; 0)$, $\\vec{AC} = (-1; 0; 3)$.\\nTích có hướng $[\\vec{AB}, \\vec{AC}] = (6; 3; 2)$.\\nDiện tích $S_{\\triangle ABC} = \\frac{1}{2}|[\\vec{AB}, \\vec{AC}]| = \\frac{1}{2}\\sqrt{6^2 + 3^2 + 2^2} = \\frac{1}{2}\\sqrt{49} = \\frac{7}{2}$. Chọn A.',
  },

  // 7. Vận dụng cao (Rất khó) - Bài toán thực tế 3D
  {
    id: 'q2-07',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'VERY_HARD',
    grade: 12,
    chapterId: 2,
    title: 'Bài toán thực tế định vị rađa hàng không (Không gian 3D)',
    content:
      'Tại một trung tâm kiểm soát không lưu, trạm radar đặt tại gốc $O(0; 0; 0)$. Máy bay thứ nhất đang bay tại vị trí $A(100; 200; 10)$ km, máy bay thứ hai tại $B(120; 200; 12)$ km. Khoảng cách trực tiếp giữa hai máy bay là bao nhiêu km?',
    score: 0.5,
    choices: [
      { key: 'A', content: '$2\\sqrt{101}$ km' },
      { key: 'B', content: '$20$ km' },
      { key: 'C', content: '$22$ km' },
      { key: 'D', content: '$15$ km' },
    ],
    correctChoice: 'A',
    explanation:
      'Khoảng cách $AB = \\sqrt{(120-100)^2 + (200-200)^2 + (12-10)^2} = \\sqrt{20^2 + 0 + 2^2} = \\sqrt{404} = 2\\sqrt{101}$ km. Chọn A.',
  },

  // 8. Đúng/Sai (Thông hiểu & Vận dụng)
  {
    id: 'q2-08',
    type: 'TRUE_FALSE',
    difficulty: 'MEDIUM',
    grade: 12,
    chapterId: 2,
    title: 'Khảo sát 4 điểm và hình học không gian Oxyz',
    content: 'Trong không gian $Oxyz$, cho 4 điểm $A(1; 0; 1)$, $B(0; 1; 2)$, $C(2; 1; 0)$ và $D(1; 2; 3)$. Xét tính đúng hoặc sai của các mệnh đề sau:',
    score: 1.0,
    explanation:
      '• a) $\\vec{AB} = (0-1; 1-0; 2-1) = (-1; 1; 1) \\Rightarrow$ Đúng.\\n• b) $\\vec{AC} = (2-1; 1-0; 0-1) = (1; 1; -1) \\Rightarrow$ Đúng.\\n• c) $\\vec{AB}.\\vec{AC} = -1(1) + 1(1) + 1(-1) = -1 \\neq 0 \\Rightarrow$ Hai vectơ không vuông góc $\\Rightarrow$ Sai.\\n• d) Tính $[\\vec{AB}, \\vec{AC}].\\vec{AD} \\neq 0 \\Rightarrow 4$ điểm $A, B, C, D$ không đồng phẳng, tạo thành tứ diện $\\Rightarrow$ Đúng.',
    statements: [
      {
        subId: 'a',
        statement: 'Tọa độ của vectơ $\\vec{AB}$ là $(-1; 1; 1)$.',
        isCorrect: true,
        explanation: 'Tính hiệu tọa độ các điểm $B - A = (-1; 1; 1)$.',
      },
      {
        subId: 'b',
        statement: 'Tọa độ của vectơ $\\vec{AC}$ là $(1; 1; -1)$.',
        isCorrect: true,
        explanation: 'Tính hiệu tọa độ các điểm $C - A = (1; 1; -1)$.',
      },
      {
        subId: 'c',
        statement: 'Hai vectơ $\\vec{AB}$ và $\\vec{AC}$ vuông góc với nhau vì có tích vô hướng bằng 0.',
        isCorrect: false,
        explanation: 'Tích vô hướng $\\vec{AB}.\\vec{AC} = -1 + 1 - 1 = -1 \\neq 0$ nên chúng không vuông góc.',
      },
      {
        subId: 'd',
        statement: 'Bốn điểm $A, B, C, D$ không đồng phẳng và tạo thành bốn đỉnh của một tứ diện.',
        isCorrect: true,
        explanation: 'Thể tích khối tứ diện $V > 0$ do tích hỗn tạp khác 0.',
      },
    ],
  },

  // 9. Điền số (Vận dụng)
  {
    id: 'q2-09',
    type: 'SHORT_ANSWER',
    difficulty: 'HARD',
    grade: 12,
    chapterId: 2,
    title: 'Góc giữa hai vectơ trong không gian',
    content: 'Trong không gian $Oxyz$, cho hai vectơ $\\vec{u} = (1; 1; 0)$ và $\\vec{v} = (0; 1; 1)$. Tính số đo góc $(\\vec{u}, \\vec{v})$ theo đơn vị độ.',
    score: 1.0,
    shortAnswerCorrect: '60',
    explanation:
      'Ta có $\\cos(\\vec{u}, \\vec{v}) = \\frac{\\vec{u}.\\vec{v}}{|\\vec{u}|.|\\vec{v}|} = \\frac{1(0) + 1(1) + 0(1)}{\\sqrt{1^2+1^2}.\\sqrt{1^2+1^2}} = \\frac{1}{\\sqrt{2}.\\sqrt{2}} = \\frac{1}{2}$.\\nSuy ra góc $(\\vec{u}, \\vec{v}) = 60^\\circ$.\\nĐáp số điền: 60.',
  },

  // 10. Tự luận (Vận dụng)
  {
    id: 'q2-10',
    type: 'ESSAY',
    difficulty: 'HARD',
    grade: 12,
    chapterId: 2,
    title: 'Gắn hệ trục tọa độ Oxyz giải bài toán hình khối đa diện thực tế',
    content:
      'Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $a = 2$, cạnh bên $SA$ vuông góc với mặt phẳng đáy và $SA = 3$. Chọn hệ trục tọa độ $Oxyz$ sao cho gốc $O$ trùng với điểm $A$, tia $Ox$ chứa cạnh $AB$, tia $Oy$ chứa cạnh $AD$, tia $Oz$ chứa cạnh $AS$.\\n\\na) Xác định tọa độ các đỉnh $S, B, C, D$.\\nb) Tính thể tích khối chóp $S.ABCD$ theo công thức $V = (1)/(3)S_{đáy}.h$ và tính khoảng cách giữa hai điểm $S$ và $C$.',
    score: 4.0,
    explanation:
      'a) Tọa độ các đỉnh: $A(0; 0; 0)$, $B(2; 0; 0)$, $D(0; 2; 0)$, $C(2; 2; 0)$, $S(0; 0; 3)$.\\n\\n' +
      'b) Thể tích: Diện tích đáy $S_{đáy} = 2^2 = 4$. Chiều cao $h = SA = 3$.\\n' +
      '$V = \\frac{1}{3} \\times 4 \\times 3 = 4$ (đvtt).\\n' +
      'Khoảng cách $SC = \\sqrt{(2-0)^2 + (2-0)^2 + (0-3)^2} = \\sqrt{4 + 4 + 9} = \\sqrt{17}$.',
    gradingRubric: [
      {
        step: 'Bước 1 (1.0 điểm)',
        point: 1.0,
        detail: 'Xác định chính xác tọa độ các đỉnh $A(0;0;0), B(2;0;0), D(0;2;0), C(2;2;0), S(0;0;3)$.',
      },
      {
        step: 'Bước 2 (1.0 điểm)',
        point: 1.0,
        detail: 'Tính đúng diện tích đáy $S = 4$ và chiều cao $h = 3$.',
      },
      {
        step: 'Bước 3 (1.0 điểm)',
        point: 1.0,
        detail: 'Áp dụng công thức thể tích tính ra $V = 4$ đvtt.',
      },
      {
        step: 'Bước 4 (1.0 điểm)',
        point: 1.0,
        detail: 'Tính đúng độ dài đoạn thẳng $SC = \\sqrt{17}$.',
      },
    ],
  },

  // 11. Nhận biết (Dễ) - ÔN TẬP CHƯƠNG 1
  {
    id: 'q2-11',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    grade: 12,
    chapterId: 1,
    isPreviousChapterReview: true,
    relatedChapterIds: [1],
    title: 'Đường tiệm cận đứng của đồ thị hàm phân thức (Ôn tập Chương 1)',
    content: 'Phương trình đường tiệm cận đứng của đồ thị hàm số $y = \\frac{2x + 1}{x - 3}$ là:',
    score: 0.5,
    choices: [
      { key: 'A', content: '$x = 3$' },
      { key: 'B', content: '$x = -3$' },
      { key: 'C', content: '$y = 2$' },
      { key: 'D', content: '$y = 3$' },
    ],
    correctChoice: 'A',
    explanation: 'Tiệm cận đứng tại nghiệm của mẫu $x - 3 = 0 \\Leftrightarrow x = 3$. Chọn A.',
  },

  // 12. Thông hiểu (Trung bình) - ÔN TẬP CHƯƠNG 1
  {
    id: 'q2-12',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM',
    grade: 12,
    chapterId: 1,
    isPreviousChapterReview: true,
    relatedChapterIds: [1],
    title: 'Giá trị nhỏ nhất của hàm số trên đoạn (Ôn tập Chương 1)',
    content: 'Giá trị nhỏ nhất của hàm số $y = x^3 - 3x + 4$ trên đoạn $[0; 2]$ bằng:',
    score: 0.5,
    choices: [
      { key: 'A', content: '$2$' },
      { key: 'B', content: '$4$' },
      { key: 'C', content: '$6$' },
      { key: 'D', content: '$0$' },
    ],
    correctChoice: 'A',
    explanation: 'Đạo hàm $y\' = 3x^2 - 3 = 0 \\Leftrightarrow x = 1 \\in [0; 2]$.\\n$y(0) = 4, y(1) = 2, y(2) = 6 \\Rightarrow \\min_{[0; 2]} y = y(1) = 2$. Chọn A.',
  },
];

// =========================================================================
// SUBJECT METADATA & TOPICS CLASSIFICATION
// =========================================================================
export interface SubjectCategoryItem {
  id: string;
  name: string;
}

export interface SubjectMetadata {
  slug: string;
  name: string;
  shortCode: string;
  themeColor: string;
  badgeBg: string;
  categories: SubjectCategoryItem[];
}

export const SUBJECT_METADATA_LIST: SubjectMetadata[] = [
  {
    slug: 'toan-hoc',
    name: 'Toán Học',
    shortCode: 'TOAN',
    themeColor: 'text-[#00B8DD]',
    badgeBg: 'bg-[#00B8DD]/10 text-[#009bbd] border-[#00B8DD]/30',
    categories: [
      { id: 'dao-ham', name: 'Ứng dụng đạo hàm & Khảo sát đồ thị' },
      { id: 'vecto-oxyz', name: 'Tọa độ vectơ & Không gian Oxyz' },
      { id: 'thong-ke', name: 'Số đặc trưng mẫu số liệu ghép nhóm' },
      { id: 'tich-phan', name: 'Nguyên hàm & Tích phân' },
      { id: 'toa-do-khong-gian', name: 'Phương trình mặt phẳng & đường thẳng' },
      { id: 'xac-suat', name: 'Xác suất có điều kiện' },
    ],
  },
  {
    slug: 'vat-ly',
    name: 'Vật Lý',
    shortCode: 'LY',
    themeColor: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900',
    categories: [
      { id: 'dao-dong-co', name: 'Dao động điều hòa & Con lắc' },
      { id: 'song-co', name: 'Sóng cơ và Sóng âm' },
      { id: 'dien-xoay-chieu', name: 'Dòng điện xoay chiều & Mạch RLC' },
      { id: 'song-anh-sang', name: 'Sóng ánh sáng & Giao thoa' },
      { id: 'luong-tu', name: 'Lượng tử ánh sáng & Quang điện' },
      { id: 'hat-nhan', name: 'Vật lý hạt nhân & Phóng xạ' },
    ],
  },
  {
    slug: 'hoa-hoc',
    name: 'Hóa Học',
    shortCode: 'HOA',
    themeColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
    categories: [
      { id: 'este-lipit', name: 'Este - Lipit & Chất béo' },
      { id: 'cacbohidrat', name: 'Cacbohidrat (Glucozơ, Saccarozơ)' },
      { id: 'amin-protein', name: 'Amin, Amino Axit & Peptit' },
      { id: 'polime', name: 'Polime & Vật liệu polime' },
      { id: 'dai-cuong-kim-loai', name: 'Đại cương kim loại & Điện phân' },
      { id: 'kim-loai-kiem', name: 'Kim loại kiềm, kiềm thổ & Nhôm' },
    ],
  },
  {
    slug: 'tieng-anh',
    name: 'Tiếng Anh',
    shortCode: 'ANH',
    themeColor: 'text-amber-600',
    badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    categories: [
      { id: 'ngu-phap', name: 'Thì động từ & Sự hòa hợp ngữ pháp' },
      { id: 'ngu-am', name: 'Ngữ âm, Nguyên âm & Trọng âm từ' },
      { id: 'doc-hieu', name: 'Đọc hiểu văn bản (Reading)' },
      { id: 'dien-tu', name: 'Điền từ đoạn văn (Cloze Test)' },
      { id: 'tu-vung', name: 'Từ vựng chuyên sâu & Thành ngữ' },
      { id: 'viet-cau', name: 'Viết lại câu & Mệnh đề quan hệ' },
    ],
  },
  {
    slug: 'sinh-hoc',
    name: 'Sinh Học',
    shortCode: 'SINH',
    themeColor: 'text-teal-600',
    badgeBg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-900',
    categories: [
      { id: 'di-truyen-pt', name: 'Di truyền phân tử & Mã di truyền' },
      { id: 'menden', name: 'Quy luật di truyền Menđen' },
      { id: 'quan-the', name: 'Di truyền quần thể & Chọn giống' },
      { id: 'tien-hoa', name: 'Tiến hóa & Sinh thái học' },
    ],
  },
  {
    slug: 'ngu-van',
    name: 'Ngữ Văn',
    shortCode: 'VAN',
    themeColor: 'text-rose-600',
    badgeBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900',
    categories: [
      { id: 'doc-tho', name: 'Đọc hiểu thơ trữ tình' },
      { id: 'doc-van-xuoi', name: 'Đọc hiểu truyện & Ký' },
      { id: 'nlxh', name: 'Nghị luận xã hội' },
      { id: 'nlvh', name: 'Nghị luận văn học' },
    ],
  },
  {
    slug: 'lich-su',
    name: 'Lịch Sử',
    shortCode: 'SU',
    themeColor: 'text-orange-600',
    badgeBg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200 dark:border-orange-900',
    categories: [
      { id: 'tg-hien-dai', name: 'Lịch sử thế giới hiện đại' },
      { id: 'cm-thang-tam', name: 'Cách mạng tháng Tám (1930 - 1945)' },
      { id: 'khang-chien', name: 'Kháng chiến chống Pháp & Mỹ' },
      { id: 'doi-moi', name: 'Thời kỳ Đổi mới và Hội nhập' },
    ],
  },
  {
    slug: 'tin-hoc',
    name: 'Tin Học',
    shortCode: 'TIN',
    themeColor: 'text-cyan-600',
    badgeBg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900',
    categories: [
      { id: 'python-ds', name: 'Lập trình Python & Cấu trúc dữ liệu' },
      { id: 'sql-db', name: 'Cơ sở dữ liệu quan hệ & SQL' },
      { id: 'mang-internet', name: 'Mạng máy tính & An ninh mạng' },
    ],
  },
];

// Ngân hàng câu hỏi mẫu môn Vật Lý
export const MOCK_PHYSICS_QUESTIONS: ExamQuestion[] = [
  {
    id: 'q-ly-01',
    subjectSlug: 'vat-ly',
    subjectName: 'Vật Lý',
    topic: 'Dao động điều hòa & Con lắc',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    grade: 12,
    chapterId: 1,
    title: 'Câu 1 (Nhận biết): Chu kì dao động của con lắc lò xo',
    content: 'Một con lắc lò xo gồm vật nặng khối lượng $m$ và lò xo nhẹ có độ cứng $k$. Chu kì dao động điều hòa của con lắc là:',
    score: 0.5,
    choices: [
      { key: 'A', content: '$T = 2\\pi \\sqrt{\\frac{m}{k}}$' },
      { key: 'B', content: '$T = 2\\pi \\sqrt{\\frac{k}{m}}$' },
      { key: 'C', content: '$T = \\frac{1}{2\\pi} \\sqrt{\\frac{m}{k}}$' },
      { key: 'D', content: '$T = 2\\pi \\sqrt{\\frac{l}{g}}$' },
    ],
    correctChoice: 'A',
    explanation: 'Công thức tính chu kì dao động điều hòa của con lắc lò xo là $T = 2\\pi \\sqrt{\\frac{m}{k}}$. Chọn A.',
  },
  {
    id: 'q-ly-02',
    subjectSlug: 'vat-ly',
    subjectName: 'Vật Lý',
    topic: 'Sóng cơ và Sóng âm',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM',
    grade: 12,
    chapterId: 2,
    title: 'Câu 2 (Thông hiểu): Khoảng cách giữa hai điểm ngược pha trên phương truyền sóng',
    content: 'Một sóng cơ hình sin truyền theo một phương với bước sóng $\\lambda = 20\\text{ cm}$. Khoảng cách ngắn nhất giữa hai điểm dao động ngược pha nhau là:',
    score: 0.5,
    choices: [
      { key: 'A', content: '$10\\text{ cm}$' },
      { key: 'B', content: '$20\\text{ cm}$' },
      { key: 'C', content: '$5\\text{ cm}$' },
      { key: 'D', content: '$40\\text{ cm}$' },
    ],
    correctChoice: 'A',
    explanation: 'Hai điểm dao động ngược pha nhau gần nhau nhất trên phương truyền sóng cách nhau $d = \\frac{\\lambda}{2} = \\frac{20}{2} = 10\\text{ cm}$. Chọn A.',
  },
  {
    id: 'q-ly-03',
    subjectSlug: 'vat-ly',
    subjectName: 'Vật Lý',
    topic: 'Dòng điện xoay chiều & Mạch RLC',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'HARD',
    grade: 12,
    chapterId: 3,
    title: 'Câu 3 (Vận dụng): Cường độ dòng điện hiệu dụng mạch RLC',
    content: 'Đặt điện áp xoay chiều $u = 200\\sqrt{2} \\cos(100\\pi t)\\text{ (V)}$ vào hai đầu đoạn mạch gồm $R = 100\\ \\Omega$ và tụ điện có dung kháng $Z_C = 100\\ \\Omega$ mắc nối tiếp. Cường độ dòng điện hiệu dụng trong mạch là:',
    score: 0.5,
    choices: [
      { key: 'A', content: '$1\\text{ A}$' },
      { key: 'B', content: '$\\sqrt{2}\\text{ A}$' },
      { key: 'C', content: '$2\\text{ A}$' },
      { key: 'D', content: '$2\\sqrt{2}\\text{ A}$' },
    ],
    correctChoice: 'B',
    explanation: 'Tổng trở đoạn mạch: $Z = \\sqrt{R^2 + Z_C^2} = \\sqrt{100^2 + 100^2} = 100\\sqrt{2}\\ \\Omega$.\\nĐiện áp hiệu dụng $U = 200\\text{ V}$. Suy ra $I = \\frac{U}{Z} = \\frac{200}{100\\sqrt{2}} = \\sqrt{2}\\text{ A}$. Chọn B.',
  },
  {
    id: 'q-ly-04',
    subjectSlug: 'vat-ly',
    subjectName: 'Vật Lý',
    topic: 'Sóng ánh sáng & Giao thoa',
    type: 'SHORT_ANSWER',
    difficulty: 'VERY_HARD',
    grade: 12,
    chapterId: 4,
    title: 'Câu 4 (Vận dụng cao): Khoảng vân trong thí nghiệm Young',
    content: 'Trong thí nghiệm Young về giao thoa ánh sáng, khoảng cách giữa hai khe là $a = 1\\text{ mm}$, khoảng cách từ mặt phẳng chứa hai khe đến màn quan sát là $D = 2\\text{ m}$. Ánh sáng đơn sắc có bước sóng $\\lambda = 0,6\\ \\mu\\text{m}$. Tính khoảng vân $i$ theo đơn vị mm (chỉ ghi giá trị số thập phân, ví dụ 1.2):',
    score: 1.0,
    shortAnswerCorrect: '1.2',
    explanation: 'Khoảng vân $i = \\frac{\\lambda D}{a} = \\frac{0,6 \\cdot 10^{-6} \\times 2}{10^{-3}} = 1,2 \\cdot 10^{-3}\\text{ m} = 1,2\\text{ mm}$. Đáp án: 1.2',
  },
];

// Ngân hàng câu hỏi mẫu môn Hóa Học
export const MOCK_CHEMISTRY_QUESTIONS: ExamQuestion[] = [
  {
    id: 'q-hoa-01',
    subjectSlug: 'hoa-hoc',
    subjectName: 'Hóa Học',
    topic: 'Este - Lipit & Chất béo',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    grade: 12,
    chapterId: 1,
    title: 'Câu 1 (Nhận biết): Công thức phân tử este no, đơn chức, mạch hở',
    content: 'Chất nào sau đây là este no, đơn chức, mạch hở?',
    score: 0.5,
    choices: [
      { key: 'A', content: '$\\text{CH}_3\\text{COOCH}_3$' },
      { key: 'B', content: '$\\text{CH}_3\\text{COOH}$' },
      { key: 'C', content: '$\\text{C}_2\\text{H}_5\\text{OH}$' },
      { key: 'D', content: '$\\text{CH}_2=\\text{CH}-\\text{COOCH}_3$' },
    ],
    correctChoice: 'A',
    explanation: '$\\text{CH}_3\\text{COOCH}_3$ (metyl axetat) có công thức tổng quát $\\text{C}_n\\text{H}_{2n}\\text{O}_2$ ($n=3$), là este no, đơn chức, mạch hở. Chọn A.',
  },
  {
    id: 'q-hoa-02',
    subjectSlug: 'hoa-hoc',
    subjectName: 'Hóa Học',
    topic: 'Cacbohidrat (Glucozơ, Saccarozơ)',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM',
    grade: 12,
    chapterId: 2,
    title: 'Câu 2 (Thông hiểu): Thủy phân saccarozơ',
    content: 'Thủy phân hoàn toàn $34,2\\text{ gam}$ saccarozơ với hiệu suất $100\\%$ thu được $m\\text{ gam}$ glucozơ. Giá trị của $m$ là:',
    score: 0.5,
    choices: [
      { key: 'A', content: '$18,0\\text{ g}$' },
      { key: 'B', content: '$36,0\\text{ g}$' },
      { key: 'C', content: '$9,0\\text{ g}$' },
      { key: 'D', content: '$27,0\\text{ g}$' },
    ],
    correctChoice: 'A',
    explanation: '$n_{\\text{saccarozơ}} = \\frac{34,2}{342} = 0,1\\text{ mol}$.\\nPhương trình: $\\text{C}_{12}\\text{H}_{22}\\text{O}_{11} + \\text{H}_2\\text{O} \\to \\text{C}_6\\text{H}_{12}\\text{O}_6\\text{ (glucozơ)} + \\text{C}_6\\text{H}_{12}\\text{O}_6\\text{ (fructozơ)}$.\\n$\\Rightarrow n_{\\text{glucozơ}} = 0,1\\text{ mol} \\Rightarrow m = 0,1 \\times 180 = 18,0\\text{ g}$. Chọn A.',
  },
  {
    id: 'q-hoa-03',
    subjectSlug: 'hoa-hoc',
    subjectName: 'Hóa Học',
    topic: 'Amin, Amino Axit & Peptit',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'HARD',
    grade: 12,
    chapterId: 3,
    title: 'Câu 3 (Vận dụng): Phản ứng của amino axit lưỡng tính',
    content: 'Cho $0,1\\text{ mol}$ axit glutamic tác dụng vừa đủ với dung dịch chứa $\\text{NaOH}$ $1\\text{M}$. Thể tích dung dịch $\\text{NaOH}$ tối thiểu cần dùng là:',
    score: 0.5,
    choices: [
      { key: 'A', content: '$100\\text{ mL}$' },
      { key: 'B', content: '$200\\text{ mL}$' },
      { key: 'C', content: '$300\\text{ mL}$' },
      { key: 'D', content: '$150\\text{ mL}$' },
    ],
    correctChoice: 'B',
    explanation: 'Axit glutamic có $2$ nhóm $-\\text{COOH}$ nên tác dụng với $\\text{NaOH}$ theo tỉ lệ mol $1:2$.\\n$n_{\\text{NaOH}} = 2 \\times 0,1 = 0,2\\text{ mol} \\Rightarrow V = \\frac{0,2}{1} = 0,2\\text{ lít} = 200\\text{ mL}$. Chọn B.',
  },
];

// Ngân hàng câu hỏi mẫu môn Tiếng Anh
export const MOCK_ENGLISH_QUESTIONS: ExamQuestion[] = [
  {
    id: 'q-anh-01',
    subjectSlug: 'tieng-anh',
    subjectName: 'Tiếng Anh',
    topic: 'Thì động từ & Sự hòa hợp ngữ pháp',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    grade: 12,
    chapterId: 1,
    title: 'Question 1: Past Perfect Tense & Time Clauses',
    content: 'By the time the teacher entered the classroom, all the students ______ their homework.',
    score: 0.5,
    choices: [
      { key: 'A', content: 'had finished' },
      { key: 'B', content: 'finished' },
      { key: 'C', content: 'have finished' },
      { key: 'D', content: 'were finishing' },
    ],
    correctChoice: 'A',
    explanation: 'Cấu trúc "By the time + S + V(quá khứ đơn), S + had + V(pII)" diễn tả hành động hoàn thành trước một thời điểm/hành động trong quá khứ. Chọn A.',
  },
  {
    id: 'q-anh-02',
    subjectSlug: 'tieng-anh',
    subjectName: 'Tiếng Anh',
    topic: 'Ngữ âm, Nguyên âm & Trọng âm từ',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM',
    grade: 12,
    chapterId: 2,
    title: 'Question 2: Word Stress Pattern',
    content: 'Mark the letter A, B, C, or D to indicate the word that differs from the other three in the position of primary stress:',
    score: 0.5,
    choices: [
      { key: 'A', content: 'economic' },
      { key: 'B', content: 'photography' },
      { key: 'C', content: 'electronic' },
      { key: 'D', content: 'biological' },
    ],
    correctChoice: 'B',
    explanation: 'photography có trọng âm rơi vào âm tiết thứ 2 (/fəˈtɒɡrəfi/). Ba từ còn lại trọng âm rơi vào âm tiết thứ 3: economic (/ˌiːkəˈnɒmɪk/), electronic (/ɪˌlekˈtrɒnɪk/), biological (/ˌbaɪəˈlɒdʒɪkl/). Chọn B.',
  },
  {
    id: 'q-anh-03',
    subjectSlug: 'tieng-anh',
    subjectName: 'Tiếng Anh',
    topic: 'Từ vựng chuyên sâu & Thành ngữ',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'HARD',
    grade: 12,
    chapterId: 3,
    title: 'Question 3: Collocations & Fixed Expressions',
    content: 'The new environmental policy is aimed at ______ awareness among teenagers about climate change.',
    score: 0.5,
    choices: [
      { key: 'A', content: 'raising' },
      { key: 'B', content: 'rising' },
      { key: 'C', content: 'heightening' },
      { key: 'D', content: 'boosting' },
    ],
    correctChoice: 'A',
    explanation: 'Cụm từ cố định: "raise awareness (about/of something)" có nghĩa là nâng cao nhận thức. "Rise" là nội động từ không có tân ngữ phía sau. Chọn A.',
  },
];

// Ngân hàng câu hỏi mẫu môn Sinh Học
export const MOCK_BIOLOGY_QUESTIONS: ExamQuestion[] = [
  {
    id: 'q-sinh-01',
    subjectSlug: 'sinh-hoc',
    subjectName: 'Sinh Học',
    topic: 'Di truyền phân tử & Mã di truyền',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'EASY',
    grade: 12,
    chapterId: 1,
    title: 'Câu 1 (Nhận biết): Bộ ba mở đầu mã di truyền',
    content: 'Trên mARN, bộ ba nào sau đây quy định tín hiệu mở đầu dịch mã và mã hóa axit amin mêtiônin ở sinh vật nhân thực?',
    score: 0.5,
    choices: [
      { key: 'A', content: '5\'AUG3\'' },
      { key: 'B', content: '5\'UAA3\'' },
      { key: 'C', content: '5\'UAG3\'' },
      { key: 'D', content: '5\'UGA3\'' },
    ],
    correctChoice: 'A',
    explanation: 'Codon 5\'AUG3\' trên mARN là bộ ba mở đầu quy định axit amin Metionin (ở sinh vật nhân thực). Ba bộ ba UAA, UAG, UGA là bộ ba kết thúc. Chọn A.',
  },
];

// Ngân hàng câu hỏi mẫu môn Ngữ Văn
export const MOCK_LITERATURE_QUESTIONS: ExamQuestion[] = [
  {
    id: 'q-van-01',
    subjectSlug: 'ngu-van',
    subjectName: 'Ngữ Văn',
    topic: 'Đọc hiểu thơ trữ tình',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM',
    grade: 12,
    chapterId: 1,
    title: 'Câu 1 (Thông hiểu): Biện pháp tu từ trong thơ',
    content: 'Trong câu thơ "Chao ôi, tiếng hót trong veo như một viên pha lê thả vào lòng giếng cạn", tác giả đã sử dụng biện pháp tu từ nào nổi bật?',
    score: 0.5,
    choices: [
      { key: 'A', content: 'So sánh và ẩn dụ chuyển đổi cảm giác' },
      { key: 'B', content: 'Nhân hóa và phóng đại' },
      { key: 'C', content: 'Chơi chữ và đảo ngữ' },
      { key: 'D', content: 'Điệp từ và nói giảm nói tránh' },
    ],
    correctChoice: 'A',
    explanation: 'Tác giả so sánh tiếng hót (thính giác) "như một viên pha lê" (thị giác) và cảm nhận độ "trong veo", đây là sự kết hợp giữa so sánh và ẩn dụ chuyển đổi cảm giác. Chọn A.',
  },
];

// Gán metadata chuẩn cho bộ câu hỏi Toán 12
const INITIAL_MATH_QUESTIONS: ExamQuestion[] = [
  ...MOCK_EXAM_QUESTIONS_CH1.map((q) => ({
    ...q,
    subjectSlug: 'toan-hoc',
    subjectName: 'Toán Học',
    topic: 'Ứng dụng đạo hàm & Khảo sát đồ thị',
  })),
  ...MOCK_EXAM_QUESTIONS_CH2.map((q) => ({
    ...q,
    subjectSlug: 'toan-hoc',
    subjectName: 'Toán Học',
    topic: 'Tọa độ vectơ & Không gian Oxyz',
  })),
];

// =========================================================================
// TOÀN BỘ KHO CÂU HỎI MẪU TOÀN DIỆN (QUESTION BANK)
// =========================================================================
const ALL_RAW_QUESTIONS: ExamQuestion[] = [
  ...(questionsDb as unknown as ExamQuestion[]),
  ...INITIAL_MATH_QUESTIONS,
  ...MOCK_PHYSICS_QUESTIONS,
  ...MOCK_CHEMISTRY_QUESTIONS,
  ...MOCK_ENGLISH_QUESTIONS,
  ...MOCK_BIOLOGY_QUESTIONS,
  ...MOCK_LITERATURE_QUESTIONS,
];

const QUESTION_BANK_MAP = new Map<string, ExamQuestion>();
for (const q of ALL_RAW_QUESTIONS) {
  if (!QUESTION_BANK_MAP.has(q.id)) {
    QUESTION_BANK_MAP.set(q.id, q);
  }
}

export const MOCK_QUESTION_BANK: ExamQuestion[] = Array.from(QUESTION_BANK_MAP.values());

export function getSystemQuestionBank(): ExamQuestion[] {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('schoolify_system_questions');
      const deletedStr = localStorage.getItem('schoolify_deleted_question_ids');
      const deletedIds = new Set<string>(deletedStr ? JSON.parse(deletedStr) : []);
      const customList: ExamQuestion[] = saved ? JSON.parse(saved) : [];

      const customMap = new Map<string, ExamQuestion>();
      for (const q of customList) {
        customMap.set(q.id, q);
      }

      const result: ExamQuestion[] = [];
      const visited = new Set<string>();

      // Chèn các câu hỏi tùy biến hoặc đã được chỉnh sửa trước
      for (const q of customList) {
        if (!deletedIds.has(q.id) && !visited.has(q.id)) {
          result.push(q);
          visited.add(q.id);
        }
      }

      // Sau đó chèn các câu hỏi mẫu chuẩn (nếu đã bị chỉnh sửa thì lấy từ customMap, nếu bị xóa thì bỏ qua)
      for (const q of MOCK_QUESTION_BANK) {
        if (!deletedIds.has(q.id) && !visited.has(q.id)) {
          const actualQ = customMap.get(q.id) || q;
          result.push(actualQ);
          visited.add(q.id);
        }
      }

      return result;
    } catch (e) {
      // fallback
    }
  }
  return MOCK_QUESTION_BANK;
}

export function addSystemQuestions(newQuestions: ExamQuestion[]) {
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem('schoolify_system_questions');
      const list: ExamQuestion[] = existing ? JSON.parse(existing) : [];

      // Phục hồi lại nếu câu hỏi có id từng nằm trong danh sách đã xóa
      const deletedStr = localStorage.getItem('schoolify_deleted_question_ids');
      if (deletedStr) {
        let deletedIds: string[] = JSON.parse(deletedStr);
        const newIds = new Set(newQuestions.map((q) => q.id));
        deletedIds = deletedIds.filter((id) => !newIds.has(id));
        localStorage.setItem('schoolify_deleted_question_ids', JSON.stringify(deletedIds));
      }

      localStorage.setItem('schoolify_system_questions', JSON.stringify([...newQuestions, ...list]));
    } catch (e) {
      // fallback
    }
  }
}

export function updateSystemQuestion(updatedQuestion: ExamQuestion) {
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem('schoolify_system_questions');
      let list: ExamQuestion[] = existing ? JSON.parse(existing) : [];

      const idx = list.findIndex((q) => q.id === updatedQuestion.id);
      if (idx !== -1) {
        list[idx] = updatedQuestion;
      } else {
        // Nếu là câu hỏi mẫu ban đầu từ MOCK_QUESTION_BANK, đẩy vào danh sách custom để override
        list = [updatedQuestion, ...list];
      }

      // Xóa khỏi danh sách deleted nếu có
      const deletedStr = localStorage.getItem('schoolify_deleted_question_ids');
      if (deletedStr) {
        let deletedIds: string[] = JSON.parse(deletedStr);
        deletedIds = deletedIds.filter((id) => id !== updatedQuestion.id);
        localStorage.setItem('schoolify_deleted_question_ids', JSON.stringify(deletedIds));
      }

      localStorage.setItem('schoolify_system_questions', JSON.stringify(list));
    } catch (e) {
      // fallback
    }
  }
}

export function deleteSystemQuestion(questionId: string) {
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem('schoolify_system_questions');
      if (existing) {
        const list: ExamQuestion[] = JSON.parse(existing);
        const filtered = list.filter((q) => q.id !== questionId);
        localStorage.setItem('schoolify_system_questions', JSON.stringify(filtered));
      }

      // Ghi nhận ID đã xóa để loại bỏ cả trong trường hợp câu hỏi thuộc MOCK_QUESTION_BANK
      const deletedStr = localStorage.getItem('schoolify_deleted_question_ids');
      const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      if (!deletedIds.includes(questionId)) {
        deletedIds.push(questionId);
        localStorage.setItem('schoolify_deleted_question_ids', JSON.stringify(deletedIds));
      }
    } catch (e) {
      // fallback
    }
  }
}

export function resetSystemQuestionBank() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('schoolify_system_questions');
      localStorage.removeItem('schoolify_deleted_question_ids');
    } catch (e) {
      // fallback
    }
  }
}

// Helper lấy đề thi theo cấu hình ma trận
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

  const chapters = getChaptersBySubject(subjectSlug, grade);
  const chapter = chapters.find((c) => c.id === chapterId) || chapters[0] || MATH_GRADE_12_CHAPTERS[0];

  const targetTotal =
    format === 'QUIZ'
      ? opts.quizCount && opts.quizCount >= 10 && opts.quizCount <= 30
        ? opts.quizCount
        : opts.requestedCount && opts.requestedCount >= 10 && opts.requestedCount <= 30
        ? opts.requestedCount
        : 10
      : format === 'ESSAY'
      ? opts.essayCount && opts.essayCount >= 5 && opts.essayCount <= 10
        ? opts.essayCount
        : opts.requestedCount && opts.requestedCount >= 5 && opts.requestedCount <= 10
        ? opts.requestedCount
        : 5
      : (opts.quizCount || 10) + (opts.essayCount || 2);

  // Sinh câu hỏi theo Ma trận tạo đề từ Kho câu hỏi hệ thống (bao gồm cả các câu admin đã import)
  const questionBank = getSystemQuestionBank();
  const questions = generateQuestionsByMatrix(questionBank, {
    subjectSlug,
    grade,
    chapterId,
    level,
    format,
    totalQuestions: targetTotal,
    quizCount: opts.quizCount,
    essayCount: opts.essayCount,
  });

  const duration =
    opts.durationMinutes ||
    (format === 'QUIZ' ? Math.max(15, Math.round(questions.length * 1.5)) : 45);

  let title = '';
  if ((level as string)?.toUpperCase() === 'ASSESSMENT') {
    title = `Đề Khảo Thí Đánh Giá Năng Lực (${questions.length} Câu) - Lớp ${grade}`;
  } else if (format === 'QUIZ') {
    title = `Đề Luyện Trắc Nghiệm (${questions.length} Câu) - ${chapter.name}`;
  } else if (format === 'ESSAY') {
    title = `Đề Luyện Tự Luận (${questions.length} Câu) - ${chapter.name}`;
  } else {
    const qCount = opts.quizCount || 10;
    const eCount = opts.essayCount || 2;
    title = `Đề Luyện Tổng Hợp (${qCount} TN + ${eCount} TL) - ${chapter.name}`;
  }

  const totalPoints = questions.reduce((sum, q) => sum + q.score, 0);

  const subjectNameMap: Record<string, string> = {
    'toan-hoc': 'Toán Học',
    'vat-ly': 'Vật Lý',
    'hoa-hoc': 'Hóa Học',
    'sinh-hoc': 'Sinh Học',
    'tieng-anh': 'Tiếng Anh',
    'lich-su': 'Lịch Sử',
    'dia-ly': 'Địa Lý',
    'gdcd': 'GDKT & Pháp Luật',
    'gdkt': 'GDKT & Pháp Luật',
    'gdkt-phap-luat': 'GDKT & Pháp Luật',
    'giao-duc-kinh-te-va-phap-luat': 'GDKT & Pháp Luật',
    'tin-hoc': 'Tin Học',
    'cong-nghe': 'Công Nghệ',
    'ngu-van': 'Ngữ Văn',
    'khoa-hoc-tu-nhien': 'Khoa Học Tự Nhiên',
  };

  return {
    id: `exam-${subjectSlug}-${level.toLowerCase()}-g${grade}-ch${chapterId}-${format.toLowerCase()}`,
    subjectSlug,
    subjectName: subjectNameMap[subjectSlug] || 'Môn Học K-12',
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
