import * as XLSX from 'xlsx';

/** Dữ liệu 11 câu hỏi mẫu chuẩn GDPT đại diện trọn vẹn 9 dạng câu hỏi trong Schoolify */
export const SAMPLE_EXCEL_ROWS = [
  {
    STT: 1,
    MaNhom: '',
    LoaiCauHoi: 'TN_1',
    Chuong: 'Chương 1: Ứng dụng đạo hàm',
    MucDo: 'NB',
    NoiDung: 'Cho hàm số $y = x^3 - 3x + 2$. Điểm cực đại của đồ thị hàm số là:',
    DapAnA: '(-1; 4)',
    DapAnB: '(1; 0)',
    DapAnC: '(0; 2)',
    DapAnD: '(2; 4)',
    DapAnDung: 'A',
    Diem: 0.25,
    LoiGiai: "Ta có y' = 3x^2 - 3 = 0 <=> x = -1 hoặc x = 1. Với x = -1 thì y = 4 (điểm cực đại).",
    GoiY: "Tính đạo hàm y' và lập bảng xét dấu đạo hàm.",
  },
  {
    STT: 2,
    MaNhom: '',
    LoaiCauHoi: 'TN_NHIEU',
    Chuong: 'Chương 1: Khảo sát hàm số',
    MucDo: 'VD',
    NoiDung: 'Những mệnh đề nào sau đây là ĐÚNG về đường tiệm cận của đồ thị hàm số $y = \\frac{2x+1}{x-1}$?',
    DapAnA: 'Tiệm cận đứng là đường thẳng x = 1',
    DapAnB: 'Tiệm cận đứng là đường thẳng y = 2',
    DapAnC: 'Tiệm cận ngang là đường thẳng y = 2',
    DapAnD: 'Đồ thị hàm số không có tiệm cận ngang',
    DapAnDung: 'A, C',
    Diem: 0.5,
    LoiGiai: 'TXĐ: D = R \\ {1}. Giới hạn x->1 là vô cực => TC đứng x = 1. Giới hạn x->vô cực là 2 => TC ngang y = 2.',
    GoiY: 'Xem lại định nghĩa đường tiệm cận đứng và tiệm cận ngang.',
  },
  {
    STT: 3,
    MaNhom: '',
    LoaiCauHoi: 'DUNG_SAI',
    Chuong: 'Chương 2: Mũ và Logarit',
    MucDo: 'TH',
    NoiDung: 'Cho phương trình $2^{x+1} = 16$. Xét tính đúng/sai của các mệnh đề sau:',
    DapAnA: 'Phương trình tương đương với 2^(x+1) = 2^4',
    DapAnB: 'Nghiệm của phương trình là x = 3',
    DapAnC: 'Phương trình vô nghiệm trên tập số thực R',
    DapAnD: 'Giá trị biểu thức x^2 - 1 = 8',
    DapAnDung: 'Đ, Đ, S, Đ',
    Diem: 1.0,
    LoiGiai: '2^(x+1) = 16 <=> x+1 = 4 <=> x = 3. Do đó mệnh đề a, b, d là Đúng; mệnh đề c là Sai.',
    GoiY: 'Đưa hai vế về cùng cơ số 2.',
  },
  {
    STT: 4,
    MaNhom: '',
    LoaiCauHoi: 'DIEN_SO',
    Chuong: 'Chương 1: Giá trị lớn nhất & nhỏ nhất',
    MucDo: 'VD',
    NoiDung: 'Tìm giá trị nhỏ nhất của hàm số $f(x) = x + \\frac{4}{x}$ trên đoạn $[1; 3]$.',
    DapAnA: '',
    DapAnB: '',
    DapAnC: '',
    DapAnD: '',
    DapAnDung: '4',
    Diem: 0.5,
    LoiGiai: 'Áp dụng BĐT AM-GM (Cauchy): x + 4/x >= 2*sqrt(x * 4/x) = 4. Dấu bằng xảy ra khi x = 2 thuộc [1; 3].',
    GoiY: "Sử dụng đạo hàm f'(x) = 1 - 4/x^2 hoặc bất đẳng thức Cauchy.",
  },
  {
    STT: 5,
    MaNhom: '',
    LoaiCauHoi: 'NOI_CAP',
    Chuong: 'Lịch sử Việt Nam & Thế giới',
    MucDo: 'NB',
    NoiDung: 'Hãy nối các mốc năm lịch sử với sự kiện trọng đại tương ứng:',
    DapAnA: '1. Năm 1945 | A. Thành lập Liên Hợp Quốc & CMT8 thành công',
    DapAnB: '2. Năm 1954 | B. Hiệp định Giơ-ne-vơ về Đông Dương',
    DapAnC: '3. Năm 1975 | C. Giải phóng hoàn toàn miền Nam, thống nhất đất nước',
    DapAnD: '',
    DapAnDung: '1-A, 2-B, 3-C',
    Diem: 0.75,
    LoiGiai: '1945: CMT8 thành công và thành lập LHQ; 1954: Hiệp định Giơ-ne-vơ; 1975: Đại thắng mùa Xuân.',
    GoiY: 'Xem lại các mốc thời gian thế kỷ 20 trong SGK Lịch sử.',
  },
  {
    STT: 6,
    MaNhom: '',
    LoaiCauHoi: 'SAP_XEP',
    Chuong: 'Phương pháp khoa học',
    MucDo: 'TH',
    NoiDung: 'Sắp xếp quy trình giải quyết vấn đề theo đúng thứ tự logic chuẩn:',
    DapAnA: '1. Đánh giá kết quả và cải tiến giải pháp',
    DapAnB: '2. Nhận diện và xác định cốt lõi vấn đề',
    DapAnC: '3. Lên phương án và lập kế hoạch thực thi',
    DapAnD: '4. Triển khai thực hiện phương án đã chọn',
    DapAnDung: '2-3-4-1',
    Diem: 0.5,
    LoiGiai: 'Quy trình logic chuẩn: 1) Nhận diện vấn đề -> 2) Lên phương án -> 3) Thực thi -> 4) Đánh giá kết quả.',
    GoiY: 'Bước đầu tiên luôn phải là tìm ra nguyên nhân và xác định vấn đề.',
  },
  {
    STT: 7,
    MaNhom: '',
    LoaiCauHoi: 'DUC_LO',
    Chuong: 'Ngữ pháp Tiếng Anh',
    MucDo: 'TH',
    NoiDung: 'She [lives*|live|living] in Hanoi and [works*|work|working] as a software engineer at a tech firm.',
    DapAnA: '',
    DapAnB: '',
    DapAnC: '',
    DapAnD: '',
    DapAnDung: 'lives, works',
    Diem: 0.5,
    LoiGiai: 'Chủ ngữ "She" là ngôi thứ 3 số ít, động từ ở thì hiện tại đơn (Present Simple) phải chia thêm "s/es".',
    GoiY: 'Xem quy tắc chia động từ thì hiện tại đơn.',
  },
  {
    STT: 8,
    MaNhom: 'N1',
    LoaiCauHoi: 'CHUM_CAU',
    Chuong: 'Đọc hiểu Tiếng Anh',
    MucDo: 'TH',
    NoiDung: 'Read the following passage and answer the questions that follow: "Renewable energy comes from natural sources that are constantly replenished, such as sunlight, wind, and water. Unlike fossil fuels, renewable sources produce little to no greenhouse gases during operation, making them essential for curbing climate change and protecting biodiversity."',
    DapAnA: '',
    DapAnB: '',
    DapAnC: '',
    DapAnD: '',
    DapAnDung: '',
    Diem: 0.0,
    LoiGiai: 'Đoạn trích bài đọc ngữ liệu chung cho nhóm câu hỏi N1.',
    GoiY: 'Đọc kỹ ngữ liệu để tìm dẫn chứng cho các câu hỏi con.',
  },
  {
    STT: 9,
    MaNhom: 'N1',
    LoaiCauHoi: 'TN_1',
    Chuong: 'Đọc hiểu Tiếng Anh',
    MucDo: 'NB',
    NoiDung: 'According to the passage, what is a primary characteristic of renewable energy?',
    DapAnA: 'It comes from natural sources that are constantly replenished',
    DapAnB: 'It creates large amounts of greenhouse gases',
    DapAnC: 'It is derived completely from coal and crude oil',
    DapAnD: 'It cannot be used for electricity generation',
    DapAnDung: 'A',
    Diem: 0.25,
    LoiGiai: 'Dẫn chứng câu 1: "Renewable energy comes from natural sources that are constantly replenished".',
    GoiY: 'Tìm cụm từ "constantly replenished" trong đoạn văn.',
  },
  {
    STT: 10,
    MaNhom: 'N1',
    LoaiCauHoi: 'TN_1',
    Chuong: 'Đọc hiểu Tiếng Anh',
    MucDo: 'TH',
    NoiDung: 'Why is renewable energy considered crucial for curbing climate change?',
    DapAnA: 'Because it produces little to no greenhouse gases during operation',
    DapAnB: 'Because it consumes more fossil fuels than traditional power plants',
    DapAnC: 'Because it heats up surrounding urban areas',
    DapAnD: 'Because it depletes freshwater reserves rapidly',
    DapAnDung: 'A',
    Diem: 0.25,
    LoiGiai: 'Dẫn chứng câu 2: "produce little to no greenhouse gases during operation, making them essential for curbing climate change".',
    GoiY: 'Xem câu thứ 2 của đoạn văn.',
  },
  {
    STT: 11,
    MaNhom: '',
    LoaiCauHoi: 'TU_LUAN',
    Chuong: 'Chương 1: Khảo sát hàm số',
    MucDo: 'VDC',
    NoiDung: 'Cho hàm số $y = x^3 - 3mx^2 + 3(m^2 - 1)x$. Tìm tất cả các giá trị của tham số $m$ để hàm số đồng biến trên khoảng $(1; 2)$.',
    DapAnA: '',
    DapAnB: '',
    DapAnC: '',
    DapAnD: '',
    DapAnDung: 'm <= 0 hoặc m >= 3',
    Diem: 1.5,
    LoiGiai: "Barem điểm chi tiết: 1) Tính đạo hàm y' = 3x^2 - 6mx + 3(m^2-1) (0.5đ). 2) Lập điều kiện y' >= 0 với mọi x thuộc (1; 2) (0.5đ). 3) Biện luận nghiệm tam thức bậc hai và kết luận m <= 0 hoặc m >= 3 (0.5đ).",
    GoiY: "Hàm số đồng biến trên khoảng khi và chỉ khi y' >= 0 với mọi x thuộc khoảng đó.",
  },
];

