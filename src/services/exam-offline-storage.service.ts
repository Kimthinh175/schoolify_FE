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

  /**
   * Mở kết nối IndexedDB (hỗ trợ graceful fallback nếu IndexedDB bị vô hiệu hóa)
   */
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

  /**
   * Đồng bộ khóa nhanh vào LocalStorage (cho các kiểm tra route guard đồng bộ tức thì)
   */
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

  /**
   * Kiểm tra nhanh khóa phiên thi từ LocalStorage (0ms latency cho router)
   */
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

  /**
   * Khởi tạo hoặc tiếp tục một phiên thi
   */
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

    // Nếu đã có phiên thi đang làm đúng bài này, tiếp tục phiên cũ và GIỮ NGUYÊN BỘ ĐỀ
    if (existing && existing.examId === params.examId && existing.status === 'IN_PROGRESS') {
      existing.roomUrl = params.roomUrl;
      if (!existing.examPackage && params.examPackage) {
        existing.examPackage = params.examPackage;
      }
      await this.saveSessionToDb(existing);
      this.updateLocalLock(existing);
      return existing;
    }

    // Nếu chưa có hoặc khác bài thi, tạo phiên mới
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

    await this.saveSessionToDb(newSession);
    this.updateLocalLock(newSession);
    return newSession;
  }

  /**
   * Lấy phiên thi đang hoạt động từ IndexedDB
   */
  public async getActiveExamSession(): Promise<ActiveExamSession | null> {
    const db = await this.getDb();
    if (!db) {
      // Fallback lấy từ localStorage
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

  /**
   * Lưu phiên vào IndexedDB
   */
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

  /**
   * Cập nhật bản nháp câu trả lời theo thời gian thực vào IndexedDB (Debounced từ UI)
   */
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

  /**
   * Hoàn thành bài thi và xếp vào hàng đợi nộp bài Offline (nếu mất mạng hoặc nộp thành công)
   */
  public async completeAndQueueSubmission(params: {
    answers: Record<string, any>;
    timeSpentSeconds: number;
    isAutoSubmit: boolean;
  }): Promise<OfflineSubmission | null> {
    const session = await this.getActiveExamSession();
    if (!session) return null;

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

    // Lưu vào hàng đợi pending_submissions
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

    // Đánh dấu session đã hoàn thành để GIẢI PHÓNG KHÓA ĐIỀU HƯỚNG
    session.status = 'SUBMITTED_OFFLINE';
    session.answers = params.answers;
    session.updatedAt = Date.now();
    await this.saveSessionToDb(session);

    // Gỡ bỏ lock LocalStorage ngay lập tức
    this.updateLocalLock(null);

    return submission;
  }

  /**
   * Xóa hoàn toàn phiên thi đang hoạt động (khi học sinh rời phòng thi sau khi xem kết quả)
   */
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

  /**
   * Lấy toàn bộ danh sách bài nộp đang chờ đồng bộ (PENDING)
   */
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

  /**
   * Đánh dấu một bài nộp đã được đồng bộ lên máy chủ thành công
   */
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

  /**
   * Đồng bộ toàn bộ bài thi offline lên máy chủ (gọi khi có mạng)
   */
  public async syncPendingSubmissions(): Promise<{ syncedCount: number; errors: any[] }> {
    if (typeof window === 'undefined' || !navigator.onLine) {
      return { syncedCount: 0, errors: [] };
    }

    const pending = await this.getPendingSubmissions();
    if (pending.length === 0) return { syncedCount: 0, errors: [] };

    let syncedCount = 0;
    const errors: any[] = [];

    for (const item of pending) {
      try {
        // Gửi lên collection offlineSubmissions thông qua API json-db
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
