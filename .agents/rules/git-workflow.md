---
name: Git Push and Repository Rules
description: Strict iron rule restricting all git interactions and limiting push operations solely to schoolify_FE upon explicit user request.
trigger: always_on
---

# Git Repository & Remote Rules (Luật Thép)

Trong suốt cuộc trò chuyện và toàn bộ các phiên làm việc, Agent BẮT BUỘC phải tuân thủ nghiêm ngặt các nguyên tắc sau:

1. **LUẬT THÉP: Chỉ tác động vào GitHub khi có yêu cầu trực tiếp từ User:**
   - **TUYỆT ĐỐI KHÔNG** tự ý chạy `git push`, merge Pull Request, đóng/mở PR, tạo/xóa branch remote hoặc gọi GitHub API làm thay đổi trạng thái remote trên GitHub nếu **CHƯA CÓ LỆNH RÕ RÀNG** từ User (ví dụ: User chủ động yêu cầu *"push code"*, *"merge PR"*, *"đẩy lên github"*).
   - Mọi thao tác chỉnh sửa mã nguồn, cấu hình, test build và chạy dev server mặc định chỉ được thực hiện ở môi trường **LOCAL**. Code chỉ được đẩy lên remote sau khi User đã kiểm tra và cho phép.

2. **Giới hạn Repository được Push:**
   - Khi User yêu cầu push, **CHỈ ĐƯỢC PHÉP TÁC ĐỘNG / PUSH CODE** vào duy nhất repository Frontend:
     👉 **`https://github.com/Kimthinh175/schoolify_FE`** (Remote: `origin` của `FE`)
   - **TUYỆT ĐỐI KHÔNG** can thiệp hay push code vào bất kỳ repository nào khác (bao gồm cả `schoolify_BE` hay bất kỳ remote/repo nào khác).

3. **Quy chuẩn nhánh làm việc (Branch Standard):**
   - Luôn kiểm tra nhánh làm việc trước khi thực hiện commit/push (mặc định là nhánh `thinh` trên `schoolify_FE`).
   - Đảm bảo lịch sử commit của nhánh làm việc kế thừa đúng chuẩn để có thể tạo Pull Request trên GitHub mà không bị lỗi phân nhánh lịch sử.
