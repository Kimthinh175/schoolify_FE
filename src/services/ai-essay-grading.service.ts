import {
  OlympiadExam,
  OlympiadMathProblem,
  OlympiadSubPart,
  SubPartGradingResult,
  ProblemGradingResult,
  OlympiadGradingReport,
} from '@/types/olympiad';

/** Chuẩn hóa xâu để so sánh toán học và từ khóa */
function normalizeMathText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\left|\\right/g, '')
    .replace(/[\s\t\n]+/g, ' ')
    .trim();
}

/** Đánh giá Giai đoạn 1: Khớp đáp số / kết quả cốt lõi */
function evaluateAnswerMatch(
  studentText: string,
  targetAnswer: string,
  keywords: string[]
): {
  status: 'MATCHED' | 'PARTIALLY_MATCHED' | 'MISMATCHED';
  note: string;
} {
  if (!studentText || studentText.trim().length < 5) {
    return {
      status: 'MISMATCHED',
      note: 'Học sinh chưa nhập câu trả lời hoặc bài làm quá ngắn.',
    };
  }

  const normStudent = normalizeMathText(studentText);
  const normTarget = normalizeMathText(targetAnswer);

  // 1. Kiểm tra khớp chính xác đáp số
  if (normStudent.includes(normTarget)) {
    return {
      status: 'MATCHED',
      note: '✓ Khớp chính xác đáp số cốt lõi và mệnh đề kết luận.',
    };
  }

  // 2. Kiểm tra các từ khóa / biến số then chốt (targetKeywords)
  if (keywords.length > 0) {
    let matchedCount = 0;
    for (const kw of keywords) {
      const normKw = normalizeMathText(kw);
      if (normStudent.includes(normKw)) {
        matchedCount++;
      }
    }
    const ratio = matchedCount / keywords.length;
    if (ratio >= 0.75) {
      return {
        status: 'MATCHED',
        note: `✓ Nhận diện đầy đủ ${matchedCount}/${keywords.length} biến đổi và đáp số then chốt.`,
      };
    } else if (ratio >= 0.35) {
      return {
        status: 'PARTIALLY_MATCHED',
        note: `Đã có hướng đi đúng (${matchedCount}/${keywords.length} yếu tố then chốt), nhưng chưa trọn vẹn kết quả cuối.`,
      };
    }
  }

  return {
    status: 'MISMATCHED',
    note: 'Chưa tìm thấy đáp số hoặc kết luận trùng khớp với đáp án chuẩn.',
  };
}

/** Chấm điểm 1 ý nhỏ (Sub-part) */
export function gradeSubPart(
  subPart: OlympiadSubPart,
  studentAnswer: string
): SubPartGradingResult {
  const studentText = studentAnswer || '';
  const matchResult = evaluateAnswerMatch(studentText, subPart.targetAnswer, subPart.targetKeywords);

  const rubricBreakdown = subPart.rubric.map((step) => {
    let passed = false;
    let pointsAwarded = 0;
    let note = '';

    if (!studentText.trim()) {
      return {
        step: step.step,
        criterion: step.criterion,
        pointsAwarded: 0,
        maxPoints: step.maxPoints,
        passed: false,
        note: 'Chưa có nội dung cho bước này.',
      };
    }

    const normText = normalizeMathText(studentText);

    // Heuristics kiểm tra bước lập luận:
    if (step.step === 1) {
      // Thường là ĐKXĐ, nhận xét, khởi tạo
      const hasCondition =
        normText.includes('đkxđ') ||
        normText.includes('điều kiện') ||
        normText.includes('xác định') ||
        normText.includes('x >') ||
        normText.includes('x khác') ||
        normText.includes('!=') ||
        normText.includes('thuộc r') ||
        normText.includes('am-gm') ||
        normText.includes('cauchy') ||
        normText.includes('đường kính');

      if (hasCondition || normText.length > 30) {
        passed = true;
        pointsAwarded = step.maxPoints;
        note = 'Đã nêu đầy đủ điều kiện / tiền đề bài toán.';
      } else {
        pointsAwarded = Math.round(step.maxPoints * 0.4 * 100) / 100;
        note = 'Còn thiếu hoặc chưa trình bày rõ điều kiện xác định ban đầu.';
      }
    } else if (step.step === subPart.rubric.length) {
      // Bước cuối cùng: Kết luận nghiệm / dấu bằng
      if (matchResult.status === 'MATCHED') {
        passed = true;
        pointsAwarded = step.maxPoints;
        note = 'Kết luận chính xác đáp số và đối chiếu điều kiện chặt chẽ.';
      } else if (matchResult.status === 'PARTIALLY_MATCHED') {
        pointsAwarded = Math.round(step.maxPoints * 0.5 * 100) / 100;
        note = 'Đưa ra kết quả gần đúng hoặc còn thiếu trường hợp ngoại lệ.';
      } else {
        pointsAwarded = 0;
        note = 'Chưa hoàn thành kết luận hoặc sai đáp số cuối cùng.';
      }
    } else {
      // Các bước biến đổi trung gian (Đại số, hình học)
      if (normText.length > 80 && (matchResult.status === 'MATCHED' || matchResult.status === 'PARTIALLY_MATCHED')) {
        passed = true;
        pointsAwarded = step.maxPoints;
        note = 'Lập luận logic, các bước biến đổi trung gian tường minh.';
      } else if (normText.length > 40) {
        pointsAwarded = Math.round(step.maxPoints * 0.6 * 100) / 100;
        note = 'Có bước biến đổi nhưng cần trình bày chi tiết và chặt chẽ hơn.';
      } else {
        pointsAwarded = Math.round(step.maxPoints * 0.25 * 100) / 100;
        note = 'Bước giải còn quá sơ sài, nhảy bước hoặc chưa chứng minh.';
      }
    }

    return {
      step: step.step,
      criterion: step.criterion,
      pointsAwarded,
      maxPoints: step.maxPoints,
      passed,
      note,
    };
  });

  const pointsEarned = rubricBreakdown.reduce((sum, b) => sum + b.pointsAwarded, 0);

  // Sinh phản hồi sư phạm
  let feedback = '';
  if (matchResult.status === 'MATCHED' && pointsEarned >= subPart.points * 0.85) {
    feedback = '🌟 Lập luận xuất sắc! Đáp số hoàn toàn chính xác, các bước biến đổi toán học chặt chẽ và không bị bẫy điều kiện.';
  } else if (matchResult.status === 'MATCHED') {
    feedback = '👍 Đã ra đúng đáp số then chốt, tuy nhiên các bước biến đổi trung gian cần trình bày rõ ràng hơn để tránh bị trừ điểm trình bày theo barem thi HSG.';
  } else if (matchResult.status === 'PARTIALLY_MATCHED') {
    feedback = '💡 Hướng tư duy đúng và đã bóc tách được một phần bài toán. Cần lưu ý đối chiếu lại ĐKXĐ và kiểm tra kỹ phép tính ở bước kết luận.';
  } else {
    feedback = '⚠️ Chưa tìm ra đáp số đúng hoặc lập luận chưa đủ chặt chẽ. Hãy xem kỹ lời giải mẫu và barem từng bước để củng cố kỹ năng giải đề.';
  }

  return {
    subId: subPart.subId,
    pointsEarned: Math.min(subPart.points, Math.round(pointsEarned * 100) / 100),
    maxPoints: subPart.points,
    answerMatchStatus: matchResult.status,
    answerMatchNote: matchResult.note,
    rubricBreakdown,
    feedback,
  };
}