/** Bảng hướng dẫn chi tiết quy tắc điền từng dạng câu hỏi cho Admin */
export const EXCEL_GUIDE_ROWS = [
  {
    STT: 1,
    TenDang: 'Trắc nghiệm 1 đáp án đúng',
    MaLoai: 'TN_1',
    MucDich: 'Trắc nghiệm 4 phương án truyền thống (A, B, C, D)',
    CotDapAnA_D: 'Nhập nội dung tương ứng vào cột DapAnA, DapAnB, DapAnC, DapAnD',
    CotDapAnDung: 'Nhập ký tự phương án đúng: A hoặc B hoặc C hoặc D',
    ViDuDapAnDung: 'A',
    GhiChu: 'Bắt buộc tối thiểu 2 đáp án (A, B).',
  },
  {
    STT: 2,
    TenDang: 'Trắc nghiệm nhiều đáp án đúng',
    MaLoai: 'TN_NHIEU',
    MucDich: 'Học sinh có thể tích chọn từ 2 phương án đúng trở lên',
    CotDapAnA_D: 'Nhập nội dung phương án vào DapAnA, B, C, D',
    CotDapAnDung: 'Nhập các đáp án đúng cách nhau dấu phẩy hoặc chấm phẩy',
    ViDuDapAnDung: 'A, C (hoặc A, B, D)',
    GhiChu: 'Hệ thống tự động chấm điểm theo từng lựa chọn đúng.',
  },
  {
    STT: 3,
    TenDang: 'Đúng / Sai đa mệnh đề (THPT 2025)',
    MaLoai: 'DUNG_SAI',
    MucDich: 'Dạng trắc nghiệm Đúng/Sai 4 ý a, b, c, d chuẩn Bộ GD&ĐT 2025',
    CotDapAnA_D: 'DapAnA = Mệnh đề a, DapAnB = Mệnh đề b, DapAnC = Mệnh đề c, DapAnD = Mệnh đề d',
    CotDapAnDung: 'Nhập tính đúng sai 4 ý: Đ, S, Đ, S (hoặc T, F, T, F hoặc 1, 0, 1, 0)',
    ViDuDapAnDung: 'Đ, Đ, S, Đ',
    GhiChu: 'Điểm chuẩn 1.0đ. Bậc thang: đúng 1 ý = 0.1đ, 2 ý = 0.25đ, 3 ý = 0.5đ, 4 ý = 1.0đ.',
  },
  {
    STT: 4,
    TenDang: 'Điền số / Trả lời ngắn (THPT 2025)',
    MaLoai: 'DIEN_SO',
    MucDich: 'Học sinh tự điền kết quả vào ô trống (không có phương án gợi ý)',
    CotDapAnA_D: 'Để trống cả 4 cột DapAnA, B, C, D',
    CotDapAnDung: 'Nhập kết quả số hoặc chuỗi ký tự ngắn chính xác',
    ViDuDapAnDung: '4 (hoặc -2.5 hoặc 3/4)',
    GhiChu: 'Hỗ trợ số nguyên, số thực, phân số.',
  },
  {
    STT: 5,
    TenDang: 'Nối cặp tương ứng (Matching)',
    MaLoai: 'NOI_CAP',
    MucDich: 'Nối các mục ở vế trái với các mục ở vế phải',
    CotDapAnA_D: 'Nhập định dạng: Vế trái | Vế phải (dấu gạch đứng | ở giữa)',
    CotDapAnDung: 'Nhập quy tắc ghép: 1-A, 2-B, 3-C (hoặc theo thứ tự các cặp)',
    ViDuDapAnDung: '1-A, 2-B, 3-C',
    GhiChu: 'Tối thiểu 2 cặp nối. Hệ thống tự động trích xuất 2 cột để học sinh kéo nối.',
  },
  {
    STT: 6,
    TenDang: 'Sắp xếp thứ tự logic (Ordering)',
    MaLoai: 'SAP_XEP',
    MucDich: 'Sắp xếp các bước, dòng sự kiện theo trình tự đúng',
    CotDapAnA_D: 'Nhập các bước/sự kiện vào DapAnA, DapAnB, DapAnC, DapAnD',
    CotDapAnDung: 'Nhập thứ tự số nối nhau bằng dấu gạch ngang (ví dụ 2-3-4-1)',
    ViDuDapAnDung: '2-3-4-1 (hoặc B-C-D-A)',
    GhiChu: 'Giao diện hiển thị các khối thẻ xáo trộn để người học kéo thả.',
  },
  {
    STT: 7,
    TenDang: 'Đục lỗ chọn từ (Cloze Dropdown)',
    MaLoai: 'DUC_LO',
    MucDich: 'Điền từ khuyết chọn từ danh sách menu thả xuống inline',
    CotDapAnA_D: 'Để trống các cột DapAnA..D',
    CotDapAnDung: 'Cú pháp trong NoiDung: [từ_đúng*|từ_sai1|từ_sai2]. Từ đúng có dấu sao *',
    ViDuDapAnDung: 'lives, works (tự động nhận diện từ có dấu *)',
    GhiChu: 'Rất thích hợp cho môn Tiếng Anh, Ngữ văn và Hoá học.',
  },
  {
    STT: 8,
    TenDang: 'Chùm câu hỏi ngữ liệu đọc hiểu',
    MaLoai: 'CHUM_CAU',
    MucDich: 'Đoạn văn đọc hiểu / Đồ thị dùng chung cho nhiều câu hỏi con',
    CotDapAnA_D: 'Câu mẹ để trống A..D. Các câu con bên dưới nhập A..D như bình thường',
    CotDapAnDung: 'Câu mẹ để trống DapAnDung. Các câu con điền DapAnDung tương ứng',
    ViDuDapAnDung: 'Cột MaNhom điền N1 cho câu mẹ và tất cả câu con',
    GhiChu: 'Điểm câu mẹ là 0đ. Điểm tính vào từng câu con.',
  },
  {
    STT: 9,
    TenDang: 'Tự luận có barem điểm',
    MaLoai: 'TU_LUAN',
    MucDich: 'Bài tập tự luận, trình bày lời giải chi tiết',
    CotDapAnA_D: 'Để trống các cột DapAnA..D',
    CotDapAnDung: 'Nhập đáp số tóm tắt hoặc barem tiêu chí chấm điểm',
    ViDuDapAnDung: 'm <= 0 hoặc m >= 3',
    GhiChu: 'Cột LoiGiai ghi rõ barem điểm từng bước để giáo viên chấm bài.',
  },
];

