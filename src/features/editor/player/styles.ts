import type { CSSProperties } from 'react';
import type { Crop, ItemDetails } from '@/features/editor/types';

const ratioOf = (aspectRatio?: string) => {
  if (!aspectRatio || aspectRatio === 'original') return 'auto';
  const [width, height] = aspectRatio.split(':').map(Number);
  return `${width} / ${height}`;
};

const shadowOf = ({ boxShadow }: ItemDetails) =>
  boxShadow ? `${boxShadow.x}px ${boxShadow.y}px ${boxShadow.blur}px ${boxShadow.color}` : '';

export const calculateCropStyles = (details: ItemDetails, crop: Crop): CSSProperties => ({
  aspectRatio: ratioOf(details.aspectRatio),
  borderRadius: `${Math.min(crop.width, crop.height) * ((details.borderRadius || 0) / 100)}px`,
});

export const calculateMediaStyles = (details: ItemDetails, crop: Crop): CSSProperties => ({
  pointerEvents: 'none',
  boxShadow: [`0 0 0 ${details.borderWidth ?? 0}px ${details.borderColor ?? 'transparent'}`, shadowOf(details)]
    .filter(Boolean)
    .join(', '),
  ...calculateCropStyles(details, crop),
  overflow: 'hidden',
  width: crop.width || details.width,
  height: crop.height || details.height,
});

export const calculateTextStyles = (details: ItemDetails): CSSProperties => ({
  position: 'relative',
  textDecoration: details.textDecoration || 'none',
  WebkitTextStroke: `${details.borderWidth ?? 0}px ${details.borderColor ?? 'transparent'}`,
  paintOrder: 'stroke fill',
  textShadow: shadowOf(details),
  fontFamily: details.fontFamily || 'Arial',
  fontWeight: details.fontWeight || 'normal',
  lineHeight: details.lineHeight || 'normal',
  letterSpacing: details.letterSpacing || 'normal',
  wordSpacing: details.wordSpacing || 'normal',
  wordWrap: (details.wordWrap || 'normal') as CSSProperties['wordWrap'],
  wordBreak: (details.wordBreak || 'normal') as CSSProperties['wordBreak'],
  textTransform: (details.textTransform || 'none') as CSSProperties['textTransform'],
  fontSize: details.fontSize || '16px',
  textAlign: (details.textAlign || 'left') as CSSProperties['textAlign'],
  color: details.color || '#000000',
  backgroundColor: details.backgroundColor || 'transparent',
  borderRadius: `${Math.min(details.width ?? 0, details.height ?? 0) * ((details.borderRadius || 0) / 100)}px`,
});

export const calculateContainerStyles = (
  details: ItemDetails,
  crop: Partial<Crop> = {},
  overrides: CSSProperties = {},
): CSSProperties => ({
  pointerEvents: 'auto',
  top: details.top || 0,
  left: details.left || 0,
  width: crop.width || details.width || '100%',
  height: crop.height || details.height || 'auto',
  aspectRatio: ratioOf(details.aspectRatio),
  transform: [
    details.transform || 'none',
    `scale(${(details.zoom ?? 100) / 100})`,
    `rotate(${details.rotation ?? 0}deg)`,
    `scaleX(${details.flipHorizontal ? -1 : 1})`,
    `scaleY(${details.flipVertical ? -1 : 1})`,
  ].join(' '),
  opacity: details.opacity !== undefined ? details.opacity / 100 : 1,
  transformOrigin: details.transformOrigin || 'center center',
  filter: [
    `brightness(${details.brightness ?? 100}%)`,
    `contrast(${details.contrast ?? 100}%)`,
    `saturate(${details.saturation ?? 100}%)`,
    `hue-rotate(${details.hue ?? 0}deg)`,
    `grayscale(${details.grayscale ?? 0}%)`,
    `sepia(${details.sepia ?? 0}%)`,
    `blur(${details.blur ?? 0}px)`,
  ].join(' '),
  mixBlendMode: (details.blendMode || 'normal') as CSSProperties['mixBlendMode'],
  ...overrides,
});
