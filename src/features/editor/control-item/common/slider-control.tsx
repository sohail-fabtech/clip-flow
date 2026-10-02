import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

const SliderControl = ({ label, value, onChange, max = 100 }: SliderControlProps) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className='flex gap-2'>
      <div className='flex flex-1 items-center text-sm text-muted-foreground'>{label}</div>
      <div className='grid w-32 grid-cols-[80px_1fr] items-center gap-2'>
        <Slider
          value={[localValue]}
          onValueChange={([next]) => setLocalValue(next)}
          onValueCommit={() => onChange(localValue)}
          min={0}
          max={max}
          step={1}
          aria-label={label}
        />
        <Input
          type='number'
          min={0}
          max={max}
          className='h-8 w-11 rounded-[8px] px-2 text-center text-sm outline-none focus-visible:ring-0'
          value={localValue}
          onChange={event => {
            const next = Number(event.target.value);
            if (next < 0 || next > max) return;
            setLocalValue(next);
            onChange(next);
          }}
        />
      </div>
    </div>
  );
};

export default SliderControl;
