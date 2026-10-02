import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

const Speed = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
  const [localValue, setLocalValue] = useState(String(value));

  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  const commit = () => {
    if (localValue !== '' && Number(localValue) > 0) onChange(Number(localValue));
  };

  return (
    <div className='flex gap-2'>
      <div className='flex flex-1 items-center text-sm text-muted-foreground'>Speed</div>
      <div className='grid w-32 grid-cols-[80px_1fr] items-center gap-2'>
        <Slider
          value={[Number(localValue)]}
          onValueChange={([next]) => setLocalValue(String(next))}
          onValueCommit={commit}
          min={0.1}
          max={4}
          step={0.1}
          aria-label='Speed'
        />
        <Input
          className='h-8 w-11 rounded-[8px] px-2 text-center text-sm outline-none focus-visible:ring-0'
          value={localValue}
          inputMode='decimal'
          onChange={event => {
            const next = event.target.value;
            if (next === '' || (!Number.isNaN(Number(next)) && Number(next) >= 0)) setLocalValue(next);
          }}
          onBlur={commit}
          onKeyDown={event => event.key === 'Enter' && commit()}
        />
      </div>
    </div>
  );
};

export default Speed;
