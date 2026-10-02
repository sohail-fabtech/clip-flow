import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { useIsLargeScreen } from '@/features/editor/hooks/use-media-query';
import { MENU_ITEMS } from '@/features/editor/menu-item/menu-config';

export function MenuItem() {
  const activeMenuItem = useLayoutStore(state => state.activeMenuItem);
  const isLargeScreen = useIsLargeScreen();
  const Panel = MENU_ITEMS.find(item => item.id === activeMenuItem)?.panel;
  if (!Panel) return null;

  return (
    <div className={`${isLargeScreen ? 'w-[300px]' : 'w-full'} flex flex-col bg-[#0E0E11] p-1`}>
      <Panel />
    </div>
  );
}
