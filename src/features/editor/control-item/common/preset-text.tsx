import { Button } from '@/components/ui/button';
import { ChevronDown, CircleOff } from 'lucide-react';
import { Label } from '@/components/ui/label';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { useIsLargeScreen } from '@/features/editor/hooks/use-media-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { applyPreset, getTextShadow, NONE_PRESET, TEXT_PRESETS } from '@/features/editor/control-item/floating-controls/text-preset-picker';

export const PresetText = ({ properties, trackItem }) => {
  return (
    <div className='flex flex-col gap-2 text-white'>
      <Label className='font-sans text-xs font-semibold'>Text</Label>
      <SelectPreset trackItem={trackItem} />
    </div>
  );
};

const SelectPreset = ({ trackItem }) => {
  const { setFloatingControl } = useLayoutStore();
  const isLargeScreen = useIsLargeScreen();

  return (
    <div className='flex gap-2 py-0 flex-col lg:flex-row'>
      <div className='flex flex-1 items-center text-sm text-muted-foreground'>Preset</div>
      {isLargeScreen ? (
        <div className='relative w-32'>
          <Button
            className='flex h-8 w-full items-center justify-between text-sm border-gray-200'
            variant='outline'
            onClick={() => setFloatingControl('text-preset-picker')}
          >
            <div className='w-full text-left'>
              <p className='truncate'>None</p>
            </div>
            <ChevronDown className='text-white' size={14} />
          </Button>
        </div>
      ) : (
        <div>
          <ScrollArea className='h-[300px] w-full py-0'>
            <div className='grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(100px,1fr))]'>
              <div
                onClick={() => applyPreset(NONE_PRESET, trackItem)}
                className='flex h-[70px] cursor-pointer items-center justify-center bg-zinc-800 rounded-lg'
              >
                <CircleOff />
              </div>

              {TEXT_PRESETS.map((preset, index) => (
                <div
                  key={index}
                  onClick={() => applyPreset(preset, trackItem)}
                  className='text-md flex h-[70px] cursor-pointer items-center justify-center bg-zinc-800 rounded-lg'
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
                    className='h-6 place-content-center px-2'
                  >
                    Text
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
