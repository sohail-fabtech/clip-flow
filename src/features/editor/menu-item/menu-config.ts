import type { ComponentType, SVGProps } from 'react';
import { Icons } from '@/components/shared/icons';
import { AIEnhance } from '@/features/editor/menu-item/ai-enhance';
import { Caption } from '@/features/editor/menu-item/caption';
import { Uploads } from '@/features/editor/menu-item/uploads';
import { BrandTemplate } from '@/features/editor/menu-item/brand-template';
import { BRoll } from '@/features/editor/menu-item/b-roll';
import { Texts } from '@/features/editor/menu-item/texts';
import { Audios } from '@/features/editor/menu-item/audios';
import { AIHooks } from '@/features/editor/menu-item/ai-hooks';
import { StockLibrary } from '@/features/editor/menu-item/stock-library';
import { Transitions } from '@/features/editor/menu-item/transitions';

export interface MenuEntry {
  id: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  panel: ComponentType;
}

export const MENU_ITEMS: MenuEntry[] = [
  { id: 'ai-enhance', label: 'AI Enhance', icon: Icons.AI, panel: AIEnhance },
  { id: 'caption', label: 'Caption', icon: Icons.Caption, panel: Caption },
  { id: 'uploads', label: 'Uploads', icon: Icons.upload, panel: Uploads },
  { id: 'brand-template', label: 'Brand Template', icon: Icons.Brand, panel: BrandTemplate },
  { id: 'b-roll', label: 'B-Roll', icon: Icons.BRoll, panel: BRoll },
  { id: 'texts', label: 'Texts', icon: Icons.text, panel: Texts },
  { id: 'music', label: 'Music', icon: Icons.audio, panel: Audios },
  { id: 'ai-hook', label: 'AI Hook', icon: Icons.voiceOver, panel: AIHooks },
  { id: 'stock-library', label: 'Stocks Library', icon: Icons.StocksLibrary, panel: StockLibrary },
  { id: 'transitions', label: 'Transitions', icon: Icons.transitions, panel: Transitions },
];
