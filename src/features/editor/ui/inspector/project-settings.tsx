import { useState } from 'react';
import { commit, useProjectStore } from '@/features/editor/store/project-store';
import { projectDuration } from '@/features/editor/engine/edits';
import { timecode } from '@/features/editor/model/time';
import { Group, Row, SelectRow } from '@/features/editor/ui/common';
import { ColorRow } from '@/features/editor/ui/inspector/fields';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const ASPECTS = [
  { value: '16:9', label: '16:9 Landscape', w: 16, h: 9 },
  { value: '9:16', label: '9:16 Vertical', w: 9, h: 16 },
  { value: '1:1', label: '1:1 Square', w: 1, h: 1 },
  { value: '4:3', label: '4:3 Standard', w: 4, h: 3 },
  { value: '4:5', label: '4:5 Portrait', w: 4, h: 5 },
  { value: '2.4:1', label: '2.4:1 Cinema', w: 2.4, h: 1 },
  { value: '9:14', label: '9:14 Tall', w: 9, h: 14 },
] as const;

export const QUALITIES = [
  { value: '720', label: '720p HD' },
  { value: '1080', label: '1080p Full HD' },
  { value: '1440', label: '1440p 2K' },
  { value: '2160', label: '2160p 4K' },
] as const;

const FRAME_RATES = [24, 25, 30, 50, 60];
const even = (n: number) => Math.round(n / 2) * 2;

export function sizeFor(aspect: { w: number; h: number }, shortSide: number) {
  return aspect.w >= aspect.h
    ? { width: even((shortSide * aspect.w) / aspect.h), height: shortSide }
    : { width: shortSide, height: even((shortSide * aspect.h) / aspect.w) };
}

export function ProjectSettings() {
  const project = useProjectStore(s => s.project);
  const { width, height, fps, background } = project.settings;
  const aspect = ASPECTS.find(a => Math.abs(a.w / a.h - width / height) < 0.01)?.value ?? 'custom';
  const shortSide = String(Math.min(width, height));
  const quality = QUALITIES.find(q => q.value === shortSide)?.value ?? 'custom';
  const [custom, setCustom] = useState({ width, height });

  const resize = (next: { width: number; height: number }) =>
    commit('Resize canvas', draft => {
      draft.settings.width = next.width;
      draft.settings.height = next.height;
    });

  return (
    <>
      <div className='border-b border-line-subtle px-3 py-3'>
        <div className='text-[10px] font-semibold tracking-wider text-ink-4 uppercase'>Project</div>
        <input
          aria-label='Project name'
          defaultValue={project.name}
          key={project.name}
          onBlur={e => e.target.value.trim() && commit('Rename project', d => void (d.name = e.target.value.trim()))}
          onKeyDown={e => {
            e.stopPropagation();
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          className='mt-1 w-full rounded bg-transparent text-sm font-medium text-ink outline-none focus:bg-base'
        />
      </div>
      <Group title='Canvas'>
        <Row label='Aspect ratio'>
          <SelectRow
            label='Aspect ratio'
            value={aspect}
            options={[
              ...ASPECTS.map(a => ({ value: a.value as string, label: a.label })),
              { value: 'custom', label: 'Custom…' },
            ]}
            onChange={value => {
              const preset = ASPECTS.find(a => a.value === value);
              if (preset) resize(sizeFor(preset, Math.min(width, height)));
            }}
          />
        </Row>
        <Row label='Resolution'>
          <SelectRow
            label='Resolution'
            value={quality}
            options={[
              ...QUALITIES.map(q => ({ value: q.value as string, label: q.label })),
              { value: 'custom', label: `${width}×${height}` },
            ]}
            onChange={value => {
              const short = Number(value);
              if (short) resize(sizeFor({ w: width, h: height }, short));
            }}
          />
        </Row>
        <Row label='Custom size'>
          <Input
            type='number'
            aria-label='Width'
            value={custom.width}
            onChange={e => setCustom(c => ({ ...c, width: Number(e.target.value) }))}
            onKeyDown={e => e.stopPropagation()}
          />
          <span className='text-ink-4'>×</span>
          <Input
            type='number'
            aria-label='Height'
            value={custom.height}
            onChange={e => setCustom(c => ({ ...c, height: Number(e.target.value) }))}
            onKeyDown={e => e.stopPropagation()}
          />
          <Button
            size='sm'
            variant='secondary'
            disabled={custom.width < 16 || custom.height < 16 || custom.width > 7680 || custom.height > 7680}
            onClick={() => resize({ width: even(custom.width), height: even(custom.height) })}
          >
            Set
          </Button>
        </Row>
        <Row label='Frame rate'>
          <SelectRow
            label='Frame rate'
            value={String(fps)}
            options={FRAME_RATES.map(r => ({ value: String(r), label: `${r} fps` }))}
            onChange={value => commit('Frame rate', draft => void (draft.settings.fps = Number(value)))}
          />
        </Row>
        <ColorRow
          label='Background'
          value={background}
          onChange={v => commit('Background', draft => void (draft.settings.background = v))}
        />
        <Row label='Duration'>
          <span className='font-mono text-xs text-ink-2'>{timecode(projectDuration(project), fps)}</span>
        </Row>
      </Group>
      <div className='p-4 text-[11px] leading-relaxed text-ink-4'>
        Select a clip on the timeline to edit its properties.
      </div>
    </>
  );
}
