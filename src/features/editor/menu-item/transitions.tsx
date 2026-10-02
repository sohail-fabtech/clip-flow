import React from 'react';
import { Separator } from '@/components/ui/separator';

export function Transitions() {
  return (
    <div className='flex flex-col bg-[#27272A] rounded-[5px] text-white'>
      <h1 className='text-sm p-3'>Transitions</h1>
      <Separator className='w-full bg-white/60' />

      <div className='p-2'>Content for Transitions</div>
    </div>
  );
}
