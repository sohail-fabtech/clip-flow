import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const GlassicButton = memo(({ title, onClick, className, icon }) => (
  <Button
    onClick={onClick}
    className={cn('glass-bg bg-white/10 hover:glass-bg hover:bg-white/10  flex items-center gap-2', className)}
  >
    {icon}
    {title}
  </Button>
));
