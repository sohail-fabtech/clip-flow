import { useState } from 'react';
import { Composition as RemotionComposition, continueRender, delayRender } from 'remotion';
import type { IDesign } from '@designcombo/types';
import Composition from '@/features/editor/player/composition';
import useStore from '@/features/editor/stores/use-store';
import { fontsOfDesign, loadFonts } from '@/features/editor/utils/fonts';

export const COMPOSITION_ID = 'editor';

interface RenderProps extends Record<string, unknown> {
  design: IDesign;
}

const RenderComposition = ({ design }: RenderProps) => {
  useState(() => {
    const { structure = [], background, duration, ...rest } = design;
    useStore.setState({ ...rest, structure, ...(background && { background }), ...(duration && { duration }) });
    const handle = delayRender('Loading fonts');
    loadFonts(fontsOfDesign(design)).finally(() => continueRender(handle));
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
