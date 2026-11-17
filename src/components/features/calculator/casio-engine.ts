import { AngleUnit } from './casio-types';

let sharedAudioCtx: AudioContext | null = null;

function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      sharedAudioCtx = new AudioContextClass();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/**
 * Web Audio API synthesizer for tactile mechanical key click sound
 * 100% offline, zero external sound files, completely browser-native.
 * Uses a singleton AudioContext to ensure sub-millisecond execution (< 0.5ms) on mobile.
 */
export function playCasioKeyClick(volume = 0.04) {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.025);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.028);
  } catch {
    // Ignore audio permission or context restrictions silently
  }
}

/**
 * Continued fraction algorithm to convert floating-point decimal numbers to exact fractions.
 */
export function decimalToFraction(val: number, tolerance = 1.0e-9, maxDenominator = 100000): { numerator: number; denominator: number } | null {
  if (isNaN(val) || !isFinite(val)) return null;
  if (Math.abs(val) < 1.0e-12) return { numerator: 0, denominator: 1 };

  const sign = val < 0 ? -1 : 1;
  val = Math.abs(val);

  // If already an integer
  if (Math.abs(val - Math.round(val)) < tolerance) {
    return { numerator: sign * Math.round(val), denominator: 1 };
  }

  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = val;
  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(val - h1 / k1) > val * tolerance && k1 < maxDenominator);

  if (k1 <= maxDenominator && Math.abs(val - h1 / k1) <= tolerance) {
    return { numerator: sign * h1, denominator: k1 };
  }

  return null;
}

/**
 * Helper to compute factorial
 */
export function factorial(n: number): number {
  if (n < 0 || Math.floor(n) !== n) throw new Error('Math ERROR');
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity; // overflow in JS
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

/**
 * Permutation nPr
 */
export function nPr(n: number, r: number): number {
  if (n < 0 || r < 0 || r > n || Math.floor(n) !== n || Math.floor(r) !== r) {
    throw new Error('Math ERROR');
  }
  return factorial(n) / factorial(n - r);
}

/**
 * Combination nCr
 */
export function nCr(n: number, r: number): number {
  if (n < 0 || r < 0 || r > n || Math.floor(n) !== n || Math.floor(r) !== r) {
    throw new Error('Math ERROR');
  }
  return factorial(n) / (factorial(r) * factorial(n - r));
}

/**
 * Greatest Common Divisor
 */
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/**
 * Least Common Multiple
 */
export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(Math.round(a * b)) / gcd(a, b);
}

/**
 * Evaluates a mathematical string in the context of Casio scientific functions.
 */
export function evaluateCasioExpression(
  rawExpr: string,
  angleUnit: AngleUnit,
  lastAns: number = 0,
  variables: Record<string, number> = {}
): {
  success: boolean;
  value?: number;
  fractionStr?: string;
  error?: string;
} {
  if (!rawExpr || !rawExpr.trim()) {
    return { success: true, value: 0 };
  }

  try {
    let expr = rawExpr;

    // Substitute stored variables (A, B, C, D, E, F, x, y, M)
    Object.keys(variables).forEach((varKey) => {
      const reg = new RegExp(`\\b${varKey}\\b`, 'g');
      expr = expr.replace(reg, `(${variables[varKey]})`);
    });

    // Replace display symbols with math equivalents
    expr = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/π/g, `(${Math.PI})`)
      .replace(/e\b/g, `(${Math.E})`)
      .replace(/Ans\b/g, `(${lastAns})`);

    // Handle percentage: e.g. 50% -> (50/100)
    expr = expr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

    // Handle permutations (5P2) and combinations (5C2) authentic to Casio display
    expr = expr.replace(/(\d+(\.\d+)?)P(\d+(\.\d+)?)/g, 'nPr($1,$3)');
    expr = expr.replace(/(\d+(\.\d+)?)C(\d+(\.\d+)?)/g, 'nCr($1,$3)');

    // Handle factorials: e.g. 5! -> fact(5)
    expr = expr.replace(/(\d+(\.\d+)?)!/g, 'fact($1)');

    // Handle square root: √(x) or √x
    expr = expr.replace(/√\(([^)]+)\)/g, 'sqrt($1)');
    expr = expr.replace(/√(\d+(\.\d+)?)/g, 'sqrt($1)');

    // Handle cube root: ∛(x)
    expr = expr.replace(/∛\(([^)]+)\)/g, 'cbrt($1)');
    expr = expr.replace(/∛(\d+(\.\d+)?)/g, 'cbrt($1)');

    // Handle DMS: e.g. 30°15'20" -> 30 + 15/60 + 20/3600
    expr = expr.replace(/(\d+)°((\d+)')?((\d+)")?/g, (_, deg, _2, min, _4, sec) => {
      const d = parseFloat(deg) || 0;
      const m = parseFloat(min) || 0;
      const s = parseFloat(sec) || 0;
      return `(${d + m / 60 + s / 3600})`;
    });

    // Automatically balance unclosed parentheses
    const openParens = (expr.match(/\(/g) || []).length;
    const closeParens = (expr.match(/\)/g) || []).length;
    if (openParens > closeParens) {
      expr += ')'.repeat(openParens - closeParens);
    }

    // Implicit multiplication:
    // e.g. 2(3) -> 2*(3), (2)(3) -> (2)*(3), 2sqrt(4) -> 2*sqrt(4), 2sin(30) -> 2*sin(30)
    expr = expr.replace(/(\d)\s*\(/g, '$1*(');
    expr = expr.replace(/\)\s*(\d)/g, ')*$1');
    expr = expr.replace(/\)\s*\(/g, ')*(');
    expr = expr.replace(/(\d)\s*(sin|cos|tan|asin|acos|atan|log|ln|sqrt|cbrt|abs|gcd|lcm)/g, '$1*$2');
    expr = expr.replace(/\)\s*(sin|cos|tan|asin|acos|atan|log|ln|sqrt|cbrt|abs|gcd|lcm)/g, ')*$2');

    // Parse and evaluate with recursive descent / token evaluator
    const val = parseAndEval(expr, angleUnit);

    if (isNaN(val)) {
      return { success: false, error: 'Math ERROR' };
    }
    if (!isFinite(val)) {
      return { success: false, error: val > 0 ? 'Math ERROR (∞)' : 'Math ERROR (-∞)' };
    }

    // Clean up precision artifacts like 0.30000000000000004
    const cleanVal = cleanFloatingPoint(val);

    // Try finding exact fraction
    const frac = decimalToFraction(cleanVal);
    let fractionStr: string | undefined;
    if (frac && frac.denominator > 1 && frac.denominator <= 10000) {
      fractionStr = `${frac.numerator}/${frac.denominator}`;
    }

    return {
      success: true,
      value: cleanVal,
      fractionStr,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Syntax ERROR',
    };
  }
}

