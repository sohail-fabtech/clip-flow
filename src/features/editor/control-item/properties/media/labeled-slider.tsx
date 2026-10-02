import { useEffect, useState, type ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface LabeledSliderProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  onCommit: (value: number) => void;
  before?: ReactNode;
  after?: ReactNode;
}

export function LabeledSlider({ label, value, unit, min, max, step = 1, onCommit, before, after }: LabeledSliderProps) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <Label className='text-sm text-muted-foreground'>{label}</Label>
        <span className='text-sm text-muted-foreground'>
          {local}
          {unit}
        </span>
      </div>
      <div className='flex items-center gap-2'>
        {before}
        <Slider
          value={[local]}
          onValueChange={([next]) => setLocal(next)}
          onValueCommit={([next]) => onCommit(next)}
          min={min}
          max={max}
          step={step}
          className='flex-1'
          aria-label={label}
        />
        {after}
      </div>
    </div>
  );
}
