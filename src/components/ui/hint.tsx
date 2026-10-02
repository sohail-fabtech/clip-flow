import type { ComponentProps, ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type HintProps = Pick<ComponentProps<typeof TooltipContent>, 'side' | 'align' | 'sideOffset' | 'alignOffset'> & {
  label: string;
  children: ReactNode;
};

export const Hint = ({ label, children, side, align, sideOffset, alignOffset }: HintProps) => (
  <TooltipProvider>
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        align={align}
        alignOffset={alignOffset}
        className='border-slate-800 bg-black !rounded text-white z-[1000]'
        side={side}
        sideOffset={sideOffset}
      >
        <p className='font-semibold capitalize'>{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