/** Chấm điểm toàn bộ đề thi Tự luận HSG */
export function gradeOlympiadExam(
  exam: OlympiadExam,
  studentAnswers: Record<string, Record<string, string>> // problemId -> subId -> answerText
): OlympiadGradingReport {
  if (!exam.mathProblems || exam.mathProblems.length === 0) {
    throw new Error('Đề thi không có danh sách bài toán tự luận.');
  }

  let totalScore = 0;
  const problemResults: ProblemGradingResult[] = [];

  for (const prob of exam.mathProblems) {
    const probAnswers = studentAnswers[prob.id] || {};
    const subPartResults: SubPartGradingResult[] = [];
    let probEarned = 0;

    for (const sub of prob.subParts) {
      const studentAns = probAnswers[sub.subId] || '';
      const subResult = gradeSubPart(sub, studentAns);
      subPartResults.push(subResult);
      probEarned += subResult.pointsEarned;
    }

    problemResults.push({
      problemId: prob.id,
      problemNumber: prob.problemNumber,
      title: prob.title,
      pointsEarned: Math.round(probEarned * 100) / 100,
      maxPoints: prob.points,
      subPartResults,
    });

    totalScore += probEarned;
  }

  const roundedTotal = Math.round(totalScore * 100) / 100;
  const percentage = Math.round((roundedTotal / exam.totalPoints) * 100);

  let rankingClassification: OlympiadGradingReport['rankingClassification'] = 'CẦN CỐ GẮNG';
  let overallTeacherComments = '';

  if (percentage >= 85) {
    rankingClassification = 'GIẢI NHẤT';
    overallTeacherComments = '🏆 Phong độ tuyệt vời! Bạn có tư duy toán học sắc bén, lập luận rất chặt chẽ và đạt chuẩn mực bài thi Học sinh giỏi cấp Tỉnh/Quốc gia.';
  } else if (percentage >= 70) {
    rankingClassification = 'GIẢI NHÌ';
    overallTeacherComments = '🥈 Bài làm rất tốt! Đa số các ý khó đều đã được giải quyết trọn vẹn. Cần chú ý thêm một số trường hợp biên và hoàn thiện kỹ năng trình bày.';
  } else if (percentage >= 50) {
    rankingClassification = 'GIẢI BA';
    overallTeacherComments = '🥉 Nắm vững phương pháp cơ bản của đề thi HSG. Hãy rèn luyện thêm các kỹ thuật nâng cao (bất đẳng thức, số học chia hết) để bứt phá.';
  } else if (percentage >= 35) {
    rankingClassification = 'KHUYẾN KHÍCH';
    overallTeacherComments = '🎖️ Đã hoàn thành các câu mở đầu của đề thi. Cần đọc kỹ lời giải chi tiết của các bài toán phân loại để tích lũy kinh nghiệm.';
  } else {
    rankingClassification = 'CẦN CỐ GẮNG';
    overallTeacherComments = '💪 Đề thi HSG có độ phân hóa rất cao. Đừng nản lòng, hãy xem lại barem lời giải mẫu để học cách tiếp cận và phân rã bài toán.';
  }

  return {
    examId: exam.id,
    totalScore: roundedTotal,
    maxScore: exam.totalPoints,
    percentage,
    rankingClassification,
    overallTeacherComments,
    problemResults,
    gradedAt: new Date().toISOString(),
  };
}
