# API Contract & Tài Liệu Kỹ Thuật — Trang Giáo Viên `/teacher/questions`
### Studio Ngân Hàng Đề Thi & Import File Câu Hỏi Đa Định Dạng (Word & Excel)

> Tài liệu bàn giao Backend & Chi tiết Kỹ thuật Frontend. Mọi schema dưới đây **khớp 1-1 với TypeScript types** mà Frontend sử dụng (`src/types/*`), đảm bảo nối API thông suốt.

---

## 1. Tổng quan

- **Màn hình:** Studio Ngân Hàng Đề Thi Giáo Viên — Quản lý `QuestionBank` (`is_premium`), soạn thảo câu hỏi động (`SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TRUE_FALSE`, `ESSAY`), quản lý danh sách `Answer` (`is_correct`, `explain`) & Import file câu hỏi từ Word (`.docx`) / Excel (`.xlsx`).
- **Bảng ERD liên quan:** `TeacherProfile`, `QuestionBank`, `Question`, `Answer`.
- **Đặc trưng nâng cao (Hướng B):**
  - Trích xuất tự động **Chữ + Bảng biểu + Ảnh nhúng Base64 + Công thức Toán LaTeX** từ file Word nhị phân.
  - Cung cấp File mẫu tải trực tiếp (`.docx` / `.xlsx`) và Link xem/tạo bản sao trên Google Drive (Google Docs / Google Sheets).
  - Quy trình Import 4 bước (Modal Stepper): Chọn Ngân hàng & Tải mẫu ➔ Upload file/Dán chữ ➔ Xem trước (Preview) & Sửa loại câu hỏi linh hoạt ➔ Xác nhận lưu hàng loạt.

---

## 2. Quy ước chung (Backend bắt buộc tuân thủ)

| Hạng mục | Quy ước |
| :--- | :--- |
| Base URL | `/api/v1` |
| Auth | `Authorization: Bearer <JWT>` — role yêu cầu: `TEACHER` |
| **teacher_id** | Suy ra từ token: `JWT.sub (user_id) → TeacherProfile.user_id → TeacherProfile.id` |
| Content-Type | `application/json; charset=utf-8` (ngoại trừ API Parse File dùng `multipart/form-data`) |
| Thời gian | ISO 8601 UTC, ví dụ `2026-09-16T22:20:00Z` |
| Success Envelope | `{ "success": true, "data": <payload>, "meta"?: { ... } }` |
| Error Envelope | `{ "success": false, "code": "STRING_CODE", "message": "Mô tả lỗi" }` |

---

## 3. Kiến Trúc Kỹ Thuật & Thư Viện Sử Dụng (Implementation Details)

### 3.1. Danh sách Thư viện Sử dụng (Libraries & Tech Stack)

| Thư viện | Tên package | Mục đích sử dụng |
| :--- | :--- | :--- |
| **JSZip** | `jszip` | Giải nén file nhị phân `.docx` (định dạng ZIP) trực tiếp trên Trình duyệt/Node.js để truy cập `word/document.xml`, `word/_rels/document.xml.rels` và thư mục ảnh `/media/`. |
| **Mammoth** | `mammoth` | Thư viện dự phòng trích xuất văn bản thô từ file Word khi file bị hỏng XML. |
| **KaTeX** | `katex`, `react-katex` | Render công thức toán học dạng LaTeX inline (`$...$`) và block (`$$...$$`) mịn đẹp (`MathText`). |
| **Lucide React** | `lucide-react` | Bộ icon chuẩn UI/UX (`Sparkles`, `UploadCloud`, `CheckCircle2`, `Trash2`, `FolderPlus`,...). |

---

### 3.2. Quy Trình Bóc Tách File Word (.docx) & Công Thức Toán (OMML → LaTeX)

