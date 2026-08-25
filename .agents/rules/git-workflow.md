---
name: Git Push and Repository Rules
description: Strict rule restricting all git push operations solely to the schoolify_FE repository.
trigger: always_on
---

# Git Repository & Push Rules

Trong suốt cuộc trò chuyện và toàn bộ phiên làm việc này, Agent BẮT BUỘC phải tuân thủ nghiêm ngặt các quy tắc sau:

1. **Giới hạn Repository được Push:**
   - **CHỈ ĐƯỢC PHÉP PUSH CODE** vào duy nhất repository Frontend:
     👉 **`https://github.com/Kimthinh175/schoolify_FE`** (Remote: `origin` của `FE`)
   - **TUYỆT ĐỐI KHÔNG** tự ý push code vào bất kỳ repository nào khác (bao gồm cả `schoolify_BE` hay bất kỳ remote/repo nào khác) nếu không có yêu cầu cụ thể trực tiếp từ User.

2. **Quy chuẩn nhánh làm việc (Branch Standard):**
   - Luôn kiểm tra nhánh làm việc trước khi commit/push (mặc định là nhánh `thinh` trên `schoolify_FE`).
   - Đảm bảo lịch sử commit của nhánh `thinh` luôn kế thừa đúng từ `main` để có thể tạo Pull Request trực tiếp trên GitHub mà không bị lỗi phân nhánh lịch sử (unrelated histories).
