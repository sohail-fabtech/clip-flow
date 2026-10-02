import * as React from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'h-7 w-full min-w-0 rounded-md border border-line bg-base px-2 text-xs text-ink outline-none placeholder:text-ink-4 focus-visible:border-selection/60 disabled:opacity-40',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
