import { ScrollArea } from '@/components/ui/scroll-area';
import type { Section } from '@/features/editor/control-item/media-sections';

interface MobilePanelProps {
  title?: string;
  sections: Section[];
  type?: string;
}

export const MobilePanel = ({ title, sections, type }: MobilePanelProps) => (
  <div className='flex flex-1 flex-col'>
    {title && <div className='flex h-12 flex-none items-center px-4 text-sm font-medium'>{title}</div>}
    <ScrollArea className='h-full'>
      <div className='flex flex-col gap-2 px-4 py-4'>
        {sections
          .filter(section => !type || section.key === type)
          .map(({ key, node }) => (
            <div key={key}>{node}</div>
          ))}
      </div>
    </ScrollArea>
  </div>
);
