import { groupBy } from 'lodash';
import type { CompactFont, FontInfo } from '@/features/editor/types';

export interface FontSource {
  name: string;
  url: string;
}

export async function loadFonts(fonts: FontSource[]) {
  const loaded = await Promise.allSettled(fonts.map(font => new FontFace(font.name, `url(${font.url})`).load()));
  for (const result of loaded) {
    if (result.status === 'fulfilled') document.fonts.add(result.value);
  }
}

const findDefaultFont = (fonts: FontInfo[]) =>
  fonts.find(font => font.fullName.toLowerCase().includes('regular')) ?? fonts[0];

export const getCompactFontData = (fonts: FontInfo[]): CompactFont[] =>
  Object.entries(groupBy(fonts, font => font.family)).map(([family, styles]) => ({
    family,
    styles,
    default: findDefaultFont(styles),
  }));