Xử lý trực tiếp trong hàm `extractDocxTextWithMath` ([`question-bank.service.ts`](file:///f:/schoolify_FE/src/services/question-bank.service.ts#L155-L218)):

1. **Đọc Cấu trúc ZIP**: Giải nén file `.docx` bằng `JSZip.loadAsync(arrayBuffer)`.
2. **Trích xuất Hình Ảnh Nhúng**:
   - Đọc file `word/_rels/document.xml.rels` để map ID quan hệ (`rId`) với đường dẫn ảnh trong `/word/media/`.
   - Đọc các tệp hình ảnh nhị phân và chuyển đổi thành **Base64 Data URL** (`data:image/png;base64,...`) nhúng trực tiếp vào văn bản Markdown (`![Hình minh họa](data:...)`).
3. **Chuyển đổi Công thức Toán Word (OMML → LaTeX)**:
   - Các thẻ toán trong Word XML thuộc namespace `<m:oMath>`.
   - Hàm `ommlToLatex` sử dụng Regex thay thế đệ quy:
     - Phân số `<m:f>` $\rightarrow$ `\frac{N}{D}`
     - Số mũ `<m:sSup>` $\rightarrow$ `E^{S}`
     - Chỉ số dưới `<m:sSub>` $\rightarrow$ `E_{S}`
     - Dấu ngoặc `<m:d>` $\rightarrow$ `(nội dung)`
     - Thẻ ký tự `<m:t>` và `<w:t>` $\rightarrow$ trích xuất chữ thô.
   - Kết quả công thức toán được bọc trong cặp dấu `$...$` để KaTeX render.
4. **Trích xuất Bảng Biểu (Word Tables `<w:tbl>`)**:
   - Hàm `parseTableXml` duyệt qua từng thẻ dòng `<w:tr>` và ô `<w:tc>`, chuyển đổi thành bảng Markdown (`| Cột 1 | Cột 2 |`).

---

### 3.3. Thuật Toán Nhận Diện & Bóc Tách Đề Thi (`parseExamTextToQuestions`)

Xử lý trong hàm `parseExamTextToQuestions` ([`question-bank.service.ts`](file:///f:/schoolify_FE/src/services/question-bank.service.ts#L220-L368)):

- **Nhận diện Cấu trúc Đề thi**:
  - `Phần 1`: Trắc nghiệm 4 đáp án A, B, C, D $\rightarrow$ Gán `SINGLE_CHOICE` hoặc `MULTIPLE_CHOICE`.
  - `Phần 2`: Đúng/Sai các ý a), b), c), d) $\rightarrow$ Gán `TRUE_FALSE`.
  - `Phần 3`: Trả lời ngắn / Tự luận $\rightarrow$ Gán `ESSAY`.
- **Regex Nhận diện Đầu câu hỏi**: `^Câu\s+(\d+)[\.:]\s*(.*)`
- **Regex Bóc tách Đáp án Trắc nghiệm**: `([A-D])[\.\)]\s*([\s\S]*?)(?=(?:\s+[A-D][\.\)]|\t+[A-D][\.\)]|$))`
- **Đánh dấu Đáp án Đúng**:
  - Nhận diện ký tự `*` trước đáp án (ví dụ `*A.` hoặc `*B.`).
  - Nếu có từ 2 đáp án đúng trở lên $\rightarrow$ Tự động chuyển `question_type` thành `MULTIPLE_CHOICE`.
  - Mặc định đáp án đầu tiên A được tích chọn nếu không có ngôi sao.

---

### 3.4. Xử Lý Trải Nghiệm Người Dùng (UX & State Management) ở Modal Import 4 Bước

