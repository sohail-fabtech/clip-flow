import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StockMedia } from '@/features/editor/menu-item/stock-media';
import type { StockKind } from '@/features/editor/services/pexels';

const LIBRARY_TABS: { name: string; value: StockKind }[] = [
  { name: 'Images', value: 'image' },
  { name: 'Videos', value: 'video' },
];

export function StockLibrary() {
  return (
    <div className='flex flex-col bg-[#27272A] rounded-[5px] text-white'>
      <h1 className='text-sm p-3'>Stock Library</h1>
      <Separator className='w-full bg-white/60' />
      <div className='p-2'>
        <Tabs defaultValue={LIBRARY_TABS[0].value} className='max-w-xs w-full'>
          <TabsList className='w-full p-0 bg-transparent text-white justify-start rounded-none'>
            {LIBRARY_TABS.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='rounded-none h-full bg-transparent text-white data-[state=active]:shadow-none data-[state=active]:bg-transparent border-0 border-b border-transparent data-[state=active]:border-white cursor-pointer'
              >
                <p className='text-[13px] font-light'>{tab.name}</p>
              </TabsTrigger>
            ))}
          </TabsList>
          {LIBRARY_TABS.map(tab => (
            <TabsContent key={tab.value} value={tab.value}>
              <StockMedia kind={tab.value} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
