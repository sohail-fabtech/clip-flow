import { useEffect, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AnimProp, Clip } from '@/features/editor/model/types';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ColorPicker } from '@/components/ui/color-picker';
import { adjacentKeyframe, keyframeAt } from '@/features/editor/engine/keyframes';
import { toggleKeyframe } from '@/features/editor/actions';
import { seek, usePlaybackStore } from '@/features/editor/store/playback-store';
import { IconButton, KeyframeToggle, Row, ScrubNumber } from '@/features/editor/ui/common';
import { animatedValue, baseValue, editClips, writeAnimated } from '@/features/editor/ui/inspector/edit';

interface AnimRowProps {
  label: string;
  prop: AnimProp;
  clips: Clip[];
  toDisplay?: (value: number) => number;
  fromDisplay?: (value: number) => number;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  unit?: string;
}

const identity = (value: number) => value;

export function AnimRow({ label, prop, clips, toDisplay = identity, fromDisplay = identity, unit, ...range }: AnimRowProps) {
  const frame = usePlaybackStore(s => s.frame);
  const primary = clips[0];
  const ids = clips.map(c => c.id);
  const value = animatedValue(primary, prop, frame);
  const local = Math.min(primary.duration - 1, Math.max(0, frame - primary.start));
  const has = !!primary.keyframes[prop]?.length;
  const active = !!keyframeAt(primary, prop, local);
  const apply = (display: number, phase: 'live' | 'commit') =>
    editClips(ids, `Change ${label.toLowerCase()}`, clip => writeAnimated(clip, prop, fromDisplay(display)), phase);

  return (
    <Row
      label={label}
      actions={
        <>
          {has && (
            <IconButton
              label='Previous keyframe'
              className='size-4 [&_svg]:size-3'
              onClick={() => {
                const target = adjacentKeyframe(primary, prop, local, -1);
                if (target !== null) seek(primary.start + target);
              }}
            >
              <ChevronLeft />
            </IconButton>
          )}
          <KeyframeToggle active={active} has={has} onToggle={() => toggleKeyframe(ids, prop, clip => baseValue(clip, prop))} />
          {has && (
            <IconButton
              label='Next keyframe'
              className='size-4 [&_svg]:size-3'
              onClick={() => {
                const target = adjacentKeyframe(primary, prop, local, 1);
                if (target !== null) seek(primary.start + target);
              }}
            >
              <ChevronRight />
            </IconButton>
          )}
        </>
      }
    >
      <ScrubNumber
        label={label}
        value={toDisplay(value)}
        unit={unit}
        onChange={v => apply(v, 'live')}
        onCommit={v => apply(v, 'commit')}
        {...range}
      />
    </Row>
  );
}

interface SliderRowProps {
  label: string;
  value: number;
  onChange: (value: number, phase: 'live' | 'commit') => void;
  min: number;
  max: number;
  step?: number;
  scale?: number;
  precision?: number;
  unit?: string;
  reset?: number;
  gradient?: string;
}

export function SliderRow({ label, value, onChange, min, max, step = 0.01, scale = 100, precision = 0, unit, reset = 0, gradient }: SliderRowProps) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <Row label={label}>
      <Slider
        className='flex-1'
        min={min}
        max={max}
        step={step}
        value={[local]}
        trackStyle={gradient ? { background: gradient } : undefined}
        onValueChange={([v]) => {
          setLocal(v);
          onChange(v, 'live');
        }}
        onValueCommit={([v]) => onChange(v, 'commit')}
        onDoubleClick={() => onChange(reset, 'commit')}
        aria-label={label}
      />
      <ScrubNumber
        className='w-12 min-w-0'
        label={label}
        value={local * scale}
        precision={precision}
        unit={unit}
        step={step * scale}
        onChange={v => onChange(clamp(v / scale), 'live')}
        onCommit={v => onChange(clamp(v / scale), 'commit')}
      />
    </Row>
  );
}

export function NumberRow({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: number;
  onChange: (value: number, phase: 'live' | 'commit') => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  unit?: string;
}) {
  return (
    <Row label={label}>
      <ScrubNumber label={label} value={value} onChange={v => onChange(v, 'live')} onCommit={v => onChange(v, 'commit')} {...rest} />
    </Row>
  );
}

export function ColorSwatch({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type='button' aria-label={label} className='flex h-6 items-center gap-1.5 rounded border border-line bg-base pr-2 pl-1 text-[11px] text-ink-2 hover:border-line-strong'>
          <span className='checkerboard size-4 rounded-sm border border-white/20' style={{ backgroundColor: value }}>
            <span className='block size-full rounded-sm' style={{ backgroundColor: value }} />
          </span>
          <span className='font-mono uppercase'>{value === 'transparent' ? 'None' : value.slice(0, 9)}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent side='left' align='start' className='w-auto p-2'>
        <ColorPicker value={value === 'transparent' ? '#00000000' : value} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
}

export function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Row label={label}>
      <ColorSwatch label={label} value={value} onChange={onChange} />
    </Row>
  );
}

export function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <Row label={label}>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </Row>
  );
}

export function SubLabel({ children }: { children: ReactNode }) {
  return <div className='pt-2 pb-0.5 text-[10px] font-semibold tracking-wider text-ink-4 uppercase'>{children}</div>;
}
