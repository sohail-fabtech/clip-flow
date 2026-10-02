import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { useIsLargeScreen } from '@/features/editor/hooks/use-media-query';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ColorPicker } from '@/components/ui/color-picker';
import { X } from 'lucide-react';

function Outline({ label, onChageBorderWidth, onChangeBorderColor, valueBorderWidth, valueBorderColor }) {
  const [localValueBorderWidth, setLocalValueBorderWidth] = useState(valueBorderWidth);
  const [localValueBorderColor, setLocalValueBorderColor] = useState(valueBorderColor);
  const [open, setOpen] = useState(false);
  const isLargeScreen = useIsLargeScreen();
  const { setControItemDrawerOpen, setTypeControlItem, setLabelControlItem } = useLayoutStore();

  useEffect(() => {
    setLocalValueBorderWidth(valueBorderWidth);
    setLocalValueBorderColor(valueBorderColor);
  }, [valueBorderWidth, valueBorderColor]);

  const handleColorClick = () => {
    if (!isLargeScreen) {
      setControItemDrawerOpen(true);
      setTypeControlItem('strokeColor');
      setLabelControlItem('Stroke Color');
    }
  };

  return (
    <div className='flex flex-col gap-2 py-4'>
      <Label className='font-sans text-xs font-semibold'>{label}</Label>

      <div className='flex gap-2'>
        <div className='flex flex-1 items-center text-sm text-muted-foreground'>Color</div>

        {isLargeScreen ? (
          <div className='relative w-32'>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger>
                <div className='relative cursor-pointer'>
                  <div
                    style={{
                      backgroundColor: localValueBorderColor,
                    }}
                    className='absolute left-0.5 top-0.5 h-7 w-7 flex-none cursor-pointer border border-gray-100 rounded'
                  />

                  <Input
                    className='pointer-events-none h-8 pl-10 border-gray-200 focus-visible:ring-0 outline-none rounded'
                    value={localValueBorderColor}
                    onChange={() => {}}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent
                side='bottom'
                align='end'
                className='z-[1000] w-[280px] shadow-[0_0_20px_0_rgba(0,0,0,0.3)] p-4 bg-white text-black border-none rounded'
              >
                <div className='drag-handle flex w-[266px] cursor-grab justify-between rounded-t-lg bg-popover pr-4 mb-4'>
                  <p className='text-sm font-bold'>Color</p>
                  <div
                    className='h-4 w-4'
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    <X className='h-4 w-4 cursor-pointer font-extrabold text-black' />
                  </div>
                </div>

                <ColorPicker
                  value={localValueBorderColor}
                  onChange={v => {
                    setLocalValueBorderColor(v);
                    onChangeBorderColor(v);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <div className='relative w-32'>
            <div className='relative cursor-pointer' onClick={handleColorClick}>
              <div
                style={{
                  backgroundColor: localValueBorderColor,
                }}
                className='absolute left-0.5 top-0.5 h-7 w-7 flex-none rounded-md border border-border'
              />

              <Input className='pointer-events-none h-8 pl-10' value={localValueBorderColor} onChange={() => {}} />
            </div>
          </div>
        )}
      </div>

      <div className='flex gap-2'>
        <div className='flex flex-1 items-center text-sm text-muted-foreground'>Size</div>
        <div className='relative w-32'>
          <Input
            type='text'
            className='h-8 border-gray-200 focus-visible:ring-0 outline-none rounded'
            onChange={e => {
              const newValue = e.target.value;

              // Allow empty string or validate as a number
              if (
                newValue === '' ||
                (!Number.isNaN(Number(newValue)) && Number(newValue) >= 0 && Number(newValue) <= 100)
              ) {
                setLocalValueBorderWidth(newValue); // Update local state

                // Only propagate if it's a valid number and not empty
                if (newValue !== '') {
                  onChageBorderWidth(Number(newValue)); // Propagate as a number
                }
              }
            }}
            value={localValueBorderWidth} // Use local state for input value
          />
        </div>
      </div>
    </div>
  );
}

export default Outline;
