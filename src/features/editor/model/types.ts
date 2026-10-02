export type TrackKind = 'video' | 'audio';
export type ClipKind = 'video' | 'image' | 'audio' | 'text' | 'shape';
export type AssetKind = 'video' | 'image' | 'audio';

export interface Track {
  id: string;
  kind: TrackKind;
  name: string;
  locked: boolean;
  hidden: boolean;
  muted: boolean;
}

export interface Asset {
  id: string;
  kind: AssetKind;
  name: string;
  src: string;
  folderId: string | null;
  durationSec: number;
  width: number;
  height: number;
  hasAudio: boolean;
  size: number;
  createdAt: number;
}

export interface Folder {
  id: string;
  name: string;
}

export type Easing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'hold';

export interface Keyframe {
  frame: number;
  value: number;
  easing: Easing;
}

export const ANIMATABLE = ['x', 'y', 'scale', 'rotation', 'opacity', 'volume'] as const;
export type AnimProp = (typeof ANIMATABLE)[number];

export const BLEND_MODES = [
  'normal',
  'darken',
  'multiply',
  'color-burn',
  'lighten',
  'screen',
  'color-dodge',
  'overlay',
  'soft-light',
  'hard-light',
  'difference',
  'exclusion',
  'hue',
  'saturation',
  'color',
  'luminosity',
] as const;
export type BlendMode = (typeof BLEND_MODES)[number];

export interface Crop {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  flipH: boolean;
  flipV: boolean;
  crop: Crop;
  blend: BlendMode;
  edgeSoftness: number;
  edgeRounding: number;
}

export interface CurvePoint {
  x: number;
  y: number;
}

export interface Wheel {
  x: number;
  y: number;
  master: number;
}

export interface Grade {
  basic: {
    enabled: boolean;
    exposure: number;
    contrast: number;
    highlights: number;
    shadows: number;
    blacks: number;
    whites: number;
    temperature: number;
    tint: number;
    vibrance: number;
    saturation: number;
  };
  curves: { enabled: boolean; master: CurvePoint[]; red: CurvePoint[]; green: CurvePoint[]; blue: CurvePoint[] };
  wheels: { enabled: boolean; lift: Wheel; gamma: Wheel; gain: Wheel };
  hueCurves: { enabled: boolean; hueVsHue: CurvePoint[]; hueVsSat: CurvePoint[]; hueVsLum: CurvePoint[] };
  lut: { enabled: boolean; name: string; src: string; intensity: number };
  effects: {
    enabled: boolean;
    clarity: number;
    dehaze: number;
    sharpen: number;
    noiseReduction: number;
    blur: number;
    motionBlur: number;
    motionAngle: number;
    vignette: number;
    vignetteMidpoint: number;
    vignetteRoundness: number;
    vignetteFeather: number;
    grain: number;
    grainSize: number;
    glow: number;
    glowRadius: number;
    glowThreshold: number;
    glowWarmth: number;
    chromaKey: boolean;
    chromaColor: string;
    chromaTolerance: number;
    chromaSpill: number;
    invert: boolean;
  };
}

export interface AudioSettings {
  volumeDb: number;
  fadeIn: number;
  fadeOut: number;
}

export type TransitionType =
  | 'fade'
  | 'dipBlack'
  | 'dipWhite'
  | 'slideLeft'
  | 'slideRight'
  | 'slideUp'
  | 'slideDown'
  | 'wipeLeft'
  | 'wipeRight'
  | 'flip'
  | 'clockWipe'
  | 'iris'
  | 'zoom';

export interface Transition {
  type: TransitionType;
  duration: number;
}

export const TEXT_ANIMATIONS = [
  'none',
  'popIn',
  'slideUp',
  'typewriter',
  'wordReveal',
  'wordSlide',
  'highlight',
  'highlightBlock',
] as const;
export type TextAnimation = (typeof TEXT_ANIMATIONS)[number];

export interface TextStyle {
  fontFamily: string;
  fontUrl: string;
  fontSize: number;
  fontWeight: number;
  italic: boolean;
  underline: boolean;
  uppercase: boolean;
  align: 'left' | 'center' | 'right';
  lineHeight: number;
  letterSpacing: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  shadowColor: string;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  backgroundColor: string;
  backgroundPadding: number;
  backgroundRadius: number;
  maxWidth: number;
  tilt: number;
}

export interface TextContent {
  content: string;
  style: TextStyle;
  animation: TextAnimation;
  highlightColor: string;
  caption: boolean;
}

export interface ShapeContent {
  shape: 'rectangle' | 'ellipse';
  width: number;
  height: number;
  fill: string;
  strokeColor: string;
  strokeWidth: number;
  radius: number;
}

interface ClipBase {
  id: string;
  trackId: string;
  name: string;
  start: number;
  duration: number;
  linkId: string | null;
  keyframes: Partial<Record<AnimProp, Keyframe[]>>;
  transitionIn: Transition | null;
}

interface MediaFields {
  assetId: string;
  sourceIn: number;
  speed: number;
  audio: AudioSettings;
}

interface VisualFields {
  transform: Transform;
  grade: Grade;
}

export type VideoClip = ClipBase & MediaFields & VisualFields & { kind: 'video'; muted: boolean };
export type ImageClip = ClipBase & VisualFields & { kind: 'image'; assetId: string };
export type AudioClip = ClipBase & MediaFields & { kind: 'audio' };
export type TextClip = ClipBase & VisualFields & { kind: 'text'; text: TextContent };
export type ShapeClip = ClipBase & VisualFields & { kind: 'shape'; shapeContent: ShapeContent };

export type Clip = VideoClip | ImageClip | AudioClip | TextClip | ShapeClip;
export type VisualClip = VideoClip | ImageClip | TextClip | ShapeClip;
export type MediaClip = VideoClip | AudioClip;

export interface Marker {
  id: string;
  frame: number;
  duration: number;
  name: string;
  color: string;
  comment: string;
}

export interface ProjectSettings {
  width: number;
  height: number;
  fps: number;
  background: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  settings: ProjectSettings;
  tracks: Track[];
  clips: Record<string, Clip>;
  assets: Record<string, Asset>;
  folders: Folder[];
  markers: Marker[];
  inPoint: number | null;
  outPoint: number | null;
}

export const isVisual = (clip: Clip): clip is VisualClip => clip.kind !== 'audio';
export const hasMedia = (clip: Clip): clip is MediaClip => clip.kind === 'video' || clip.kind === 'audio';
