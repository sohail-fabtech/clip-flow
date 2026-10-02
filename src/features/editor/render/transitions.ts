import type { CSSProperties } from 'react';
import type { TransitionType } from '@/features/editor/model/types';

export const TRANSITIONS: { type: TransitionType; label: string }[] = [
  { type: 'fade', label: 'Cross Dissolve' },
  { type: 'dipBlack', label: 'Dip to Black' },
  { type: 'dipWhite', label: 'Dip to White' },
  { type: 'slideLeft', label: 'Slide Left' },
  { type: 'slideRight', label: 'Slide Right' },
  { type: 'slideUp', label: 'Slide Up' },
  { type: 'slideDown', label: 'Slide Down' },
  { type: 'wipeLeft', label: 'Wipe Left' },
  { type: 'wipeRight', label: 'Wipe Right' },
  { type: 'flip', label: 'Flip' },
  { type: 'clockWipe', label: 'Clock Wipe' },
  { type: 'iris', label: 'Iris' },
  { type: 'zoom', label: 'Zoom' },
];

const pct = (value: number) => `${(value * 100).toFixed(3)}%`;

export function enterStyle(type: TransitionType, p: number): CSSProperties {
  switch (type) {
    case 'fade':
      return { opacity: p };
    case 'dipBlack':
    case 'dipWhite':
      return { opacity: Math.max(0, p * 2 - 1) };
    case 'slideLeft':
      return { translate: `${pct(1 - p)} 0` };
    case 'slideRight':
      return { translate: `${pct(p - 1)} 0` };
    case 'slideUp':
      return { translate: `0 ${pct(1 - p)}` };
    case 'slideDown':
      return { translate: `0 ${pct(p - 1)}` };
    case 'wipeLeft':
      return { clipPath: `inset(0 0 0 ${pct(1 - p)})` };
    case 'wipeRight':
      return { clipPath: `inset(0 ${pct(1 - p)} 0 0)` };
    case 'flip':
      return p < 0.5 ? { opacity: 0 } : { transform: `perspective(1600px) rotateY(${(1 - p) * 180}deg)` };
    case 'clockWipe':
      return { maskImage: `conic-gradient(#000 ${p * 360}deg, transparent ${p * 360}deg)` };
    case 'iris':
      return { clipPath: `circle(${pct(p * 0.75)} at 50% 50%)` };
    case 'zoom':
      return { opacity: p, scale: `${1.25 - 0.25 * p}` };
  }
}

export function exitStyle(type: TransitionType, p: number): CSSProperties {
  switch (type) {
    case 'dipBlack':
    case 'dipWhite':
      return { opacity: Math.max(0, 1 - p * 2) };
    case 'slideLeft':
      return { translate: `${pct(-p)} 0` };
    case 'slideRight':
      return { translate: `${pct(p)} 0` };
    case 'slideUp':
      return { translate: `0 ${pct(-p)}` };
    case 'slideDown':
      return { translate: `0 ${pct(p)}` };
    case 'flip':
      return p >= 0.5 ? { opacity: 0 } : { transform: `perspective(1600px) rotateY(${-p * 180}deg)` };
    default:
      return {};
  }
}

export const dipColor = (type: TransitionType) =>
  type === 'dipBlack' ? '#000000' : type === 'dipWhite' ? '#ffffff' : null;
