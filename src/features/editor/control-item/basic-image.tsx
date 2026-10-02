import { MobilePanel } from '@/features/editor/control-item/mobile-panel';
import { useMediaSections } from '@/features/editor/control-item/media-sections';
import type { TrackItem } from '@/features/editor/types';

const BasicImage = ({ trackItem, type }: { trackItem: TrackItem; type?: string }) => (
  <MobilePanel title='Image' type={type} sections={useMediaSections('image', trackItem, true)} />
);

export default BasicImage;
