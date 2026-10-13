import { decimalToFraction, formatCasioNumber, cleanFloatingPoint } from '../casio-engine';

export interface RootResult {
  label: string;
  valueStr: string;
  fractionStr?: string;
  isComplex?: boolean;
}

export interface EquationSolution {
  type: 'UNIQUE' | 'NO_SOLUTION' | 'INFINITE_SOLUTIONS';
  title: string;
  roots: RootResult[];
  extremum?: {
    type: 'MIN' | 'MAX';
    xVal: string;
    yVal: string;
    xFrac?: string;
    yFrac?: string;
  };
}

/**
 * Solve Quadratic Equation: a*x^2 + b*x + c = 0
 */
export function solveQuadratic(a: number, b: number, c: number): EquationSolution {
  if (Math.abs(a) < 1e-12) {
    // Degenerates to linear bx + c = 0
    if (Math.abs(b) < 1e-12) {
      if (Math.abs(c) < 1e-12) {
        return { type: 'INFINITE_SOLUTIONS', title: 'Vô số nghiệm', roots: [] };
      }
      return { type: 'NO_SOLUTION', title: 'Vô nghiệm', roots: [] };
    }
    const x = -c / b;
    const frac = decimalToFraction(x);
    return {
      type: 'UNIQUE',
      title: 'Phương trình bậc 1',
      roots: [
        {
          label: 'x',
          valueStr: formatCasioNumber(x),
          fractionStr: frac && frac.denominator > 1 ? `${frac.numerator}/${frac.denominator}` : undefined,
        },
      ],
    };
  }

  const delta = b * b - 4 * a * c;
  const vertexX = -b / (2 * a);
  const vertexY = -delta / (4 * a);
  const vXFrac = decimalToFraction(vertexX);
  const vYFrac = decimalToFraction(vertexY);

  const extremum = {
    type: (a > 0 ? 'MIN' : 'MAX') as 'MIN' | 'MAX',
    xVal: formatCasioNumber(vertexX),
    yVal: formatCasioNumber(vertexY),
    xFrac: vXFrac && vXFrac.denominator > 1 ? `${vXFrac.numerator}/${vXFrac.denominator}` : undefined,
    yFrac: vYFrac && vYFrac.denominator > 1 ? `${vYFrac.numerator}/${vYFrac.denominator}` : undefined,
  };

  if (Math.abs(delta) < 1e-12) {
    // Nghiệm kép
    const x = vertexX;
    const frac = decimalToFraction(x);
    return {
      type: 'UNIQUE',
      title: 'Nghiệm kép (x1 = x2)',
      roots: [
        {
          label: 'x',
          valueStr: formatCasioNumber(x),
          fractionStr: frac && frac.denominator > 1 ? `${frac.numerator}/${frac.denominator}` : undefined,
        },
      ],
      extremum,
    };
  } else if (delta > 0) {
    const sqrtD = Math.sqrt(delta);
    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);
    const f1 = decimalToFraction(x1);
    const f2 = decimalToFraction(x2);

    return {
      type: 'UNIQUE',
      title: '2 nghiệm thực phân biệt',
      roots: [
        {
          label: 'x1',
          valueStr: formatCasioNumber(x1),
          fractionStr: f1 && f1.denominator > 1 ? `${f1.numerator}/${f1.denominator}` : undefined,
        },
        {
          label: 'x2',
          valueStr: formatCasioNumber(x2),
          fractionStr: f2 && f2.denominator > 1 ? `${f2.numerator}/${f2.denominator}` : undefined,
        },
      ],
      extremum,
    };
  } else {
    // Nghiệm phức: u +- v*i
    const u = vertexX;
    const v = Math.sqrt(-delta) / (2 * Math.abs(a));
    const uStr = formatCasioNumber(u);
    const vStr = formatCasioNumber(v);

    return {
      type: 'UNIQUE',
      title: '2 nghiệm phức liên hợp',
      roots: [
        {
          label: 'x1',
          valueStr: `${u !== 0 ? uStr + ' + ' : ''}${v === 1 ? '' : vStr}i`,
          isComplex: true,
        },
        {
          label: 'x2',
          valueStr: `${u !== 0 ? uStr + ' - ' : '-'}${v === 1 ? '' : vStr}i`,
          isComplex: true,
        },
      ],
      extremum,
    };
  }
}

