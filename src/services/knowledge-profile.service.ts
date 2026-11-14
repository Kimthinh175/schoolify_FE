export interface BloomStatItem {
  label: string;
  attempted: number;
  correct: number;
  accuracy: number;
}

export interface TopicMasteryItem {
  id: string;
  subject: string;
  grade: number;
  chapterId: number;
  chapterName: string;
  topicTag: string;
  totalAttempted: number;
  totalCorrect: number;
  totalWrong: number;
  accuracyPercent: number;
  masteryScore: number;
  masteryStatus: 'WEAK' | 'REVIEW' | 'MASTERED' | 'UNTESTED';
  bloomBreakdown: {
    NHAN_BIET: { attempted: number; correct: number };
    THONG_HIEU: { attempted: number; correct: number };
    VAN_DUNG: { attempted: number; correct: number };
    VAN_DUNG_CAO: { attempted: number; correct: number };
  };
  remediationAttempted: number;
  remediationCorrect: number;
  quickDrillSessions?: number;
  quickDrillTurnsCompleted?: number;
  quickDrillTurnsSkipped?: number;
  quickDrillTurnsCorrect?: number;
  latestLearningSpiritTag?: string | null;
  latestIntelligenceTag?: string | null;
  avgSecondsPerQuestion: number;
  topTraps: Array<{ trapTag: string; count: number }>;
  lastPracticedAt: string | null;
}

export interface QuickDrillTurnOutcome {
  turnIndex: number;
  questionId: string;
  status: 'CORRECT' | 'WRONG' | 'SKIPPED';
  selectedKey?: string;
}

export interface BehaviorHistoryRecord {
  id: string;
  studentProfileId: string;
  userId?: string | null;
  subject: string;
  grade: number;
  chapterId: number;
  topicTag: string;
  sourceQuestionId?: string | null;
  behaviorType: string;
  specialTag: string;
  isScored: boolean;
  totalTurns: number;
  completedTurns: number;
  skippedTurns: number;
  correctTurns: number;
  wrongTurns: number;
  turnOutcomes: QuickDrillTurnOutcome[];
  learningSpiritTag: string;
  learningSpiritLabel: string;
  learningSpiritScore: number;
  intelligenceTag: string;
  intelligenceLabel: string;
  intelligenceScore: number;
  roadmapStrategyTag: string;
  roadmapAdaptationNote: string;
  createdAt: string;
}

export interface BehaviorSummary {
  totalSessions: number;
  avgLearningSpiritScore: number;
  avgIntelligenceScore: number;
  latestLearningSpiritLabel: string;
  latestIntelligenceLabel: string;
  specialTag: string;
}

export interface KnowledgeProfileResponse {
  studentProfileId: string;
  userId: string;
  subject: string;
  grade: number;
  summary: {
    totalExamsSubmitted: number;
    totalQuestionsAttempted: number;
    totalCorrect: number;
    totalWrong: number;
    overallAccuracyPercent: number;
    overallMasteryScore: number;
    avgSecondsPerQuestion: number;
    remediationAttempted: number;
    remediationCorrect: number;
    countsByStatus: {
      weak: number;
      review: number;
      mastered: number;
      untested: number;
      totalCurriculumTopics: number;
    };
  };
  bloomStats: {
    NHAN_BIET: BloomStatItem;
    THONG_HIEU: BloomStatItem;
    VAN_DUNG: BloomStatItem;
    VAN_DUNG_CAO: BloomStatItem;
  };
  frequentTraps: Array<{
    trapTag: string;
    count: number;
    topicTag: string;
  }>;
  behaviorSummary?: BehaviorSummary;
  recentBehaviorHistory?: BehaviorHistoryRecord[];
  topics: TopicMasteryItem[];
  groupedTopics: {
    weak: TopicMasteryItem[];
    review: TopicMasteryItem[];
    mastered: TopicMasteryItem[];
    untested: TopicMasteryItem[];
  };
}

