import { Input } from '@/components/ui/input';

import { Slider } from '@/components/ui/slider';
import { useEffect, useState } from 'react';

const Speed = ({ value, onChange }) => {
  // Create local state to manage opacity
  const [localValue, setLocalValue] = useState(value);

  // Update local state when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    if (localValue !== '') {
      onChange(Number(localValue)); // Propagate as a number
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      if (localValue !== '') {
        onChange(Number(localValue)); // Propagate as a number
      }
    }
  };

  return (
    <div className='flex gap-2'>
      <div className='flex flex-1 items-center text-sm text-muted-foreground'>Speed</div>
      <div
        className='w-32 flex items-center gap-2'
        style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr',
        }}
      >
        <Slider
          id='opacity'
          value={[Number(localValue)]} // Use local state for slider value
          onValueChange={e => {
            setLocalValue(e[0]); // Update local state
          }}
          onValueCommit={() => {
            onChange(Number(localValue)); // Propagate value to parent when user commits change
          }}
          min={0}
          max={4}
          step={0.1}
          trackColor='bg-gray-100'
          rangeColor='bg-black'
          aria-label='Opacity'
        />
        <Input
          className='h-8 w-11 px-2 text-center text-sm rounded-[8px] border-gray-100 focus-visible:border-gray-200 focus-visible:ring-0 outline-none'
          value={localValue}
          onChange={e => {
            const newValue = e.target.value;

            // Allow empty string or validate as a number
            if (newValue === '' || (!Number.isNaN(Number(newValue)) && Number(newValue) >= 0)) {
              setLocalValue(newValue); // Update local state
            }
          }}
          onBlur={handleBlur} // Trigger onBlur event
          onKeyDown={handleKeyDown} // Trigger onKeyDown event
        />
      </div>
    </div>
  );
};

export default Speed;