/** Bảng quy ước mức độ nhận thức và điểm chuẩn */
export const EXCEL_DIFFICULTY_RULES = [
  {
    MaMucDo: 'NB',
    TenMucDo: 'Nhận biết',
    MoTa: 'Nhận biết khái niệm, công thức, định nghĩa cơ bản trong SGK',
    DiemKhuyenNghi: '0.25 điểm',
  },
  {
    MaMucDo: 'TH',
    TenMucDo: 'Thông hiểu',
    MoTa: 'Hiểu bản chất, vận dụng trực tiếp công thức vào bài toán đơn giản',
    DiemKhuyenNghi: '0.25 - 0.50 điểm',
  },
  {
    MaMucDo: 'VD',
    TenMucDo: 'Vận dụng',
    MoTa: 'Vận dụng kiến thức giải bài toán liên hệ, tính toán đa bước',
    DiemKhuyenNghi: '0.50 - 1.00 điểm',
  },
  {
    MaMucDo: 'VDC',
    TenMucDo: 'Vận dụng cao',
    MoTa: 'Bài toán phân loại học sinh khá giỏi, tích hợp nhiều chuyên đề',
    DiemKhuyenNghi: '1.00 - 2.00 điểm',
  },
];

/** Tải xuống file Excel template thực tế gồm 3 Sheet chuyên nghiệp */
export function downloadExcelTemplate() {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Mẫu câu hỏi 9 dạng
  const ws1 = XLSX.utils.json_to_sheet(SAMPLE_EXCEL_ROWS);
  ws1['!cols'] = [
    { wch: 6 },  // STT
    { wch: 10 }, // MaNhom
    { wch: 16 }, // LoaiCauHoi
    { wch: 32 }, // Chuong
    { wch: 10 }, // MucDo
    { wch: 65 }, // NoiDung
    { wch: 35 }, // DapAnA
    { wch: 35 }, // DapAnB
    { wch: 35 }, // DapAnC
    { wch: 35 }, // DapAnD
    { wch: 18 }, // DapAnDung
    { wch: 8 },  // Diem
    { wch: 50 }, // LoiGiai
    { wch: 40 }, // GoiY
  ];
  XLSX.utils.book_append_sheet(workbook, ws1, 'Mau_Cau_Hoi_9_Dang');

  // Sheet 2: Hướng dẫn chi tiết
  const ws2 = XLSX.utils.json_to_sheet(EXCEL_GUIDE_ROWS);
  ws2['!cols'] = [
    { wch: 6 },
    { wch: 32 },
    { wch: 16 },
    { wch: 45 },
    { wch: 55 },
    { wch: 45 },
    { wch: 25 },
    { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(workbook, ws2, 'Huong_Dan_Chi_Tiet');

  // Sheet 3: Quy ước mức độ & điểm
  const ws3 = XLSX.utils.json_to_sheet(EXCEL_DIFFICULTY_RULES);
  ws3['!cols'] = [
    { wch: 12 },
    { wch: 20 },
    { wch: 55 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(workbook, ws3, 'Quy_Uoc_Muc_Do_Diem');

  XLSX.writeFile(workbook, 'schoolify_question_template.xlsx');
}

/** Tải xuống file mẫu Word (.docx hoặc .txt định dạng chuẩn) */
export function downloadWordTemplate() {
  const content = `HƯỚNG DẪN SOẠN ĐỀ THI TRÊN FILE WORD CHO SCHOOLIFY ADMIN
(Lưu ý: Bạn có thể sao chép định dạng này vào file Word .docx của bạn)
====================================================================

Câu 1: [NB] [Chương 1: Đạo hàm] Đạo hàm của hàm số y = x^2 là gì?
A. 2
<u>B.</u> 2x
C. x
D. 2x^2
Lời giải:
Áp dụng công thức (x^n)' = n * x^(n-1). Suy ra (x^2)' = 2x. Chọn B.

Câu 2: [TH] [Chương 1: Khảo sát hàm số] Điểm cực trị của hàm số y = -x^2 + 4x là:
A. (0; 0)
*B. (2; 4)
C. (4; 0)
D. (1; 3)
Lời giải:
Ta có y' = -2x + 4 = 0 <=> x = 2 => y = 4. Chọn B.

Câu 3: [TH] [Chương 2: Mũ và Logarit] Xét tính đúng sai của các mệnh đề sau:
a) 2^3 = 8 [Đ]
b) log2(4) = 3 [S]
c) log10(100) = 2 [Đ]
d) 5^0 = 0 [S]

Câu 4: [VD] [Hình học] Tính diện tích hình vuông có cạnh a = 6cm.
Đáp án: 36
Lời giải:
Diện tích S = a * a = 6 * 6 = 36 cm2.

Câu 5: [TH] [Lịch sử] Hãy nối các sự kiện tương ứng:
[Vế trái]
1. 1945
2. 1975
[Vế phải]
A. Cách mạng Tháng Tám
B. Giải phóng miền Nam
Đáp án đúng: 1-A, 2-B

Câu 6: [TH] [Tiếng Anh] Chọn từ đúng điền vào chỗ trống:
He [is*|are|am] a student and [likes*|like] reading books.
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_schoolify_exam_format.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