/**
 * Solve Cubic Equation: a*x^3 + b*x^2 + c*x + d = 0
 */
export function solveCubic(a: number, b: number, c: number, d: number): EquationSolution {
  if (Math.abs(a) < 1e-12) {
    return solveQuadratic(b, c, d);
  }

  // Depress cubic x = t - b/(3a) -> t^3 + p*t + q = 0
  const bNorm = b / a;
  const cNorm = c / a;
  const dNorm = d / a;

  const p = cNorm - (bNorm * bNorm) / 3;
  const q = (2 * bNorm * bNorm * bNorm) / 27 - (bNorm * cNorm) / 3 + dNorm;
  const discriminant = (q * q) / 4 + (p * p * p) / 27;

  const roots: RootResult[] = [];
  const shift = -bNorm / 3;

  if (Math.abs(discriminant) < 1e-12) {
    if (Math.abs(p) < 1e-12 && Math.abs(q) < 1e-12) {
      // 3 nghiệm trùng nhau
      const x = shift;
      const f = decimalToFraction(x);
      roots.push({
        label: 'x1=x2=x3',
        valueStr: formatCasioNumber(x),
        fractionStr: f && f.denominator > 1 ? `${f.numerator}/${f.denominator}` : undefined,
      });
    } else {
      // 1 nghiệm đơn, 1 nghiệm kép
      const t1 = 3 * q / p;
      const t2 = -3 * q / (2 * p);
      const x1 = t1 + shift;
      const x2 = t2 + shift;
      const f1 = decimalToFraction(x1);
      const f2 = decimalToFraction(x2);
      roots.push(
        { label: 'x1', valueStr: formatCasioNumber(x1), fractionStr: f1 && f1.denominator > 1 ? `${f1.numerator}/${f1.denominator}` : undefined },
        { label: 'x2=x3', valueStr: formatCasioNumber(x2), fractionStr: f2 && f2.denominator > 1 ? `${f2.numerator}/${f2.denominator}` : undefined }
      );
    }
  } else if (discriminant > 0) {
    // 1 nghiệm thực duy nhất, 2 nghiệm phức
    const sqrtDisc = Math.sqrt(discriminant);
    const u = Math.cbrt(-q / 2 + sqrtDisc);
    const v = Math.cbrt(-q / 2 - sqrtDisc);
    const x1 = u + v + shift;
    const f1 = decimalToFraction(x1);
    roots.push({
      label: 'x1',
      valueStr: formatCasioNumber(x1),
      fractionStr: f1 && f1.denominator > 1 ? `${f1.numerator}/${f1.denominator}` : undefined,
    });

    const realPart = -(u + v) / 2 + shift;
    const imagPart = ((u - v) * Math.sqrt(3)) / 2;
    roots.push(
      { label: 'x2', valueStr: `${formatCasioNumber(realPart)} + ${formatCasioNumber(Math.abs(imagPart))}i`, isComplex: true },
      { label: 'x3', valueStr: `${formatCasioNumber(realPart)} - ${formatCasioNumber(Math.abs(imagPart))}i`, isComplex: true }
    );
  } else {
    // 3 nghiệm thực phân biệt (D < 0)
    const m = 2 * Math.sqrt(-p / 3);
    const theta = Math.acos((3 * q) / (p * m)) / 3;
    const r1 = m * Math.cos(theta) + shift;
    const r2 = m * Math.cos(theta - (2 * Math.PI) / 3) + shift;
    const r3 = m * Math.cos(theta - (4 * Math.PI) / 3) + shift;

    const list = [r1, r2, r3].sort((x, y) => y - x);
    list.forEach((val, idx) => {
      const f = decimalToFraction(val);
      roots.push({
        label: `x${idx + 1}`,
        valueStr: formatCasioNumber(val),
        fractionStr: f && f.denominator > 1 ? `${f.numerator}/${f.denominator}` : undefined,
      });
    });
  }

  return {
    type: 'UNIQUE',
    title: 'Phương trình bậc 3',
    roots,
  };
}

