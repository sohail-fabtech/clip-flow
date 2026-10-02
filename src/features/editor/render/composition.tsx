import type { CSSProperties } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import type { AudioClip, MediaClip, Project, Track, VisualClip } from '@/features/editor/model/types';
import { trackClips } from '@/features/editor/engine/edits';
import { valueAt } from '@/features/editor/engine/keyframes';
import { dbToGain } from '@/features/editor/model/time';
import { animatedTransform, baseSize, transitionRolls } from '@/features/editor/render/layout';
import { dipColor, enterStyle, exitStyle } from '@/features/editor/render/transitions';
import { needsGl } from '@/features/editor/render/gl/luts';
import { AudioMedia, ImageMedia, VideoMedia } from '@/features/editor/render/media';
import { TextLayer } from '@/features/editor/render/text-layer';

export interface CompositionProps extends Record<string, unknown> {
  project: Project;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function volumeCurve(clip: MediaClip, pre: number, muted: boolean) {
  return (frame: number) => {
    if (muted) return 0;
    const local = frame - pre;
    const db = valueAt(clip, 'volume', Math.max(0, local), clip.audio.volumeDb);
    let gain = dbToGain(db);
    if (clip.audio.fadeIn > 0) gain *= clamp01(local / clip.audio.fadeIn);
    if (clip.audio.fadeOut > 0) gain *= clamp01((clip.duration - local) / clip.audio.fadeOut);
    return Math.max(0, gain);
  };
}

function VisualLayer({
  clip,
  project,
  pre,
  post,
  muted,
}: {
  clip: VisualClip;
  project: Project;
  pre: number;
  post: number;
  muted: boolean;
}) {
  const frame = useCurrentFrame();
  const local = frame - pre;
  const keyFrame = Math.min(clip.duration - 1, Math.max(0, local));
  const { width: canvasWidth, height: canvasHeight } = project.settings;
  const t = animatedTransform(clip, keyFrame);
  const { transform } = clip;
  const size = baseSize(clip, project);
  const rolls = transitionRolls(project, clip);

  let transition: CSSProperties = {};
  if (clip.transitionIn && local < clip.transitionIn.duration - pre) {
    transition = enterStyle(clip.transitionIn.type, clamp01((local + pre) / clip.transitionIn.duration));
  } else if (rolls.exit && post > 0) {
    const start = clip.duration - (rolls.exit.duration - post);
    if (local >= start) transition = exitStyle(rolls.exit.type, clamp01((local - start) / rolls.exit.duration));
  }

  const grade = clip.kind === 'text' || clip.kind === 'shape' || !needsGl(clip.grade, transform) ? null : clip.grade;
  const { crop } = transform;
  const radius = (transform.edgeRounding * Math.min(size.width, size.height || size.width)) / 2;

  const inner: CSSProperties = {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: radius || undefined,
    clipPath:
      crop.top || crop.right || crop.bottom || crop.left
        ? `inset(${crop.top * 100}% ${crop.right * 100}% ${crop.bottom * 100}% ${crop.left * 100}%)`
        : undefined,
  };

  let content: React.ReactNode = null;
  if (clip.kind === 'video') {
    const asset = project.assets[clip.assetId];
    if (asset)
      content = (
        <VideoMedia
          key={grade ? 'gl' : 'plain'}
          src={asset.src}
          sourceIn={Math.max(0, clip.sourceIn - Math.round(pre * clip.speed))}
          speed={clip.speed}
          volume={volumeCurve(clip, pre, muted || clip.muted)}
          muted={muted || clip.muted}
          grade={grade}
          softness={transform.edgeSoftness}
        />
      );
  } else if (clip.kind === 'image') {
    const asset = project.assets[clip.assetId];
    if (asset)
      content = (
        <ImageMedia key={grade ? 'gl' : 'plain'} src={asset.src} grade={grade} softness={transform.edgeSoftness} />
      );
  } else if (clip.kind === 'text') {
    content = <TextLayer clip={clip} localFrame={local} />;
  } else {
    const shape = clip.shapeContent;
    content = (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: shape.fill,
          border: shape.strokeWidth ? `${shape.strokeWidth}px solid ${shape.strokeColor}` : undefined,
          borderRadius: shape.shape === 'ellipse' ? '50%' : shape.radius,
        }}
      />
    );
  }

  return (
    <AbsoluteFill style={{ ...transition, mixBlendMode: transform.blend }}>
      <div
        data-clip-id={clip.id}
        style={{
          position: 'absolute',
          left: canvasWidth / 2 + t.x,
          top: canvasHeight / 2 + t.y,
          width: size.width,
          height: clip.kind === 'text' ? undefined : size.height,
          translate: '-50% -50%',
          transform: `rotate(${t.rotation}deg) scale(${t.scale * (transform.flipH ? -1 : 1)}, ${t.scale * (transform.flipV ? -1 : 1)})`,
          opacity: t.opacity,
        }}
      >
        <div style={clip.kind === 'text' ? undefined : inner}>{content}</div>
      </div>
    </AbsoluteFill>
  );
}

function AudioLayer({ clip, project, pre, muted }: { clip: AudioClip; project: Project; pre: number; muted: boolean }) {
  const asset = project.assets[clip.assetId];
  if (!asset || muted) return null;
  return (
    <AudioMedia
      src={asset.src}
      sourceIn={Math.max(0, clip.sourceIn - Math.round(pre * clip.speed))}
      speed={clip.speed}
      volume={volumeCurve(clip, pre, false)}
    />
  );
}

function TrackLayers({ project, track }: { project: Project; track: Track }) {
  return trackClips(project, track.id).map(clip => {
    const { pre, post } = transitionRolls(project, clip);
    const dip = clip.transitionIn ? dipColor(clip.transitionIn.type) : null;
    return (
      <Sequence key={clip.id} from={clip.start - pre} durationInFrames={clip.duration + pre + post} layout='none'>
        {clip.kind === 'audio' ? (
          <AudioLayer clip={clip} project={project} pre={pre} muted={track.muted} />
        ) : (
          <VisualLayer clip={clip} project={project} pre={pre} post={post} muted={track.muted} />
        )}
        {dip && clip.transitionIn && <Dip color={dip} duration={clip.transitionIn.duration} />}
      </Sequence>
    );
  });
}

function Dip({ color, duration }: { color: string; duration: number }) {
  const frame = useCurrentFrame();
  if (frame >= duration) return null;
  const opacity = 1 - Math.abs((frame / duration) * 2 - 1);
  return <AbsoluteFill style={{ backgroundColor: color, opacity }} />;
}

export function EditorComposition({ project }: CompositionProps) {
  const visual = project.tracks.filter(t => t.kind === 'video' && !t.hidden).reverse();
  const audio = project.tracks.filter(t => t.kind === 'audio' && !t.muted);
  return (
    <AbsoluteFill style={{ backgroundColor: project.settings.background, overflow: 'hidden', isolation: 'isolate' }}>
      {visual.map(track => (
        <TrackLayers key={track.id} project={project} track={track} />
      ))}
      {audio.map(track => (
        <TrackLayers key={track.id} project={project} track={track} />
      ))}
    </AbsoluteFill>
  );
}
