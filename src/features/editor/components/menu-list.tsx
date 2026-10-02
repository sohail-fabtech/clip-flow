import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MENU_ITEMS } from '@/features/editor/menu-item/menu-config';
import { cn } from '@/lib/utils';

function MenuList() {
  const { activeMenuItem, setActiveMenuItem } = useLayoutStore();

  return (
    <nav className='w-18 border-r border-white/10 bg-black py-4' role='toolbar' aria-label='Editor tools'>
      <ScrollArea className='h-full w-full'>
        <div className='mx-1 flex flex-col items-center gap-4 py-3'>
          {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              type='button'
              key={id}
              aria-pressed={activeMenuItem === id}
              onClick={() => setActiveMenuItem(activeMenuItem === id ? '' : id)}
              className={cn(
                'flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[4px] from-[#a2503d]/80 via-[#E94573]/70 to-[#379BEA]/50 py-2 hover:bg-gradient-to-bl',
                activeMenuItem === id && 'bg-gradient-to-bl',
              )}
            >
              <Icon width={16} height={16} className='!h-5 !w-6 text-white' />
              <span className='text-center text-[10px] text-white'>{label}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </nav>
  );
}

export default MenuList;
