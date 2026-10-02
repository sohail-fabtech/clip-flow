import React, { useMemo } from 'react';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { useIsLargeScreen } from '@/features/editor/hooks/use-media-query';
import { AIEnhance } from '@/features/editor/menu-item/ai-enhance';
import { Caption } from '@/features/editor/menu-item/caption';
import { BrandTemplate } from '@/features/editor/menu-item/brand-template';
import { BRoll } from '@/features/editor/menu-item/b-roll';
import { AIHooks } from '@/features/editor/menu-item/ai-hooks';
import { StockLibrary } from '@/features/editor/menu-item/stock-library';
import { Texts } from '@/features/editor/menu-item/texts';
import { Audios } from '@/features/editor/menu-item/audios';
import { Elements } from '@/features/editor/menu-item/elements';
import { Uploads } from '@/features/editor/menu-item/uploads';
import { Transitions } from '@/features/editor/menu-item/transitions';

// Menu keys centralized to avoid repeating hardcoded strings
const MENU_KEYS = {
  AI_ENHANCE: 'ai-enhance',
  CAPTION: 'caption',
  UPLOADS: 'uploads',
  BRAND_TEMPLATE: 'brand-template',
  B_ROLL: 'b-roll',
  TEXTS: 'texts',
  AUDIOS: 'music',
  AI_HOOK: 'ai-hook',
  STOCKS_LIBRARY: 'stock-library',
  ELEMENTS: 'elements',
  TRANSITIONS: 'transitions',
};

// Map menu keys to components; keeps mapping explicit and easy to extend
const MENU_COMPONENTS = {
  [MENU_KEYS.AI_ENHANCE]: AIEnhance,
  [MENU_KEYS.CAPTION]: Caption,
  [MENU_KEYS.UPLOADS]: Uploads,
  [MENU_KEYS.BRAND_TEMPLATE]: BrandTemplate,
  [MENU_KEYS.B_ROLL]: BRoll,
  [MENU_KEYS.TEXTS]: Texts,
  [MENU_KEYS.AUDIOS]: Audios,
  [MENU_KEYS.AI_HOOK]: AIHooks,
  [MENU_KEYS.STOCKS_LIBRARY]: StockLibrary,
  [MENU_KEYS.ELEMENTS]: Elements,
  [MENU_KEYS.TRANSITIONS]: Transitions,
};

export const MenuItem = React.memo(function MenuItem() {
  // Select only the value we care about to avoid unnecessary re-renders
  const activeMenuItem = useLayoutStore(s => s.activeMenuItem);
  console.log('activeMenuItem', activeMenuItem);
  const isLargeScreen = useIsLargeScreen();

  const ActiveComponent = MENU_COMPONENTS[activeMenuItem] ?? null;

  // Memoize the rendered component instance
  const activeMenuContent = useMemo(() => {
    return ActiveComponent ? <ActiveComponent /> : null;
  }, [ActiveComponent]);

  if (!activeMenuContent) return null;

  return (
    <div className={`${isLargeScreen ? 'w-[300px]' : 'w-full'} bg-[#0E0E11] flex flex-col p-1`}>
      {activeMenuContent}
    </div>
  );
});
