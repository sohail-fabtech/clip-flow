import { Audio as RemotionAudio } from 'remotion';
import { BaseSequence, detailsOf, type SequenceItemProps } from '@/features/editor/player/base-sequence';
import { mediaTiming, volumeOf } from '@/features/editor/player/items/media-timing';

export default function Audio({ item, options }: SequenceItemProps) {
  const details = detailsOf(item);
  return (
    <BaseSequence item={item} options={options}>
      <RemotionAudio src={details.src!} volume={volumeOf(details.volume)} {...mediaTiming(item, options.fps)} />
    </BaseSequence>
  );
}
