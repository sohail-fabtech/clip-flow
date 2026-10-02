'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

function Slider({
  className,
  trackStyle,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & { trackStyle?: React.CSSProperties }) {
  const count = (props.value ?? props.defaultValue ?? [0]).length;
  return (
    <SliderPrimitive.Root
      className={cn(
        'relative flex h-4 w-full touch-none items-center select-none data-[disabled]:opacity-40',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className='relative h-1 grow overflow-hidden rounded-full bg-white/12' style={trackStyle}>
        {!trackStyle && <SliderPrimitive.Range className='absolute h-full bg-white/55' />}
      </SliderPrimitive.Track>
      {Array.from({ length: count }, (_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className='block size-2.5 rounded-full bg-white shadow ring-selection/60 outline-none hover:scale-125 focus-visible:ring-2'
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
