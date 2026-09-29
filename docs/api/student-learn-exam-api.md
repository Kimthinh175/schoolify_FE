# 📑 API Contract & Tài Liệu Kỹ Thuật — Phân Hệ Học Sinh (`/student/learn` & `/student/exam`)

> Tài liệu tổng hợp chi tiết toàn bộ tính năng, kiến trúc UI/UX, Component Toán học & Quy ước kết nối Backend cho **Trang Học Bài Lý Thuyết** và **Trang Bài Thi Trực Tuyến Học Sinh**.
> Mọi schema dưới đây **khớp 1-1 với TypeScript types** trong dự án (`src/types/*`).

---

## 1. Tổng Quan Phân Hệ & Đường Dẫn (Routes)

| Đường dẫn (Route) | Tên màn hình | Chức năng chính |
| :--- | :--- | :--- |
| `/student/learn/[courseId]/[lessonId]` | **Không Gian Học Bài Tự Do** | • Xem video bài học<br>• Tab 1: Lý thuyết (Định nghĩa, Công thức, Ví dụ mẫu)<br>• Tab 2: Luyện tập Trắc nghiệm & Tự luận<br>• Tab 3: Tài liệu PDF đính kèm |
| `/student/exam/[examId]` | **Trang Bài Thi Trực Tuyến** | • Đồng hồ đếm ngược thời gian thi<br>• Bảng Tóm Tắt 20 câu hỏi (Đã làm màu xanh, Chưa làm màu xám)<br>• Phân trang tối đa 10 câu / 1 trang<br>• Đánh dấu cờ xem lại (`Bookmark`)<br>• Bộ công cụ Soạn thảo Toán học (`MathEditorToolbar`) |

---

## 2. Kiến Trúc Kỹ Thuật & Thư Viện Sử Dụng

### 2.1. Thư Viện Cốt Lõi
- **Next.js App Router (TypeScript)**: Điều hướng trang linh hoạt.
- **Framer Motion**: Animation chuyển tab & accordion mở/đóng lời giải từng bước.
- **Lucide React**: Bộ icon UI (`Clock`, `CheckCircle2`, `Bookmark`, `Send`, `FileText`, `Calculator`...).
- **MathText Component**: Render công thức toán LaTeX inline (`$...$`) và block (`$$...$$`) mượt mà, tự động bóc tách lệnh gạch chéo (`\tan`, `\cos`, `\sin`, `\alpha`, `\frac`...) ngay cả khi thiếu dấu `$`.

---

## 3. Chi Tiết Các Components Cốt Lõi

### 3.1. `LessonTheoryTab.tsx` — Giao Diện Lý Thuyết Bài Học
- **Màu sắc & Style**: Tông màu sáng (Clean Light Theme) nền trắng `bg-white`, card phát sáng ambient nhẹ với viền `border-amber-200` và `border-indigo-100`.
- **Khối Định Nghĩa**:
  - Icon bóng đèn phát sáng (`Lightbulb`).
  - Render tóm tắt khái niệm kèm danh sách Hashtag từ khóa (`#Keyword`).
  - Khung lưu ý xét dấu góc phần tư lượng giác (`keyNotes`).
- **Khối Công Thức (Math Expression Boxes)**:
  - Tab lọc nhóm công thức (*Tất cả, Công thức cơ bản, Công thức liên kết, Công thức cộng...*).
  - Khung render công thức thoáng đạt, căn giữa với typography sắc nét.
  - Nút sao chép mã LaTeX nhanh kèm hiệu ứng phản hồi `Check`.
- **Khối Ví Dụ Mẫu & Lời Giải Từng Bước**:
  - Phân loại độ khó (`Cơ bản`, `Trung bình`, `Nâng cao`).
  - Accordion xem lời giải từng bước (`Bước 1`, `Bước 2`...) kèm tag công thức áp dụng.
  - Highlight khung đáp số cuối cùng với màu xanh Emerald.

---

### 3.2. `MathEditorToolbar.tsx` — Bộ Công Cụ Soạn Thảo Toán Cho Học Sinh
- **Phân nhóm Ký hiệu Toán học**:
  - *Cơ bản*: Phân số $\frac{a}{b}$, Số mũ $x^2$, Chỉ số $x_n$, Căn thức $\sqrt{x}$, $\pm$, $\cdot$.
  - *Quan hệ & Tập hợp*: $\neq$, $\le$, $\ge$, $\in$, $\iff$, $\implies$, $\mathbb{R}$, $\infty$.
  - *Lượng giác & Ký hiệu Hy Lạp*: $\alpha$, $\beta$, $\theta$, $\pi$, $\sin$, $\cos$, $\tan$, $\cot$.
- **Live Math Preview (Xem trước trực tiếp)**: Tự động render công thức hiển thị tức thì bên dưới khung nhập liệu tự luận.

---

