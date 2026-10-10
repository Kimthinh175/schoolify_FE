export interface QuestionTypeGuide {
  type: string;
  name: string;
  badge: string;
  description: string;
  excelSyntax: string;
  wordSyntax: string;
}

export const QUESTION_TYPE_GUIDES: QuestionTypeGuide[] = [
  {
    type: 'SINGLE_CHOICE',
    name: 'Trắc nghiệm 1 đáp án',
    badge: 'Phổ biến',
    description: 'Chỉ có 1 đáp án đúng trong các phương án A, B, C, D.',
    excelSyntax: 'LoaiCauHoi: TN_1 | DapAnDung: A (hoặc B, C, D)',
    wordSyntax: `Câu 1: [TH] [Chương 1] Đạo hàm của hàm số y = x^2 là:
A. 2
<u>B.</u> 2x  (hoặc *B. 2x hoặc bôi đỏ)
C. x
D. x^2
Lời giải: Ta có (x^2)' = 2x.`,
  },
  {
    type: 'MULTIPLE_CHOICE',
    name: 'Trắc nghiệm nhiều đáp án',
    badge: 'Nhiều lựa chọn',
    description: 'Có thể chọn từ 1 hoặc nhiều phương án đúng cùng lúc.',
    excelSyntax: 'LoaiCauHoi: TN_NHIEU | DapAnDung: A, C (ngăn cách bởi dấu phẩy)',
    wordSyntax: `Câu 2: [VD] Các số nào sau đây là số nguyên tố?
*A. 2
B. 4
*C. 5
D. 9`,
  },
  {
    type: 'TRUE_FALSE',
    name: 'Đúng / Sai đa mệnh đề (2025)',
    badge: 'Chuẩn 2025',
    description: 'Gồm 4 mệnh đề a, b, c, d. Mỗi ý chọn Đúng hoặc Sai. Điểm chia đều 0.25đ/ý.',
    excelSyntax: 'LoaiCauHoi: DUNG_SAI | DapAnDung: Đ, S, Đ, S (hoặc T, F, T, F)',
    wordSyntax: `Câu 3: [TH] Cho hàm số f(x) = x^3 - 3x. Xét tính đúng sai của các mệnh đề sau:
a) Hàm số có tập xác định là R. [Đ]
b) Đạo hàm f'(x) = 3x^2 - 3. [Đ]
c) Hàm số nghịch biến trên khoảng (1; +∞). [S]
d) Giá trị cực đại của hàm số là 2. [Đ]`,
  },
  {
    type: 'FILL_BLANK',
    name: 'Điền số / kết quả ngắn',
    badge: 'Trả lời ngắn',
    description: 'Học sinh tự nhập kết quả là số hoặc từ ngắn vào ô trống.',
    excelSyntax: 'LoaiCauHoi: DIEN_SO | DapAnDung: 3.5 (hoặc chuỗi kết quả)',
    wordSyntax: `Câu 4: [VD] Tính diện tích hình vuông có cạnh bằng 5cm.
Đáp án: 25
Lời giải: Diện tích S = 5 * 5 = 25 cm2.`,
  },
  {
    type: 'ESSAY',
    name: 'Tự luận / Barem điểm',
    badge: 'Tự luận',
    description: 'Học sinh trình bày bài giải tự luận hoặc tải ảnh bài làm.',
    excelSyntax: 'LoaiCauHoi: TU_LUAN | De trong DapAnA-D | LoiGiai: Barem chấm',
    wordSyntax: `Câu 5: [VDC] Trình bày các bước giải phương trình vi phân sau...
Barem điểm:
- Bước 1: 0.5 điểm
- Bước 2: 0.5 điểm`,
  },
  {
    type: 'GROUP_QUESTIONS',
    name: 'Chùm câu hỏi / Ngữ liệu chung',
    badge: 'ĐGNL & Tiếng Anh',
    description: '1 bài đọc / đồ thị / audio chung đi kèm từ 3 đến 5 câu hỏi con bên dưới.',
    excelSyntax: 'LoaiCauHoi: CHUM_CAU | NoiDung: Đoạn văn ngữ liệu mẹ | Sau đó là các câu con',
    wordSyntax: `[BẮT ĐẦU NGỮ LIỆU]
Đọc đoạn trích sau và trả lời các câu hỏi từ 6 đến 8:
"Tràng An là một khu du lịch sinh thái nổi tiếng tại Ninh Bình..."
[KẾT THÚC NGỮ LIỆU]

Câu 6: Tràng An thuộc tỉnh nào?
<u>A.</u> Ninh Bình
B. Nam Định

Câu 7: Tràng An được UNESCO công nhận là di sản gì?
A. Di sản thiên nhiên
<u>B.</u> Di sản kép`,
  },
  {
    type: 'MATCHING',
    name: 'Nối cặp tương ứng A - B',
    badge: 'Ghép cặp',
    description: 'Ghép nối các mục ở Cột 1 với các mục tương ứng ở Cột 2.',
    excelSyntax: 'LoaiCauHoi: NOI_CAP | DapAnA: Vế trái 1 | DapAnB: Vế phải 1 | DapAnDung: A-1, B-2',
    wordSyntax: `Câu 9: Hãy nối các mốc thời gian sau với sự kiện tương ứng:
[Vế trái]
1. 1945
2. 1954
3. 1975
[Vế phải]
A. Chiến thắng Điện Biên Phủ
B. Cách mạng Tháng Tám
C. Giải phóng miền Nam
Đáp án đúng: 1-B, 2-A, 3-C`,
  },
  {
    type: 'ORDERING',
    name: 'Sắp xếp theo thứ tự đúng',
    badge: 'Kéo thả',
    description: 'Kéo thả các sự kiện, câu văn theo đúng thứ tự logic hoặc thời gian.',
    excelSyntax: 'LoaiCauHoi: SAP_XEP | DapAnA..D: Các ý xáo trộn | DapAnDung: 3-1-4-2',
    wordSyntax: `Câu 10: Sắp xếp các bước thực hiện thí nghiệm sau:
1. Chuẩn bị dụng cụ thí nghiệm
2. Nhỏ dung dịch kiềm vào ống nghiệm
3. Quan sát hiện tượng đổi màu
4. Ghi nhận kết quả
Đáp án đúng: 1-2-3-4`,
  },
  {
    type: 'CLOZE_DROPDOWN',
    name: 'Đục lỗ chọn từ (Inline)',
    badge: 'Điền từ inline',
    description: 'Chọn từ phù hợp từ danh sách dropdown nằm ngay trong dòng văn bản.',
    excelSyntax: 'LoaiCauHoi: DUC_LO | NoiDung: Cú pháp [Từ đúng*|Từ sai 1|Từ sai 2]',
    wordSyntax: `Câu 11: Chọn từ thích hợp điền vào chỗ trống:
Nước sôi ở nhiệt độ [100*|90|80] độ C ở áp suất tiêu chuẩn và đóng băng ở [0*|-5|5] độ C.`,
  },
];

export const VALIDATION_RULES_SUMMARY = [
  {
    title: 'Quy ước đáp án đúng trong Word (.docx)',
    content:
      'Hệ thống tự động nhận diện cả 3 cách: Gạch chân (<u>A.</u>), Bôi màu đỏ, hoặc Ký tự hoa thị (*A.). Bạn có thể sử dụng bất kỳ cách nào thuận tiện nhất.',
  },
  {
    title: 'Phân loại mức độ Bloom',
    content:
      'Có thể gắn nhãn [NB] (Nhận biết), [TH] (Thông hiểu), [VD] (Vận dụng), [VDC] (Vận dụng cao) ngay cạnh số câu. Nếu bỏ trống, hệ thống sẽ gán mặc định là [TH].',
  },
  {
    title: 'Công thức Toán học & Khoa học',
    content:
      'Hỗ trợ công thức KaTeX đặt giữa hai dấu đô la, ví dụ: $E = mc^2$ hoặc $\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.',
  },
  {
    title: 'Quy tắc chấm điểm câu Đúng/Sai (2025)',
    content:
      'Điểm được chia đều 0.25đ cho mỗi mệnh đề đúng (tổng 1.0đ cho 4 mệnh đề).',
  },
];
