import { MobilePanel } from '@/features/editor/control-item/mobile-panel';
import { useMediaSections } from '@/features/editor/control-item/media-sections';
import type { TrackItem } from '@/features/editor/types';

const BasicVideo = ({ trackItem, type }: { trackItem: TrackItem; type?: string }) => (
  <MobilePanel title='Video' type={type} sections={useMediaSections('video', trackItem, true)} />
);

export default BasicVideo;
