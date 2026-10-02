import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ColorPicker } from '@/components/ui/color-picker';
import { useIsLargeScreen } from '@/features/editor/hooks/use-media-query';
import useLayoutStore from '@/features/editor/stores/use-layout-store';

interface ColorFieldProps {
  title: string;
  value: string;
  onChange: (color: string) => void;
  mobileControl: { type: string; label: string };
}

const Swatch = ({ value }: { value: string }) => (
  <span className='relative block w-32'>
    <span
      style={{ backgroundColor: value }}
      className='absolute left-0.5 top-0.5 h-7 w-7 flex-none rounded border border-white/20'
    />
    <Input className='pointer-events-none h-8 rounded pl-10' value={value} readOnly tabIndex={-1} />
  </span>
);

export function ColorField({ title, value, onChange, mobileControl }: ColorFieldProps) {
  const [open, setOpen] = useState(false);
  const isLargeScreen = useIsLargeScreen();
  const { setControItemDrawerOpen, setTypeControlItem, setLabelControlItem } = useLayoutStore();

  if (!isLargeScreen) {
    return (
      <button
        type='button'
        onClick={() => {
          setControItemDrawerOpen(true);
          setTypeControlItem(mobileControl.type);
          setLabelControlItem(mobileControl.label);
        }}
      >
        <Swatch value={value} />
      </button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger aria-label={`Pick ${title.toLowerCase()}`}>
        <Swatch value={value} />
      </PopoverTrigger>
      <PopoverContent
        side='bottom'
        align='end'
        className='z-[1000] w-auto rounded border-white/10 bg-[#0E0E11] p-3 text-white shadow-[0_0_20px_0_rgba(0,0,0,0.3)]'
      >
        <div className='mb-3 flex items-center justify-between'>
          <p className='text-sm font-bold'>{title}</p>
          <button type='button' onClick={() => setOpen(false)} aria-label='Close'>
            <X className='h-4 w-4' />
          </button>
        </div>
        <ColorPicker value={value} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
}
