# API Contract — Trang Giáo Viên `/teacher/dashboard`
### Dựng Dashboard Giáo Viên, KPI Doanh Thu & Quản Lý Khóa Học

> Tài liệu bàn giao Backend. Mọi schema dưới đây **khớp 1-1 với TypeScript types** mà Frontend đang dùng (`src/types/*`), nên FE gần như không phải đổi type khi nối API.

---

## 1. Tổng quan

- **Màn hình:** Dashboard Giáo Viên — KPI doanh thu + quản lý khóa học + bộ lọc `CourseStatus` + switch bán Marketplace & giá.
- **Bảng ERD liên quan:** `TeacherProfile`, `Course`, `Class`, `Transaction` (giao dịch `TEACHER_INCOME` / `COMMISSION_FEE`), gián tiếp `Order`.
- **Frontend đang gọi** qua `src/services/teacher.service.ts` các hàm:
  - `getDashboardStats(teacherId)` — KPI tổng hợp
  - `getMyCourses(teacherId, status?)` — danh sách khóa học
  - `toggleMarketplace(teacherId, courseId, value)` — bật/tắt bán Marketplace
  - `getProfile / getMyClasses / getTransactions` — dữ liệu phụ (đã có sẵn trong service)

---

## 2. Quy ước chung (Backend bắt buộc tuân thủ)

| Hạng mục | Quy ước |
| :--- | :--- |
| Base URL | `/api/v1` |
| Auth | `Authorization: Bearer <JWT>` — role yêu cầu: `TEACHER` (SchoolRole) |
| **teacher_id** | ⚠️ **KHÔNG nhận từ FE.** Backend suy ra từ token: `JWT.sub (user_id) → TeacherProfile.user_id → TeacherProfile.id`. (FE có helper `resolveTeacherId` chỉ để giả lập mock, sẽ bỏ khi nối API.) |
| Content-Type | `application/json; charset=utf-8` |
| Thời gian | ISO 8601 UTC, ví dụ `2026-08-18T10:02:15Z` |
| Tiền tệ | Số nguyên VNĐ (integer, không thập phân), ví dụ `499000` |
| Success envelope | `{ "data": <payload>, "meta"?: { ... } }` |
| Error envelope | `{ "error": { "code": "STRING_CODE", "message": "Mô tả", "details"?: any } }` |
| Phân trang | `?page=1&limit=20` → `meta: { page, limit, total, totalPages }` |
| HTTP codes | 200 OK · 201 Created · 400 Bad Request · 401 Unauthorized · 403 Forbidden · 404 Not Found · 409 Conflict · 422 Unprocessable Entity · 500 Internal |

> **Lưu ý envelope:** FE hiện đọc dữ liệu dạng "raw" (mock). Khi backend trả envelope `{ data }`, FE chỉ cần bọc thêm 1 lớp adapter trong service (`res.data`) — **không đổi component**.

---

## 3. Danh sách Endpoint

| # | Method | Endpoint | Mục đích | Hàm FE tương ứng | MVP |
| :-- | :--- | :--- | :--- | :--- | :-- |
| 1 | `GET` | `/teacher/me/dashboard/stats` | KPI tổng hợp (thu nhập, học viên, lớp, khóa học) | `getDashboardStats` | ✅ |
| 2 | `GET` | `/teacher/me/courses` | DS khóa học của tôi + lọc `status` | `getMyCourses` | ✅ |
| 3 | `PATCH` | `/teacher/me/courses/{courseId}/marketplace` | Bật/tắt `is_marketplace` | `toggleMarketplace` | ✅ |
| 4 | `PATCH` | `/teacher/me/courses/{courseId}` | (mở rộng) sửa `price` / `status` | — | ➖ |
| 5 | `GET` | `/teacher/me/profile` | Hồ sơ giáo viên | `getProfile` | ➖ |
| 6 | `GET` | `/teacher/me/classes` | DS lớp đang phụ trách | `getMyClasses` | ➖ |
| 7 | `GET` | `/teacher/me/transactions` | Lịch sử `TEACHER_INCOME`/`COMMISSION_FEE` | `getTransactions` | ➖ |

