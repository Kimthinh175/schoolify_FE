import { NextResponse } from 'next/server';
import { ExamMatrixApiPayload, ExamMatrixConfig } from '@/types/exam';
import { generateExamsFromMatrix } from '@/services/exam-generator.service';
import { INITIAL_MASTER_QUESTIONS } from '@/services/mock/master-questions';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ExamMatrixApiPayload;

    if (!payload || !payload.matrix_blueprint || !payload.exam_info) {
      return NextResponse.json(
        {
          success: false,
          message: 'Payload không hợp lệ: thiếu thông tin exam_info hoặc matrix_blueprint',
        },
        { status: 400 }
      );
    }

    // Convert API payload sang cấu hình ExamMatrixConfig
    const config: ExamMatrixConfig = {
      title: payload.exam_info.title,
      subject: payload.exam_info.subject,
      grade_level: payload.exam_info.grade_level,
      total_questions: payload.matrix_blueprint.total_questions,
      duration_minutes: payload.exam_info.duration_minutes,
      pass_score: payload.exam_info.pass_score,
      scope_mode: payload.scope_config.scope_mode,
      current_chapter: payload.scope_config.current_chapter,
      previous_chapters: payload.scope_config.previous_chapters,
      selected_chapters: payload.scope_config.selected_chapters,
      scope_ratio: {
        current_chapter: payload.scope_config.scope_ratio.current_chapter_percentage,
        previous_chapters: payload.scope_config.scope_ratio.previous_chapters_percentage,
      },
      difficulty_ratio: {
        recognition: payload.matrix_blueprint.bloom_ratio.recognition_percentage,
        understanding: payload.matrix_blueprint.bloom_ratio.understanding_percentage,
        application: payload.matrix_blueprint.bloom_ratio.application_percentage,
        advanced_application: payload.matrix_blueprint.bloom_ratio.advanced_application_percentage,
      },
      category_distribution: payload.matrix_blueprint.category_distribution,
      variant_count: payload.variants_config.variant_count,
      variant_prefix: payload.variants_config.variant_prefix,
      access_tier: payload.exam_info.access_tier,
      upsell_course_id: payload.exam_info.upsell_course_id,
    };

    // Sinh đề thi theo ma trận chuẩn 4 danh mục
    const variants = generateExamsFromMatrix(INITIAL_MASTER_QUESTIONS, config);

    return NextResponse.json({
      success: true,
      message: `Đã xử lý payload thành công! Khởi tạo ${variants.length} mã đề thi theo ma trận chuẩn Bộ GD&ĐT 2025.`,
      server_timestamp: new Date().toISOString(),
      standards: 'GDPT 2018 - MOET 2025',
      variants,
      summary: {
        total_variants: variants.length,
        total_questions: config.total_questions,
        category_distribution: payload.matrix_blueprint.category_distribution,
        bloom_ratio: payload.matrix_blueprint.bloom_ratio,
        scope_mode: config.scope_mode,
      },
    });
  } catch (error: any) {
    console.error('[API Matrix Generate Error]:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi máy chủ khi sinh đề theo ma trận: ' + (error?.message || 'Unknown error'),
      },
      { status: 500 }
    );
  }
}
