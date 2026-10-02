import { useRef } from 'react';
import { CircleOff, XIcon } from 'lucide-react';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import useClickOutside from '@/features/editor/hooks/use-click-outside';
import type { BoxShadow, TrackItem } from '@/features/editor/types';

export interface TextPreset {
  backgroundColor: string;
  color: string;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  boxShadow?: BoxShadow;
}

export const NONE_PRESET: TextPreset = {
  backgroundColor: 'transparent',
  color: '#ffffff',
  borderRadius: 0,
  borderWidth: 0,
  borderColor: 'transparent',
};

export const TEXT_PRESETS: TextPreset[] = [
  {
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: 20,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  {
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: 20,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  {
    borderWidth: 12,
    borderColor: '#000',
    borderRadius: 0,
    backgroundColor: 'transparent',
    color: '#fff',
  },
  {
    borderWidth: 12,
    borderColor: '#fff',
    borderRadius: 0,
    backgroundColor: 'transparent',
    color: '#000',
  },
  {
    backgroundColor: '#8120fd',
    color: '#fff',
    borderRadius: 20,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  {
    backgroundColor: '#ffde00',
    color: '#000',
    borderRadius: 20,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  {
    backgroundColor: 'transparent',
    color: '#6eb5d6',
    borderRadius: 10,
    borderWidth: 12,
    borderColor: '#0f1fac',
    boxShadow: { color: '#0f1fac', x: -12, y: 12, blur: 0 },
  },
  {
    backgroundColor: 'transparent',
    color: '#fff',
    borderRadius: 10,
    borderWidth: 12,
    borderColor: '#000',
    boxShadow: { color: '#000', x: -12, y: 12, blur: 0 },
  },
  {
    backgroundColor: '#000',
    color: '#6af1af',
    borderRadius: 20,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  {
    backgroundColor: 'transparent',
    color: '#fff',
    borderRadius: 10,
    borderWidth: 12,
    borderColor: '#dd4882',
    boxShadow: { color: '#dd4882', x: 0, y: 0, blur: 100 },
  },
  {
    backgroundColor: 'transparent',
    color: '#000000',
    borderRadius: 10,
    borderWidth: 0,
    borderColor: 'transparent',
    boxShadow: { color: '#5ed869', x: 8, y: 8, blur: 0 },
  },
  {
    backgroundColor: 'transparent',
    color: '#f5be36',
    borderRadius: 10,
    borderWidth: 0,
    borderColor: 'transparent',
    boxShadow: { color: '#b12019', x: 8, y: 8, blur: 0 },
  },
  {
    backgroundColor: 'transparent',
    color: '#eed955',
    borderRadius: 10,
    borderWidth: 12,
    borderColor: '#000000',
  },
  {
    backgroundColor: 'transparent',
    color: '#5ba2eb',
    borderRadius: 10,
    borderWidth: 12,
    borderColor: '#ffffff',
  },
];

export const getTextShadow = (boxShadow?: BoxShadow) =>
  boxShadow ? `${boxShadow.x / 8}px ${boxShadow.y / 8}px ${boxShadow.blur / 8}px ${boxShadow.color}` : undefined;

export const applyPreset = (preset: TextPreset, trackItem: TrackItem) =>
  dispatch(EDIT_OBJECT, {
    payload: {
      [trackItem.id]: { details: { boxShadow: { color: 'transparent', x: 0, y: 0, blur: 0 }, ...preset } },
    },
  });

export const PresetSwatch = ({ preset }: { preset: TextPreset }) => (
  <div
    style={{
      backgroundColor: preset.backgroundColor,
      color: preset.color,
      borderRadius: `${preset.borderRadius}px`,
      WebkitTextStroke: `2px ${preset.borderColor}`,
      paintOrder: 'stroke fill',
      fontWeight: 'bold',
      textShadow: getTextShadow(preset.boxShadow),
    }}
    className='h-6 place-content-center px-2'
  >
    Text
  </div>
);

export const PresetGrid = ({ trackItem, className }: { trackItem: TrackItem; className: string }) => (
  <div className={className}>
    <button
      type='button'
      onClick={() => applyPreset(NONE_PRESET, trackItem)}
      className='flex h-[70px] cursor-pointer items-center justify-center rounded bg-white/10'
      aria-label='No preset'
    >
      <CircleOff />
    </button>
    {TEXT_PRESETS.map((preset, index) => (
      <button
        type='button'
        key={index}
        onClick={() => applyPreset(preset, trackItem)}
        className='flex h-[70px] cursor-pointer items-center justify-center rounded bg-white/10'
      >
        <PresetSwatch preset={preset} />
      </button>
    ))}
  </div>
);

export default function TextPresetPicker({ trackItem }: { trackItem: TrackItem }) {
  const setFloatingControl = useLayoutStore(state => state.setFloatingControl);
  const floatingRef = useRef<HTMLDivElement>(null);
  useClickOutside(floatingRef, () => setFloatingControl(''));

  return (
    <div ref={floatingRef} className='absolute right-2 top-2 z-[200] w-56 rounded border-none bg-[#27272A] p-0 text-white'>
      <div className='flex items-center justify-between px-4 py-3'>
        <p className='text-sm font-bold'>Presets</p>
        <button type='button' onClick={() => setFloatingControl('')} aria-label='Close'>
          <XIcon className='h-3 w-3 text-muted-foreground' />
        </button>
      </div>
      <Separator className='w-full bg-white/60' />
      <ScrollArea className='h-[400px] w-full py-0'>
        <PresetGrid trackItem={trackItem} className='grid grid-cols-3 gap-2 px-4 py-2' />
      </ScrollArea>
    </div>
  );
}