> ✅ = bắt buộc cho màn này · ➖ = có sẵn trong service, dùng cho trang liên quan (Revenue, Classes) — nên làm sớm để đồng bộ.

---

## 4. Chi tiết Endpoint

### 4.1. `GET /teacher/me/dashboard/stats`

**Query (tùy chọn):** `from`, `to` (ISO date) để lọc doanh thu theo kỳ. Mặc định: toàn thời gian.

**Response 200**
```json
{
  "data": {
    "totalIncome": 24664500,
    "totalCommissionFee": 2440000,
    "totalStudents": 468,
    "totalClasses": 4,
    "totalCourses": 6,
    "marketplaceCourses": 4,
    "pendingCourses": 1
  }
}
```

| Field | Type | Ý nghĩa | Nguồn (ERD) |
| :--- | :--- | :--- | :--- |
| `totalIncome` | number | Tổng thu nhập thực nhận | `SUM(Transaction.amount) WHERE type='TEACHER_INCOME'` |
| `totalCommissionFee` | number | Tổng phí sàn đã trích | `SUM(Transaction.amount) WHERE type='COMMISSION_FEE'` |
| `totalStudents` | number | Tổng học viên theo học các khóa | `SUM(Course.total_students)` |
| `totalClasses` | number | Số lớp đang phụ trách | `COUNT(Class) WHERE teacher_id = me` |
| `totalCourses` | number | Tổng khóa học sở hữu | `COUNT(Course) WHERE teacher_id = me` |
| `marketplaceCourses` | number | Số khóa đang bán Marketplace | `COUNT(Course) WHERE is_marketplace=true` |
| `pendingCourses` | number | Số khóa chờ duyệt | `COUNT(Course) WHERE status='PENDING'` |

---

### 4.2. `GET /teacher/me/courses`

**Query:**
| Param | Kiểu | Mặc định | Ghi chú |
| :--- | :--- | :--- | :--- |
| `status` | enum | `ALL` | `ALL` \| `DRAFT` \| `PENDING` \| `PUBLISHED` \| `REJECTED` \| `HIDDEN` |
| `search` | string | — | tìm theo `title` |
| `sort` | string | `-updated_at` | ví dụ `-created_at`, `title` |
| `page` | number | `1` | |
| `limit` | number | `20` | |

**Response 200**
```json
{
  "data": [
    {
      "id": "crs-t01",
      "school_id": "sch-01",
      "teacher_id": "tchr-01",
      "department_id": "dept-toan-tin",
      "title": "Toán 12: Chuyên Đề Hàm Số & Đồ Thị",
      "slug": "toan-12-ham-so-do-thi",
      "description": "...",
      "thumbnail_url": "https://...",
      "price": 599000,
      "is_marketplace": true,
      "status": "PUBLISHED",
      "level": "ADVANCED",
      "rating": 4.9,
      "total_reviews": 96,
      "total_students": 128,
      "total_lessons": 32,
      "total_duration_mins": 960,
      "teacher_name": "ThS. Nguyễn Văn Hùng",
      "teacher_avatar": "https://...",
      "department_name": "Tổ Toán & Tin Học",
      "created_at": "2026-03-05T00:00:00Z",
      "updated_at": "2026-08-20T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 6, "totalPages": 1 }
}
```

> ⚠️ **Bắt buộc lọc theo `teacher_id` của token** — đây là điểm quan trọng nhất (chống rò dữ liệu giáo viên khác). Không nhận `teacher_id` từ query.

**Response rỗng:** `{ "data": [], "meta": { "total": 0, ... } }` (không 404).

---

### 4.3. `PATCH /teacher/me/courses/{courseId}/marketplace`