1. **Lựa chọn Loại Câu Hỏi 100% Tiếng Việt** ([`QuestionImportModal.tsx`](file:///f:/schoolify_FE/src/components/features/teacher/questions/QuestionImportModal.tsx#L584-L590)):
   - Thay thế Badge tĩnh bằng Dropdown `<select>` cho phép đổi loại câu hỏi ngay ở Bước 3 (Preview): `Trắc nghiệm 1 đáp án`, `Trắc nghiệm nhiều đáp án`, `Câu hỏi Đúng / Sai`, `Câu hỏi Tự luận`.
2. **Bảo Lưu Dữ Liệu Đáp Án Khi Chuyển Sang Tự Luận**:
   - Khi chọn `ESSAY`, danh sách 4 đáp án A, B, C, D vẫn được bảo lưu trong state `answers` thay vì xoá.
   - Hiển thị Banner chú thích tinh tế màu xám trung tính: `ℹ️ Chế độ Tự luận: Đã tạm ẩn N lựa chọn trắc nghiệm. Đổi lại Trắc nghiệm để khôi phục.`
3. **Phân biệt Thẻ Lời giải / Đáp số**:
   - Thẻ Lời giải có thiết kế viền tím nổi bật bên trái (`border-l-4 border-l-purple-500 bg-purple-50/50`) cùng icon `✨ Lời giải / Đáp số:`, phân biệt hoàn toàn với Banner chế độ tự luận.
4. **Tự động Re-fetch Dữ liệu Chi tiết Ngân Hàng**:
   - `QuestionStudioView` dùng `refreshKey` trigger làm mới `QuestionBankDetail` ngay khi hoàn tất batch import, giúp danh sách và các tab lọc loại câu hỏi được làm mới lập tức.

---

## 4. Danh sách Endpoints Chi Tiết

### 4.1. Lấy danh sách Ngân hàng đề thi của giáo viên
- **Method:** `GET`
- **Endpoint:** `/api/v1/teacher/question-banks`
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:**
  - `search` *(string - Tìm theo tiêu đề/mô tả)*
  - `is_premium` *(boolean - Lọc theo ngân hàng trả phí/miễn phí)*
  - `page` *(number - Default: 1)*
  - `limit` *(number - Default: 10)*
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "bank-001",
        "teacher_id": "tch-123",
        "title": "Ngân hàng Trắc nghiệm Toán 12 - Chương 1",
        "description": "Tập hợp câu hỏi Ôn tập Giải Tích 12",
        "is_premium": true,
        "total_questions": 45,
        "created_at": "2026-09-01T08:00:00Z",
        "updated_at": "2026-09-15T10:30:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total_items": 1, "total_pages": 1 }
  }
}
```

---

### 4.2. Tạo mới Ngân hàng đề thi
- **Method:** `POST`
- **Endpoint:** `/api/v1/teacher/question-banks`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "title": "Ngân hàng Đề Thi Học Kỳ 1 - Vật Lý 11",
  "description": "Các câu hỏi kiểm tra giữa kỳ và cuối kỳ",
  "is_premium": false
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Tạo ngân hàng đề thi thành công",
  "data": {
    "id": "bank-002",
    "teacher_id": "tch-123",
    "title": "Ngân hàng Đề Thi Học Kỳ 1 - Vật Lý 11",
    "description": "Các câu hỏi kiểm tra giữa kỳ và cuối kỳ",
    "is_premium": false,
    "total_questions": 0,
    "created_at": "2026-09-16T22:20:00Z",
    "updated_at": "2026-09-16T22:20:00Z"
  }
}
```

---

