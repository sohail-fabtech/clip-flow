import { useEffect, useState, type CSSProperties } from 'react';
import { interpolate, spring, useVideoConfig } from 'remotion';
import type { TextClip, TextStyle } from '@/features/editor/model/types';
import { useHoldRender } from '@/features/editor/render/media';

const loaded = new Map<string, Promise<void>>();

export function loadFont(family: string, url: string) {
  if (!family || !url) return Promise.resolve();
  if (!loaded.has(family)) {
    loaded.set(
      family,
      new FontFace(family, `url(${url})`)
        .load()
        .then(face => {
          document.fonts.add(face);
        })
        .catch(() => undefined),
    );
  }
  return loaded.get(family)!;
}

function useFont({ fontFamily, fontUrl }: TextStyle) {
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  useHoldRender(loadedUrl === fontUrl, `Loading font ${fontFamily}`);
  useEffect(() => {
    let alive = true;
    loadFont(fontFamily, fontUrl).then(() => alive && setLoadedUrl(fontUrl));
    return () => {
      alive = false;
    };
  }, [fontFamily, fontUrl]);
}

export const textCss = (style: TextStyle): CSSProperties => ({
  fontFamily: `"${style.fontFamily}", ui-sans-serif, system-ui`,
  fontSize: style.fontSize,
  fontWeight: style.fontWeight,
  fontStyle: style.italic ? 'italic' : 'normal',
  textDecoration: style.underline ? 'underline' : 'none',
  textTransform: style.uppercase ? 'uppercase' : 'none',
  textAlign: style.align,
  lineHeight: style.lineHeight,
  letterSpacing: style.letterSpacing,
  color: style.color,
  WebkitTextStroke: style.strokeWidth > 0 ? `${style.strokeWidth}px ${style.strokeColor}` : undefined,
  paintOrder: 'stroke fill',
  textShadow:
    style.shadowBlur || style.shadowX || style.shadowY
      ? `${style.shadowX}px ${style.shadowY}px ${style.shadowBlur}px ${style.shadowColor}`
      : undefined,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
});

const backgroundCss = (style: TextStyle): CSSProperties =>
  style.backgroundColor === 'transparent'
    ? {}
    : {
        backgroundColor: style.backgroundColor,
        padding: `${style.backgroundPadding * 0.5}px ${style.backgroundPadding}px`,
        borderRadius: style.backgroundRadius,
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
      };

export function TextLayer({ clip, localFrame }: { clip: TextClip; localFrame: number }) {
  const { fps } = useVideoConfig();
  const { style, animation, content, highlightColor } = clip.text;
  useFont(style);

  const words = content.split(/(\s+)/);
  const wordCount = words.filter(w => w.trim()).length || 1;
  const perWord = Math.max(1, clip.duration / wordCount);
  const enter = spring({ frame: localFrame, fps, config: { damping: 14, stiffness: 160 } });

  let container: CSSProperties = {};
  let body: React.ReactNode = <span style={backgroundCss(style)}>{content}</span>;

  if (animation === 'popIn') container = { scale: `${interpolate(enter, [0, 1], [0.6, 1])}`, opacity: enter };
  if (animation === 'slideUp')
    container = { translate: `0 ${interpolate(enter, [0, 1], [style.fontSize, 0])}px`, opacity: enter };
  if (animation === 'typewriter') {
    const chars = Math.floor(
      interpolate(localFrame, [0, Math.min(clip.duration * 0.7, content.length * 2)], [0, content.length], {
        extrapolateRight: 'clamp',
      }),
    );
    body = <span style={backgroundCss(style)}>{content.slice(0, chars)}</span>;
  }
  if (
    animation === 'wordReveal' ||
    animation === 'wordSlide' ||
    animation === 'highlight' ||
    animation === 'highlightBlock'
  ) {
    let index = -1;
    body = (
      <span style={backgroundCss(style)}>
        {words.map((word, i) => {
          if (!word.trim()) return word;
          index += 1;
          const start = index * perWord;
          const active = localFrame >= start && localFrame < start + perWord;
          const shown = localFrame >= start;
          const progress = spring({ frame: localFrame - start, fps, config: { damping: 16, stiffness: 200 } });
          const wordStyle: CSSProperties = { display: 'inline-block', whiteSpace: 'pre' };
          if (animation === 'wordReveal') wordStyle.opacity = shown ? progress : 0;
          if (animation === 'wordSlide') {
            wordStyle.opacity = shown ? progress : 0;
            wordStyle.translate = `0 ${(1 - progress) * style.fontSize * 0.5}px`;
          }
          if (animation === 'highlight' && active) {
            wordStyle.color = highlightColor;
            wordStyle.scale = `${1 + 0.08 * progress}`;
          }
          if (animation === 'highlightBlock' && active) {
            wordStyle.backgroundColor = highlightColor;
            wordStyle.borderRadius = style.fontSize * 0.15;
            wordStyle.padding = `0 ${style.fontSize * 0.1}px`;
            wordStyle.margin = `0 ${-style.fontSize * 0.1}px`;
          }
          return (
            <span key={i} style={wordStyle}>
              {word}
            </span>
          );
        })}
      </span>
    );
  }

  return (
    <div
      style={{
        ...textCss(style),
        ...container,
        transform: style.tilt ? `perspective(1200px) rotateX(${style.tilt}deg)` : undefined,
      }}
    >
      {body}
    </div>
  );
}