Bật/tắt bán khóa học trên Marketplace (`is_marketplace`).

**Body**
```json
{ "is_marketplace": true }
```

**Response 200** — trả về `Course` đã cập nhật (cùng schema 4.2, có `updated_at` mới).

**Business rules / lỗi:**
| Tình huống | HTTP | error.code |
| :--- | :--- | :--- |
| Khóa không tồn tại **hoặc không thuộc teacher** | `404` | `COURSE_NOT_FOUND` |
| Khóa đang `DRAFT` / `PENDING` (chưa xuất bản) | `409` | `COURSE_NOT_PUBLISHED` |
| Bật marketplace nhưng `price <= 0` | `422` | `PRICE_REQUIRED_FOR_MARKETPLACE` |
| Thiếu quyền `TEACHER` | `403` | `FORBIDDEN` |

> FE hiện **disable switch** với khóa `DRAFT`/`PENDING` (chỉ cho `PUBLISHED`/`HIDDEN`) và validate giá > 0 → backend **vẫn phải validate lại** (không tin FE).

---

### 4.4. `PATCH /teacher/me/courses/{courseId}` *(mở rộng)*

Sửa nhanh thông tin công khai. Body (partial): `{ "price"?: number, "title"?: string, "status"?: CourseStatus, "description"?: string, "thumbnail_url"?: string }`.
Quy tắc: `status` chỉ nhận transition hợp lệ (`DRAFT→PENDING`, `PENDING→PUBLISHED/REJECTED`, `PUBLISHED→HIDDEN`).

---

### 4.5. `GET /teacher/me/profile`

**Response 200** — khớp type `TeacherProfile`:
```json
{
  "data": {
    "id": "tchr-01",
    "user_id": "usr-teacher-01",
    "department_id": "dept-toan-tin",
    "department_name": "Tổ Toán & Tin Học",
    "bio": "...",
    "expertise": "Đại số - Giải tích",
    "experience_years": 10,
    "created_at": "2026-01-10T08:00:00Z"
  }
}
```
> Nếu tài khoản **không có** `TeacherProfile` → trả `404 TEACHER_PROFILE_NOT_FOUND` (FE sẽ hiển thị empty-state "Chưa tìm thấy hồ sơ giáo viên").

---

### 4.6. `GET /teacher/me/classes`

**Response 200** — mảng `Class`:
```json
{
  "data": [
    {
      "id": "cls-t01",
      "school_id": "sch-01",
      "teacher_id": "tchr-01",
      "name": "12A1 - Luyện Thi Đại Học",
      "code": "TK-12A1",
      "room": "Phòng A302",
      "start_date": "2026-08-05T00:00:00Z",
      "end_date": "2027-05-30T00:00:00Z",
      "student_count": 38,
      "teacher_name": "ThS. Nguyễn Văn Hùng",
      "created_at": "2026-07-28T00:00:00Z"
    }
  ]
}
```

---

### 4.7. `GET /teacher/me/transactions`

**Query:** `type` (`TEACHER_INCOME` \| `COMMISSION_FEE`), `from`, `to`, `page`, `limit`.

**Response 200** — mảng `Transaction`:
```json
{
  "data": [
    {
      "id": "txn-t01",
      "order_id": "ord-t-01",
      "teacher_id": "tchr-01",
      "amount": 4241500,
      "type": "TEACHER_INCOME",
      "description": "Thu nhập thực nhận (85%) ...",
      "created_at": "2026-08-18T10:02:15Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 8, "totalPages": 1 }
}
```

> ⚠️ **Cần bổ sung cột `teacher_id` vào bảng `Transaction`** (hiện ERD gốc chỉ có `order_id`). Đây là thay đổi DB backing cho dashboard này — xem mục 6.

---

## 5. Business Rules & Công thức KPI

Tất cả KPI **tính theo `teacher_id` lấy từ token** (không nhận từ client).