### 3.3. `OnlineExamRunnerPage` (`/student/exam/[examId]`) — Trang Bài Thi Trực Tuyến
- **Phân trang 10 câu / trang**: Tối đa 10 câu trên mỗi trang, tích hợp thanh điều hướng `[Trang Trước] [Trang 1] [Trang 2] [Trang Sau]`.
- **Bảng Tóm Tắt Tất Cả Câu Hỏi (Question Overview Grid)**:
  - Ô số câu màu **xanh Emerald** (`bg-emerald-500`): Đã trả lời.
  - Ô số câu màu **xám** (`bg-slate-100`): Chưa trả lời.
  - Dấu cờ màu **vàng** (`!`) ở góc trên số câu: Đánh dấu cần xem lại.
  - Bộ lọc trạng thái 1-Click: `Tất cả`, `Chưa làm`, `Xem lại`.
  - Nhấp vào số câu $\rightarrow$ Tự động chuyển trang & cuộn mượt đến câu tương ứng.
- **Tự Động Lưu & Đếm Ngược**:
  - Đồng hồ đếm ngược 45 phút góc trên cùng.
  - Nhãn chỉ báo `🟢 Đã tự động lưu`.
- **Nút Nộp Bài & Modal Confirm**: Cảnh báo số câu chưa làm và câu cần xem lại trước khi chốt nộp.

---

## 4. Danh Sách API Endpoints (Quy Ước Kết Nối Backend)

### 4.1. Lấy Nội Dung Chi Tiết Bài Học & Lý Thuyết
- **Endpoint**: `GET /api/v1/student/lessons/:lessonId`
- **Headers**: `Authorization: Bearer <JWT>`
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "ls-01",
    "title": "Bài 1: Giá trị lượng giác của góc lượng giác",
    "video_url": "https://cdn.schoolify.edu.vn/videos/ls-01.mp4",
    "duration_mins": 35,
    "definitions": [
      {
        "id": "def-1",
        "title": "Định nghĩa Giá trị lượng giác của một góc lượng giác",
        "summary": "Trên đường tròn lượng giác...",
        "highlightedKeywords": ["Đường tròn lượng giác", "sin", "cos"],
        "keyNotes": ["Góc α thuộc góc phần tư I: sin, cos, tan, cot > 0"]
      }
    ],
    "formulas": [
      {
        "id": "f-1",
        "category": "Công thức cơ bản",
        "name": "Hằng đẳng thức lượng giác cốt lõi",
        "expressionLatex": "\\sin^2(\\alpha) + \\cos^2(\\alpha) = 1",
        "condition": "\\alpha \\in \\mathbb{R}",
        "explanation": "Xuất phát từ phương trình đường tròn đơn vị."
      }
    ],
    "examples": [
      {
        "id": "ex-1",
        "title": "Ví dụ 1: Tính cos(α) khi biết sin(α)",
        "difficulty": "Cơ bản",
        "problemStatement": "Cho sin(α) = 3/5 với π/2 < α < π...",
        "steps": [
          {
            "stepNumber": 1,
            "title": "Áp dụng hằng đẳng thức",
            "content": "cos²(α) = 1 - sin²(α)...",
            "formulaUsed": "\\sin^2(\\alpha) + \\cos^2(\\alpha) = 1"
          }
        ],
        "finalAnswer": "Kết quả: cos(α) = -4/5"
      }
    ],
    "materials": [
      {
        "id": "mat-1",
        "name": "Tong_Hop_Cong_Thuc_Luong_Giac_11.pdf",
        "url": "https://cdn.schoolify.edu.vn/materials/mat-1.pdf",
        "size": "2.4 MB",
        "type": "PDF"
      }
    ]
  }
}
```

---

### 4.2. Lấy Chi Tiết Đề Thi Trực Tuyến
- **Endpoint**: `GET /api/v1/student/exams/:examId`
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "ex-01",
    "title": "Đề Thi Kiểm Tra 1 Tiết — Chương 1: Hàm Số Lượng Giác",
    "duration_mins": 45,
    "total_questions": 20,
    "max_score": 10.0,
    "questions": [
      {
        "id": "q-1",
        "number": 1,
        "type": "SINGLE_CHOICE",
        "points": 0.5,
        "content": "Tính giá trị của \\sin(\\pi/6):",
        "answers": [
          { "id": "opt-1-a", "content": "A. 1/2" },
          { "id": "opt-1-b", "content": "B. \\sqrt{2}/2" }
        ]
      }
    ]
  }
}
```

---

### 4.3. Nộp Bài Thi Trực Tuyến
- **Endpoint**: `POST /api/v1/student/exams/:examId/submit`
- **Payload**:
```json
{
  "exam_id": "ex-01",
  "answers": {
    "q-1": "opt-1-a",
    "q-2": "opt-2-b",
    "q-19": "Lời giải tự luận bài toán..."
  },
  "flagged_question_ids": ["q-3", "q-15"],
  "time_taken_seconds": 1850
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "submission_id": "sub-8899",
    "status": "SUBMITTED",
    "answered_count": 20,
    "reward_points": 50,
    "submitted_at": "2026-09-28T02:27:00Z"
  }
}
```

---

## 5. Nhật Ký Thực Hiện & Quy Chuẩn Đã Xử Lý (Task Execution & Audit Log)

