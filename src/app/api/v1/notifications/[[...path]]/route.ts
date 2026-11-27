import { NextRequest, NextResponse } from 'next/server';

const BE_BASE_URL =
  process.env.NEXT_PUBLIC_BE_URL || process.env.BE_URL || 'http://localhost:3005';

type Context = { params: Promise<{ path?: string[] }> };

function buildHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const passthroughKeys = [
    'cookie',
    'authorization',
    'x-user-id',
    'x-school-id',
    'user-agent',
    'accept-language',
  ];
  for (const key of passthroughKeys) {
    const val = req.headers.get(key);
    if (val) headers[key] = val;
  }
  return headers;
}

const LOCAL_FALLBACK_NOTIFICATIONS = [
  {
    id: 'notif-local-01',
    user_id: 'usr-student-local-01',
    type: 'success',
    title: 'Nhận +9 Tia Sáng năng lượng đầu ngày',
    message:
      'Hệ thống đã cấp tự động 9 Tia Sáng (⚡) hôm nay vào tài khoản của bạn. Hãy duy trì chuỗi ngày luyện đề nhé!',
    link: '/student/rewards',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'notif-local-02',
    user_id: 'usr-student-local-01',
    type: 'info',
    title: 'Lộ trình AI phát hiện chuyên đề cần ưu tiên',
    message:
      'Dựa trên kết quả bài thi gần nhất, AI khuyên bạn nên ôn tập "Phương trình mặt phẳng Oxyz" để gỡ bẫy nhầm dấu vectơ pháp tuyến.',
    link: '/student/practice',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
  },
  {
    id: 'notif-local-03',
    user_id: 'usr-student-local-01',
    type: 'success',
    title: 'Mở khóa Thành tựu: Chiến Binh Kiên Trì (+50 Ngọc)',
    message:
      'Chúc mừng bạn đã hoàn thành chuỗi luyện tập chuyên đề Toán 12 và nhận thưởng 50 Ngọc Tri Thức (💎).',
    link: '/student/achievements',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'notif-local-04',
    user_id: 'usr-student-local-01',
    type: 'info',
    title: 'Thầy Nguyễn Hoàng Minh đã phản hồi trên Diễn đàn',
    message:
      'Câu hỏi của bạn về "Cực trị hàm hợp chứa dấu giá trị tuyệt đối" đã có lời giải chi tiết được gắn dấu Đáp án chuẩn.',
    link: '/forum',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: 'notif-local-05',
    user_id: 'usr-student-local-01',
    type: 'warning',
    title: 'Bảng xếp hạng Mùa giải Tuần đang gay cấn!',
    message:
      'Bạn đang ở Top 5 Khối 12. Chỉ cần thêm 1 đề đạt 8.5+ điểm để vươn lên Top 3 nhận thưởng Ngọc cuối tuần.',
    link: '/leaderboard',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
];

async function forwardNotifications(req: NextRequest, ctx: Context) {
  const pathSegments = (await ctx.params).path;
  const subPath =
    Array.isArray(pathSegments) && pathSegments.length > 0
      ? `/${pathSegments.join('/')}`
      : '';
  const search = req.nextUrl.search || '';
  const method = req.method.toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD' && method !== 'DELETE';
  const bodyText = hasBody ? await req.text().catch(() => '') : undefined;

  try {
    const beRes = await fetch(`${BE_BASE_URL}/notifications${subPath}${search}`, {
      method,
      headers: buildHeaders(req),
      body: hasBody && bodyText ? bodyText : undefined,
      cache: 'no-store',
    });

    const data = await beRes.json().catch(() => ({
      success: beRes.ok,
      statusCode: beRes.status,
    }));

    return NextResponse.json(data, { status: beRes.status });
  } catch {
    // Fallback an toàn theo đúng cấu trúc bảng `notifications` trong ERD khi BE (port 3005) chưa bật
    if (method === 'GET') {
      return NextResponse.json({
        success: true,
        data: {
          items: LOCAL_FALLBACK_NOTIFICATIONS,
          total: LOCAL_FALLBACK_NOTIFICATIONS.length,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Đã đồng bộ trạng thái thông báo (Local Demo)',
    });
  }
}

export async function GET(req: NextRequest, ctx: Context) {
  return forwardNotifications(req, ctx);
}
export async function PATCH(req: NextRequest, ctx: Context) {
  return forwardNotifications(req, ctx);
}
export async function DELETE(req: NextRequest, ctx: Context) {
  return forwardNotifications(req, ctx);
}
export async function POST(req: NextRequest, ctx: Context) {
  return forwardNotifications(req, ctx);
}
