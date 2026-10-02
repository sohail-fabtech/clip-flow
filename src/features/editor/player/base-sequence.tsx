import type { ReactNode } from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import type { ITrackItem } from '@designcombo/types';
import { calculateFrames } from '@/features/editor/utils/frames';
import { calculateContainerStyles } from '@/features/editor/player/styles';
import type { ItemDetails } from '@/features/editor/types';

export interface SequenceItemOptions {
  fps: number;
  frame: number;
  size: { width: number; height: number };
  editableTextId: string | null;
  isTransition: boolean;
  handleTextChange: (id: string, text: string) => void;
  onTextBlur: (id: string, text: string) => void;
}

export interface SequenceItemProps {
  item: ITrackItem;
  options: SequenceItemOptions;
}

export const detailsOf = (item: ITrackItem): ItemDetails => item.details ?? {};

export const cropOf = (details: ItemDetails) =>
  details.crop ?? { x: 0, y: 0, width: details.width ?? 0, height: details.height ?? 0 };

export const BaseSequence = ({ item, options, children }: SequenceItemProps & { children: ReactNode }) => {
  const details = detailsOf(item);
  const { from, durationInFrames } = calculateFrames(item.display, options.fps);

  return (
    <Sequence key={item.id} from={from} durationInFrames={durationInFrames || 1} style={{ pointerEvents: 'none' }}>
      <AbsoluteFill
        id={item.id}
        data-track-item='transition-element'
        className={`designcombo-scene-item id-${item.id} designcombo-scene-item-type-${item.type}`}
        style={calculateContainerStyles(details, cropOf(details), {
          pointerEvents: item.type === 'audio' ? 'none' : 'auto',
        })}
      >
        {children}
      </AbsoluteFill>
    </Sequence>
  );
};
