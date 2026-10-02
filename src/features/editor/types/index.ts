import type { RefObject } from 'react';
import type { PlayerRef } from '@remotion/player';
import type { ITrackItemBase, State } from '@designcombo/types';
import type CanvasTimeline from '@/features/editor/timeline/items/timeline';

export type MoveableRef = RefObject<{ moveable: { updateRect: () => void; forceUpdate: () => void } } | null>;

export interface EditorState extends State {
  timeline: CanvasTimeline | null;
  playerRef: RefObject<PlayerRef | null> | null;
  sceneMoveableRef: MoveableRef | null;
  scroll: { left: number; top: number };
  targetIds: string[];
}

export type TrackItem = Omit<ITrackItemBase, 'details'> & { details: ItemDetails };

export type UploadStatus = 'pending' | 'uploading' | 'uploaded' | 'failed';

export interface UploadTask {
  id: string;
  file?: File;
  url?: string;
  type: string;
  status: UploadStatus;
  progress: number;
  error?: string;
  addToTimeline?: boolean;
}

export interface UploadRecord {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  metadata: { uploadedUrl?: string; originalUrl?: string; thumbnailUrl?: string };
  folder: string | null;
  type: string;
  method: 'direct' | 'url';
  origin: 'user';
  status: 'uploaded';
  isPreview: boolean;
  url?: string;
}

export interface FontInfo {
  id: string;
  family: string;
  fullName: string;
  postScriptName: string;
  preview: string;
  style: string;
  url: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string | null;
}

export interface CompactFont {
  family: string;
  styles: FontInfo[];
  default: FontInfo;
  name?: string;
}

export interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BoxShadow {
  color: string;
  x: number;
  y: number;
  blur: number;
}

export interface ItemDetails {
  src?: string;
  text?: string;
  width?: number;
  height?: number;
  top?: number | string;
  left?: number | string;
  transform?: string;
  transformOrigin?: string;
  opacity?: number;
  volume?: number;
  crop?: Crop;
  zoom?: number;
  rotation?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  aspectRatio?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  boxShadow?: BoxShadow;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
  grayscale?: number;
  sepia?: number;
  blur?: number;
  blendMode?: string;
  fontFamily?: string;
  fontUrl?: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  lineHeight?: number | string;
  letterSpacing?: number | string;
  wordSpacing?: number | string;
  wordWrap?: string;
  wordBreak?: string;
  textTransform?: string;
  textAlign?: string;
  textDecoration?: string;
  color?: string;
  backgroundColor?: string;
}