```
totalIncome        = SUM(T.amount)  WHERE T.type = 'TEACHER_INCOME'  AND T.teacher_id = me
totalCommissionFee = SUM(T.amount)  WHERE T.type = 'COMMISSION_FEE'  AND T.teacher_id = me
totalStudents      = SUM(C.total_students) WHERE C.teacher_id = me
totalClasses       = COUNT(C)       WHERE C.teacher_id = me                -- bảng Class
totalCourses       = COUNT(C)       WHERE C.teacher_id = me                -- bảng Course
marketplaceCourses = COUNT(C)       WHERE C.is_marketplace = TRUE AND C.teacher_id = me
pendingCourses     = COUNT(C)       WHERE C.status = 'PENDING'      AND C.teacher_id = me
```

**Enum hợp lệ:**
- `CourseStatus`: `DRAFT` | `PENDING` | `PUBLISHED` | `REJECTED` | `HIDDEN`
- `TransactionType`: `PAYMENT_TO_ADMIN` | `COMMISSION_FEE` | `TEACHER_INCOME` | `TUITION_FEE` (dashboard chỉ dùng 2 loại sau)

**Quy tắc nghiệp vụ quan trọng:**
1. **Ownership**: mọi thao tác (list/toggle/update) chỉ áp dụng cho bản ghi có `teacher_id = me`. Truy cập khóa của GV khác → `404` (che giấu sự tồn tại) hoặc `403`.
2. **Marketplace switch**: chỉ bật được khi `status ∈ {PUBLISHED, HIDDEN}` **và** `price > 0`. Khi tắt marketplace → giữ nguyên dữ liệu khác.
3. **`totalIncome` là tiền thực nhận (đã trừ phí sàn)** — hệ số 85% (theo mock). Backend nên ghi `Transaction` với `type='TEACHER_INCOME'` khi đơn `Order` (COURSE) được thanh toán, và `COMMISSION_FEE` cho phần nền tảng.
4. **`totalStudents`**: mock đang `SUM(course.total_students)`. Nếu có bảng `ClassEnrollment`/`CourseEnrollment` thì dùng `COUNT(DISTINCT student_id)` để chính xác (cần chốt — mục 9).
5. **Tiền tệ**: VNĐ số nguyên, không làm tròn thập phân ở API.

---

## 6. Mapping DB & Thay đổi schema cần thiết

| Entity/Field | Trạng thái trong types FE | Yêu cầu DB |
| :--- | :--- | :--- |
| `TeacherProfile.id`, `user_id`, `department_id` | ✅ có | Bảng `teacher_profiles` với `user_id` unique |
| `Course.teacher_id`, `is_marketplace`, `price`, `status`, `total_students` | ✅ có | `courses` (đảm bảo index `teacher_id`, `status`) |
| `Class.teacher_id`, `student_count` | ✅ có | `classes` (index `teacher_id`) |
| **`Transaction.teacher_id`** | ⚠️ **FE mới thêm** | **CẦN THÊM CỘT** `teacher_id` (FK → `teacher_profiles.id`) vào bảng giao dịch, + index. Hiện ERD gốc chỉ có `order_id`. |
| `Order.seller_id` | ✅ có (optional) | Nên set `seller_id = teacher` cho đơn `reference_type='COURSE'` để đối soát |

**Indexes đề xuất:** `courses(teacher_id, status)`, `classes(teacher_id)`, `transactions(teacher_id, type, created_at)`.

**Câu hỏi FK `Transaction.teacher_id`:** có thể thay bằng join `Order.seller_id` — nhưng FE đã chuẩn hoá theo `teacher_id` trực tiếp → khuyến nghị thêm cột để query gọn.

---

## 7. Định dạng lỗi (thống nhất)

```json
{
  "error": {
    "code": "PRICE_REQUIRED_FOR_MARKETPLACE",
    "message": "Cần nhập giá > 0 khi mở bán trên Marketplace.",
    "details": { "courseId": "crs-t04", "price": 0 }
  }
}
```

