export const COMPOSITION_ID = 'editor';

export type ExportCodec = 'h264' | 'h265' | 'prores';
export type ExportResolution = 'match' | '720p' | '1080p' | '2k' | '4k';

export interface ExportOptions {
  codec: ExportCodec;
  resolution: ExportResolution;
  range: 'all' | 'inout';
}

export const SHORT_SIDE: Record<Exclude<ExportResolution, 'match'>, number> = {
  '720p': 720,
  '1080p': 1080,
  '2k': 1440,
  '4k': 2160,
};

export const EXTENSION: Record<ExportCodec, string> = { h264: 'mp4', h265: 'mp4', prores: 'mov' };
