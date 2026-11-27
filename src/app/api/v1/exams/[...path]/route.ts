import { NextRequest, NextResponse } from 'next/server';
import { listRecords, getRecord } from '@/lib/server/json-db';

const BE_BASE_URL = process.env.NEXT_PUBLIC_BE_URL || process.env.BE_URL || 'http://localhost:3005';

function buildHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const cookie = req.headers.get('cookie');
  if (cookie) headers['cookie'] = cookie;
  const auth = req.headers.get('authorization');
  if (auth) headers['authorization'] = auth;
  const userId = req.headers.get('x-user-id');
  if (userId) headers['x-user-id'] = userId;
  const userRole = req.headers.get('x-user-role');
  if (userRole) headers['x-user-role'] = userRole;
  return headers;
}

function buildLocalModule09Snapshot(subjectInput: string, gradeInput: number) {
  const subject = subjectInput === 'tin-hoc' ? 'tin-hoc' : 'toan-hoc';
  const grade = gradeInput >= 1 && gradeInput <= 12 ? gradeInput : 12;
  const isTin = subject === 'tin-hoc';
  const nowIso = new Date().toISOString();

  const topics = isTin
    ? [
        {
          id: `tm-${subject}-${grade}-1`,
          subject,
          grade,
          chapterId: 1,
          chapterName: 'Chương 1: Hàm & Đệ quy Python',
          topicTag: 'Đệ quy & Quay lui cơ bản',
          totalAttempted: 16,
          totalCorrect: 6,
          totalWrong: 10,
          accuracyPercent: 38,
          masteryScore: 36,
          masteryStatus: 'WEAK' as const,
          bloomBreakdown: {
            NHAN_BIET: { attempted: 5, correct: 4 },
            THONG_HIEU: { attempted: 5, correct: 2 },
            VAN_DUNG: { attempted: 4, correct: 0 },
            VAN_DUNG_CAO: { attempted: 2, correct: 0 },
          },
          remediationAttempted: 3,
          remediationCorrect: 2,
          quickDrillSessions: 2,
          quickDrillTurnsCompleted: 6,
          quickDrillTurnsSkipped: 0,
          quickDrillTurnsCorrect: 4,
          latestLearningSpiritTag: 'PERSISTENT',
          latestIntelligenceTag: 'ANALYTICAL',
          avgSecondsPerQuestion: 48,
          topTraps: [{ trapTag: 'Thiếu điều kiện dừng (Base Case) gây RecursionError', count: 5 }],
          lastPracticedAt: nowIso,
        },
        {
          id: `tm-${subject}-${grade}-2`,
          subject,
          grade,
          chapterId: 2,
          chapterName: 'Chương 2: Cấu trúc dữ liệu Mảng & Chuỗi',
          topicTag: 'Xử lý chuỗi & Slicing Python',
          totalAttempted: 20,
          totalCorrect: 13,
          totalWrong: 7,
          accuracyPercent: 65,
          masteryScore: 64,
          masteryStatus: 'REVIEW' as const,
          bloomBreakdown: {
            NHAN_BIET: { attempted: 6, correct: 6 },
            THONG_HIEU: { attempted: 6, correct: 4 },
            VAN_DUNG: { attempted: 5, correct: 3 },
            VAN_DUNG_CAO: { attempted: 3, correct: 0 },
          },
          remediationAttempted: 2,
          remediationCorrect: 2,
          avgSecondsPerQuestion: 34,
          topTraps: [{ trapTag: 'Nhầm chỉ số biên (Off-by-one) khi cắt chuỗi s[l:r]', count: 3 }],
          lastPracticedAt: nowIso,
        },
        {
          id: `tm-${subject}-${grade}-3`,
          subject,
          grade,
          chapterId: 3,
          chapterName: 'Chương 3: Cơ sở dữ liệu & SQL',
          topicTag: 'Truy vấn SELECT & JOIN nhiều bảng',
          totalAttempted: 18,
          totalCorrect: 16,
          totalWrong: 2,
          accuracyPercent: 89,
          masteryScore: 88,
          masteryStatus: 'MASTERED' as const,
          bloomBreakdown: {
            NHAN_BIET: { attempted: 6, correct: 6 },
            THONG_HIEU: { attempted: 6, correct: 6 },
            VAN_DUNG: { attempted: 4, correct: 3 },
            VAN_DUNG_CAO: { attempted: 2, correct: 1 },
          },
          remediationAttempted: 0,
          remediationCorrect: 0,
          avgSecondsPerQuestion: 24,
          topTraps: [],
          lastPracticedAt: nowIso,
        },
        {
          id: `tm-${subject}-${grade}-4`,
          subject,
          grade,
          chapterId: 4,
          chapterName: 'Chương 4: Đồ thị & Tìm kiếm nâng cao',
          topicTag: 'BFS / DFS trên đồ thị vô hướng',
          totalAttempted: 0,
          totalCorrect: 0,
          totalWrong: 0,
          accuracyPercent: 0,
          masteryScore: 0,
          masteryStatus: 'UNTESTED' as const,
          bloomBreakdown: {
            NHAN_BIET: { attempted: 0, correct: 0 },
            THONG_HIEU: { attempted: 0, correct: 0 },
            VAN_DUNG: { attempted: 0, correct: 0 },
            VAN_DUNG_CAO: { attempted: 0, correct: 0 },
          },
          remediationAttempted: 0,
          remediationCorrect: 0,
          avgSecondsPerQuestion: 0,
          topTraps: [],
          lastPracticedAt: null,
        },
      ]
    : [
        {
          id: `tm-${subject}-${grade}-1`,
          subject,
          grade,
          chapterId: 1,
          chapterName: `Chương 1: Ứng dụng Đạo hàm (Lớp ${grade})`,
          topicTag: 'Cực trị hàm chứa dấu giá trị tuyệt đối',
          totalAttempted: 18,
          totalCorrect: 7,
          totalWrong: 11,
          accuracyPercent: 39,
          masteryScore: 38,
          masteryStatus: 'WEAK' as const,
          bloomBreakdown: {
            NHAN_BIET: { attempted: 5, correct: 4 },
            THONG_HIEU: { attempted: 5, correct: 2 },
            VAN_DUNG: { attempted: 5, correct: 1 },
            VAN_DUNG_CAO: { attempted: 3, correct: 0 },
          },
          remediationAttempted: 4,
          remediationCorrect: 3,
          quickDrillSessions: 2,
          quickDrillTurnsCompleted: 6,
          quickDrillTurnsSkipped: 0,
          quickDrillTurnsCorrect: 4,
          latestLearningSpiritTag: 'PERSISTENT',
          latestIntelligenceTag: 'ANALYTICAL',
          avgSecondsPerQuestion: 52,
          topTraps: [{ trapTag: 'Quên xét điểm không có đạo hàm tại x = 0', count: 5 }],
          lastPracticedAt: nowIso,
        },
        {
          id: `tm-${subject}-${grade}-2`,
          subject,
          grade,
          chapterId: 2,
          chapterName: `Chương 2: Tọa độ Vectơ trong không gian (Lớp ${grade})`,
          topicTag: 'Góc & Khoảng cách trong Oxyz',
          totalAttempted: 22,
          totalCorrect: 14,
          totalWrong: 8,
          accuracyPercent: 64,
          masteryScore: 63,
          masteryStatus: 'REVIEW' as const,
          bloomBreakdown: {
            NHAN_BIET: { attempted: 6, correct: 6 },
            THONG_HIEU: { attempted: 6, correct: 4 },
            VAN_DUNG: { attempted: 6, correct: 3 },
            VAN_DUNG_CAO: { attempted: 4, correct: 1 },
          },
          remediationAttempted: 2,
          remediationCorrect: 2,
          avgSecondsPerQuestion: 41,
          topTraps: [{ trapTag: 'Nhầm công thức sin/cos góc giữa đường thẳng và mặt phẳng', count: 4 }],
          lastPracticedAt: nowIso,
        },
        {
          id: `tm-${subject}-${grade}-3`,
          subject,
          grade,
          chapterId: 3,
          chapterName: `Chương 3: Nguyên hàm & Tích phân (Lớp ${grade})`,
          topicTag: 'Đổi biến số & Tích phân từng phần',
          totalAttempted: 20,
          totalCorrect: 17,
          totalWrong: 3,
          accuracyPercent: 85,
          masteryScore: 86,
          masteryStatus: 'MASTERED' as const,
          bloomBreakdown: {
            NHAN_BIET: { attempted: 6, correct: 6 },
            THONG_HIEU: { attempted: 6, correct: 6 },
            VAN_DUNG: { attempted: 5, correct: 4 },
            VAN_DUNG_CAO: { attempted: 3, correct: 1 },
          },
          remediationAttempted: 0,
          remediationCorrect: 0,
          avgSecondsPerQuestion: 29,
          topTraps: [],
          lastPracticedAt: nowIso,
        },
        {
          id: `tm-${subject}-${grade}-4`,
          subject,
          grade,
          chapterId: 4,
          chapterName: `Chương 4: Xác suất có điều kiện (Lớp ${grade})`,
          topicTag: 'Công thức Bayes & Xác suất toàn phần',
          totalAttempted: 0,
          totalCorrect: 0,
          totalWrong: 0,
          accuracyPercent: 0,
          masteryScore: 0,
          masteryStatus: 'UNTESTED' as const,
          bloomBreakdown: {
            NHAN_BIET: { attempted: 0, correct: 0 },
            THONG_HIEU: { attempted: 0, correct: 0 },
            VAN_DUNG: { attempted: 0, correct: 0 },
            VAN_DUNG_CAO: { attempted: 0, correct: 0 },
          },
          remediationAttempted: 0,
          remediationCorrect: 0,
          avgSecondsPerQuestion: 0,
          topTraps: [],
          lastPracticedAt: null,
        },
      ];

  const groupedTopics = {
    weak: topics.filter((t) => t.masteryStatus === 'WEAK'),
    review: topics.filter((t) => t.masteryStatus === 'REVIEW'),
    mastered: topics.filter((t) => t.masteryStatus === 'MASTERED'),
    untested: topics.filter((t) => t.masteryStatus === 'UNTESTED'),
  };

  const summary = {
    totalExamsSubmitted: 6,
    totalQuestionsAttempted: topics.reduce((s, t) => s + t.totalAttempted, 0),
    totalCorrect: topics.reduce((s, t) => s + t.totalCorrect, 0),
    totalWrong: topics.reduce((s, t) => s + t.totalWrong, 0),
    overallAccuracyPercent: 63,
    overallMasteryScore: 62,
    avgSecondsPerQuestion: 36,
    remediationAttempted: 6,
    remediationCorrect: 5,
    countsByStatus: {
      weak: groupedTopics.weak.length,
      review: groupedTopics.review.length,
      mastered: groupedTopics.mastered.length,
      untested: groupedTopics.untested.length,
      totalCurriculumTopics: topics.length,
    },
  };

  const bloomStats = {
    NHAN_BIET: { label: 'Nhận biết', attempted: 17, correct: 16, accuracy: 94 },
    THONG_HIEU: { label: 'Thông hiểu', attempted: 17, correct: 12, accuracy: 71 },
    VAN_DUNG: { label: 'Vận dụng', attempted: 15, correct: 8, accuracy: 53 },
    VAN_DUNG_CAO: { label: 'Vận dụng cao', attempted: 9, correct: 2, accuracy: 22 },
  };

  const frequentTraps = topics
    .flatMap((t) =>
      t.topTraps.map((trap) => ({
        trapTag: trap.trapTag,
        count: trap.count,
        topicTag: t.topicTag,
      }))
    )
    .sort((a, b) => b.count - a.count);

  const behaviorSummary = {
    totalSessions: 2,
    avgLearningSpiritScore: 86,
    avgIntelligenceScore: 78,
    latestLearningSpiritLabel: 'Kiên trì bám đuổi mục tiêu',
    latestIntelligenceLabel: 'Tư duy phân tích logic tốt',
    specialTag: '#LUYEN_LAI_3_LAN_CUNG_DANG',
  };

  const steps = [
    {
      id: `step-${subject}-${grade}-1`,
      phase: 1,
      phaseLabel: 'Chặng 1: Vá Lỗ Hổng Nền Tảng',
      stepOrder: 1,
      subject,
      grade,
      chapterId: topics[0].chapterId,
      chapterName: topics[0].chapterName,
      topicTag: topics[0].topicTag,
      title: `Vá lỗ hổng: ${topics[0].topicTag}`,
      diagnosticReason: `Độ thành thạo hiện tại chỉ đạt ${topics[0].masteryScore}% và bạn hay mắc bẫy "${topics[0].topTraps[0]?.trapTag}". Cần luyện lại ngay ở mức Cơ bản -> Trung bình.`,
      recommendedLevel: 'BASIC' as const,
      recommendedBloom: 'THONG_HIEU' as const,
      questionCount: 10,
      durationMinutes: 15,
      currentMastery: topics[0].masteryScore,
      targetMastery: 75,
      attemptedCount: topics[0].totalAttempted,
      correctCount: topics[0].totalCorrect,
      topTrapTag: topics[0].topTraps[0]?.trapTag || null,
      specialBehaviorTag: '#LUYEN_LAI_3_LAN_CUNG_DANG',
      learningSpiritTag: 'PERSISTENT',
      learningSpiritLabel: 'Kiên trì bám đuổi',
      learningSpiritScore: 86,
      intelligenceTag: 'ANALYTICAL',
      intelligenceLabel: 'Phân tích chắc chắn',
      intelligenceScore: 78,
      behaviorAdaptationNote:
        'AI phát hiện bạn đã kiên trì làm lại 3 câu cùng dạng sau khi sai. Hệ thống ưu tiên giữ độ khó vừa sức kèm gợi ý tránh bẫy.',
      status: 'RECOMMENDED' as const,
      practiceUrl: `/student/practice/exam-room?subject=${subject}&level=basic&grade=${grade}&chapter=${topics[0].chapterId}&format=quiz&duration=15&quizCount=10&count=10&practiceMode=TOPIC`,
    },
    {
      id: `step-${subject}-${grade}-2`,
      phase: 2,
      phaseLabel: 'Chặng 2: Củng Cố & Tăng Tốc',
      stepOrder: 2,
      subject,
      grade,
      chapterId: topics[1].chapterId,
      chapterName: topics[1].chapterName,
      topicTag: topics[1].topicTag,
      title: `Củng cố: ${topics[1].topicTag}`,
      diagnosticReason: `Bạn đã đạt ${topics[1].masteryScore}%, chỉ cần giảm lỗi nhầm công thức ở mức Vận dụng để chạm mốc Thành thạo (≥80%).`,
      recommendedLevel: 'MEDIUM' as const,
      recommendedBloom: 'VAN_DUNG' as const,
      questionCount: 15,
      durationMinutes: 20,
      currentMastery: topics[1].masteryScore,
      targetMastery: 85,
      attemptedCount: topics[1].totalAttempted,
      correctCount: topics[1].totalCorrect,
      topTrapTag: topics[1].topTraps[0]?.trapTag || null,
      learningSpiritLabel: 'Ổn định',
      learningSpiritScore: 82,
      intelligenceLabel: 'Tư duy nhanh',
      intelligenceScore: 80,
      behaviorAdaptationNote:
        'Tốc độ trung bình 41s/câu đạt chuẩn; hệ thống tăng tỷ trọng câu hỏi Vận dụng.',
      status: 'IN_PROGRESS' as const,
      practiceUrl: `/student/practice/exam-room?subject=${subject}&level=medium&grade=${grade}&chapter=${topics[1].chapterId}&format=quiz&duration=20&quizCount=15&count=15&practiceMode=TOPIC`,
    },
    {
      id: `step-${subject}-${grade}-3`,
      phase: 3,
      phaseLabel: 'Chặng 3: Chinh Phục Vận Dụng Cao (9+)',
      stepOrder: 3,
      subject,
      grade,
      chapterId: topics[2].chapterId,
      chapterName: topics[2].chapterName,
      topicTag: topics[2].topicTag,
      title: `Chinh phục 9+: ${topics[2].topicTag}`,
      diagnosticReason: `Chuyên đề đã vững (${topics[2].masteryScore}%). Sẵn sàng mở khóa bài luyện Vận dụng cao.`,
      recommendedLevel: 'ADVANCED' as const,
      recommendedBloom: 'VAN_DUNG_CAO' as const,
      questionCount: 10,
      durationMinutes: 25,
      currentMastery: topics[2].masteryScore,
      targetMastery: 95,
      attemptedCount: topics[2].totalAttempted,
      correctCount: topics[2].totalCorrect,
      status: 'COMPLETED' as const,
      practiceUrl: `/student/practice/exam-room?subject=${subject}&level=advanced&grade=${grade}&chapter=${topics[2].chapterId}&format=quiz&duration=25&quizCount=10&count=10&practiceMode=TOPIC`,
    },
  ];

  const phases = [
    {
      phase: 1,
      title: 'Chặng 1: Vá Lỗ Hổng Nền Tảng (WEAK)',
      subtitle: 'Ưu tiên xử lý các chuyên đề dưới 50% thành thạo và các bẫy sai lầm lặp lại.',
      badge: 'Ưu tiên cao',
      steps: steps.filter((s) => s.phase === 1),
    },
    {
      phase: 2,
      title: 'Chặng 2: Củng Cố Kỹ Năng Vận Dụng (REVIEW)',
      subtitle: 'Đẩy các chuyên đề 50%–79% vượt ngưỡng an toàn 80%.',
      badge: 'Củng cố',
      steps: steps.filter((s) => s.phase === 2),
    },
    {
      phase: 3,
      title: 'Chặng 3: Chinh Phục Điểm 9–10 (MASTERED)',
      subtitle: 'Luyện câu hỏi phân hóa cao cho các chuyên đề đã vững.',
      badge: 'Bứt phá 9+',
      steps: steps.filter((s) => s.phase === 3),
    },
  ];

  const diagnosticStatus = {
    subject,
    grade,
    isAuthenticated: true,
    isPrivileged: false,
    diagnosticCompleted: true,
    diagnosticRequired: false,
    diagnosticResult: {
      assignedLevel: 'MEDIUM',
      overallScore: 7.4,
      trackScores: isTin
        ? { 'Lập trình Python': 7.8, 'Thuật toán & CSDL': 7.0 }
        : { 'Đại số & Giải tích': 7.6, 'Hình học Không gian': 7.1 },
      bloomBreakdown: {
        NHAN_BIET: { correct: 5, total: 5 },
        THONG_HIEU: { correct: 4, total: 5 },
        VAN_DUNG: { correct: 3, total: 5 },
        VAN_DUNG_CAO: { correct: 1, total: 3 },
      },
      completedAt: nowIso,
    },
  };

  const chapterRoadmap = {
    subject,
    hasDualMathTracks: !isTin,
    grade: grade as 10 | 11 | 12,
    savedStudentGrade: grade as 10 | 11 | 12,
    needsGradeOnboarding: false,
    isAuthenticated: true,
    diagnosticStatus,
    semesterInfo: {
      semester: 1 as const,
      isSummerReview: false,
      label: `Học kỳ 1 • Khối ${grade}`,
      shortLabel: 'HK1',
      schoolYear: '2026-2027',
      description: 'Lộ trình chuẩn theo chương trình GDPT 2018.',
    },
    summary: {
      totalCrowns: 4,
      maxCrowns: isTin ? 9 : 12,
      totalChapters: isTin ? 3 : 4,
    },
    tracks: isTin
      ? [
          {
            trackCode: 'DEFAULT',
            trackTitle: `Tin Học Khối ${grade}`,
            shortTitle: 'Tin Học',
            frontierChapterId: 2,
            frontierByLevel: { BASIC: 2, MEDIUM: 1, ADVANCED: 1 },
            totalChapters: 3,
            completedBasicCount: 2,
            completedMediumCount: 1,
            completedAdvancedCount: 0,
            totalCrowns: 4,
            maxCrowns: 9,
            chapters: [
              {
                id: 1,
                slug: 'chuong-1',
                name: 'Chương 1: Hàm & Đệ quy Python',
                shortName: 'Hàm & Đệ quy',
                sgkLabel: 'Kết nối tri thức',
                description: 'Nắm vững hàm, tham số và kỹ thuật đệ quy cơ bản.',
                semester: 1,
                track: 'DEFAULT',
                trackLabel: 'Tin Học',
                trackOrder: 1,
                isUnlocked: true,
                unlockedManually: false,
                isCurrentSemester: true,
                isFrontier: false,
                crownsEarned: 2,
                maxCrowns: 3,
                attemptsCount: 3,
                lastPracticedAt: nowIso,
                levels: {
                  BASIC: { unlocked: true, completed: true, bestScore: 8.5, costPoints: 3 },
                  MEDIUM: { unlocked: true, completed: true, bestScore: 7.5, costPoints: 4 },
                  ADVANCED: { unlocked: true, completed: false, bestScore: null, costPoints: 9 },
                },
              },
              {
                id: 2,
                slug: 'chuong-2',
                name: 'Chương 2: Mảng & Xử lý Chuỗi',
                shortName: 'Mảng & Chuỗi',
                sgkLabel: 'Kết nối tri thức',
                description: 'Kỹ thuật duyệt mảng và cắt chuỗi trong Python.',
                semester: 1,
                track: 'DEFAULT',
                trackLabel: 'Tin Học',
                trackOrder: 2,
                isUnlocked: true,
                unlockedManually: false,
                isCurrentSemester: true,
                isFrontier: true,
                crownsEarned: 1,
                maxCrowns: 3,
                attemptsCount: 2,
                lastPracticedAt: nowIso,
                levels: {
                  BASIC: { unlocked: true, completed: true, bestScore: 8.0, costPoints: 3 },
                  MEDIUM: { unlocked: true, completed: false, bestScore: 6.0, costPoints: 4 },
                  ADVANCED: { unlocked: false, completed: false, bestScore: null, costPoints: 9 },
                },
              },
              {
                id: 3,
                slug: 'chuong-3',
                name: 'Chương 3: Cơ sở dữ liệu SQL',
                shortName: 'CSDL SQL',
                sgkLabel: 'Kết nối tri thức',
                description: 'Truy vấn SELECT, JOIN và chuẩn hóa dữ liệu.',
                semester: 2,
                track: 'DEFAULT',
                trackLabel: 'Tin Học',
                trackOrder: 3,
                isUnlocked: true,
                unlockedManually: true,
                isCurrentSemester: false,
                isFrontier: false,
                crownsEarned: 1,
                maxCrowns: 3,
                attemptsCount: 1,
                lastPracticedAt: nowIso,
                levels: {
                  BASIC: { unlocked: true, completed: true, bestScore: 9.0, costPoints: 3 },
                  MEDIUM: { unlocked: true, completed: false, bestScore: null, costPoints: 4 },
                  ADVANCED: { unlocked: false, completed: false, bestScore: null, costPoints: 9 },
                },
              },
            ],
          },
        ]
      : [
          {
            trackCode: 'TOAN_SO',
            trackTitle: `Đại Số & Giải Tích ${grade}`,
            shortTitle: 'Đại Số',
            frontierChapterId: 2,
            frontierByLevel: { BASIC: 2, MEDIUM: 1, ADVANCED: 1 },
            totalChapters: 2,
            completedBasicCount: 2,
            completedMediumCount: 1,
            completedAdvancedCount: 0,
            totalCrowns: 3,
            maxCrowns: 6,
            chapters: [
              {
                id: 1,
                slug: 'chuong-1',
                name: `Chương 1: Ứng dụng Đạo hàm (Lớp ${grade})`,
                shortName: 'Đạo hàm',
                sgkLabel: 'Kết nối tri thức',
                description: 'Tính đơn điệu, cực trị và GTLN-GTNN của hàm số.',
                semester: 1,
                track: 'TOAN_SO',
                trackLabel: 'Đại Số',
                trackOrder: 1,
                isUnlocked: true,
                unlockedManually: false,
                isCurrentSemester: true,
                isFrontier: false,
                crownsEarned: 2,
                maxCrowns: 3,
                attemptsCount: 4,
                lastPracticedAt: nowIso,
                levels: {
                  BASIC: { unlocked: true, completed: true, bestScore: 8.5, costPoints: 3 },
                  MEDIUM: { unlocked: true, completed: true, bestScore: 7.5, costPoints: 4 },
                  ADVANCED: { unlocked: true, completed: false, bestScore: null, costPoints: 9 },
                },
              },
              {
                id: 2,
                slug: 'chuong-3',
                name: `Chương 3: Nguyên hàm & Tích phân (Lớp ${grade})`,
                shortName: 'Tích phân',
                sgkLabel: 'Kết nối tri thức',
                description: 'Phương pháp đổi biến số và tích phân từng phần.',
                semester: 2,
                track: 'TOAN_SO',
                trackLabel: 'Đại Số',
                trackOrder: 2,
                isUnlocked: true,
                unlockedManually: false,
                isCurrentSemester: false,
                isFrontier: true,
                crownsEarned: 1,
                maxCrowns: 3,
                attemptsCount: 2,
                lastPracticedAt: nowIso,
                levels: {
                  BASIC: { unlocked: true, completed: true, bestScore: 9.0, costPoints: 3 },
                  MEDIUM: { unlocked: true, completed: false, bestScore: null, costPoints: 4 },
                  ADVANCED: { unlocked: false, completed: false, bestScore: null, costPoints: 9 },
                },
              },
            ],
          },
          {
            trackCode: 'TOAN_HINH',
            trackTitle: `Hình Học & Tọa Độ ${grade}`,
            shortTitle: 'Hình Học',
            frontierChapterId: 3,
            frontierByLevel: { BASIC: 3, MEDIUM: 3, ADVANCED: 3 },
            totalChapters: 2,
            completedBasicCount: 1,
            completedMediumCount: 0,
            completedAdvancedCount: 0,
            totalCrowns: 1,
            maxCrowns: 6,
            chapters: [
              {
                id: 3,
                slug: 'chuong-2',
                name: `Chương 2: Tọa độ Vectơ Oxyz (Lớp ${grade})`,
                shortName: 'Vectơ Oxyz',
                sgkLabel: 'Kết nối tri thức',
                description: 'Hệ tọa độ, tích vô hướng và tích có hướng trong không gian.',
                semester: 1,
                track: 'TOAN_HINH',
                trackLabel: 'Hình Học',
                trackOrder: 1,
                isUnlocked: true,
                unlockedManually: false,
                isCurrentSemester: true,
                isFrontier: true,
                crownsEarned: 1,
                maxCrowns: 3,
                attemptsCount: 2,
                lastPracticedAt: nowIso,
                levels: {
                  BASIC: { unlocked: true, completed: true, bestScore: 7.5, costPoints: 3 },
                  MEDIUM: { unlocked: true, completed: false, bestScore: null, costPoints: 4 },
                  ADVANCED: { unlocked: false, completed: false, bestScore: null, costPoints: 9 },
                },
              },
              {
                id: 4,
                slug: 'chuong-4',
                name: `Chương 4: Xác suất có điều kiện (Lớp ${grade})`,
                shortName: 'Xác suất',
                sgkLabel: 'Kết nối tri thức',
                description: 'Công thức xác suất toàn phần và công thức Bayes.',
                semester: 2,
                track: 'TOAN_HINH',
                trackLabel: 'Hình Học',
                trackOrder: 2,
                isUnlocked: false,
                unlockedManually: false,
                isCurrentSemester: false,
                isFrontier: false,
                crownsEarned: 0,
                maxCrowns: 3,
                attemptsCount: 0,
                lastPracticedAt: null,
                levels: {
                  BASIC: { unlocked: false, completed: false, bestScore: null, costPoints: 3 },
                  MEDIUM: { unlocked: false, completed: false, bestScore: null, costPoints: 4 },
                  ADVANCED: { unlocked: false, completed: false, bestScore: null, costPoints: 9 },
                },
              },
            ],
          },
        ],
  };

  return {
    knowledgeProfile: {
      studentProfileId: 'sp-local-01',
      userId: 'usr-student-local-01',
      subject,
      grade,
      summary,
      bloomStats,
      frequentTraps,
      behaviorSummary,
      recentBehaviorHistory: [],
      topics,
      groupedTopics,
    },
    personalizedRoadmap: {
      studentProfileId: 'sp-local-01',
      userId: 'usr-student-local-01',
      subject,
      grade,
      knowledgeSummary: summary,
      bloomStats,
      frequentTraps,
      behaviorSummary,
      recentBehaviorHistory: [],
      primaryRecommendation: steps[0],
      phases,
      steps,
    },
    diagnosticStatus,
    chapterRoadmap,
  };
}