### 4.3. Lấy danh sách câu hỏi trong Ngân hàng đề
- **Method:** `GET`
- **Endpoint:** `/api/v1/teacher/question-banks/{bank_id}/questions`
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:**
  - `question_type` *(enum: `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TRUE_FALSE`, `ESSAY`)*
  - `search` *(string - Tìm theo nội dung câu hỏi)*
  - `page` *(number)*
  - `limit` *(number)*
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "q-101",
        "question_bank_id": "bank-001",
        "content": "Thủ đô của Việt Nam là gì?",
        "question_type": "SINGLE_CHOICE",
        "explain": "Hà Nội là thủ đô chính thức từ năm 1976.",
        "points": 1.0,
        "order_index": 1,
        "answers": [
          { "id": "ans-1", "question_id": "q-101", "content": "TP. Hồ Chí Minh", "is_correct": false, "order_index": 0 },
          { "id": "ans-2", "question_id": "q-101", "content": "Hà Nội", "is_correct": true, "order_index": 1 },
          { "id": "ans-3", "question_id": "q-101", "content": "Đà Nẵng", "is_correct": false, "order_index": 2 },
          { "id": "ans-4", "question_id": "q-101", "content": "Cần Thơ", "is_correct": false, "order_index": 3 }
        ]
      }
    ]
  }
}
```

---

### 4.4. Thêm mới / Cập nhật câu hỏi thủ công
- **Method:** `POST` (Tạo mới) / `PUT` (Cập nhật)
- **Endpoint:** `/api/v1/teacher/questions` (POST) | `/api/v1/teacher/questions/{question_id}` (PUT)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "question_bank_id": "bank-001",
  "content": "Các số nào sau đây là số chẵn?",
  "question_type": "MULTIPLE_CHOICE",
  "explain": "2 và 4 chia hết cho 2",
  "points": 1.0,
  "answers": [
    { "content": "2", "is_correct": true, "order_index": 0 },
    { "content": "3", "is_correct": false, "order_index": 1 },
    { "content": "4", "is_correct": true, "order_index": 2 },
    { "content": "5", "is_correct": false, "order_index": 3 }
  ]
}
```

---

### 4.5. Xóa câu hỏi khỏi Ngân hàng đề
- **Method:** `DELETE`
- **Endpoint:** `/api/v1/teacher/questions/{question_id}`
- **Response `200 OK`:**
```json
{ "success": true, "message": "Xóa câu hỏi thành công" }
```

---

### 4.6. Phân tích & Trích xuất File Import (Parse Word & Excel)
- **Method:** `POST`
- **Endpoint:** `/api/v1/teacher/questions/parse-import`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Form Data:**
  - `file`: File binary (`.docx` hoặc `.xlsx`)
  - `file_type`: `"WORD"` | `"EXCEL"`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "summary": { "total_parsed": 5, "valid_count": 4, "invalid_count": 1 },
    "parsed_questions": [
      {
        "temp_id": "temp-1",
        "question_type": "SINGLE_CHOICE",
        "content": "Cho hàm số $y = f(x)$ có bảng biến thiên. Tính $f'(1)$. <img src='data:image/png;base64,iVBORw0KGgo...' />",
        "explain": "Áp dụng định lý đạo hàm",
        "points": 1.0,
        "is_valid": true,
        "validation_errors": [],
        "answers": [
          { "content": "1", "is_correct": true },
          { "content": "0", "is_correct": false }
        ]
      },
      {
        "temp_id": "temp-2",
        "question_type": "SINGLE_CHOICE",
        "content": "Câu hỏi thiếu đáp án đúng?",
        "explain": "",
        "points": 1.0,
        "is_valid": false,
        "validation_errors": ["Vui lòng chọn ít nhất 1 đáp án đúng"],
        "answers": [
          { "content": "Đáp án A", "is_correct": false },
          { "content": "Đáp án B", "is_correct": false }
        ]
      }
    ]
  }
}
```

---

### 4.7. Lưu hàng loạt câu hỏi từ Import vào Ngân hàng đề
- **Method:** `POST`
- **Endpoint:** `/api/v1/teacher/questions/batch-import`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "question_bank_id": "bank-001",
  "questions": [
    {
      "content": "Cho hàm số $y = f(x)$...",
      "question_type": "SINGLE_CHOICE",
      "explain": "Áp dụng định lý đạo hàm",
      "points": 1.0,
      "answers": [
        { "content": "1", "is_correct": true },
        { "content": "0", "is_correct": false }
      ]
    }
  ]
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Đã nhập thành công 4 câu hỏi vào Ngân hàng đề",
  "data": {
    "imported_count": 4,
    "question_bank_id": "bank-001"
  }
}
```
