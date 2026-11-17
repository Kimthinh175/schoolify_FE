import type { QuestionBugReport } from '@/components/features/student/practice/ReportQuestionModal';

export interface CreateQuestionBugReportPayload {
  questionId: string;
  questionTitle: string;
  subjectName?: string;
  questionContentSnippet?: string;
  issueType: 'WRONG_ANSWER' | 'KATEX_ERROR' | 'TYPO_CONTENT' | 'MATRIX_MISMATCH' | 'OTHER';
  issueTypeLabel?: string;
  description?: string;
  studentName?: string;
}

export interface QuestionBugReportListResult {
  items: QuestionBugReport[];
  total: number;
  pendingCount: number;
  resolvedCount: number;
}

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

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export const questionReportService = {
  /** Gửi báo cáo sai sót câu hỏi lên Backend PostgreSQL (`POST /api/v1/exams/question-reports`) */
  async submitQuestionBugReport(
    payload: CreateQuestionBugReportPayload,
  ): Promise<QuestionBugReport> {
    const res = await fetch('/api/v1/exams/question-reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    const json = await parseJsonSafe(res);
    if (!res.ok || !json?.success || !json?.data) {
      throw new Error(
        json?.message || 'Không thể gửi báo cáo lên máy chủ. Vui lòng thử lại.',
      );
    }

    return json.data as QuestionBugReport;
  },

  /** Lấy danh sách báo cáo sai sót câu hỏi từ Backend (`GET /api/v1/exams/question-reports`) */
  async fetchQuestionBugReports(params?: {
    status?: 'ALL' | 'PENDING' | 'RESOLVED';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<QuestionBugReportListResult> {
    const qs = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    qs.set('page', String(params?.page || 1));
    qs.set('limit', String(params?.limit || 100));

    const res = await fetch(`/api/v1/exams/question-reports?${qs.toString()}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        ...getAuthHeaders(),
      },
    });

    const json = await parseJsonSafe(res);
    if (!res.ok || !json?.success) {
      throw new Error(
        json?.message || 'Không thể tải danh sách báo cáo từ máy chủ.',
      );
    }

    const data = json.data || {};
    return {
      items: Array.isArray(data.items) ? (data.items as QuestionBugReport[]) : [],
      total: Number(data.total || 0),
      pendingCount: Number(data.pendingCount || 0),
      resolvedCount: Number(data.resolvedCount || 0),
    };
  },

  /** Cập nhật trạng thái xử lý báo cáo (`PATCH /api/v1/exams/question-reports/:id/status`) */
  async updateQuestionBugReportStatus(
    id: string,
    status: 'PENDING' | 'RESOLVED',
    adminNote?: string,
  ): Promise<QuestionBugReport> {
    const res = await fetch(
      `/api/v1/exams/question-reports/${encodeURIComponent(id)}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status, ...(adminNote !== undefined ? { adminNote } : {}) }),
      },
    );

    const json = await parseJsonSafe(res);
    if (!res.ok || !json?.success || !json?.data) {
      throw new Error(
        json?.message || 'Không thể cập nhật trạng thái báo cáo.',
      );
    }

    return json.data as QuestionBugReport;
  },

  /** Xóa báo cáo sai sót (`DELETE /api/v1/exams/question-reports/:id`) */
  async deleteQuestionBugReport(id: string): Promise<void> {
    const res = await fetch(
      `/api/v1/exams/question-reports/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
      },
    );

    const json = await parseJsonSafe(res);
    if (!res.ok || !json?.success) {
      throw new Error(json?.message || 'Không thể xóa báo cáo.');
    }
  },
};