> Section này lưu lại toàn bộ các thay đổi kỹ thuật, sửa lỗi toán học và quy chuẩn dữ liệu đã thực hiện để phục vụ tham chiếu & bảo trì về sau.

### 5.1. Khắc Phục Lỗi Parser Công Thức Toán LaTeX (`MathText.tsx`)
1. **Tránh Rò Rỉ Ký Tự Rác HTML (`&amp;nbsp;`)**:
   - *Nguyên nhân*: Các câu lệnh `\quad`, `\qquad` trước đó được thay thế bằng `&nbsp;&nbsp;`. Khi đi qua `sanitizeMathHtml`, hàm `.replace(/&/g, '&amp;')` biến thành `&amp;nbsp;`, render trực tiếp chữ `&nbsp;` lên giao diện người dùng.
   - *Khắc phục*: Thay thế `\quad` và `\qquad` bằng ký tự khoảng trắng không ngắt dòng Unicode trực tiếp (`\u00A0`).
2. **Bổ Sung Bộ Quy Tắc Thay Thế LaTeX Thường Gặp**:
   - `\circ`, `\degree` $\rightarrow$ `°` (Sửa lỗi `75^\circ` bị hiển thị thành `75<sup>\circ</sup>`).
   - `\setminus` $\rightarrow$ `\` (Chuyên dùng cho tập xác định $\mathbb{R} \setminus \{...\}$).
   - `\mid` $\rightarrow$ `|` (Dùng cho tập hợp $\{x \mid P(x)\}$).
   - `\times` $\rightarrow$ `×`, `\forall` $\rightarrow$ `∀`, `\exists` $\rightarrow$ `∃`, `\dots` $\rightarrow$ `…`.
   - `\{` / `\}` $\rightarrow$ `{` / `}` (Loại bỏ backslash thừa trong chuỗi TeX thô).
   - `\left.` / `\right.` $\rightarrow$ empty (Bóc tách dấu đóng mở ngoặc rỗng trong TeX).
3. **Cập Nhật Regex Bóc Tách Nhãn Đáp Án (`cleanOptionText`)**:
   - Cập nhật Lookahead Regex để tự động xóa các tiền tố `A. `, `B. `, `C. `, `D. ` ngay cả khi nội dung đáp án bắt đầu bằng dấu âm (ví dụ `A. $-\sqrt{2} \le m \le \sqrt{2}$`) hoặc công thức toán có dấu ngoặc `(`, `[`, `{`.

---

### 5.2. Chuẩn Hóa Dữ Liệu Mẫu 4 Phần Cho 6 Bài Học (`lesson-contents.data.ts`)
1. **Kiểm Tra & Sửa Lỗi Nội Dung**:
   - Sửa lỗi chính tả Bài 1: *"Chia cả 2 tế của..."* $\rightarrow$ **"Chia cả 2 vế của..."**.
   - Kiểm tra và đảm bảo 100% công thức lượng giác (Hằng đẳng thức, công thức cộng, công thức nhân đôi, phương trình $a\sin x + b\cos x = c$, mô hình thủy triều $h(t)$) chính xác tuyệt đối.
2. **Chuẩn Hóa 4 Phương Án (A, B, C, D) Cho Toàn Bộ Bài Học**:
   - Trước đây Bài 2 đến Bài 6 có một số câu trắc nghiệm/kiểm tra bị thiếu tùy chọn B, C, D.
   - Đã nâng cấp toàn bộ các câu hỏi trắc nghiệm & kiểm tra từ Bài 1 đến Bài 6 thành **đầy đủ 4 tùy chọn A, B, C, D** kèm cờ `isCorrect` và giải thích `explain` chi tiết theo chuẩn đề thi THPT.
3. **Bổ Sung Đề Bài Tự Luận & Lời Giải Mẫu**:
   - Mỗi bài học đều có đề bài tự luận phong phú, kèm gợi ý bước làm (`hints`) và lời giải mẫu từng bước (`sampleSolution`).

---

### 5.3. Nâng Cấp Giao Diện Học Bài `/student/learn/[courseId]/[lessonId]` (`page.tsx`)
1. **Sửa Lỗi Fallback Lý Thuyết (`LessonTheoryTab.tsx`)**:
   - Thay `definitions.map` thành `safeDefinitions.map` ở dòng 231 để luôn có dữ liệu mặc định hiển thị khi props truyền vào rỗng.
2. **Xây Dựng Tab 2 Tương Tác (Trắc Nghiệm & Tự Luận)**:
   - **Khối Trắc Nghiệm**: Render thẻ câu hỏi với `MathText`, danh sách 4 lựa chọn, nút **Kiểm Tra Đáp Án** cho phép hiển thị tức thì nhãn *Chính xác 🎉* hoặc *Chưa chính xác ❌* cùng khung giải thích `explain`.
   - **Khối Tự Luận**: Render đề bài, nút toggle xem **Gợi ý làm bài**, tích hợp **MathEditorToolbar** cho học sinh soạn thảo, và nút toggle xem **Lời giải mẫu chi tiết**.
   - **Khối Chuyển Tiếp**: Banner chuyển tiếp nhanh sang bài kiểm tra 10 phút tương ứng.

