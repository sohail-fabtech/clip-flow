import type { CurvePoint, Grade, Transform } from '@/features/editor/model/types';
import { defaultGrade } from '@/features/editor/model/defaults';

const SIZE = 256;

export function sampleCurve(points: CurvePoint[], size = SIZE) {
  const sorted = [...points].sort((a, b) => a.x - b.x);
  const n = sorted.length;
  const out = new Float32Array(size);
  if (n === 0) {
    for (let i = 0; i < size; i++) out[i] = i / (size - 1);
    return out;
  }
  const xs = sorted.map(p => p.x);
  const ys = sorted.map(p => p.y);
  const slopes = xs.slice(1).map((x, i) => (ys[i + 1] - ys[i]) / (x - xs[i] || 1e-6));
  const tangents = xs.map((_, i) => {
    if (i === 0) return slopes[0] ?? 0;
    if (i === n - 1) return slopes[n - 2] ?? 0;
    return slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2;
  });
  for (let i = 0; i < size; i++) {
    const x = i / (size - 1);
    let y: number;
    if (x <= xs[0]) y = ys[0];
    else if (x >= xs[n - 1]) y = ys[n - 1];
    else {
      const k = xs.findIndex(v => v > x) - 1;
      const h = xs[k + 1] - xs[k];
      const t = (x - xs[k]) / h;
      const t2 = t * t;
      const t3 = t2 * t;
      y =
        (2 * t3 - 3 * t2 + 1) * ys[k] +
        (t3 - 2 * t2 + t) * h * tangents[k] +
        (-2 * t3 + 3 * t2) * ys[k + 1] +
        (t3 - t2) * h * tangents[k + 1];
    }
    out[i] = Math.min(1, Math.max(0, y));
  }
  return out;
}

export function curveTexture(grade: Grade['curves']) {
  const [m, r, g, b] = [grade.master, grade.red, grade.green, grade.blue].map(p => sampleCurve(p));
  const data = new Uint8Array(SIZE * 4);
  for (let i = 0; i < SIZE; i++) {
    data[i * 4] = Math.round(r[Math.round(m[i] * 255)] * 255);
    data[i * 4 + 1] = Math.round(g[Math.round(m[i] * 255)] * 255);
    data[i * 4 + 2] = Math.round(b[Math.round(m[i] * 255)] * 255);
    data[i * 4 + 3] = 255;
  }
  return data;
}

export function hueTexture(grade: Grade['hueCurves']) {
  const [hue, sat, lum] = [grade.hueVsHue, grade.hueVsSat, grade.hueVsLum].map(p => sampleCurve(p));
  const data = new Uint8Array(SIZE * 4);
  for (let i = 0; i < SIZE; i++) {
    data[i * 4] = Math.round(hue[i] * 255);
    data[i * 4 + 1] = Math.round(sat[i] * 255);
    data[i * 4 + 2] = Math.round(lum[i] * 255);
    data[i * 4 + 3] = 255;
  }
  return data;
}

export interface CubeLut {
  size: number;
  data: Uint8Array;
}

export function parseCube(text: string): CubeLut {
  let size = 0;
  const values: number[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('TITLE') || line.startsWith('DOMAIN')) continue;
    if (line.startsWith('LUT_3D_SIZE')) {
      size = Number(line.split(/\s+/)[1]);
      continue;
    }
    if (line.startsWith('LUT_1D_SIZE')) throw new Error('1D LUTs are not supported');
    const parts = line.split(/\s+/).map(Number);
    if (parts.length === 3 && parts.every(Number.isFinite)) values.push(...parts);
  }
  if (!size || values.length !== size ** 3 * 3) throw new Error('Invalid .cube file');
  const data = new Uint8Array(size ** 3 * 4);
  for (let i = 0; i < size ** 3; i++) {
    data[i * 4] = Math.round(Math.min(1, Math.max(0, values[i * 3])) * 255);
    data[i * 4 + 1] = Math.round(Math.min(1, Math.max(0, values[i * 3 + 1])) * 255);
    data[i * 4 + 2] = Math.round(Math.min(1, Math.max(0, values[i * 3 + 2])) * 255);
    data[i * 4 + 3] = 255;
  }
  return { size, data };
}

const DEFAULT = defaultGrade();
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export const sectionActive = {
  basic: (g: Grade) => g.basic.enabled && !same({ ...g.basic, enabled: true }, DEFAULT.basic),
  curves: (g: Grade) => g.curves.enabled && !same({ ...g.curves, enabled: true }, DEFAULT.curves),
  wheels: (g: Grade) => g.wheels.enabled && !same({ ...g.wheels, enabled: true }, DEFAULT.wheels),
  hueCurves: (g: Grade) => g.hueCurves.enabled && !same({ ...g.hueCurves, enabled: true }, DEFAULT.hueCurves),
  lut: (g: Grade) => g.lut.enabled && !!g.lut.src && g.lut.intensity > 0,
  effects: (g: Grade) => g.effects.enabled && !same({ ...g.effects, enabled: true }, DEFAULT.effects),
};

export const needsGl = (grade: Grade, transform: Transform) =>
  transform.edgeSoftness > 0 || Object.values(sectionActive).some(active => active(grade));
