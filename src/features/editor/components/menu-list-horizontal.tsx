import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { Icons } from '@/components/shared/icons';
import { cn } from '@/lib/utils';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { MenuItem } from '@/features/editor/menu-item/menu-item';
import { useIsLargeScreen } from '@/features/editor/hooks/use-media-query';
import { Button } from '@/components/ui/button';

// Menu items configuration
const menuItems = [
  {
    id: 'texts',
    label: 'Text',
    icon: Icons.type,
  },
  {
    id: 'videos',
    label: 'Video',
    icon: Icons.video,
  },
  {
    id: 'images',
    label: 'Images',
    icon: Icons.image,
  },
  {
    id: 'audios',
    label: 'Audio',
    icon: Icons.audio,
  },
];

// Reusable MenuButton component
function MenuButton({ item, isActive, onClick }) {
  return (
    <Button onClick={onClick} variant={isActive ? 'default' : 'ghost'} size={'sm'} className='text-muted-foreground'>
      {item.label}
    </Button>
  );
}

export default function MenuListHorizontal() {
  const { setActiveMenuItem, setShowMenuItem, activeMenuItem, showMenuItem, drawerOpen, setDrawerOpen } =
    useLayoutStore();

  const isLargeScreen = useIsLargeScreen();

  const handleMenuItemClick = menuItem => {
    setActiveMenuItem(menuItem);
    // Use drawer on mobile, sidebar on desktop
    if (!isLargeScreen) {
      setDrawerOpen(true);
    } else {
      setShowMenuItem(true);
    }
  };

  const isMenuItemActive = itemId => {
    return (drawerOpen && activeMenuItem === itemId) || (showMenuItem && activeMenuItem === itemId);
  };

  return (
    <>
      <div className='flex h-12 items-center border-t !border-red-500'>
        <ScrollArea className='w-full px-2'>
          <div className='flex items-center justify-center space-x-4 min-w-max px-4'>
            {menuItems.map(item => (
              <MenuButton
                key={item.id}
                item={item}
                isActive={isMenuItemActive(item.id)}
                onClick={() => handleMenuItemClick(item.id)}
              />
            ))}
          </div>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>
      </div>

      {/* Drawer only on mobile/tablet - conditionally mounted */}
      {!isLargeScreen && (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className='max-h-[80vh] min-h-[340px] mt-0'>
            <VisuallyHidden>
              <DrawerHeader>
                <DrawerTitle>Menu Options</DrawerTitle>
                <DrawerDescription>Select from available menu options</DrawerDescription>
              </DrawerHeader>
            </VisuallyHidden>

            <div className='flex-1'>
              <MenuItem />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
