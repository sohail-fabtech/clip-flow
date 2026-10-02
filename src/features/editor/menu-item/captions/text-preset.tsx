import { CircleOff } from 'lucide-react';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import { ScrollArea } from '@/components/ui/scroll-area';
import useStore from '@/features/editor/stores/use-store';
import type { BoxShadow, TrackItem } from '@/features/editor/types';

interface CaptionPreset {
  name?: string;
  backgroundColor: string;
  color: string;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  boxShadow?: BoxShadow;
  style?: string;
}

const NONE_PRESET: CaptionPreset = {
  backgroundColor: 'transparent',
  color: '#ffffff',
  borderRadius: 0,
  borderWidth: 0,
  borderColor: 'transparent',
};

const TEXT_PRESETS: CaptionPreset[] = [
  {
    name: 'Karaoke',
    backgroundColor: '#000000',
    color: '#00ff00',
    borderRadius: 8,
    borderWidth: 0,
    borderColor: 'transparent',
    style: 'karaoke',
  },
  {
    name: 'Beasty',
    backgroundColor: 'transparent',
    color: '#ffffff',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#000000',
    boxShadow: { color: '#000000', x: 4, y: 4, blur: 0 },
    style: 'outlined',
  },
  {
    name: 'Deep Diver',
    backgroundColor: '#1a1a2e',
    color: '#eee',
    borderRadius: 12,
    borderWidth: 0,
    borderColor: 'transparent',
    style: 'solid',
  },
  {
    name: 'Youshaei',
    backgroundColor: 'transparent',
    color: '#00ff88',
    borderRadius: 6,
    borderWidth: 0,
    borderColor: 'transparent',
    style: 'neon',
  },
  {
    name: 'Classic Black',
    backgroundColor: '#000000',
    color: '#ffffff',
    borderRadius: 20,
    borderWidth: 0,
    borderColor: 'transparent',
    style: 'solid',
  },
  {
    name: 'Clean White',
    backgroundColor: '#ffffff',
    color: '#000000',
    borderRadius: 20,
    borderWidth: 0,
    borderColor: 'transparent',
    style: 'solid',
  },
  {
    name: 'Purple Pop',
    backgroundColor: '#8120fd',
    color: '#ffffff',
    borderRadius: 16,
    borderWidth: 0,
    borderColor: 'transparent',
    style: 'solid',
  },
  {
    name: 'Sunny Yellow',
    backgroundColor: '#ffde00',
    color: '#000000',
    borderRadius: 16,
    borderWidth: 0,
    borderColor: 'transparent',
    style: 'solid',
  },
  {
    name: 'Neon Blue',
    backgroundColor: 'transparent',
    color: '#6eb5d6',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0f1fac',
    boxShadow: { color: '#0f1fac', x: 0, y: 0, blur: 20 },
    style: 'glow',
  },
  {
    name: 'Matrix Green',
    backgroundColor: '#000000',
    color: '#6af1af',
    borderRadius: 12,
    borderWidth: 0,
    borderColor: 'transparent',
    style: 'solid',
  },
  {
    name: 'Pink Glow',
    backgroundColor: 'transparent',
    color: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#dd4882',
    boxShadow: { color: '#dd4882', x: 0, y: 0, blur: 30 },
    style: 'glow',
  },
  {
    name: 'Retro Shadow',
    backgroundColor: 'transparent',
    color: '#f5be36',
    borderRadius: 6,
    borderWidth: 0,
    borderColor: 'transparent',
    boxShadow: { color: '#b12019', x: 6, y: 6, blur: 0 },
    style: 'shadow',
  },
];

const getTextShadow = (boxShadow?: BoxShadow) =>
  boxShadow ? `${boxShadow.x}px ${boxShadow.y}px ${boxShadow.blur}px ${boxShadow.color}` : undefined;

const DISPLAY_TEXT: Record<string, string> = {
  karaoke: 'TO GET STARTED',
  outlined: 'CHOOSE A STYLE',
  neon: 'TO GET STARTED',
};

const captionTargets = (trackItem: TrackItem | null) => {
  if (trackItem) return [trackItem.id];
  return Object.values(useStore.getState().trackItemsMap)
    .filter(item => item.type === 'text' && item.metadata?.autoCaption)
    .map(item => item.id);
};

const applyPreset = ({ name: _name, style: _style, ...preset }: CaptionPreset, trackItem: TrackItem | null) => {
  const details = { boxShadow: { color: 'transparent', x: 0, y: 0, blur: 0 }, ...preset };
  const ids = captionTargets(trackItem);
  if (ids.length === 0) return;
  dispatch(EDIT_OBJECT, { payload: Object.fromEntries(ids.map(id => [id, { details }])) });
};

export default function TextPreset({ trackItem }: { trackItem: TrackItem | null }) {
  return (
    <ScrollArea className='h-[400px] w-full pt-4'>
      <div className='space-y-3'>
        <button
          type='button'
          onClick={() => applyPreset(NONE_PRESET, trackItem)}
          className='flex w-full cursor-pointer flex-col items-center gap-1'
        >
          <span className='flex w-full items-center justify-center rounded border border-transparent bg-gray-700/50 p-3 transition-colors hover:border-white/40'>
            <CircleOff className='h-5 w-5 text-gray-400' />
          </span>
          <span className='text-xs text-gray-300'>No captions</span>
        </button>

        {TEXT_PRESETS.map(preset => (
          <button
            type='button'
            key={preset.name}
            onClick={() => applyPreset(preset, trackItem)}
            className='flex h-[60px] w-full cursor-pointer flex-col items-center justify-center gap-1'
          >
            <span className='relative flex w-full items-center justify-center rounded border border-transparent bg-gray-700/50 p-2 transition-colors hover:border-white/40'>
              <span
                style={{
                  backgroundColor: preset.backgroundColor,
                  color: preset.color,
                  borderRadius: `${preset.borderRadius}px`,
                  border: preset.borderWidth > 0 ? `${preset.borderWidth}px solid ${preset.borderColor}` : 'none',
                  textShadow: getTextShadow(preset.boxShadow),
                  filter:
                    preset.boxShadow && preset.boxShadow.blur > 10
                      ? `drop-shadow(0 0 ${preset.boxShadow.blur}px ${preset.boxShadow.color})`
                      : 'none',
                }}
                className='px-3 py-1 text-center text-sm font-bold leading-tight'
              >
                {DISPLAY_TEXT[preset.style ?? ''] ?? preset.name}
              </span>
            </span>
            <span className='text-xs text-gray-400'>{preset.name}</span>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