/**
 * Tokenizer & Shunting-yard + RPN evaluator for secure, sandbox-safe math calculation
 */
function parseAndEval(expression: string, angleUnit: AngleUnit): number {
  const toRad = (angle: number) => {
    if (angleUnit === 'DEG') return (angle * Math.PI) / 180;
    if (angleUnit === 'GRA') return (angle * Math.PI) / 200;
    return angle; // RAD
  };

  const fromRad = (rad: number) => {
    if (angleUnit === 'DEG') return (rad * 180) / Math.PI;
    if (angleUnit === 'GRA') return (rad * 200) / Math.PI;
    return rad; // RAD
  };

  const functions: Record<string, (args: number[]) => number> = {
    sin: (args) => Math.sin(toRad(args[0])),
    cos: (args) => Math.cos(toRad(args[0])),
    tan: (args) => {
      const cosVal = Math.cos(toRad(args[0]));
      if (Math.abs(cosVal) < 1e-15) throw new Error('Math ERROR');
      return Math.tan(toRad(args[0]));
    },
    asin: (args) => {
      if (args[0] < -1 || args[0] > 1) throw new Error('Math ERROR');
      return fromRad(Math.asin(args[0]));
    },
    acos: (args) => {
      if (args[0] < -1 || args[0] > 1) throw new Error('Math ERROR');
      return fromRad(Math.acos(args[0]));
    },
    atan: (args) => fromRad(Math.atan(args[0])),
    log: (args) => {
      if (args[0] <= 0) throw new Error('Math ERROR');
      return Math.log10(args[0]);
    },
    ln: (args) => {
      if (args[0] <= 0) throw new Error('Math ERROR');
      return Math.log(args[0]);
    },
    sqrt: (args) => {
      if (args[0] < 0) throw new Error('Math ERROR');
      return Math.sqrt(args[0]);
    },
    cbrt: (args) => Math.cbrt(args[0]),
    abs: (args) => Math.abs(args[0]),
    fact: (args) => factorial(args[0]),
    nPr: (args) => nPr(args[0], args[1]),
    nCr: (args) => nCr(args[0], args[1]),
    gcd: (args) => gcd(args[0], args[1]),
    lcm: (args) => lcm(args[0], args[1]),
  };

  // Tokenize
  const tokens: string[] = [];
  let i = 0;
  const isDigit = (c: string) => /\d/.test(c) || c === '.';
  const isLetter = (c: string) => /[a-zA-Z]/.test(c);

  while (i < expression.length) {
    const ch = expression[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (isDigit(ch)) {
      let numStr = '';
      while (i < expression.length && (isDigit(expression[i]) || expression[i] === 'e' || expression[i] === 'E')) {
        if ((expression[i] === 'e' || expression[i] === 'E') && i + 1 < expression.length && (expression[i + 1] === '-' || expression[i + 1] === '+')) {
          numStr += expression[i] + expression[i + 1];
          i += 2;
        } else {
          numStr += expression[i];
          i++;
        }
      }
      tokens.push(numStr);
      continue;
    }

    if (isLetter(ch)) {
      let fnStr = '';
      while (i < expression.length && isLetter(expression[i])) {
        fnStr += expression[i];
        i++;
      }
      tokens.push(fnStr);
      continue;
    }

    // Unary minus
    if (ch === '-') {
      const prevToken = tokens[tokens.length - 1];
      if (!prevToken || prevToken === '(' || ['+', '-', '*', '/', '^', ','].includes(prevToken)) {
        tokens.push('u-');
        i++;
        continue;
      }
    }

    if (ch === '+') {
      const prevToken = tokens[tokens.length - 1];
      if (!prevToken || prevToken === '(' || ['+', '-', '*', '/', '^', ','].includes(prevToken)) {
        i++;
        continue;
      }
    }

    if (['+', '-', '*', '/', '^', '(', ')', ','].includes(ch)) {
      tokens.push(ch);
      i++;
      continue;
    }

    throw new Error('Syntax ERROR');
  }

  // Shunting-yard Algorithm
  const outputQueue: string[] = [];
  const opStack: string[] = [];

  const precedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 4,
    'u-': 3,
  };

  const isRightAssociative = (op: string) => op === '^' || op === 'u-';

  for (const token of tokens) {
    if (!isNaN(Number(token))) {
      outputQueue.push(token);
    } else if (token in functions) {
      opStack.push(token);
    } else if (token === ',') {
      while (opStack.length && opStack[opStack.length - 1] !== '(') {
        outputQueue.push(opStack.pop()!);
      }
    } else if (token in precedence) {
      while (
        opStack.length &&
        opStack[opStack.length - 1] !== '(' &&
        (precedence[opStack[opStack.length - 1]] > precedence[token] ||
          (precedence[opStack[opStack.length - 1]] === precedence[token] && !isRightAssociative(token)))
      ) {
        outputQueue.push(opStack.pop()!);
      }
      opStack.push(token);
    } else if (token === '(') {
      opStack.push(token);
    } else if (token === ')') {
      while (opStack.length && opStack[opStack.length - 1] !== '(') {
        outputQueue.push(opStack.pop()!);
      }
      if (opStack.length === 0) throw new Error('Syntax ERROR');
      opStack.pop();

      if (opStack.length && opStack[opStack.length - 1] in functions) {
        outputQueue.push(opStack.pop()!);
      }
    } else {
      throw new Error('Syntax ERROR');
    }
  }

  while (opStack.length) {
    const top = opStack.pop()!;
    if (top === '(' || top === ')') throw new Error('Syntax ERROR');
    outputQueue.push(top);
  }

  // Evaluate RPN
  const evalStack: number[] = [];
  for (const token of outputQueue) {
    if (!isNaN(Number(token))) {
      evalStack.push(Number(token));
    } else if (token === 'u-') {
      if (evalStack.length < 1) throw new Error('Syntax ERROR');
      evalStack.push(-evalStack.pop()!);
    } else if (token in functions) {
      const fn = functions[token];
      if (['nPr', 'nCr', 'gcd', 'lcm'].includes(token)) {
        if (evalStack.length < 2) throw new Error('Syntax ERROR');
        const b = evalStack.pop()!;
        const a = evalStack.pop()!;
        evalStack.push(fn([a, b]));
      } else {
        if (evalStack.length < 1) throw new Error('Syntax ERROR');
        const a = evalStack.pop()!;
        evalStack.push(fn([a]));
      }
    } else if (token in precedence) {
      if (evalStack.length < 2) throw new Error('Syntax ERROR');
      const b = evalStack.pop()!;
      const a = evalStack.pop()!;
      switch (token) {
        case '+':
          evalStack.push(a + b);
          break;
        case '-':
          evalStack.push(a - b);
          break;
        case '*':
          evalStack.push(a * b);
          break;
        case '/':
          if (b === 0) throw new Error('Math ERROR');
          evalStack.push(a / b);
          break;
        case '^':
          evalStack.push(Math.pow(a, b));
          break;
      }
    }
  }

  if (evalStack.length !== 1) throw new Error('Syntax ERROR');
  return evalStack[0];
}

/**
 * Fix floating point rounding errors
 */
export function cleanFloatingPoint(val: number): number {
  if (Math.abs(val) < 1e-12) return 0;
  const rounded = Math.round(val);
  if (Math.abs(val - rounded) < 1e-11) return rounded;
  return parseFloat(val.toPrecision(12));
}

/**
 * Format number for Casio LCD output display
 */
export function formatCasioNumber(val: number): string {
  if (isNaN(val)) return 'Error';
  if (!isFinite(val)) return val > 0 ? 'Infinity' : '-Infinity';

  const absVal = Math.abs(val);
  if (absVal >= 1e10 || (absVal > 0 && absVal < 1e-9)) {
    return val.toExponential(6).replace('e+', ' × 10^').replace('e-', ' × 10^-');
  }

  return val.toLocaleString('en-US', {
    maximumFractionDigits: 10,
    useGrouping: false,
  });
}
