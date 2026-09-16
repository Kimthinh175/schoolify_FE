import { z } from 'zod';

/** Form phân công khóa học vào lớp (ERD: ClassCourse) */
export const assignCoursesSchema = z.object({
  course_ids: z.array(z.string()),
});
export type AssignCoursesValues = z.infer<typeof assignCoursesSchema>;

/** Form tạo/sửa buổi học (ERD: ClassSession) */
export const sessionFormSchema = z
  .object({
    class_id: z.string().min(1, 'Vui lòng chọn lớp'),
    title: z.string().min(1, 'Vui lòng nhập tiêu đề buổi học'),
    date: z.string().min(1, 'Chọn ngày dạy'),
    start_time: z.string().min(1, 'Chọn giờ bắt đầu'),
    end_time: z.string().min(1, 'Chọn giờ kết thúc'),
    room: z.string().optional(),
    meeting_url: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.start_time && val.end_time && val.end_time <= val.start_time) {
      ctx.addIssue({
        code: 'custom',
        path: ['end_time'],
        message: 'Giờ kết thúc phải sau giờ bắt đầu.',
      });
    }
    if (val.meeting_url && !/^https?:\/\//i.test(val.meeting_url)) {
      ctx.addIssue({
        code: 'custom',
        path: ['meeting_url'],
        message: 'Link phòng học phải bắt đầu bằng http:// hoặc https://',
      });
    }
  });
export type SessionFormValues = z.infer<typeof sessionFormSchema>;
