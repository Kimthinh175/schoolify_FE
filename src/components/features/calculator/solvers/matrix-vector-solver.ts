import { formatCasioNumber } from '../casio-engine';

export function det2x2(m: number[][]): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

export function det3x3(m: number[][]): number {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

export function vectorDot(u: number[], v: number[]): number {
  return u.reduce((sum, val, idx) => sum + val * (v[idx] || 0), 0);
}

export function vectorCross3D(u: number[], v: number[]): number[] {
  return [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
}

export function vectorNorm(u: number[]): number {
  return Math.sqrt(u.reduce((sum, val) => sum + val * val, 0));
}