/**
 * Solve System of 2 Linear Equations:
 * a1*x + b1*y = c1
 * a2*x + b2*y = c2
 */
export function solveSystem2(a1: number, b1: number, c1: number, a2: number, b2: number, c2: number): EquationSolution {
  const D = a1 * b2 - a2 * b1;
  const Dx = c1 * b2 - c2 * b1;
  const Dy = a1 * c2 - a2 * c1;

  if (Math.abs(D) < 1e-12) {
    if (Math.abs(Dx) < 1e-12 && Math.abs(Dy) < 1e-12) {
      return { type: 'INFINITE_SOLUTIONS', title: 'Hệ có vô số nghiệm', roots: [] };
    }
    return { type: 'NO_SOLUTION', title: 'Hệ vô nghiệm', roots: [] };
  }

  const x = Dx / D;
  const y = Dy / D;
  const fX = decimalToFraction(x);
  const fY = decimalToFraction(y);

  return {
    type: 'UNIQUE',
    title: 'Hệ 2 phương trình bậc nhất 2 ẩn',
    roots: [
      {
        label: 'x',
        valueStr: formatCasioNumber(x),
        fractionStr: fX && fX.denominator > 1 ? `${fX.numerator}/${fX.denominator}` : undefined,
      },
      {
        label: 'y',
        valueStr: formatCasioNumber(y),
        fractionStr: fY && fY.denominator > 1 ? `${fY.numerator}/${fY.denominator}` : undefined,
      },
    ],
  };
}

/**
 * Solve System of 3 Linear Equations (Gaussian Elimination)
 * [A | B]
 */
export function solveSystem3(matrix: number[][]): EquationSolution {
  // matrix is 3x4: [ [a1, b1, c1, d1], [a2, b2, c2, d2], [a3, b3, c3, d3] ]
  const n = 3;
  const A = matrix.map((row) => [...row]);

  for (let i = 0; i < n; i++) {
    // Pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
        maxRow = k;
      }
    }
    const temp = A[i];
    A[i] = A[maxRow];
    A[maxRow] = temp;

    if (Math.abs(A[i][i]) < 1e-12) {
      return { type: 'NO_SOLUTION', title: 'Hệ vô nghiệm hoặc vô số nghiệm', roots: [] };
    }

    for (let k = i + 1; k < n; k++) {
      const factor = A[k][i] / A[i][i];
      for (let j = i; j <= n; j++) {
        A[k][j] -= factor * A[i][j];
      }
    }
  }

  // Back substitution
  const sol = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = A[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= A[i][j] * sol[j];
    }
    sol[i] = sum / A[i][i];
  }

  const varNames = ['x', 'y', 'z'];
  const roots: RootResult[] = sol.map((val, idx) => {
    const f = decimalToFraction(val);
    return {
      label: varNames[idx],
      valueStr: formatCasioNumber(val),
      fractionStr: f && f.denominator > 1 ? `${f.numerator}/${f.denominator}` : undefined,
    };
  });

  return {
    type: 'UNIQUE',
    title: 'Hệ 3 phương trình 3 ẩn',
    roots,
  };
}

/**
 * Solve System of 4 Linear Equations
 */
