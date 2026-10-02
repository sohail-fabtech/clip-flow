import { BaseSequence, detailsOf, type SequenceItemProps } from '@/features/editor/player/base-sequence';
import { calculateTextStyles } from '@/features/editor/player/styles';
import MotionText from '@/features/editor/player/motion-text';

export default function Text({ item, options }: SequenceItemProps) {
  const details = detailsOf(item);
  return (
    <BaseSequence item={item} options={options}>
      <MotionText
        id={item.id}
        content={details.text ?? ''}
        editable={options.editableTextId === item.id}
        onChange={options.handleTextChange}
        onBlur={options.onTextBlur}
        style={calculateTextStyles(details)}
      />
    </BaseSequence>
  );
}