interface LocalPointsState {
  currentPoints: number;
  diamonds: number;
  lastClaimDate: string | null;
  logs: Array<{
    id: string;
    actionType: string;
    examLevel: string | null;
    examTitle: string;
    examScore?: number;
    pointsBefore: number;
    pointsDelta: number;
    pointsAfter: number;
    note: string;
    createdAt: string;
  }>;
}

function getLocalPointsState(): LocalPointsState {
  const g = globalThis as unknown as { __schoolifyLocalPoints?: LocalPointsState };
  if (!g.__schoolifyLocalPoints) {
    g.__schoolifyLocalPoints = {
      currentPoints: 18,
      diamonds: 350,
      lastClaimDate: null,
      logs: [
        {
          id: 'log-local-02',
          actionType: 'SCORE_REWARD_8_5_TO_9_9',
          examLevel: 'MEDIUM',
          examTitle: 'Đề Luyện Tập Chuyên Đề Toán 12 - Hàm Số',
          examScore: 9.0,
          pointsBefore: 17,
          pointsDelta: 1,
          pointsAfter: 18,
          note: 'Thưởng đạt 9.0 điểm (+1 Tia Sáng)',
          createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
        },
        {
          id: 'log-local-03',
          actionType: 'START_EXAM',
          examLevel: 'BASIC',
          examTitle: 'Mở đề Cơ bản (-3 Tia Sáng)',
          pointsBefore: 20,
          pointsDelta: -3,
          pointsAfter: 17,
          note: 'Trừ 3 Tia Sáng mở đề Cơ bản',
          createdAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
        },
      ],
    };
  }
  return g.__schoolifyLocalPoints;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subPath = path.join('/');
    const search = req.nextUrl.search || '';

    const beRes = await fetch(`${BE_BASE_URL}/exams/${subPath}${search}`, {
      method: 'GET',
      headers: buildHeaders(req),
      cache: 'no-store',
    });

    const data = await beRes.json().catch(() => ({ success: beRes.ok }));
    return NextResponse.json(data, { status: beRes.status });
  } catch (error: any) {
    const { path } = await context.params;
    const subPath = path.join('/');
    if (subPath === 'points/balance') {
      const lp = getLocalPointsState();
      const today = new Date().toISOString().slice(0, 10);
      const alreadyClaimedToday = lp.lastClaimDate === today;
      return NextResponse.json({
        success: true,
        data: {
          studentProfileId: 'sp-local-01',
          currentPoints: lp.currentPoints,
          diamonds: lp.diamonds,
          activePackage: 'VIP BỨT PHÁ',
          dailyAllowance: 9,
          lastDailyGrantDate: lp.lastClaimDate || today,
          alreadyClaimedToday,
          quotaByLevel: {
            BASIC: { code: 'BASIC', label: 'Cơ bản', costPoints: 3, canStart: lp.currentPoints >= 3, maxExamsAvailable: Math.floor(lp.currentPoints / 3) },
            MEDIUM: { code: 'MEDIUM', label: 'Trung bình', costPoints: 4, canStart: lp.currentPoints >= 4, maxExamsAvailable: Math.floor(lp.currentPoints / 4) },
            ADVANCED: { code: 'ADVANCED', label: 'Nâng cao', costPoints: 9, canStart: lp.currentPoints >= 9, maxExamsAvailable: Math.floor(lp.currentPoints / 9) },
          },
          todaySummary: {
            date: today,
            examsStartedToday: 1,
            pointsSpentToday: 3,
            pointsRewardedToday: alreadyClaimedToday ? 11 : 2,
            pointsPenalizedToday: 0,
          },
          recentLogs: lp.logs.slice(0, 5),
          rules: {},
        },
      });
    }
    if (subPath === 'history') {
      const snaps = await listRecords('examSnapshots').catch(() => []);
      const items = snaps.map((s: any) => ({
        id: s.id,
        attemptToken: s.attemptToken || s.id,
        userId: s.userId,
        examTitle: s.examTitle,
        score: s.originalExam?.finalScore ?? 0,
        totalPoints: s.originalExam?.maxScore ?? 10,
        timeSpentSeconds: s.timeSpentSeconds ?? 600,
        submittedAt: s.createdAt,
        status: 'COMPLETED',
        snapshotData: s,
      }));
      return NextResponse.json({
        success: true,
        data: {
          items,
          pagination: { totalItems: items.length, page: 1, limit: 50, totalPages: 1 },
        },
      });
    }
    if (subPath.startsWith('snapshots/')) {
      const snapId = subPath.replace('snapshots/', '');
      const snap = await getRecord('examSnapshots', snapId).catch(() => null);
      if (snap) {
        return NextResponse.json({
          success: true,
          data: {
            id: snap.id,
            attemptToken: (snap as any).attemptToken || snap.id,
            examTitle: (snap as any).examTitle,
            score: (snap as any).originalExam?.finalScore ?? 0,
            submittedAt: (snap as any).createdAt,
            snapshotData: snap,
          },
        });
      }
    }
    if (subPath === 'points/history') {
      const lp = getLocalPointsState();
      return NextResponse.json({
        success: true,
        data: {
          currentPoints: lp.currentPoints,
          dailyAllowance: 9,
          items: lp.logs,
          pagination: { totalItems: lp.logs.length, page: 1, limit: 20, totalPages: 1 },
        },
      });
    }
    if (
      subPath === 'knowledge-profile' ||
      subPath === 'personalized-roadmap' ||
      subPath === 'diagnostic-status' ||
      subPath === 'chapter-roadmap'
    ) {
      const subjectParam = req.nextUrl.searchParams.get('subject') || 'toan-hoc';
      const gradeParam = Number(req.nextUrl.searchParams.get('grade') || 12);
      const localM09 = buildLocalModule09Snapshot(subjectParam, gradeParam);
      if (subPath === 'knowledge-profile') {
        return NextResponse.json({ success: true, data: localM09.knowledgeProfile });
      }
      if (subPath === 'personalized-roadmap') {
        return NextResponse.json({ success: true, data: localM09.personalizedRoadmap });
      }
      if (subPath === 'chapter-roadmap') {
        return NextResponse.json({ success: true, data: localM09.chapterRoadmap });
      }
      return NextResponse.json({ success: true, data: localM09.diagnosticStatus });
    }
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Lỗi kết nối đến cổng Exams Backend',
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const subPath = path.join('/');
  const body = await req.json().catch(() => ({}));

  if (subPath === 'points/admin-adjust') {
    const reqRole = (req.headers.get('x-user-role') || '').toUpperCase();
    if (reqRole && reqRole !== 'SUPER_ADMIN' && reqRole !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          message: 'Chỉ Quản trị viên cấp cao (SUPER_ADMIN) mới có quyền bù/hoàn điểm CSKH.',
        },
        { status: 403 }
      );
    }
    const auditNote = typeof body?.note === 'string' ? body.note.trim() : '';
    if (auditNote.length < 5) {
      return NextResponse.json(
        {
          success: false,
          message: 'Bắt buộc nhập lý do điều chỉnh điểm (tối thiểu 5 ký tự) để ghi nhật ký kiểm toán.',
        },
        { status: 400 }
      );
    }
  }

  try {
    const beRes = await fetch(`${BE_BASE_URL}/exams/${subPath}`, {
      method: 'POST',
      headers: buildHeaders(req),
      body: JSON.stringify(body),
    });

    const data = await beRes.json().catch(() => ({ success: beRes.ok }));
    return NextResponse.json(data, { status: beRes.status });
  } catch (error: any) {
    if (subPath === 'points/admin-adjust') {
      const lp = getLocalPointsState();
      const prevPoints = lp.currentPoints;
      const prevDiamonds = lp.diamonds;
      if (typeof body?.examPoints === 'number') {
        lp.currentPoints = Math.max(0, body.examPoints);
      }
      if (typeof body?.diamonds === 'number') {
        lp.diamonds = Math.max(0, body.diamonds);
      }
      const delta = lp.currentPoints - prevPoints;
      const diamondDelta = lp.diamonds - prevDiamonds;
      const auditNote = String(body?.note || '').trim() || '[CSKH] Hỗ trợ bù/hoàn điểm';
      if (delta !== 0 || diamondDelta !== 0) {
        const summarySuffix =
          diamondDelta !== 0
            ? ` (Ngọc: ${diamondDelta > 0 ? '+' : ''}${diamondDelta})`
            : '';
        lp.logs.unshift({
          id: `log-cskh-${Date.now()}`,
          actionType: 'ADMIN_CSKH_ADJUST',
          examLevel: null,
          examTitle: 'Hỗ trợ CSKH (Bù / Hoàn điểm)',
          pointsBefore: prevPoints,
          pointsDelta: delta,
          pointsAfter: lp.currentPoints,
          note: `${auditNote}${summarySuffix}`,
          createdAt: new Date().toISOString(),
        });
      }
      return NextResponse.json({
        success: true,
        data: {
          currentPoints: lp.currentPoints,
          diamonds: lp.diamonds,
          note: auditNote,
        },
      });
    }
    if (subPath === 'points/daily-claim') {
      const lp = getLocalPointsState();
      const today = new Date().toISOString().slice(0, 10);
      if (lp.lastClaimDate === today && !body?.forceReset) {
        return NextResponse.json({
          success: true,
          message: 'Hôm nay bạn đã điểm danh nhận 9 Tia Sáng rồi!',
          data: {
            claimed: false,
            alreadyClaimedToday: true,
            currentPoints: lp.currentPoints,
            diamonds: lp.diamonds,
          },
        });
      }
      const prev = lp.currentPoints;
      lp.currentPoints = prev + 9;
      lp.lastClaimDate = today;
      lp.logs.unshift({
        id: `log-checkin-${Date.now()}`,
        actionType: 'DAILY_CHECKIN',
        examLevel: null,
        examTitle: 'Điểm danh nhận 9 Tia Sáng hàng ngày',
        pointsBefore: prev,
        pointsDelta: 9,
        pointsAfter: lp.currentPoints,
        note: 'Cộng +9 Tia Sáng điểm danh đầu ngày',
        createdAt: new Date().toISOString(),
      });
      return NextResponse.json({
        success: true,
        message: 'Đã cộng +9 Tia Sáng điểm danh hàng ngày!',
        data: {
          claimed: true,
          alreadyClaimedToday: true,
          currentPoints: lp.currentPoints,
          diamonds: lp.diamonds,
        },
      });
    }
    if (subPath === 'sync-guest-onboarding' || subPath === 'chapter-roadmap/jump') {
      return NextResponse.json({
        success: true,
        message: 'Đã đồng bộ dữ liệu lộ trình (Local Demo)',
      });
    }
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Lỗi kết nối đến cổng Exams Backend',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subPath = path.join('/');
    const body = await req.json().catch(() => ({}));

    const beRes = await fetch(`${BE_BASE_URL}/exams/${subPath}`, {
      method: 'PATCH',
      headers: buildHeaders(req),
      body: JSON.stringify(body),
    });

    const data = await beRes.json().catch(() => ({ success: beRes.ok }));
    return NextResponse.json(data, { status: beRes.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Lỗi kết nối đến cổng Exams Backend',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subPath = path.join('/');

    const beRes = await fetch(`${BE_BASE_URL}/exams/${subPath}`, {
      method: 'DELETE',
      headers: buildHeaders(req),
    });

    const data = await beRes.json().catch(() => ({ success: beRes.ok }));
    return NextResponse.json(data, { status: beRes.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Lỗi kết nối đến cổng Exams Backend',
      },
      { status: 500 }
    );
  }
}
