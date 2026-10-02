import { useState } from 'react';
import { Composition as RemotionComposition, continueRender, delayRender } from 'remotion';
import type { IDesign, ITrackItem } from '@designcombo/types';
import Composition from '@/features/editor/player/composition';
import useStore from '@/features/editor/stores/use-store';
import { loadFonts } from '@/features/editor/utils/fonts';

export const COMPOSITION_ID = 'editor';

interface RenderProps extends Record<string, unknown> {
  design: IDesign;
}

const fontsOf = (items: ITrackItem[]) =>
  items
    .filter(item => item.details?.fontFamily && item.details?.fontUrl)
    .map(item => ({ name: item.details.fontFamily as string, url: item.details.fontUrl as string }));

const RenderComposition = ({ design }: RenderProps) => {
  useState(() => {
    const { structure = [], background, duration, ...rest } = design;
    useStore.setState({ ...rest, structure, ...(background && { background }), ...(duration && { duration }) });
    const handle = delayRender('Loading fonts');
    loadFonts(fontsOf(Object.values(design.trackItemsMap))).finally(() => continueRender(handle));
  });
  return <Composition />;
};

export const RemotionRoot = () => (
  <RemotionComposition
    id={COMPOSITION_ID}
    component={RenderComposition}
    defaultProps={{ design: {} as IDesign }}
    calculateMetadata={({ props: { design } }) => ({
      fps: design.fps,
      width: design.size.width,
      height: design.size.height,
      durationInFrames: Math.max(1, Math.round(((design.duration ?? 0) / 1000) * design.fps)),
    })}
  />
);
