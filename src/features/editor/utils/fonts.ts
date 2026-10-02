import { groupBy } from 'lodash';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import type { IDesign } from '@designcombo/types';
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

export const styleNameOf = (postScriptName: string) =>
  postScriptName.substring(postScriptName.lastIndexOf('-') + 1).replace('Italic', ' Italic');

export async function applyFont(trackItemId: string, font: FontInfo) {
  await loadFonts([{ name: font.postScriptName, url: font.url }]);
  dispatch(EDIT_OBJECT, {
    payload: { [trackItemId]: { details: { fontFamily: font.postScriptName, fontUrl: font.url } } },
  });
}

export const fontsOfDesign = (design: IDesign): FontSource[] =>
  Object.values(design.trackItemsMap)
    .filter(item => item.details?.fontFamily && item.details?.fontUrl)
    .map(item => ({ name: item.details.fontFamily as string, url: item.details.fontUrl as string }));
