import type { ComponentType, SVGProps } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/shared/icons';
import usePropertiesStore from '@/features/editor/stores/use-property-store';
import { cn } from '@/lib/utils';

interface MenuEntry {
  id: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const PROPERTY_MENUS: Record<string, MenuEntry[]> = {
  text: [
    { id: 'text-basic', icon: Icons.text, label: 'Basic' },
    { id: 'text-presets', icon: Icons.presets, label: 'Presets' },
    { id: 'text-smart', icon: Icons.AI, label: 'Smart Tools' },
  ],
  image: [
    { id: 'image-basic', icon: Icons.camera, label: 'Basic' },
    { id: 'image-color', icon: Icons.color, label: 'Colors' },
    { id: 'image-crop', icon: Icons.background, label: 'Crop' },
    { id: 'image-filter', icon: Icons.filters, label: 'Filter' },
  ],
  video: [
    { id: 'video-basic', icon: Icons.film, label: 'Basic' },
    { id: 'video-color', icon: Icons.color, label: 'Colors' },
    { id: 'video-crop', icon: Icons.background, label: 'Crop' },
    { id: 'video-filter', icon: Icons.filters, label: 'Filter' },
  ],
  audio: [{ id: 'audio-basic', icon: Icons.music, label: 'Basic' }],
};

export function PropertyMenu({ items }: { items: MenuEntry[] }) {
  const { setActivePropertyItem, setShowPropertyItem, activePropertyItem, showPropertyItem } = usePropertiesStore();

  const toggle = (id: string) => {
    const closing = activePropertyItem === id && showPropertyItem;
    setActivePropertyItem(closing ? '' : id);
    setShowPropertyItem(!closing);
  };

  return (
    <div className='absolute right-4 top-4 z-[999]'>
      <ScrollArea className='h-96 w-18'>
        <div className='flex w-full flex-col items-center justify-center gap-2 rounded-[6px] border border-white/10 bg-[#0E0E11] !p-2 text-white shadow-md'>
          {items.map(item => (
            <button
              type='button'
              key={item.id}
              onClick={() => toggle(item.id)}
              className={cn(
                'flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[6px] p-2 hover:bg-white/10',
                showPropertyItem && activePropertyItem === item.id && 'bg-white/10',
              )}
            >
              <item.icon className='h-4 w-4' />
              <span className='text-center text-[11px]'>{item.label}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
