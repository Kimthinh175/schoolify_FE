/**
 * Service lưu trữ bài thi Offline bằng IndexedDB của trình duyệt
 * Đảm bảo:
 * 1. Khóa phiên thi & Wall-clock background timer (đếm giờ thực ngầm).
 * 2. Lưu trữ toàn bộ câu trả lời real-time draft vào IndexedDB.
 * 3. Hỗ trợ làm bài & nộp bài khi mất mạng.
 * 4. Tự động đồng bộ (auto-sync) lên BE khi khôi phục mạng.
 */

export type ExamSessionType = 'OLYMPIAD_ESSAY' | 'CODING' | 'STANDARD';
export type ExamSessionStatus = 'IN_PROGRESS' | 'SUBMITTED_OFFLINE' | 'SYNCED';

export interface ActiveExamSession {
  id: string;
  examId: string;
  examType: ExamSessionType;
  examTitle: string;
  roomUrl: string;
  startTime: number;
  targetEndTime: number;
  durationSeconds: number;
  status: ExamSessionStatus;
  answers: Record<string, any>;
  updatedAt: number;
  examPackage?: any;
}

export interface OfflineSubmission {
  id: string;
  sessionId: string;
  examId: string;
  examType: ExamSessionType;
  examTitle: string;
  roomUrl: string;
  answers: Record<string, any>;
  timeSpentSeconds: number;
  submittedAt: number;
  isAutoSubmit: boolean;
  syncStatus: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  attempts: number;
  lastError?: string;
}

const DB_NAME = 'schoolify_exam_offline_db';
const DB_VERSION = 1;
const STORE_ACTIVE_SESSION = 'active_session';
const STORE_PENDING_SUBMISSIONS = 'pending_submissions';
const LOCAL_STORAGE_LOCK_KEY = 'schoolify_active_exam_lock';

