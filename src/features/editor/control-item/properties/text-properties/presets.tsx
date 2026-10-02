import { CircleOff } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { applyPreset, getTextShadow, NONE_PRESET, TEXT_PRESETS } from '@/features/editor/control-item/floating-controls/text-preset-picker';
import useLayoutStore from '@/features/editor/stores/use-layout-store';

const Presets = () => {
  const { trackItem } = useLayoutStore();

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold text-gray-800'>Text Presets</h3>
      {/* <ScrollArea className='h-[calc(100%-20px)] w-full'> */}
      <div className='grid grid-cols-3 gap-3'>
        <div
          onClick={() => applyPreset(NONE_PRESET, trackItem)}
          className='flex h-[80px] cursor-pointer items-center justify-center bg-gray-100 border border-gray-100 hover:bg-gray-200 rounded-[8px] transition-colors'
        >
          <div className='flex flex-col items-center gap-2'>
            <CircleOff className='w-6 h-6 text-gray-500' />
            <span className='text-sm text-gray-600'>None</span>
          </div>
        </div>

        {TEXT_PRESETS.map((preset, index) => (
          <div
            key={index}
            onClick={() => applyPreset(preset, trackItem)}
            className='flex h-[80px] cursor-pointer items-center justify-center bg-gray-100 border border-gray-100 hover:bg-gray-200 rounded-[8px] transition-colors'
          >
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
              className='h-8 flex items-center justify-center px-3 text-sm'
            >
              Text
            </div>
          </div>
        ))}
      </div>
      {/* </ScrollArea> */}
    </div>
  );
};

export default Presets;
