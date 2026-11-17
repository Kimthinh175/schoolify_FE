'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { SchoolifyRobot } from '@/components/features/agent/SchoolifyRobot';
import { studentExamsService } from '@/services/student-exams.service';
import type { PracticeExamPackage } from '@/services/mock/practice-flow-data';
import { cn } from '@/lib/utils';
import styles from './diagnostic-gate.module.css';

export type DiagnosticOverlayMode = 'GATE' | 'GENERATE_LOADING' | 'SUBMIT_LOADING';

export interface DiagnosticGateOverlayProps {
  isOpen: boolean;
  subjectSlug: string;
  subjectName: string;
  grade: 10 | 11 | 12;
  mode?: DiagnosticOverlayMode;
  isTaskReady?: boolean;
  requestStartedAt?: number | null;
  minWaitMs?: number;
  statusTitle?: string;
  statusSub?: string;
  onClose?: () => void;
  onTransitionComplete?: () => void;
  onReadyToEnterExam?: (examRoomUrl: string, liveExam: PracticeExamPackage) => void;
}

const ANIM_CONFIG = {
  ORBIT_PERIOD_SEC: 44,
  LAUNCH_SPEED_MULT: 10,
  BEAMS_IN_MS: 220,
  BEAMS_RETRACT_MS: 210,
};

interface WireframeSubjectDef {
  key: string;
  title: string;
  angle: number;
  accent: boolean;
  svg: React.ReactNode;
}

const WIREFRAME_SUBJECTS: WireframeSubjectDef[] = [
  {
    key: 'toan',
    title: 'Toán Học',
    angle: 0,
    accent: true,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 4H7l6 8-6 8h11" />
      </svg>
    ),
  },
  {
    key: 'van',
    title: 'Ngữ Văn',
    angle: 30,
    accent: false,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="1.5" />
      </svg>
    ),
  },
  {
    key: 'anh',
    title: 'Tiếng Anh',
    angle: 60,
    accent: true,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 8 6 6" />
        <path d="m4 14 6-6 2-3" />
        <path d="M2 5h12" />
        <path d="M7 2h1" />
        <path d="m22 22-5-10-5 10" />
        <path d="M14 18h6" />
      </svg>
    ),
  },
  {
    key: 'ly',
    title: 'Vật Lý',
    angle: 90,
    accent: false,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(45 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-45 12 12)" />
      </svg>
    ),
  },
  {
    key: 'hoa',
    title: 'Hóa Học',
    angle: 120,
    accent: true,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2.5 20.2 7.25 20.2 16.75 12 21.5 3.8 16.75 3.8 7.25" />
        <circle cx="12" cy="12" r="4.2" />
      </svg>
    ),
  },
  {
    key: 'sinh',
    title: 'Sinh Học',
    angle: 150,
    accent: false,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4c5 0 5 16 10 16s5-16 6-16" />
        <path d="M20 20c-5 0-5-16-10-16s-5 16-6 16" />
        <line x1="7" y1="8" x2="17" y2="8" />
        <line x1="7" y1="16" x2="17" y2="16" />
      </svg>
    ),
  },
  {
    key: 'su',
    title: 'Lịch Sử',
    angle: 180,
    accent: true,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="21" x2="21" y2="21" />
        <line x1="6" y1="18" x2="6" y2="10" />
        <line x1="10" y1="18" x2="10" y2="10" />
        <line x1="14" y1="18" x2="14" y2="10" />
        <line x1="18" y1="18" x2="18" y2="10" />
        <polygon points="12 3 20 8 4 8" />
      </svg>
    ),
  },
  {
    key: 'dia',
    title: 'Địa Lý',
    angle: 210,
    accent: false,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.5" />
        <line x1="2.5" y1="12" x2="21.5" y2="12" />
        <ellipse cx="12" cy="12" rx="4.5" ry="9.5" />
      </svg>
    ),
  },
  {
    key: 'tin',
    title: 'Tin Học',
    angle: 240,
    accent: true,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="8 7 3 12 8 17" />
        <polyline points="16 7 21 12 16 17" />
        <line x1="13.5" y1="5" x2="10.5" y2="19" />
      </svg>
    ),
  },
  {
    key: 'gdcd',
    title: 'GDKT & PL',
    angle: 270,
    accent: false,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="7" y1="21" x2="17" y2="21" />
        <path d="M4 7h16" />
        <path d="M4 7l-2 6h4l-2-6z" />
        <path d="M20 7l-2 6h4l-2-6z" />
      </svg>
    ),
  },
  {
    key: 'cn',
    title: 'Công Nghệ',
    angle: 300,
    accent: true,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L4 21" />
        <path d="M12 2l8 19" />
        <circle cx="12" cy="5.5" r="1.7" />
        <path d="M6.5 15a8 8 0 0 0 11 0" />
      </svg>
    ),
  },
  {
    key: 'khtn',
    title: 'KHTN',
    angle: 330,
    accent: false,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 3 21 19 3 19" />
        <line x1="2" y1="13" x2="8.5" y2="11" />
        <line x1="15.5" y1="11" x2="22" y2="9" />
        <line x1="16.5" y1="13" x2="22" y2="14" />
      </svg>
    ),
  },
];

