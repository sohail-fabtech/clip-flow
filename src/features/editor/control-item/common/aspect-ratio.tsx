import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export default function AspectRatio() {
  const [value, setValue] = useState('locked');
  return (
    <div className='flex gap-2'>
      <div className='flex flex-1 items-center text-sm text-muted-foreground'>Lock Ratio</div>
      <div className='ml-6 w-32'>
        <ToggleGroup
          value={value}
          size='sm'
          className='grid h-8 grid-cols-2 text-sm'
          type='single'
          onValueChange={next => next && setValue(next)}
        >
          <ToggleGroupItem value='locked' aria-label='Lock ratio' className='rounded data-[state=on]:bg-white/20'>
            Yes
          </ToggleGroupItem>
          <ToggleGroupItem value='unlocked' aria-label='Unlock ratio' className='rounded data-[state=on]:bg-white/20'>
            No
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
