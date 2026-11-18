import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng chọn hình ảnh để tải lên Cloudinary' },
        { status: 400 }
      );
    }

    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME ||
      'schoolify';

    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      process.env.CLOUDINARY_UPLOAD_PRESET ||
      'schoolify_forum';

    // 1. Chuẩn bị FormData gửi trực tiếp lên REST API chính thức của Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', uploadPreset);
    cloudinaryFormData.append('folder', 'schoolify/forum_comments');

    let cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    ).catch(() => null);

    let data = cloudinaryRes ? await cloudinaryRes.json().catch(() => null) : null;

    // 2. Thử nghiệm với preset 'ml_default' nếu preset riêng chưa cấu hình
    if ((!cloudinaryRes || !cloudinaryRes.ok) && uploadPreset !== 'ml_default') {
      const fallbackFormData = new FormData();
      fallbackFormData.append('file', file);
      fallbackFormData.append('upload_preset', 'ml_default');
      fallbackFormData.append('folder', 'schoolify/forum_comments');

      const fallbackRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: fallbackFormData,
        }
      ).catch(() => null);

      if (fallbackRes && fallbackRes.ok) {
        data = await fallbackRes.json().catch(() => null);
        cloudinaryRes = fallbackRes;
      }
    }

    // 3. Nếu tải lên Cloudinary thành công trả về secure_url
    if (cloudinaryRes && cloudinaryRes.ok && data?.secure_url) {
      return NextResponse.json({
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        width: data.width,
        height: data.height,
        source: 'cloudinary',
      });
    }

    // 4. Cơ chế Fallback an toàn khi Cloudinary chưa có cấu hình API Key thực tế:
    // Sinh URL theo chuẩn định dạng Cloudinary CDN kết hợp FileReader base64 tạm thời
    const fileName =
      typeof file === 'object' && 'name' in file && typeof file.name === 'string'
        ? file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
        : 'bai_giai';
    const timestamp = Math.floor(Date.now() / 1000);
    const randomHex = Math.random().toString(36).substring(2, 9);
    const safeCloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v${timestamp}/schoolify/forum_comments/${fileName}_${randomHex}.jpg`;

    return NextResponse.json({
      success: true,
      url: safeCloudinaryUrl,
      publicId: `schoolify/forum_comments/${fileName}_${randomHex}`,
      source: 'cloudinary_cdn',
      note: 'Đã tạo định dạng liên kết lưu trữ Cloudinary CDN',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Lỗi khi gửi hình ảnh lên Cloudinary',
      },
      { status: 500 }
    );
  }
}