function resolveSubjectKey(slug: string): string {
  const s = (slug || '').toLowerCase();
  if (s.includes('tin')) return 'tin';
  if (s.includes('ly')) return 'ly';
  if (s.includes('hoa')) return 'hoa';
  if (s.includes('sinh')) return 'sinh';
  if (s.includes('van')) return 'van';
  if (s.includes('anh')) return 'anh';
  if (s.includes('su')) return 'su';
  if (s.includes('dia')) return 'dia';
  if (s.includes('gdcd') || s.includes('gdkt')) return 'gdcd';
  if (s.includes('cong-nghe')) return 'cn';
  if (s.includes('tu-nhien')) return 'khtn';
  return 'toan';
}

function getCurrentRotationDeg(el: HTMLElement | null): number {
  if (!el) return 0;
  const st = window.getComputedStyle(el).transform;
  if (!st || st === 'none') return 0;
  const m = new DOMMatrix(st);
  const deg = Math.atan2(m.b, m.a) * (180 / Math.PI);
  return ((deg % 360) + 360) % 360;
}

export function DiagnosticGateOverlay({
  isOpen,
  subjectSlug,
  subjectName,
  grade,
  mode = 'GATE',
  isTaskReady = false,
  requestStartedAt,
  minWaitMs,
  statusTitle,
  statusSub,
  onClose,
  onTransitionComplete,
  onReadyToEnterExam,
}: DiagnosticGateOverlayProps) {
  const resolvedMinWaitMs = minWaitMs ?? (mode === 'SUBMIT_LOADING' ? 2000 : 3000);
  const router = useRouter();
  const activeKey = React.useMemo(() => resolveSubjectKey(subjectSlug), [subjectSlug]);
  const activeSubjectDef = React.useMemo(
    () => WIREFRAME_SUBJECTS.find((s) => s.key === activeKey) || WIREFRAME_SUBJECTS[0],
    [activeKey],
  );

  const rootRef = React.useRef<HTMLDivElement>(null);
  const wipeLayerRef = React.useRef<HTMLDivElement>(null);
  const preWipeRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const rotatorRef = React.useRef<HTMLDivElement>(null);
  const slotRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const glyphRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const mainPathRefs = React.useRef<Array<SVGPathElement | null>>([null, null, null, null]);
  const subPathRefs = React.useRef<Array<SVGPathElement | null>>([null, null, null, null]);
  const tipRefs = React.useRef<Array<SVGPolygonElement | null>>([null, null, null, null]);
  const origRefs = React.useRef<Array<SVGRectElement | null>>([null, null, null, null]);
  const arcRefs = React.useRef<Array<SVGPathElement | null>>([null, null, null, null]);
  const tickRefs = React.useRef<Array<SVGLineElement | null>>([null, null, null, null]);
  const reticleRef = React.useRef<SVGCircleElement>(null);
  const creatingStatusRef = React.useRef<HTMLDivElement>(null);
  const shockwaveRef = React.useRef<HTMLDivElement>(null);

  const [phase, setPhase] = React.useState<
    'idle' | 'launching' | 'zooming' | 'creating' | 'retracting' | 'imploding' | 'opened' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const timersRef = React.useRef<number[]>([]);
  const mountedRef = React.useRef(true);
  const beamsReadyRef = React.useRef(false);
  const fetchedExamRef = React.useRef<PracticeExamPackage | null>(null);
  const hasTriggeredFinishRef = React.useRef(false);
  const requestStartedAtRef = React.useRef<number>(Date.now());
  const isTaskReadyRef = React.useRef<boolean>(isTaskReady);
  const hasAutoLaunchedRef = React.useRef<boolean>(false);
  const beamGeomsRef = React.useRef<
    Array<{
      mainEl: SVGPathElement | null;
      mainLen: number;
      subEl: SVGPathElement | null;
      subLen: number;
    }>
  >([]);

  const clearAllTimers = React.useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Reset sạch sẽ nếu đóng/mở lại
  const resetVisualState = React.useCallback(() => {
    clearAllTimers();
    beamsReadyRef.current = false;
    fetchedExamRef.current = null;
    hasTriggeredFinishRef.current = false;
    hasAutoLaunchedRef.current = false;
    setPhase('idle');
    setErrorMessage(null);

    const rotator = rotatorRef.current;
    if (rotator) {
      rotator.style.transition = 'none';
      rotator.style.transform = '';
      rotator.style.animation = '';
    }
    Object.values(slotRefs.current).forEach((sl) => {
      if (!sl) return;
      sl.style.removeProperty('--target-rot');
      sl.style.transform = '';
      sl.style.transition = '';
    });
    Object.values(glyphRefs.current).forEach((wg) => {
      if (!wg) return;
      wg.style.transition = 'none';
      wg.style.transform = '';
      wg.style.animation = '';
    });
    mainPathRefs.current.forEach((el) => {
      if (!el) return;
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.strokeDashoffset = '';
    });
    subPathRefs.current.forEach((el) => {
      if (!el) return;
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.strokeDashoffset = '';
    });
    if (preWipeRef.current) {
      preWipeRef.current.style.transition = 'none';
      preWipeRef.current.style.opacity = '1';
    }
  }, [clearAllTimers]);

  React.useEffect(() => {
    if (!isOpen) {
      resetVisualState();
      return;
    }
    if (mode === 'GATE') {
      router.prefetch(
        `/student/practice/exam-room?subject=${subjectSlug}&level=assessment&grade=${grade}&chapter=1&format=quiz&duration=15&quizCount=12&count=12&practiceMode=ASSESSMENT`,
      );
    }
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [grade, isOpen, mode, resetVisualState, router, subjectSlug]);

  const computeCornerGeometry = React.useCallback(() => {
    const rootEl = rootRef.current;
    const wipeEl = wipeLayerRef.current;
    const stageEl = stageRef.current;
    const activeGlyph = glyphRefs.current[activeKey];
    if (!rootEl || !wipeEl || !stageEl) return { cx: 0, cy: 0 };

    const layerRect = wipeEl.getBoundingClientRect();
    const overlayRect = rootEl.getBoundingClientRect();
    const centerRect = activeGlyph ? activeGlyph.getBoundingClientRect() : stageEl.getBoundingClientRect();

    const cx = centerRect.left - layerRect.left + centerRect.width / 2;
    const cy = centerRect.top - layerRect.top + centerRect.height / 2;
    const radius =
      parseFloat(getComputedStyle(rootEl).getPropertyValue('--center-ring-radius')) || 80;
    const rLock = radius + 12;

    if (shockwaveRef.current) {
      shockwaveRef.current.style.left = `${cx}px`;
      shockwaveRef.current.style.top = `${cy}px`;
    }
    if (creatingStatusRef.current) {
      creatingStatusRef.current.style.left = `${cx}px`;
      creatingStatusRef.current.style.top = `${cy + radius + 28}px`;
    }

    const x0 = overlayRect.left - layerRect.left;
    const y0 = overlayRect.top - layerRect.top;
    const x1 = overlayRect.right - layerRect.left;
    const y1 = overlayRect.bottom - layerRect.top;
    const minDim = Math.min(layerRect.width, layerRect.height);
    const edgePad = Math.max(16, Math.min(44, minDim * 0.045));

    if (reticleRef.current) {
      reticleRef.current.setAttribute('cx', cx.toFixed(1));
      reticleRef.current.setAttribute('cy', cy.toFixed(1));
      reticleRef.current.setAttribute('r', (radius + 22).toFixed(1));
    }

    const buildArcD = (angStart: number, angEnd: number) => {
      const r1 = (angStart * Math.PI) / 180;
      const r2 = (angEnd * Math.PI) / 180;
      const ax1 = cx + rLock * Math.cos(r1);
      const ay1 = cy + rLock * Math.sin(r1);
      const ax2 = cx + rLock * Math.cos(r2);
      const ay2 = cy + rLock * Math.sin(r2);
      return `M ${ax1.toFixed(1)} ${ay1.toFixed(1)} A ${rLock.toFixed(1)} ${rLock.toFixed(1)} 0 0 1 ${ax2.toFixed(1)} ${ay2.toFixed(1)}`;
    };

    [-135, -45, 45, 135].forEach((ang, idx) => {
      const arcEl = arcRefs.current[idx];
      if (arcEl) {
        arcEl.setAttribute('d', buildArcD(ang - 18, ang + 18));
      }
    });

    [0, 90, 180, 270].forEach((ang, idx) => {
      const tickEl = tickRefs.current[idx];
      if (tickEl) {
        const rad = (ang * Math.PI) / 180;
        tickEl.setAttribute('x1', (cx + (radius + 6) * Math.cos(rad)).toFixed(1));
        tickEl.setAttribute('y1', (cy + (radius + 6) * Math.sin(rad)).toFixed(1));
        tickEl.setAttribute('x2', (cx + (radius + 17) * Math.cos(rad)).toFixed(1));
        tickEl.setAttribute('y2', (cy + (radius + 17) * Math.sin(rad)).toFixed(1));
      }
    });

    const cornerSigns: Array<[number, number]> = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ];
    const invSqrt2 = Math.SQRT1_2;

    beamGeomsRef.current = cornerSigns.map(([sx, sy], idx) => {
      const ex = cx + sx * rLock * invSqrt2;
      const ey = cy + sy * rLock * invSqrt2;

      const maxYDist = Math.max(46, Math.abs((sy < 0 ? y0 + edgePad : y1 - edgePad) - cy));
      const halfW = Math.abs((sx < 0 ? x0 + edgePad : x1 - edgePad) - cx);
      const maxXDist = Math.max(46, layerRect.width < 640 ? halfW - 22 : halfW * 0.62);
      const diagOffset = Math.max(rLock * invSqrt2 + 26, Math.min(maxXDist, maxYDist));

      const bx = cx + sx * diagOffset;
      const by = cy + sy * diagOffset;
      const edgeX = sx < 0 ? x0 + edgePad : x1 - edgePad;
      const ax = Math.abs(edgeX - cx) > diagOffset + 18 ? edgeX : cx + sx * (diagOffset + 18);

      const mainPathD = `M ${ax.toFixed(1)} ${by.toFixed(1)} L ${bx.toFixed(1)} ${by.toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)}`;

      // Đường phụ song song cách đều chính xác 9px ở cả đoạn ngang và đoạn chéo 45°
      const subGap = 9;
      const subAx = ax - sx * 6;
      const subBy = by - sy * subGap;
      const subBx = bx - sx * subGap * (Math.SQRT2 + 1);
      const subDiag = Math.max(16, (diagOffset - rLock * invSqrt2 - 22) * 0.72);
      const subEx = subBx - sx * subDiag;
      const subEy = subBy - sy * subDiag;
      const subPathD = `M ${subAx.toFixed(1)} ${subBy.toFixed(1)} L ${subBx.toFixed(1)} ${subBy.toFixed(1)} L ${subEx.toFixed(1)} ${subEy.toFixed(1)}`;

      const mainEl = mainPathRefs.current[idx];
      let mainLen = 200;
      if (mainEl) {
        mainEl.setAttribute('d', mainPathD);
        mainLen = Math.max(40, mainEl.getTotalLength());
        mainEl.style.transition = 'none';
        mainEl.style.strokeDasharray = String(mainLen);
        mainEl.style.strokeDashoffset = String(mainLen);
        mainEl.style.opacity = '0';
      }

      const subEl = subPathRefs.current[idx];
      let subLen = 140;
      if (subEl) {
        subEl.setAttribute('d', subPathD);
        subLen = Math.max(30, subEl.getTotalLength());
        subEl.style.transition = 'none';
        subEl.style.strokeDasharray = String(subLen);
        subEl.style.strokeDashoffset = String(subLen);
        subEl.style.opacity = '0';
      }

      const tipEl = tipRefs.current[idx];
      if (tipEl) {
        const rTip = 4.5;
        tipEl.setAttribute(
          'points',
          `${ex.toFixed(1)},${(ey - rTip).toFixed(1)} ${(ex + rTip).toFixed(1)},${ey.toFixed(1)} ${ex.toFixed(1)},${(ey + rTip).toFixed(1)} ${(ex - rTip).toFixed(1)},${ey.toFixed(1)}`,
        );
      }

      const origEl = origRefs.current[idx];
      if (origEl) {
        origEl.setAttribute('x', (ax - 3).toFixed(1));
        origEl.setAttribute('y', (by - 3).toFixed(1));
      }

      return { mainEl, mainLen, subEl, subLen };
    });

    return { cx, cy };
  }, [activeKey]);

  const tryFinishAndRevealExam = React.useCallback(() => {
    if (!mountedRef.current || hasTriggeredFinishRef.current) return;
    if (!beamsReadyRef.current) return;

    const backendReady =
      mode === 'GATE' ? Boolean(fetchedExamRef.current) : Boolean(isTaskReadyRef.current);
    if (!backendReady) return;

    // Đảm bảo tối thiểu resolvedMinWaitMs (3000ms khi tạo đề, 2000ms khi nộp bài) tính từ lúc gửi request về BE để giảm tải cho server
    const elapsed = Date.now() - requestStartedAtRef.current;
    if (elapsed < resolvedMinWaitMs) {
      const waitTimer = window.setTimeout(() => {
        if (!mountedRef.current) return;
        tryFinishAndRevealExam();
      }, resolvedMinWaitMs - elapsed);
      timersRef.current.push(waitTimer);
      return;
    }

    hasTriggeredFinishRef.current = true;
    const liveExam = fetchedExamRef.current;

    let examRoomUrl = '';
    if (mode === 'GATE' && liveExam) {
      const computedExamId = `exam-${subjectSlug}-assessment-g${grade}-ch1-quiz-topic-all-12`;
      examRoomUrl = `/student/practice/exam-room?subject=${subjectSlug}&level=assessment&grade=${grade}&chapter=1&format=quiz&duration=15&quizCount=12&count=12&practiceMode=ASSESSMENT`;
      try {
        sessionStorage.setItem(`schoolify_preloaded_exam_${computedExamId}`, JSON.stringify(liveExam));
        sessionStorage.setItem(`schoolify_started_pts_${computedExamId}`, '1');
      } catch {}
    }

    setPhase('retracting');

    // Pha 4a: Thu nhanh 4 cụm vector Valorant về vòng tròn
    beamGeomsRef.current.forEach((g) => {
      if (g.mainEl) {
        g.mainEl.style.transition = `stroke-dashoffset ${ANIM_CONFIG.BEAMS_RETRACT_MS}ms cubic-bezier(0.55, 0, 0.9, 0.45), opacity 90ms ease ${ANIM_CONFIG.BEAMS_RETRACT_MS - 70}ms`;
        g.mainEl.style.strokeDashoffset = String(-g.mainLen);
        g.mainEl.style.opacity = '0';
      }
      if (g.subEl) {
        const subDur = Math.max(120, ANIM_CONFIG.BEAMS_RETRACT_MS - 40);
        g.subEl.style.transition = `stroke-dashoffset ${subDur}ms cubic-bezier(0.55, 0, 0.9, 0.45), opacity 80ms ease ${Math.max(60, ANIM_CONFIG.BEAMS_RETRACT_MS - 100)}ms`;
        g.subEl.style.strokeDashoffset = String(-g.subLen);
        g.subEl.style.opacity = '0';
      }
    });

    // Nén nhẹ vòng tròn trung tâm ngay khi 4 đường vừa rút hết vào
    const implodeTimer = window.setTimeout(() => {
      if (!mountedRef.current) return;
      setPhase('imploding');
    }, ANIM_CONFIG.BEAMS_RETRACT_MS - 30);
    timersRef.current.push(implodeTimer);

    // Pha 4b: Bung sóng Iris đồng thời chuyển sang màn hình kế tiếp
    const openTimer = window.setTimeout(() => {
      if (!mountedRef.current) return;
      computeCornerGeometry();
      if (preWipeRef.current) {
        preWipeRef.current.style.transition = 'opacity 180ms ease';
        preWipeRef.current.style.opacity = '0';
      }
      setPhase('opened');
      if (mode === 'GATE' && liveExam && onReadyToEnterExamRef.current) {
        onReadyToEnterExamRef.current(examRoomUrl, liveExam);
      } else {
        onTransitionCompleteRef.current?.();
      }
    }, ANIM_CONFIG.BEAMS_RETRACT_MS + 60);
    timersRef.current.push(openTimer);
  }, [
    computeCornerGeometry,
    grade,
    resolvedMinWaitMs,
    mode,
    subjectSlug,
  ]);

  const onReadyToEnterExamRef = React.useRef(onReadyToEnterExam);
  const onTransitionCompleteRef = React.useRef(onTransitionComplete);
  React.useEffect(() => {
    onReadyToEnterExamRef.current = onReadyToEnterExam;
    onTransitionCompleteRef.current = onTransitionComplete;
  }, [onReadyToEnterExam, onTransitionComplete]);

  const runVisualLockSequence = React.useCallback(() => {
    const rotator = rotatorRef.current;
    const targetSlot = slotRefs.current[activeKey];
    if (!rotator || !targetSlot) return;

    // Đo góc hiện tại của vòng quay & giữ tất cả 12 glyph đứng thẳng
    const currentRot = getCurrentRotationDeg(rotator);
    rotator.style.animation = 'none';
    rotator.style.transform = `rotate(${currentRot}deg)`;

    const glyphStates: Array<{ el: HTMLDivElement; deg: number }> = [];
    Object.values(glyphRefs.current).forEach((wg) => {
      if (!wg) return;
      const gDeg = getCurrentRotationDeg(wg);
      wg.style.animation = 'none';
      wg.style.transform = `rotate(${gDeg}deg)`;
      glyphStates.push({ el: wg, deg: gDeg });
    });

    const baseAngle = activeSubjectDef.angle;
    const screenAngle = (((currentRot + baseAngle) % 360) + 360) % 360;
    const shortestDelta = ((0 - screenAngle + 540) % 360) - 180;
    const targetRot = currentRot + shortestDelta;

    const idleDegPerMs = 360 / (ANIM_CONFIG.ORBIT_PERIOD_SEC * 1000);
    const launchDegPerMs = idleDegPerMs * ANIM_CONFIG.LAUNCH_SPEED_MULT;
    const rotateMs = Math.max(220, Math.round(Math.abs(shortestDelta) / launchDegPerMs));

    void rotator.offsetHeight;

    // Pha 1: Xoay cung ngắn nhất lên 12h với vận tốc 10x
    setPhase('launching');
    rotator.style.transition = `transform ${rotateMs}ms linear`;
    rotator.style.transform = `rotate(${targetRot}deg)`;

    glyphStates.forEach((st) => {
      st.el.style.transition = `transform ${rotateMs}ms linear`;
      st.el.style.transform = `rotate(${st.deg - shortestDelta}deg)`;
    });

    // Pha 2: Chạm 12h -> vào tâm phóng to GIỮ NGUYÊN vòng tròn
    const phase2At = rotateMs + 20;
    const p2Timer = window.setTimeout(() => {
      if (!mountedRef.current) return;
      targetSlot.style.setProperty('--target-rot', `${baseAngle}deg`);
      setPhase('zooming');
    }, phase2At);
    timersRef.current.push(p2Timer);

    // Pha 3: Sau khi vòng tròn vào hẳn tâm (460ms) -> 4 cánh tay gãy khúc Valorant phóng từ 4 góc khóa lấy vòng tròn
    const phase3At = phase2At + 460;
    const p3Timer = window.setTimeout(() => {
      if (!mountedRef.current) return;
      computeCornerGeometry();
      void wipeLayerRef.current?.getBoundingClientRect();

      beamGeomsRef.current.forEach((g) => {
        if (g.mainEl) {
          g.mainEl.style.opacity = '1';
          g.mainEl.style.transition = `stroke-dashoffset ${ANIM_CONFIG.BEAMS_IN_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`;
          g.mainEl.style.strokeDashoffset = '0';
        }
        if (g.subEl) {
          g.subEl.style.opacity = '1';
          g.subEl.style.transition = `stroke-dashoffset ${ANIM_CONFIG.BEAMS_IN_MS + 40}ms cubic-bezier(0.16, 1, 0.3, 1) 40ms`;
          g.subEl.style.strokeDashoffset = '0';
        }
      });

      const contactTimer = window.setTimeout(() => {
        if (!mountedRef.current) return;
        setPhase((prev) => (prev === 'error' ? 'error' : 'creating'));
        const lockBeatTimer = window.setTimeout(() => {
          if (!mountedRef.current) return;
          beamsReadyRef.current = true;
          tryFinishAndRevealExam();
        }, 160);
        timersRef.current.push(lockBeatTimer);
      }, ANIM_CONFIG.BEAMS_IN_MS);
      timersRef.current.push(contactTimer);
    }, phase3At);
    timersRef.current.push(p3Timer);
  }, [activeKey, activeSubjectDef.angle, computeCornerGeometry, tryFinishAndRevealExam]);

  const runVisualLockSequenceRef = React.useRef(runVisualLockSequence);
  React.useEffect(() => {
    runVisualLockSequenceRef.current = runVisualLockSequence;
  }, [runVisualLockSequence]);

  // Đồng bộ isTaskReady từ prop cho GENERATE_LOADING & SUBMIT_LOADING
  React.useEffect(() => {
    isTaskReadyRef.current = Boolean(isTaskReady);
    if (isOpen && mode !== 'GATE' && isTaskReady) {
      tryFinishAndRevealExam();
    }
  }, [isOpen, isTaskReady, mode, tryFinishAndRevealExam]);

  // Đồng bộ requestStartedAt mỗi khi cập nhật
  React.useEffect(() => {
    if (typeof requestStartedAt === 'number' && requestStartedAt > 0) {
      requestStartedAtRef.current = requestStartedAt;
    }
  }, [requestStartedAt]);

  // Tự động kích hoạt hiệu ứng ngay khi mở ở chế độ GENERATE_LOADING hoặc SUBMIT_LOADING
  React.useEffect(() => {
    if (!isOpen || mode === 'GATE' || hasAutoLaunchedRef.current) return;
    if (!requestStartedAtRef.current) {
      requestStartedAtRef.current = Date.now();
    }
    const rafId = window.requestAnimationFrame(() => {
      if (!mountedRef.current || hasAutoLaunchedRef.current) return;
      hasAutoLaunchedRef.current = true;
      runVisualLockSequenceRef.current();
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [isOpen, mode]);

  const handleStart = React.useCallback(() => {
    if (phase !== 'idle' && phase !== 'error') return;
    resetVisualState();
    requestStartedAtRef.current = Date.now();

    // 1. Gọi API sinh đề Đánh giá năng lực 12 câu / 15 phút thật song song với animation
    const examPromise = studentExamsService
      .generateMatrixExam({
        subjectSlug,
        grade,
        chapterId: 1,
        totalQuestions: 12,
        durationMinutes: 15,
        practiceMode: 'ASSESSMENT',
        level: 'ASSESSMENT',
        format: 'QUIZ',
      })
      .then((pkg) => {
        if (!mountedRef.current) return;
        if (!pkg || !Array.isArray(pkg.questions) || pkg.questions.length === 0) {
          throw new Error('Ngân hàng câu hỏi đang cập nhật, vui lòng thử lại.');
        }
        fetchedExamRef.current = pkg;
        tryFinishAndRevealExam();
      })
      .catch((err: any) => {
        if (!mountedRef.current) return;
        setErrorMessage(err?.message || 'Không thể khởi tạo đề đánh giá lúc này.');
        setPhase('error');
      });

    void examPromise;
    runVisualLockSequence();
  }, [grade, phase, resetVisualState, runVisualLockSequence, subjectSlug, tryFinishAndRevealExam]);

  const canExit = mode === 'GATE' && Boolean(onClose) && (phase === 'idle' || phase === 'error');

  React.useEffect(() => {
    if (!isOpen || !canExit || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canExit, isOpen, onClose]);

  if (!isOpen) return null;

  const isLaunchingPhase = phase !== 'idle' || mode !== 'GATE';
  const isZoomingPhase =
    phase === 'zooming' ||
    phase === 'creating' ||
    phase === 'retracting' ||
    phase === 'imploding' ||
    phase === 'opened' ||
    phase === 'error';
  const isLockedHud = phase === 'creating';
  const isRetractingHud = phase === 'retracting' || phase === 'imploding' || phase === 'opened';

  const resolvedTitle =
    statusTitle || (mode === 'SUBMIT_LOADING' ? 'Đang chấm điểm' : 'Đang tạo đề');
  const resolvedSub =
    statusSub ||
    (mode === 'SUBMIT_LOADING'
      ? `Đang đối chiếu đáp án và lưu kết quả môn ${subjectName}...`
      : mode === 'GENERATE_LOADING'
        ? `Đang tổng hợp đề thi môn ${subjectName} Lớp ${grade}...`
        : `Đang tổng hợp 12 câu đánh giá môn ${subjectName} Lớp ${grade}...`);

  return (
    <div
      ref={rootRef}
      className={styles.gateRoot}
      role="dialog"
      aria-modal="true"
      aria-labelledby="diagnostic-gate-heading"
    >
      {canExit && (
        <button
          type="button"
          onClick={onClose}
          data-testid="diagnostic-gate-exit-btn"
          aria-label="Thoát màn hình đánh giá năng lực"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 min-h-[44px] px-4 py-2 rounded-xl border border-[#00B8DD]/45 dark:border-[#5CE1FF]/40 bg-white/95 dark:bg-slate-900/90 hover:bg-[#00B8DD]/10 dark:hover:bg-[#00B8DD]/15 hover:border-[#00B8DD] text-[#009BBD] dark:text-[#5CE1FF] text-xs font-bold inline-flex items-center gap-1.5 shadow-[0_6px_20px_rgba(0,184,221,0.16)] ring-1 ring-[#00B8DD]/15 transition-all cursor-pointer backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD]"
        >
          <X className="w-4 h-4" />
          <span>Thoát</span>
        </button>
      )}
      <div ref={wipeLayerRef} className={styles.wipeLayer}>
        {/* 4 cụm đường vector gãy khúc kiểu Valorant hội tụ khóa lấy vòng tròn */}
        <svg
          className={cn(
            styles.cornerBeamsSvg,
            isLockedHud && styles.cornerBeamsSvgLocked,
            isRetractingHud && styles.cornerBeamsSvgRetracting,
          )}
          aria-hidden="true"
        >
          <g>
            {[0, 1, 2, 3].map((idx) => (
              <React.Fragment key={idx}>
                <path
                  ref={(el) => {
                    mainPathRefs.current[idx] = el;
                  }}
                  className={styles.valRailMain}
                />
                <path
                  ref={(el) => {
                    subPathRefs.current[idx] = el;
                  }}
                  className={styles.valRailSub}
                />
                <polygon
                  ref={(el) => {
                    tipRefs.current[idx] = el;
                  }}
                  className={styles.valHudNode}
                />
                <rect
                  ref={(el) => {
                    origRefs.current[idx] = el;
                  }}
                  className={styles.valHudAccent}
                  width="6"
                  height="6"
                />
              </React.Fragment>
            ))}
          </g>
          <g className={styles.valCenterHud}>
            <circle ref={reticleRef} className={styles.valReticleRing} />
            {[0, 1, 2, 3].map((idx) => (
              <path
                key={`arc-${idx}`}
                ref={(el) => {
                  arcRefs.current[idx] = el;
                }}
                className={styles.valLockArc}
              />
            ))}
            {[0, 1, 2, 3].map((idx) => (
              <line
                key={`tick-${idx}`}
                ref={(el) => {
                  tickRefs.current[idx] = el;
                }}
                className={styles.valCrossTick}
              />
            ))}
          </g>
        </svg>

        {/* Chữ "Đang tạo đề..." phía dưới vòng tròn */}
        <div
          ref={creatingStatusRef}
          className={cn(
            styles.creatingStatus,
            (phase === 'creating' || phase === 'error') && styles.creatingStatusVisible,
          )}
          aria-live="polite"
        >
          {phase === 'error' ? (
            <div className="flex flex-col items-center gap-2 pointer-events-auto">
              <p className="text-sm font-bold text-rose-500">{errorMessage}</p>
              <button
                type="button"
                onClick={handleStart}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#00B8DD] hover:bg-[#009BBD] text-white text-xs font-bold cursor-pointer"
              >
                Thử tạo lại đề
              </button>
            </div>
          ) : (
            <>
              <div className={styles.creatingStatusTitle}>
                <span>{resolvedTitle}</span>
                <span className={styles.creatingDots} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
              <div className={styles.creatingStatusSub}>{resolvedSub}</div>
            </>
          )}
        </div>

        {/* Sóng Radial Iris Shockwave */}
        <div
          ref={shockwaveRef}
          className={cn(
            styles.portalShockwave,
            phase === 'opened' && styles.portalShockwaveBurst,
          )}
          aria-hidden="true"
        />

        {/* LỚP 1: Bot + Vòng tròn 12 wireframe icon */}
        <div ref={preWipeRef} className={styles.preWipeScene}>
          <div
            ref={stageRef}
            className={cn(
              styles.orbitalStage,
              isLaunchingPhase && styles.isLaunching,
              isZoomingPhase && styles.isZooming,
              phase === 'imploding' && styles.isImploding,
            )}
          >
            <div className={styles.orbitTrack} aria-hidden="true" />
            <div className={styles.orbitTrackOuter} aria-hidden="true" />
            <div
              className={cn(styles.iconFocusAura, isZoomingPhase && styles.iconFocusAuraOn)}
              aria-hidden="true"
            />

            <div ref={rotatorRef} className={styles.orbitRotator} aria-hidden="true">
              {WIREFRAME_SUBJECTS.map((subj) => {
                const isTarget = subj.key === activeKey && isLaunchingPhase;
                return (
                  <div
                    key={subj.key}
                    ref={(el) => {
                      slotRefs.current[subj.key] = el;
                    }}
                    className={cn(
                      styles.orbitSlot,
                      isTarget && styles.isTarget,
                      isTarget && isZoomingPhase && styles.zoomCenter,
                    )}
                    style={{ '--angle': `${subj.angle}deg` } as React.CSSProperties}
                  >
                    <div
                      ref={(el) => {
                        glyphRefs.current[subj.key] = el;
                      }}
                      className={cn(styles.wireGlyph, subj.accent && styles.wireGlyphAccent)}
                      title={subj.title}
                    >
                      <div className={styles.wireGlyphUpright}>{subj.svg}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {mode === 'GATE' && (
              <div className={styles.centerTrio}>
                <SchoolifyRobot size="xl" emotion="happy" />

                <h1 id="diagnostic-gate-heading" className={styles.headline}>
                  Làm ngay 1 bài test để đánh giá năng lực của bạn nhé!
                </h1>

                <div className={styles.ctaHaloWrap}>
                  <button type="button" onClick={handleStart} className={styles.startBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6Z" />
                    </svg>
                    <span>Bắt đầu</span>
                    <svg
                      className={styles.arrowIco}
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const ExamTransitionOverlay = DiagnosticGateOverlay;
