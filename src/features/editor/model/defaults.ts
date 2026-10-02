import { nanoid } from 'nanoid';
import type {
  Asset,
  AudioClip,
  AudioSettings,
  Grade,
  ImageClip,
  Project,
  ShapeClip,
  TextClip,
  TextStyle,
  Track,
  TrackKind,
  Transform,
  VideoClip,
} from '@/features/editor/model/types';

export const DEFAULT_IMAGE_SECONDS = 5;
export const DEFAULT_TEXT_SECONDS = 5;

export const identityCurve = () => [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
];

export const flatHueCurve = () => [
  { x: 0, y: 0.5 },
  { x: 1, y: 0.5 },
];

export const defaultTransform = (): Transform => ({
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  opacity: 1,
  flipH: false,
  flipV: false,
  crop: { top: 0, right: 0, bottom: 0, left: 0 },
  blend: 'normal',
  edgeSoftness: 0,
  edgeRounding: 0,
});

export const defaultGrade = (): Grade => ({
  basic: {
    enabled: true,
    exposure: 0,
    contrast: 0,
    highlights: 0,
    shadows: 0,
    blacks: 0,
    whites: 0,
    temperature: 0,
    tint: 0,
    vibrance: 0,
    saturation: 0,
  },
  curves: { enabled: true, master: identityCurve(), red: identityCurve(), green: identityCurve(), blue: identityCurve() },
  wheels: {
    enabled: true,
    lift: { x: 0, y: 0, master: 0 },
    gamma: { x: 0, y: 0, master: 0 },
    gain: { x: 0, y: 0, master: 0 },
  },
  hueCurves: { enabled: true, hueVsHue: flatHueCurve(), hueVsSat: flatHueCurve(), hueVsLum: flatHueCurve() },
  lut: { enabled: true, name: '', src: '', intensity: 1 },
  effects: {
    enabled: true,
    clarity: 0,
    dehaze: 0,
    sharpen: 0,
    noiseReduction: 0,
    blur: 0,
    motionBlur: 0,
    motionAngle: 0,
    vignette: 0,
    vignetteMidpoint: 0.5,
    vignetteRoundness: 0,
    vignetteFeather: 0.5,
    grain: 0,
    grainSize: 1,
    glow: 0,
    glowRadius: 10,
    glowThreshold: 0.7,
    glowWarmth: 0,
    chromaKey: false,
    chromaColor: '#00ff00',
    chromaTolerance: 0.3,
    chromaSpill: 0.5,
    invert: false,
  },
});

export const defaultAudio = (): AudioSettings => ({ volumeDb: 0, fadeIn: 0, fadeOut: 0 });

export const defaultTextStyle = (): TextStyle => ({
  fontFamily: 'Roboto-Bold',
  fontUrl: 'https://fonts.gstatic.com/s/roboto/v29/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf',
  fontSize: 96,
  fontWeight: 700,
  italic: false,
  underline: false,
  uppercase: false,
  align: 'center',
  lineHeight: 1.2,
  letterSpacing: 0,
  color: '#ffffff',
  strokeColor: '#000000',
  strokeWidth: 0,
  shadowColor: '#000000',
  shadowX: 0,
  shadowY: 0,
  shadowBlur: 0,
  backgroundColor: 'transparent',
  backgroundPadding: 16,
  backgroundRadius: 12,
  maxWidth: 0.9,
  tilt: 0,
});

export const makeTrack = (kind: TrackKind, index: number): Track => ({
  id: nanoid(),
  kind,
  name: `${kind === 'video' ? 'V' : 'A'}${index}`,
  locked: false,
  hidden: false,
  muted: false,
});

export function createProject(name = 'Untitled project'): Project {
  const now = Date.now();
  return {
    id: nanoid(),
    name,
    createdAt: now,
    updatedAt: now,
    settings: { width: 1920, height: 1080, fps: 30, background: '#000000' },
    tracks: [makeTrack('video', 2), makeTrack('video', 1), makeTrack('audio', 1), makeTrack('audio', 2)],
    clips: {},
    assets: {},
    folders: [],
    markers: [],
    inPoint: null,
    outPoint: null,
  };
}

const base = (trackId: string, start: number, duration: number, name: string) => ({
  id: nanoid(),
  trackId,
  name,
  start,
  duration,
  linkId: null,
  keyframes: {},
  transitionIn: null,
});

export function clipFromAsset(asset: Asset, trackId: string, start: number, fps: number) {
  const seconds = asset.kind === 'image' ? DEFAULT_IMAGE_SECONDS : asset.durationSec;
  const duration = Math.max(1, Math.round(seconds * fps));
  if (asset.kind === 'image') {
    return {
      ...base(trackId, start, duration, asset.name),
      kind: 'image',
      assetId: asset.id,
      transform: defaultTransform(),
      grade: defaultGrade(),
    } satisfies ImageClip;
  }
  if (asset.kind === 'audio') {
    return {
      ...base(trackId, start, duration, asset.name),
      kind: 'audio',
      assetId: asset.id,
      sourceIn: 0,
      speed: 1,
      audio: defaultAudio(),
    } satisfies AudioClip;
  }
  return {
    ...base(trackId, start, duration, asset.name),
    kind: 'video',
    assetId: asset.id,
    sourceIn: 0,
    speed: 1,
    audio: defaultAudio(),
    muted: false,
    transform: defaultTransform(),
    grade: defaultGrade(),
  } satisfies VideoClip;
}

export function createTextClip(trackId: string, start: number, fps: number, content = 'Your text'): TextClip {
  return {
    ...base(trackId, start, DEFAULT_TEXT_SECONDS * fps, content),
    kind: 'text',
    transform: defaultTransform(),
    grade: defaultGrade(),
    text: { content, style: defaultTextStyle(), animation: 'none', highlightColor: '#ffd900', caption: false },
  };
}

export function createShapeClip(trackId: string, start: number, fps: number, shape: 'rectangle' | 'ellipse'): ShapeClip {
  return {
    ...base(trackId, start, DEFAULT_IMAGE_SECONDS * fps, shape === 'rectangle' ? 'Rectangle' : 'Ellipse'),
    kind: 'shape',
    transform: defaultTransform(),
    grade: defaultGrade(),
    shapeContent: { shape, width: 400, height: 400, fill: '#ffffff', strokeColor: '#000000', strokeWidth: 0, radius: 0 },
  };
}