export interface PersonalizedRoadmapStep {
  id: string;
  phase: number;
  phaseLabel: string;
  stepOrder: number;
  subject: string;
  grade: number;
  chapterId: number;
  chapterName: string;
  topicTag: string;
  title: string;
  diagnosticReason: string;
  recommendedLevel: 'BASIC' | 'MEDIUM' | 'ADVANCED';
  recommendedBloom: 'NHAN_BIET' | 'THONG_HIEU' | 'VAN_DUNG' | 'VAN_DUNG_CAO';
  questionCount: number;
  durationMinutes: number;
  currentMastery: number;
  targetMastery: number;
  attemptedCount: number;
  correctCount: number;
  topTrapTag?: string | null;
  specialBehaviorTag?: string | null;
  learningSpiritTag?: string | null;
  learningSpiritLabel?: string | null;
  learningSpiritScore?: number | null;
  intelligenceTag?: string | null;
  intelligenceLabel?: string | null;
  intelligenceScore?: number | null;
  behaviorAdaptationNote?: string | null;
  status: 'RECOMMENDED' | 'IN_PROGRESS' | 'COMPLETED' | 'LOCKED';
  practiceUrl: string;
  updatedAt?: string;
}

export interface PersonalizedRoadmapPhase {
  phase: number;
  title: string;
  subtitle: string;
  badge: string;
  steps: PersonalizedRoadmapStep[];
}

export interface PersonalizedRoadmapResponse {
  studentProfileId: string;
  userId: string;
  subject: string;
  grade: number;
  knowledgeSummary: KnowledgeProfileResponse['summary'];
  bloomStats: KnowledgeProfileResponse['bloomStats'];
  frequentTraps: KnowledgeProfileResponse['frequentTraps'];
  behaviorSummary?: BehaviorSummary;
  recentBehaviorHistory?: BehaviorHistoryRecord[];
  primaryRecommendation: PersonalizedRoadmapStep | null;
  phases: PersonalizedRoadmapPhase[];
  steps: PersonalizedRoadmapStep[];
}

export interface TopicDeltaItem {
  topicTag: string;
  chapterId: number;
  previousScore: number;
  currentScore: number;
  deltaScore: number;
  previousStatus: string;
  currentStatus: string;
  attemptedInExam: number;
  correctInExam: number;
  topTrapTag?: string | null;
}

export interface KnowledgeUpdatePayload {
  topicDeltas: TopicDeltaItem[];
  nextRecommendedStep: PersonalizedRoadmapStep | null;
}

export const KNOWLEDGE_PROFILE_UPDATED_EVENT = 'knowledge-profile-updated';

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem('schoolify-auth-storage');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const state = parsed?.state || {};
    const token = state.token || '';
    const userId = state.user?.id || '';
    const role = state.currentRole || state.user?.role || 'STUDENT';
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(userId ? { 'x-user-id': String(userId) } : {}),
      ...(role ? { 'x-user-role': String(role) } : {}),
    };
  } catch {
    return {};
  }
}

