import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { MenuItem } from '@/features/editor/menu-item/menu-item';
import { MENU_ITEMS } from '@/features/editor/menu-item/menu-config';

export default function MenuListHorizontal() {
  const { activeMenuItem, setActiveMenuItem, drawerOpen, setDrawerOpen } = useLayoutStore();

  return (
    <>
      <div className='flex h-12 items-center border-t border-white/10'>
        <ScrollArea className='w-full px-2'>
          <div className='flex min-w-max items-center justify-center space-x-4 px-4'>
            {MENU_ITEMS.map(({ id, label }) => (
              <Button
                key={id}
                onClick={() => {
                  setActiveMenuItem(id);
                  setDrawerOpen(true);
                }}
                variant={drawerOpen && activeMenuItem === id ? 'secondary' : 'ghost'}
                size='sm'
                className='text-muted-foreground'
              >
                {label}
              </Button>
            ))}
          </div>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className='mt-0 max-h-[80vh] min-h-[340px]'>
          <DrawerTitle className='sr-only'>{MENU_ITEMS.find(item => item.id === activeMenuItem)?.label}</DrawerTitle>
          <DrawerDescription className='sr-only'>Editor panel</DrawerDescription>
          <div className='flex-1 overflow-auto'>
            <MenuItem />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
