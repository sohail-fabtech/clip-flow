import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { useIsLargeScreen } from '@/features/editor/hooks/use-media-query';
import { PresetGrid } from '@/features/editor/control-item/floating-controls/text-preset-picker';
import type { TrackItem } from '@/features/editor/types';

export const PresetText = ({ trackItem }: { trackItem: TrackItem }) => {
  const setFloatingControl = useLayoutStore(state => state.setFloatingControl);
  const isLargeScreen = useIsLargeScreen();

  return (
    <div className='flex flex-col gap-2 text-white'>
      <Label className='font-sans text-xs font-semibold'>Text</Label>
      <div className='flex flex-col gap-2 py-0 lg:flex-row'>
        <div className='flex flex-1 items-center text-sm text-muted-foreground'>Preset</div>
        {isLargeScreen ? (
          <Button
            className='flex h-8 w-32 items-center justify-between text-sm'
            variant='outline'
            onClick={() => setFloatingControl('text-preset-picker')}
          >
            <span className='truncate'>None</span>
            <ChevronDown size={14} />
          </Button>
        ) : (
          <ScrollArea className='h-[300px] w-full py-0'>
            <PresetGrid
              trackItem={trackItem}
              className='grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(100px,1fr))]'
            />
          </ScrollArea>
        )}
      </div>
    </div>
  );
};
