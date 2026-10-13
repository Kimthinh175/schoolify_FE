# 📘 Hướng Dẫn Tổng Quan Hệ Thống Schoolify (Master Guide)

> **Mục đích tài liệu:** File này là **bản tổng hợp duy nhất** giúp bất kỳ thành viên FE nào nắm được toàn bộ luồng hoạt động của dự án **Schoolify** — một nền tảng EdTech SaaS đa vai trò. Nội dung được tổng hợp từ toàn bộ tài liệu trong thư mục `docs/` (không thay thế, chỉ gom lại để đọc nhanh).

---

## 📑 Mục Lục

1. [Schoolify là gì? Kiến trúc tổng thể](#1--schoolify-là-gì-kiến-trúc-tổng-thể)
2. [Hệ thống vai trò (Roles) & Phân quyền](#2--hệ-thống-vai-trò-roles--phân-quyền)
3. [Sơ đồ luồng dữ liệu tổng quát](#3--sơ-đồ-luồng-dữ-liệu-tổng-quát)
4. [Chi tiết từng vai trò](#4--chi-tiết-từng-vai-trò)
   1. [SUPER_ADMIN](#41--super_admin--quản-trị-viên-nền-tảng)
   2. [PRINCIPAL / VICE_PRINCIPAL](#42--principal--vice_principal--ban-giám-hiệu--chủ-trung-tâm)
   3. [HEAD_OF_DEPARTMENT](#43--head_of_department--trưởng-bộ-môn)
   4. [TEACHER](#44--teacher--giáo-viên-giảng-dạy--kinh-doanh)
   5. [STAFF](#45--staff--nhân-viên-giáo-vụ--vận-hành-trung-tâm)
   6. [STUDENT](#46--student--học-sinh)
   7. [PARENT](#47--parent--phụ-huynh)
5. [Bộ nhận diện thương hiệu (Brand Guidelines)](#5--bộ-nhận-diện-thương-hiệu)
6. [Định hướng AI tương lai](#6--định-hướng-ai-tương-lai)
7. [Ghi chú kỹ thuật Git & Môi trường](#7--ghi-chú-kỹ-thuật-git--môi-trường)
8. [Đối chiếu nhanh với cấu trúc Frontend hiện tại](#8--đối-chiếu-nhanh-với-cấu-trúc-frontend-hiện-tại)

---

## 1. 🏫 Schoolify Là Gì? Kiến Trúc Tổng Thể

### 1.1. Định nghĩa sản phẩm
**Schoolify** = **School** *(Trường học)* + **-ify** *(Biến thành / Số hóa)*.
> *"Số hóa trường học, Khai phóng tri thức."*

Schoolify là **nền tảng vận hành & kinh doanh giáo dục toàn diện (EdTech SaaS)**, kết hợp 2 nhóm sản phẩm chính:

| Mảng | Đối tượng | Mô tả |
| :--- | :--- | :--- |
| **Học vụ K-12** | Trường học, Trung tâm (Tenant) | Quản lý trường/trung tâm, lớp học, giáo viên, học sinh, điểm danh, đề thi, chấm bài, sổ liên lạc điện tử |
| **Creator Economy** | Giáo viên tự do, Trung tâm | Tạo & bán khóa học online (`is_marketplace`), thu học phí trực tuyến, đối soát doanh thu, hoa hồng |

### 1.2. Mô hình kiến trúc: Multi-Tenant SaaS (B2B + B2C)
- **Super Admin** quản lý **nhiều Trường/Trung tâm** (Tenants), bán các **Gói cước SaaS** (`SubscriptionPackage`).
- Mỗi **Trường/Trung tâm (Tenant)** là một đơn vị độc lập, tự quản lý: bộ máy (`Department`), nhân sự (`TEACHER`, `STAFF`), học sinh (`StudentProfile`), phụ huynh (`ParentStudent`), và nội dung khóa học của riêng mình.
- **Giáo viên tự do / Creator** có thể mua riêng `TeacherSubscription` để mở khóa quyền kinh doanh khóa học trên toàn nền tảng.
- Dòng tiền xuyên suốt:
  - Phụ huynh/Học sinh **thanh toán** → Tạo `Order` → ghi nhận `Transaction`.
  - Nền tảng thu **`COMMISSION_FEE`** (hoa hồng) từ doanh thu khóa học của Trường/Creator.
  - Giáo viên/Creator nhận **`TEACHER_INCOME`** (thu nhập thực nhận sau khi trừ hoa hồng).

### 1.3. Các thực thể (Entity) cốt lõi lặp lại xuyên suốt các luồng

| Thực thể | Vai trò |
| :--- | :--- |
| `School` / `SchoolSubscription` | Trường/Trung tâm (Tenant) + gói cước đang dùng |
| `SubscriptionPackage` | Gói SaaS do Admin bán (giá, quotas: `max_teachers`, `max_students_total`, `storage_limit_gb`, `can_sell_courses`) |
| `Department` | Tổ bộ môn trong trường (Tổ Toán, Tổ Anh,...) |
| `User` / `SchoolMember` | Tài khoản gốc (SystemRole) + vai trò trong từng trường (`SchoolRole`) |
| `TeacherProfile` / `StudentProfile` / `ParentProfile` | Hồ sơ người dùng theo vai trò, gắn `department_id` / `school_id` |
| `Course` / `Lesson` / `LessonMaterial` | Khóa học → Danh sách bài giảng (video, nội dung, tài liệu PDF/Word/Slide) |
| `QuestionBank` / `QuestionType` | Ngân hàng câu hỏi — gồm `MULTIPLE_CHOICE`, `SINGLE_CHOICE`, `TRUE_FALSE`, `ESSAY` |
| `Exam` / `ExamSubmission` / `SubmissionAnswer` | Đề thi → Bài nộp của học sinh → Từng câu trả lời (điểm `points_earned`, lời phê `teacher_feedback`) |
| `Class` / `ClassEnrollment` | Lớp học (khóa học + giáo viên phụ trách) → Bảng ghi danh học sinh |
| `ClassSession` | Buổi học theo lịch (`start_time`, `end_time`, `room` / `meeting_url`) |
| `StudentProgress` | Tiến độ học tập: `completion_pct`, %, khóa học đang học dở |
| `Order` / `Transaction` | Đơn hàng (học phí, mua khóa học, mua gói SaaS) + Giao dịch thanh toán |
| `StoreItem` / `StudentInventory` | Vật phẩm đổi thưởng/điểm (`points`) + Túi đồ của học sinh |
| `Notification` | Trung tâm thông báo (nộp bài, chấm điểm, thu học phí, thông báo nhà trường) |
| `CustomFeatureRequest` | Yêu cầu hỗ trợ/tùy biến từ Trung tâm gửi lên Admin |
| `ParentStudent` | Bảng liên kết Phụ huynh ↔ Học sinh (1 phụ huynh – nhiều con) |

---

## 2. 👥 Hệ Thống Vai Trò (Roles) & Phân Quyền

| # | Vai trò | Nhóm | Quyền hạn / Triết lý thiết kế |
| :-: | :--- | :--- | :--- |
| 1 | **`SUPER_ADMIN`** | Quản trị nền tảng | Quyền cao nhất **toàn hệ thống** (không thuộc Trường nào). Quản trị SaaS, Tenant, Gói cước, Dòng tiền toàn nền tảng |
| 2 | **`PRINCIPAL` / `VICE_PRINCIPAL`** | Ban giám hiệu (Tenant-level) | Quyền cao nhất **trong một Trường/Trung tâm**. Vận hành, kế hoạch kinh doanh, duyệt nội dung, bổ nhiệm bộ máy |
| 3 | **`HEAD_OF_DEPARTMENT`** | Trưởng bộ môn | Kiêm nhiệm từ giáo viên: Quản lý chuyên môn, **thẩm định/duyệt** `Course` & `QuestionBank` của tổ |
| 4 | **`TEACHER`** | Giáo viên | Giảng dạy, quản lý lớp, soạn đề thi, chấm bài; đồng thời có thể là **Creator bán khóa học** |
| 5 | **`STAFF`** | Nhân sự vận hành trung tâm | Tuyển sinh/nhập liệu Excel, xếp lớp/giao vụ, **thu ngân học phí tại quầy**, chăm sóc học viên |
| 6 | **`STUDENT`** | Học sinh | Khám phá/mua khóa học, học bài, làm bài thi, đổi quà bằng điểm |
| 7 | **`PARENT`** | Phụ huynh | Theo dõi **đa con**, sổ liên lạc điện tử, lịch học, **thanh toán học phí** thay con |

> **Lưu ý thiết kế FE:** Người dùng có thể **mang nhiều vai trò cùng lúc** (vd: vừa `TEACHER` vừa `HEAD_OF_DEPARTMENT`). Cần màn hình **Switch Role** để chuyển đổi giao diện.

---

## 3. 🔄 Sơ Đồ Luồng Dữ Liệu Tổng Quát

```mermaid
flowchart LR
    subgraph Platform["NỀN TẢNG SCHOOLIFY (SaaS)"]
        SA[SUPER_ADMIN<br/>Quản trị hệ thống]
        SA --> |Bán SubscriptionPackage & Quản lý Tenant| SC[Trường / Trung tâm]
        SA --> |Bán TeacherSubscription & thu hoa hồng| TC[Giáo viên tự do / Creator]
        SA --> |Cấu hình & giám sát| MKT[Marketplace Khóa học]
    end

    subgraph School["MỘT TRƯỜNG / TRUNG TÂM (Tenant)"]
        P[PRINCIPAL] --> |Tạo Department, quản lý bộ máy| HOD[HEAD_OF_DEPARTMENT]
        P --> |Mua SchoolSubscription| SUB[Gói cước SaaS]
        HOD --> |Quản lý chuyên môn & duyệt nội dung| T[TEACHER]
        T --> |Giảng dạy lớp / bộ môn| S[STUDENT]
        T --> |Tạo khóa học thương mại| CUR[Course is_marketplace]
        ST[STAFF] --> |Nhập liệu, xếp lớp, thu học phí| S
        ST --> P
    end

    S --> |Học & thi| T
    CUR --> MKT
    SUB -.->|Dùng hết quota? Mua thêm| P
    PA[PARENT] --> |Theo dõi nhiều con & thanh toán| S
    MKT --> |Order/Thanh toán| ORDER[(Order & Transaction)]
    TC --> |Tạo khóa học bán trên Marketplace| MKT
    TC --> ORDER
    SC --> ORDER
```

---

## 4. 🔍 Chi Tiết Từng Vai Trò

> Với mỗi vai trò: **[Mục tiêu]** → **[Sơ đồ luồng chính]** → **[Các chức năng FE cần xây dựng]**.
> Tài liệu gốc đầy đủ tại `docs/flows/<role>_flow.md`.

---

### 4.1. 👑 SUPER_ADMIN — Quản trị viên nền tảng

**📄 Tài liệu gốc:** `docs/flows/super_admin_flow.md`

**Mục tiêu:** Quản trị nền tảng SaaS (B2B): quản lý Trường/Trung tâm (Tenant), bán gói cước, kiểm soát dòng tiền toàn hệ thống, hỗ trợ kỹ thuật cấp cao.

**Sơ đồ luồng:**

```mermaid
graph TD
    A[Đăng nhập Super Admin] --> B{Dashboard Tổng Quan}
    B --> C[Quản lý Trường/Trung tâm]
    C --> C1[Xem danh sách School]
    C --> C2[Phê duyệt/Khóa School mới]
    C --> C3[Xem chi tiết chủ sở hữu School]
    B --> D[Quản lý Gói cước SaaS]
    D --> D1[Tạo SubscriptionPackage mới]
    D --> D2[Cấu hình giá, Quotas, Billing Cycle]
    D --> D3[Tắt/Bật các gói cước]
    B --> E[Quản lý Tài chính & Đối soát]
    E --> E1[Xem Order toàn hệ thống]
    E --> E2[Duyệt thanh toán thủ công]
    E --> E3[Đối soát hoa hồng % cho School]
    B --> F[Quản lý Users toàn hệ thống]
    F --> F1[Tra cứu theo Email/SĐT]
    F --> F2[Reset mật khẩu / Khóa tài khoản]
    B --> G[Hỗ trợ & Yêu cầu]
    G --> G1[Xem CustomFeatureRequest]
    G --> G2[Phản hồi & Cập nhật trạng thái]
```

**Các chức năng FE cần có:**

| Nhóm | Chi tiết FE cần có |
| :--- | :--- |
| 📊 **Dashboard** | Tổng doanh thu nền tảng (tháng/năm); Số `School` Active/Suspended; Gói cước bán chạy nhất; Biểu đồ User đăng ký mới |
| 🏢 **Quản lý Schools** | Table `School` (Name, Code, Owner, Status, Created At); Actions: **Activate** / **Suspend**; Detail: gói cước `SchoolSubscription` đang dùng |
| 📦 **Quản lý Gói cước** | Table `SubscriptionPackage`; Form phức tạp: Tên, Mô tả, `price`, `BillingCycle` (MONTHLY / YEARLY / LIFETIME), Quotas (`max_teachers`, `max_students_total`, `storage_limit_gb`), Toggle `is_active` |
| 💰 **Đơn hàng & Tài chính** | Table `Order` (lọc PENDING / PAID / CANCELLED); Table `Transaction` (lọc `PAYMENT_TO_ADMIN`, `COMMISSION_FEE`); Action: cập nhật đơn chuyển khoản thủ công → `PAID` |
| 👥 **Quản lý Users toàn hệ thống** | Search Email/SĐT; Danh sách mọi `User` (bất kể School); Action: khóa tài khoản (`status=false`), reset mật khẩu khẩn cấp |
| 🎫 **Yêu cầu tùy biến** | Table `CustomFeatureRequest` (PENDING / IN_PROGRESS / RESOLVED); Action: nhận xử lý hoặc từ chối |

**Ghi chú FE:** Cần Layout riêng (`AdminLayout`) với Sidebar các mục trên (`/admin/dashboard`, `/admin/schools`, `/admin/packages`, `/admin/orders`, `/admin/users`).

---

### 4.2. 🏫 PRINCIPAL / VICE_PRINCIPAL — Ban giám hiệu / Chủ trung tâm

**📄 Tài liệu gốc:** `docs/flows/principal_flow.md`

**Mục tiêu:** Quyền cao nhất **trong một Tenant**: mua & duy trì gói doanh nghiệp, tổ chức bộ máy, quản lý học sinh, thương mại hóa khóa học của trường lên Marketplace.

**Sơ đồ luồng:**

```mermaid
graph TD
    A[Đăng nhập Principal] --> B{Tenant Dashboard}
    B --> G[Gói cước SaaS & Quotas]
    G --> G1[Xem mức dùng: Học sinh / Giáo viên / Dung lượng]
    G --> G2[Mua / Gia hạn SchoolSubscription]
    G --> G3[Nâng cấp gói khi vượt quota]

    B --> H[Doanh thu & Bán khóa học trường]
    H --> H1[Duyệt đưa khóa học lên Marketplace]
    H --> H2[Theo dõi Order & Doanh thu]
    H --> H3[Đối soát hoa hồng với nền tảng]

    B --> C[Quản lý Tổ chức & Bộ máy]
    C --> C1[Thiết lập thông tin School]
    C --> C2[Tạo/Xóa Department]
    C --> C3[Bổ nhiệm Trưởng bộ môn]

    B --> D[Quản lý Nhân sự]
    D --> D1[Mời/Thêm giáo viên & Staff]
    D --> D2[Phân quyền SchoolRole]
    D --> D3[Phân bổ giáo viên về Department]

    B --> E[Quản lý Học sinh toàn trường]
    E --> E1[Import danh sách học sinh Excel]
    E --> E2[Quản lý thông tin HS & Phụ huynh]

    B --> F[Giám sát Học vụ]
    F --> F1[Xem các Lớp học toàn trường]
    F --> F2[Báo cáo điểm số tổng quan]
    F --> F3[Kiểm soát QuestionBank trường]
```

**Các chức năng FE cần có:**

| Nhóm | Chi tiết FE cần có |
| :--- | :--- |
| 💳 **Subscription SaaS** | Bảng đồng hồ Quotas (Usage Bars `x/max`); Bảng giá gói doanh nghiệp; Quét QR tạo `Order`; Cảnh báo khi Quota ≥80% hoặc gói sắp hết hạn (`end_date`) |
| 🛍️ **Bán khóa học & Doanh thu** | Danh sách Course `is_marketplace=true`; Thiết lập giá; Bảng kê `Order`, số thực nhận sau trừ `COMMISSION_FEE` |
| 📊 **Tenant Dashboard** | Tổng HS/GV/Lớp; Doanh thu học phí tháng; Lượt nộp bài; Phổ điểm toàn trường |
| 🏢 **Departments** | Tạo Tổ bộ môn; Gán `head_teacher_id` |
| 🧑🏫 **Nhân sự** | Danh sách + phân quyền `SchoolRole`, gán Department; Mời qua Email |
| 🧑🎓 **Học sinh & Phụ huynh** | Import/Export Excel; Profile học sinh + liên kết `ParentStudent` |
| 📚 **Giám sát đào tạo (Master View)** | Quản lý toàn bộ Lớp, Khóa học, Question Bank của trường |

**Ghi chú FE:** Dùng Layout cấp Trung tâm (`SchoolAdminLayout`).

---

### 4.3. 🧑🏫 HEAD_OF_DEPARTMENT — Trưởng bộ môn

**📄 Tài liệu gốc:** `docs/flows/head_of_department_flow.md`

**Mục tiêu:** Quản lý chất lượng chuyên môn của **một Tổ bộ môn**: giám sát giáo viên, **thẩm định/duyệt** khóa học & ngân hàng câu hỏi, báo cáo chất lượng lên Ban giám hiệu.

**Sơ đồ luồng:**

```mermaid
graph TD
    A[Đăng nhập Trưởng Bộ Môn] --> B{Department Dashboard}
    B --> C[Quản lý Giáo viên Tổ Bộ Môn]
    C --> C1[Xem danh sách GV thuộc Department]
    C --> C2[Xem phân công phụ trách & tải giảng dạy]
    C --> C3[Đánh giá / Nhận xét chuyên môn]
    B --> D[Quản lý & Thẩm định Khóa học]
    D --> D1[Xem Course thuộc Department]
    D --> D2[Kiểm duyệt Lesson / LessonMaterial]
    D --> D3[Approve xuất bản / Yêu cầu chỉnh sửa]
    B --> E[Quản lý Ngân hàng Đề thi Bộ môn]
    E --> E1[Xem & đóng góp QuestionBank]
    E --> E2[Kiểm duyệt câu hỏi & đáp án]
    E --> E3[Tạo khung đề thi chuẩn]
    B --> F[Báo cáo & Giám sát Học thuật]
    F --> F1[Phổ điểm bài thi theo môn]
    F --> F2[Tiến độ hoàn thành bài học]
    F --> F3[Xuất báo cáo gửi Ban Giám Hiệu]
```

**Các chức năng FE cần có:**

| Nhóm | Chi tiết FE cần có |
| :--- | :--- |
| 📊 **Department Dashboard** | Card: số GV trong tổ, khóa học đang chạy, đề thi đã duyệt, tổng HS học môn này; Widget **"Cần duyệt"** (`status=PENDING`); Biểu đồ phổ điểm |
| 🧑🏫 **Quản lý giáo viên** | Danh sách `TeacherProfile` theo `department_id`; Thông tin: chuyên môn `expertise`, `experience_years`, `classes_managed`, số khóa học đã tạo; Xem nhanh lịch dạy |
| 📖 **Quản lý & duyệt Course** | Bộ lọc `DRAFT / PENDING / PUBLISHED / REJECTED`; Xem cây bài giảng `Lesson` + tài liệu; Toolbar duyệt: **Approve** (→ `PUBLISHED`) / **Request Changes** (kèm khung lý do từ chối) |
| ❓ **QuestionBank của bộ môn** | Danh sách `QuestionBank` theo `school_id` + bộ môn; Duyệt & phân loại theo `QuestionType` & độ khó; Xuất khung đề thi chuẩn |
| 📈 **Báo cáo học thuật** | Tổng hợp `ExamSubmission` các lớp thuộc môn; Tỷ lệ câu hỏi làm sai nhiều nhất; Xuất PDF/Excel |

**Ghi chú FE:** Tích hợp vào Navigation dạng Tab riêng **"Quản trị Bộ môn"** hoặc dùng **Switch Role** (nếu vừa là `TEACHER`).

---

### 4.4. 🧑🏫 TEACHER — Giáo viên (giảng dạy & kinh doanh)

**📄 Tài liệu gốc:** `docs/flows/teacher_flow.md`

**Mục tiêu:** Giáo viên hoạt động theo **2 hình thức**:
1. **Giáo viên trực thuộc Trường/Trung tâm** — giảng dạy theo phân công.
2. **Giáo viên tự do / Creator** — mua `TeacherSubscription` để mở quyền tạo & bán khóa học.

**Sơ đồ luồng:**

```mermaid
graph TD
    A[Đăng nhập Teacher] --> B{Teacher Dashboard}
    B --> H[Gói cước & Quyền kinh doanh]
    B --> C[Quản lý & Bán khóa học]
    H --> H2[Mua/Nâng cấp TeacherSubscription]
    C --> C1[Course Builder]
    C --> C2[Cấu hình bán: is_marketplace + price]
    C --> C4[Gửi duyệt / Xuất bản lên Marketplace]
    B --> I[Doanh thu & Rút tiền]
    I --> I1[Báo cáo học sinh mua]
    I --> I2[Theo dõi TEACHER_INCOME]
    I --> I3[Xem COMMISSION_FEE]
    B --> D[Quản lý lớp học & buổi học]
    D --> D3[Tạo ClassSession: phòng/link meeting]
    B --> E[Đề thi & Chấm bài]
    E --> E2[Chấm tự luận & nhận xét]
    B --> G[Phần thưởng học sinh: StoreItem, cộng điểm]
```

**Các chức năng FE cần có:**

| Nhóm | Chi tiết FE cần có |
| :--- | :--- |
| 💳 **Bảng giá & Checkout gói** | Pricing Table so sánh gói (`max_classes`, `max_students_per_class`, `storage_limit_gb`, `can_sell_courses`); Chọn `BillingCycle`; Tạo `Order` loại `SUBSCRIPTION` + QR; Quản lý gói cá nhân (`ACTIVE / TRIALING / EXPIRED`, ngày `end_date`, gia hạn/nâng cấp) |
| 🛍️ **Course Builder & Marketplace** | Form tạo Course: toggle `is_marketplace=true`, ô `price`, cấu hình bài học preview miễn phí; Trình soạn thảo (rich text, video, file); Trạng thái `DRAFT → PENDING → PUBLISHED` |
| 💰 **Doanh thu & rút tiền** | Card: Tổng doanh thu, `TEACHER_INCOME`, `COMMISSION_FEE`; Bảng lịch sử `Order` (ai mua, khi nào); Yêu cầu đối soát/rút tiền về ngân hàng |
| 📊 **Teacher Dashboard** | Lịch dạy (Upcoming `ClassSession`); Widget bài tập chờ chấm (`ExamSubmission` = `SUBMITTED`); Danh sách lớp |
| 🏫 **Lớp học & thời khóa biểu** | Danh sách `Class` + sĩ số (`ClassEnrollment`); Lịch tuần: thêm `ClassSession` (`room`/`meeting_url`); Gán giáo viên dạy thay |
| ✍️ **Chấm bài & lời phê** | Hiển thị `text_answer`; ô cho `points_earned`; khung `teacher_feedback`; tự cộng `score`; nhập `teacher_notes` |
| 🎁 **Cửa hàng phần thưởng** | Tạo `StoreItem` (voucher/huy hiệu); Cộng điểm thưởng thủ công cho học sinh |

---

### 4.5. 🧑💼 STAFF — Nhân viên giáo vụ / vận hành trung tâm

**📄 Tài liệu gốc:** `docs/flows/staff_flow.md`

**Mục tiêu:** Vận hành hằng ngày tại Trung tâm: tuyển sinh/nhập liệu, xếp lớp, **thu ngân học phí tại quầy**, chăm sóc học viên & thông báo.

**Sơ đồ luồng:**

```mermaid
graph TD
    A[Đăng nhập Staff] --> B{Staff Dashboard}
    B --> C[Tuyển sinh & Quản lý Học viên]
    C --> C1[Tạo hồ sơ HS mới / Import Excel]
    C --> C2[Gán phụ huynh liên kết - ParentStudent]
    C --> C3[Tra cứu liên lạc HS & phụ huynh]
    B --> D[Học vụ & Điều phối Lớp học]
    D --> D1[Ghi danh học sinh - ClassEnrollment]
    D --> D2[Xử lý chuyển lớp / Đổi ca học]
    D --> D3[Cập nhật phòng & Link họp - ClassSession]
    D --> D4[Hỗ trợ gán giáo viên dạy thay]
    B --> E[Thu ngân & Hóa đơn tại quầy]
    E --> E1[Tra cứu học phí chưa đóng]
    E --> E2[Xác nhận thanh toán COD / Chuyển khoản]
    E --> E3[Cập nhật Order PAID & Xuất biên lai]
    B --> F[Chăm sóc & Hỗ trợ Học viên]
    F --> F1[Tiếp nhận phản ánh / Yêu cầu]
    F --> F2[Xử lý CustomFeatureRequest]
    F --> F3[Gửi thông báo nhắc nhở]
```

**Các chức năng FE cần có:**

| Nhóm | Chi tiết FE cần có |
| :--- | :--- |
| 📊 **Staff Dashboard** | Lịch ca học trong ngày (`ClassSession`); Widget học sinh mới đăng ký cần tư vấn/xếp lớp; Widget khoản thu chờ xử lý |
| 🧑🎓 **Tuyển sinh & nhập liệu** | Form thêm HS (họ tên, ngày sinh, `grade_level`, SĐT, email); **Import Excel** kèm progress bar & báo lỗi trùng; Modal gán phụ huynh (`ParentStudent`) qua SĐT |
| 🏫 **Giáo vụ & điều phối lớp** | Danh sách `Class`: thao tác Ghi danh (`ClassEnrollment`), **Chuyển lớp** 1 click; Quản lý `ClassSession`: đổi `room`, cập nhật `meeting_url`, gán dạy thay `teacher_id` |
| 💵 **Thu ngân tại quầy** | Search hóa đơn (tên/mã HS/SĐT); Lọc `Order` = `PENDING`; Nút **"Xác nhận đã nhận tiền"** (→ `PAID` + ghi `Transaction`); Nút **"In biên lai"** (máy in nhiệt hoặc PDF gửi qua Zalo/Email) |
| 🎧 **Chăm sóc & thông báo** | Bảng `CustomFeatureRequest` (lọc trạng thái, ghi chú tiến trình); Công cụ gửi `Notification` hàng loạt (theo lớp hoặc toàn trường — VD lịch nghỉ lễ, lịch thi) |

**Ghi chú FE:** Thiết kế kiểu **Portal Vận hành nhanh** — mọi thao tác tìm kiếm & xử lý phải đơn giản, tốc độ cao.

---

### 4.6. 🧑🎓 STUDENT — Học sinh

**📄 Tài liệu gốc:** `docs/flows/student_flow.md`

**Mục tiêu:** Khám phá & mua khóa học, học tập đa phương tiện, tham gia lớp học theo lịch (`ClassSession`), làm bài thi trực tuyến (`ExamSubmission`), tích điểm & đổi quà.

**Sơ đồ luồng:**

```mermaid
graph TD
    A[Đăng nhập Student] --> B{Student Dashboard}
    B --> C[Khám phá & Mua Khóa học]
    C --> C1[Tìm khóa học theo Category]
    C --> C2[Xem chi tiết Course & Học thử]
    C --> C3[Thanh toán mua khóa học - Tạo Order]
    B --> D[Không gian Học tập trực tuyến]
    D --> D1[Xem danh sách khóa học đang học]
    D --> D2[Trình phát Bài học: Video / Nội dung / Tài liệu]
    D --> D3[Tự lưu tiến độ - StudentProgress]
    B --> E[Lớp học & Lịch học]
    E --> E1[Danh sách lớp - ClassEnrollment]
    E --> E2[Thời khóa biểu tuần - ClassSession]
    E --> E3[Nhấp link vào phòng học trực tuyến]
    B --> F[Làm bài kiểm tra & Xem điểm]
    F --> F1[Mở bài kiểm tra theo bài học/đề thi]
    F --> F2[Làm Trắc nghiệm & Tự luận]
    F --> F3[Nộp bài - ExamSubmission]
    F --> F4[Xem điểm số & Lời phê giáo viên]
    B --> G[Điểm thưởng & Cửa hàng]
    G --> G1[Xem điểm tích lũy - Points]
    G --> G2[Đổi điểm lấy quà - StoreItem]
    G --> G3[Xem túi đồ đã sở hữu - StudentInventory]
```

**Các chức năng FE cần có:**

| Nhóm | Chi tiết FE cần có |
| :--- | :--- |
| 📊 **Dashboard** | Banner chào mừng + điểm tích lũy `points` + cấp bậc; Widget **buổi học sắp diễn ra** (nút "Vào học ngay" → `meeting_url`); Thanh tiến độ khóa học (`completion_pct`); Danh sách bài kiểm tra sắp tới/mới có điểm |
| 🛒 **Marketplace & Checkout** | Bộ lọc (Category, Department, GV, giá); Course Landing Page (video giới thiệu, đề cương `Lesson`); Nút "Học ngay"/"Mua khóa học"; Modal thanh toán `Order` loại `BANK` + mã QR VietQR |
| 🎓 **Course Learning Player** | Sidebar chương mục + icon check xanh; Khung chính: Video player, khung đọc nội dung, tải `LessonMaterial` (Word/Excel/Slide); Nút Bài trước/Bài tiếp theo |
| 📅 **Lớp học & thời khóa biểu** | Lịch tuần (Weekly Timetable): khối `ClassSession` (khung giờ, GV kèm avatar, phòng/`meeting_url`); Danh sách lớp đang tham gia |
| 📝 **Làm bài thi online** | Màn hình chuẩn bị (thời gian, số câu); **Exam Runner**: đồng hồ đếm ngược, thanh điều hướng nhanh câu hỏi, radio/checkbox cho trắc nghiệm, khung soạn thảo cho tự luận (`text_answer`), nút "Nộp bài"; **Kết quả**: điểm `score`, xem lại từng câu (`explain`, `teacher_feedback`) |
| 🎁 **Đổi quà & Túi đồ** | Trang Store: lưới `StoreItem` (voucher, huy hiệu) kèm giá điểm; Modal xác nhận (trừ `StudentProfile.points`); Trang "Túi đồ của tôi" (`StudentInventory`) |

**Ghi chú FE:** Giao diện **trẻ trung, Gamification** — bo tròn (`rounded-2xl/3xl`), màu xanh lá điểm hoàn thành, hiệu ứng chúc mừng; tối ưu Mobile/Tablet.

---

### 4.7. 👨👩👧 PARENT — Phụ huynh

**📄 Tài liệu gốc:** `docs/flows/parent_flow.md`

**Mục tiêu:** Quản lý **đa học sinh** (nhiều con), sổ liên lạc điện tử, theo dõi lịch học, **thanh toán học phí/khóa học** trực tuyến thay con, nhận thông báo tức thì.

**Sơ đồ luồng:**

```mermaid
graph TD
    A[Đăng nhập Parent] --> B{Parent Dashboard}
    B --> C[Quản lý & Chọn Con]
    C --> C1[Dropdown chuyển đổi giữa các con]
    C --> C2[Liên kết HS mới qua Mã HS / SĐT]
    B --> D[Sổ liên lạc & Kết quả học tập]
    D --> D1[Tiến độ % các khóa học]
    D --> D2[Bảng điểm ExamSubmission]
    D --> D3[Đọc lời phê & nhận xét của thầy cô]
    B --> E[Lịch học của con]
    B --> F[Học phí & Thanh toán]
    F --> F1[Nhận thông báo khoản thu]
    F --> F2[Tạo Order]
    F --> F3[Quét mã QR VietQR]
    B --> G[Thông báo tức thì: nộp bài, chấm điểm, thu phí]
```

**Các chức năng FE cần có:**

| Nhóm | Chi tiết FE cần có |
| :--- | :--- |
| 👨👩👧 **Child Selector** | Dropdown/Tab bar Avatar + Tên từng con; Nút "Liên kết thêm con": nhập mã định danh/SĐT gửi yêu cầu (`ParentStudent`) |
| 📊 **Parent Dashboard** | Tóm tắt con đang chọn (ĐTB gần nhất, số bài nộp, số buổi/tuần); Widget **Cảnh báo cần thanh toán** (`Order` = `PENDING`); Lịch học hôm nay |
| 📖 **Sổ liên lạc điện tử** | Tab Tiến độ khóa học (danh sách + `completion_pct` + dừng ở đâu); Tab Kết quả kiểm tra (danh sách `ExamSubmission`: tên bài, ngày nộp, điểm; xem chi tiết kèm `teacher_feedback`/`teacher_notes`) |
| 📅 **Thời khóa biểu con** | Lịch tuần: khối giờ, môn, tên GV, địa điểm/phòng hoặc link online |
| 💳 **Đóng học phí & mua khóa học** | Danh sách phiếu thu cần đóng; Cổng thanh toán mã QR VietQR; Lịch sử giao dịch `PAID`; Tải biên lai |
| 🔔 **Trung tâm thông báo** | Danh sách `Notification` mẫu: *"Con đã hoàn thành bài kiểm tra..."*, *"GV đã chấm: 9.0 kèm nhận xét..."*, *"Thu học phí tháng X lớp Y..."* |

**Ghi chú FE:** Tối ưu Mobile (phụ huynh bận rộn); giao diện dễ nhìn, thân thiện.

---

## 5. 🎨 Bộ Nhận Diện Thương Hiệu

**📄 Tài liệu gốc:** `docs/nhan_dien_thuong_hieu.md`

### 5.1. Slogan & Tone of Voice
- **Slogan chính:** *"Schoolify — Số hóa trường học, Khai phóng tri thức."*
- **Tagline kinh doanh:** *"Nền tảng vận hành & kinh doanh giáo dục toàn diện."*
- **Tính cách:** Chuyên nghiệp & Tin cậy (K-12) • Trao quyền & Hiện đại (Creator) • Gần gũi & Dễ dùng (HS Lớp 1–12).

### 5.2. Bảng màu chuẩn (áp dụng khi code FE)

| Vai trò | Tên | Mã HEX | Ghi chú ứng dụng |
| :--- | :--- | :--- | :--- |
| ⭐ Primary Base | Schoolify Cyan | `#00B8DD` | Logo, Header, Button chính, Icon thương hiệu |
| Primary Dark | Deep Cyan | `#009BBD` | Hover Button, Active Menu, Scrolled Header |
| Primary Deep | Midnight Cyan | `#007D99` | Border, Focus Ring, Shadow |
| Primary Tint | Ice Cyan Tint | `#E6F8FC` | Background card, Badge, Pill chọn lọc |
| ⚡ Accent CTA | Energized Amber | `#F59E0B` | Nút mua khóa học, CTA dùng thử, Rating sao |
| ✅ Success | Growth Emerald | `#10B981` | Thanh tiến độ, điểm tối đa, badge hoàn thành |
| 🌑 Dark Neutral | Deep Ocean Navy | `#0A1E38` | Dark mode, Footer, Card tối |
| ☁️ Light Neutral | Cloud Ice White | `#F8FAFC` | Background Dashboard, Card bài học |
| ⚠️ Alert | Vibrant Coral | `#F43F5E` | Cảnh báo học phí quá hạn, bài cần nộp gấp |

### 5.3. Typography
- **Headings:** `Plus Jakarta Sans` hoặc `Lexend`
- **Body/UI Dashboard:** `Inter` (tối ưu màn hình, bảng số tài chính)

### 5.4. Nguyên tắc UI/UX bắt buộc
- **Header:** Nền Cyan `#00B8DD`, Logo trắng, CTA tương phản cao.
- **Student UI:** Gamification — bo tròn `rounded-2xl/3xl`, tiến trình màu emerald, huy hiệu, hiệu ứng chúc mừng.
- **Teacher/Admin UI:** Chuẩn SaaS chuyên nghiệp — tách bạch tab **Học vụ K-12** (điểm danh, đề thi, chấm bài) và tab **Kinh doanh Creator** (doanh thu, hoa hồng, rút tiền).
- **Certificate:** Nền trắng, viền Cyan, dấu mộc số hóa Schoolify.
- **Responsive bắt buộc** (mobile → tablet → desktop), mobile-first.

---

## 6. 🤖 Định Hướng AI Tương Lai

**📄 Tài liệu gốc:** `docs/AI-feature-idea.md`

Các **điểm chạm AI** được chia theo vai trò (chưa triển khai — là roadmap):

| Đối tượng | Tính năng AI |
| :--- | :--- |
| 🧑🏫 Teacher & HOD | 1) AI chấm tự luận + tạo lời phê (`ExamSubmission`/`SubmissionAnswer`), 2) Tạo ngân hàng câu hỏi/đề từ tài liệu, 3) Soạn đề cương/bài giảng (Copilot), 4) Phụ đề + tóm tắt video bài giảng |
| 🧑🎓 Student | 1) AI gia sư Socratic 24/7 trong bài học, 2) Chẩn đoán lỗ hổng kiến thức, 3) Tạo Flashcard/Mindmap ôn tập |
| 👨👩👧 Parent | 1) Báo cáo tổng kết học tập thông minh hàng tuần, 2) AI tư vấn đồng hành |
| 🏢 Principal & Staff | 1) Chatbot tư vấn tuyển sinh 24/7, 2) Dự báo nguy cơ bỏ học/học lực giảm |
| 👑 Super Admin | 1) Kiểm duyệt nội dung tự động trước khi xuất bản Marketplace |

**Technical stack đề xuất (khi triển khai):** LLM (Gemini/GPT/Claude) • RAG + `pgvector` • BullMQ + Redis cho tác vụ nền.
**Roadmap 3 phase:** Phase 1 = Sinh câu hỏi & chấm tự luận → Phase 2 = Gia sư AI & báo cáo phụ huynh → Phase 3 = Tuyển sinh tự động & chẩn đoán kiến thức.

---

## 7. ⚙️ Ghi Chú Kỹ Thuật Git & Môi Trường

**📄 Tài liệu gốc:** `docs/antigravity.md`

> ⚠️ **RẤT QUAN TRỌNG trên máy Unbuntu/Antigravity:** Git local **KHÔNG hỗ trợ HTTPS** (lỗi `git-remote-https`).

| Mục | Quy tắc |
| :--- | :--- |
| Giao thức | **BẮT BUỘC dùng SSH** — remote URL dạng `git@github.com:Kimthinh175/schoolify_FE.git` |
| Push target | **CHỈ** push tới `https://github.com/Kimthinh175/schoolify_FE` (branch `thinh`) |
| Bước setup 1 lần | Copy public key (`~/.ssh/id_ed25519.pub`) → Add tại `https://github.com/settings/ssh/new` |
| Kiểm tra | `ssh -T git@github.com` → chờ thông báo `Hi Kimthinh175! You've successfully authenticated...` |
| Lưu ý Agent | Không clone/push/pull bằng `https://`; nếu user chưa kết nối SSH → báo lỗi & hướng dẫn copy pubkey |

---

## 8. 🗺️ Đối Chiếu Nhanh Với Cấu Trúc Frontend Hiện Tại

> Quan sát nhanh cấu trúc `src/app` (dành cho người mới bắt đầu code): mỗi vai trò có một **Layout + nhóm route** riêng.

| Vai trò | Route segment | Màn hình chính hiện có |
| :--- | :--- | :--- |
| Super Admin | `src/app/admin/` | `dashboard`, `schools`, `packages`, `orders`, `users` |
| Principal | `src/app/school/` | `dashboard`, `departments`, `teachers`, `classes`, `admissions`, `cashier`, `subscription`, `curriculum-approval` |
| Teacher | `src/app/teacher/` | `dashboard`, `classes`, `courses`, `grading`, `revenue`, `rewards` |
| Student | `src/app/student/` | `dashboard`, `my-courses`, `learn`, `timetable`, `exams`, `exam`, `rewards`, `inventory` |
| Parent | `src/app/parent/` | `dashboard`, `academic`, `timetable`, `tuition` |
| Auth (chung) | `src/app/(auth)/` | `login` (+ 4 cổng riêng: `login/school`, `login/teacher`, `login/student`, `login/parent`), `register` |
| Public (chung) | `src/app/(public)/` | Trang chủ, `courses` (Marketplace) + `courses/[id]` (Course Landing), `pricing` |

**Route động (dynamic segment) đáng chú ý:** `student/learn/[courseId]/[lessonId]` (Course Learning Player), `student/exam/[examId]` (Exam Runner), `teacher/grading/[submissionId]` (Chấm bài), `courses/[id]` (Chi tiết khóa học Marketplace).

**Cấu trúc hỗ trợ chung:**
- `src/components/features/*` (hiện có `features/admin/QuotaBar.tsx`), `src/components/layout/*` (`AppHeader`, `AppSidebar`, `Navbar`, `Footer`, `DashboardLayoutWrapper`), `src/components/ui/*` (shadcn: `avatar`, `badge`, `button`, `card`, `dialog`, `dropdown-menu`, `input`, `progress`, `skeleton`, `table`, `tabs`).
- `src/services/*`: `school.service.ts`, `course.service.ts`, `exam.service.ts`, `order.service.ts` + barrel `index.ts` + mock `services/mock/data.ts`.
- `src/store/`: `auth.store.ts`, `parent.store.ts` (dùng `currentRole` / `currentSchoolId` để hỗ trợ **Switch Role**).
- `src/types/`: `auth.ts` (`SystemRole`, `SchoolRole`), `course`, `exam`, `order`, `school`, `store`, `index`.
- `src/lib/utils.ts` (`cn()`), `src/hooks/` và `src/constants/` (hiện mới là placeholder `.gitkeep`, chưa có mã nguồn).

---

## 📌 Phụ lục: Bản đồ tài liệu gốc trong `docs/`

| File gốc | Nội dung | Tóm trong mục |
| :--- | :--- | :--- |
| `docs/flows/super_admin_flow.md` | Luồng Super Admin | [4.1](#41--super_admin--quản-trị-viên-nền-tảng) |
| `docs/flows/principal_flow.md` | Luồng Principal/Vice Principal | [4.2](#42--principal--vice_principal--ban-giám-hiệu--chủ-trung-tâm) |
| `docs/flows/head_of_department_flow.md` | Luồng Trưởng bộ môn | [4.3](#43--head_of_department--trưởng-bộ-môn) |
| `docs/flows/teacher_flow.md` | Luồng Giáo viên | [4.4](#44--teacher--giáo-viên-giảng-dạy--kinh-doanh) |
| `docs/flows/staff_flow.md` | Luồng Nhân viên giáo vụ | [4.5](#45--staff--nhân-viên-giáo-vụ--vận-hành-trung-tâm) |
| `docs/flows/student_flow.md` | Luồng Học sinh | [4.6](#46--student--học-sinh) |
| `docs/flows/parent_flow.md` | Luồng Phụ huynh | [4.7](#47--parent--phụ-huynh) |
| `docs/nhan_dien_thuong_hieu.md` | Brand guidelines | [5](#5--bộ-nhận-diện-thương-hiệu) |
| `docs/AI-feature-idea.md` | Ý tưởng AI | [6](#6--định-hướng-ai-tương-lai) |
| `docs/antigravity.md` | Git & môi trường | [7](#7--ghi-chú-kỹ-thuật-git--môi-trường) |

---

*Tài liệu tổng hợp (Master Guide) — luôn đồng bộ với `docs/` gốc. Khi có thay đổi ở bất kỳ file nguồn nào, cần cập nhật lại file này.*