export function solveSystem4(matrix: number[][]): EquationSolution {
  const n = 4;
  const A = matrix.map((row) => [...row]);

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
    }
    const temp = A[i];
    A[i] = A[maxRow];
    A[maxRow] = temp;

    if (Math.abs(A[i][i]) < 1e-12) {
      return { type: 'NO_SOLUTION', title: 'Hệ vô nghiệm hoặc vô số nghiệm', roots: [] };
    }

    for (let k = i + 1; k < n; k++) {
      const factor = A[k][i] / A[i][i];
      for (let j = i; j <= n; j++) {
        A[k][j] -= factor * A[i][j];
      }
    }
  }

  const sol = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = A[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= A[i][j] * sol[j];
    }
    sol[i] = sum / A[i][i];
  }

  const varNames = ['x', 'y', 'z', 't'];
  const roots: RootResult[] = sol.map((val, idx) => {
    const f = decimalToFraction(val);
    return {
      label: varNames[idx],
      valueStr: formatCasioNumber(val),
      fractionStr: f && f.denominator > 1 ? `${f.numerator}/${f.denominator}` : undefined,
    };
  });

  return {
    type: 'UNIQUE',
    title: 'Hệ 4 phương trình 4 ẩn',
    roots,
  };
}

/**
 * Solve Quadratic Inequality:
 * opType:
 * 1: ax^2 + bx + c > 0
 * 2: ax^2 + bx + c < 0
 * 3: ax^2 + bx + c >= 0
 * 4: ax^2 + bx + c <= 0
 */
export function solveInequalityQuadratic(a: number, b: number, c: number, opType: 1 | 2 | 3 | 4): string {
  if (Math.abs(a) < 1e-12) {
    return 'Lỗi: Hệ số a phải khác 0 cho BPT bậc 2';
  }

  const delta = b * b - 4 * a * c;

  if (delta < 0) {
    // Tam thức cùng dấu với a với mọi x
    const isPositive = a > 0;
    if (opType === 1 || opType === 3) {
      return isPositive ? 'Mọi số thực R' : 'Vô nghiệm';
    } else {
      return isPositive ? 'Vô nghiệm' : 'Mọi số thực R';
    }
  } else if (Math.abs(delta) < 1e-12) {
    const x0 = -b / (2 * a);
    const x0Str = formatCasioNumber(x0);
    if (opType === 1) return a > 0 ? `x ≠ ${x0Str}` : 'Vô nghiệm';
    if (opType === 2) return a < 0 ? `x ≠ ${x0Str}` : 'Vô nghiệm';
    if (opType === 3) return a > 0 ? 'Mọi số thực R' : `x = ${x0Str}`;
    if (opType === 4) return a < 0 ? 'Mọi số thực R' : `x = ${x0Str}`;
  } else {
    const x1 = (-b - Math.sqrt(delta)) / (2 * a);
    const x2 = (-b + Math.sqrt(delta)) / (2 * a);
    const smaller = Math.min(x1, x2);
    const bigger = Math.max(x1, x2);
    const sStr = formatCasioNumber(smaller);
    const bStr = formatCasioNumber(bigger);

    // Dấu tam thức: cùng dấu a ngoài khoảng (x < smaller, x > bigger), trái dấu trong khoảng (smaller < x < bigger)
    if (a > 0) {
      switch (opType) {
        case 1: return `x < ${sStr} ; x > ${bStr}`;
        case 2: return `${sStr} < x < ${bStr}`;
        case 3: return `x ≤ ${sStr} ; x ≥ ${bStr}`;
        case 4: return `${sStr} ≤ x ≤ ${bStr}`;
      }
    } else {
      switch (opType) {
        case 1: return `${sStr} < x < ${bStr}`;
        case 2: return `x < ${sStr} ; x > ${bStr}`;
        case 3: return `${sStr} ≤ x ≤ ${bStr}`;
        case 4: return `x ≤ ${sStr} ; x ≥ ${bStr}`;
      }
    }
  }
  return 'Vô nghiệm';
}
