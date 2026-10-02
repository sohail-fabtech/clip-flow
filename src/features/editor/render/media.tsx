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
  if (!lutCache.has(src))
    lutCache.set(
      src,
      fetch(src)
        .then(r => r.text())
        .then(parseCube),
    );
  return lutCache.get(src)!;
};

export function useHoldRender(ready: boolean, label: string) {
  const handle = useRef<number | null>(null);
  if (!ready && handle.current === null) handle.current = delayRender(label);
  useEffect(() => {
    if (!ready || handle.current === null) return;
    continueRender(handle.current);
    handle.current = null;
  }, [ready]);
  useEffect(
    () => () => {
      if (handle.current !== null) continueRender(handle.current);
      handle.current = null;
    },
    [],
  );
}

function useLut(src: string, enabled: boolean) {
  const [lut, setLut] = useState<{ src: string; lut: CubeLut | null } | null>(null);
  const ready = !enabled || !src || lut?.src === src;
  useHoldRender(ready, `Loading LUT ${src}`);
  useEffect(() => {
    if (ready) return;
    let alive = true;
    loadLut(src)
      .catch(() => null)
      .then(result => alive && setLut({ src, lut: result }));
    return () => {
      alive = false;
    };
  }, [src, ready]);
  return enabled && lut?.src === src && lut.lut ? (lut as { src: string; lut: CubeLut }) : null;
}

function useGl(grade: Grade | null, softness: number) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GradeRenderer | null>(null);
  const lut = useLut(grade?.lut.src ?? '', grade?.lut.enabled ?? false);
  const frame = useCurrentFrame();
  const state = useRef({ grade, softness, frame, lut });
  state.current = { grade, softness, frame, lut };
  const last = useRef<{ source: TexImageSource; width: number; height: number } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    rendererRef.current = new GradeRenderer(canvasRef.current);
    return () => {
      rendererRef.current = null;
    };
  }, []);

  const draw = useCallback((source: TexImageSource, width: number, height: number) => {
    const renderer = rendererRef.current;
    last.current = { source, width, height };
    if (!renderer || !width || !height || !state.current.grade) return;
    const { grade: g, softness: s, frame: f, lut: l } = state.current;
    renderer.setLut(l?.lut ?? null, l?.src ?? '');
    const scale = Math.min(1, MAX_GL_SIZE / Math.max(width, height));
    renderer.render(source, width * scale, height * scale, g, s, f);
  }, []);

  useEffect(() => {
    if (last.current) draw(last.current.source, last.current.width, last.current.height);
  }, [grade, softness, lut, draw]);

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
  const gl = useGl(grade, softness);
  const Component = isRendering ? OffthreadVideo : Html5Video;
  const onVideoFrame = useCallback(
    (frame: CanvasImageSource) => {
      const video = frame as HTMLVideoElement & HTMLImageElement;
      gl.draw(video, video.videoWidth || video.naturalWidth, video.videoHeight || video.naturalHeight);
    },
    [gl.draw],
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
  const gl = useGl(grade, softness);
  const [image, setImage] = useState<{ src: string; element: HTMLImageElement | null } | null>(null);
  const frame = useCurrentFrame();
  const graded = grade !== null;
  useHoldRender(!graded || image?.src === src, `Loading image ${src}`);

  useEffect(() => {
    if (!graded) return;
    const element = new Image();
    element.crossOrigin = 'anonymous';
    element.onload = () => setImage({ src, element });
    element.onerror = () => setImage({ src, element: null });
    element.src = src;
    return () => {
      element.onload = element.onerror = null;
    };
  }, [src, graded]);

  useEffect(() => {
    const element = image?.element;
    if (element) gl.draw(element, element.naturalWidth, element.naturalHeight);
  }, [image, frame, gl.draw]);

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
