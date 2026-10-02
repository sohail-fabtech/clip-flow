import { useEffect, useRef, useState } from 'react';
import { Bookmark, Circle, Download, FileUp, Loader2, Music, Pause, Play, Plus, Square, Trash2, Type } from 'lucide-react';
import type { TextStyle, TransitionType } from '@/features/editor/model/types';
import { defaultTextStyle } from '@/features/editor/model/defaults';
import { clipEnd } from '@/features/editor/engine/edits';
import { timecode } from '@/features/editor/model/time';
import * as actions from '@/features/editor/actions';
import { importUrl } from '@/features/editor/media/import';
import { commit, getProject, useProjectStore } from '@/features/editor/store/project-store';
import { seek, usePlaybackStore } from '@/features/editor/store/playback-store';
import { useUiStore } from '@/features/editor/store/ui-store';
import { TRANSITIONS } from '@/features/editor/render/transitions';
import { textCss } from '@/features/editor/render/text-layer';
import { EmptyState, IconButton, SectionLabel } from '@/features/editor/ui/common';
import { TRANSITION_MIME } from '@/features/editor/ui/timeline/geometry';
import { toast } from '@/features/editor/ui/toasts';
import { downloadBlob } from '@/lib/download';
import { cn } from '@/lib/utils';

const MUSIC = Array.from({ length: 8 }, (_, i) => ({
  name: `SoundHelix Song ${i + 1}`,
  author: 'T. Schürger',
  src: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i + 1}.mp3`,
}));

export function AudioTab() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const assets = useProjectStore(s => s.project.assets);

  useEffect(() => () => audioRef.current?.pause(), []);

  const preview = (src: string) => {
    audioRef.current?.pause();
    if (playing === src) return setPlaying(null);
    audioRef.current = new Audio(src);
    audioRef.current.onended = () => setPlaying(null);
    audioRef.current.play().catch(() => setPlaying(null));
    setPlaying(src);
  };

  const add = async (track: (typeof MUSIC)[number]) => {
    setBusy(track.src);
    const existing = Object.values(assets).find(a => a.name === `${track.name}.mp3` || a.name === track.name);
    const asset = existing ?? (await importUrl(track.src));
    setBusy(null);
    if (asset) actions.addAsset(asset.id);
  };

  return (
    <div className='min-h-0 flex-1 overflow-y-auto'>
      <SectionLabel>Music library</SectionLabel>
      <div className='space-y-0.5 px-2'>
        {MUSIC.map(track => (
          <div key={track.src} className='group flex items-center gap-2 rounded-md p-1.5 hover:bg-white/5'>
            <button
              type='button'
              aria-label={playing === track.src ? `Pause ${track.name}` : `Preview ${track.name}`}
              onClick={() => preview(track.src)}
              className='flex size-8 shrink-0 items-center justify-center rounded bg-[var(--clip-audio)]/50 text-white hover:bg-[var(--clip-audio)]'
            >
              {playing === track.src ? <Pause className='size-3.5' fill='currentColor' /> : <Play className='size-3.5' fill='currentColor' />}
            </button>
            <div className='min-w-0 flex-1'>
              <div className='truncate text-xs text-ink-2'>{track.name}</div>
              <div className='truncate text-[11px] text-ink-4'>{track.author}</div>
            </div>
            <IconButton label='Add to timeline' onClick={() => add(track)} disabled={busy === track.src}>
              {busy === track.src ? <Loader2 className='animate-spin' /> : <Plus />}
            </IconButton>
          </div>
        ))}
      </div>
      <SectionLabel>Project audio</SectionLabel>
      <div className='space-y-0.5 px-2 pb-3'>
        {Object.values(assets)
          .filter(a => a.kind === 'audio')
          .map(asset => (
            <button
              key={asset.id}
              type='button'
              onDoubleClick={() => actions.addAsset(asset.id)}
              onClick={() => actions.addAsset(asset.id)}
              className='flex w-full items-center gap-2 rounded-md p-1.5 text-left text-xs text-ink-3 hover:bg-white/5 hover:text-ink'
            >
              <Music className='size-3.5 shrink-0' />
              <span className='truncate'>{asset.name}</span>
            </button>
          ))}
      </div>
    </div>
  );
}

const TEXT_PRESETS: { label: string; content: string; style: Partial<TextStyle> }[] = [
  { label: 'Title', content: 'Title', style: { fontSize: 140, fontFamily: 'Montserrat-Bold', fontUrl: '' } },
  { label: 'Subtitle', content: 'Subtitle', style: { fontSize: 72, fontFamily: 'Montserrat-Medium', fontUrl: '' } },
  { label: 'Body', content: 'Body text', style: { fontSize: 48, fontFamily: 'Roboto-Regular', fontUrl: '' } },
  {
    label: 'Lower third',
    content: 'Name Surname',
    style: { fontSize: 54, align: 'left', backgroundColor: '#000000cc', backgroundPadding: 24, backgroundRadius: 8, fontFamily: 'Roboto-Medium', fontUrl: '' },
  },
  { label: 'Outline', content: 'OUTLINE', style: { fontSize: 120, color: '#00000000', strokeColor: '#ffffff', strokeWidth: 4, fontFamily: 'Anton-Regular', fontUrl: '' } },
  { label: 'Shadow', content: 'Shadow', style: { fontSize: 110, shadowColor: '#000000', shadowY: 8, shadowBlur: 24, fontFamily: 'Poppins-Bold', fontUrl: '' } },
  { label: 'Highlight', content: 'Highlight', style: { fontSize: 90, color: '#000000', backgroundColor: '#ffd900', backgroundPadding: 20, backgroundRadius: 6, fontFamily: 'Poppins-Bold', fontUrl: '' } },
  { label: 'Neon', content: 'Neon', style: { fontSize: 120, color: '#ffffff', shadowColor: '#ff3df5', shadowBlur: 30, fontFamily: 'Pacifico-Regular', fontUrl: '' } },
];

export function TextPresetsTab() {
  const addPreset = async (preset: (typeof TEXT_PRESETS)[number]) => {
    const { fontByPostScript } = await import('@/features/editor/model/fonts');
    const font = fontByPostScript(preset.style.fontFamily ?? '') ?? fontByPostScript('Roboto-Bold')!;
    actions.addText(preset.content);
    const id = useUiStore.getState().selection[0];
    commit('Text preset', draft => {
      const clip = draft.clips[id];
      if (clip?.kind === 'text') Object.assign(clip.text.style, preset.style, { fontFamily: font.postScriptName, fontUrl: font.url });
    });
  };

  return (
    <div className='min-h-0 flex-1 overflow-y-auto p-2'>
      <button
        type='button'
        onClick={() => actions.addText()}
        className='mb-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-white/10 text-xs font-medium hover:bg-white/15'
      >
        <Type className='size-3.5' /> Add text
      </button>
      <div className='grid grid-cols-2 gap-1.5'>
        {TEXT_PRESETS.map(preset => (
          <button
            key={preset.label}
            type='button'
            onClick={() => addPreset(preset)}
            className='flex h-20 flex-col items-center justify-center gap-1 overflow-hidden rounded-md border border-line bg-[#111214] hover:border-line-strong'
          >
            <span
              className='max-w-full truncate px-1'
              style={{ ...textCss({ ...defaultTextStyle(), ...preset.style, fontSize: 20 }), fontFamily: 'ui-sans-serif', whiteSpace: 'nowrap' }}
            >
              {preset.content}
            </span>
            <span className='text-[10px] text-ink-4'>{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const CAPTION_STYLES: { label: string; style: Partial<TextStyle> }[] = [
  { label: 'Classic', style: { color: '#ffffff', strokeWidth: 0, backgroundColor: '#000000aa', backgroundPadding: 14, shadowBlur: 0 } },
  { label: 'Bold outline', style: { color: '#ffffff', strokeColor: '#000000', strokeWidth: 6, backgroundColor: 'transparent', uppercase: true } },
  { label: 'Yellow', style: { color: '#ffd900', strokeColor: '#000000', strokeWidth: 5, backgroundColor: 'transparent' } },
  { label: 'Boxed', style: { color: '#000000', backgroundColor: '#ffffff', backgroundPadding: 16, backgroundRadius: 10, strokeWidth: 0 } },
  { label: 'Soft shadow', style: { color: '#ffffff', strokeWidth: 0, backgroundColor: 'transparent', shadowColor: '#000000', shadowY: 4, shadowBlur: 18 } },
];

export function CaptionsTab() {
  const clips = useProjectStore(s => s.project.clips);
  const fps = useProjectStore(s => s.project.settings.fps);
  const fileRef = useRef<HTMLInputElement>(null);
  const [gap, setGap] = useState(0.2);
  const captions = Object.values(clips)
    .filter(c => c.kind === 'text' && c.text.caption)
    .sort((a, b) => a.start - b.start);

  const applyStyle = (style: Partial<TextStyle>) =>
    commit('Caption style', draft => {
      for (const c of Object.values(draft.clips)) if (c.kind === 'text' && c.text.caption) Object.assign(c.text.style, style);
    });

  const closeGaps = () =>
    commit('Close caption gaps', draft => {
      const list = Object.values(draft.clips)
        .filter(c => c.kind === 'text' && c.text.caption)
        .sort((a, b) => a.start - b.start);
      for (let i = 0; i < list.length - 1; i++) {
        const space = list[i + 1].start - clipEnd(list[i]);
        if (space > 0 && space <= gap * draft.settings.fps && list[i].trackId === list[i + 1].trackId) list[i].duration += space;
      }
    });

  const exportFile = (format: 'srt' | 'vtt') => {
    if (!captions.length) return toast('No captions to export', 'error');
    downloadBlob(new Blob([actions.exportCaptions(format)], { type: 'text/plain' }), `${getProject().name}.${format}`);
  };

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <input
        ref={fileRef}
        type='file'
        accept='.srt,.vtt'
        hidden
        onChange={async e => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          try {
            toast(`Imported ${actions.importCaptions(await file.text())} captions`);
          } catch (error) {
            toast(error instanceof Error ? error.message : 'Could not read captions', 'error');
          }
        }}
      />
      <div className='grid grid-cols-2 gap-1.5 border-b border-line-subtle p-2'>
        <button type='button' onClick={() => actions.addText('Caption', true)} className='flex h-8 items-center justify-center gap-1.5 rounded-md bg-white/10 text-xs hover:bg-white/15'>
          <Plus className='size-3.5' /> Add caption
        </button>
        <button type='button' onClick={() => fileRef.current?.click()} className='flex h-8 items-center justify-center gap-1.5 rounded-md bg-white/10 text-xs hover:bg-white/15'>
          <FileUp className='size-3.5' /> Import SRT/VTT
        </button>
        <button type='button' onClick={() => exportFile('srt')} className='flex h-7 items-center justify-center gap-1.5 rounded-md text-[11px] text-ink-3 hover:bg-white/8'>
          <Download className='size-3.5' /> Export SRT
        </button>
        <button type='button' onClick={() => exportFile('vtt')} className='flex h-7 items-center justify-center gap-1.5 rounded-md text-[11px] text-ink-3 hover:bg-white/8'>
          <Download className='size-3.5' /> Export VTT
        </button>
      </div>
      <SectionLabel>Style presets</SectionLabel>
      <div className='flex flex-wrap gap-1.5 px-2'>
        {CAPTION_STYLES.map(preset => (
          <button
            key={preset.label}
            type='button'
            disabled={!captions.length}
            onClick={() => applyStyle(preset.style)}
            className='rounded-md border border-line bg-[#111214] px-2 py-1.5 text-[11px] hover:border-line-strong disabled:opacity-40'
            style={{ ...textCss({ ...defaultTextStyle(), ...preset.style, fontSize: 12, strokeWidth: Math.min(1, preset.style.strokeWidth ?? 0) }), fontFamily: 'ui-sans-serif' }}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <SectionLabel>Gaps</SectionLabel>
      <div className='flex items-center gap-2 px-3'>
        <span className='text-[11px] text-ink-3'>Close gaps under</span>
        <input
          type='number'
          step={0.1}
          min={0}
          value={gap}
          onChange={e => setGap(Number(e.target.value))}
          onKeyDown={e => e.stopPropagation()}
          aria-label='Gap threshold in seconds'
          className='h-6 w-14 rounded border border-line bg-base px-1 text-xs'
        />
        <span className='text-[11px] text-ink-4'>s</span>
        <button type='button' onClick={closeGaps} disabled={captions.length < 2} className='ml-auto rounded px-2 py-1 text-[11px] text-selection hover:bg-white/5 disabled:opacity-40'>
          Apply
        </button>
      </div>
      <SectionLabel>Captions ({captions.length})</SectionLabel>
      <div className='min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2'>
        {captions.length === 0 && <EmptyState icon={<Type />} title='No captions'>Add captions manually or import an SRT/VTT file.</EmptyState>}
        {captions.map(c =>
          c.kind === 'text' ? (
            <div key={c.id} className='rounded-md bg-base p-1.5'>
              <button
                type='button'
                onClick={() => {
                  seek(c.start);
                  useUiStore.getState().select([c.id]);
                }}
                className='mb-1 font-mono text-[10px] text-timecode'
              >
                {timecode(c.start, fps)} → {timecode(clipEnd(c), fps)}
              </button>
              <textarea
                defaultValue={c.text.content}
                key={c.text.content}
                rows={2}
                aria-label='Caption text'
                onKeyDown={e => e.stopPropagation()}
                onBlur={e => {
                  const content = e.target.value;
                  if (content === c.text.content) return;
                  commit('Edit caption', draft => {
                    const clip = draft.clips[c.id];
                    if (clip?.kind === 'text') clip.text.content = content;
                  });
                }}
                className='w-full resize-none bg-transparent text-xs text-ink-2 outline-none'
              />
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}

export function TransitionsTab() {
  const [seconds, setSeconds] = useState(1);
  const fps = useProjectStore(s => s.project.settings.fps);
  const apply = (type: TransitionType) => {
    const count = actions.applyTransitionToSelection({ type, duration: Math.max(2, Math.round(seconds * fps)) });
    if (!count) toast('Select a clip that starts at a cut, or drag the transition onto a cut', 'error');
  };
  return (
    <div className='min-h-0 flex-1 overflow-y-auto p-2'>
      <div className='mb-2 flex items-center gap-2 text-[11px] text-ink-3'>
        Duration
        <input
          type='number'
          min={0.1}
          max={5}
          step={0.1}
          value={seconds}
          onChange={e => setSeconds(Number(e.target.value))}
          onKeyDown={e => e.stopPropagation()}
          aria-label='Transition duration in seconds'
          className='h-6 w-14 rounded border border-line bg-base px-1 text-xs'
        />
        s
      </div>
      <div className='grid grid-cols-2 gap-1.5'>
        {TRANSITIONS.map(t => (
          <button
            key={t.type}
            type='button'
            draggable
            onDragStart={e => e.dataTransfer.setData(TRANSITION_MIME, t.type)}
            onClick={() => apply(t.type)}
            className='group flex h-16 flex-col items-center justify-center gap-1.5 rounded-md border border-line bg-[#111214] text-[11px] text-ink-3 hover:border-line-strong hover:text-ink'
          >
            <span className='relative h-5 w-9 overflow-hidden rounded-sm bg-[var(--clip-video)]'>
              <span className='absolute inset-0 bg-[var(--clip-image)] transition-all duration-500 group-hover:translate-x-0' style={{ translate: '50% 0' }} />
            </span>
            {t.label}
          </button>
        ))}
      </div>
      <p className='mt-3 text-[11px] leading-relaxed text-ink-4'>Drag a transition onto a cut between two clips, or select the second clip and click a transition.</p>
    </div>
  );
}

export function ElementsTab() {
  return (
    <div className='min-h-0 flex-1 overflow-y-auto p-2'>
      <SectionLabel>Shapes</SectionLabel>
      <div className='grid grid-cols-3 gap-1.5'>
        <button type='button' onClick={() => actions.addShape('rectangle')} className='flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-line bg-[#111214] text-[11px] text-ink-3 hover:border-line-strong'>
          <Square className='size-6' /> Rectangle
        </button>
        <button type='button' onClick={() => actions.addShape('ellipse')} className='flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-line bg-[#111214] text-[11px] text-ink-3 hover:border-line-strong'>
          <Circle className='size-6' /> Ellipse
        </button>
        <button
          type='button'
          onClick={() => {
            actions.addShape('rectangle');
            const id = useUiStore.getState().selection[0];
            commit('Solid color', draft => {
              const clip = draft.clips[id];
              if (clip?.kind === 'shape') {
                clip.name = 'Solid';
                clip.shapeContent.width = draft.settings.width;
                clip.shapeContent.height = draft.settings.height;
                clip.shapeContent.fill = '#1d5878';
              }
            });
          }}
          className='flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-line bg-[#111214] text-[11px] text-ink-3 hover:border-line-strong'
        >
          <span className='size-6 rounded-sm bg-[var(--clip-video)]' /> Solid
        </button>
      </div>
    </div>
  );
}

const MARKER_COLORS = ['#4094FF', '#40CCE6', '#40BF5C', '#F2C72E', '#FF8C26', '#E64040', '#F259A6', '#A666F2', '#8CBFFF', '#73E6B8', '#A6D936', '#C79E6B', '#D1D1D1'];

export function MarkersTab() {
  const markers = useProjectStore(s => s.project.markers);
  const fps = useProjectStore(s => s.project.settings.fps);
  const selectedId = useUiStore(s => s.selectedMarkerId);
  const frame = usePlaybackStore(s => s.frame);
  const update = (id: string, patch: Partial<(typeof markers)[number]>) =>
    commit('Edit marker', draft => {
      const marker = draft.markers.find(m => m.id === id);
      if (marker) Object.assign(marker, patch);
    });

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='border-b border-line-subtle p-2'>
        <button type='button' onClick={actions.addMarker} className='flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-white/10 text-xs hover:bg-white/15'>
          <Bookmark className='size-3.5' /> Add marker at {timecode(frame, fps)}
        </button>
      </div>
      <div className='min-h-0 flex-1 space-y-1 overflow-y-auto p-2'>
        {markers.length === 0 && <EmptyState icon={<Bookmark />} title='No markers'>Press M to drop a marker at the playhead.</EmptyState>}
        {markers.map(marker => (
          <div key={marker.id} className={cn('rounded-md bg-base p-2', selectedId === marker.id && 'ring-1 ring-selection')}>
            <div className='flex items-center gap-2'>
              <span className='size-2.5 shrink-0 rounded-full' style={{ background: marker.color }} />
              <input
                defaultValue={marker.name}
                key={marker.name}
                aria-label='Marker name'
                onKeyDown={e => e.stopPropagation()}
                onBlur={e => e.target.value !== marker.name && update(marker.id, { name: e.target.value.slice(0, 120) })}
                className='min-w-0 flex-1 bg-transparent text-xs text-ink outline-none'
              />
              <button type='button' onClick={() => { seek(marker.frame); useUiStore.getState().selectMarker(marker.id); }} className='font-mono text-[10px] text-timecode'>
                {timecode(marker.frame, fps)}
              </button>
              <IconButton label='Delete marker' className='size-5 [&_svg]:size-3' onClick={() => commit('Delete marker', d => void (d.markers = d.markers.filter(m => m.id !== marker.id)))}>
                <Trash2 />
              </IconButton>
            </div>
            {selectedId === marker.id && (
              <div className='mt-2 space-y-2'>
                <div className='flex flex-wrap gap-1'>
                  {MARKER_COLORS.map(color => (
                    <button key={color} type='button' aria-label={`Color ${color}`} onClick={() => update(marker.id, { color })} className={cn('size-4 rounded-full', marker.color === color && 'ring-2 ring-white')} style={{ background: color }} />
                  ))}
                </div>
                <div className='flex items-center gap-2 text-[11px] text-ink-3'>
                  Duration
                  <input
                    type='number'
                    min={0}
                    step={0.1}
                    defaultValue={marker.duration / fps}
                    aria-label='Marker duration in seconds'
                    onKeyDown={e => e.stopPropagation()}
                    onBlur={e => update(marker.id, { duration: Math.max(0, Math.round(Number(e.target.value) * fps)) })}
                    className='h-6 w-14 rounded border border-line bg-surface px-1 text-xs'
                  />
                  s
                </div>
                <textarea
                  defaultValue={marker.comment}
                  rows={2}
                  placeholder='Comment'
                  aria-label='Marker comment'
                  onKeyDown={e => e.stopPropagation()}
                  onBlur={e => update(marker.id, { comment: e.target.value.slice(0, 4000) })}
                  className='w-full resize-none rounded border border-line bg-surface px-1.5 py-1 text-[11px] outline-none'
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

