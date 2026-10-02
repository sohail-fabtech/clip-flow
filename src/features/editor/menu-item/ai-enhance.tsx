import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Wand2, RefreshCw, Shield, Mic, Smile } from 'lucide-react';

export function AIEnhance() {
  const items = [
    { label: 'Remove filler words', icon: Wand2 },
    { label: 'Remove pauses', icon: RefreshCw },
    { label: 'Auto censor', icon: Shield, badge: 'Beta' },
    { label: 'Speech enhancement', icon: Mic, toggle: true },
    { label: 'AI emoji', icon: Smile, toggle: true },
  ];
  return (
    <div className='flex flex-col bg-[#27272A] rounded-md text-white'>
      {/* Header */}
      <h1 className='text-sm p-3'>AI Enhance</h1>
      <Separator className='w-full bg-white/40' />

      {/* List items */}
      <div className='flex flex-col gap-1 py-2'>
        {items.map((item, idx) => (
          <div
            key={idx}
            className={cn(
              'flex items-center justify-between px-3 py-3 text-sm hover:bg-white/5 rounded-md cursor-pointer transition',
            )}
          >
            <div className='flex items-center gap-2'>
              <item.icon className='w-4 h-4 text-white/80' />
              <span className='font-light'>{item.label}</span>
              {item.badge && (
                <span className='ml-2 text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white/80 uppercase'>
                  {item.badge}
                </span>
              )}
            </div>
            {item.toggle && <Switch className='!bg-[#4F4F51]' />}
          </div>
        ))}
      </div>
    </div>
  );
}
