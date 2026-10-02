import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  continueRender,
  delayRender,
  Html5Audio,
  Html5Video,
  Img,
  OffthreadVideo,
  useCurrentFrame,
  useRemotionEnvironment,
} from 'remotion';
import type { Grade } from '@/features/editor/model/types';
import { GradeRenderer } from '@/features/editor/render/gl/renderer';
import { parseCube, type CubeLut } from '@/features/editor/render/gl/luts';

const MAX_GL_SIZE = 1920;
const FILL: CSSProperties = { width: '100%', height: '100%', display: 'block', objectFit: 'fill' };

const lutCache = new Map<string, Promise<CubeLut>>();
const loadLut = (src: string) => {
  if (!lutCache.has(src)) lutCache.set(src, fetch(src).then(r => r.text()).then(parseCube));
  return lutCache.get(src)!;
};

function useLut(src: string, enabled: boolean) {
  const [lut, setLut] = useState<{ src: string; lut: CubeLut } | null>(null);
  useEffect(() => {
    if (!enabled || !src) return;
    const handle = delayRender(`Loading LUT ${src}`);
    loadLut(src)
      .then(result => setLut({ src, lut: result }))
      .catch(() => setLut(null))
      .finally(() => continueRender(handle));
  }, [src, enabled]);
  return enabled && lut?.src === src ? lut : null;
}

function useGl(grade: Grade, softness: number) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GradeRenderer | null>(null);
  const lut = useLut(grade.lut.src, grade.lut.enabled);
  const frame = useCurrentFrame();
  const state = useRef({ grade, softness, frame, lut });
  state.current = { grade, softness, frame, lut };

  useEffect(() => {
    if (!canvasRef.current) return;
    rendererRef.current = new GradeRenderer(canvasRef.current);
    return () => {
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  const draw = useCallback((source: TexImageSource, width: number, height: number) => {
    const renderer = rendererRef.current;
    if (!renderer || !width || !height) return;
    const { grade: g, softness: s, frame: f, lut: l } = state.current;
    renderer.setLut(l?.lut ?? null, l?.src ?? '');
    const scale = Math.min(1, MAX_GL_SIZE / Math.max(width, height));
    renderer.render(source, width * scale, height * scale, g, s, f);
  }, []);

  return { canvasRef, draw };
}

interface VideoMediaProps {
  src: string;
  sourceIn: number;
  speed: number;
  volume: (frame: number) => number;
  muted: boolean;
  grade: Grade | null;
  softness: number;
}

export function VideoMedia({ src, sourceIn, speed, volume, muted, grade, softness }: VideoMediaProps) {
  const { isRendering } = useRemotionEnvironment();
  const gl = useGl(grade ?? ({} as Grade), softness);
  const Component = isRendering ? OffthreadVideo : Html5Video;
  const onVideoFrame = useCallback(
    (frame: CanvasImageSource) => {
      const video = frame as HTMLVideoElement & HTMLImageElement;
      gl.draw(video, video.videoWidth || video.naturalWidth, video.videoHeight || video.naturalHeight);
    },
    [gl],
  );

  const media = (
    <Component
      src={src}
      trimBefore={sourceIn || undefined}
      playbackRate={speed}
      volume={volume}
      muted={muted}
      pauseWhenBuffering
      style={grade ? { ...FILL, position: 'absolute', opacity: 0 } : FILL}
      onVideoFrame={grade ? onVideoFrame : undefined}
    />
  );

  if (!grade) return media;
  return (
    <>
      {media}
      <canvas ref={gl.canvasRef} style={{ ...FILL, position: 'absolute', inset: 0 }} />
    </>
  );
}

export function ImageMedia({ src, grade, softness }: { src: string; grade: Grade | null; softness: number }) {
  const gl = useGl(grade ?? ({} as Grade), softness);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const frame = useCurrentFrame();

  useEffect(() => {
    if (!grade) return;
    const handle = delayRender(`Loading image ${src}`);
    const element = new Image();
    element.crossOrigin = 'anonymous';
    element.onload = () => {
      setImage(element);
      continueRender(handle);
    };
    element.onerror = () => continueRender(handle);
    element.src = src;
  }, [src, grade === null]);

  useEffect(() => {
    if (grade && image) gl.draw(image, image.naturalWidth, image.naturalHeight);
  }, [grade, image, frame, softness, gl]);

  if (!grade) return <Img src={src} style={FILL} />;
  return <canvas ref={gl.canvasRef} style={FILL} />;
}

export function AudioMedia(props: { src: string; sourceIn: number; speed: number; volume: (frame: number) => number }) {
  return (
    <Html5Audio
      src={props.src}
      trimBefore={props.sourceIn || undefined}
      playbackRate={props.speed}
      volume={props.volume}
      pauseWhenBuffering
    />
  );
}
