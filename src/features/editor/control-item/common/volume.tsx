import { Input } from '@/components/ui/input';

import { Slider } from '@/components/ui/slider';
import { useEffect, useState } from 'react';

const Volume = ({ value, onChange }) => {
  // Create local state to manage opacity
  const [localValue, setLocalValue] = useState(value);

  // Update local state when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className='flex gap-2'>
      <div className='flex flex-1 items-center text-sm text-muted-foreground'>Volume</div>
      <div
        className='w-32 flex items-center gap-2'
        style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr',
        }}
      >
        <Slider
          id='opacity'
          value={[localValue]} // Use local state for slider value
          onValueChange={e => {
            setLocalValue(e[0]); // Update local state
          }}
          onValueCommit={() => {
            onChange(localValue); // Propagate value to parent when user commits change
          }}
          max={100}
          step={1}
          trackColor='bg-gray-100'
          rangeColor='bg-black'
          aria-label='Temperature'
        />
        <Input
          className='h-8 w-11 px-2 text-center text-sm rounded-[8px] border-gray-100 focus-visible:border-gray-200 focus-visible:ring-0 outline-none'
          type='number'
          onChange={e => {
            const newValue = Number(e.target.value);
            if (newValue >= 0 && newValue <= 100) {
              setLocalValue(newValue); // Update local state
              onChange(newValue); // Optionally propagate immediately, or adjust as needed
            }
          }}
          value={localValue} // Use local state for input value
        />
      </div>
    </div>
  );
};

export default Volume;
