import React, { memo, useCallback } from 'react';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { Icons } from '@/components/shared/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { MenuItem } from '@/features/editor/menu-item/menu-item';
import { useIsLargeScreen } from '@/features/editor/hooks/use-media-query';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define menu items configuration for better maintainability
const MENU_ITEMS = [
  {
    id: 'ai-enhance',
    icon: Icons.AI,
    label: 'AI Enhance',
    ariaLabel: 'Add and manage AI enhancements',
  },
  {
    id: 'caption',
    icon: Icons.Caption,
    label: 'Caption',
    ariaLabel: 'Add and manage captions',
  },
  {
    id: 'uploads',
    icon: Icons.upload,
    label: 'Uploads',
    ariaLabel: 'Add and manage uploads',
  },
  {
    id: 'brand-template',
    icon: Icons.Brand,
    label: 'Brand Template',
    ariaLabel: 'Add and edit brand templates',
  },
  {
    id: 'b-roll',
    icon: Icons.BRoll,
    label: 'B-Roll',
    ariaLabel: 'Add and edit B-Roll templates',
  },
  {
    id: 'texts',
    icon: Icons.text,
    label: 'Texts',
    ariaLabel: 'Add and edit text elements',
  },
  {
    id: 'music',
    icon: Icons.audio,
    label: 'Music',
    ariaLabel: 'Add and manage audio content',
  },
  {
    id: 'ai-hook',
    icon: Icons.voiceOver,
    label: 'AI Hook',
    ariaLabel: 'Generate AI voice over',
  },
  {
    id: 'stock-library',
    icon: Icons.StocksLibrary,
    label: 'Stocks Library',
    ariaLabel: 'Access stock media library',
  },
  {
    id: 'transitions',
    icon: Icons.transitions,
    label: 'Transitions',
    ariaLabel: 'Add and manage transitions',
  },
  // {
  //   id: 'shapes',
  //   icon: Icons.shapes,
  //   label: 'Elements',
  //   ariaLabel: 'Add and manage shapes and elements',
  // },
  // {
  //   id: 'videos',
  //   icon: Icons.video,
  //   label: 'Videos',
  //   ariaLabel: 'Add and manage video content',
  // },
  // {
  //   id: 'images',
  //   icon: Icons.image,
  //   label: 'Images',
  //   ariaLabel: 'Add and manage images',
  // },
];

// Memoized menu button component for better performance
const MenuButton = memo(({ item, isActive }) => {
  const IconComponent = item.icon;

  return <>{IconComponent ? <IconComponent width={16} height={16} className={cn('!w-6 !h-5 text-white')} /> : null}</>;
});

MenuButton.displayName = 'MenuButton';

// Main MenuList component
function MenuList() {
  const { setActiveMenuItem, setShowMenuItem, activeMenuItem, showMenuItem, drawerOpen, setDrawerOpen } =
    useLayoutStore();

  const isLargeScreen = useIsLargeScreen();

  const handleMenuItemClick = useCallback(
    menuItem => {
      setActiveMenuItem(menuItem);
      // Use drawer on mobile, sidebar on desktop
      if (!isLargeScreen) {
        setDrawerOpen(true);
      } else {
        setShowMenuItem(true);
      }
    },
    [isLargeScreen, setActiveMenuItem, setDrawerOpen, setShowMenuItem],
  );

  const handleDrawerOpenChange = useCallback(
    open => {
      setDrawerOpen(open);
    },
    [setDrawerOpen],
  );

  return (
    <>
      <nav className='w-18 py-4 bg-[#000000] border-r border-white/10' role='toolbar' aria-label='Editor tools'>
        <ScrollArea className='h-full w-full'>
          <div className='flex flex-col items-center gap-4 py-3 mx-1'>
            {MENU_ITEMS.map((item, idx) => {
              const isActive =
                (drawerOpen && activeMenuItem === item.id) || (showMenuItem && activeMenuItem === item.id);

              const handleClick = useCallback(id => {
                handleMenuItemClick(id);
              }, []);

              return (
                <div
                  onClick={() => handleClick(item.id)}
                  key={item.id || idx}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 w-full py-2 from-[#a2503d]/80 via-[#E94573]/70 to-[#379BEA]/50  hover:bg-gradient-to-bl cursor-pointer rounded-[4px]',
                    isActive && 'bg-gradient-to-bl',
                  )}
                >
                  <MenuButton item={item} isActive={isActive} />
                  <p className='text-[10px] text-white text-center'>{item.label}</p>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </nav>

      {/* Drawer only on mobile/tablet - conditionally mounted */}
      {!isLargeScreen && (
        <Drawer open={drawerOpen} onOpenChange={handleDrawerOpenChange}>
          <DrawerContent className='max-h-[80vh]'>
            <DrawerHeader>
              <DrawerTitle className='capitalize'>{activeMenuItem}</DrawerTitle>
            </DrawerHeader>
            <div className='flex-1 overflow-auto'>
              <MenuItem />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}

export default memo(MenuList);
