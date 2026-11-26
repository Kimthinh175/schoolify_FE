import { NextResponse } from 'next/server';

const BE_BASE_URL = process.env.NEXT_PUBLIC_BE_URL || process.env.BE_URL || 'http://localhost:3005';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {}

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const auth = request.headers.get('authorization');
    if (auth) headers['authorization'] = auth;
    const cookie = request.headers.get('cookie');
    if (cookie) headers['cookie'] = cookie;
    const userId = request.headers.get('x-user-id');
    if (userId) headers['x-user-id'] = userId;
    const userRole = request.headers.get('x-user-role');
    if (userRole) headers['x-user-role'] = userRole;

    // Payload ma trận Admin (có matrix_blueprint) -> chuyển thẳng xuống NestJS PostgreSQL (/exams/admin-matrix-generate)
    if (payload && payload.matrix_blueprint) {
      if (!payload.exam_info) {
        return NextResponse.json(
          {
            success: false,
            message: 'Payload không hợp lệ: thiếu thông tin exam_info',
          },
          { status: 400 },
        );
      }

      const beAdminRes = await fetch(`${BE_BASE_URL}/exams/admin-matrix-generate`, {
        method: 'POST',
        headers,
        body: rawBody,
      });

      const data = await beAdminRes.json().catch(() => null);
      return NextResponse.json(
        data || { success: false, message: 'Lỗi phản hồi từ BE PostgreSQL' },
        { status: beAdminRes.status },
      );
    }

    // Payload luyện thi học sinh -> chuyển tiếp sang NestJS Backend API /exams/matrix-generate
    const beRes = await fetch(`${BE_BASE_URL}/exams/matrix-generate`, {
      method: 'POST',
      headers,
      body: rawBody,
    });

    const data = await beRes.json().catch(() => null);
    return NextResponse.json(
      data || { success: false, message: 'Lỗi phản hồi từ BE' },
      { status: beRes.status },
    );
  } catch (error: any) {
    console.error('[API Matrix Generate Error]:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi kết nối Backend khi sinh đề ma trận: ' + (error?.message || 'Unknown error'),
      },
      { status: 500 },
    );
  }
}
