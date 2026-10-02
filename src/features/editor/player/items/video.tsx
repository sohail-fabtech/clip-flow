import { OffthreadVideo } from 'remotion';
import { BaseSequence, cropOf, detailsOf, type SequenceItemProps } from '@/features/editor/player/base-sequence';
import { calculateMediaStyles } from '@/features/editor/player/styles';
import { mediaTiming, volumeOf } from '@/features/editor/player/items/media-timing';

export default function Video({ item, options }: SequenceItemProps) {
  const details = detailsOf(item);
  return (
    <BaseSequence item={item} options={options}>
      <div style={calculateMediaStyles(details, cropOf(details))}>
        <OffthreadVideo src={details.src!} volume={volumeOf(details.volume)} {...mediaTiming(item, options.fps)} />
      </div>
    </BaseSequence>
  );
}
