'use client';

import * as React from 'react';
import { motion, useDragControls } from 'framer-motion';
import {
  Calculator as CalcIcon,
  X,
  Minus,
  Copy,
  Check,
  History,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Move,
  Volume2,
  VolumeX,
  Grid,
  Hash,
  Table as TableIcon,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { CasioModel, AngleUnit, CASIO_MODELS, CalculationHistoryItem } from './casio-types';
import { evaluateCasioExpression, formatCasioNumber, decimalToFraction, playCasioKeyClick } from './casio-engine';
import {
  solveQuadratic,
  solveCubic,
  solveSystem2,
  solveSystem3,
  solveSystem4,
  solveInequalityQuadratic,
  EquationSolution,
} from './solvers/equation-solver';
import { generateCasioTable, TableRow } from './solvers/table-generator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export type CasioMode =
  | 'COMP'              // 1: Tính toán thông thường
  | 'MENU_GRID'         // Màn hình chọn Menu 1-9, A, B
  | 'EQN_TYPE_SELECT'   // Menu 9: Chọn Hệ PT hay Đa thức
  | 'SIMULT_UNKNOWN'    // Menu 9-1: Chọn số ẩn 2, 3, 4
  | 'SIMULT_INPUT'      // Menu 9-1: Nhập hệ số ma trận
  | 'POLY_DEGREE'       // Menu 9-2: Chọn bậc 2, 3, 4
  | 'POLY_INPUT'        // Menu 9-2: Nhập hệ số đa thức
  | 'EQN_RESULT'        // Menu 9: Màn hình hiển thị nghiệm
  | 'TABLE_FX_INPUT'    // Menu 8: Nhập f(x)
  | 'TABLE_RANGE_INPUT' // Menu 8: Nhập Start, End, Step
  | 'TABLE_VIEW'        // Menu 8: Xem bảng giá trị
  | 'INEQ_FORM_SELECT'  // Menu A: Chọn dạng BPT >, <, >=, <=
  | 'INEQ_INPUT'        // Menu A: Nhập hệ số BPT
  | 'INEQ_RESULT';      // Menu A: Hiển thị khoảng nghiệm

export function CasioCalculatorWidget() {
  const [mounted, setMounted] = React.useState<boolean>(false);
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    try {
      if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('casio') === 'open') {
        setIsOpen(true);
      }
    } catch {}

    const handleCustomOpen = () => setIsOpen(true);
    window.addEventListener('schoolify:open-calculator', handleCustomOpen);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('schoolify:open-calculator', handleCustomOpen);
    };
  }, []);

  // UI state
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [activeModel, setActiveModel] = React.useState<CasioModel>('FX580VN_X');
  const [angleUnit, setAngleUnit] = React.useState<AngleUnit>('DEG');
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(true);
  const [activeMode, setActiveMode] = React.useState<CasioMode>('COMP');

  // Input & evaluation state for COMP mode
  const [expression, setExpression] = React.useState<string>('');
  const [cursorPos, setCursorPos] = React.useState<number>(0);
  const [result, setResult] = React.useState<string>('0');
  const [fractionResult, setFractionResult] = React.useState<string | null>(null);
  const [showingFraction, setShowingFraction] = React.useState<boolean>(false);
  const [lastAns, setLastAns] = React.useState<number>(0);
  const [isShiftActive, setIsShiftActive] = React.useState<boolean>(false);
  const [isAlphaActive, setIsAlphaActive] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Variables (A, B, C, D, E, F, x, y, M)
  const [variables, setVariables] = React.useState<Record<string, number>>({
    A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, x: 0, y: 0, M: 0,
  });
  const [isStoreMode, setIsStoreMode] = React.useState<boolean>(false);

  // ── EQUATION SOLVER STATE (MENU 9) ──
  const [polyDegree, setPolyDegree] = React.useState<2 | 3 | 4>(2);
  const [polyCoeffs, setPolyCoeffs] = React.useState<string[]>(['', '', '']);
  const [polyActiveIdx, setPolyActiveIdx] = React.useState<number>(0);

  const [simultCount, setSimultCount] = React.useState<2 | 3 | 4>(2);
  const [simultMatrix, setSimultMatrix] = React.useState<string[][]>([
    ['', '', ''],
    ['', '', ''],
  ]);
  const [simultActiveCell, setSimultActiveCell] = React.useState<{ r: number; c: number }>({ r: 0, c: 0 });

  const [eqnSolution, setEqnSolution] = React.useState<EquationSolution | null>(null);
  const [eqnResultIdx, setEqnResultIdx] = React.useState<number>(0);
  const [showExtremum, setShowExtremum] = React.useState<boolean>(false);

  // ── TABLE f(x) STATE (MENU 8) ──
  const [tableFx, setTableFx] = React.useState<string>('x^2 - 4');
  const [tableStart, setTableStart] = React.useState<string>('-3');
  const [tableEnd, setTableEnd] = React.useState<string>('3');
  const [tableStep, setTableStep] = React.useState<string>('1');
  const [tableActiveField, setTableActiveField] = React.useState<'START' | 'END' | 'STEP'>('START');
  const [tableRows, setTableRows] = React.useState<TableRow[]>([]);
  const [tableRowIdx, setTableRowIdx] = React.useState<number>(0);

  // ── INEQUALITY STATE (MENU A) ──
  const [ineqType, setIneqType] = React.useState<1 | 2 | 3 | 4>(1); // 1: >, 2: <, 3: >=, 4: <=
  const [ineqCoeffs, setIneqCoeffs] = React.useState<string[]>(['', '', '']);
  const [ineqActiveIdx, setIneqActiveIdx] = React.useState<number>(0);
  const [ineqSolutionStr, setIneqSolutionStr] = React.useState<string>('');

  // History state
  const [history, setHistory] = React.useState<CalculationHistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState<number>(-1);
  const [showHistoryModal, setShowHistoryModal] = React.useState<boolean>(false);
  const [copied, setCopied] = React.useState<boolean>(false);

  // Drag tracking to distinguish click vs drag on FAB
  const dragMovedRef = React.useRef<boolean>(false);
  const windowDragControls = useDragControls();
  const currentConfig = CASIO_MODELS[activeModel];

  // Key audio feedback
  const triggerClickFeedback = React.useCallback(() => {
    if (soundEnabled) {
      playCasioKeyClick(0.05);
    }
  }, [soundEnabled]);

  // ─────────────────────────────────────────────────────────────
  // INPUT HANDLER DISPATCHER (Depending on active mode)
  // ─────────────────────────────────────────────────────────────
  const insertToken = React.useCallback((token: string) => {
    triggerClickFeedback();
    setErrorMessage(null);

    if (activeMode === 'COMP') {
      setExpression((prev) => {
        const before = prev.slice(0, cursorPos);
        const after = prev.slice(cursorPos);
        return before + token + after;
      });
      setCursorPos((prev) => prev + token.length);
      setIsShiftActive(false);
      setIsAlphaActive(false);
    } else if (activeMode === 'POLY_INPUT') {
      setPolyCoeffs((prev) => {
        const next = [...prev];
        next[polyActiveIdx] = (next[polyActiveIdx] || '') + token;
        return next;
      });
    } else if (activeMode === 'SIMULT_INPUT') {
      setSimultMatrix((prev) => {
        const next = prev.map((row) => [...row]);
        next[simultActiveCell.r][simultActiveCell.c] =
          (next[simultActiveCell.r][simultActiveCell.c] || '') + token;
        return next;
      });
    } else if (activeMode === 'TABLE_FX_INPUT') {
      setTableFx((prev) => prev + token);
    } else if (activeMode === 'TABLE_RANGE_INPUT') {
      if (tableActiveField === 'START') setTableStart((prev) => prev + token);
      else if (tableActiveField === 'END') setTableEnd((prev) => prev + token);
      else if (tableActiveField === 'STEP') setTableStep((prev) => prev + token);
    } else if (activeMode === 'INEQ_INPUT') {
      setIneqCoeffs((prev) => {
        const next = [...prev];
        next[ineqActiveIdx] = (next[ineqActiveIdx] || '') + token;
        return next;
      });
    } else if (activeMode === 'MENU_GRID') {
      // Direct keyboard selection in Menu
      if (token === '1') setActiveMode('COMP');
      else if (token === '8') setActiveMode('TABLE_FX_INPUT');
      else if (token === '9') setActiveMode('EQN_TYPE_SELECT');
      else if (token === 'A' || token === 'a') setActiveMode('INEQ_FORM_SELECT');
    }
  }, [activeMode, cursorPos, polyActiveIdx, simultActiveCell, tableActiveField, ineqActiveIdx, triggerClickFeedback]);

  // Handle variable selection (or STO into variable)
  const handleVariablePress = React.useCallback((varName: string) => {
    triggerClickFeedback();
    if (isStoreMode) {
      const currentNum = parseFloat(result.replace(/,/g, '')) || 0;
      setVariables((prev) => ({ ...prev, [varName]: currentNum }));
      setIsStoreMode(false);
      toast.success(`Đã lưu ${currentNum} vào biến ${varName}`);
    } else {
      insertToken(varName);
    }
  }, [isStoreMode, result, insertToken, triggerClickFeedback]);

  // Backspace / DEL
  const handleDelete = React.useCallback(() => {
    triggerClickFeedback();
    setErrorMessage(null);

    if (activeMode === 'COMP') {
      if (cursorPos === 0) return;
      setExpression((prev) => {
        const before = prev.slice(0, cursorPos - 1);
        const after = prev.slice(cursorPos);
        return before + after;
      });
      setCursorPos((prev) => Math.max(0, prev - 1));
    } else if (activeMode === 'POLY_INPUT') {
      setPolyCoeffs((prev) => {
        const next = [...prev];
        next[polyActiveIdx] = (next[polyActiveIdx] || '').slice(0, -1);
        return next;
      });
    } else if (activeMode === 'SIMULT_INPUT') {
      setSimultMatrix((prev) => {
        const next = prev.map((row) => [...row]);
        next[simultActiveCell.r][simultActiveCell.c] = (next[simultActiveCell.r][simultActiveCell.c] || '').slice(0, -1);
        return next;
      });
    } else if (activeMode === 'TABLE_FX_INPUT') {
      setTableFx((prev) => prev.slice(0, -1));
    } else if (activeMode === 'INEQ_INPUT') {
      setIneqCoeffs((prev) => {
        const next = [...prev];
        next[ineqActiveIdx] = (next[ineqActiveIdx] || '').slice(0, -1);
        return next;
      });
    }
  }, [activeMode, cursorPos, polyActiveIdx, simultActiveCell, triggerClickFeedback]);

  // All Clear / AC / ON
  const handleAllClear = React.useCallback(() => {
    triggerClickFeedback();
    if (activeMode === 'MENU_GRID' || activeMode === 'EQN_RESULT' || activeMode === 'TABLE_VIEW' || activeMode === 'INEQ_RESULT') {
      setActiveMode('COMP');
    } else if (activeMode === 'POLY_INPUT' || activeMode === 'SIMULT_INPUT' || activeMode === 'INEQ_INPUT') {
      // Clear active cell or return to type select
      setActiveMode('COMP');
    } else {
      setExpression('');
      setCursorPos(0);
      setResult('0');
      setFractionResult(null);
      setShowingFraction(false);
      setErrorMessage(null);
      setIsShiftActive(false);
      setIsAlphaActive(false);
      setIsStoreMode(false);
      setHistoryIndex(-1);
    }
  }, [activeMode, triggerClickFeedback]);

  // Toggle Fraction S<=>D
  const handleToggleFraction = React.useCallback(() => {
    triggerClickFeedback();
    if (fractionResult) {
      setShowingFraction((prev) => !prev);
    } else {
      const num = parseFloat(result.replace(/,/g, ''));
      if (!isNaN(num)) {
        const frac = decimalToFraction(num);
        if (frac && frac.denominator > 1) {
          setFractionResult(`${frac.numerator}/${frac.denominator}`);
          setShowingFraction(true);
        }
      }
    }
  }, [fractionResult, result, triggerClickFeedback]);

  // Cycle Angle Unit
  const cycleAngleUnit = React.useCallback(() => {
    triggerClickFeedback();
    setAngleUnit((prev) => {
      if (prev === 'DEG') return 'RAD';
      if (prev === 'RAD') return 'GRA';
      return 'DEG';
    });
  }, [triggerClickFeedback]);

  // Execute COMP Evaluation
  const evaluateStandard = React.useCallback(() => {
    if (!expression.trim()) return;
    const evalRes = evaluateCasioExpression(expression, angleUnit, lastAns, variables);

    if (evalRes.success && evalRes.value !== undefined) {
      const numVal = evalRes.value;
      const formattedNum = formatCasioNumber(numVal);
      setResult(formattedNum);
      setLastAns(numVal);
      setFractionResult(evalRes.fractionStr || null);
      setShowingFraction(false);
      setErrorMessage(null);

      const newItem: CalculationHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        expression,
        result: formattedNum,
        timestamp: Date.now(),
      };
      setHistory((prev) => [newItem, ...prev.slice(0, 24)]);
      setHistoryIndex(-1);
    } else {
      setErrorMessage(evalRes.error || 'Syntax ERROR');
    }
  }, [expression, angleUnit, lastAns, variables]);

  // ─────────────────────────────────────────────────────────────
  // SOLVER EXECUTION: EQUATIONS, TABLE, INEQUALITIES
  // ─────────────────────────────────────────────────────────────

  // Solve Polynomial
  const executePolySolve = React.useCallback(() => {
    const nums = polyCoeffs.map((c) => parseFloat(c) || 0);
    if (polyDegree === 2) {
      const [a, b, c] = nums;
      const sol = solveQuadratic(a, b, c);
      setEqnSolution(sol);
      setEqnResultIdx(0);
      setShowExtremum(false);
      setActiveMode('EQN_RESULT');
    } else if (polyDegree === 3) {
      const [a, b, c, d] = nums;
      const sol = solveCubic(a, b, c, d);
      setEqnSolution(sol);
      setEqnResultIdx(0);
      setShowExtremum(false);
      setActiveMode('EQN_RESULT');
    }
  }, [polyCoeffs, polyDegree]);

  // Solve System of Equations
  const executeSimultSolve = React.useCallback(() => {
    if (simultCount === 2) {
      const a1 = parseFloat(simultMatrix[0][0]) || 0;
      const b1 = parseFloat(simultMatrix[0][1]) || 0;
      const c1 = parseFloat(simultMatrix[0][2]) || 0;
      const a2 = parseFloat(simultMatrix[1][0]) || 0;
      const b2 = parseFloat(simultMatrix[1][1]) || 0;
      const c2 = parseFloat(simultMatrix[1][2]) || 0;
      const sol = solveSystem2(a1, b1, c1, a2, b2, c2);
      setEqnSolution(sol);
      setEqnResultIdx(0);
      setActiveMode('EQN_RESULT');
    } else if (simultCount === 3) {
      const mat = simultMatrix.map((r) => r.map((c) => parseFloat(c) || 0));
      const sol = solveSystem3(mat);
      setEqnSolution(sol);
      setEqnResultIdx(0);
      setActiveMode('EQN_RESULT');
    } else if (simultCount === 4) {
      const mat = simultMatrix.map((r) => r.map((c) => parseFloat(c) || 0));
      const sol = solveSystem4(mat);
      setEqnSolution(sol);
      setEqnResultIdx(0);
      setActiveMode('EQN_RESULT');
    }
  }, [simultCount, simultMatrix]);

  // Generate Table
  const executeTableGenerate = React.useCallback(() => {
    const s = parseFloat(tableStart) || -5;
    const e = parseFloat(tableEnd) || 5;
    const stp = parseFloat(tableStep) || 1;
    const res = generateCasioTable(tableFx, s, e, stp);
    if (res.error) {
      toast.error(res.error);
    } else {
      setTableRows(res.rows);
      setTableRowIdx(0);
      setActiveMode('TABLE_VIEW');
    }
  }, [tableFx, tableStart, tableEnd, tableStep]);

  // Solve Inequality
  const executeIneqSolve = React.useCallback(() => {
    const a = parseFloat(ineqCoeffs[0]) || 0;
    const b = parseFloat(ineqCoeffs[1]) || 0;
    const c = parseFloat(ineqCoeffs[2]) || 0;
    const sol = solveInequalityQuadratic(a, b, c, ineqType);
    setIneqSolutionStr(sol);
    setActiveMode('INEQ_RESULT');
  }, [ineqCoeffs, ineqType]);

  // Master EQUALS "=" handler
  const handleCalculateOrAdvance = React.useCallback(() => {
    triggerClickFeedback();

    if (activeMode === 'COMP') {
      evaluateStandard();
    } else if (activeMode === 'POLY_INPUT') {
      // Advance to next coefficient or solve
      const maxIdx = polyDegree;
      if (polyActiveIdx < maxIdx) {
        setPolyActiveIdx((prev) => prev + 1);
      } else {
        executePolySolve();
      }
    } else if (activeMode === 'SIMULT_INPUT') {
      const totalCols = simultCount + 1;
      const { r, c } = simultActiveCell;
      if (c < totalCols - 1) {
        setSimultActiveCell({ r, c: c + 1 });
      } else if (r < simultCount - 1) {
        setSimultActiveCell({ r: r + 1, c: 0 });
      } else {
        executeSimultSolve();
      }
    } else if (activeMode === 'TABLE_FX_INPUT') {
      if (tableFx.trim()) {
        setActiveMode('TABLE_RANGE_INPUT');
        setTableActiveField('START');
      }
    } else if (activeMode === 'TABLE_RANGE_INPUT') {
      if (tableActiveField === 'START') {
        setTableActiveField('END');
      } else if (tableActiveField === 'END') {
        setTableActiveField('STEP');
      } else if (tableActiveField === 'STEP') {
        executeTableGenerate();
      }
    } else if (activeMode === 'INEQ_INPUT') {
      if (ineqActiveIdx < 2) {
        setIneqActiveIdx((prev) => prev + 1);
      } else {
        executeIneqSolve();
      }
    } else if (activeMode === 'EQN_RESULT') {
      // Cycle through roots or extrema
      if (eqnSolution && eqnSolution.roots.length > 0) {
        if (eqnResultIdx < eqnSolution.roots.length - 1) {
          setEqnResultIdx((p) => p + 1);
        } else if (eqnSolution.extremum && !showExtremum) {
          setShowExtremum(true);
        } else {
          setEqnResultIdx(0);
          setShowExtremum(false);
        }
      }
    }
  }, [
    activeMode,
    evaluateStandard,
    polyDegree,
    polyActiveIdx,
    executePolySolve,
    simultCount,
    simultActiveCell,
    executeSimultSolve,
    tableFx,
    tableActiveField,
    executeTableGenerate,
    ineqActiveIdx,
    executeIneqSolve,
    eqnSolution,
    eqnResultIdx,
    showExtremum,
    triggerClickFeedback,
  ]);

  // History Navigation
  const handleHistoryNav = React.useCallback((direction: 'UP' | 'DOWN') => {
    triggerClickFeedback();

    if (activeMode === 'COMP') {
      if (history.length === 0) return;
      if (direction === 'UP') {
        const nextIdx = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(nextIdx);
        setExpression(history[nextIdx].expression);
        setCursorPos(history[nextIdx].expression.length);
        setResult(history[nextIdx].result);
        setErrorMessage(null);
      } else {
        const prevIdx = historyIndex - 1;
        if (prevIdx < 0) {
          setHistoryIndex(-1);
          setExpression('');
          setCursorPos(0);
          setResult('0');
        } else {
          setHistoryIndex(prevIdx);
          setExpression(history[prevIdx].expression);
          setCursorPos(history[prevIdx].expression.length);
          setResult(history[prevIdx].result);
        }
        setErrorMessage(null);
      }
    } else if (activeMode === 'TABLE_VIEW') {
      if (direction === 'UP') {
        setTableRowIdx((prev) => Math.max(0, prev - 1));
      } else {
        setTableRowIdx((prev) => Math.min(tableRows.length - 1, prev + 1));
      }
    } else if (activeMode === 'EQN_RESULT') {
      handleCalculateOrAdvance();
    }
  }, [activeMode, history, historyIndex, tableRows.length, handleCalculateOrAdvance, triggerClickFeedback]);

  // Copy result to clipboard
  const handleCopyResult = React.useCallback(() => {
    triggerClickFeedback();
    let textToCopy = result;
    if (activeMode === 'EQN_RESULT' && eqnSolution && eqnSolution.roots[eqnResultIdx]) {
      textToCopy = `${eqnSolution.roots[eqnResultIdx].label} = ${eqnSolution.roots[eqnResultIdx].valueStr}`;
    } else if (activeMode === 'INEQ_RESULT') {
      textToCopy = ineqSolutionStr;
    } else if (showingFraction && fractionResult) {
      textToCopy = fractionResult;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success(`Đã sao chép: ${textToCopy}`);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [result, activeMode, eqnSolution, eqnResultIdx, ineqSolutionStr, showingFraction, fractionResult, triggerClickFeedback]);

  // Open Calculator
  const handleOpenCalculator = React.useCallback(() => {
    if (!dragMovedRef.current) {
      setIsOpen(true);
    }
  }, []);

  // Global event listener to open calculator from any component (e.g. exam room top bar)
  React.useEffect(() => {
    const handleGlobalOpen = () => setIsOpen(true);
    window.addEventListener('schoolify:open-calculator', handleGlobalOpen);
    return () => window.removeEventListener('schoolify:open-calculator', handleGlobalOpen);
  }, []);

  // Physical Keyboard Listener
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        insertToken(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        insertToken('.');
      } else if (e.key === '+') {
        e.preventDefault();
        insertToken('+');
      } else if (e.key === '-') {
        e.preventDefault();
        insertToken('−');
      } else if (e.key === '*') {
        e.preventDefault();
        insertToken('×');
      } else if (e.key === '/') {
        e.preventDefault();
        insertToken('÷');
      } else if (e.key === '(' || e.key === ')') {
        e.preventDefault();
        insertToken(e.key);
      } else if (e.key === '^') {
        e.preventDefault();
        insertToken('^');
      } else if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        insertToken('x');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculateOrAdvance();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Delete') {
        e.preventDefault();
        handleAllClear();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCursorPos((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCursorPos((prev) => Math.min(expression.length, prev + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleHistoryNav('UP');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleHistoryNav('DOWN');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (activeMode !== 'COMP') {
          setActiveMode('COMP');
        } else {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    insertToken,
    handleCalculateOrAdvance,
    handleDelete,
    handleAllClear,
    handleHistoryNav,
    activeMode,
    expression.length,
  ]);

  if (!mounted) return null;

  return (
    <>
      {/* Floating draggable FAB removed as requested */}

      {/* ─────────────────────────────────────────────────────────────
          2. EXPANDED CASIO SCIENTIFIC CALCULATOR WINDOW
          Full-screen on mobile (<640px), Floating window on desktop
          ───────────────────────────────────────────────────────────── */}
      {isOpen && (
        <motion.div
          drag={!isMobile}
          dragControls={isMobile ? undefined : windowDragControls}
          dragListener={false}
          dragMomentum={false}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'fixed z-[999999] bg-[#12151b] transition-colors duration-300',
            currentConfig.bodyBg,
            // Mobile (default): Full-screen modal, zero horizontal overflow, solid casing
            'inset-0 w-full h-[100dvh] max-h-[100dvh] rounded-none p-2',
            'pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]',
            'flex flex-col justify-between overflow-y-auto overflow-x-hidden border-none shadow-none',
            // Desktop (sm: >= 640px): Compact floating window
            'sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[410px] sm:h-auto sm:max-h-[94vh]',
            'sm:rounded-[32px] sm:p-3.5 sm:border sm:border-slate-700/80 sm:shadow-2xl sm:select-none',
            !isMobile && currentConfig.bezelBorder
          )}
        >
          {/* Subtle micro-dot surface texture (desktop only to save mobile GPU) */}
          <div
            className="hidden sm:block absolute inset-0 pointer-events-none opacity-20 rounded-[inherit] overflow-hidden"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 0)',
              backgroundSize: '8px 8px',
            }}
          />

          {/* ── AUTHENTIC CASIO FACEPLATE BRANDING & SOLAR PANEL (Sticky at top) ── */}
          <div
            onPointerDown={(e) => {
              if (!isMobile) {
                windowDragControls.start(e);
              }
            }}
            className={cn(
              'sticky top-0 z-30 bg-[#12151b] sm:bg-[#12151b]/95 sm:backdrop-blur-md pb-2 pt-1 border-b border-slate-700/60 select-none flex items-center justify-between w-full shrink-0',
              isMobile ? 'cursor-default' : 'cursor-grab active:cursor-grabbing touch-none'
            )}
          >
            {/* Left: Genuine Casio Logos */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black tracking-[0.2em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-sans">
                  CASIO
                </span>
                <span className="text-xs font-black text-cyan-400 tracking-tight font-mono">
                  {currentConfig.name}
                </span>
                <span className="italic text-[11px] font-black text-slate-300 tracking-wider hidden min-[360px]:inline">
                  CLASSWIZ
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-tight mt-0.5">
                <span className="px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700/80 truncate">
                  NATURAL-V.P.A.M.
                </span>
                <span className="text-amber-400 font-mono hidden min-[380px]:inline">521 FUNCTIONS</span>
              </div>
            </div>

            {/* Right: Photovoltaic Solar Cell & Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Photovoltaic Solar Cell Panel (Desktop only) */}
              <div className="hidden sm:flex flex-col items-center">
                <div
                  className="w-16 sm:w-20 h-5 sm:h-6 rounded-sm bg-[#160d1b] border border-black/90 shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)] relative overflow-hidden flex items-center justify-between px-0.5"
                  title="Pin năng lượng mặt trời kép TWO WAY POWER"
                >
                  {[0, 1, 2, 3].map((cellIdx) => (
                    <div
                      key={cellIdx}
                      className="h-full flex-1 border-r border-[#3a1b32] last:border-r-0 relative flex flex-col justify-around py-0.5"
                    >
                      <div className="w-full h-[0.5px] bg-amber-600/30" />
                      <div className="w-full h-[0.5px] bg-amber-600/30" />
                    </div>
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                </div>
                <span className="text-[6px] font-black text-amber-300 tracking-widest uppercase mt-0.5 font-mono">
                  TWO WAY POWER
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSoundEnabled((prev) => !prev)}
                  className="p-1.5 sm:p-1 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors"
                  title={soundEnabled ? 'Tắt âm bàn phím' : 'Bật âm bàn phím'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-cyan-400" /> : <VolumeX className="w-4 h-4 sm:w-3.5 sm:h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal((prev) => !prev)}
                  className="p-1.5 sm:p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                  title="Lịch sử tính toán"
                >
                  <History className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
                {!isMobile && (
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                    title="Thu nhỏ icon tròn"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                )}
                {/* PROMINENT CLOSE BUTTON */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-xl bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 border border-rose-500/40 sm:border-transparent sm:bg-transparent sm:text-slate-400 sm:hover:text-rose-400 sm:hover:bg-slate-800/80 transition-colors flex items-center gap-1 font-bold text-xs"
                  title="Đóng máy tính / Trở lại bài thi"
                >
                  <X className="w-4 h-4 text-rose-300 sm:text-inherit" />
                  <span className="sm:hidden text-xs font-black text-rose-200">Đóng</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── MODEL SELECTOR TABS ── */}
          <div className="grid grid-cols-3 gap-1 my-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0 w-full">
            {(['FX580VN_X', 'FX880BTG', 'FX570VN_PLUS'] as CasioModel[]).map((modelKey) => {
              const cfg = CASIO_MODELS[modelKey];
              const isSelected = activeModel === modelKey;
              return (
                <button
                  key={modelKey}
                  type="button"
                  onClick={() => {
                    triggerClickFeedback();
                    setActiveModel(modelKey);
                  }}
                  className={cn(
                    'py-1 px-1 rounded-xl text-[10px] font-extrabold text-center transition-all truncate min-w-0',
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500 to-[#00B8DD] text-slate-950 shadow-md shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  )}
                >
                  {cfg.name}
                </button>
              );
            })}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              DYNAMIC CASIO HIGH-DEFINITION LCD SCREEN
              ───────────────────────────────────────────────────────────── */}
          <div
            className={cn(
              'relative rounded-2xl p-2.5 sm:p-3 mb-1.5 border font-mono transition-colors shadow-[inset_0_3px_8px_rgba(0,0,0,0.65),0_1px_0_rgba(255,255,255,0.08)] flex flex-col justify-between min-h-[105px] sm:min-h-[118px] shrink-0 overflow-hidden w-full',
              currentConfig.screenBg,
              currentConfig.screenText
            )}
          >
            {/* Subtle LCD dot-matrix background grid */}
            <div
              className="absolute inset-0 opacity-[0.035] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                backgroundSize: '4px 4px',
              }}
            />

            {/* Specular glass reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent pointer-events-none" />

            {/* Top LCD Status line */}
            <div className="relative z-10 flex items-center justify-between text-[10px] font-bold border-b border-black/15 pb-1 mb-1 select-none">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'px-1 py-0.2 rounded text-[8.5px] font-black leading-none transition-all',
                    isShiftActive ? 'bg-[#facc15] text-black shadow-sm' : 'opacity-20'
                  )}
                >
                  S
                </span>
                <span
                  className={cn(
                    'px-1 py-0.2 rounded text-[8.5px] font-black leading-none transition-all',
                    isAlphaActive ? 'bg-[#fb7185] text-white shadow-sm' : 'opacity-20'
                  )}
                >
                  A
                </span>
                <span
                  className={cn(
                    'px-1 py-0.2 rounded text-[8.5px] font-black leading-none transition-all',
                    variables.M !== 0 ? 'bg-black/25 font-black' : 'opacity-20'
                  )}
                  title="Biến nhớ M"
                >
                  M
                </span>
                <span
                  className={cn(
                    'px-1 py-0.2 rounded text-[8.5px] font-black leading-none transition-all',
                    isStoreMode ? 'bg-cyan-700 text-white animate-pulse' : 'opacity-20'
                  )}
                >
                  STO
                </span>
                <button
                  type="button"
                  onClick={cycleAngleUnit}
                  className="px-1.5 py-0.2 rounded bg-black/15 hover:bg-black/25 text-[8.5px] font-black tracking-tight"
                  title="Bấm để đổi DEG / RAD / GRA"
                >
                  {angleUnit === 'DEG' ? 'D' : angleUnit === 'RAD' ? 'R' : 'G'}
                </button>
                <span className="text-[8.5px] opacity-75 font-semibold">Math</span>
                <span className="text-[8.5px] font-extrabold opacity-70">
                  {activeMode === 'COMP'
                    ? 'COMP'
                    : activeMode.startsWith('EQN')
                    ? 'EQN'
                    : activeMode.startsWith('TABLE')
                    ? 'TABLE'
                    : activeMode.startsWith('INEQ')
                    ? 'INEQ'
                    : 'MENU'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {fractionResult && activeMode === 'COMP' && (
                  <button
                    type="button"
                    onClick={handleToggleFraction}
                    className="text-[9px] font-black px-1.5 py-0.5 bg-black/20 hover:bg-black/30 rounded border border-black/10"
                    title="Chuyển đổi phân số ⇔ số thập phân"
                  >
                    S⇔D
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCopyResult}
                  className="p-0.5 rounded hover:bg-black/15 text-inherit"
                  title="Sao chép kết quả"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600 font-bold" /> : <Copy className="w-3 h-3 opacity-60" />}
                </button>
              </div>
            </div>

            {/* ── VIEW 1: COMP MODE (STANDARD CALCULATION) ── */}
            {activeMode === 'COMP' && (
              <>
                <div className="text-left text-[13px] font-semibold tracking-wide overflow-x-auto whitespace-nowrap scrollbar-none py-1 min-h-[26px]">
                  {expression ? (
                    <>
                      <span>{expression.slice(0, cursorPos)}</span>
                      <span className="inline-block w-1.5 h-4 bg-current align-middle animate-pulse mx-0.5" />
                      <span>{expression.slice(cursorPos)}</span>
                    </>
                  ) : (
                    <span className="opacity-30 text-xs italic">Nhập biểu thức hoặc bấm phím...</span>
                  )}
                </div>

                <div className="text-right">
                  {errorMessage ? (
                    <div className="text-rose-700 dark:text-rose-400 font-bold text-xs tracking-wider animate-bounce">
                      {errorMessage}
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-end gap-1.5">
                      {showingFraction && fractionResult ? (
                        <div className="text-xl font-bold tracking-tight">{fractionResult}</div>
                      ) : (
                        <div className="text-2xl font-black tracking-tight drop-shadow-sm">{result}</div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── VIEW 2: CASIO ICON MENU GRID (AUTHENTIC CLASSWIZ MENU) ── */}
            {activeMode === 'MENU_GRID' && (
              <div className="py-1">
                <div className="text-[10px] font-black uppercase text-center border-b border-black/10 pb-1 mb-1.5">
                  CHỌN PHƯƠNG THỨC TÍNH (Bấm số hoặc chọn)
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => { triggerClickFeedback(); setActiveMode('COMP'); }}
                    className="p-1 rounded bg-black/10 hover:bg-black/20 text-left flex items-center gap-1 truncate"
                  >
                    <span className="font-mono text-cyan-700 dark:text-cyan-300 font-black">1:</span>
                    <span>Tính toán</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { triggerClickFeedback(); setActiveMode('COMP'); toast.info('Chế độ Số Phức: Nhập i bằng phím ENG'); }}
                    className="p-1 rounded bg-black/10 hover:bg-black/20 text-left flex items-center gap-1 truncate"
                  >
                    <span className="font-mono text-cyan-700 dark:text-cyan-300 font-black">2:</span>
                    <span>Số phức</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { triggerClickFeedback(); toast.info('Hệ cơ số Base-N: DEC, HEX, BIN'); }}
                    className="p-1 rounded bg-black/10 hover:bg-black/20 text-left flex items-center gap-1 truncate"
                  >
                    <span className="font-mono text-cyan-700 dark:text-cyan-300 font-black">3:</span>
                    <span>Base-N</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { triggerClickFeedback(); toast.info('Ma trận: Det, nghịch đảo, nhân ma trận'); }}
                    className="p-1 rounded bg-black/10 hover:bg-black/20 text-left flex items-center gap-1 truncate"
                  >
                    <span className="font-mono text-cyan-700 dark:text-cyan-300 font-black">4:</span>
                    <span>Ma trận</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { triggerClickFeedback(); toast.info('Vectơ: Tích vô hướng, có hướng, độ dài'); }}
                    className="p-1 rounded bg-black/10 hover:bg-black/20 text-left flex items-center gap-1 truncate"
                  >
                    <span className="font-mono text-cyan-700 dark:text-cyan-300 font-black">5:</span>
                    <span>Vectơ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { triggerClickFeedback(); toast.info('Thống kê 1 biến & 2 biến'); }}
                    className="p-1 rounded bg-black/10 hover:bg-black/20 text-left flex items-center gap-1 truncate"
                  >
                    <span className="font-mono text-cyan-700 dark:text-cyan-300 font-black">6:</span>
                    <span>Thống kê</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { triggerClickFeedback(); setActiveMode('TABLE_FX_INPUT'); }}
                    className="p-1 rounded bg-cyan-900/30 hover:bg-cyan-900/40 text-left flex items-center gap-1 truncate font-black border border-black/15"
                  >
                    <span className="font-mono text-cyan-700 dark:text-cyan-300 font-black">8:</span>
                    <span>Bảng Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { triggerClickFeedback(); setActiveMode('EQN_TYPE_SELECT'); }}
                    className="p-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-left flex items-center gap-1 truncate font-black border border-black/15"
                  >
                    <span className="font-mono text-amber-700 dark:text-amber-300 font-black">9:</span>
                    <span>Phương trình</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { triggerClickFeedback(); setActiveMode('INEQ_FORM_SELECT'); }}
                    className="p-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-left flex items-center gap-1 truncate font-black border border-black/15"
                  >
                    <span className="font-mono text-rose-700 dark:text-rose-300 font-black">A:</span>
                    <span>Bất PT</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── VIEW 3: MENU 9: EQN TYPE SELECT (SIMULT VS POLYNOMIAL) ── */}
            {activeMode === 'EQN_TYPE_SELECT' && (
              <div className="space-y-1.5 py-1">
                <div className="text-[11px] font-black border-b border-black/10 pb-1">
                  PHƯƠNG TRÌNH / HỆ PHƯƠNG TRÌNH:
                </div>
                <div className="space-y-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => { triggerClickFeedback(); setActiveMode('SIMULT_UNKNOWN'); }}
                    className="w-full text-left p-1.5 rounded bg-black/10 hover:bg-black/20 flex items-center justify-between"
                  >
                    <span>1: Hệ phương trình (Simult Equation)</span>
                    <span className="text-[9px] opacity-70">2 ~ 4 ẩn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { triggerClickFeedback(); setActiveMode('POLY_DEGREE'); }}
                    className="w-full text-left p-1.5 rounded bg-black/10 hover:bg-black/20 flex items-center justify-between"
                  >
                    <span>2: Phương trình đa thức (Polynomial)</span>
                    <span className="text-[9px] opacity-70">Bậc 2 ~ 4</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── VIEW 4: MENU 9-1: SIMULT NUMBER OF UNKNOWNS ── */}
            {activeMode === 'SIMULT_UNKNOWN' && (
              <div className="space-y-2 py-1">
                <div className="text-[11px] font-black">HỆ PHƯƠNG TRÌNH: Số lượng ẩn?</div>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        triggerClickFeedback();
                        setSimultCount(num as 2 | 3 | 4);
                        // Initialize matrix
                        const cols = num + 1;
                        const mat = Array.from({ length: num }, () => Array(cols).fill(''));
                        setSimultMatrix(mat);
                        setSimultActiveCell({ r: 0, c: 0 });
                        setActiveMode('SIMULT_INPUT');
                      }}
                      className="p-2 text-center rounded-xl bg-black/15 hover:bg-black/25 font-black text-sm"
                    >
                      {num} Ẩn
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── VIEW 5: MENU 9-1: SIMULT MATRIX INPUT ── */}
            {activeMode === 'SIMULT_INPUT' && (
              <div className="space-y-1 py-0.5">
                <div className="flex items-center justify-between text-[10px] font-black border-b border-black/10 pb-0.5">
                  <span>HỆ {simultCount} ẨN (Bấm số & [=] nhập):</span>
                  <span className="text-cyan-700 dark:text-cyan-300">
                    Hàng {simultActiveCell.r + 1}, Cột {simultActiveCell.c + 1}
                  </span>
                </div>
                <div className="space-y-1 text-xs font-mono">
                  {simultMatrix.map((row, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
                      {row.map((val, cIdx) => {
                        const isActive = simultActiveCell.r === rIdx && simultActiveCell.c === cIdx;
                        const isConstant = cIdx === row.length - 1;
                        return (
                          <div
                            key={cIdx}
                            onClick={() => setSimultActiveCell({ r: rIdx, c: cIdx })}
                            className={cn(
                              'px-1.5 py-0.5 rounded text-center cursor-pointer min-w-[38px] text-[11px] border',
                              isActive
                                ? 'bg-black text-white font-black border-cyan-400 ring-1 ring-cyan-400'
                                : 'bg-black/10 border-black/10 hover:bg-black/20'
                            )}
                          >
                            {val !== '' ? val : <span className="opacity-30">0</span>}
                            {isConstant && <span className="ml-0.5 text-[8px] opacity-60">(=)</span>}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="text-[9px] text-right opacity-70">
                  Bấm [=] để chuyển ô hoặc tính nghiệm
                </div>
              </div>
            )}

            {/* ── VIEW 6: MENU 9-2: POLYNOMIAL DEGREE SELECT ── */}
            {activeMode === 'POLY_DEGREE' && (
              <div className="space-y-2 py-1">
                <div className="text-[11px] font-black">PHƯƠNG TRÌNH ĐA THỨC: Bậc?</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerClickFeedback();
                      setPolyDegree(2);
                      setPolyCoeffs(['', '', '']);
                      setPolyActiveIdx(0);
                      setActiveMode('POLY_INPUT');
                    }}
                    className="p-2 text-center rounded-xl bg-black/15 hover:bg-black/25 font-black text-xs"
                  >
                    Bậc 2 (ax² + bx + c = 0)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerClickFeedback();
                      setPolyDegree(3);
                      setPolyCoeffs(['', '', '', '']);
                      setPolyActiveIdx(0);
                      setActiveMode('POLY_INPUT');
                    }}
                    className="p-2 text-center rounded-xl bg-black/15 hover:bg-black/25 font-black text-xs"
                  >
                    Bậc 3 (ax³ + bx² + cx + d = 0)
                  </button>
                </div>
              </div>
            )}

            {/* ── VIEW 7: MENU 9-2: POLYNOMIAL COEFFICIENT INPUT ── */}
            {activeMode === 'POLY_INPUT' && (
              <div className="space-y-1.5 py-1">
                <div className="flex items-center justify-between text-[10px] font-black border-b border-black/10 pb-0.5">
                  <span>
                    {polyDegree === 2 ? 'ax² + bx + c = 0' : 'ax³ + bx² + cx + d = 0'}
                  </span>
                  <span className="text-cyan-700 dark:text-cyan-300 font-bold">
                    Hệ số {['a', 'b', 'c', 'd'][polyActiveIdx]}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 justify-center py-1">
                  {polyCoeffs.map((coeff, idx) => {
                    const label = ['a', 'b', 'c', 'd'][idx];
                    const isActive = polyActiveIdx === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setPolyActiveIdx(idx)}
                        className={cn(
                          'px-2 py-1 rounded-lg text-center cursor-pointer min-w-[50px] border',
                          isActive
                            ? 'bg-black text-white font-black border-cyan-400 ring-2 ring-cyan-400'
                            : 'bg-black/10 border-black/15 hover:bg-black/20'
                        )}
                      >
                        <div className="text-[8px] opacity-60 uppercase">{label}</div>
                        <div className="text-sm font-black font-mono">
                          {coeff !== '' ? coeff : <span className="opacity-30">0</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-[9px] text-right opacity-70">
                  Nhập số rồi bấm [=] để tiếp tục
                </div>
              </div>
            )}

            {/* ── VIEW 8: MENU 9: EQUATION RESULT SCREEN ── */}
            {activeMode === 'EQN_RESULT' && eqnSolution && (
              <div className="space-y-1 py-1">
                <div className="flex items-center justify-between text-[10px] font-black border-b border-black/10 pb-0.5">
                  <span className="text-cyan-800 dark:text-cyan-300 font-bold">{eqnSolution.title}</span>
                  <span className="text-[9px] opacity-60">Bấm [=] để xem tiếp</span>
                </div>

                {eqnSolution.type === 'NO_SOLUTION' && (
                  <div className="py-4 text-center text-sm font-black text-rose-700 dark:text-rose-400">
                    VÔ NGHIỆM (No Solution)
                  </div>
                )}

                {eqnSolution.type === 'INFINITE_SOLUTIONS' && (
                  <div className="py-4 text-center text-sm font-black text-cyan-700 dark:text-cyan-400">
                    VÔ SỐ NGHIỆM (Infinite Solutions)
                  </div>
                )}

                {eqnSolution.type === 'UNIQUE' && !showExtremum && eqnSolution.roots[eqnResultIdx] && (
                  <div className="py-1">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {eqnSolution.roots[eqnResultIdx].label} =
                    </div>
                    <div className="text-right">
                      {eqnSolution.roots[eqnResultIdx].fractionStr ? (
                        <div className="text-lg font-bold">{eqnSolution.roots[eqnResultIdx].fractionStr}</div>
                      ) : null}
                      <div className="text-2xl font-black">{eqnSolution.roots[eqnResultIdx].valueStr}</div>
                    </div>
                    <div className="text-[9px] text-slate-500 text-left">
                      Nghiệm {eqnResultIdx + 1}/{eqnSolution.roots.length}
                    </div>
                  </div>
                )}

                {eqnSolution.type === 'UNIQUE' && showExtremum && eqnSolution.extremum && (
                  <div className="py-1">
                    <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400">
                      ĐỈNH PARABOL ({eqnSolution.extremum.type === 'MIN' ? 'Cực tiểu' : 'Cực đại'}):
                    </div>
                    <div className="text-right text-xs">
                      <div>x_{eqnSolution.extremum.type.toLowerCase()} = <strong className="text-base">{eqnSolution.extremum.xVal}</strong></div>
                      <div>y_{eqnSolution.extremum.type.toLowerCase()} = <strong className="text-base">{eqnSolution.extremum.yVal}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── VIEW 9: MENU 8: TABLE f(x) INPUT ── */}
            {activeMode === 'TABLE_FX_INPUT' && (
              <div className="space-y-1.5 py-1">
                <div className="text-[10px] font-black border-b border-black/10 pb-0.5">
                  BẢNG GIÁ TRỊ: NHẬP HÀM SỐ
                </div>
                <div className="text-xs font-bold">f(x) =</div>
                <div className="text-left text-sm font-bold bg-black/10 p-1.5 rounded-lg font-mono">
                  {tableFx || <span className="opacity-30">x^2 - 4</span>}
                </div>
                <div className="text-[9px] text-right opacity-70">
                  Bấm [=] để nhập phạm vi Start / End / Step
                </div>
              </div>
            )}

            {/* ── VIEW 10: MENU 8: TABLE RANGE INPUT ── */}
            {activeMode === 'TABLE_RANGE_INPUT' && (
              <div className="space-y-1.5 py-1">
                <div className="text-[10px] font-black border-b border-black/10 pb-0.5">
                  PHẠM VI BẢNG GIÁ TRỊ TABLE
                </div>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <div
                    onClick={() => setTableActiveField('START')}
                    className={cn('p-1 rounded text-center border cursor-pointer', tableActiveField === 'START' ? 'bg-black text-white font-black ring-1 ring-cyan-400' : 'bg-black/10')}
                  >
                    <div className="text-[8px] opacity-60">Start</div>
                    <div className="font-mono font-bold">{tableStart}</div>
                  </div>
                  <div
                    onClick={() => setTableActiveField('END')}
                    className={cn('p-1 rounded text-center border cursor-pointer', tableActiveField === 'END' ? 'bg-black text-white font-black ring-1 ring-cyan-400' : 'bg-black/10')}
                  >
                    <div className="text-[8px] opacity-60">End</div>
                    <div className="font-mono font-bold">{tableEnd}</div>
                  </div>
                  <div
                    onClick={() => setTableActiveField('STEP')}
                    className={cn('p-1 rounded text-center border cursor-pointer', tableActiveField === 'STEP' ? 'bg-black text-white font-black ring-1 ring-cyan-400' : 'bg-black/10')}
                  >
                    <div className="text-[8px] opacity-60">Step</div>
                    <div className="font-mono font-bold">{tableStep}</div>
                  </div>
                </div>
                <div className="text-[9px] text-right opacity-70">
                  Bấm [=] để chuyển và tạo bảng
                </div>
              </div>
            )}

            {/* ── VIEW 11: MENU 8: TABLE RESULT VIEW ── */}
            {activeMode === 'TABLE_VIEW' && (
              <div className="space-y-1 py-0.5">
                <div className="flex items-center justify-between text-[10px] font-black border-b border-black/10 pb-0.5">
                  <span>BẢNG f(x) ({tableRows.length} dòng):</span>
                  <span className="opacity-70">Dòng {tableRowIdx + 1} (▲▼ cuộn)</span>
                </div>
                <div className="max-h-[68px] overflow-y-auto font-mono text-[11px] space-y-0.5 pr-1">
                  <div className="grid grid-cols-3 font-black border-b border-black/10 text-[9px] pb-0.5">
                    <span>No.</span>
                    <span className="text-center">x</span>
                    <span className="text-right">f(x)</span>
                  </div>
                  {tableRows.map((row, idx) => (
                    <div
                      key={row.index}
                      onClick={() => setTableRowIdx(idx)}
                      className={cn(
                        'grid grid-cols-3 py-0.5 px-1 rounded cursor-pointer',
                        tableRowIdx === idx ? 'bg-black text-white font-black' : 'hover:bg-black/10'
                      )}
                    >
                      <span className="opacity-60">{row.index}</span>
                      <span className="text-center">{row.xStr}</span>
                      <span className="text-right font-bold">{row.fxStr}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── VIEW 12: MENU A: INEQUALITY FORM SELECT ── */}
            {activeMode === 'INEQ_FORM_SELECT' && (
              <div className="space-y-1 py-1">
                <div className="text-[10px] font-black border-b border-black/10 pb-0.5">
                  BẤT PHƯƠNG TRÌNH BẬC 2: CHỌN DẠNG
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] font-bold">
                  {[
                    { id: 1, label: '1: ax² + bx + c > 0' },
                    { id: 2, label: '2: ax² + bx + c < 0' },
                    { id: 3, label: '3: ax² + bx + c ≥ 0' },
                    { id: 4, label: '4: ax² + bx + c ≤ 0' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        triggerClickFeedback();
                        setIneqType(item.id as 1 | 2 | 3 | 4);
                        setIneqCoeffs(['', '', '']);
                        setIneqActiveIdx(0);
                        setActiveMode('INEQ_INPUT');
                      }}
                      className="p-1 rounded bg-black/10 hover:bg-black/20 text-left truncate"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── VIEW 13: MENU A: INEQUALITY INPUT ── */}
            {activeMode === 'INEQ_INPUT' && (
              <div className="space-y-1.5 py-1">
                <div className="text-[10px] font-black border-b border-black/10 pb-0.5">
                  NHẬP HỆ SỐ BẤT PHƯƠNG TRÌNH
                </div>
                <div className="flex items-center gap-1.5 justify-center py-1">
                  {ineqCoeffs.map((coeff, idx) => {
                    const label = ['a', 'b', 'c'][idx];
                    const isActive = ineqActiveIdx === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setIneqActiveIdx(idx)}
                        className={cn(
                          'px-2 py-1 rounded-lg text-center cursor-pointer min-w-[50px] border',
                          isActive ? 'bg-black text-white font-black ring-2 ring-cyan-400' : 'bg-black/10'
                        )}
                      >
                        <div className="text-[8px] opacity-60 uppercase">{label}</div>
                        <div className="text-sm font-black font-mono">
                          {coeff !== '' ? coeff : <span className="opacity-30">0</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-[9px] text-right opacity-70">
                  Nhập số rồi bấm [=] để giải
                </div>
              </div>
            )}

            {/* ── VIEW 14: MENU A: INEQUALITY RESULT ── */}
            {activeMode === 'INEQ_RESULT' && (
              <div className="space-y-1.5 py-1">
                <div className="text-[10px] font-black border-b border-black/10 pb-0.5">
                  TẬP NGHIỆM BẤT PHƯƠNG TRÌNH:
                </div>
                <div className="py-2 text-center text-lg font-black font-mono text-cyan-800 dark:text-cyan-300">
                  {ineqSolutionStr}
                </div>
                <div className="text-[9px] text-right opacity-70">
                  Bấm [AC] để quay lại màn hình chính
                </div>
              </div>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              3. EXACT PHYSICAL CASIO KEYPAD (100% AUTHENTIC TO REAL CASIO)
              Silkscreen sub-labels on faceplate, tactile 3D keycaps
              ───────────────────────────────────────────────────────────── */}

          {/* ── ROW 1: TOP D-PAD & FUNCTION CONTROL ── */}
          <div className="grid grid-cols-6 gap-1 mb-1 items-end w-full overflow-hidden touch-manipulation select-none">
            {/* SHIFT */}
            <div className="flex flex-col items-center w-full min-w-0 overflow-hidden">
              <div className="h-2.5 w-full mb-0.5" />
              <button
                type="button"
                onClick={() => {
                  triggerClickFeedback();
                  setIsShiftActive((prev) => !prev);
                  setIsAlphaActive(false);
                }}
                className={cn(
                  'w-full h-7 sm:h-8 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-black tracking-wider transition-transform duration-75 active:scale-95 select-none min-w-0 px-0.5 touch-manipulation',
                  currentConfig.keyStyle.shiftKey,
                  isShiftActive && 'ring-2 ring-[#facc15] shadow-lg shadow-amber-500/20'
                )}
              >
                <span className="truncate">SHIFT</span>
              </button>
            </div>

            {/* OPTN */}
            <CasioKeySlot
              label="OPTN"
              shiftLabel="QR"
              alphaLabel="CALC"
              onClick={() => {
                if (isShiftActive) {
                  toast.info('QR Code liên kết đồ thị');
                } else {
                  cycleAngleUnit();
                }
              }}
              className={currentConfig.keyStyle.funcKey}
            />

            {/* CIRCULAR BRUSHED METALLIC REPLAY D-PAD (Spans 2 cols) */}
            <div className="col-span-2 flex flex-col items-center justify-center min-w-0 overflow-hidden">
              <span className="text-[6.5px] font-black text-slate-400 tracking-widest uppercase mb-0.5 select-none pointer-events-none">
                REPLAY
              </span>
              <div
                className={cn(
                  'w-10 h-10 min-[380px]:w-11 min-[380px]:h-11 sm:w-14 sm:h-14 rounded-full p-0.5 sm:p-1 border-2 border-slate-400/60 flex flex-col items-center justify-between shadow-[0_4px_10px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.7)] select-none shrink-0',
                  currentConfig.dpadStyle
                )}
              >
                <button
                  type="button"
                  onClick={() => handleHistoryNav('UP')}
                  className="w-full text-slate-800 hover:text-black flex justify-center py-0.5 active:scale-85 transition-transform"
                  title="Cuộn lên / Lịch sử trước"
                >
                  <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                </button>
                <div className="flex w-full justify-between px-1">
                  <button
                    type="button"
                    onClick={() => {
                      triggerClickFeedback();
                      setCursorPos((p) => Math.max(0, p - 1));
                    }}
                    className="text-slate-800 hover:text-black active:scale-85 transition-transform"
                    title="Con trỏ lùi sang trái"
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerClickFeedback();
                      setCursorPos((p) => Math.min(expression.length, p + 1));
                    }}
                    className="text-slate-800 hover:text-black active:scale-85 transition-transform"
                    title="Con trỏ tiến sang phải"
                  >
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleHistoryNav('DOWN')}
                  className="w-full text-slate-800 hover:text-black flex justify-center py-0.5 active:scale-85 transition-transform"
                  title="Cuộn xuống / Lịch sử sau"
                >
                  <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* MENU / SETUP */}
            <CasioKeySlot
              label="MENU"
              shiftLabel="SETUP"
              onClick={() => {
                triggerClickFeedback();
                if (isShiftActive) {
                  cycleAngleUnit();
                } else {
                  setActiveMode((prev) => (prev === 'MENU_GRID' ? 'COMP' : 'MENU_GRID'));
                }
              }}
              className={cn(currentConfig.keyStyle.funcKey, activeMode === 'MENU_GRID' && 'ring-2 ring-cyan-400 bg-cyan-950')}
            />

            {/* ON */}
            <CasioKeySlot
              label="ON"
              shiftLabel="OFF"
              onClick={handleAllClear}
              className={cn(currentConfig.keyStyle.funcKey, 'text-cyan-300 font-black')}
            />
          </div>

          {/* ── ROW 2: SCIENTIFIC FUNCTION ROW 1 ── */}
          <div className="grid grid-cols-6 gap-1 mb-1 w-full overflow-hidden touch-manipulation select-none">
            {/* ALPHA */}
            <div className="flex flex-col items-center w-full min-w-0 overflow-hidden">
              <div className="h-2.5 w-full mb-0.5" />
              <button
                type="button"
                onClick={() => {
                  triggerClickFeedback();
                  setIsAlphaActive((prev) => !prev);
                  setIsShiftActive(false);
                }}
                className={cn(
                  'w-full h-7 sm:h-8 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-black tracking-wider transition-transform duration-75 active:scale-95 select-none min-w-0 px-0.5 touch-manipulation',
                  currentConfig.keyStyle.alphaKey,
                  isAlphaActive && 'ring-2 ring-[#fb7185] shadow-lg shadow-rose-500/20'
                )}
              >
                <span className="truncate">ALPHA</span>
              </button>
            </div>

            {/* Fraction a/b */}
            <CasioKeySlot
              label="■/□"
              shiftLabel="■ ■/□"
              onClick={() => insertToken('/')}
              className={currentConfig.keyStyle.funcKey}
            />

            {/* Square Root */}
            <CasioKeySlot
              label="√■"
              shiftLabel="∛■"
              onClick={() => insertToken(isShiftActive ? '∛(' : '√(')}
              className={currentConfig.keyStyle.funcKey}
            />

            {/* x² */}
            <CasioKeySlot
              label="x²"
              shiftLabel="x³"
              onClick={() => insertToken(isShiftActive ? '³' : '²')}
              className={currentConfig.keyStyle.funcKey}
            />

            {/* x^■ */}
            <CasioKeySlot
              label="x^■"
              shiftLabel="ˣ√■"
              onClick={() => insertToken('^(')}
              className={currentConfig.keyStyle.funcKey}
            />

            {/* log */}
            <CasioKeySlot
              label="log"
              shiftLabel="10^■"
              onClick={() => insertToken(isShiftActive ? '10^(' : 'log(')}
              className={currentConfig.keyStyle.funcKey}
            />
          </div>

          {/* ── ROW 3: SCIENTIFIC FUNCTION ROW 2 (Trigonometry) ── */}
          <div className="grid grid-cols-6 gap-1 mb-1 w-full overflow-hidden touch-manipulation select-none">
            {/* ln */}
            <CasioKeySlot
              label="ln"
              shiftLabel="e^■"
              alphaLabel="e"
              onClick={() => insertToken(isShiftActive ? 'e^(' : isAlphaActive ? 'e' : 'ln(')}
              className={currentConfig.keyStyle.funcKey}
            />

            {/* (-) Negation / Variable A */}
            <CasioKeySlot
              label="(-)"
              shiftLabel="Fact"
              alphaLabel="A"
              onClick={() => (isAlphaActive ? handleVariablePress('A') : insertToken('−'))}
              className={currentConfig.keyStyle.funcKey}
            />

            {/* ° ' " DMS / Variable B */}
            <CasioKeySlot
              label="° ' &quot;"
              shiftLabel="←"
              alphaLabel="B"
              onClick={() => (isAlphaActive ? handleVariablePress('B') : insertToken('°'))}
              className={currentConfig.keyStyle.funcKey}
            />

            {/* x⁻¹ / Factorial / Variable C */}
            <CasioKeySlot
              label="x⁻¹"
              shiftLabel="x!"
              alphaLabel="C"
              onClick={() => (isAlphaActive ? handleVariablePress('C') : insertToken(isShiftActive ? '!' : '^(-1)'))}
              className={currentConfig.keyStyle.funcKey}
            />

            {/* sin / Variable D */}
            <CasioKeySlot
              label="sin"
              shiftLabel="sin⁻¹"
              alphaLabel="D"
              onClick={() => (isAlphaActive ? handleVariablePress('D') : insertToken(isShiftActive ? 'asin(' : 'sin('))}
              className={currentConfig.keyStyle.funcKey}
            />

            {/* cos / Variable E */}
            <CasioKeySlot
              label="cos"
              shiftLabel="cos⁻¹"
              alphaLabel="E"
              onClick={() => (isAlphaActive ? handleVariablePress('E') : insertToken(isShiftActive ? 'acos(' : 'cos('))}
              className={currentConfig.keyStyle.funcKey}
            />
          </div>

          {/* ── ROW 4: SCIENTIFIC FUNCTION ROW 3 ── */}
          <div className="grid grid-cols-6 gap-1 mb-1.5 w-full overflow-hidden touch-manipulation select-none">
            {/* tan / Variable F */}
            <CasioKeySlot
              label="tan"
              shiftLabel="tan⁻¹"
              alphaLabel="F"
              onClick={() => (isAlphaActive ? handleVariablePress('F') : insertToken(isShiftActive ? 'atan(' : 'tan('))}
              className={currentConfig.keyStyle.funcKey}
            />

            {/* STO */}
            <CasioKeySlot
              label="STO"
              shiftLabel="RCL"
              alphaLabel=":"
              onClick={() => {
                triggerClickFeedback();
                if (isShiftActive) {
                  insertToken(variables.M.toString());
                } else if (isAlphaActive) {
                  insertToken(':');
                } else {
                  setIsStoreMode(true);
                  toast.info('Nhấn phím chữ cái (A, B, C, D, E, F, M) để lưu kết quả vào biến');
                }
              }}
              className={cn(currentConfig.keyStyle.funcKey, isStoreMode && 'ring-2 ring-cyan-400')}
            />

            {/* ENG / i (Complex) */}
            <CasioKeySlot
              label="ENG"
              shiftLabel="←"
              alphaLabel="i"
              onClick={() => {
                triggerClickFeedback();
                insertToken('i');
              }}
              className={currentConfig.keyStyle.funcKey}
            />

            {/* ( */}
            <CasioKeySlot
              label="("
              shiftLabel="%"
              onClick={() => insertToken(isShiftActive ? '%' : '(')}
              className={currentConfig.keyStyle.funcKey}
            />

            {/* ) / Variable x */}
            <CasioKeySlot
              label=")"
              shiftLabel=","
              alphaLabel="x"
              onClick={() => (isAlphaActive ? handleVariablePress('x') : insertToken(isShiftActive ? ',' : ')'))}
              className={currentConfig.keyStyle.funcKey}
            />

            {/* S<=>D / Variable y */}
            <CasioKeySlot
              label="S⇔D"
              shiftLabel="a b/c"
              alphaLabel="y"
              onClick={() => (isAlphaActive ? handleVariablePress('y') : handleToggleFraction())}
              className={cn(currentConfig.keyStyle.funcKey, 'text-cyan-400 font-extrabold')}
            />
          </div>

          {/* ─────────────────────────────────────────────────────────────
              4. SIGNATURE TWO-TONE MAIN KEYPAD (0-9, Operators, DEL, AC, =)
              White Ivory Keys for numbers on fx-580VN X!
              ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-5 gap-1 pt-1.5 border-t border-slate-700/60 w-full overflow-hidden touch-manipulation select-none">
            {/* Row 5: 7 8 9 DEL AC */}
            <CasioNumberSlot
              digit="7"
              shiftLabel="CONST"
              onClick={() => insertToken('7')}
              className={currentConfig.keyStyle.numKey}
            />
            <CasioNumberSlot
              digit="8"
              shiftLabel="CONV"
              onClick={() => insertToken('8')}
              className={currentConfig.keyStyle.numKey}
            />
            <CasioNumberSlot
              digit="9"
              shiftLabel="RESET"
              onClick={() => insertToken('9')}
              className={currentConfig.keyStyle.numKey}
            />
            <CasioOpSlot
              op="DEL"
              shiftLabel="INS"
              onClick={handleDelete}
              className={currentConfig.keyStyle.delKey}
              textClass="text-[11px] sm:text-sm font-black tracking-wider"
            />
            <CasioOpSlot
              op="AC"
              shiftLabel="OFF"
              onClick={handleAllClear}
              className={currentConfig.keyStyle.acKey}
              textClass="text-[11px] sm:text-sm font-black tracking-wider text-rose-300"
            />

            {/* Row 6: 4 5 6 × ÷ */}
            <CasioNumberSlot
              digit="4"
              shiftLabel="MATRIX"
              onClick={() => insertToken('4')}
              className={currentConfig.keyStyle.numKey}
            />
            <CasioNumberSlot
              digit="5"
              shiftLabel="VECTOR"
              onClick={() => insertToken('5')}
              className={currentConfig.keyStyle.numKey}
            />
            <CasioNumberSlot
              digit="6"
              shiftLabel="CALC"
              onClick={() => insertToken('6')}
              className={currentConfig.keyStyle.numKey}
            />
            <CasioOpSlot
              op="×"
              shiftLabel="nPr"
              onClick={() => insertToken(isShiftActive ? 'P' : '×')}
              className={currentConfig.keyStyle.opKey}
            />
            <CasioOpSlot
              op="÷"
              shiftLabel="nCr"
              onClick={() => insertToken(isShiftActive ? 'C' : '÷')}
              className={currentConfig.keyStyle.opKey}
            />

            {/* Row 7: 1 2 3 + - */}
            <CasioNumberSlot
              digit="1"
              shiftLabel="STAT"
              onClick={() => insertToken('1')}
              className={currentConfig.keyStyle.numKey}
            />
            <CasioNumberSlot
              digit="2"
              shiftLabel="COMPLEX"
              onClick={() => insertToken('2')}
              className={currentConfig.keyStyle.numKey}
            />
            <CasioNumberSlot
              digit="3"
              shiftLabel="BASE"
              onClick={() => insertToken('3')}
              className={currentConfig.keyStyle.numKey}
            />
            <CasioOpSlot
              op="+"
              shiftLabel="Pol"
              onClick={() => insertToken('+')}
              className={currentConfig.keyStyle.opKey}
            />
            <CasioOpSlot
              op="−"
              shiftLabel="Rec"
              onClick={() => insertToken('−')}
              className={currentConfig.keyStyle.opKey}
            />

            {/* Row 8: 0 . ×10ˣ Ans = */}
            <CasioNumberSlot
              digit="0"
              shiftLabel="Rnd"
              onClick={() => insertToken('0')}
              className={currentConfig.keyStyle.numKey}
            />
            <CasioNumberSlot
              digit="."
              shiftLabel="Ran#"
              alphaLabel="RanInt"
              onClick={() => insertToken('.')}
              className={currentConfig.keyStyle.numKey}
            />
            <CasioOpSlot
              op="×10ˣ"
              shiftLabel="π"
              alphaLabel="e"
              onClick={() => insertToken(isShiftActive ? 'π' : isAlphaActive ? 'e' : '×10^(')}
              className={currentConfig.keyStyle.numKey}
              textClass="text-[10px] sm:text-xs font-black text-slate-900"
            />
            <CasioOpSlot
              op="Ans"
              shiftLabel="%"
              alphaLabel="PreAns"
              onClick={() => insertToken(isShiftActive ? '%' : 'Ans')}
              className={currentConfig.keyStyle.numKey}
              textClass="text-[11px] sm:text-sm font-black text-cyan-700 dark:text-cyan-600"
            />
            <CasioOpSlot
              op="="
              shiftLabel="SOLVE"
              alphaLabel="="
              onClick={handleCalculateOrAdvance}
              className={currentConfig.keyStyle.equalsKey}
              textClass="text-lg sm:text-2xl font-black text-slate-950"
            />
          </div>

          {/* Model Description & Shortcuts */}
          <div className="mt-2 flex items-center justify-between text-[8px] sm:text-[9px] text-slate-400 font-medium px-1 w-full shrink-0 overflow-hidden">
            <span className="truncate">Bàn phím: <kbd className="px-1 py-0.2 bg-slate-800 rounded text-slate-300">0-9</kbd>, <kbd className="px-1 py-0.2 bg-slate-800 rounded text-slate-300">Enter</kbd>, <kbd className="px-1 py-0.2 bg-slate-800 rounded text-slate-300">Esc</kbd></span>
            <span className="text-cyan-400 font-semibold truncate ml-1">{currentConfig.series}</span>
          </div>

          {/* ── HISTORY MODAL ── */}
          {showHistoryModal && (
            <div className="absolute inset-x-3 top-12 bottom-3 bg-slate-900/98 border border-slate-700 rounded-3xl p-3 z-30 flex flex-col shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" /> Lịch Sử Tính Toán ({history.length})
                </span>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setHistory([])}
                      className="text-[10px] text-rose-400 hover:underline"
                    >
                      Xóa hết
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowHistoryModal(false)}
                    className="p-1 rounded text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
                {history.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">
                    Chưa có phép tính nào trong lịch sử
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setExpression(item.expression);
                        setCursorPos(item.expression.length);
                        setResult(item.result);
                        setShowHistoryModal(false);
                      }}
                      className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all text-xs"
                    >
                      <div className="text-slate-400 font-mono truncate">{item.expression}</div>
                      <div className="text-right text-cyan-300 font-bold font-mono text-sm">{item.result}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// AUTHENTIC KEYPAD SUBCOMPONENTS (Silkscreen Shelves + 3D Keycaps)
// ─────────────────────────────────────────────────────────────

interface CasioKeySlotProps {
  label: React.ReactNode;
  shiftLabel?: string;
  alphaLabel?: string;
  thirdLabel?: string;
  onClick: () => void;
  className?: string;
  heightClass?: string;
  textClass?: string;
  isActive?: boolean;
}

const CasioKeySlot = React.memo(function CasioKeySlot({
  label,
  shiftLabel,
  alphaLabel,
  thirdLabel,
  onClick,
  className,
  heightClass = 'h-7 sm:h-8',
  textClass = 'text-[10px] sm:text-[11px] font-bold',
  isActive = false,
}: CasioKeySlotProps) {
  return (
    <div className="flex flex-col items-center w-full min-w-0 overflow-hidden">
      {/* Silkscreen text on calculator faceplate above keycap */}
      <div className="h-2.5 w-full flex items-center justify-between px-0.5 text-[6px] sm:text-[6.5px] font-mono font-bold leading-none select-none pointer-events-none mb-0.5 overflow-hidden">
        <span className="text-[#facc15] truncate tracking-tighter sm:drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
          {shiftLabel || ''}
        </span>
        {thirdLabel && (
          <span className="text-[#38bdf8] truncate tracking-tighter sm:drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
            {thirdLabel}
          </span>
        )}
        <span className="text-[#fb7185] truncate tracking-tighter sm:drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] text-right">
          {alphaLabel || ''}
        </span>
      </div>

      {/* Tactile 3D Keycap */}
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full rounded-xl flex items-center justify-center transition-transform duration-75 active:scale-95 select-none min-w-0 px-0.5 touch-manipulation',
          heightClass,
          textClass,
          className,
          isActive && 'ring-2 ring-amber-400'
        )}
      >
        <span className="truncate">{label}</span>
      </button>
    </div>
  );
});

const CasioNumberSlot = React.memo(function CasioNumberSlot({
  digit,
  shiftLabel,
  alphaLabel,
  onClick,
  className,
}: {
  digit: string;
  shiftLabel?: string;
  alphaLabel?: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <div className="flex flex-col items-center w-full min-w-0 overflow-hidden">
      {/* Silkscreen text on faceplate above number key */}
      <div className="h-2.5 w-full flex items-center justify-between px-0.5 sm:px-1 text-[6px] sm:text-[6.5px] font-mono font-bold leading-none select-none pointer-events-none mb-0.5 overflow-hidden">
        <span className="text-[#facc15] truncate tracking-tighter sm:drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
          {shiftLabel || ''}
        </span>
        <span className="text-[#fb7185] truncate tracking-tighter sm:drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] text-right">
          {alphaLabel || ''}
        </span>
      </div>

      {/* Tactile 3D Ivory Number Key */}
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full h-8.5 min-[380px]:h-9.5 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center text-sm min-[380px]:text-base sm:text-lg font-black transition-transform duration-75 active:scale-95 select-none min-w-0 touch-manipulation',
          className
        )}
      >
        {digit}
      </button>
    </div>
  );
});

const CasioOpSlot = React.memo(function CasioOpSlot({
  op,
  shiftLabel,
  alphaLabel,
  onClick,
  className,
  textClass = 'text-xs sm:text-lg font-extrabold',
}: {
  op: React.ReactNode;
  shiftLabel?: string;
  alphaLabel?: string;
  onClick: () => void;
  className?: string;
  textClass?: string;
}) {
  return (
    <div className="flex flex-col items-center w-full min-w-0 overflow-hidden">
      {/* Silkscreen text on faceplate above operator key */}
      <div className="h-2.5 w-full flex items-center justify-between px-0.5 sm:px-1 text-[6px] sm:text-[6.5px] font-mono font-bold leading-none select-none pointer-events-none mb-0.5 overflow-hidden">
        <span className="text-[#facc15] truncate tracking-tighter sm:drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
          {shiftLabel || ''}
        </span>
        <span className="text-[#fb7185] truncate tracking-tighter sm:drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] text-right">
          {alphaLabel || ''}
        </span>
      </div>

      {/* Tactile 3D Operator Key */}
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full h-8.5 min-[380px]:h-9.5 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform duration-75 active:scale-95 select-none min-w-0 px-0.5 touch-manipulation',
          textClass,
          className
        )}
      >
        <span className="truncate">{op}</span>
      </button>
    </div>
  );
});
