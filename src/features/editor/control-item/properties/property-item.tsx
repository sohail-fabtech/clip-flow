import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useCallback } from 'react';
import usePropertiesStore from '@/features/editor/stores/use-property-store';
import { cn } from '@/lib/utils';

function PropertieItem({ MENU_ITEMS = [] }) {
  const { setActivePropertyItem, setShowPropertyItem, activePropertyItem, showPropertyItem } = usePropertiesStore();

  const handlePropertyItemClick = useCallback(
    propertyItem => {
      // If clicking the same item that's already active, toggle it off
      if (activePropertyItem === propertyItem && showPropertyItem) {
        setShowPropertyItem(false);
        setActivePropertyItem('');
      } else {
        // Otherwise, set the new active item and show it
        setActivePropertyItem(propertyItem);
        setShowPropertyItem(true);
      }
    },
    [activePropertyItem, showPropertyItem, setActivePropertyItem, setShowPropertyItem],
  );

  return (
    <div className='absolute top-4 right-4 z-[999]'>
      <ScrollArea className='w-18 h-96'>
        <div className='w-full bg-white shadow-md flex flex-col items-center text-black group justify-center gap-2 !p-2 rounded-[6px]'>
          {MENU_ITEMS.map(item => {
            const isActive = showPropertyItem && activePropertyItem === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handlePropertyItemClick(item.id)}
                className={cn(
                  'flex flex-col border border-white/20 cursor-pointer gap-1 w-full p-2 hover:bg-[#EDF2F4] items-center justify-center rounded-[6px]',
                  isActive && 'bg-[#EDF2F4]',
                )}
              >
                <item.icon className='w-4 h-4' />
                <p className='text-[11px] text-center'>{item.label}</p>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export default PropertieItem;
