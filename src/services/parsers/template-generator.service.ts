import * as XLSX from 'xlsx';

export const SAMPLE_EXCEL_ROWS = [
  {
    STT: 1,
    LoaiCauHoi: 'TN_1',
    Chuong: 'Chương 1: Khảo sát hàm số',
    MucDo: 'NB',
    NoiDung: 'Cho hàm số $y = x^3 - 3x + 2$. Điểm cực đại của đồ thị hàm số là:',
    DapAnA: '(-1; 4)',
    DapAnB: '(1; 0)',
    DapAnC: '(0; 2)',
    DapAnD: '(2; 4)',
    DapAnDung: 'A',
    Diem: 0.25,
    LoiGiai: "Ta có y' = 3x^2 - 3 = 0 <=> x = -1 hoặc x = 1. Tại x = -1 thì y = 4 (cực đại).",
    GoiY: 'Tính đạo hàm y\' và lập bảng xét dấu.',
  },
  {
    STT: 2,
    LoaiCauHoi: 'TN_NHIEU',
    Chuong: 'Chương 1: Khảo sát hàm số',
    MucDo: 'VD',
    NoiDung: 'Những mệnh đề nào sau đây là ĐÚNG về tiệm cận của hàm số $y = \\frac{2x+1}{x-1}$?',
    DapAnA: 'Tiệm cận đứng là đường thẳng x = 1',
    DapAnB: 'Tiệm cận đứng là đường thẳng y = 2',
    DapAnC: 'Tiệm cận ngang là đường thẳng y = 2',
    DapAnD: 'Đồ thị hàm số không có tiệm cận ngang',
    DapAnDung: 'A, C',
    Diem: 0.5,
    LoiGiai: 'Tập xác định D = R \\ {1}. Giới hạn x->1 là vô cùng, x->vô cùng là 2.',
    GoiY: 'Xem định nghĩa tiệm cận đứng và ngang.',
  },
  {
    STT: 3,
    LoaiCauHoi: 'DUNG_SAI',
    Chuong: 'Chương 2: Mũ và Logarit',
    MucDo: 'TH',
    NoiDung: 'Cho phương trình $2^{x+1} = 16$. Xét tính đúng sai của các mệnh đề sau:',
    DapAnA: 'Phương trình tương đương với 2^(x+1) = 2^4',
    DapAnB: 'Nghiệm của phương trình là x = 3',
    DapAnC: 'Phương trình vô nghiệm trên tập số thực',
    DapAnD: 'Giá trị x^2 - 1 = 8',
    DapAnDung: 'Đ, Đ, S, Đ',
    Diem: 1.0,
    LoiGiai: '2^(x+1) = 16 <=> x+1 = 4 <=> x = 3. Do đó a, b, d đúng; c sai.',
    GoiY: 'Đưa về cùng cơ số 2.',
  },
  {
    STT: 4,
    LoaiCauHoi: 'DIEN_SO',
    Chuong: 'Chương 1: Khảo sát hàm số',
    MucDo: 'VD',
    NoiDung: 'Tìm giá trị nhỏ nhất của hàm số $f(x) = x + \\frac{4}{x}$ trên đoạn $[1; 3]$.',
    DapAnA: '',
    DapAnB: '',
    DapAnC: '',
    DapAnD: '',
    DapAnDung: '4',
    Diem: 0.25,
    LoiGiai: 'Áp dụng BĐT Cauchy: x + 4/x >= 2 * sqrt(x * 4/x) = 4. Dấu bằng xảy ra khi x = 2 thuộc [1; 3].',
    GoiY: 'Sử dụng bất đẳng thức AM-GM hoặc đạo hàm.',
  },
  {
    STT: 5,
    LoaiCauHoi: 'NOI_CAP',
    Chuong: 'Lịch sử thế giới',
    MucDo: 'NB',
    NoiDung: 'Hãy nối các mốc năm với sự kiện lịch sử tương ứng:',
    DapAnA: '1. Năm 1945 | A. Thành lập Liên Hợp Quốc',
    DapAnB: '2. Năm 1954 | B. Hiệp định Giơ-ne-vơ về Đông Dương',
    DapAnC: '3. Năm 1975 | C. Giải phóng hoàn toàn miền Nam',
    DapAnD: '',
    DapAnDung: '1-A, 2-B, 3-C',
    Diem: 0.75,
    LoiGiai: '1945: LHQ thành lập; 1954: Giơ-ne-vơ; 1975: Thống nhất đất nước.',
    GoiY: 'Xem lại các mốc lịch sử thế kỷ 20.',
  },
  {
    STT: 6,
    LoaiCauHoi: 'SAP_XEP',
    Chuong: 'Kỹ năng mềm',
    MucDo: 'TH',
    NoiDung: 'Sắp xếp quy trình giải quyết vấn đề theo thứ tự logic:',
    DapAnA: '1. Đánh giá kết quả',
    DapAnB: '2. Xác định vấn đề',
    DapAnC: '3. Lên phương án giải quyết',
    DapAnD: '4. Thực thi giải pháp',
    DapAnDung: '2-3-4-1',
    Diem: 0.5,
    LoiGiai: 'Quy trình chuẩn: Xác định vấn đề -> Lên phương án -> Thực thi -> Đánh giá.',
    GoiY: 'Bắt đầu từ việc tìm nguyên nhân.',
  },
  {
    STT: 7,
    LoaiCauHoi: 'DUC_LO',
    Chuong: 'Ngữ pháp Tiếng Anh',
    MucDo: 'TH',
    NoiDung: 'She [lives*|live|living] in Hanoi and [works*|work|working] at a high school.',
    DapAnA: '',
    DapAnB: '',
    DapAnC: '',
    DapAnD: '',
    DapAnDung: 'lives, works',
    Diem: 0.5,
    LoiGiai: 'Chủ ngữ ngôi thứ 3 số ít "She" thì hiện tại đơn thêm "s/es".',
    GoiY: 'Chú ý thì hiện tại đơn với ngôi thứ ba số ít.',
  },
];

/** Tải xuống file Excel template thực tế */
export function downloadExcelTemplate() {
  const worksheet = XLSX.utils.json_to_sheet(SAMPLE_EXCEL_ROWS);

  // Điều chỉnh độ rộng cột
  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 14 }, // LoaiCauHoi
    { wch: 28 }, // Chuong
    { wch: 10 }, // MucDo
    { wch: 55 }, // NoiDung
    { wch: 30 }, // DapAnA
    { wch: 30 }, // DapAnB
    { wch: 30 }, // DapAnC
    { wch: 30 }, // DapAnD
    { wch: 15 }, // DapAnDung
    { wch: 8 },  // Diem
    { wch: 45 }, // LoiGiai
    { wch: 35 }, // GoiY
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Schoolify_Template');

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
