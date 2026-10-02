import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function NumberField({ label, value, onChange, min = -Infinity, max = Infinity }: NumberFieldProps) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  return (
    <div className='flex gap-2'>
      <div className='flex flex-1 items-center text-sm text-muted-foreground'>{label}</div>
      <Input
        className='h-8 w-32 rounded outline-none focus-visible:ring-0'
        inputMode='decimal'
        aria-label={label}
        value={text}
        onChange={event => {
          const next = event.target.value;
          if (next !== '' && next !== '-' && Number.isNaN(Number(next))) return;
          setText(next);
          const number = Number(next);
          if (next !== '' && next !== '-' && number >= min && number <= max) onChange(number);
        }}
      />
    </div>
  );
}
