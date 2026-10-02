import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type AutosizeInputProps = Omit<ComponentProps<'input'>, 'value'> & { value: string; inputClassName?: string };

export default function AutosizeInput({ value, inputClassName, className, ...props }: AutosizeInputProps) {
  return (
    <span className={cn('inline-grid', className)}>
      <span aria-hidden className={cn(inputClassName, 'invisible col-start-1 row-start-1 whitespace-pre')}>
        {value || ' '}
      </span>
      <input
        {...props}
        value={value}
        size={1}
        className={cn(inputClassName, 'col-start-1 row-start-1 w-full bg-transparent')}
      />
    </span>
  );
}
