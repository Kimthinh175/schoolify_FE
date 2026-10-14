import { evaluateCasioExpression, formatCasioNumber, decimalToFraction } from '../casio-engine';

export interface TableRow {
  index: number;
  x: number;
  xStr: string;
  fxStr: string;
  fxFrac?: string;
  error?: boolean;
}

export function generateCasioTable(
  fxExpr: string,
  start: number,
  end: number,
  step: number
): { rows: TableRow[]; error?: string } {
  if (!fxExpr.trim()) {
    return { rows: [], error: 'Biểu thức f(x) trống' };
  }
  if (step <= 0) {
    return { rows: [], error: 'Bước nhảy (Step) phải lớn hơn 0' };
  }
  if (start > end) {
    return { rows: [], error: 'Start phải nhỏ hơn hoặc bằng End' };
  }

  const count = Math.floor((end - start) / step) + 1;
  if (count > 80) {
    return { rows: [], error: 'Số dòng vượt quá giới hạn (tối đa 80 dòng)' };
  }

  const rows: TableRow[] = [];
  let curX = start;
  let idx = 1;

  while (curX <= end + 1e-9 && rows.length < 80) {
    const roundedX = parseFloat(curX.toFixed(8));
    const evalRes = evaluateCasioExpression(fxExpr, 'RAD', 0, { x: roundedX });

    if (evalRes.success && evalRes.value !== undefined) {
      const val = evalRes.value;
      const frac = decimalToFraction(val);
      rows.push({
        index: idx,
        x: roundedX,
        xStr: formatCasioNumber(roundedX),
        fxStr: formatCasioNumber(val),
        fxFrac: frac && frac.denominator > 1 ? `${frac.numerator}/${frac.denominator}` : undefined,
      });
    } else {
      rows.push({
        index: idx,
        x: roundedX,
        xStr: formatCasioNumber(roundedX),
        fxStr: 'ERROR',
        error: true,
      });
    }

    curX += step;
    idx++;
  }

  return { rows };
}
