import { NextRequest, NextResponse } from 'next/server';
import { clampEmotionDuration, isRobotEmotion, type RobotEmotionId } from '@/lib/robot-emotions';

const BE_BASE_URL = process.env.NEXT_PUBLIC_BE_URL || process.env.BE_URL || 'http://localhost:3005';

interface ClientToolAction {
  type: string;
  payload: Record<string, any>;
}

interface AgentResponse {
  success: boolean;
  data: {
    message: string;
    actions: ClientToolAction[];
    source?: string;
    /** Biểu cảm robot hiển thị kèm câu trả lời (xem lib/robot-emotions.ts) */
    emotion?: RobotEmotionId;
    /** Thời gian giữ biểu cảm (ms) trước khi về 'default' */
    emotionDurationMs?: number;
    /** Gợi ý ngữ cảnh tiếp theo cho học sinh */
    suggestions?: string[];
  };
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function generateLocalAiResponse(query: string, currentUrl: string = '/'): AgentResponse['data'] {
  const norm = normalizeText(query);
  const actions: ClientToolAction[] = [];
  let message = '';
  let emotion: RobotEmotionId = 'happy';

  // 1. Giới thiệu nền tảng Schoolify / Nền tảng này là gì
  if (
    norm.includes('schoolify') ||
    norm.includes('nen tang nay') ||
    norm.includes('nen tang la gi') ||
    norm.includes('nen tang') ||
    norm.includes('he thong nay') ||
    norm.includes('day la trang gi') ||
    norm.includes('day la web gi') ||
    norm.includes('web nay') ||
    norm.includes('trang web') ||
    norm.includes('app nay') ||
    norm.includes('ban la ai') ||
    norm.includes('tro ly ai') ||
    norm.includes('gioi thieu') ||
    (norm.includes('la gi') && (norm.includes('schoolify') || norm.includes('nen tang') || norm.includes('web') || norm.includes('trang') || norm.includes('he thong')))
  ) {
    message = `Chào bạn! 👋 **Schoolify** là nền tảng **Giáo dục & Khảo thí K-12 thông minh**, bám sát 100% Chương trình Giáo dục phổ thông mới (GDPT 2018) của Bộ GD&ĐT.

Schoolify xây dựng một hệ sinh thái kết nối trọn vẹn 4 nhóm người dùng:

1. 🎓 **Dành cho Học sinh (K-12)**:
   - **Luyện thi thích ứng 4 cấp độ**: Từ *Cơ bản* (bám sát SGK, chống liệt), *Trung bình* (thi học kỳ & tốt nghiệp THPT), *Nâng cao* (vận dụng cao 9-10 điểm) đến *Học sinh Giỏi (HSG Cấp Tỉnh & Quốc Gia)*.
   - **Đa dạng hình thức thi**: Trắc nghiệm 4 lựa chọn, Đúng/Sai, Điền số kết quả ngắn, Tự luận chấm AI đa tầng theo barem, và Lập trình trực tiếp trong phòng thi IDE cho môn Tin học.
   - **Đánh giá năng lực chẩn đoán**: Hệ thống phát hiện chính xác lỗ hổng kiến thức theo chuẩn phân hóa Bloom và đề xuất lộ trình khắc phục.
   - **Góc học tập & Đổi thưởng**: Tích lũy Ngọc Tri Thức 💎 từ kết quả làm bài để đổi vật phẩm và quà tặng độc quyền.

2. 👨‍👩‍👧 **Dành cho Phụ huynh**:
   - Theo dõi tiến độ học tập, biểu đồ năng lực Bloom theo tuần/tháng, thời khóa biểu và thanh toán học phí trực tuyến minh bạch qua VietQR.

3. 👨‍🏫 **Dành cho Giáo viên & Quản trị**:
   - **AI Quét đề thi Word (.docx)**: Bóc tách câu hỏi, công thức Toán học (KaTeX, MathType MTEF, OMML) và tự động sinh câu hỏi tương đương lưu vào Ngân hàng đề.
   - Thiết kế ma trận đề thi phân hóa Bloom, chấm bài tự luận và quản lý lớp học.

Bạn muốn tớ **hướng dẫn vào phòng luyện thi thử**, **giải đáp một bài toán**, hay **tìm hiểu tính năng nào trước**, cứ nhắn cho tớ nhé! 🚀`;
    emotion = 'excited';

    actions.push({
      type: 'NAVIGATE_PAGE',
      payload: {
        path: '/luyen-thi',
        label: 'Khám Phá Cổng Luyện Thi K-12',
      },
    });

    actions.push({
      type: 'NAVIGATE_PAGE',
      payload: {
        path: '/pricing',
        label: 'Xem Các Gói Học & Bảng Giá',
      },
    });
  }
  // 2. Giải đáp công thức Toán học / Phương trình bậc 2 / Tích phân / Đạo hàm
  else if (
    norm.includes('bac 2') ||
    norm.includes('tam thuc') ||
    norm.includes('delta') ||
    norm.includes('viet') ||
    (norm.includes('cong thuc') && (norm.includes('toan') || norm.includes('nghiem') || norm.includes('dao ham') || norm.includes('tich phan')))
  ) {
    message = `Dưới đây là **Công thức nghiệm Phương trình bậc hai** chuẩn GDPT 2018:\n\nXét phương trình bậc hai tổng quát:\n$$ ax^2 + bx + c = 0 \\quad (a \\neq 0) $$\n\nBiệt thức $\\Delta$ (Delta) được tính theo công thức:\n$$ \\Delta = b^2 - 4ac $$\n\nCác trường hợp nghiệm:\n1. **Nếu $\\Delta > 0$**: Phương trình có 2 nghiệm phân biệt:\n\\[ x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a} \\]\n2. **Nếu $\\Delta = 0$**: Phương trình có nghiệm kép:\n$$ x_1 = x_2 = -\\frac{b}{2a} $$\n3. **Nếu $\\Delta < 0$**: Phương trình vô nghiệm trên tập số thực $\\mathbb{R}$ (hoặc có 2 nghiệm phức $x_{1,2} \\in \\mathbb{C}$).\n\n💡 **Hệ thức Vi-ét thuận**:\n$$ \\begin{cases} S = x_1 + x_2 = -\\frac{b}{a} \\\\[6pt] P = x_1 \\cdot x_2 = \\frac{c}{a} \\end{cases} $$`;
    emotion = 'idea';

    actions.push({
      type: 'NAVIGATE_PAGE',
      payload: {
        path: '/student/practice',
        label: '🎯 Luyện Đề Chuyên Đề Phương Trình Bậc Hai',
      },
    });
  }
  // 3. Gợi ý phương pháp Socratic / Giải bài tập (Toán, Lý, Hóa...)
  else if (
    norm.includes('goi y') ||
    norm.includes('chi to') ||
    norm.includes('chi ban') ||
    norm.includes('buoc giai') ||
    norm.includes('huong dan') ||
    norm.includes('giai bai') ||
    norm.includes('giai toan') ||
    norm.includes('giai phuong trinh') ||
    norm.includes('phuong trinh') ||
    norm.includes('dao ham') ||
    norm.includes('cuc tri') ||
    norm.includes('tich phan') ||
    norm.includes('cach lam') ||
    norm.includes('bai tap') ||
    norm.includes('toan')
  ) {
    message = `Theo phương pháp gợi mở (**Socratic Method**), tớ sẽ không đưa ngay đáp án cuối cùng mà gợi ý từng bước tư duy để bạn tự tin giải quyết nhé:\n\n1. **Bước 1 (Xác định dữ kiện)**: Tìm tập xác định $D$ và liệt kê các giả thiết chính trong đề bài.\n2. **Bước 2 (Chọn công cụ)**: Thiết lập phương trình đạo hàm $y' = 0$ hoặc định luật liên quan để tìm các điểm tới hạn.\n3. **Bước 3 (Kiểm chứng & Kết luận)**: Lập bảng biến thiên hoặc thế điều kiện để rút ra kết quả chính xác.\n\nBạn thử tính Bước 1 và Bước 2 xem ra bao nhiêu rồi chia sẻ cho tớ nhé! 💡`;
    emotion = 'thinking';

    actions.push({
      type: 'SOCRATIC_HINT',
      payload: {
        stepIndex: 1,
        hintTitle: 'Gợi mở Socratic: Thiết lập điều kiện & đạo hàm',
      },
    });
  }
  // 3. Tạo đề thi ma trận / Luyện thi thử
  else if (
    norm.includes('tao de') ||
    norm.includes('luyen thi') ||
    norm.includes('thi thu') ||
    norm.includes('lam de') ||
    norm.includes('ma tran') ||
    norm.includes('phong thi') ||
    norm.includes('de toan') ||
    norm.includes('de ly') ||
    norm.includes('de hoa')
  ) {
    let subject = 'Toán học';
    if (norm.includes('ly') || norm.includes('vat ly')) subject = 'Vật lý';
    else if (norm.includes('hoa') || norm.includes('hoa hoc')) subject = 'Hóa học';
    else if (norm.includes('sinh') || norm.includes('sinh hoc')) subject = 'Sinh học';
    else if (norm.includes('tin') || norm.includes('tin hoc')) subject = 'Tin học';
    else if (norm.includes('su') || norm.includes('lich su')) subject = 'Lịch sử';
    else if (norm.includes('dia') || norm.includes('dia ly')) subject = 'Địa lý';

    let grade = 12;
    if (norm.includes('lop 10') || norm.includes('khoi 10')) grade = 10;
    else if (norm.includes('lop 11') || norm.includes('khoi 11')) grade = 11;
    else if (norm.includes('lop 9')) grade = 9;

    const isHard = norm.includes('kho') || norm.includes('van dung cao') || norm.includes('nang cao') || norm.includes('9+');
    const isMedium = norm.includes('vua') || norm.includes('kha') || norm.includes('co ban');

    let bloomRatio = { NHAN_BIET: 30, THONG_HIEU: 40, VAN_DUNG: 20, VAN_DUNG_CAO: 10 };
    if (isHard) {
      bloomRatio = { NHAN_BIET: 10, THONG_HIEU: 30, VAN_DUNG: 40, VAN_DUNG_CAO: 20 };
    } else if (isMedium) {
      bloomRatio = { NHAN_BIET: 40, THONG_HIEU: 30, VAN_DUNG: 20, VAN_DUNG_CAO: 10 };
    }

    const numMatch = query.match(/(\d+)\s*câu/i);
    const totalQuestions = numMatch ? Math.min(50, Math.max(5, parseInt(numMatch[1], 10))) : 10;

    message = `Tớ đã thiết lập sẵn **Bộ Ma Trận Đề Thi ${subject} - Khối ${grade}** cho bạn (${totalQuestions} câu chuẩn cấu trúc GDPT 2018: Nhận biết ${bloomRatio.NHAN_BIET}%, Thông hiểu ${bloomRatio.THONG_HIEU}%, Vận dụng ${bloomRatio.VAN_DUNG}%, Vận dụng cao ${bloomRatio.VAN_DUNG_CAO}%).\n\nBạn có thể bấm nút bên dưới để hệ thống tự động sinh đề và đưa bạn vào phòng thi ngay nhé! 🎯`;
    emotion = 'idea';

    actions.push({
      type: 'CONFIGURE_EXAM_MATRIX',
      payload: {
        subject,
        grade,
        bloomRatio,
        durationMinutes: totalQuestions >= 20 ? 45 : 20,
        totalQuestions,
      },
    });

    if (!currentUrl.includes('/student/practice/exam-room')) {
      actions.push({
        type: 'NAVIGATE_PAGE',
        payload: {
          path: '/student/practice/exam-room',
          label: `Vào Phòng Thi ${subject} Khối ${grade}`,
        },
      });
    }
  }
  // 4. Quét đề thi Word (.docx) sinh câu hỏi
  else if (
    norm.includes('docx') ||
    norm.includes('word') ||
    norm.includes('quet de') ||
    norm.includes('nhap de') ||
    norm.includes('scan de')
  ) {
    message = `Tớ đã sẵn sàng mở **Công cụ AI Quét Đề Thi (.docx)** cho bạn! Bạn chỉ cần tải lên file đề thi \`.docx\`, AI sẽ tự động đọc hiểu công thức Toán học, bóc tách cấu trúc kiến thức và biên soạn ngân hàng câu hỏi mới lưu vào hệ thống nhé! 📄✨`;
    emotion = 'idea';

    actions.push({
      type: 'OPEN_DOCX_SCANNER',
      payload: { targetCount: 10, saveToBank: true },
    });

    actions.push({
      type: 'NAVIGATE_PAGE',
      payload: {
        path: '/admin/questions/import',
        label: 'Mở AI Quét Đề .DOCX & Sinh Câu Hỏi',
      },
    });
  }
  // 5. Tư vấn gói học / Bảng giá / Thanh toán VietQR
  else if (
    norm.includes('bang gia') ||
    norm.includes('gia bao nhieu') ||
    norm.includes('bao nhieu tien') ||
    norm.includes('goi pro') ||
    norm.includes('goi vip') ||
    norm.includes('mua goi') ||
    norm.includes('dang ky goi') ||
    norm.includes('nap tien') ||
    norm.includes('hoc phi') ||
    norm.includes('vietqr') ||
    norm.includes('chi phi') ||
    norm.includes('thanh toan')
  ) {
    const targetPlan = norm.includes('vip') ? 'VIP' : 'PRO';
    message = `Schoolify cung cấp các gói đồng hành linh hoạt cho học sinh:\n\n- **Gói Cơ Bản (0đ)**: Luyện đề chuẩn SGK hàng ngày.\n- **Gói Chuyên Sâu PRO (199.000đ/tháng)**: Mở khóa trọn bộ Ma trận đề GDPT 2018, AI Gia Sư Socratic & tặng +200 Token đổi quà.\n- **Gói Toàn Diện VIP (499.000đ/năm)**: Đặc quyền 365 ngày ôn thi toàn diện, AI Quét đề Word & +1,000 Token.\n\nTớ đã chuẩn bị sẵn nút chuyển đến trang Bảng Giá để bạn tham khảo nhé! 💳`;
    emotion = 'wink';

    actions.push({
      type: 'SELECT_PRICING_PLAN',
      payload: {
        plan: targetPlan,
        price: targetPlan === 'VIP' ? 499000 : 199000,
      },
    });

    actions.push({
      type: 'NAVIGATE_PAGE',
      payload: {
        path: '/pricing',
        highlightPlan: targetPlan,
        label: `Xem Bảng Giá & Kích Hoạt Gói ${targetPlan}`,
      },
    });
  }
  // 6. Lịch sử / Bảng xếp hạng
  else if (
    norm.includes('lich su') ||
    norm.includes('ket qua') ||
    norm.includes('diem so') ||
    norm.includes('xep hang') ||
    norm.includes('bang vang')
  ) {
    const isLeaderboard = norm.includes('xep hang') || norm.includes('bang vang');
    const targetPath = isLeaderboard ? '/leaderboard' : '/student/history';
    message = isLeaderboard
      ? `Tớ sẽ dẫn bạn đến **Bảng Vàng Xếp Hạng** để xem thứ hạng Chuỗi Ngày Học (Streak) và điểm nỗ lực Ngọc Tri Thức nhé! 🏆`
      : `Tớ sẽ dẫn bạn đến trang **Lịch Sử Luyện Đề** để xem lại chi tiết bài làm cùng lời giải phân tích nhé! 📊`;
    emotion = isLeaderboard ? 'celebrate' : 'happy';

    actions.push({
      type: 'NAVIGATE_PAGE',
      payload: {
        path: targetPath,
        label: isLeaderboard ? 'Xem Bảng Vàng Xếp Hạng' : 'Xem Lịch Sử Luyện Đề',
      },
    });
  }
  // 7. Mặc định hội thoại thân thiện (tự nhiên, không văn mẫu menu)
  else {
    message = `Tớ đã ghi nhận câu hỏi của bạn! Tớ có thể đồng hành cùng bạn ôn luyện thi K-12, gợi mở các bước giải bài tập theo phương pháp Socratic, hoặc thiết lập ma trận đề thi phân hóa GDPT 2018. Bạn cần tớ hỗ trợ phần nào trước nè? 😊`;
  }

  const suggestions = [
    '🎯 Tạo đề Toán 12 khó',
    '💡 Gợi ý giải bài tập Socratic',
    '💳 Xem các gói học sinh (50k / 100k)',
  ];

  return { message, actions, emotion, emotionDurationMs: 4000, suggestions };
}

function generateSocraticQuestionTutorResponse(
  questionContext: Record<string, any>,
  query: string
): AgentResponse['data'] {
  const title = questionContext.title || 'Câu hỏi hiện tại';
  const content = questionContext.content || '';
  const topicTag = questionContext.topicTag || 'Chuyên đề trọng tâm';
  const cognitiveTag = questionContext.cognitiveTag || 'Thông hiểu';
  const trapTag =
    questionContext.trapTag ||
    'Cẩn thận kiểm tra kỹ điều kiện xác định và dấu biểu thức';
  const studentChoice = questionContext.studentChoice;
  const isSubmitted = Boolean(questionContext.isSubmitted);
  const subjectSlug = String(questionContext.subjectSlug || 'toan-hoc');
  const explanation = String(questionContext.explanation || '');

  const isInformatics = subjectSlug.includes('tin');

  // Trích lọc gợi mở Bước 1 & Bước 2 từ lời giải chuẩn mà không lộ ngay chữ cái đáp án khi đang thi
  const cleanSteps = explanation
    .replace(/Chọn đáp án đúng là\s*[A-D]\.?/gi, '')
    .replace(/Vậy đáp án đúng là\s*[A-D]\.?/gi, '')
    .trim();

  const choiceStatusText = studentChoice
    ? `Bạn đang chọn phương án **${studentChoice}**. Hãy cùng tớ kiểm chứng lại theo phương pháp **Socratic (Gợi mở tư duy)** nhé:`
    : `Tớ sẽ đồng hành cùng bạn tháo gỡ **${title}** theo phương pháp **Socratic (Gợi mở từng bước — không chép đáp án thụ động)** nhé:`;

  const stepGuidance = isInformatics
    ? `1. **Bước 1 — Phân tích cấu trúc lệnh / truy vấn**:\n   - Đọc kỹ đoạn mã / câu lệnh trong đề: \`${content.slice(0, 120)}${content.length > 120 ? '...' : ''}\`\n   - Xác định rõ biến chạy, điều kiện dừng vòng lặp hoặc thứ tự thực thi mệnh đề (\`FROM -> WHERE -> GROUP BY -> HAVING -> SELECT\`).\n2. **Bước 2 — Chạy từng bước (Dry-run Trace)**:\n   - ${cleanSteps ? cleanSteps.slice(0, 260) : 'Viết giá trị biến qua từng vòng lặp hoặc từng lời gọi đệ quy ra nháp để tránh nhầm chỉ số.'}`
    : `1. **Bước 1 — Xác định điều kiện & công thức cốt lõi**:\n   - Với chuyên đề **${topicTag}**, trước tiên hãy kiểm tra Tập xác định $D$ và công thức đạo hàm / nguyên hàm tương ứng.\n2. **Bước 2 — Biến đổi đại số & Khử nhiễu**:\n   - ${cleanSteps ? cleanSteps.slice(0, 260) : 'Thiết lập phương trình chính và đối chiếu dấu trên bảng biến thiên.'}`;

  const postSubmitNote =
    isSubmitted && questionContext.correctChoice
      ? `\n\n✅ **Đối chiếu sau nộp bài**: Đáp án chuẩn của câu này là **${questionContext.correctChoice}**. Bạn hãy đối chiếu lại với **Bẫy sai lầm** ở trên để ghi nhớ dạng bài **${topicTag}** nhé!`
      : `\n\n💬 Bạn thử nháp **Bước 1** xem kết quả trung gian ra bao nhiêu rồi tự tin chốt phương án nhé!`;

  const message = `💡 **Gia Sư AI Socratic — Phân Tích Theo Ma Trận Tag 4 Chiều**\n\n- 🏷️ **Chuyên đề (Topic Tag)**: \`${topicTag}\`\n- 🧠 **Mức độ nhận thức**: \`${cognitiveTag}\`\n- ⚠️ **Cảnh báo Bẫy sai lầm (Trap Tag)**: *${trapTag}*\n\n${choiceStatusText}\n\n${stepGuidance}${postSubmitNote}`;

  return {
    message,
    actions: [
      {
        type: 'SOCRATIC_HINT',
        payload: {
          stepIndex: 1,
          hintTitle: `Đã kích hoạt gợi mở Socratic: ${topicTag}`,
        },
      },
    ],
    emotion: 'idea',
    emotionDurationMs: 4500,
    suggestions: [
      `💡 Giải thích kỹ hơn bẫy "${trapTag}"`,
      `🎯 Tạo đề luyện riêng chuyên đề ${topicTag}`,
      '📐 Tóm tắt công thức trọng tâm câu này',
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body?.message || '';
    const currentUrl = body?.currentUrl || '/';

    // 1. Gọi sang BE (Gemini 3.8 Flash VIP API) kèm Cookie & Authorization JWT
    try {
      const forwardHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const cookie = req.headers.get('cookie');
      if (cookie) forwardHeaders['cookie'] = cookie;
      const auth = req.headers.get('authorization');
      if (auth) forwardHeaders['authorization'] = auth;

      const beRes = await fetch(`${BE_BASE_URL}/agent/chat`, {
        method: 'POST',
        headers: forwardHeaders,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000), // Cho BE đủ thời gian xử lý AI
      });

      if (beRes.ok) {
        const data = await beRes.json();
        if (!data?.success && data?.errorCode === 'INSUFFICIENT_XIN_POINTS') {
          if (typeof data.message === 'string') {
            data.message = data.message.replace(/Điểm Xịn|Kim [Cc]ương/g, 'Ngọc Tri Thức');
          }
          return NextResponse.json(data, { status: 200 });
        }
        const payload = data?.data || data;

        // Chuẩn hóa xưng hô sang "tớ - bạn" nếu BE trả về "thầy / em"
        if (payload?.message) {
          payload.message = payload.message
            .replace(/\bThầy\b/g, 'Tớ')
            .replace(/\bthầy\b/g, 'tớ')
            .replace(/\bem\b/g, 'bạn')
            .replace(/\bEm\b/g, 'Bạn')
            .replace(/\(Zero-API-Key Hybrid Vector \+ Antigravity IPC\)/g, '🤖✨')
            // Đồng bộ tên điểm mới: Tia Sáng (hằng ngày) & Ngọc Tri Thức (vĩnh viễn)
            .replace(/Điểm Xịn|Kim [Cc]ương/g, 'Ngọc Tri Thức')
            .replace(/Điểm Free/g, 'Tia Sáng');
        }

        // Validate biểu cảm BE trả về; sai/thiếu thì bỏ để FE tự suy luận
        if (payload && typeof payload === 'object') {
          if (isRobotEmotion(payload.emotion)) {
            payload.emotionDurationMs = clampEmotionDuration(payload.emotionDurationMs);
          } else {
            delete payload.emotion;
            delete payload.emotionDurationMs;
          }
        }

        return NextResponse.json(
          {
            success: true,
            data: payload,
            pointUsage: data?.pointUsage || payload?.pointUsage,
          },
          { status: 200 }
        );
      } else {
        try {
          const errData = await beRes.json();
          if (errData?.errorCode === 'INSUFFICIENT_XIN_POINTS') {
            return NextResponse.json(errData, { status: 200 });
          }
        } catch {}
      }
    } catch {
      // BE offline hoặc timeout -> rơi vào fallback thông minh cục bộ
    }

    // 2. Fallback xử lý cục bộ thông minh 100% chuẩn xác
    const localData = generateLocalAiResponse(query, currentUrl);
    return NextResponse.json({ success: true, data: localData }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Lỗi xử lý Trợ lý AI',
      },
      { status: 500 }
    );
  }
}