export const knowledgeProfileService = {
  notifyUpdated() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(KNOWLEDGE_PROFILE_UPDATED_EVENT));
    }
  },

  /**
   * Lấy Hồ sơ Kiến thức & Bản đồ Lỗ hổng của học sinh từ Backend PostgreSQL
   */
  async getKnowledgeProfile(params?: {
    subject?: string;
    grade?: number;
    userId?: string;
  }): Promise<KnowledgeProfileResponse> {
    const headers = getAuthHeaders();
    const subject = params?.subject || 'toan-hoc';
    const grade = params?.grade || 12;
    const uid = params?.userId || headers['x-user-id'] || '';

    const query = new URLSearchParams({
      subject,
      grade: String(grade),
      ...(uid ? { userId: uid } : {}),
    });

    const res = await fetch(`/api/v1/exams/knowledge-profile?${query.toString()}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Không thể tải hồ sơ kiến thức (HTTP ${res.status})`);
    }

    const json = await res.json();
    if (!json?.success || !json?.data) {
      throw new Error(json?.message || 'Dữ liệu hồ sơ kiến thức không hợp lệ');
    }

    return json.data as KnowledgeProfileResponse;
  },

  /**
   * Lấy Lộ trình Học tập Cá nhân hóa 3 Chặng từ Backend PostgreSQL
   */
  async getPersonalizedRoadmap(params?: {
    subject?: string;
    grade?: number;
    userId?: string;
  }): Promise<PersonalizedRoadmapResponse> {
    const headers = getAuthHeaders();
    const subject = params?.subject || 'toan-hoc';
    const grade = params?.grade || 12;
    const uid = params?.userId || headers['x-user-id'] || '';

    const query = new URLSearchParams({
      subject,
      grade: String(grade),
      ...(uid ? { userId: uid } : {}),
    });

    const res = await fetch(`/api/v1/exams/personalized-roadmap?${query.toString()}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Không thể tải lộ trình cá nhân hóa (HTTP ${res.status})`);
    }

    const json = await res.json();
    if (!json?.success || !json?.data) {
      throw new Error(json?.message || 'Dữ liệu lộ trình cá nhân hóa không hợp lệ');
    }

    return json.data as PersonalizedRoadmapResponse;
  },

  /**
   * Gửi kết quả bài Luyện bù biến thể (Remediation) lên Backend PostgreSQL
   */
  async submitRemediationResult(payload: {
    snapshotId?: string;
    attemptToken?: string;
    subjectSlug?: string;
    grade?: number;
    chapterId?: number;
    finalScore: number;
    totalQuestions: number;
    correctCount: number;
    questions: any[];
    studentAnswers: any;
  }): Promise<{
    remediationSaved: boolean;
    knowledgeUpdate: KnowledgeUpdatePayload;
    roadmap: PersonalizedRoadmapResponse;
  } | null> {
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/v1/exams/remediation-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          ...payload,
          userId: headers['x-user-id'],
        }),
      });

      if (!res.ok) return null;
      const json = await res.json();
      this.notifyUpdated();
      return json?.data || null;
    } catch (err) {
      console.warn('[knowledgeProfileService.submitRemediationResult] Error:', err);
      return null;
    }
  },

  /**
   * Lưu hành vi Luyện lại nhanh 3 lần câu cùng dạng (Không tính điểm) vào bảng PostgreSQL student_behavior_histories
   * kèm tag đặc biệt #LUYEN_LAI_3_LAN_CUNG_DANG để đánh giá tinh thần học tập & trí thông minh và thiết kế lại lộ trình.
   */
  async recordQuickDrillBehavior(payload: {
    subjectSlug?: string;
    grade?: number;
    chapterId?: number;
    topicTag?: string;
    sourceQuestionId?: string;
    totalTurns: number;
    completedTurns: number;
    skippedTurns: number;
    correctTurns: number;
    wrongTurns: number;
    turnOutcomes?: QuickDrillTurnOutcome[];
  }): Promise<{
    behaviorSaved: boolean;
    isScored: boolean;
    behaviorRecord: BehaviorHistoryRecord;
    roadmap: PersonalizedRoadmapResponse;
  } | null> {
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/v1/exams/quick-drill-behavior', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          ...payload,
          userId: headers['x-user-id'],
        }),
      });

      if (!res.ok) return null;
      const json = await res.json();
      this.notifyUpdated();
      return json?.data || null;
    } catch (err) {
      console.warn('[knowledgeProfileService.recordQuickDrillBehavior] Error:', err);
      return null;
    }
  },

  /**
   * Lấy lịch sử hành vi từ Backend PostgreSQL
   */
  async getBehaviorHistory(params?: {
    subject?: string;
    grade?: number;
    userId?: string;
  }): Promise<{
    studentProfileId: string;
    subject: string;
    grade: number;
    records: BehaviorHistoryRecord[];
  } | null> {
    try {
      const headers = getAuthHeaders();
      const subject = params?.subject || 'toan-hoc';
      const grade = params?.grade || 12;
      const uid = params?.userId || headers['x-user-id'] || '';

      const query = new URLSearchParams({
        subject,
        grade: String(grade),
        ...(uid ? { userId: uid } : {}),
      });

      const res = await fetch(`/api/v1/exams/behavior-history?${query.toString()}`, {
        method: 'GET',
        headers,
        cache: 'no-store',
      });

      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    } catch {
      return null;
    }
  },
};

