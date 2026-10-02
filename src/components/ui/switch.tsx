import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'peer inline-flex h-4 w-7 shrink-0 items-center rounded-full bg-white/15 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-selection/60 disabled:opacity-40 data-[state=checked]:bg-selection',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className='pointer-events-none block size-3 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-3.5' />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
