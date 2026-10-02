import { Img } from 'remotion';
import { BaseSequence, cropOf, detailsOf, type SequenceItemProps } from '@/features/editor/player/base-sequence';
import { calculateMediaStyles } from '@/features/editor/player/styles';

export default function Image({ item, options }: SequenceItemProps) {
  const details = detailsOf(item);
  const crop = cropOf(details);
  return (
    <BaseSequence item={item} options={options}>
      <div style={calculateMediaStyles(details, crop)}>
        <Img
          data-id={item.id}
          src={details.src!}
          style={{
            width: crop.width || details.width,
            height: crop.height || details.height,
            objectFit: 'cover',
            objectPosition: `${-crop.x || 0}px ${-crop.y || 0}px`,
          }}
        />
      </div>
    </BaseSequence>
  );
}
