import { ScrollArea } from '@/components/ui/scroll-area';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import { CircleOff } from 'lucide-react';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { useRef } from 'react';
import useClickOutside from '@/features/editor/hooks/use-click-outside';

export const NONE_PRESET = {
  backgroundColor: 'transparent',
  color: '#ffffff',
  borderRadius: 0,
  borderWidth: 0,
  borderColor: 'transparent',
};

export const TEXT_PRESETS = [
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

export const getTextShadow = boxShadow => {
  if (!boxShadow) return undefined;
  return `${boxShadow.x}px ${boxShadow.y}px ${boxShadow.blur}px ${boxShadow.color}`;
};

export const applyPreset = (preset, trackItem) => {
  console.log(preset);
  const overrides = {};
  if (preset.boxShadow === undefined) {
    preset.boxShadow = { color: 'transparent', x: 0, y: 0, blur: 0 };
  }

  dispatch(EDIT_OBJECT, {
    payload: {
      [trackItem.id]: {
        details: { ...preset, ...overrides },
      },
    },
  });
};

export default function TextPreset({ trackItem }) {
  const { setFloatingControl } = useLayoutStore();
  const floatingRef = useRef(null);
  useClickOutside(floatingRef, () => setFloatingControl(''));

  const getPresetDisplayText = preset => {
    switch (preset.style) {
      case 'karaoke':
        return 'TO GET STARTED';
      case 'outlined':
        return 'CHOOSE A STYLE';
      case 'neon':
        return 'TO GET STARTED';
      default:
        return preset.name || 'Text';
    }
  };

  return (
    <div ref={floatingRef} className='w-full p-0'>
      <ScrollArea className='h-[400px] w-full pt-4'>
        <div className='space-y-3'>
          {/* No Captions Option */}
          <div
            onClick={() => applyPreset(NONE_PRESET, trackItem)}
            className='flex cursor-pointer items-center justify-center'
          >
            <div className='flex flex-col items-center gap-1 w-full'>
              <div className='bg-gray-700/50 transition-colors w-full p-3 rounded flex items-center justify-center border border-transparent hover:border-white/40'>
                <CircleOff className='w-5 h-5 text-gray-400 ' />
              </div>
              <span className='text-xs text-gray-300'>No captions</span>
            </div>
          </div>

          {/* Preset Options */}
          {TEXT_PRESETS.map((preset, index) => (
            <div
              key={index}
              onClick={() => applyPreset(preset, trackItem)}
              className='flex h-[60px] cursor-pointer items-center justify-center'
            >
              <div className='flex flex-col items-center justify-center gap-1 w-full'>
                <div className='bg-gray-700/50 transition-colors w-full p-2 flex items-center relative justify-center rounded border border-transparent hover:border-white/40'>
                  <div
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
                    className='text-sm font-bold px-3 py-1 text-center leading-tight '
                  >
                    {getPresetDisplayText(preset)}
                  </div>
                </div>
                <span className='text-xs text-gray-400'>{preset.name}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