class ExamOfflineStorageService {
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  private getDb(): Promise<IDBDatabase | null> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.resolve(null);
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve) => {
        try {
          const req = window.indexedDB.open(DB_NAME, DB_VERSION);

          req.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_ACTIVE_SESSION)) {
              db.createObjectStore(STORE_ACTIVE_SESSION, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_PENDING_SUBMISSIONS)) {
              db.createObjectStore(STORE_PENDING_SUBMISSIONS, { keyPath: 'id' });
            }
          };

          req.onsuccess = () => {
            resolve(req.result);
          };

          req.onerror = () => {
            console.warn('[ExamOfflineStorage] Failed to open IndexedDB, falling back to memory/localStorage.');
            resolve(null);
          };
        } catch (err) {
          console.warn('[ExamOfflineStorage] Error initializing IndexedDB:', err);
          resolve(null);
        }
      });
    }

    return this.dbPromise;
  }

  private updateLocalLock(session: ActiveExamSession | null) {
    if (typeof window === 'undefined') return;
    try {
      if (session && session.status === 'IN_PROGRESS') {
        const lockData = {
          isActive: true,
          sessionId: session.id,
          examId: session.examId,
          examTitle: session.examTitle,
          roomUrl: session.roomUrl,
          targetEndTime: session.targetEndTime,
          durationSeconds: session.durationSeconds,
        };
        localStorage.setItem(LOCAL_STORAGE_LOCK_KEY, JSON.stringify(lockData));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_LOCK_KEY);
      }
    } catch {
      // Bỏ qua lỗi storage quota
    }
  }

  public getFastSyncActiveLock(): {
    isActive: boolean;
    sessionId: string;
    examId: string;
    examTitle: string;
    roomUrl: string;
    targetEndTime: number;
    durationSeconds: number;
  } | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_LOCK_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data && data.isActive && data.roomUrl) {
        return data;
      }
    } catch {
      return null;
    }
    return null;
  }

  public async startExamSession(params: {
    examId: string;
    examType: ExamSessionType;
    examTitle: string;
    roomUrl: string;
    durationMinutes: number;
    initialAnswers?: Record<string, any>;
    examPackage?: any;
  }): Promise<ActiveExamSession> {
    const existing = await this.getActiveExamSession();

    if (existing && existing.examId === params.examId && existing.status === 'IN_PROGRESS') {
      existing.roomUrl = params.roomUrl;
      if (!existing.examPackage && params.examPackage) {
        existing.examPackage = params.examPackage;
      }
      await this.saveSessionToDb(existing);
      this.updateLocalLock(existing);
      return existing;
    }

    const now = Date.now();
    const durationSeconds = Math.max(60, params.durationMinutes * 60);
    const targetEndTime = now + durationSeconds * 1000;

    const newSession: ActiveExamSession = {
      id: `session-${params.examId}-${now}`,
      examId: params.examId,
      examType: params.examType,
      examTitle: params.examTitle,
      roomUrl: params.roomUrl,
      startTime: now,
      targetEndTime,
      durationSeconds,
      status: 'IN_PROGRESS',
      answers: params.initialAnswers || {},
      updatedAt: now,
      examPackage: params.examPackage,
    };

    // Xóa mọi phiên cũ trước khi lưu phiên mới để đảm bảo chỉ có duy nhất 1 phiên trong IndexedDB
    await this.clearActiveExamSession();
    await this.saveSessionToDb(newSession);
    this.updateLocalLock(newSession);
    return newSession;
  }

  public async getActiveExamSession(): Promise<ActiveExamSession | null> {
    const db = await this.getDb();
    if (!db) {
      const lock = this.getFastSyncActiveLock();
      if (!lock) return null;
      return {
        id: lock.sessionId,
        examId: lock.examId,
        examType: 'STANDARD',
        examTitle: lock.examTitle,
        roomUrl: lock.roomUrl,
        startTime: lock.targetEndTime - lock.durationSeconds * 1000,
        targetEndTime: lock.targetEndTime,
        durationSeconds: lock.durationSeconds,
        status: 'IN_PROGRESS',
        answers: {},
        updatedAt: Date.now(),
      };
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_ACTIVE_SESSION, 'readonly');
        const store = tx.objectStore(STORE_ACTIVE_SESSION);
        const req = store.getAll();

        req.onsuccess = () => {
          const sessions = req.result as ActiveExamSession[];
          const active = sessions.find((s) => s.status === 'IN_PROGRESS');
          resolve(active || null);
        };

        req.onerror = () => {
          resolve(null);
        };
      } catch {
        resolve(null);
      }
    });
  }

  private async saveSessionToDb(session: ActiveExamSession): Promise<void> {
    const db = await this.getDb();
    if (!db) return;

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(STORE_ACTIVE_SESSION, 'readwrite');
        const store = tx.objectStore(STORE_ACTIVE_SESSION);
        store.put(session);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  public async updateDraftAnswers(answers: Record<string, any>): Promise<void> {
    const session = await this.getActiveExamSession();
    if (!session || session.status !== 'IN_PROGRESS') return;

    session.answers = {
      ...session.answers,
      ...answers,
    };
    session.updatedAt = Date.now();

    await this.saveSessionToDb(session);
  }

  public async completeAndQueueSubmission(params: {
    answers: Record<string, any>;
    timeSpentSeconds: number;
    isAutoSubmit: boolean;
  }): Promise<OfflineSubmission | null> {
    const session = await this.getActiveExamSession();
    if (!session) {
      await this.clearActiveExamSession();
      return null;
    }

    const submissionId = `sub-${session.examId}-${Date.now()}`;
    const submission: OfflineSubmission = {
      id: submissionId,
      sessionId: session.id,
      examId: session.examId,
      examType: session.examType,
      examTitle: session.examTitle,
      roomUrl: session.roomUrl,
      answers: params.answers,
      timeSpentSeconds: params.timeSpentSeconds,
      submittedAt: Date.now(),
      isAutoSubmit: params.isAutoSubmit,
      syncStatus: 'PENDING',
      attempts: 0,
    };

    const db = await this.getDb();
    if (db) {
      await new Promise<void>((resolve, reject) => {
        try {
          const tx = db.transaction(STORE_PENDING_SUBMISSIONS, 'readwrite');
          const store = tx.objectStore(STORE_PENDING_SUBMISSIONS);
          store.put(submission);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        } catch (err) {
          reject(err);
        }
      });
    }

    // Xóa sạch toàn bộ khóa phiên thi trong LocalStorage và IndexedDB ngay lập tức khi nộp bài
    await this.clearActiveExamSession();

    return submission;
  }

  public async clearActiveExamSession(): Promise<void> {
    this.updateLocalLock(null);
    const db = await this.getDb();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_ACTIVE_SESSION, 'readwrite');
        const store = tx.objectStore(STORE_ACTIVE_SESSION);
        store.clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async getPendingSubmissions(): Promise<OfflineSubmission[]> {
    const db = await this.getDb();
    if (!db) return [];

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_PENDING_SUBMISSIONS, 'readonly');
        const store = tx.objectStore(STORE_PENDING_SUBMISSIONS);
        const req = store.getAll();

        req.onsuccess = () => {
          const items = (req.result as OfflineSubmission[]) || [];
          resolve(items.filter((item) => item.syncStatus !== 'SYNCED'));
        };

        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  public async markSubmissionSynced(submissionId: string): Promise<void> {
    const db = await this.getDb();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_PENDING_SUBMISSIONS, 'readwrite');
        const store = tx.objectStore(STORE_PENDING_SUBMISSIONS);
        const req = store.get(submissionId);

        req.onsuccess = () => {
          const item = req.result as OfflineSubmission;
          if (item) {
            item.syncStatus = 'SYNCED';
            item.attempts += 1;
            store.put(item);
          }
          resolve();
        };

        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async syncPendingSubmissions(): Promise<{ syncedCount: number; errors: any[] }> {
    if (typeof window === 'undefined' || !navigator.onLine) {
      return { syncedCount: 0, errors: [] };
    }

    const pending = await this.getPendingSubmissions();
    if (pending.length === 0) return { syncedCount: 0, errors: [] };

    let syncedCount = 0;
    const errors: any[] = [];

    // 1. Ưu tiên đồng bộ hàng loạt lên PostgreSQL qua POST /api/v1/exams/sync-offline
    try {
      const beRes = await fetch('/api/v1/exams/sync-offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissions: pending.map((item) => ({
            id: item.id,
            sessionId: item.sessionId,
            examId: item.examId,
            examTitle: item.examTitle,
            timeSpentSeconds: item.timeSpentSeconds,
            answers: item.answers,
            submittedAt: new Date(item.submittedAt).toISOString(),
          })),
        }),
      });
      if (beRes.ok) {
        const json = await beRes.json().catch(() => null);
        const syncedIds: string[] = Array.isArray(json?.syncedIds)
          ? json.syncedIds
          : pending.map((p) => p.id);
        for (const sid of syncedIds) {
          await this.markSubmissionSynced(sid);
          syncedCount++;
        }
        if (syncedCount === pending.length) {
          return { syncedCount, errors };
        }
      }
    } catch {
      // Fallback xuống json-db nếu BE tạm thời chưa kết nối
    }

    for (const item of pending) {
      try {
        const res = await fetch('/api/db/offlineSubmissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.id,
            sessionId: item.sessionId,
            examId: item.examId,
            examTitle: item.examTitle,
            examType: item.examType,
            answers: item.answers,
            timeSpentSeconds: item.timeSpentSeconds,
            submittedAt: new Date(item.submittedAt).toISOString(),
            isAutoSubmit: item.isAutoSubmit,
            syncedAt: new Date().toISOString(),
          }),
        });

        if (res.ok) {
          await this.markSubmissionSynced(item.id);
          syncedCount++;
        } else {
          errors.push({ id: item.id, error: `HTTP ${res.status}` });
        }
      } catch (err: any) {
        errors.push({ id: item.id, error: err.message || 'Network error' });
      }
    }

    return { syncedCount, errors };
  }
}

export const examOfflineStorage = new ExamOfflineStorageService();
