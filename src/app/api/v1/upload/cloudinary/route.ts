import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      'ls1wfhzn';

    const apiKey =
      process.env.CLOUDINARY_API_KEY ||
      '378947224199198';

    const apiSecret =
      process.env.CLOUDINARY_API_SECRET ||
      '0hb5K64KLRB8iSZkJrDZJUNfK4w';

    const uploadPreset =
      process.env.CLOUDINARY_UPLOAD_PRESET ||
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const folder = 'schoolify/forum_comments';
    const timestamp = Math.floor(Date.now() / 1000);

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);

    // 1. Nếu có API Key và API Secret: Tạo chữ ký bảo mật SHA-1 (Signed Upload)
    if (apiKey && apiSecret) {
      const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

      cloudinaryFormData.append('api_key', apiKey);
      cloudinaryFormData.append('timestamp', timestamp.toString());
      cloudinaryFormData.append('folder', folder);
      cloudinaryFormData.append('signature', signature);
    } else if (uploadPreset) {
      // 2. Chế độ Unsigned Upload nếu dùng preset
      cloudinaryFormData.append('upload_preset', uploadPreset);
      cloudinaryFormData.append('folder', folder);
    }

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    const data = await cloudinaryRes.json().catch(() => null);

    if (cloudinaryRes.ok && data?.secure_url) {
      return NextResponse.json({
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        width: data.width,
        height: data.height,
        source: 'cloudinary_signed',
      });
    }

    // Nếu Cloudinary trả lỗi, gửi thông báo chi tiết
    return NextResponse.json(
      {
        success: false,
        message: data?.error?.message || 'Không thể tải ảnh lên Cloudinary',
      },
      { status: cloudinaryRes.status || 400 }
    );
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
