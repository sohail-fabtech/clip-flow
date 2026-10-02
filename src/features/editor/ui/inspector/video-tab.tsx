import { FlipHorizontal2, FlipVertical2 } from 'lucide-react';
import type { BlendMode, Clip, ShapeClip, VisualClip } from '@/features/editor/model/types';
import { BLEND_MODES, isVisual } from '@/features/editor/model/types';
import { defaultTransform } from '@/features/editor/model/defaults';
import { changeSpeed } from '@/features/editor/actions';
import { Group, IconButton, Row, SelectRow } from '@/features/editor/ui/common';
import { editClips } from '@/features/editor/ui/inspector/edit';
import { AnimRow, ColorRow, NumberRow, SliderRow, SubLabel } from '@/features/editor/ui/inspector/fields';

const label = (mode: string) => mode.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const pct = (v: number) => v * 100;
const fromPct = (v: number) => v / 100;

export function VideoTab({ clips }: { clips: Clip[] }) {
  const visual = clips.filter(isVisual) as VisualClip[];
  if (!visual.length) return null;
  const primary = visual[0];
  const ids = visual.map(c => c.id);
  const { transform } = primary;
  const set = (name: string, recipe: (clip: VisualClip) => void, phase: 'live' | 'commit' = 'commit') =>
    editClips(ids, name, clip => isVisual(clip) && recipe(clip), phase);
  const media = clips.filter(c => c.kind === 'video' || c.kind === 'audio');

  return (
    <>
      <Group
        title='Transform'
        onReset={() =>
          set('Reset transform', clip => {
            clip.transform = { ...defaultTransform(), crop: clip.transform.crop, blend: clip.transform.blend };
            for (const prop of ['x', 'y', 'scale', 'rotation', 'opacity'] as const) delete clip.keyframes[prop];
          })
        }
      >
        <AnimRow label='Position X' prop='x' clips={visual} unit='px' />
        <AnimRow label='Position Y' prop='y' clips={visual} unit='px' />
        <AnimRow label='Scale' prop='scale' clips={visual} toDisplay={pct} fromDisplay={fromPct} min={1} max={1000} unit='%' />
        <AnimRow label='Rotation' prop='rotation' clips={visual} precision={1} step={0.5} unit='°' />
        <AnimRow label='Opacity' prop='opacity' clips={visual} toDisplay={pct} fromDisplay={fromPct} min={0} max={100} unit='%' />
        <Row label='Flip'>
          <IconButton label='Flip horizontal' active={transform.flipH} onClick={() => set('Flip', c => void (c.transform.flipH = !transform.flipH))}>
            <FlipHorizontal2 />
          </IconButton>
          <IconButton label='Flip vertical' active={transform.flipV} onClick={() => set('Flip', c => void (c.transform.flipV = !transform.flipV))}>
            <FlipVertical2 />
          </IconButton>
        </Row>
        <Row label='Blend'>
          <SelectRow<BlendMode>
            label='Blend mode'
            value={transform.blend}
            options={BLEND_MODES.map(mode => ({ value: mode, label: label(mode) }))}
            onChange={blend => set('Blend mode', c => void (c.transform.blend = blend))}
          />
        </Row>
      </Group>

      {primary.kind !== 'text' && (
        <Group title='Crop' defaultOpen={false} onReset={() => set('Reset crop', c => void (c.transform.crop = { top: 0, right: 0, bottom: 0, left: 0 }))}>
          {(['top', 'right', 'bottom', 'left'] as const).map(side => (
            <SliderRow
              key={side}
              label={label(side)}
              min={0}
              max={0.9}
              value={transform.crop[side]}
              unit='%'
              onChange={(v, phase) => set('Crop', c => void (c.transform.crop[side] = v), phase)}
            />
          ))}
        </Group>
      )}

      {primary.kind !== 'text' && (
        <Group title='Image Adjustment'>
          <SliderRow label='Edge Softness' min={0} max={1} value={transform.edgeSoftness} onChange={(v, p) => set('Edge softness', c => void (c.transform.edgeSoftness = v), p)} />
          <SliderRow label='Edge Rounding' min={0} max={1} value={transform.edgeRounding} onChange={(v, p) => set('Edge rounding', c => void (c.transform.edgeRounding = v), p)} />
        </Group>
      )}

      {primary.kind === 'shape' && <ShapeGroup clips={visual.filter((c): c is ShapeClip => c.kind === 'shape')} />}

      {media.length > 0 && (media[0].kind === 'video' || media[0].kind === 'audio') && (
        <Group title='Playback'>
          <NumberRow label='Speed' value={media[0].speed} min={0.1} max={16} step={0.05} precision={2} unit='×' onChange={(v, phase) => phase === 'commit' && changeSpeed(v)} />
        </Group>
      )}
    </>
  );
}

function ShapeGroup({ clips }: { clips: ShapeClip[] }) {
  const shape = clips[0].shapeContent;
  const ids = clips.map(c => c.id);
  const set = (name: string, recipe: (s: ShapeClip['shapeContent']) => void, phase: 'live' | 'commit' = 'commit') =>
    editClips(ids, name, clip => clip.kind === 'shape' && recipe(clip.shapeContent), phase);
  return (
    <Group title='Shape'>
      <ColorRow label='Fill' value={shape.fill} onChange={v => set('Shape fill', s => void (s.fill = v))} />
      <NumberRow label='Width' value={shape.width} min={1} max={8000} unit='px' onChange={(v, p) => set('Shape size', s => void (s.width = v), p)} />
      <NumberRow label='Height' value={shape.height} min={1} max={8000} unit='px' onChange={(v, p) => set('Shape size', s => void (s.height = v), p)} />
      {shape.shape === 'rectangle' && (
        <NumberRow label='Corner radius' value={shape.radius} min={0} max={4000} unit='px' onChange={(v, p) => set('Corner radius', s => void (s.radius = v), p)} />
      )}
      <SubLabel>Stroke</SubLabel>
      <ColorRow label='Color' value={shape.strokeColor} onChange={v => set('Stroke color', s => void (s.strokeColor = v))} />
      <NumberRow label='Width' value={shape.strokeWidth} min={0} max={200} unit='px' onChange={(v, p) => set('Stroke width', s => void (s.strokeWidth = v), p)} />
    </Group>
  );
}