| HTTP | code | Khi nào |
| :--- | :--- | :--- |
| 401 | `UNAUTHENTICATED` | Thiếu/sai token |
| 403 | `FORBIDDEN` | Không có role `TEACHER` |
| 404 | `COURSE_NOT_FOUND` / `TEACHER_PROFILE_NOT_FOUND` | Không tồn tại hoặc không thuộc mình |
| 409 | `COURSE_NOT_PUBLISHED` | Bật marketplace cho khóa `DRAFT`/`PENDING` |
| 422 | `PRICE_REQUIRED_FOR_MARKETPLACE` | Bật marketplace với `price <= 0` |
| 400 | `VALIDATION_ERROR` | Query/body sai định dạng |

---

## 8. Yêu cầu phi chức năng

- **Auth**: mọi endpoint đều yêu cầu Bearer JWT; role `TEACHER`. `teacher_id` resolve ở middleware (`user_id → teacher_profiles`).
- **Cache**: `GET /dashboard/stats` có thể cache ngắn (30–60s) theo `teacher_id` (invalidate khi có `Order` PAID / toggle marketplace).
- **Performance**: KPI nên tính bằng **1–2 query aggregate** (tránh N+1). Index theo mục 6.
- **Consistency**: `PATCH marketplace` nên trả về **course mới nhất** để FE cập nhật optimistic.
- **Rate limit**: khuyến nghị cho endpoint write (toggle/update).

---

## 9. Câu hỏi mở cần Backend / Product chốt

1. **`totalStudents`**: đếm theo `Course.total_students` (denormalized) hay `COUNT(DISTINCT enrollment)`? → ảnh hưởng độ chính xác KPI.
2. **`Transaction.teacher_id`**: thêm cột trực tiếp hay join qua `Order.seller_id`?
3. **Phí sàn**: tỷ lệ cố định 15% hay cấu hình theo hợp đồng/gói? Có lưu `commission_rate` ở `Order`/`Transaction` không?
4. **Multi-school**: một teacher có thể dạy nhiều `school_id`? Nếu có, dashboard lọc theo `teacher_id` (toàn bộ) hay theo `current_school_id` đang chọn?
5. **`REJECTED`**: dashboard có tab lọc `REJECTED` không? (FE hiện có đủ enum nhưng UI chỉ hiển thị ALL/DRAFT/PENDING/PUBLISHED/HIDDEN.)
6. **Kỳ thống kê** (`from`/`to`): có cần chọn tháng/quý trên KPI không, hay toàn thời gian là đủ?

---

## 10. Danh sách bàn giao (Deliverables) — tóm tắt

Để backend viết được API cho màn này, FE cần cung cấp:
1. ✅ **Danh sách endpoint** (mục 3, 4) — method, path, query, body, response.
2. ✅ **JSON schema khớp types** (mục 4) — `Course`, `Transaction`, `Class`, `TeacherProfile`, `TeacherDashboardStats`.
3. ✅ **Công thức KPI + business rules** (mục 5).
4. ✅ **Mapping DB & thay đổi schema** (mục 6) — đặc biệt cột `Transaction.teacher_id`.
5. ✅ **Format lỗi & HTTP codes** (mục 7).
6. ✅ **Yêu cầu phi chức năng** (mục 8).
7. ⬜ **File `openapi.yaml`** (Swagger) — nếu backend cần, FE có thể xuất từ tài liệu này.
8. ⬜ **Mock server / Postman collection** — để FE test trước khi backend xong.
9. ⬜ **Seed data** khớp mock hiện tại (1 GV `tchr-01`, 6 khóa, 4 lớp, 8 giao dịch) để test parity.

> **Phía FE khi nối API:** thay thân các hàm trong `src/services/teacher.service.ts` bằng `fetch` + đọc `res.data`; bỏ `resolveTeacherId` (backend tự suy từ token); giữ nguyên component/dashboard.



