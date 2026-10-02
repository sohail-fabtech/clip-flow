import React from 'react';
import { Separator } from '@/components/ui/separator';

export function BrandTemplate() {
  return (
    <div className='flex flex-col bg-[#27272A] rounded-[5px] text-white'>
      <h1 className='text-sm p-3'>Brand Template</h1>
      <Separator className='w-full bg-white/60' />

      {/* content */}
      <div className='p-2'>Content for Brand Template</div>
    </div>
  );
}
