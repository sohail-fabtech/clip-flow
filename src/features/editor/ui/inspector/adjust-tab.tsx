import { useRef } from 'react';
import { Pipette, Upload, X } from 'lucide-react';
import type { Clip, Grade, VisualClip } from '@/features/editor/model/types';
import { isVisual } from '@/features/editor/model/types';
import { defaultGrade } from '@/features/editor/model/defaults';
import { uploadFile } from '@/features/editor/media/upload';
import { Button } from '@/components/ui/button';
import { Group, IconButton, Row } from '@/features/editor/ui/common';
import { editClips } from '@/features/editor/ui/inspector/edit';
import { ColorSwatch, SliderRow, SubLabel, ToggleRow } from '@/features/editor/ui/inspector/fields';
import { CurveEditor, WheelPad } from '@/features/editor/ui/inspector/grade-controls';
import { toast } from '@/features/editor/ui/toasts';

type Section = keyof Grade;

const TEMP = 'linear-gradient(90deg, #528cea, #f2b852)';
const TINT = 'linear-gradient(90deg, #6bc773, #d161b8)';
const HUE = 'linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)';

declare global {
  interface Window {
    EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
  }
}

export function AdjustTab({ clips }: { clips: Clip[] }) {
  const lutInput = useRef<HTMLInputElement>(null);
  const visual = clips.filter(c => isVisual(c) && c.kind !== 'text' && c.kind !== 'shape') as VisualClip[];
  if (!visual.length)
    return <div className='p-4 text-xs text-ink-4'>Color adjustments apply to video and image clips.</div>;
  const ids = visual.map(c => c.id);
  const grade = visual[0].grade;

  const set = (name: string, recipe: (g: Grade) => void, phase: 'live' | 'commit' = 'commit') =>
    editClips(ids, name, clip => isVisual(clip) && recipe(clip.grade), phase);
  const reset = (section: Section) =>
    set(`Reset ${section}`, g => void Object.assign(g, { [section]: defaultGrade()[section] }));
  const enable = (section: Section) => (enabled: boolean) =>
    set(`Toggle ${section}`, g => void (g[section].enabled = enabled));

  const slider = <S extends 'basic' | 'effects'>(
    section: S,
    key: keyof Grade[S] & string,
    label: string,
    min: number,
    max: number,
    extra: Partial<React.ComponentProps<typeof SliderRow>> = {},
  ) => (
    <SliderRow
      key={key}
      label={label}
      min={min}
      max={max}
      value={grade[section][key] as number}
      onChange={(v, phase) => set(label, g => void ((g[section] as Record<string, unknown>)[key] = v), phase)}
      {...extra}
    />
  );

  const loadLut = async (file: File) => {
    try {
      const info = await uploadFile(file, () => {});
      set('Load LUT', g => void Object.assign(g.lut, { src: info.filePath, name: file.name, enabled: true }));
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not load LUT', 'error');
    }
  };

  const sampleKey = async () => {
    if (!window.EyeDropper) return toast('Color sampling needs Chrome or Edge', 'error');
    try {
      const { sRGBHex } = await new window.EyeDropper().open();
      set('Key color', g => void Object.assign(g.effects, { chromaKey: true, chromaColor: sRGBHex }));
    } catch {
      return;
    }
  };

  return (
    <>
      <Group
        title='Basic Correction'
        enabled={grade.basic.enabled}
        onEnabledChange={enable('basic')}
        onReset={() => reset('basic')}
      >
        <SubLabel>Tone</SubLabel>
        {slider('basic', 'exposure', 'Exposure', -3, 3, { scale: 1, precision: 2, unit: 'EV' })}
        {slider('basic', 'contrast', 'Contrast', -1, 1)}
        {slider('basic', 'highlights', 'Highlights', -1, 1)}
        {slider('basic', 'shadows', 'Shadows', -1, 1)}
        {slider('basic', 'blacks', 'Blacks', -1, 1)}
        {slider('basic', 'whites', 'Whites', -1, 1)}
        <SubLabel>White Balance</SubLabel>
        {slider('basic', 'temperature', 'Temperature', -1, 1, { gradient: TEMP })}
        {slider('basic', 'tint', 'Tint', -1, 1, { gradient: TINT })}
        <SubLabel>Presence</SubLabel>
        {slider('basic', 'vibrance', 'Vibrance', -1, 1)}
        {slider('basic', 'saturation', 'Saturation', -1, 1)}
      </Group>

      <Group
        title='Curves'
        defaultOpen={false}
        enabled={grade.curves.enabled}
        onEnabledChange={enable('curves')}
        onReset={() => reset('curves')}
      >
        <CurveEditor
          channels={[
            { key: 'master', label: 'Luma', color: '#f2f2f2' },
            { key: 'red', label: 'Red', color: '#ff382e' },
            { key: 'green', label: 'Green', color: '#52d15c' },
            { key: 'blue', label: 'Blue', color: '#528fff' },
          ]}
          curves={grade.curves}
          onChange={(key, points, phase) => set('Curves', g => void (g.curves[key] = points), phase)}
        />
      </Group>

      <Group
        title='Color Wheels'
        defaultOpen={false}
        enabled={grade.wheels.enabled}
        onEnabledChange={enable('wheels')}
        onReset={() => reset('wheels')}
      >
        <div className='flex justify-between gap-1 pt-1'>
          {(['lift', 'gamma', 'gain'] as const).map(key => (
            <WheelPad
              key={key}
              label={key[0].toUpperCase() + key.slice(1)}
              value={grade.wheels[key]}
              onChange={(wheel, phase) => set('Color wheels', g => void (g.wheels[key] = wheel), phase)}
            />
          ))}
        </div>
      </Group>

      <Group
        title='Hue Curves'
        defaultOpen={false}
        enabled={grade.hueCurves.enabled}
        onEnabledChange={enable('hueCurves')}
        onReset={() => reset('hueCurves')}
      >
        <CurveEditor
          hue
          background={`linear-gradient(rgba(17,18,20,0.75), rgba(17,18,20,0.75)), ${HUE}`}
          channels={[
            { key: 'hueVsHue', label: 'Hue', color: '#f2c72e' },
            { key: 'hueVsSat', label: 'Saturation', color: '#40cce6' },
            { key: 'hueVsLum', label: 'Luminance', color: '#f2f2f2' },
          ]}
          curves={grade.hueCurves}
          onChange={(key, points, phase) => set('Hue curves', g => void (g.hueCurves[key] = points), phase)}
        />
      </Group>

      <Group
        title='LUTs'
        defaultOpen={false}
        enabled={grade.lut.enabled}
        onEnabledChange={enable('lut')}
        onReset={() => reset('lut')}
      >
        <input
          ref={lutInput}
          type='file'
          accept='.cube'
          hidden
          onChange={e => e.target.files?.[0] && loadLut(e.target.files[0])}
        />
        <Row label='File'>
          {grade.lut.src ? (
            <div className='flex min-w-0 flex-1 items-center gap-1 rounded bg-base px-2 py-1 text-[11px] text-ink-2'>
              <span className='truncate'>{grade.lut.name}</span>
              <IconButton label='Remove LUT' className='ml-auto size-5 [&_svg]:size-3' onClick={() => reset('lut')}>
                <X />
              </IconButton>
            </div>
          ) : (
            <Button size='sm' variant='secondary' onClick={() => lutInput.current?.click()}>
              <Upload /> Load .cube
            </Button>
          )}
        </Row>
        <SliderRow
          label='Intensity'
          min={0}
          max={1}
          value={grade.lut.intensity}
          unit='%'
          reset={1}
          onChange={(v, p) => set('LUT intensity', g => void (g.lut.intensity = v), p)}
        />
      </Group>

      <Group
        title='Effects'
        defaultOpen={false}
        enabled={grade.effects.enabled}
        onEnabledChange={enable('effects')}
        onReset={() => reset('effects')}
      >
        <SubLabel>Detail</SubLabel>
        {slider('effects', 'clarity', 'Clarity', -1, 1)}
        {slider('effects', 'dehaze', 'Dehaze', -1, 1)}
        {slider('effects', 'sharpen', 'Sharpen', 0, 1)}
        {slider('effects', 'noiseReduction', 'Noise Reduction', 0, 1)}
        <SubLabel>Blur</SubLabel>
        {slider('effects', 'blur', 'Blur', 0, 60, { scale: 1, step: 0.5, unit: 'px' })}
        {slider('effects', 'motionBlur', 'Motion Blur', 0, 60, { scale: 1, step: 0.5, unit: 'px' })}
        {slider('effects', 'motionAngle', 'Angle', 0, 360, { scale: 1, step: 1, unit: '°' })}
        <SubLabel>Vignette</SubLabel>
        {slider('effects', 'vignette', 'Amount', -1, 1)}
        {slider('effects', 'vignetteMidpoint', 'Midpoint', 0, 1, { reset: 0.5 })}
        {slider('effects', 'vignetteRoundness', 'Roundness', -1, 1)}
        {slider('effects', 'vignetteFeather', 'Feather', 0, 1, { reset: 0.5 })}
        <SubLabel>Film Grain</SubLabel>
        {slider('effects', 'grain', 'Amount', 0, 1)}
        {slider('effects', 'grainSize', 'Size', 1, 6, { scale: 1, step: 0.1, precision: 1, reset: 1 })}
        <SubLabel>Glow</SubLabel>
        {slider('effects', 'glow', 'Intensity', 0, 1)}
        {slider('effects', 'glowRadius', 'Radius', 2, 60, { scale: 1, step: 1, unit: 'px', reset: 10 })}
        {slider('effects', 'glowThreshold', 'Threshold', 0, 1, { reset: 0.7 })}
        {slider('effects', 'glowWarmth', 'Warmth', 0, 1)}
        <SubLabel>Chroma Key</SubLabel>
        <ToggleRow
          label='Enable'
          checked={grade.effects.chromaKey}
          onChange={on => set('Chroma key', g => void (g.effects.chromaKey = on))}
        />
        <Row label='Key color'>
          <ColorSwatch
            label='Key color'
            value={grade.effects.chromaColor}
            onChange={v => set('Key color', g => void (g.effects.chromaColor = v))}
          />
          <IconButton label='Sample key color' onClick={sampleKey}>
            <Pipette />
          </IconButton>
        </Row>
        {slider('effects', 'chromaTolerance', 'Range', 0, 1, { reset: 0.3 })}
        {slider('effects', 'chromaSpill', 'Spill', 0, 1, { reset: 0.5 })}
        <ToggleRow
          label='Invert Colors'
          checked={grade.effects.invert}
          onChange={on => set('Invert', g => void (g.effects.invert = on))}
        />
      </Group>
    </>
  );
}
